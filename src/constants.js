// Game rules constants
export const TIER_THRESHOLDS = [
  { max: 1, tier: 1 },
  { max: 4, tier: 2 },
  { max: 7, tier: 3 },
  { max: Infinity, tier: 4 },
];

export const MAJOR_ADVERSARY_TYPES = ["bruiser", "horde", "leader", "solo"];

// Battle Point costs from Daggerheart SRD 2.0, p. 94.
// Minions are handled as party-sized groups in calculateBudget().
export const BATTLE_POINTS_BY_TYPE = {
  minion: 1,
  social: 1,
  support: 1,
  horde: 2,
  ranged: 2,
  skulk: 2,
  standard: 2,
  leader: 3,
  bruiser: 4,
  solo: 5,
};

export const ADJUSTMENT_VALUES = {
  NONE: "none",
  EASY: "easy",
  HARD: "hard",
  DAMAGE: "damage",
};

export const BUDGET_CONFIG = {
  BASE_PER_PLAYER: 3,
  BASE_BONUS: 2,
  ADJUSTMENT: {
    NONE: 0,
    EASY: -1,
    HARD: 2,
    DAMAGE: -2,
  },
  DYNAMIC: {
    MULTIPLE_SOLOS: -2,
    LOWER_TIER: 1,
    NO_MAJOR_TYPES: 1,
  },
};

export const TIER_FILTER_RANGE = 1;

export const SORT_OPTIONS = {
  NAME: "name",
  TIER: "tier",
};
