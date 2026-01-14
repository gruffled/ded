import {
  TIER_THRESHOLDS,
  BUDGET_CONFIG,
  MAJOR_ADVERSARY_TYPES,
} from "./constants";

/**
 * Calculate Daggerheart tier from party level
 */
export const getTier = (level) => {
  const threshold = TIER_THRESHOLDS.find((t) => level <= t.max);
  return threshold ? threshold.tier : 4;
};

/**
 * Calculate adjusted battle points for an adversary
 */
export const getAdjustedBattlePoints = (adversary, partyTier) => {
  const basePoints = adversary.battle_points;
  return adversary.tier < partyTier ? Math.max(0, basePoints - 1) : basePoints;
};

/**
 * Calculate encounter budget with all adjustments
 */
export const calculateBudget = (
  encounter,
  partySize,
  partyTier,
  adjustments
) => {
  let currentCost = 0;
  let soloCount = 0;
  let hasMajorType = false;

  encounter.forEach((adv) => {
    currentCost += getAdjustedBattlePoints(adv, partyTier);
    if (adv.type.toLowerCase() === "solo") soloCount++;
    if (MAJOR_ADVERSARY_TYPES.includes(adv.type.toLowerCase()))
      hasMajorType = true;
  });

  const baseBudget =
    BUDGET_CONFIG.BASE_PER_PLAYER * partySize + BUDGET_CONFIG.BASE_BONUS;

  const manualAdjustment =
    BUDGET_CONFIG.ADJUSTMENT[adjustments.toUpperCase()] || 0;

  let dynamicAdjustment = 0;
  if (soloCount >= 2) dynamicAdjustment += BUDGET_CONFIG.DYNAMIC.MULTIPLE_SOLOS;
  if (encounter.length > 0 && !hasMajorType)
    dynamicAdjustment += BUDGET_CONFIG.DYNAMIC.NO_MAJOR_TYPES;

  const total = baseBudget + manualAdjustment + dynamicAdjustment;
  const remaining = total - currentCost;

  return { total, spent: currentCost, remaining };
};

/**
 * Filter and sort adversaries
 */
export const filterAndSortAdversaries = (
  adversaries,
  searchTerm,
  filterByTier,
  partyTier,
  sortBy
) => {
  const filtered = adversaries.filter((adv) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      adv.name.toLowerCase().includes(searchTermLower) ||
      adv.type.toLowerCase().includes(searchTermLower) ||
      `tier ${adv.tier}`.includes(searchTermLower);

    const matchesTier = !filterByTier || Math.abs(adv.tier - partyTier) <= 1;

    return matchesSearch && matchesTier;
  });

  return filtered.sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    // Sort by tier, then by name within same tier
    return a.tier !== b.tier ? a.tier - b.tier : a.name.localeCompare(b.name);
  });
};
