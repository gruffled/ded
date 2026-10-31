import json
import sys
import unittest
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

import domain_card_extractor as extractor  # noqa: E402


COLUMN_FIXTURE = """\
ARCANA DOMAIN

RUNE WARD
Level 1 Arcana Spell
Recall Cost: 0
You have a trinket that can be infused with
protective magic.

If the Ward Die result is 8, the ward ends.
UNLEASH CHAOS
Level 1 Arcana Spell
Recall Cost: 1
Place tokens on this card.
\u25e6 Spend a token to deal damage.
\u25e6 Clear unspent tokens.
216 Daggerheart SRD
COUNTERSPELL
Level 3 Arcana Spell
Recall Cost: 2
Interrupt a magical effect.
BOOK OF TEST
Level 1 Codex Grimoire
Recall Cost: 2
Alpha: Do the first thing. Beta Spell: Do the second thing.
"""


class DomainCardExtractorTest(unittest.TestCase):
    def setUp(self):
        self.cards = {card["name"]: card for card in extractor.parse_cards(COLUMN_FIXTURE)}

    def test_only_requested_level_is_extracted(self):
        self.assertEqual(set(self.cards), {"Rune Ward", "Unleash Chaos", "Book of Test"})

    def test_metadata_is_parsed(self):
        card = self.cards["Rune Ward"]
        self.assertEqual(
            (card["domain"], card["type"], card["level"], card["recallCost"]),
            ("Arcana", "Spell", 1, 0),
        )

    def test_wrapped_lines_join_and_paragraphs_stay_separate(self):
        self.assertEqual(
            self.cards["Rune Ward"]["description"],
            "You have a trinket that can be infused with protective magic.\n"
            "If the Ward Die result is 8, the ward ends.",
        )

    def test_bullets_and_page_footers(self):
        self.assertEqual(
            self.cards["Unleash Chaos"]["description"],
            "Place tokens on this card.\n"
            "\u2022 Spend a token to deal damage.\n"
            "\u2022 Clear unspent tokens.",
        )

    def test_grimoire_spells_get_their_own_lines(self):
        self.assertEqual(
            self.cards["Book of Test"]["description"].split("\n"),
            ["Alpha: Do the first thing.", "Beta Spell: Do the second thing."],
        )


class BundledDomainCardsTest(unittest.TestCase):
    def setUp(self):
        path = SCRIPT_DIR.parent / "src" / "data" / "domain-cards.json"
        self.cards = json.loads(path.read_text(encoding="utf-8"))

    def test_bundled_cards_validate(self):
        extractor.validate(self.cards)

    def test_every_domain_has_cards_to_choose_from(self):
        counts = {}
        for card in self.cards:
            counts[card["domain"]] = counts.get(card["domain"], 0) + 1
        self.assertEqual(set(counts), set(extractor.DOMAINS))
        self.assertTrue(all(count >= 3 for count in counts.values()), counts)


if __name__ == "__main__":
    unittest.main()
