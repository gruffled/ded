import { CHARACTER_TRAITS, CLASSES, DOMAIN_CARDS } from "./characterData";
import { getTier } from "./utils";

export const MAX_LEVEL = 10;
export const MAX_HP_SLOTS = 12;
export const MAX_STRESS_SLOTS = 12;

// Levels that grant a tier achievement (a new Experience and +1 Proficiency).
export const TIER_ACHIEVEMENT_LEVELS = [2, 5, 8];
// Trait marks are cleared when a new tier starts.
const TRAIT_MARK_WINDOWS = [
  { from: 2, to: 4 },
  { from: 5, to: 7 },
  { from: 8, to: 10 },
];
// Highest domain card level an advancement slot of each tier can pick.
export const ADVANCEMENT_CARD_CAP = { 2: 4, 3: 7, 4: MAX_LEVEL };

// From the official Daggerheart character sheet. Options with `cost: 2` use
// both of a level's advancements and fill both of their slots at once.
export const ADVANCEMENT_OPTIONS = [
  { id: "traits", label: "Gain +1 to two unmarked traits and mark them", slots: 3, cost: 1, minTier: 2 },
  { id: "hp", label: "Permanently gain one Hit Point slot", slots: 2, cost: 1, minTier: 2 },
  { id: "stress", label: "Permanently gain one Stress slot", slots: 2, cost: 1, minTier: 2 },
  { id: "experiences", label: "Permanently gain +1 to two Experiences", slots: 1, cost: 1, minTier: 2 },
  { id: "domainCard", label: "Choose an additional domain card", slots: 1, cost: 1, minTier: 2 },
  { id: "evasion", label: "Permanently gain +1 to Evasion", slots: 1, cost: 1, minTier: 2 },
  { id: "subclass", label: "Take an upgraded subclass card", slots: 1, cost: 1, minTier: 3 },
  { id: "proficiency", label: "Increase your Proficiency by +1", slots: 2, cost: 2, minTier: 3 },
  { id: "multiclass", label: "Multiclass", slots: 2, cost: 2, minTier: 3 },
];

export const getOption = (id) => ADVANCEMENT_OPTIONS.find((option) => option.id === id);

export const emptyLevelUp = () => ({ experience: "", picks: [], domainCardId: "", exchange: null });

export const getLevel = (character) => 1 + (character.levelUps?.length ?? 0);

export const getCard = (id) => DOMAIN_CARDS.find((card) => card.id === id);

const getClass = (character) => CLASSES.find((item) => item.id === character.classId);

const achievesTier = (level) => TIER_ACHIEVEMENT_LEVELS.includes(level);

const markWindow = (level) => TRAIT_MARK_WINDOWS.find(({ from, to }) => level >= from && level <= to);

/** Domains a character can take cards from, with the highest card level for each. */
export const getDomainAccess = (character, level) => {
  const access = {};
  for (const domain of getClass(character)?.domains ?? []) access[domain] = level;
  const multiclass = findMulticlass(character.levelUps ?? []);
  if (multiclass?.domain && !(multiclass.domain in access)) {
    access[multiclass.domain] = Math.ceil(level / 2);
  }
  return access;
};

const findMulticlass = (levelUps) =>
  levelUps.flatMap((levelUp) => levelUp.picks).find((pick) => pick.option === "multiclass") ?? null;

/** Cards the character may take at `level` that they don't already own. */
export const getAvailableCards = (character, level, ownedIds, { cap = MAX_LEVEL } = {}) => {
  const access = getDomainAccess(character, level);
  return DOMAIN_CARDS.filter(
    (card) =>
      card.domain in access &&
      card.level <= Math.min(access[card.domain], cap) &&
      !ownedIds.includes(card.id)
  );
};

const cost = (pick) => getOption(pick.option)?.cost ?? 1;

const slotsUsed = (picks, optionId, tier) =>
  picks
    .filter((pick) => pick.option === optionId && pick.tier === tier)
    .reduce((total, pick) => total + cost(pick), 0);

/**
 * Tiers in which `optionId` can still be taken at `level`, given the picks
 * already made (in earlier levels and earlier in this one).
 */
