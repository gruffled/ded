import { describe, expect, it } from "vitest";
import { CHARACTER_TRAITS, CLASSES, LEVEL_ONE_DOMAIN_CARDS } from "./characterData";
import { createInitialCharacter, getDerivedStats, parseCharacter, serializeCharacter, validateCharacter } from "./characterUtils";
import {
  ADVANCEMENT_CARD_CAP,
  ADVANCEMENT_OPTIONS,
  MAX_HP_SLOTS,
  MAX_LEVEL,
  MAX_STRESS_SLOTS,
  getAvailableCards,
  getEffectiveTraits,
  getMarkedTraits,
  getOpenTiers,
  getProgress,
  validateLevelUp,
  validateLevelUps,
} from "./levelUp";
import { ARMOR } from "./characterData";

// Small deterministic PRNG so failures are reproducible from the seed.
const mulberry32 = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const startingCharacter = (classId) => {
  const characterClass = CLASSES.find((item) => item.id === classId);
  return {
    ...createInitialCharacter(),
    name: "Sim",
    classId,
    subclassId: characterClass.subclasses[0].id,
    traits: { agility: 2, strength: 1, finesse: 1, instinct: 0, presence: 0, knowledge: -1 },
    experiences: [{ name: "One", modifier: 2 }, { name: "Two", modifier: 2 }],
    domainCardIds: LEVEL_ONE_DOMAIN_CARDS.filter((card) => characterClass.domains.includes(card.domain)).slice(0, 2).map((card) => card.id),
  };
};

const pickOne = (random, list) => list[Math.floor(random() * list.length)];

/** Build a random but rules-abiding level-up by only using what the rules offer. */
const planLevelUp = (character, level, random) => {
  const levelUps = character.levelUps ?? [];
  const own = CLASSES.find((item) => item.id === character.classId);
  const picks = [];
  const owned = [...getProgress(character).cardIds];
  const experienceCount = getProgress(character).experiences.length + ([2, 5, 8].includes(level) ? 1 : 0);
  let spent = 0;

  for (let attempt = 0; attempt < 40 && spent < 2; attempt += 1) {
    const option = pickOne(random, ADVANCEMENT_OPTIONS);
    if (spent + option.cost > 2) continue;
    const prior = [...levelUps.flatMap((entry) => entry.picks), ...picks];
    const [tier] = getOpenTiers(option.id, level, prior);
    if (tier === undefined) continue;
    const pick = { option: option.id, tier };

    if (option.id === "traits") {
      const marked = [...getMarkedTraits(levelUps, level), ...picks.filter((p) => p.option === "traits").flatMap((p) => p.traits)];
      const free = CHARACTER_TRAITS.map(({ id }) => id).filter((id) => !marked.includes(id));
      if (free.length < 2) continue;
      pick.traits = [free[0], free[free.length - 1]];
    } else if (option.id === "experiences") {
      pick.experiences = [0, experienceCount - 1];
    } else if (option.id === "domainCard") {
      const cards = getAvailableCards({ ...character, levelUps }, level, owned, { cap: ADVANCEMENT_CARD_CAP[tier] });
      if (cards.length === 0) continue;
      pick.cardId = pickOne(random, cards).id;
      owned.push(pick.cardId);
    } else if (option.id === "multiclass") {
      const choice = pickOne(random, CLASSES.filter((item) => item.id !== own.id && item.domains.some((d) => !own.domains.includes(d))));
      pick.classId = choice.id;
      pick.domain = choice.domains.find((d) => !own.domains.includes(d));
      pick.featureName = pickOne(random, choice.features).name;
      pick.subclassId = pickOne(random, choice.subclasses).id;
    }
    picks.push(pick);
    spent += option.cost;
  }
  if (spent !== 2) return null;

  const draft = { experience: [2, 5, 8].includes(level) ? `Exp ${level}` : "", picks, domainCardId: "", exchange: null };
  const withPicks = { ...character, levelUps: [...levelUps, draft] };
  const cards = getAvailableCards(withPicks, level, getProgress(withPicks).cardIds);
  if (cards.length === 0) return null;
  draft.domainCardId = pickOne(random, cards).id;
  return draft;
};

const simulate = (classId, seed) => {
  const random = mulberry32(seed);
  let character = startingCharacter(classId);
  const log = [];
  for (let level = 2; level <= MAX_LEVEL; level += 1) {
    const draft = planLevelUp(character, level, random);
    if (!draft) return { character, log, stuckAt: level };
    const errors = validateLevelUp(character, draft, level, character.levelUps ?? []);
    log.push({ level, errors, draft });
    character = { ...character, levelUps: [...(character.levelUps ?? []), draft], level };
  }
  return { character, log, stuckAt: null };
};

