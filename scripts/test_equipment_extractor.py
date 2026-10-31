import json
import sys
import unittest
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

import equipment_extractor as extractor  # noqa: E402


WEAPON_FIXTURE = """\
PRIMARY WEAPON TABLES
     TIER 1 (LEVEL 1)
     Physical Weapons
      Name            Trait         Range           Damage       Burden       Feature

     Broadsword       Agility      Melee            d8 phy       One-Handed   Reliable: +1 to attack rolls
     Katana           Agility      Melee            d10+3 phy    Two-Handed   Quick: When you make an attack, you can mark a
                                                                              Stress to target another creature within range.
     Twisted          Knowledge    Melee            d8 phy       One-Handed   Piercing: Damage dealt with this weapon treats the
     Dagger                                                                   target’s Major threshold as having a −2 penalty.
     Longbow          Agility      Very Far         d8+3 phy     Two-Handed   Cumbersome: −1 to Finesse

     TIER 1 (LEVEL 1)
     Magic Weapons
     All magic weapons require a Spellcast trait
      Name             Trait        Range           Damage       Burden       Feature
     Shadowblade      Presence      Melee           d8 phy/mag   One-Handed   —
TIER 2 (LEVELS 2-4)
"""

ARMOR_FIXTURE = """\
ARMOR TABLES
     TIER 1 (LEVEL 1)
                                       Base               Base
      Name                          Thresholds           Score       Feature
      Mage Robes                          4 / 10             2       Enchanted: Gain a bonus to your damage thresholds equal to your
                                                                     Spellcast trait.
      Leather Armor                       6 / 13             3       —
TIER 2 (LEVELS 2-4)
"""


class EquipmentExtractorTest(unittest.TestCase):
    def setUp(self):
        lines = extractor.tier_one_section(WEAPON_FIXTURE, "PRIMARY WEAPON TABLES")
        self.weapons = {w["name"]: w for w in extractor.parse_weapon_table(lines, "Primary")}

    def test_basic_row(self):
        broadsword = self.weapons["Broadsword"]
        self.assertEqual(
            (broadsword["trait"], broadsword["range"], broadsword["die"], broadsword["bonus"], broadsword["burden"]),
            ("Agility", "Melee", "d8", 0, 1),
        )

    def test_damage_bonus_and_burden(self):
        katana = self.weapons["Katana"]
        self.assertEqual((katana["die"], katana["bonus"], katana["burden"]), ("d10", 3, 2))

    def test_wrapped_feature_and_name(self):
        self.assertTrue(self.weapons["Katana"]["feature"].endswith("within range."))
        self.assertIn("Twisted Dagger", self.weapons)
        self.assertIn("Major threshold", self.weapons["Twisted Dagger"]["feature"])

    def test_section_headings_do_not_leak_into_the_previous_row(self):
        self.assertEqual(self.weapons["Longbow"]["feature"], "Cumbersome: −1 to Finesse")
        self.assertIn("Shadowblade", self.weapons)

    def test_dash_feature_means_none_and_dual_damage(self):
        self.assertEqual(self.weapons["Shadowblade"]["feature"], "")
        self.assertEqual(self.weapons["Shadowblade"]["damageType"], "physical or magic")

    def test_armor_rows(self):
        armor = {a["name"]: a for a in extractor.parse_armor(
            extractor.tier_one_section(ARMOR_FIXTURE, "ARMOR TABLES"))}
        self.assertEqual(
            (armor["Mage Robes"]["baseMajor"], armor["Mage Robes"]["baseSevere"], armor["Mage Robes"]["baseScore"]),
            (4, 10, 2),
        )
        self.assertTrue(armor["Mage Robes"]["feature"].endswith("Spellcast trait."))
        self.assertEqual(armor["Leather Armor"]["feature"], "")


class BundledEquipmentTest(unittest.TestCase):
    def test_bundled_data_validates(self):
        path = SCRIPT_DIR.parent / "src" / "data" / "equipment.json"
        extractor.validate(json.loads(path.read_text(encoding="utf-8")))


if __name__ == "__main__":
    unittest.main()
