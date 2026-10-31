import { describe, expect, it } from "vitest";
import {
  ANCESTRIES,
  ARMOR,
  CLASSES,
  COMMUNITIES,
  LEVEL_ONE_DOMAIN_CARDS,
  PRIMARY_WEAPONS,
  SECONDARY_WEAPONS,
} from "./characterData";

describe("level-one domain cards", () => {
  it("have unique ids and complete text", () => {
    const ids = LEVEL_ONE_DOMAIN_CARDS.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const card of LEVEL_ONE_DOMAIN_CARDS) {
      expect(card.description.length).toBeGreaterThan(20);
      expect(card.level).toBe(1);
    }
  });

  it("give every class at least two cards to pick from", () => {
    for (const characterClass of CLASSES) {
      const available = LEVEL_ONE_DOMAIN_CARDS.filter((card) =>
        characterClass.domains.includes(card.domain)
      );
      expect(available.length, characterClass.name).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("SRD character data", () => {
  it("includes every class with two subclasses and creation text", () => {
    expect(CLASSES).toHaveLength(13);
    for (const characterClass of CLASSES) {
      expect(characterClass.subclasses, characterClass.name).toHaveLength(2);
      expect(characterClass.hopeFeature?.name, characterClass.name).toBeTruthy();
      expect(characterClass.features.length, characterClass.name).toBeGreaterThan(0);
      expect(characterClass.items, characterClass.name).toHaveLength(2);
      for (const subclass of characterClass.subclasses) {
        expect(subclass.foundation.description, subclass.name).toBeTruthy();
      }
    }
  });

  it("gives every ancestry two features and every community one", () => {
    expect(ANCESTRIES).toHaveLength(24);
    expect(ANCESTRIES.every((item) => item.features.length === 2)).toBe(true);
    expect(COMMUNITIES).toHaveLength(15);
    expect(COMMUNITIES.every((item) => item.feature?.name)).toBe(true);
  });

  it("keeps the ancestries that grant permanent stat bonuses", () => {
    for (const id of ["earthkin", "simiah", "giant", "human"]) {
      expect(ANCESTRIES.some((item) => item.id === id), id).toBe(true);
    }
  });

  it("has unique equipment ids and a usable armor table", () => {
    for (const list of [PRIMARY_WEAPONS, SECONDARY_WEAPONS, ARMOR]) {
      expect(new Set(list.map((item) => item.id)).size).toBe(list.length);
    }
    expect(SECONDARY_WEAPONS.every((weapon) => weapon.burden === 1)).toBe(true);
    expect(ARMOR.every((item) => item.baseScore > 0 && item.baseSevere > item.baseMajor)).toBe(true);
  });
});
