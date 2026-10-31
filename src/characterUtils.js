import {
  ARMOR,
  CHARACTER_TRAITS,
  CLASSES,
  LEVEL_ONE_DOMAIN_CARDS,
  PRIMARY_WEAPONS,
  STANDARD_INVENTORY,
  TRAIT_ARRAY,
} from "./characterData";

export const initialTraits = () =>
  Object.fromEntries(CHARACTER_TRAITS.map(({ id }) => [id, null]));

export const createInitialCharacter = () => ({
  name: "",
  pronouns: "",
  description: "",
  level: 1,
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

export const getSelectedDomainCards = (character) =>
  LEVEL_ONE_DOMAIN_CARDS.filter((card) => character.domainCardIds.includes(card.id));

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
  return {
    level: character.level,
    evasion: (selectedClass?.evasion ?? 0) + evasionBonus,
    hitPoints: (selectedClass?.hp ?? 0) + hitPointBonus,
    stress: 6 + stressBonus,
    hope: 2,
    proficiency: 1,
    armorScore: (selectedArmor ? armorData.baseScore : 0) + armorScoreBonus,
    majorThreshold: (selectedArmor ? armorData.baseMajor + character.level : character.level) + thresholdBonus,
    severeThreshold: (selectedArmor ? armorData.baseSevere + character.level : character.level * 2) + thresholdBonus,
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

  character.level = Number.isInteger(source.level) ? source.level : defaults.level;
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
