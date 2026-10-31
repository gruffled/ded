import json
import sys
import unittest
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

import character_extractor as extractor  # noqa: E402


CLASS_FIXTURE = """\
BARD

Bards are charismatic people.
They thrive in social situations.

DOMAINS – Grace & Codex

STARTING EVASION – 10

STARTING HIT POINTS – 5

CLASS ITEMS – A romance novel or a letter
never opened
BARD’S HOPE FEATURE
Make a Scene: Spend 3 Hope to temporarily Distract a
target within Close range.

CLASS FEATURE
Rally: Once per session, describe how you rally the party.
At level 1, your Rally Die is a d6.

1
Daggerheart SRD
BARD SUBCLASSES
Choose either the Troubadour or Wordsmith subclass.

TROUBADOUR
Play the Troubadour if you want to play music.

SPELLCAST TRAIT
Presence

FOUNDATION FEATURE
Gifted Performer: You can play three different types of
songs:
◦ Relaxing Song: You and all allies clear a Hit Point.
◦ Epic Song: Make a target Vulnerable.

SPECIALIZATION FEATURE
Maestro: Your songs steel the courage of those who listen.

WORDSMITH
Play the Wordsmith if you want to inspire with words.

SPELLCAST TRAIT
Presence

FOUNDATION FEATURES
Rousing Speech: Once per long rest, give a speech.
Heart of a Poet: Spend a Hope to add a d4 to a roll.

BACKGROUND QUESTIONS
Answer any of the following background questions.
• Who taught you to be so confident?
• You were in love once. Who did you adore, and how
did they hurt you?

CONNECTIONS
Ask your fellow players one of the following questions.
• What made you realize we would be friends?
• What do I do that annoys you?

Unrelated text after the connections list.
"""


class CharacterExtractorTest(unittest.TestCase):
    def setUp(self):
        lines = extractor.clean_lines(CLASS_FIXTURE)
        self.bard = extractor.parse_classes(lines, len(lines))[0]

    def test_header_stats(self):
        self.assertEqual(self.bard["name"], "Bard")
        self.assertEqual(self.bard["domains"], ["Grace", "Codex"])
        self.assertEqual((self.bard["evasion"], self.bard["hitPoints"]), (10, 5))
        self.assertEqual(self.bard["classItems"], ["A romance novel", "A letter never opened"])

    def test_hope_and_class_features_accept_singular_headings(self):
        self.assertEqual(self.bard["hopeFeature"]["name"], "Make a Scene")
        self.assertEqual([f["name"] for f in self.bard["features"]], ["Rally"])
        self.assertIn("Rally Die is a d6", self.bard["features"][0]["description"])

    def test_subclasses(self):
        troubadour, wordsmith = self.bard["subclasses"]
        self.assertEqual((troubadour["id"], troubadour["spellcastTrait"]), ("troubadour", "Presence"))
        self.assertEqual([f["name"] for f in troubadour["foundation"]], ["Gifted Performer"])
        self.assertIn("• Relaxing Song", troubadour["foundation"][0]["description"])
        self.assertEqual([f["name"] for f in troubadour["specialization"]], ["Maestro"])
        self.assertEqual([f["name"] for f in wordsmith["foundation"]], ["Rousing Speech", "Heart of a Poet"])

    def test_question_lists_stop_at_the_end_of_the_list(self):
        self.assertEqual(len(self.bard["backgroundQuestions"]), 2)
        self.assertTrue(self.bard["backgroundQuestions"][1].endswith("did they hurt you?"))
        self.assertEqual(len(self.bard["connections"]), 2)


class HelperTest(unittest.TestCase):
    def test_title_case_keeps_small_words_and_possessives(self):
        self.assertEqual(extractor.title_case("PACT OF THE ENDLESS"), "Pact of the Endless")
        self.assertEqual(extractor.title_case("PATRON’S FURY"), "Patron’s Fury")

    def test_sidebar_notes_are_not_features(self):
        features = extractor.parse_features(["Unstoppable: Once per rest.", "Tip: This is commentary."])
        self.assertEqual([f["name"] for f in features], ["Unstoppable"])

    def test_ancestries_and_communities(self):
        lines = extractor.clean_lines(
            "ANCESTRIES\nIntro text.\nANCESTRY FEATURES\nGeneral rules.\n\n"
            "ELF\nElves are tall.\nANCESTRY FEATURES\nQuick Reactions: Mark a Stress.\n"
            "Celestial Trance: Enter a trance.\n"
        )
        elf = extractor.parse_ancestries(lines)[0]
        self.assertEqual(elf["id"], "elf")
        self.assertEqual([f["name"] for f in elf["features"]], ["Quick Reactions", "Celestial Trance"])
        lines = extractor.clean_lines(
            "COMMUNITIES\nIntro.\nSEABORNE\nSeaborne live by the sea.\nCOMMUNITY FEATURE\n"
            "Know the Tide: You can read the water.\n"
        )
        self.assertEqual(extractor.parse_communities(lines)[0]["feature"]["name"], "Know the Tide")


class BundledCharacterDataTest(unittest.TestCase):
    def load(self, name):
        path = SCRIPT_DIR.parent / "src" / "data" / f"{name}.json"
        return json.loads(path.read_text(encoding="utf-8"))

    def test_bundled_data_validates(self):
        extractor.validate({
            "classes": self.load("classes"),
            "ancestries": self.load("ancestries"),
            "communities": self.load("communities"),
        })

    def test_class_domains_have_matching_domain_cards(self):
        cards = json.loads((SCRIPT_DIR.parent / "src" / "data" / "domain-cards.json").read_text(encoding="utf-8"))
        card_domains = {card["domain"] for card in cards}
        for item in self.load("classes"):
            self.assertTrue(set(item["domains"]) <= card_domains, item["name"])


if __name__ == "__main__":
    unittest.main()
