#!/usr/bin/env python3
"""Extract Tier 1 Daggerheart SRD 2.0 weapons and armor into JSON.

The equipment tables are read from `pdftotext -layout` output so each table
row stays on one line. Column positions are re-read from every header row,
because the tables are re-flowed from page to page. Always review the
generated JSON after importing a new PDF.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

TRAITS = ("Agility", "Strength", "Finesse", "Instinct", "Presence", "Knowledge")
RANGES = ("Melee", "Very Close", "Close", "Far", "Very Far")
BURDENS = {"One-Handed": 1, "Two-Handed": 2}
DAMAGE_TYPES = {"phy": "physical", "mag": "magic", "phy/mag": "physical or magic"}

HEADER_RE = re.compile(r"^\s*Name\s+Trait\s+Range\s+Damage\s+Burden\s+Feature\s*$")
DAMAGE_RE = re.compile(r"^d(?P<die>\d+)(?:\+(?P<bonus>\d+))?\s+(?P<type>phy/mag|phy|mag)$")
ARMOR_ROW_RE = re.compile(
    r"^\s*(?P<name>.+?)\s{2,}(?P<major>\d+) / (?P<severe>\d+)\s+(?P<score>\d+)\s+(?P<feature>\S.*)$"
)
FOOTER_RE = re.compile(r"^\s*(?:\d+\s+Daggerheart SRD|Daggerheart SRD\s+\d+)\s*$")


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def read_layout(path: Path) -> str:
    return subprocess.run(
        ["pdftotext", "-layout", str(path), "-"],
        check=True, capture_output=True, text=True,
    ).stdout


def tier_one_section(text: str, heading: str) -> list[str]:
    """Lines from `heading` up to the first Tier 2 table that follows it."""
    start = text.index(heading)
    end = text.index("TIER 2", start)
    return text[start:end].split("\n")


def clean_feature(parts: list[str]) -> str:
    feature = " ".join(part.strip() for part in parts if part.strip())
    return "" if feature == "—" else feature


HEADING_RE = re.compile(
    r"^\s*(?:TIER \d|Physical Weapons|Magic Weapons|All magic weapons|Players can choose|other weapons available)"
)
WEAPON_ROW_RE = re.compile(
    r"^\s*(?P<name>.*?)\s+(?P<trait>" + "|".join(TRAITS) + r")\s+"
    r"(?P<range>Very Close|Very Far|Melee|Close|Far)\s+"
    r"(?P<damage>d\d+(?:\+\d+)?\s+(?:phy/mag|phy|mag))\s+"
    r"(?P<burden>One-Handed|Two-Handed)\s*(?P<feature>.*)$"
)


def parse_weapon_table(lines: list[str], category: str) -> list[dict]:
    """Rows are matched by content; wrapped name/feature lines are attached by indent."""
    weapons: list[dict] = []
    current: dict | None = None

    for line in lines:
        if not line.strip() or FOOTER_RE.match(line) or HEADER_RE.match(line):
            continue
        if HEADING_RE.match(line):
            current = None
            continue
        row = WEAPON_ROW_RE.match(line)
        if row:
            current = {
                "name_parts": [row["name"].strip()],
                "match": row,
                "range_col": row.start("range"),
                "feature_parts": [row["feature"]],
            }
            weapons.append(current)
        elif current:
            lead = len(line) - len(line.lstrip())
            tokens = [token for token in re.split(r"\s{3,}", line.strip()) if token]
            if lead < current["range_col"]:
                current["name_parts"].append(tokens[0])
                tokens = tokens[1:]
            current["feature_parts"].extend(tokens)

    result = []
    for item in weapons:
        cell = item["match"]
        damage = DAMAGE_RE.match(" ".join(cell["damage"].split()))
        if not damage:
            raise ValueError(f"Could not parse damage {cell['damage']!r}")
        result.append({
            "name": " ".join(part for part in item["name_parts"] if part),
            "category": category,
            "tier": 1,
            "trait": cell["trait"],
            "range": cell["range"],
            "die": f"d{damage['die']}",
            "bonus": int(damage["bonus"] or 0),
            "damageType": DAMAGE_TYPES[damage["type"]],
            "burden": BURDENS[cell["burden"]],
            "feature": clean_feature(item["feature_parts"]),
        })
    return result


def parse_armor(lines: list[str]) -> list[dict]:
    armor: list[dict] = []
    for line in lines:
        if not line.strip() or FOOTER_RE.match(line):
            continue
        match = ARMOR_ROW_RE.match(line)
        if match:
            armor.append({
                "name": match["name"],
                "tier": 1,
                "baseMajor": int(match["major"]),
                "baseSevere": int(match["severe"]),
                "baseScore": int(match["score"]),
                "featureParts": [match["feature"]],
            })
        elif armor and line.startswith(" " * 20) and not line.strip().startswith(("Base", "Name", "TIER")):
            armor[-1]["featureParts"].append(line)
    for item in armor:
        item["feature"] = clean_feature(item.pop("featureParts"))
    return armor


def parse_equipment(text: str) -> dict:
    primary = parse_weapon_table(tier_one_section(text, "PRIMARY WEAPON TABLES"), "Primary")
    secondary = parse_weapon_table(tier_one_section(text, "SECONDARY WEAPON TABLES"), "Secondary")
    armor = parse_armor(tier_one_section(text, "ARMOR TABLES"))
    for weapon in primary:
        weapon["id"] = slug(weapon["name"])
    for weapon in secondary:
        weapon["id"] = f"secondary-{slug(weapon['name'])}"
    for item in armor:
        item["id"] = slug(item["name"])
    return {"primaryWeapons": primary, "secondaryWeapons": secondary, "armor": armor}


def validate(data: dict) -> None:
    for key, minimum in (("primaryWeapons", 10), ("secondaryWeapons", 5), ("armor", 5)):
        records = data[key]
        if len(records) < minimum:
            raise ValueError(f"{key}: expected at least {minimum} entries, found {len(records)}")
        ids = [record["id"] for record in records]
        if len(set(ids)) != len(ids):
            raise ValueError(f"{key}: duplicate ids")
    if any(weapon["burden"] != 1 for weapon in data["secondaryWeapons"]):
        raise ValueError("Secondary weapons must all be one-handed")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="SRD PDF, or a saved `pdftotext -layout` text file")
    parser.add_argument("output", type=Path, help="JSON file to write")
    args = parser.parse_args()

    text = read_layout(args.input) if args.input.suffix.lower() == ".pdf" else args.input.read_text(encoding="utf-8")
    data = parse_equipment(text)
    validate(data)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(
        f"Extracted and validated {len(data['primaryWeapons'])} primary weapons, "
        f"{len(data['secondaryWeapons'])} secondary weapons and {len(data['armor'])} armors to {args.output}"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, subprocess.CalledProcessError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
