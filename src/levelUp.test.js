import { describe, expect, it } from "vitest";
import { CLASSES, DOMAIN_CARDS, LEVEL_ONE_DOMAIN_CARDS } from "./characterData";
import { createInitialCharacter } from "./characterUtils";
import {
  emptyLevelUp,
  getEffectiveTraits,
  getMarkedTraits,
  getOpenTiers,
  getProgress,
  validateLevelUp,
  validateLevelUps,
} from "./levelUp";

const bard = CLASSES.find((item) => item.id === "bard");
const cardsFor = (domains, level) =>
  DOMAIN_CARDS.filter((card) => domains.includes(card.domain) && card.level === level);

const baseCharacter = () => ({
  ...createInitialCharacter(),
  name: "Ari",
  classId: "bard",
  subclassId: "troubadour",
  traits: { agility: 2, strength: 1, finesse: 1, instinct: 0, presence: 0, knowledge: -1 },
  experiences: [{ name: "Busker", modifier: 2 }, { name: "Thief", modifier: 2 }],
  domainCardIds: LEVEL_ONE_DOMAIN_CARDS.filter((card) => bard.domains.includes(card.domain)).slice(0, 2).map((card) => card.id),
});

const pick = (option, tier, details = {}) => ({ option, tier, ...details });
const levelUp = (picks, extra = {}) => ({ experience: "", picks, domainCardId: "", exchange: null, ...extra });

const tierOf = (level) => (level < 5 ? 2 : level < 8 ? 3 : 4);

// A complete, valid level-up to `level`. `picks` may be option ids or full picks.
const simple = (level, character, picks = ["hp", "stress"], extra = {}) => {
  const owned = getProgress(character).cardIds;
  const card = DOMAIN_CARDS.find((c) => bard.domains.includes(c.domain) && c.level <= level && !owned.includes(c.id));
  return levelUp(
    picks.map((item) => (typeof item === "string" ? pick(item, tierOf(level)) : item)),
    { experience: [2, 5, 8].includes(level) ? `Exp ${level}` : "", domainCardId: card.id, ...extra }
  );
};

// Valid, slot-respecting history up to (and including) `upTo`.
const history = (upTo) => {
  const plan = {
    2: ["hp", "stress"],
    3: ["hp", "stress"],
    4: ["evasion", pick("traits", 2, { traits: ["strength", "instinct"] })],
    5: ["hp", "stress"],
    6: ["hp", "stress"],
  };
  let character = baseCharacter();
  for (let level = 2; level <= upTo; level += 1) {
    character = { ...character, levelUps: [...(character.levelUps ?? []), simple(level, character, plan[level])] };
  }
  return character;
};

describe("progress", () => {
  it("starts at level 1 with no bonuses", () => {
    const progress = getProgress(baseCharacter());
    expect(progress).toMatchObject({ level: 1, tier: 1, proficiency: 1, hitPoints: 0, stress: 0, evasion: 0 });
    expect(progress.experiences).toHaveLength(2);
    expect(progress.cardIds).toHaveLength(2);
  });

  it("applies tier achievements and simple advancements", () => {
    const character = baseCharacter();
    character.levelUps = [simple(2, character, ["hp", "evasion"])];
    const progress = getProgress(character);
    expect(progress).toMatchObject({ level: 2, tier: 2, proficiency: 2, hitPoints: 1, evasion: 1 });
    expect(progress.experiences.map((e) => e.name)).toEqual(["Busker", "Thief", "Exp 2"]);
    expect(progress.cardIds).toHaveLength(3);
  });

  it("raises traits and Experiences from picks", () => {
    const character = baseCharacter();
    character.levelUps = [
      simple(2, character, []),
    ];
    character.levelUps[0].picks = [
      pick("traits", 2, { traits: ["agility", "knowledge"] }),
      pick("experiences", 2, { experiences: [0, 2] }),
    ];
    expect(getEffectiveTraits(character)).toMatchObject({ agility: 3, knowledge: 0, strength: 1 });
    expect(getProgress(character).experiences.map((e) => e.modifier)).toEqual([3, 2, 3]);
  });
});

