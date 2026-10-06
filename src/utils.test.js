import { describe, it, expect } from "vitest";
import { ADJUSTMENT_VALUES } from "./constants";
import {
  getTier,
  getAdjustedBattlePoints,
  calculateBudget,
  filterAndSortAdversaries,
} from "./utils";

describe("getTier", () => {
  it("should return tier 1 for level 1", () => {
    expect(getTier(1)).toBe(1);
  });

  it("should return tier 2 for levels 2-4", () => {
    expect(getTier(2)).toBe(2);
    expect(getTier(3)).toBe(2);
    expect(getTier(4)).toBe(2);
  });

  it("should return tier 3 for levels 5-7", () => {
    expect(getTier(5)).toBe(3);
    expect(getTier(7)).toBe(3);
  });

  it("should return tier 4 for levels 8+", () => {
    expect(getTier(8)).toBe(4);
    expect(getTier(12)).toBe(4);
  });
});

describe("getAdjustedBattlePoints", () => {
  it("should use the type cost regardless of adversary tier", () => {
    const adversary = { tier: 1, battle_points: 5 };
    expect(getAdjustedBattlePoints(adversary, 2)).toBe(5);
  });

  it("should not reduce battle points when adversary tier equals party tier", () => {
    const adversary = { tier: 2, battle_points: 5 };
    expect(getAdjustedBattlePoints(adversary, 2)).toBe(5);
  });

  it("should not reduce battle points when adversary tier is above party tier", () => {
    const adversary = { tier: 3, battle_points: 5 };
    expect(getAdjustedBattlePoints(adversary, 2)).toBe(5);
  });

  it("should not go below 0 battle points", () => {
    const adversary = { tier: 1, battle_points: 0 };
    expect(getAdjustedBattlePoints(adversary, 2)).toBe(0);
  });
});

describe("calculateBudget", () => {
  it("should calculate base budget correctly", () => {
    const result = calculateBudget([], 4, 1, ADJUSTMENT_VALUES.NONE);
    // BASE_PER_PLAYER (3) * 4 + BASE_BONUS (2) = 14
    expect(result.total).toBe(14);
    expect(result.spent).toBe(0);
    expect(result.remaining).toBe(14);
  });

  it("should calculate spent points correctly", () => {
    const encounter = [
      { tier: 1, battle_points: 3, type: "bruiser" },
      { tier: 1, battle_points: 2, type: "minion" },
    ];
    const result = calculateBudget(encounter, 4, 1, ADJUSTMENT_VALUES.NONE);
    expect(result.spent).toBe(5);
    expect(result.remaining).toBe(9);
  });

  it("should charge one point per party-sized group of minions", () => {
    const encounter = Array.from({ length: 5 }, () => ({
      tier: 1,
      type: "Minion",
    }));
    const result = calculateBudget(encounter, 4, 1, ADJUSTMENT_VALUES.NONE);
    expect(result.spent).toBe(2);
  });

  it("should apply penalty for multiple solos", () => {
    const encounter = [
      { tier: 1, battle_points: 8, type: "solo" },
      { tier: 1, battle_points: 8, type: "Solo" },
    ];
    // Multiple solos reduce budget by 2
    const result = calculateBudget(encounter, 4, 1, ADJUSTMENT_VALUES.NONE);
    expect(result.total).toBe(12); // 14 base - 2 penalty
    expect(result.spent).toBe(10);
  });

  it("should add bonus when encounter has no major types", () => {
    const encounter = [
      { tier: 1, battle_points: 2, type: "minion" },
      { tier: 1, battle_points: 2, type: "standard" },
    ];
    // No major types (bruiser, horde, leader, solo) adds +1 to budget
    const result = calculateBudget(encounter, 4, 1, ADJUSTMENT_VALUES.NONE);
    expect(result.total).toBe(15); // 14 base + 1 bonus
  });

  it("should add one budget point when using a lower-tier adversary", () => {
    const encounter = [{ tier: 1, type: "Bruiser" }];
    const result = calculateBudget(encounter, 4, 2, ADJUSTMENT_VALUES.NONE);
    expect(result.total).toBe(15);
    expect(result.spent).toBe(4);
  });
});

describe("filterAndSortAdversaries", () => {
  const mockAdversaries = [
    { name: "Dragon", tier: 3, type: "Solo" },
    { name: "Goblin", tier: 1, type: "Minion" },
    { name: "Orc", tier: 2, type: "Standard" },
  ];

  it("should filter by search term", () => {
    const result = filterAndSortAdversaries(
      mockAdversaries,
      "dragon",
      false,
      2,
      "tier",
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Dragon");
  });

  it("should filter by tier when enabled", () => {
    const result = filterAndSortAdversaries(
      mockAdversaries,
      "",
      true,
      2,
      "tier",
    );
    // Should only include adversaries within 1 tier of party tier 2 (so tiers 1-3)
    expect(result).toHaveLength(3);
  });

  it("should sort by name", () => {
    const result = filterAndSortAdversaries(
      mockAdversaries,
      "",
      false,
      2,
      "name",
    );
    expect(result[0].name).toBe("Dragon");
    expect(result[1].name).toBe("Goblin");
    expect(result[2].name).toBe("Orc");
  });

  it("should sort by tier by default", () => {
    const result = filterAndSortAdversaries(
      mockAdversaries,
      "",
      false,
      2,
      "tier",
    );
    expect(result[0].tier).toBe(1);
    expect(result[1].tier).toBe(2);
    expect(result[2].tier).toBe(3);
  });
});
