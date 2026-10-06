#!/usr/bin/env python3
"""Extract Daggerheart SRD 2.0 adversary stat blocks into JSON.

The SRD PDF uses a private-use font for digits and its text layer often joins
words at line breaks. This extractor preserves the stat-block structure needed
by the app while keeping the generated data human-readable. Always review the
generated JSON after importing a new PDF.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


TYPE_NAMES = (
    "Solo", "Bruiser", "Horde", "Leader", "Minion", "Ranged", "Skulk",
    "Social", "Standard", "Support",
)
ENVIRONMENT_TYPES = ("Exploration", "Traversal", "Social", "Event")

BATTLE_POINTS = {
    "Minion": 1, "Social": 1, "Support": 1, "Horde": 2, "Ranged": 2,
    "Skulk": 2, "Standard": 2, "Leader": 3, "Bruiser": 4, "Solo": 5,
}

NAME_CORRECTIONS = {
    "CULTADEPT": "CULT ADEPT",
    "MASTERASSASSIN": "MASTER ASSASSIN",
    "BERSERKERALPHA": "BERSERKER ALPHA",
    "CENTAURWARDEN": "CENTAUR WARDEN",
    "MINOTAURWRECKER": "MINOTAUR WRECKER",
    "ROYALADVISOR": "ROYAL ADVISOR",
    "SPECTRALARCHER": "SPECTRAL ARCHER",
    "WARWIZARD": "WAR WIZARD",
}

# A handful of words are joined in the PDF text layer even though they are
# separated in the rendered document. Keep these repairs explicit so normal
# words such as "Acid" and creature names are not split accidentally.
JOINED_WORD_REPAIRS = {
    "Aformer": "A former", "Atwisting": "A twisting",
    "Athunderstorm": "A thunderstorm", "Athief": "A thief",
    "Aweapon": "A weapon", "Atowering": "A towering",
    "Ateeming": "A teeming", "Afloating": "A floating",
    "Atarget": "A target", "Atall": "A tall", "Afierce": "A fierce",
    "Afinely": "A finely", "Athickly": "A thickly", "Afragile": "A fragile",
    "Afaerie": "A faerie", "Ayoung": "A young", "Aflock": "A flock",
    "Afleshy": "A fleshy", "Atranslucent": "A translucent",
    "Atransdimensional": "A transdimensional", "Intothe": "Into the",
    "intothe": "into the", "anynumberof": "any number of",
    "numberof": "number of", "otherthan": "other than",
    "orfewer": "or fewer", "oftheir": "of their", "ofyour": "of your",
    "oryou": "or you", "theirvoice": "their voice", "theirvices": "their vices",
    "onlyvague": "only vague", "wheneveryou": "whenever you",
    "anotherforthe": "another for the", "afteryou": "after you",
    "attractedto": "attracted to", "ashesto": "ashes to",
}

# Daggerheart's PDF text layer maps digits to private-use glyphs.
PDF_DIGITS = {
    "\ue53f": "0", "\ue541": "1", "\ue542": "2", "\ue543": "3",
    "\ue544": "4", "\ue545": "5", "\ue546": "6", "\ue547": "7",
    "\ue548": "8", "\ue549": "9",
}

HEADER_RE = re.compile(
    r"(?m)^(?P<name>[A-Z][A-Z0-9 .:'’'&!?\-]+(?::\n[A-Z][A-Z0-9 .:'’'&!?\-]+)?)\n"
    r"Tier\s*(?P<tier>[1-4])\s*(?P<type>"
    + "|".join(TYPE_NAMES)
    + r")(?:\s+\((?P<horde>\d+)\/HP\))?"
)

FEATURE_HEADER_RE = re.compile(
    r"^\s*(?P<name>[^:]{1,120}?)\s*-\s*"
    r"(?P<type>Action|Reaction|Passive|Evolution)\s*:\s*(?P<description>.*)$"
)

ENVIRONMENT_HEADER_RE = re.compile(
    r"(?m)^(?P<name>[A-Z][A-Z0-9 .,'’'&!?\-]+(?:\n[A-Z][A-Z0-9 .,'’'&!?\-]+)?)\n"
    r"Tier\s*(?P<tier>[1-4])\s*(?P<type>"
    + "|".join(ENVIRONMENT_TYPES)
    + r")"
)


def read_source(path: Path) -> str:
    """Read plain text or extract the text layer from a PDF."""
    if path.suffix.lower() == ".pdf":
        result = subprocess.run(
            ["pdftotext", "-raw", str(path), "-"],
            check=True,
            capture_output=True,
            text=True,
        )
        return result.stdout
    return path.read_text(encoding="utf-8")


def normalize_source(text: str) -> str:
    for glyph, digit in PDF_DIGITS.items():
        text = text.replace(glyph, digit)
    text = text.replace("\ufb01", "fi").replace("\ufb02", "fl")
    text = text.replace("−", "-").replace("–", "-").replace("—", "-")
    text = text.replace("\u00a0", " ")
    text = re.sub(r"\d+\s+Daggerheart SRD", "", text)
    text = text.replace("\f", "\n")
    text = re.sub(r"Motives\s*&\s*Tactics", "Motives & Tactics", text)
    return text


def flatten(text: str) -> str:
    text = re.sub(r"(?<=[a-z])(?=[A-Z])", " ", text)
    for joined, separated in JOINED_WORD_REPAIRS.items():
        text = text.replace(joined, separated)
    return re.sub(r"\s+", " ", text).strip()


def parse_experiences(value: str) -> list[dict[str, int | str]]:
    experiences = []
    for part in value.split(","):
        match = re.match(r"\s*(.+?)\s*([+-]\d+)\s*$", part)
        if match:
            experiences.append(
                {"name": match.group(1).strip(), "modifier": int(match.group(2))}
            )
    return experiences


def parse_feature_costs(description: str) -> dict[str, int]:
    costs: dict[str, int] = {}
    fear = re.search(r"Spend\s+(?:(\d+)\s+|a\s+)?Fear", description, re.I)
    stress = re.search(r"Mark\s+(?:(\d+)\s+|a\s+)?Stress", description, re.I)
    if fear:
        costs["fear"] = int(fear.group(1) or 1)
    if stress:
        costs["stress"] = int(stress.group(1) or 1)
    return costs


def finalize_feature(feature: dict[str, object]) -> dict[str, object]:
    description = flatten(str(feature.pop("_description", "")))
    feature["description"] = description
    costs = parse_feature_costs(description)
    if costs:
        feature["costs"] = costs
    return feature


def parse_features(features_text: str) -> list[dict[str, object]]:
    lines = [line.strip() for line in features_text.splitlines() if line.strip()]
    features: list[dict[str, object]] = []
    current: dict[str, object] | None = None

    for line in lines:
        match = FEATURE_HEADER_RE.match(line)
        if match:
            if current is not None:
                features.append(finalize_feature(current))
            current = {
                "name": flatten(match.group("name")),
                "type": match.group("type"),
                "_description": match.group("description").strip(),
            }
        elif current is not None:
            current["_description"] = (
                str(current["_description"]) + " " + line
            ).strip()

    if current is not None:
        features.append(finalize_feature(current))
    return features


def parse_block(
    name: str, tier: int, adversary_type: str, horde: str | None, body: str
) -> dict:
    flat = flatten(body)
    motives_match = re.search(
        r"(?P<description>.*?)Motives\s*&\s*Tactics\s*:\s*"
        r"(?P<motives>.*?)Difficulty\s*:", flat, re.I,
    )
    stats_match = re.search(
        r"Difficulty\s*:\s*(\d+)\s*\|\s*"
        r"Thresholds\s*:\s*(None|(?:None|\d+)\s*/\s*(?:None|\d+))\s*\|\s*"
        r"HP\s*:\s*(\d+)\s*\|\s*Stress\s*:\s*(None|\d+)", flat, re.I,
    )
    attack_match = re.search(
        r"ATK\s*:\s*([+-]?(?:\d+d\d+|\d+))\s*\|\s*"
        r"(.+?)\s*:\s*(Very Far|Very Close|Melee|Close|Far)\s*\|\s*"
        r"(.+?)(?=\s+Experience\s*:|\s+FEATURES\b|$)", flat, re.I,
    )
    experience_match = re.search(
        r"Experience\s*:\s*(.+?)(?=\s+FEATURES\b|$)", flat, re.I
    )
    features_match = re.search(r"FEATURES\s+(.+)$", body, re.I | re.S)

    record: dict[str, object] = {
        "name": NAME_CORRECTIONS.get(flatten(name), flatten(name)),
        "tier": tier,
        "type": adversary_type,
        "battle_points": BATTLE_POINTS[adversary_type],
        "description": motives_match.group("description").strip()
        if motives_match else "",
        "motives": motives_match.group("motives").strip() if motives_match else "",
        "difficulty": None,
        "thresholds": None,
        "hp": None,
        "stress": None,
        "attack_modifier": None,
        "standard_attack": None,
        "experience": parse_experiences(experience_match.group(1))
        if experience_match else [],
        "features": parse_features(features_match.group(1))
        if features_match else [],
    }

    if horde is not None:
        record["creatures_per_hp"] = int(horde)

    if stats_match:
        record["difficulty"] = int(stats_match.group(1))
        thresholds = stats_match.group(2).replace(" ", "")
        if thresholds.lower() != "none":
            major, severe = thresholds.split("/")
            record["thresholds"] = {
                "major": None if major.lower() == "none" else int(major),
                "severe": None if severe.lower() == "none" else int(severe),
            }
        record["hp"] = int(stats_match.group(3))
        record["stress"] = (
            None if stats_match.group(4).lower() == "none"
            else int(stats_match.group(4))
        )

    if attack_match:
        record["attack_modifier"] = attack_match.group(1)
        record["standard_attack"] = {
            "name": attack_match.group(2).strip(),
            "range": attack_match.group(3),
            "damage": attack_match.group(4).strip(),
        }
    return record


def parse_srd_text(text: str) -> list[dict]:
    text = normalize_source(text)
    start = text.find("TIER 1 ADVERSARIES")
    end = text.find("ADAPTING ENVIRONMENTS", start)
    if start < 0 or end < 0:
        raise ValueError("Could not locate the adversary section in the source text")

    section = text[start:end]
    matches = list(HEADER_RE.finditer(section))
    if not matches:
        raise ValueError("No adversary stat blocks were found")

    adversaries = []
    for index, match in enumerate(matches):
        body_end = matches[index + 1].start() if index + 1 < len(matches) else len(section)
        adversaries.append(
            parse_block(
                match.group("name"), int(match.group("tier")),
                match.group("type"), match.group("horde"),
                section[match.end():body_end],
            )
        )
    return adversaries


def parse_environment_block(
    name: str, tier: int, environment_type: str, body: str
) -> dict:
    # The PDF repeats the next tier heading at the bottom of some pages. It
    # is not part of the preceding environment's final feature text.
    body = re.sub(
        r"\bTIER\s*[1-4]\s+ENVIRONMENTS\s*"
        r"(?:\(\s*LEVELS\s*\d+\s*-\s*\d+\s*\))?",
        "",
        body,
        flags=re.I,
    )
    flat = flatten(body)
    impulses_match = re.search(
        r"(?P<description>.*?)Impulses\s*:\s*"
        r"(?P<impulses>.*?)Difficulty\s*:", flat, re.I,
    )
    difficulty_match = re.search(
        r"Difficulty\s*:\s*(.+?)(?=\s+Potential\s*Adversaries\s*:|$)",
        flat,
        re.I,
    )
    adversaries_match = re.search(
        r"Potential\s*Adversaries\s*:\s*(.+?)(?=\s+FEATURES\b|$)",
        flat,
        re.I,
    )
    features_match = re.search(r"FEATURES\s+(.+)$", body, re.I | re.S)

    return {
        "name": flatten(name),
        "tier": tier,
        "type": environment_type,
        "description": impulses_match.group("description").strip()
        if impulses_match else "",
        "impulses": impulses_match.group("impulses").strip()
        if impulses_match else "",
        "difficulty": (
            int(difficulty_match.group(1))
            if difficulty_match and difficulty_match.group(1).strip().isdigit()
            else difficulty_match.group(1).strip() if difficulty_match else None
        ),
        "potential_adversaries": adversaries_match.group(1).strip()
        if adversaries_match else "",
        "features": parse_features(features_match.group(1))
        if features_match else [],
    }


def parse_environments(text: str) -> list[dict]:
    text = normalize_source(text)
    start = text.find("TIER 1 ENVIRONMENTS")
    end_markers = [match.start() for marker in
                   (r"ADDITIONAL\s+GM\s+GUIDANCE", r"APPENDIX")
                   if (match := re.search(marker, text[start:], re.I))]
    end_markers = [start + position for position in end_markers]
    end = min(end_markers) if end_markers else -1
    if start < 0 or end < 0:
        raise ValueError("Could not locate the environment section in the source text")

    section = text[start:end]
    matches = list(ENVIRONMENT_HEADER_RE.finditer(section))
    if not matches:
        raise ValueError("No environment stat blocks were found")

    environments = []
    for index, match in enumerate(matches):
        body_end = matches[index + 1].start() if index + 1 < len(matches) else len(section)
        environments.append(
            parse_environment_block(
                match.group("name"), int(match.group("tier")),
                match.group("type"), section[match.end():body_end],
            )
        )
    return environments


def validate(adversaries: list[dict]) -> None:
    errors = []
    names = [item["name"] for item in adversaries]
    if len(names) != len(set(names)):
        errors.append("duplicate adversary names")

    for index, item in enumerate(adversaries):
        prefix = f"{index + 1} ({item.get('name')})"
        for field in ("tier", "type", "difficulty", "hp"):
            if item.get(field) is None:
                errors.append(f"{prefix}: missing {field}")
        if "stress" not in item:
            errors.append(f"{prefix}: missing stress")
        if item.get("type") not in BATTLE_POINTS:
            errors.append(f"{prefix}: unknown type {item.get('type')}")
        if item.get("type") == "Horde" and "creatures_per_hp" not in item:
            errors.append(f"{prefix}: Horde is missing creatures_per_hp")

    if errors:
        raise ValueError("\n".join(errors))


def validate_environments(environments: list[dict]) -> None:
    errors = []
    names = [item["name"] for item in environments]
    if len(names) != len(set(names)):
        errors.append("duplicate environment names")
    for index, item in enumerate(environments):
        prefix = f"{index + 1} ({item.get('name')})"
        for field in ("tier", "type", "difficulty"):
            if item.get(field) is None:
                errors.append(f"{prefix}: missing {field}")
        if item.get("type") not in ENVIRONMENT_TYPES:
            errors.append(f"{prefix}: unknown type {item.get('type')}")
    if errors:
        raise ValueError("\n".join(errors))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="SRD PDF or extracted text file")
    parser.add_argument("output", type=Path, help="Destination JSON file")
    parser.add_argument(
        "--kind",
        choices=("adversaries", "environments"),
        default="adversaries",
        help="Which SRD section to extract",
    )
    args = parser.parse_args()

    if args.kind == "environments":
        records = parse_environments(read_source(args.input))
        validate_environments(records)
    else:
        records = parse_srd_text(read_source(args.input))
        validate(records)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
    print(f"Extracted and validated {len(records)} {args.kind} to {args.output}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, subprocess.CalledProcessError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
