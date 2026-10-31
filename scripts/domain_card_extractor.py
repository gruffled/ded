#!/usr/bin/env python3
"""Extract level-1 Daggerheart SRD 2.0 domain cards into JSON.

The domain card reference appendix is laid out in two columns, so each page is
cropped into a left and a right half before text extraction. That keeps every
card's text contiguous. Always review the generated JSON after importing a new
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

DOMAINS = (
    "Arcana", "Blade", "Bone", "Codex", "Dread",
    "Grace", "Midnight", "Sage", "Splendor", "Valor",
)
CARD_TYPES = ("Ability", "Spell", "Grimoire")

# Page geometry of the SRD 2.0 PDF (US Letter, two text columns).
PAGE_WIDTH = 612
PAGE_HEIGHT = 792
COLUMN_WIDTH = PAGE_WIDTH // 2

LEVEL_RE = re.compile(r"^Level (?P<level>\d+) (?P<domain>\w+) (?P<type>\w+)$")
RECALL_RE = re.compile(r"^Recall Cost: (?P<cost>\d+)$")
FOOTER_RE = re.compile(r"\s*(?:\d+\s+Daggerheart SRD|Daggerheart SRD\s+\d+)")
BULLET_RE = re.compile(r"^[◦•]\s*")


def read_columns(path: Path, first_page: int, last_page: int) -> str:
    """Extract each column of each page, in reading order."""
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


def normalize(text: str) -> str:
    for glyph, digit in PDF_DIGITS.items():
        text = text.replace(glyph, digit)
    text = text.replace(" ", " ").replace("−", "-")
    return FOOTER_RE.sub("", text)


def format_body(lines: list[str]) -> str:
    """Join wrapped lines into paragraphs; keep bullets on their own lines."""
    paragraphs: list[str] = []
    current: list[str] = []

    def flush() -> None:
        if current:
            paragraphs.append(" ".join(current))
            current.clear()

    for line in lines:
        if not line:
            flush()
        elif BULLET_RE.match(line):
            flush()
            current.append("• " + BULLET_RE.sub("", line))
        else:
            current.append(line)
    flush()
    return "\n".join(paragraphs)


SPELL_BREAK_RE = re.compile(r"(?<=[.)]) (?=[A-Z][\w’']*(?: [A-Z][\w’']*){0,3}: )")


def split_grimoire_spells(description: str) -> str:
    """Put each spell in a grimoire on its own line."""
    return SPELL_BREAK_RE.sub("\n", description)


def parse_cards(text: str, level: int = 1) -> list[dict]:
    lines = [line.strip() for line in normalize(text).split("\n")]
    headers = []
    for index, line in enumerate(lines):
        match = LEVEL_RE.match(line)
        if not match:
            continue
        name_index = index - 1
        while name_index >= 0 and not lines[name_index]:
            name_index -= 1
        recall_index = index + 1
        while recall_index < len(lines) and not lines[recall_index]:
            recall_index += 1
        recall = RECALL_RE.match(lines[recall_index]) if recall_index < len(lines) else None
        if name_index < 0 or not recall:
            continue
        headers.append({
            "name_index": name_index,
            "body_start": recall_index + 1,
            "level": int(match["level"]),
            "domain": match["domain"],
            "type": match["type"],
            "recallCost": int(recall["cost"]),
            "name": lines[name_index],
        })

    cards = []
    for position, header in enumerate(headers):
        end = headers[position + 1]["name_index"] if position + 1 < len(headers) else len(lines)
        if header["level"] != level:
            continue
        body = format_body(lines[header["body_start"]:end])
        if header["type"] == "Grimoire":
            body = split_grimoire_spells(body)
        cards.append({
            "name": header["name"].title().replace("’S", "’s").replace(" Of ", " of ")
            .replace(" And ", " and "),
            "domain": header["domain"],
            "type": header["type"],
            "level": header["level"],
            "recallCost": header["recallCost"],
            "description": body,
        })
    return cards


def validate(cards: list[dict]) -> None:
    if not cards:
        raise ValueError("No domain cards were extracted")
    names = [card["name"] for card in cards]
    if len(set(names)) != len(names):
        raise ValueError("Duplicate domain card names extracted")
    for card in cards:
        if card["domain"] not in DOMAINS:
            raise ValueError(f"{card['name']}: unknown domain {card['domain']}")
        if card["type"] not in CARD_TYPES:
            raise ValueError(f"{card['name']}: unknown type {card['type']}")
        if not card["description"]:
            raise ValueError(f"{card['name']}: missing description")
    missing = set(DOMAINS) - {card["domain"] for card in cards}
    if missing:
        raise ValueError(f"No cards extracted for domains: {', '.join(sorted(missing))}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="SRD PDF, or a text file of pre-split columns")
    parser.add_argument("output", type=Path, help="JSON file to write")
    parser.add_argument("--first-page", type=int, default=206)
    parser.add_argument("--last-page", type=int, default=224)
    args = parser.parse_args()

    if args.input.suffix.lower() == ".pdf":
        text = read_columns(args.input, args.first_page, args.last_page)
    else:
        text = args.input.read_text(encoding="utf-8")
    cards = parse_cards(text)
    validate(cards)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(cards, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Extracted and validated {len(cards)} level-1 domain cards to {args.output}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, subprocess.CalledProcessError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1)
