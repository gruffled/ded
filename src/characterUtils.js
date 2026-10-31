import {
  ARMOR,
  CHARACTER_TRAITS,
  CLASSES,
  LEVEL_ONE_DOMAIN_CARDS,
  PRIMARY_WEAPONS,
  SECONDARY_WEAPONS,
  STANDARD_INVENTORY,
  TRAIT_ARRAY,
} from "./characterData";
import {
  MAX_HP_SLOTS,
  MAX_LEVEL,
  MAX_STRESS_SLOTS,
  getCard,
  getLevel,
  getOption,
  getProgress,
  validateLevelUps,
} from "./levelUp";
import { getTier } from "./utils";

export const initialTraits = () =>
  Object.fromEntries(CHARACTER_TRAITS.map(({ id }) => [id, null]));

export const createInitialCharacter = () => ({
  name: "",
  pronouns: "",
  description: "",
  level: 1,
  levelUps: [],
  classId: "",
  subclassId: "",
  ancestryIds: [],
  ancestryFeatureSources: [0, 1],
  communityId: "",
  traits: initialTraits(),
  primaryWeaponId: "",
  secondaryWeaponId: "",
  armorId: "",
  potion: "Minor Health Potion",
  classItem: "",
  experiences: [
    { name: "", modifier: 2 },
    { name: "", modifier: 2 },
  ],
  domainCardIds: [],
  backgroundAnswers: ["", "", ""],
  connections: [],
  inventory: [...STANDARD_INVENTORY],
});

export const isValidTraitAssignment = (traits) =>
  CHARACTER_TRAITS.map(({ id }) => traits[id]).sort((a, b) => b - a).join(",") ===
  [...TRAIT_ARRAY].sort((a, b) => b - a).join(",");

/** Every domain card the character owns, level-1 picks first. */
export const getSelectedDomainCards = (character) =>
  getProgress(character).cardIds.map(getCard).filter(Boolean);

export const getDerivedStats = (character, classes, armor) => {
  const selectedClass = classes.find((item) => item.id === character.classId);
  const selectedArmor = armor.find((item) => item.id === character.armorId);
  const armorData = selectedArmor ?? ARMOR[0];
  const ancestryIds = character.ancestryIds ?? [];
  const ancestryHas = (id) => ancestryIds.includes(id);
  const armorScoreBonus = ancestryHas("earthkin") ? 1 : 0;
  const evasionBonus = ancestryHas("simiah") ? 1 : 0;
  const hitPointBonus = ancestryHas("giant") ? 1 : 0;
  const stressBonus = ancestryHas("human") ? 1 : 0;
  const thresholdBonus = ancestryHas("earthkin") ? 1 : 0;
  const progress = getProgress(character);
  const level = progress.level;
  return {
    level,
    evasion: (selectedClass?.evasion ?? 0) + evasionBonus + progress.evasion,
    hitPoints: Math.min(MAX_HP_SLOTS, (selectedClass?.hp ?? 0) + hitPointBonus + progress.hitPoints),
    stress: Math.min(MAX_STRESS_SLOTS, 6 + stressBonus + progress.stress),
    hope: 2,
    proficiency: progress.proficiency,
    armorScore: (selectedArmor ? armorData.baseScore : 0) + armorScoreBonus,
    majorThreshold: (selectedArmor ? armorData.baseMajor + level : level) + thresholdBonus,
    severeThreshold: (selectedArmor ? armorData.baseSevere + level : level * 2) + thresholdBonus,
  };
};

export const validateCharacter = (character) => {
  const errors = [];
  if (!character.name.trim()) errors.push("Give your character a name.");
  const selectedClass = CLASSES.find((item) => item.id === character.classId);
  const selectedPrimary = PRIMARY_WEAPONS.find((item) => item.id === character.primaryWeaponId);
  if (!selectedClass || !selectedClass.subclasses.some((item) => item.id === character.subclassId)) errors.push("Choose a class and subclass.");
  if (character.ancestryIds.length < 1 || character.ancestryIds.length > 2) errors.push("Choose one ancestry, or two for Mixed Ancestry.");
  if (character.ancestryIds.length === 2 && character.ancestryIds[0] === character.ancestryIds[1]) errors.push("Mixed Ancestry requires two different ancestries.");
  if (character.ancestryIds.length === 2 && ![[0, 1], [1, 0]].some((sources) => sources.every((value, index) => value === (character.ancestryFeatureSources ?? [0, 1])[index]))) errors.push("Choose one feature from each ancestry for Mixed Ancestry.");
  if (!character.communityId) errors.push("Choose a community.");
  if (!isValidTraitAssignment(character.traits)) errors.push("Assign the trait array +2, +1, +1, +0, +0, -1 exactly once.");
  if (!character.primaryWeaponId || !character.armorId) errors.push("Choose a primary weapon and armor.");
  if (selectedPrimary?.burden === 1 && !character.secondaryWeaponId) errors.push("Choose a secondary weapon with a one-handed primary, or choose a two-handed primary.");
  if (selectedPrimary?.burden === 2 && character.secondaryWeaponId) errors.push("A two-handed primary weapon can't be paired with a secondary weapon.");
  if (character.experiences.some(({ name }) => !name.trim())) errors.push("Create two Experiences.");
  const selectedCards = LEVEL_ONE_DOMAIN_CARDS.filter((card) => character.domainCardIds.includes(card.id));
  if (character.domainCardIds.length !== 2 || selectedCards.length !== 2) errors.push("Choose exactly two level-1 domain cards.");
  if (selectedClass && selectedCards.some((card) => !selectedClass.domains.includes(card.domain))) errors.push("Choose domain cards from your class’s two domains.");
  const tier = getTier(getLevel(character));
  const gear = [
    [PRIMARY_WEAPONS, character.primaryWeaponId],
    [SECONDARY_WEAPONS, character.secondaryWeaponId],
    [ARMOR, character.armorId],
  ];
  if (gear.some(([list, id]) => (list.find((item) => item.id === id)?.tier ?? 0) > tier)) {
    errors.push("You can't equip weapons or armor of a higher tier than your own.");
  }
  errors.push(...validateLevelUps(character));
  return errors;
};

