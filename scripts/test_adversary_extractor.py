import json
import sys
import unittest
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

import adversary_extractor as extractor  # noqa: E402


ADVERSARY_FIXTURE = """\
TIER 1 ADVERSARIES
TEST HUNTER
Tier1 Standard
A patient hunter.
Motives & Tactics: Track prey, wait, strike
Difficulty: 12 | Thresholds: 8/14 | HP: 5 | Stress: 3
ATK: +2d4 | Spear: Close | 1d8+2 phy
Experience: Hunt +2, Track +3
FEATURES
Ambush - Action: Spend a Fear to attack from hiding.
TEST SWARM
Tier1 Horde (4/HP)
A hungry swarm.
Motives & Tactics: Surround, overwhelm
Difficulty: 10 | Thresholds: 5/9 | HP: 6 | Stress: 2
ATK: +1 | Bites: Melee | 1d6 phy
Experience: Swarm +2
FEATURES
Relentless - Passive: The swarm keeps moving.
ADAPTING ENVIRONMENTS
"""

ENVIRONMENT_FIXTURE = """\
TIER 1 ENVIRONMENTS
TEST GROVE
Tier1 Exploration
A quiet grove.
Impulses: Draw in the curious
Difficulty: 11
PotentialAdversaries: Beasts
FEATURES
Falling Branch - Action: Spend a Fear to create a hazard.
TIER 2 ENVIRONMENTS
TEST MARKET
Tier2Social
A crowded market.
Impulses: Tempt and distract
Difficulty: 14
Potential Adversaries: Social rivals
FEATURES
Rumors - Passive: Every vendor knows something.
APPENDIX
"""


class ExtractorTests(unittest.TestCase):
    def test_adversary_fixture_preserves_new_srd_fields(self):
        adversaries = extractor.parse_srd_text(ADVERSARY_FIXTURE)
        extractor.validate(adversaries)

        self.assertEqual(len(adversaries), 2)
        self.assertEqual(adversaries[0]["attack_modifier"], "+2d4")
        self.assertEqual(
            adversaries[0]["experience"],
            [{"name": "Hunt", "modifier": 2}, {"name": "Track", "modifier": 3}],
        )
        self.assertEqual(adversaries[1]["creatures_per_hp"], 4)
        self.assertEqual(adversaries[0]["features"][0]["costs"], {"fear": 1})

    def test_environment_fixture_handles_compact_pdf_headers(self):
        environments = extractor.parse_environments(ENVIRONMENT_FIXTURE)
        extractor.validate_environments(environments)

        self.assertEqual(len(environments), 2)
        self.assertEqual(environments[0]["type"], "Exploration")
        self.assertEqual(environments[1]["type"], "Social")
        self.assertEqual(environments[1]["difficulty"], 14)

    def test_bundled_srd_data_has_expected_shape(self):
        root = Path(__file__).resolve().parents[1]
        adversaries = json.loads((root / "public/adversaries.json").read_text())
        environments = json.loads((root / "public/environments.json").read_text())

        self.assertEqual(len(adversaries), 264)
        self.assertEqual(len(environments), 47)
        self.assertEqual(
            {tier: sum(item["tier"] == tier for item in environments) for tier in range(1, 5)},
            {1: 16, 2: 12, 3: 11, 4: 8},
        )
        self.assertTrue(all(item["standard_attack"] for item in adversaries))
        self.assertTrue(all(item["difficulty"] is not None for item in adversaries))
        self.assertTrue(all(item["difficulty"] is not None for item in environments))


if __name__ == "__main__":
    unittest.main()