describe("advancement availability", () => {
  it("offers only tier 2 options at level 2", () => {
    const available = (id) => getOpenTiers(id, 2, []);
    for (const id of ["traits", "hp", "stress", "experiences", "domainCard", "evasion"]) {
      expect(available(id), id).toEqual([2]);
    }
    for (const id of ["subclass", "proficiency", "multiclass"]) expect(available(id), id).toEqual([]);
  });

  it("opens the upgrade options from level 5 and older tiers stay available", () => {
    expect(getOpenTiers("subclass", 5, [])).toEqual([3]);
    expect(getOpenTiers("multiclass", 5, [])).toEqual([3]);
    expect(getOpenTiers("proficiency", 8, [])).toEqual([3, 4]);
    expect(getOpenTiers("hp", 5, [])).toEqual([2, 3]);
  });

  it("runs out of slots within a tier", () => {
    const used = [pick("hp", 2), pick("hp", 2)];
    expect(getOpenTiers("hp", 4, used)).toEqual([]);
    expect(getOpenTiers("hp", 5, used)).toEqual([3]);
    expect(getOpenTiers("traits", 4, [pick("traits", 2), pick("traits", 2), pick("traits", 2)])).toEqual([]);
  });

  it("treats a tier's upgrade slot as either a subclass card or the multiclass", () => {
    expect(getOpenTiers("multiclass", 8, [pick("subclass", 3)])).toEqual([4]);
    expect(getOpenTiers("subclass", 8, [pick("multiclass", 3)])).toEqual([4]);
    expect(getOpenTiers("multiclass", 8, [pick("multiclass", 3)])).toEqual([]);
    expect(getOpenTiers("subclass", 8, [pick("subclass", 3), pick("subclass", 4)])).toEqual([]);
  });

  it("marks traits until the next tier", () => {
    const character = baseCharacter();
    character.levelUps = [levelUp([pick("traits", 2, { traits: ["agility", "finesse"] }), pick("hp", 2)])];
    expect(getMarkedTraits(character.levelUps, 3)).toEqual(["agility", "finesse"]);
    expect(getMarkedTraits(character.levelUps, 4)).toEqual(["agility", "finesse"]);
    expect(getMarkedTraits([...character.levelUps, levelUp([]), levelUp([])], 5)).toEqual([]);
  });
});

