import ancestries from "./data/ancestries.json";
import classes from "./data/classes.json";
import communities from "./data/communities.json";
import domainCards from "./data/domain-cards.json";
import equipment from "./data/equipment.json";

export const CHARACTER_TRAITS = [
  { id: "agility", name: "Agility" },
  { id: "strength", name: "Strength" },
  { id: "finesse", name: "Finesse" },
  { id: "instinct", name: "Instinct" },
  { id: "presence", name: "Presence" },
  { id: "knowledge", name: "Knowledge" },
];

export const TRAIT_ARRAY = [2, 1, 1, 0, 0, -1];

// Classes, ancestries and communities are generated from the SRD by
// scripts/character_extractor.py.
const featureText = (features) =>
  features.map(({ name, description }) => `${name}: ${description}`).join("\n");

export const CLASSES = classes.map((item) => ({
  id: item.id,
  name: item.name,
  domains: item.domains,
  evasion: item.evasion,
  hp: item.hitPoints,
  items: item.classItems,
  hopeFeature: item.hopeFeature,
  features: item.features,
  backgroundQuestions: item.backgroundQuestions,
  connections: item.connections,
  subclasses: item.subclasses.map((subclass) => ({
    ...subclass,
    foundation: {
      features: subclass.foundation,
      description: featureText(subclass.foundation),
    },
  })),
}));

export const ANCESTRIES = ancestries;

export const COMMUNITIES = communities;

// Equipment for every tier, generated from the SRD by scripts/equipment_extractor.py.
export const PRIMARY_WEAPONS = equipment.primaryWeapons;

export const SECONDARY_WEAPONS = equipment.secondaryWeapons;

export const ARMOR = equipment.armor;

// Generated from the SRD by scripts/domain_card_extractor.py.
export const DOMAIN_CARDS = domainCards.map((card) => ({
  ...card,
  id: card.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
}));

export const LEVEL_ONE_DOMAIN_CARDS = DOMAIN_CARDS.filter((card) => card.level === 1);

export const STANDARD_INVENTORY = [
  "Torch",
  "50 feet of rope",
  "Basic supplies",
  "Handful of gold",
];

export const EXPERIENCE_EXAMPLES = ["Blacksmith", "Bodyguard", "Scholar", "Sellsword", "Storyteller", "Thief", "Navigator", "Survivalist", "Tactician", "World Traveler"];
