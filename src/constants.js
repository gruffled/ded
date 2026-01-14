// Game rules constants
export const TIER_THRESHOLDS = [
  { max: 1, tier: 1 },
  { max: 4, tier: 2 },
  { max: 7, tier: 3 },
  { max: Infinity, tier: 4 },
];

export const MAJOR_ADVERSARY_TYPES = ["bruiser", "horde", "leader", "solo"];

export const BUDGET_CONFIG = {
  BASE_PER_PLAYER: 3,
  BASE_BONUS: 2,
  ADJUSTMENT: {
    EASY: -1,
    HARD: 2,
    DAMAGE: -2,
  },
  DYNAMIC: {
    MULTIPLE_SOLOS: -2,
    NO_MAJOR_TYPES: 1,
  },
};

export const TIER_FILTER_RANGE = 1;

export const SORT_OPTIONS = {
  NAME: "name",
  TIER: "tier",
};