describe("validating a level-up", () => {
  const character = baseCharacter();

  it("accepts a complete level 2", () => {
    expect(validateLevelUp(character, simple(2, character), 2, [])).toEqual([]);
  });

  it("requires a new Experience at the tier achievement levels only", () => {
    const noName = { ...simple(2, character), experience: " " };
    expect(validateLevelUp(character, noName, 2, [])).toContain("Name your new Experience.");
    const level3Character = history(2);
    expect(validateLevelUp(level3Character, simple(3, level3Character), 3, level3Character.levelUps)).toEqual([]);
  });

  it("requires exactly two advancements", () => {
    expect(validateLevelUp(character, { ...simple(2, character), picks: [pick("hp", 2)] }, 2, [])).toContain("Choose exactly two advancements.");
    const three = { ...simple(2, character), picks: [pick("hp", 2), pick("stress", 2), pick("evasion", 2)] };
    expect(validateLevelUp(character, three, 2, [])).toContain("Choose exactly two advancements.");
  });

  it("rejects raising a marked trait and a repeated trait", () => {
    const first = simple(2, character, []);
    first.picks = [pick("traits", 2, { traits: ["agility", "finesse"] }), pick("hp", 2)];
    const withFirst = { ...character, levelUps: [first] };
    const second = simple(3, withFirst, []);
    second.picks = [pick("traits", 2, { traits: ["agility", "strength"] }), pick("hp", 2)];
    expect(validateLevelUp(withFirst, second, 3, [first])).toContain("A marked trait can't be increased again until the next tier.");
    second.picks[0].traits = ["strength", "strength"];
    expect(validateLevelUp(withFirst, second, 3, [first])).toContain("Choose two different traits to increase.");
    second.picks[0].traits = ["strength", "instinct"];
    expect(validateLevelUp(withFirst, second, 3, [first])).toEqual([]);
  });

  it("makes Proficiency and Multiclass use both advancements", () => {
    const current = history(4);
    const solo = simple(5, current, []);
    solo.picks = [pick("proficiency", 3)];
    expect(validateLevelUp(current, solo, 5, current.levelUps)).toEqual([]);
    solo.picks = [pick("proficiency", 3), pick("hp", 3)];
    expect(validateLevelUp(current, solo, 5, current.levelUps)).toContain("Choose exactly two advancements.");
  });

  it("limits advancement cards by the slot's tier and the character's level", () => {
    const level5 = history(4);
    const tooHigh = cardsFor(bard.domains, 5)[0];
    const fine = cardsFor(bard.domains, 4).find((card) => !getProgress(level5).cardIds.includes(card.id));
    const attempt = (card, tier) => {
      const draft = simple(5, level5, []);
      const owned = getProgress(level5).cardIds;
      draft.domainCardId = cardsFor(bard.domains, 1).concat(cardsFor(bard.domains, 2)).find((c) => c.id !== card.id && !owned.includes(c.id)).id;
      draft.picks = [pick("domainCard", tier, { cardId: card.id }), pick("stress", 3)];
      return validateLevelUp(level5, draft, 5, level5.levelUps);
    };
    expect(attempt(tooHigh, 2)).toContain("Choose a valid additional domain card.");
    expect(attempt(tooHigh, 3)).toEqual([]);
    expect(attempt(fine, 2)).toEqual([]);
  });

  it("validates a multiclass choice and halves its domain access", () => {
    const levels = history(4);
    const wizard = CLASSES.find((item) => item.id === "warrior");
    const draft = simple(5, levels, []);
    draft.picks = [pick("multiclass", 3, { classId: "warrior", domain: wizard.domains[0], featureName: wizard.features[0].name, subclassId: wizard.subclasses[0].id })];
    expect(validateLevelUp(levels, draft, 5, levels.levelUps)).toEqual([]);

    const bad = { ...draft, picks: [{ ...draft.picks[0], domain: bard.domains[0] }] };
    expect(validateLevelUp(levels, bad, 5, levels.levelUps).join()).toMatch(/domains that you don't already have/);
    const same = { ...draft, picks: [{ ...draft.picks[0], classId: "bard" }] };
    expect(validateLevelUp(levels, same, 5, levels.levelUps).join()).toMatch(/different class/);

    const after = { ...levels, levelUps: [...levels.levelUps, draft] };
    const access = cardsFor([wizard.domains[0]], 3);
    // At level 5, half-level (3) cards from the multiclass domain are allowed; level 4+ are not.
    const next = simple(6, after, []);
    next.picks = [pick("hp", 3), pick("stress", 3)];
    next.domainCardId = access[0].id;
    expect(validateLevelUp(after, next, 6, after.levelUps)).toEqual([]);
    next.domainCardId = cardsFor([wizard.domains[0]], 4)[0].id;
    expect(validateLevelUp(after, next, 6, after.levelUps)).toContain("Choose a new domain card.");
  });

  it("lets a card be exchanged for one of the same level or lower", () => {
    const draft = simple(2, baseCharacter());
    const owned = baseCharacter().domainCardIds;
    const replacement = cardsFor(bard.domains, 1).find((card) => !owned.includes(card.id));
    draft.exchange = { fromId: owned[0], toId: replacement.id };
    draft.domainCardId = cardsFor(bard.domains, 2)[0].id;
    expect(validateLevelUp(baseCharacter(), draft, 2, [])).toEqual([]);
    draft.exchange = { fromId: owned[0], toId: cardsFor(bard.domains, 2)[1].id };
    expect(validateLevelUp(baseCharacter(), draft, 2, [])).toContain("Exchange for a different card of the same level or lower.");
    draft.exchange = { fromId: "nope", toId: replacement.id };
    expect(validateLevelUp(baseCharacter(), draft, 2, [])).toContain("Choose a domain card you own to exchange.");
  });
});

describe("validating the whole history", () => {
  it("prefixes problems with their level and accepts an empty draft shape", () => {
    const character = baseCharacter();
    character.levelUps = [emptyLevelUp()];
    const errors = validateLevelUps(character);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every((message) => message.startsWith("Level 2: "))).toBe(true);
  });

  it("accepts a valid run up to level 6", () => {
    expect(validateLevelUps(history(6))).toEqual([]);
  });

  it("flags a level that reuses an exhausted slot", () => {
    let character = history(3);
    character = { ...character, levelUps: [...character.levelUps, simple(4, character, ["hp", "stress"])] };
    expect(validateLevelUps(character).join()).toMatch(/Level 4: .*isn't available/);
  });
});
