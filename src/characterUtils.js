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

export const parseCharacter = (raw) => {
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (parsed?.format !== "daggerheart-character" || parsed?.version !== 1 || !parsed.character) {
    throw new Error("This is not a supported Daggerheart character file.");
  }
  return {
    ...createInitialCharacter(),
    ...parsed.character,
    ancestryFeatureSources: parsed.character.ancestryFeatureSources ?? [0, 1],
    traits: { ...initialTraits(), ...parsed.character.traits },
  };
};
