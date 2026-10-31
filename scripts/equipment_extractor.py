#!/usr/bin/env python3
"""Extract Daggerheart SRD 2.0 weapons and armor (all tiers) into JSON.

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
# Arcane-frame wheelchairs use the Spellcast trait of the wearer's subclass.
WHEELCHAIR_TRAITS = TRAITS + ("Spellcast",)
RANGES = ("Melee", "Very Close", "Close", "Far", "Very Far")
BURDENS = {"One-Handed": 1, "Two-Handed": 2}
DAMAGE_TYPES = {"phy": "physical", "mag": "magic", "phy/mag": "physical or magic"}

WHEELCHAIR_HEADER_RE = re.compile(r"^\s*Name\s+Tier\s+Trait\s+Range\s+Damage\s+Burden\s+Feature\s*$")
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


TIER_MARKER_RE = re.compile(r"^\s*TIER (?P<tier>[1-4]) \(LEVELS? ")


def tier_sections(text: str, start: str, end: str) -> list[tuple[int, list[str]]]:
    """Split the text between two headings into (tier, lines) chunks."""
    begin = text.index(start)
    stop = text.index(end, begin + len(start))
    chunks: list[tuple[int, list[str]]] = []
    for line in text[begin:stop].split("\n"):
        marker = TIER_MARKER_RE.match(line)
        if marker:
            chunks.append((int(marker["tier"]), []))
        elif chunks:
            chunks[-1][1].append(line)
    return chunks


def clean_feature(parts: list[str]) -> str:
    feature = " ".join(part.strip() for part in parts if part.strip())
    return "" if feature == "—" else feature


HEADING_RE = re.compile(
    r"^\s*(?:TIER \d|Physical Weapons|Magic Weapons|All magic weapons|Players can choose|other weapons available)"
)
WHEELCHAIR_ROW_RE = re.compile(
    r"^\s*(?P<name>\S.*?)\s+(?P<tier>[1-4])\s+(?P<trait>" + "|".join(WHEELCHAIR_TRAITS) + r")\s+"
    r"(?P<range>Very Close|Very Far|Melee|Close|Far)\s+"
    r"(?P<damage>d\d+(?:\+\d+)?(?:\s+(?:phy/mag|phy|mag))?)\s+"
    r"(?P<burden>One-Handed|Two-Handed)\s*(?P<feature>.*)$"
)
WEAPON_ROW_RE = re.compile(
    r"^\s*(?P<name>.*?)\s+(?P<trait>" + "|".join(TRAITS) + r")\s+"
    r"(?P<range>Very Close|Very Far|Melee|Close|Far)\s+"
    r"(?P<damage>d\d+(?:\+\d+)?(?:\s+(?:phy/mag|phy|mag))?)\s+"
    r"(?P<burden>One-Handed|Two-Handed)\s*(?P<feature>.*)$"
)


def parse_weapon_table(
    lines: list[str],
    category: str,
    tier: int = 1,
    row_re: re.Pattern = WEAPON_ROW_RE,
    blank_ends_row: bool = False,
) -> list[dict]:
    """Rows are matched by content; wrapped name/feature lines are attached by indent."""
    weapons: list[dict] = []
    current: dict | None = None

    for line in lines:
        if not line.strip():
            if blank_ends_row:
                current = None
            continue
        if FOOTER_RE.match(line) or HEADER_RE.match(line) or WHEELCHAIR_HEADER_RE.match(line):
            continue
        if HEADING_RE.match(line):
            current = None
            continue
        row = row_re.match(line)
        if row:
            current = {
                "name_parts": [row["name"].strip()],
                "match": row,
                "range_col": row.start("range"),
                "damage": " ".join(row["damage"].split()),
                "feature_parts": [row["feature"]],
            }
            weapons.append(current)
        elif current:
            lead = len(line) - len(line.lstrip())
            tokens = [token for token in re.split(r"\s{3,}", line.strip()) if token]
            if lead < current["range_col"]:
                current["name_parts"].append(tokens[0])
                tokens = tokens[1:]
            if tokens and tokens[0] in DAMAGE_TYPES and " " not in current["damage"]:
                # The damage type wrapped onto its own line (e.g. "phy/mag").
                current["damage"] += " " + tokens.pop(0)
            current["feature_parts"].extend(tokens)

    result = []
    for item in weapons:
        cell = item["match"]
        damage = DAMAGE_RE.match(item["damage"])
        if not damage:
            raise ValueError(f"Could not parse damage {cell['damage']!r}")
        result.append({
            "name": " ".join(part for part in item["name_parts"] if part),
            "category": category,
            "tier": int(cell["tier"]) if "tier" in cell.groupdict() else tier,
            "trait": cell["trait"],
            "range": cell["range"],
            "die": f"d{damage['die']}",
            "bonus": int(damage["bonus"] or 0),
            "damageType": DAMAGE_TYPES[damage["type"]],
            "burden": BURDENS[cell["burden"]],
            "feature": clean_feature(item["feature_parts"]),
        })
    return result


def parse_armor(lines: list[str], tier: int = 1) -> list[dict]:
    armor: list[dict] = []
    for line in lines:
        if not line.strip() or FOOTER_RE.match(line):
            continue
        match = ARMOR_ROW_RE.match(line)
        if match:
            armor.append({
                "name": match["name"],
                "tier": tier,
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
    primary: list[dict] = []
    for tier, lines in tier_sections(text, "PRIMARY WEAPON TABLES", "SECONDARY WEAPON TABLES"):
        primary.extend(parse_weapon_table(lines, "Primary", tier))
    secondary: list[dict] = []
    for tier, lines in tier_sections(text, "SECONDARY WEAPON TABLES", "Combat Wheelchair"):
        secondary.extend(parse_weapon_table(lines, "Secondary", tier))
    # Combat wheelchairs are primary weapons with their own tables and a Tier column.
    wheelchair_start = text.index("Combat Wheelchair")
    wheelchair_end = text.index("Every armor has a name", wheelchair_start)
    primary.extend(parse_weapon_table(
        text[wheelchair_start:wheelchair_end].split("\n"),
        "Primary",
        row_re=WHEELCHAIR_ROW_RE,
        blank_ends_row=True,
    ))
    armor: list[dict] = []
    for tier, lines in tier_sections(text, "ARMOR TABLES", "Loot comprises any consumables"):
        armor.extend(parse_armor(lines, tier))
    for weapon in primary:
        weapon["id"] = slug(weapon["name"])
    for weapon in secondary:
        weapon["id"] = f"secondary-{slug(weapon['name'])}"
    for item in armor:
        item["id"] = slug(item["name"])
    return {"primaryWeapons": primary, "secondaryWeapons": secondary, "armor": armor}


def validate(data: dict) -> None:
    for key, minimum in (("primaryWeapons", 100), ("secondaryWeapons", 40), ("armor", 30)):
        records = data[key]
        if len(records) < minimum:
            raise ValueError(f"{key}: expected at least {minimum} entries, found {len(records)}")
        ids = [record["id"] for record in records]
        if len(set(ids)) != len(ids):
            duplicates = sorted({i for i in ids if ids.count(i) > 1})
            raise ValueError(f"{key}: duplicate ids {duplicates}")
        tiers = {record["tier"] for record in records}
        if tiers != {1, 2, 3, 4}:
            raise ValueError(f"{key}: expected tiers 1-4, found {sorted(tiers)}")
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