const SEEDS = Array.from({ length: 30 }, (_, index) => index + 1);

describe("level-up simulation", () => {
  it.each(SEEDS)("seed %i reaches level 10 with every level-up valid", (seed) => {
    const classId = CLASSES[seed % CLASSES.length].id;
    const { character, log, stuckAt } = simulate(classId, seed);
    expect(stuckAt, `ran out of legal level-ups at level ${stuckAt}`).toBeNull();
    for (const entry of log) expect(entry.errors, `level ${entry.level}`).toEqual([]);
    expect(validateLevelUps(character)).toEqual([]);
  });

  it.each(SEEDS)("seed %i never exceeds a slot, cap or tier limit", (seed) => {
    const { character } = simulate(CLASSES[seed % CLASSES.length].id, seed);
    const picks = character.levelUps.flatMap((entry) => entry.picks);
    const progress = getProgress(character);

    for (const option of ADVANCEMENT_OPTIONS) {
      for (const tier of [2, 3, 4]) {
        const used = picks.filter((pick) => pick.option === option.id && pick.tier === tier).length * option.cost;
        expect(used, `${option.id} tier ${tier}`).toBeLessThanOrEqual(option.slots);
      }
      if (option.minTier > 2) {
        expect(picks.filter((pick) => pick.option === option.id).every((pick) => pick.tier >= option.minTier), option.id).toBe(true);
      }
    }
    expect(picks.filter((pick) => pick.option === "multiclass").length).toBeLessThanOrEqual(1);
    expect(picks.filter((pick) => pick.option === "subclass").length).toBeLessThanOrEqual(2);
    for (const tier of [3, 4]) {
      const upgrades = picks.filter((pick) => ["subclass", "multiclass"].includes(pick.option) && pick.tier === tier);
      expect(upgrades.length, `tier ${tier} upgrade slot`).toBeLessThanOrEqual(1);
    }

    expect(progress.level).toBe(10);
    expect(progress.tier).toBe(4);
    const proficiencyPicks = picks.filter((pick) => pick.option === "proficiency").length;
    expect(progress.proficiency).toBe(1 + 3 + proficiencyPicks);
    expect(progress.experiences).toHaveLength(2 + 3);
    expect(progress.cardIds).toHaveLength(new Set(progress.cardIds).size);
    // 2 starting cards + a card each level + extra-card advancements.
    expect(progress.cardIds).toHaveLength(2 + 9 + picks.filter((pick) => pick.option === "domainCard").length);
  });

  it.each(SEEDS)("seed %i produces coherent stats and survives export/import", (seed) => {
    const classId = CLASSES[seed % CLASSES.length].id;
    const { character } = simulate(classId, seed);
    const sheet = { ...character, armorId: ARMOR.find((item) => item.tier === 4).id };
    const stats = getDerivedStats(sheet, CLASSES, ARMOR);
    expect(stats.level).toBe(10);
    expect(stats.hitPoints).toBeLessThanOrEqual(MAX_HP_SLOTS);
    expect(stats.stress).toBeLessThanOrEqual(MAX_STRESS_SLOTS);

    const traitTotal = Object.values(getEffectiveTraits(character)).reduce((sum, value) => sum + value, 0);
    const traitPicks = character.levelUps.flatMap((entry) => entry.picks).filter((pick) => pick.option === "traits").length;
    expect(traitTotal).toBe(3 + traitPicks * 2);

    const restored = parseCharacter(serializeCharacter(character));
    expect(restored).toEqual(character);
    expect(validateCharacter({ ...restored, level: 10 }).filter((message) => message.startsWith("Level "))).toEqual([]);
  });

  it("actually exercises every advancement option across the seeds", () => {
    const seen = new Set();
    for (const seed of SEEDS) {
      const { character } = simulate(CLASSES[seed % CLASSES.length].id, seed);
      for (const entry of character.levelUps) for (const pick of entry.picks) seen.add(pick.option);
    }
    expect([...seen].sort()).toEqual(ADVANCEMENT_OPTIONS.map((option) => option.id).sort());
  });

  it("is deterministic for a given seed", () => {
    expect(simulate("bard", 7).character).toEqual(simulate("bard", 7).character);
  });
});
