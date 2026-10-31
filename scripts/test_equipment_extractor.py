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
     Dagger                                                                   target\u2019s Major threshold as having a \u22122 penalty.
     Longbow          Agility      Very Far         d8+3 phy     Two-Handed   Cumbersome: \u22121 to Finesse

     TIER 1 (LEVEL 1)
     Magic Weapons
     All magic weapons require a Spellcast trait
      Name             Trait        Range           Damage       Burden       Feature
     Shadowblade      Presence      Melee           d8 phy/mag   One-Handed   \u2014
TIER 2 (LEVELS 2\u20134)
Magic Weapons
 All magic weapons require a Spellcast trait

Name              Trait           Range        Damage      Burden       Feature

Improved          Presence        Melee        d8+3        One-Handed   Otherworldly: On a successful attack, you can
Shadowblade                                    phy/mag                  deal physical or magic damage.
Improved Hand     Instinct        Very Close   d10+3 mag   One-Handed   \u2014
Runes
SECONDARY WEAPON TABLES
"""

ARMOR_FIXTURE = """\
ARMOR TABLES
     TIER 1 (LEVEL 1)
                                       Base               Base
      Name                          Thresholds           Score       Feature
      Mage Robes                          4 / 10             2       Enchanted: Gain a bonus to your damage thresholds equal to your
                                                                     Spellcast trait.
      Leather Armor                       6 / 13             3       \u2014
TIER 2 (LEVELS 2\u20134)
                                       Base               Base
      Name                          Thresholds           Score       Feature
      Improved Leather Armor              9 / 20             4       \u2014
Loot comprises any consumables
"""


class EquipmentExtractorTest(unittest.TestCase):
    def setUp(self):
        self.weapons = {}
        for tier, lines in extractor.tier_sections(WEAPON_FIXTURE, "PRIMARY WEAPON TABLES", "SECONDARY WEAPON TABLES"):
            for weapon in extractor.parse_weapon_table(lines, "Primary", tier):
                self.weapons[weapon["name"]] = weapon

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

    def test_tiers_are_read_from_the_section_markers(self):
        self.assertEqual(self.weapons["Broadsword"]["tier"], 1)
        self.assertEqual(self.weapons["Improved Hand Runes"]["tier"], 2)

    def test_damage_type_that_wraps_onto_the_next_line(self):
        improved = self.weapons["Improved Shadowblade"]
        self.assertEqual((improved["die"], improved["bonus"], improved["damageType"]), ("d8", 3, "physical or magic"))
        self.assertTrue(improved["feature"].endswith("magic damage."))

    def test_armor_rows(self):
        armor = {}
        for tier, lines in extractor.tier_sections(ARMOR_FIXTURE, "ARMOR TABLES", "Loot comprises any consumables"):
            for item in extractor.parse_armor(lines, tier):
                armor[item["name"]] = item
        self.assertEqual(
            (armor["Mage Robes"]["baseMajor"], armor["Mage Robes"]["baseSevere"], armor["Mage Robes"]["baseScore"]),
            (4, 10, 2),
        )
        self.assertTrue(armor["Mage Robes"]["feature"].endswith("Spellcast trait."))
        self.assertEqual(armor["Leather Armor"]["feature"], "")
        self.assertEqual(armor["Improved Leather Armor"]["tier"], 2)
        self.assertEqual(armor["Improved Leather Armor"]["baseSevere"], 20)


class BundledEquipmentTest(unittest.TestCase):
    def test_bundled_data_validates(self):
        path = SCRIPT_DIR.parent / "src" / "data" / "equipment.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        extractor.validate(data)
        # Weapons and armor must exist at every tier so characters can re-equip as they level.
        for key in ("primaryWeapons", "secondaryWeapons", "armor"):
            self.assertEqual({item["tier"] for item in data[key]}, {1, 2, 3, 4}, key)


if __name__ == "__main__":
    unittest.main()
