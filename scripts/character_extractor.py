#!/usr/bin/env python3
"""Extract Daggerheart SRD 2.0 character-creation data into JSON.

Covers classes (with subclasses), ancestries and communities. The SRD PDF is
laid out in two columns, so each page is cropped into left and right halves
before text extraction. Always review the generated JSON after importing a new
PDF.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

PDF_DIGITS = {
    "": "0", "": "1", "": "2", "": "3",
    "": "4", "": "5", "": "6", "": "7",
    "": "8", "": "9",
}

CLASS_NAMES = (
    "Assassin", "Bard", "Brawler", "Druid", "Guardian", "Ranger", "Rogue",
    "Seraph", "Sorcerer", "Warlock", "Warrior", "Witch", "Wizard",
)
DOMAINS = (
    "Arcana", "Blade", "Bone", "Codex", "Dread",
    "Grace", "Midnight", "Sage", "Splendor", "Valor",
)

PAGE_WIDTH = 612
PAGE_HEIGHT = 792
COLUMN_WIDTH = PAGE_WIDTH // 2

BULLET_RE = re.compile(r"^[◦•]\s*")
FOOTER_RE = re.compile(r"\s*(?:\d+\s+Daggerheart SRD|Daggerheart SRD\s+\d+)")
CAPS_RE = re.compile(r"^[A-Z][A-Z’' &\-]{2,}$")
FEATURE_RE = re.compile(r"^(?P<name>[A-Z][\w’'&\-]*(?: [\w’'&\-]+){0,5}): (?P<text>.*)$")
SECTION_RE = re.compile(
    r"^(?:SPELLCAST TRAIT|BACKGROUND QUESTIONS|CONNECTIONS|"
    r"(?:CLASS|FOUNDATION|SPECIALIZATION|MASTERY|ANCESTRY|COMMUNITY) FEATURES?|"
    r"[A-Z’' ]+ HOPE FEATURE)$"
)


def is_section(line: str) -> bool:
    return bool(SECTION_RE.match(line))


def canonical_section(line: str) -> str:
    """Fold singular/plural heading variants, e.g. 'CLASS FEATURE' -> 'CLASS FEATURES'."""
    if line.endswith("HOPE FEATURE"):
        return "HOPE FEATURE"
    if line.endswith("FEATURE"):
        return line + "S"
    return line


SMALL_WORDS = {"a", "an", "and", "in", "of", "the"}


def title_case(text: str) -> str:
    """Title-case an ALL-CAPS heading, keeping small words and possessives right."""
    words = text.lower().split()
    return " ".join(
        word if index and word in SMALL_WORDS else word[:1].upper() + word[1:]
        for index, word in enumerate(words)
    )


def split_items(text: str) -> list[str]:
    """Split a 'a or b' list and capitalise each entry."""
    parts = [part.strip(" .") for part in re.split(r"\s+or\s+", " ".join(text.split()))]
    return [part[:1].upper() + part[1:] for part in parts if part]


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def read_columns(path: Path, first_page: int, last_page: int) -> str:
    chunks = []
    for page in range(first_page, last_page + 1):
        for x in (0, COLUMN_WIDTH):
            result = subprocess.run(
                [
                    "pdftotext", "-f", str(page), "-l", str(page),
                    "-x", str(x), "-y", "0",
                    "-W", str(COLUMN_WIDTH), "-H", str(PAGE_HEIGHT),
                    str(path), "-",
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            chunks.append(result.stdout)
    return "\n".join(chunks)


def clean_lines(text: str) -> list[str]:
    """Normalise glyphs and drop running headers, footers and sidebar debris."""
    for glyph, digit in PDF_DIGITS.items():
        text = text.replace(glyph, digit)
    text = text.replace(" ", " ").replace("−", "-")
    text = FOOTER_RE.sub("", text)
    lines = []
    for raw in text.split("\n"):
        line = raw.strip()
        if line in ("Daggerheart SRD",) or re.fullmatch(r"\d{1,3}", line):
            continue
        if len(line) == 1 and line not in ("",):
            continue  # vertical sidebar letters from the page margins
        lines.append(line)
    return lines


def join_text(lines: list[str]) -> str:
    """Join wrapped lines; bullets and blank-line paragraph breaks stay as newlines."""
    parts: list[str] = []
    paragraph_open = False
    for line in lines:
        if not line:
            paragraph_open = False
            continue
        if BULLET_RE.match(line):
            parts.append("• " + BULLET_RE.sub("", line))
            paragraph_open = True
        elif paragraph_open and parts:
            parts[-1] += " " + line
        else:
            parts.append(line)
            paragraph_open = True
    return "\n".join(parts)


# Sidebar call-outs that look like features but are rules commentary.
SIDEBAR_NAMES = {"Tip", "Note"}


def parse_features(lines: list[str]) -> list[dict]:
    """Split 'Name: description' items; unmatched leading text is ignored."""
    items: list[dict] = []
    for line in lines:
        match = FEATURE_RE.match(line) if not BULLET_RE.match(line) else None
        if match:
            items.append({"name": match["name"], "lines": [match["text"]]})
        elif items:
            items[-1]["lines"].append(line)
    return [
        {"name": item["name"], "description": join_text(item["lines"])}
        for item in items
        if item["name"] not in SIDEBAR_NAMES
    ]


def split_sections(lines: list[str]) -> dict[str, list[str]]:
    sections: dict[str, list[str]] = {"": []}
    current = ""
    for line in lines:
        if is_section(line):
            current = canonical_section(line)
            sections.setdefault(current, [])
            continue
        sections[current].append(line)
    return sections


def bullets(lines: list[str]) -> list[str]:
    """Collect the leading bullet list; stop at the first blank line after it."""
    items: list[str] = []
    for line in lines:
        if BULLET_RE.match(line):
            items.append(BULLET_RE.sub("", line))
        elif line and items:
            items[-1] += " " + line
        elif not line and items:
            break
    return items


def parse_subclass(name: str, lines: list[str]) -> dict:
    sections = split_sections(lines)
    description = join_text(sections[""])
    trait = " ".join(x for x in sections.get("SPELLCAST TRAIT", []) if x).strip() or None
    foundation = sections.get("FOUNDATION FEATURES", [])
    return {
        "id": slug(name),
        "name": title_case(name),
        "description": description,
        "spellcastTrait": trait,
        "foundation": parse_features(foundation),
        "specialization": parse_features(sections.get("SPECIALIZATION FEATURES", [])),
        "mastery": parse_features(sections.get("MASTERY FEATURES", [])),
    }


def find_class_starts(lines: list[str]) -> list[tuple[int, str]]:
    starts = []
    for index, line in enumerate(lines):
        if line.title() in CLASS_NAMES and line.isupper():
            window = lines[index + 1:index + 60]
            if any(entry.startswith("DOMAINS") for entry in window):
                starts.append((index, line.title()))
    return starts


def parse_classes(lines: list[str], end_index: int) -> list[dict]:
    starts = find_class_starts(lines)
    classes = []
    for position, (start, name) in enumerate(starts):
        end = starts[position + 1][0] if position + 1 < len(starts) else end_index
        block = lines[start + 1:end]
        text = "\n".join(block)
        header = re.search(
            r"DOMAINS\s*[–-]\s*(\w+) & (\w+)\s*\nSTARTING EVASION\s*[–-]\s*(\d+)\s*\n"
            r"STARTING HIT POINTS\s*[–-]\s*(\d+)\s*\nCLASS ITEMS\s*[–-]\s*(.*?)\n[A-Z’' ]+ HOPE FEATURE",
            text, re.S,
        )
        if not header:
            raise ValueError(f"{name}: could not read the class header")
        subclass_index = next(
            (i for i, line in enumerate(block) if line.endswith("SUBCLASSES") and line.isupper()),
            None,
        )
        if subclass_index is None:
            raise ValueError(f"{name}: no subclasses section")
        head_lines = block[:subclass_index]
        sections = split_sections(head_lines)
        tail = block[subclass_index + 1:]
        # Subclass blocks begin at ALL-CAPS lines that are not section headings.
        sub_starts = [
            i for i, line in enumerate(tail)
            if CAPS_RE.match(line) and not is_section(line)
        ]
        bq_index = next((i for i, line in enumerate(tail) if line == "BACKGROUND QUESTIONS"), len(tail))
        sub_starts = [i for i in sub_starts if i < bq_index]
        subclasses = []
        for sub_position, sub_start in enumerate(sub_starts):
            sub_end = sub_starts[sub_position + 1] if sub_position + 1 < len(sub_starts) else bq_index
            subclasses.append(parse_subclass(tail[sub_start], tail[sub_start + 1:sub_end]))
        tail_sections = split_sections(tail[bq_index:])
        hope = parse_features(sections.get("HOPE FEATURE", []))
        classes.append({
            "id": slug(name),
            "name": name,
            "domains": [header[1], header[2]],
            "evasion": int(header[3]),
            "hitPoints": int(header[4]),
            "classItems": split_items(header[5]),
            "hopeFeature": hope[0] if hope else None,
            "features": parse_features(sections.get("CLASS FEATURES", [])),
            "subclasses": subclasses,
            "backgroundQuestions": bullets(tail_sections.get("BACKGROUND QUESTIONS", [])),
            "connections": bullets(tail_sections.get("CONNECTIONS", [])),
        })
    return classes


def parse_named_features(
    lines: list[str], heading: str, skip_names: set[str]
) -> list[dict]:
    """Parse repeating 'NAME / description / <heading> / features' entries."""
    entries = []
    last_caps = None
    index = 0
    while index < len(lines):
        line = lines[index]
        if is_section(line) and canonical_section(line) == heading:
            name = last_caps
            index += 1
            body: list[str] = []
            while index < len(lines):
                nxt = lines[index]
                if CAPS_RE.match(nxt) and not is_section(nxt):
                    break
                body.append(nxt)
                index += 1
            if name and name not in skip_names:
                entries.append({"name": title_case(name), "features": parse_features(body), "body": body})
            continue
        if CAPS_RE.match(line) and not is_section(line):
            last_caps = line
        index += 1
    return entries


def parse_ancestries(lines: list[str]) -> list[dict]:
    result = []
    for entry in parse_named_features(lines, "ANCESTRY FEATURES", {"ANCESTRIES", "MIXED ANCESTRY"}):
        result.append({
            "id": slug(entry["name"]),
            "name": entry["name"],
            "features": entry["features"],
        })
    return result


def parse_communities(lines: list[str]) -> list[dict]:
    result = []
    for entry in parse_named_features(lines, "COMMUNITY FEATURES", {"COMMUNITIES"}):
        result.append({
            "id": slug(entry["name"]),
            "name": entry["name"],
            "feature": entry["features"][0] if entry["features"] else None,
        })
    return result


def section_lines(lines: list[str], start: str, stop: str | None) -> list[str]:
    begin = next(i for i, line in enumerate(lines) if line == start)
    end = next((i for i in range(begin + 1, len(lines)) if stop and lines[i] == stop), len(lines))
    return lines[begin:end]


def validate(data: dict) -> None:
    classes = data["classes"]
    if [c["name"] for c in classes] != list(CLASS_NAMES):
        raise ValueError(f"Unexpected classes: {[c['name'] for c in classes]}")
    for c in classes:
        if len(c["domains"]) != 2 or any(d not in DOMAINS for d in c["domains"]):
            raise ValueError(f"{c['name']}: bad domains")
        if not c["hopeFeature"] or not c["features"]:
            raise ValueError(f"{c['name']}: missing hope feature or class features")
        if len(c["subclasses"]) != 2:
            raise ValueError(f"{c['name']}: expected two subclasses, found {len(c['subclasses'])}")
        for sub in c["subclasses"]:
            if not sub["foundation"]:
                raise ValueError(f"{c['name']}/{sub['name']}: no foundation features")
        if not c["backgroundQuestions"] or not c["connections"]:
            raise ValueError(f"{c['name']}: missing questions")
    for key in ("ancestries", "communities"):
        names = [item["name"] for item in data[key]]
        if not names or len(set(names)) != len(names):
            raise ValueError(f"{key}: empty or duplicate entries")
    if any(len(a["features"]) != 2 for a in data["ancestries"]):
        bad = [a["name"] for a in data["ancestries"] if len(a["features"]) != 2]
        raise ValueError(f"Ancestries without exactly two features: {bad}")
    if any(not c["feature"] for c in data["communities"]):
        raise ValueError("Community without a feature")


def parse_all(text: str) -> dict:
    lines = clean_lines(text)
    ancestries_at = next(i for i, line in enumerate(lines) if line == "ANCESTRIES")
    communities_at = next(i for i, line in enumerate(lines) if line == "COMMUNITIES")
    communities_end = next(
        (i for i in range(communities_at, len(lines)) if lines[i] == "TRANSFORMATIONS"),
        len(lines),
    )
    return {
        "classes": parse_classes(lines, ancestries_at),
        "ancestries": parse_ancestries(lines[ancestries_at:communities_at]),
        "communities": parse_communities(lines[communities_at:communities_end]),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="SRD PDF, or a text file of pre-split columns")
    parser.add_argument("output_dir", type=Path, help="Directory for classes/ancestries/communities JSON")
    parser.add_argument("--first-page", type=int, default=8)
    parser.add_argument("--last-page", type=int, default=44)
    args = parser.parse_args()

    if args.input.suffix.lower() == ".pdf":
        text = read_columns(args.input, args.first_page, args.last_page)
    else:
        text = args.input.read_text(encoding="utf-8")
    data = parse_all(text)
    validate(data)
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for key, records in data.items():
        (args.output_dir / f"{key}.json").write_text(
            json.dumps(records, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )
    print(
        "Extracted and validated "
        f"{len(data['classes'])} classes, {len(data['ancestries'])} ancestries, "
        f"{len(data['communities'])} communities to {args.output_dir}"
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, subprocess.CalledProcessError, ValueError, StopIteration) as error:
        print(f"error: {error!r}", file=sys.stderr)
        raise SystemExit(1)
