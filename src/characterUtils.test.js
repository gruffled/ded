import { describe, expect, it } from "vitest";
import { createInitialCharacter, isValidTraitAssignment, parseCharacter, serializeCharacter, validateCharacter } from "./characterUtils";

describe("character utilities", () => {
  it("creates a level-one character with SRD defaults", () => {
    const character = createInitialCharacter();
    expect(character.level).toBe(1);
    expect(character.experiences).toHaveLength(2);
    expect(character.domainCardIds).toHaveLength(0);
  });

  it("validates the starting trait array", () => {
    expect(isValidTraitAssignment({ agility: 2, strength: 1, finesse: 1, instinct: 0, presence: 0, knowledge: -1 })).toBe(true);
    expect(isValidTraitAssignment({ agility: 2, strength: 2, finesse: 1, instinct: 0, presence: 0, knowledge: -1 })).toBe(false);
  });

  it("round trips an exported character", () => {
    const original = createInitialCharacter();
    original.name = "Ari";
    expect(parseCharacter(serializeCharacter(original))).toEqual(original);
  });

  it("reports incomplete character requirements", () => {
    expect(validateCharacter(createInitialCharacter())).toHaveLength(8);
  });
});