export const serializeCharacter = (character) => JSON.stringify({
  format: "daggerheart-character",
  version: 1,
  character,
}, null, 2);

const sameShape = (value, fallback) =>
  Array.isArray(fallback)
    ? Array.isArray(value)
    : typeof value === typeof fallback && value !== null;

const stringList = (value, fallback) =>
  Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : fallback;

const text = (value) => (typeof value === "string" ? value : "");
const strings = (value) => (Array.isArray(value) ? value.filter((item) => typeof item === "string") : []);
const integers = (value) => (Array.isArray(value) ? value.filter(Number.isInteger) : []);

const sanitizePick = (pick) => {
  const base = { option: pick.option, tier: Number.isInteger(pick.tier) ? pick.tier : 0 };
  if (pick.option === "traits") return { ...base, traits: strings(pick.traits) };
  if (pick.option === "experiences") return { ...base, experiences: integers(pick.experiences) };
  if (pick.option === "domainCard") return { ...base, cardId: text(pick.cardId) };
  if (pick.option === "multiclass") {
    return {
      ...base,
      classId: text(pick.classId),
      domain: text(pick.domain),
      featureName: text(pick.featureName),
      subclassId: text(pick.subclassId),
    };
  }
  return base;
};

const sanitizeLevelUps = (value) =>
  (Array.isArray(value) ? value : []).slice(0, MAX_LEVEL - 1).map((entry) => {
    const source = entry && typeof entry === "object" ? entry : {};
    const exchange = source.exchange && typeof source.exchange === "object" ? source.exchange : null;
    return {
      experience: text(source.experience),
      picks: (Array.isArray(source.picks) ? source.picks : [])
        .filter((pick) => pick && typeof pick === "object" && getOption(pick.option))
        .map(sanitizePick),
      domainCardId: text(source.domainCardId),
      exchange: exchange ? { fromId: text(exchange.fromId), toId: text(exchange.toId) } : null,
    };
  });

/**
 * Parse an exported/stored character. Imported files are untrusted, so every
 * field is checked against the shape of a fresh character and anything that
 * does not match falls back to its default instead of crashing the UI.
 */
export const parseCharacter = (raw) => {
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (parsed?.format !== "daggerheart-character" || parsed?.version !== 1 || !parsed.character) {
    throw new Error("This is not a supported Daggerheart character file.");
  }
  const source = parsed.character;
  const defaults = createInitialCharacter();
  const character = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (sameShape(source[key], defaults[key])) character[key] = source[key];
  }
  if (typeof source.id === "string") character.id = source.id;
  if (typeof source.updatedAt === "string") character.updatedAt = source.updatedAt;

  for (const key of ["ancestryIds", "domainCardIds", "backgroundAnswers", "inventory"]) {
    character[key] = stringList(source[key], defaults[key]);
  }
  character.ancestryFeatureSources =
    Array.isArray(source.ancestryFeatureSources) &&
    source.ancestryFeatureSources.length === 2 &&
    source.ancestryFeatureSources.every((value) => value === 0 || value === 1)
      ? source.ancestryFeatureSources
      : defaults.ancestryFeatureSources;
  character.experiences = defaults.experiences.map((fallback, index) => {
    const experience = Array.isArray(source.experiences) ? source.experiences[index] : null;
    return {
      name: typeof experience?.name === "string" ? experience.name : fallback.name,
      modifier: Number.isFinite(experience?.modifier) ? experience.modifier : fallback.modifier,
    };
  });
  character.levelUps = sanitizeLevelUps(source.levelUps);
  character.level = getLevel(character);
  character.connections = Array.isArray(source.connections)
    ? source.connections.filter((item) => item && typeof item === "object")
    : defaults.connections;
  character.traits = Object.fromEntries(
    Object.entries(initialTraits()).map(([id, fallback]) => [
      id,
      Number.isFinite(source.traits?.[id]) ? source.traits[id] : fallback,
    ])
  );
  return character;
};