export const getOpenTiers = (optionId, level, picks) => {
  const option = getOption(optionId);
  if (!option) return [];
  const currentTier = getTier(level);
  const tiers = [];
  for (let tier = Math.max(2, option.minTier); tier <= currentTier; tier += 1) {
    if (option.slots - slotsUsed(picks, optionId, tier) < option.cost) continue;
    // Each tier's upgrade slot is either a subclass card or the multiclass.
    if (optionId === "subclass" && slotsUsed(picks, "multiclass", tier) > 0) continue;
    if (optionId === "multiclass") {
      if (picks.some((pick) => pick.option === "multiclass")) continue;
      if (slotsUsed(picks, "subclass", tier) > 0) continue;
    }
    tiers.push(tier);
  }
  return tiers;
};

const allPicks = (levelUps) => levelUps.flatMap((levelUp) => levelUp.picks);

/** Experiences as they stand once the first `count` level-ups are applied. */
const buildExperiences = (character, levelUps) => {
  const experiences = character.experiences.map((experience) => ({ ...experience }));
  levelUps.forEach((levelUp, index) => {
    if (achievesTier(index + 2)) experiences.push({ name: levelUp.experience ?? "", modifier: 2 });
    for (const pick of levelUp.picks) {
      if (pick.option !== "experiences") continue;
      for (const target of pick.experiences ?? []) {
        if (experiences[target]) experiences[target].modifier += 1;
      }
    }
  });
  return experiences;
};

/** Everything a character's level-ups add up to. */
export const getProgress = (character) => {
  const levelUps = character.levelUps ?? [];
  const picks = allPicks(levelUps);
  const level = getLevel(character);
  const traits = Object.fromEntries(CHARACTER_TRAITS.map(({ id }) => [id, 0]));
  for (const pick of picks) {
    if (pick.option === "traits") for (const trait of pick.traits ?? []) if (trait in traits) traits[trait] += 1;
  }
  const count = (optionId) => picks.filter((pick) => pick.option === optionId).length;

  const cardIds = [...(character.domainCardIds ?? [])];
  for (const levelUp of levelUps) {
    if (levelUp.exchange?.fromId) {
      const index = cardIds.indexOf(levelUp.exchange.fromId);
      if (index >= 0) cardIds.splice(index, 1);
      if (levelUp.exchange.toId) cardIds.push(levelUp.exchange.toId);
    }
    if (levelUp.domainCardId) cardIds.push(levelUp.domainCardId);
    for (const pick of levelUp.picks) if (pick.option === "domainCard" && pick.cardId) cardIds.push(pick.cardId);
  }

  const upgrades = count("subclass");
  return {
    level,
    tier: getTier(level),
    proficiency: 1 + TIER_ACHIEVEMENT_LEVELS.filter((l) => l <= level).length + count("proficiency"),
    hitPoints: count("hp"),
    stress: count("stress"),
    evasion: count("evasion"),
    traits,
    experiences: buildExperiences(character, levelUps),
    cardIds,
    subclassUpgrades: ["specialization", "mastery"].slice(0, upgrades),
    multiclass: findMulticlass(levelUps),
  };
};

/** Trait ids that are marked (and so can't be raised again) at `level`. */
export const getMarkedTraits = (levelUps, level) => {
  const window = markWindow(level);
  if (!window) return [];
  return levelUps
    .slice(0, level - 2)
    .flatMap((levelUp, index) => (index + 2 >= window.from ? levelUp.picks : []))
    .filter((pick) => pick.option === "traits")
    .flatMap((pick) => pick.traits ?? []);
};

/** Effective trait modifiers: the assigned array plus level-up bonuses. */
export const getEffectiveTraits = (character) => {
  const bonuses = getProgress(character).traits;
  return Object.fromEntries(
    CHARACTER_TRAITS.map(({ id }) => [
      id,
      character.traits[id] === null || character.traits[id] === undefined ? null : character.traits[id] + bonuses[id],
    ])
  );
};

