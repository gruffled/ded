import { describe, expect, it } from "vitest";
import { ARMOR, CLASSES, PRIMARY_WEAPONS, SECONDARY_WEAPONS } from "./characterData";
import { createInitialCharacter, getDerivedStats, isValidTraitAssignment, parseCharacter, serializeCharacter, validateCharacter } from "./characterUtils";

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

  it("falls back to defaults for malformed imported fields", () => {
    const file = {
      format: "daggerheart-character",
      version: 1,
      character: {
        name: 42,
        traits: { agility: "high", strength: 1 },
        experiences: null,
        domainCardIds: "nope",
        connections: [null, { text: "ok" }],
      },
    };
    const parsed = parseCharacter(file);
    expect(parsed.name).toBe("");
    expect(parsed.traits.agility).toBeNull();
    expect(parsed.traits.strength).toBe(1);
    expect(parsed.experiences).toHaveLength(2);
    expect(parsed.domainCardIds).toEqual([]);
    expect(parsed.connections).toEqual([{ text: "ok" }]);
    expect(() => validateCharacter(parsed)).not.toThrow();
  });

  it("rejects files that are not character exports", () => {
    expect(() => parseCharacter({ format: "other" })).toThrow(/supported/);
  });

  it("derives stats from class, armor and ancestry", () => {
    const character = createInitialCharacter();
    character.classId = CLASSES[0].id;
    character.armorId = ARMOR[0].id;
    character.ancestryIds = ["human"];
    const stats = getDerivedStats(character, CLASSES, ARMOR);
    expect(stats.evasion).toBe(CLASSES[0].evasion);
    expect(stats.hitPoints).toBe(CLASSES[0].hp);
    expect(stats.stress).toBe(7);
    expect(stats.majorThreshold).toBe(ARMOR[0].baseMajor + 1);
    expect(stats.severeThreshold).toBe(ARMOR[0].baseSevere + 1);
  });

  it("requires a secondary weapon only with a one-handed primary", () => {
    const base = createInitialCharacter();
    const oneHanded = PRIMARY_WEAPONS.find((weapon) => weapon.burden === 1);
    const twoHanded = PRIMARY_WEAPONS.find((weapon) => weapon.burden === 2);
    const secondary = SECONDARY_WEAPONS[0];
    const messages = (changes) => validateCharacter({ ...base, ...changes }).join("|");
    expect(messages({ primaryWeaponId: oneHanded.id })).toMatch(/secondary weapon with a one-handed/);
    expect(messages({ primaryWeaponId: oneHanded.id, secondaryWeaponId: secondary.id })).not.toMatch(/secondary/);
    expect(messages({ primaryWeaponId: twoHanded.id })).not.toMatch(/secondary/);
    expect(messages({ primaryWeaponId: twoHanded.id, secondaryWeaponId: secondary.id })).toMatch(/can't be paired/);
  });
});