const validatePick = (character, pick, level, priorLevelUps, priorPicks, owned) => {
  const errors = [];
  const option = getOption(pick.option);
  const label = option?.label ?? "Advancement";
  const { traits = [], experiences = [] } = pick;
  const distinct = (list) => new Set(list).size === list.length;

  if (!option) return ["Unknown advancement."];
  if (!getOpenTiers(pick.option, level, priorPicks).includes(pick.tier)) {
    errors.push(`${label} isn't available.`);
    return errors;
  }
  if (pick.option === "traits") {
    const marked = [...getMarkedTraits(priorLevelUps, level), ...priorPicksInLevel(priorPicks, priorLevelUps)];
    if (traits.length !== 2 || !distinct(traits) || traits.some((trait) => !CHARACTER_TRAITS.some(({ id }) => id === trait))) {
      errors.push("Choose two different traits to increase.");
    } else if (traits.some((trait) => marked.includes(trait))) {
      errors.push("A marked trait can't be increased again until the next tier.");
    }
  }
  if (pick.option === "experiences") {
    const count = buildExperiences(character, priorLevelUps).length + (achievesTier(level) ? 1 : 0);
    if (experiences.length !== 2 || !distinct(experiences) || experiences.some((index) => !(index >= 0 && index < count))) {
      errors.push("Choose two different Experiences to increase.");
    }
  }
  if (pick.option === "domainCard") {
    const cards = getAvailableCards(character, level, owned, { cap: ADVANCEMENT_CARD_CAP[pick.tier] });
    if (!cards.some((card) => card.id === pick.cardId)) errors.push("Choose a valid additional domain card.");
  }
  if (pick.option === "multiclass") {
    const chosen = CLASSES.find((item) => item.id === pick.classId);
    const own = getClass(character);
    if (!chosen || chosen.id === own?.id) errors.push("Choose a different class to multiclass into.");
    else {
      if (!chosen.domains.includes(pick.domain) || own?.domains.includes(pick.domain)) errors.push("Choose one of the new class's domains that you don't already have.");
      if (!chosen.features.some((feature) => feature.name === pick.featureName)) errors.push("Choose a class feature from the new class.");
      if (!chosen.subclasses.some((subclass) => subclass.id === pick.subclassId)) errors.push("Choose a subclass foundation from the new class.");
    }
  }
  return errors;
};

// Traits marked by the picks already made within the level being validated.
const priorPicksInLevel = (priorPicks, priorLevelUps) =>
  priorPicks
    .slice(allPicks(priorLevelUps).length)
    .filter((pick) => pick.option === "traits")
    .flatMap((pick) => pick.traits ?? []);

/** Validate one level-up (to level `level`) against the earlier ones. */
export const validateLevelUp = (character, levelUp, level, priorLevelUps) => {
  const errors = [];
  if (level < 2 || level > MAX_LEVEL) return ["Characters can't go beyond level 10."];
  if (achievesTier(level) && !(levelUp.experience ?? "").trim()) errors.push("Name your new Experience.");

  const totalCost = levelUp.picks.reduce((sum, pick) => sum + cost(pick), 0);
  if (totalCost !== 2) errors.push("Choose exactly two advancements.");

  // Replay the picks in order so each sees the ones before it. Card access
  // only counts a multiclass taken before this level.
  const prior = { ...character, levelUps: priorLevelUps };
  const base = allPicks(priorLevelUps);
  const soFar = [...base];
  let owned = getProgress({ ...character, levelUps: priorLevelUps }).cardIds;
  for (const pick of levelUp.picks) {
    errors.push(...validatePick(prior, pick, level, priorLevelUps, soFar, owned));
    soFar.push(pick);
    if (pick.option === "domainCard" && pick.cardId) owned = [...owned, pick.cardId];
  }

  const exchange = levelUp.exchange;
  if (exchange?.fromId || exchange?.toId) {
    const from = getCard(exchange.fromId);
    const to = getCard(exchange.toId);
    const pending = { ...character, levelUps: [...priorLevelUps, { ...levelUp, exchange: null }] };
    const ownedBefore = getProgress(pending).cardIds;
    const accessible = getAvailableCards(pending, level, ownedBefore);
    if (!from || !ownedBefore.includes(from.id)) errors.push("Choose a domain card you own to exchange.");
    else if (!to || to.level > from.level || !accessible.some((card) => card.id === to.id)) {
      errors.push("Exchange for a different card of the same level or lower.");
    }
  }

  const withPicks = { ...character, levelUps: [...priorLevelUps, { ...levelUp, domainCardId: "" }] };
  const eligible = getAvailableCards(withPicks, level, getProgress(withPicks).cardIds);
  if (!eligible.some((card) => card.id === levelUp.domainCardId)) errors.push("Choose a new domain card.");
  return errors;
};

/** Validate every level-up in order; returns messages prefixed with the level. */
export const validateLevelUps = (character) => {
  const levelUps = character.levelUps ?? [];
  const errors = [];
  levelUps.forEach((levelUp, index) => {
    const level = index + 2;
    for (const message of validateLevelUp(character, levelUp, level, levelUps.slice(0, index))) {
      errors.push(`Level ${level}: ${message}`);
    }
  });
  return errors;
};
