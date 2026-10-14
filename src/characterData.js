export const CHARACTER_TRAITS = [
  { id: "agility", name: "Agility" },
  { id: "strength", name: "Strength" },
  { id: "finesse", name: "Finesse" },
  { id: "instinct", name: "Instinct" },
  { id: "presence", name: "Presence" },
  { id: "knowledge", name: "Knowledge" },
];

export const TRAIT_ARRAY = [2, 1, 1, 0, 0, -1];

const BASE_CLASSES = [
  { id: "assassin", name: "Assassin", domains: ["Blade", "Midnight"], evasion: 12, hp: 5, items: ["A list of names with several marked off", "A rusted blade inscribed with an insignia"], subclasses: [{ id: "executioners-guild", name: "Executioners Guild", spellcastTrait: "Agility" }, { id: "poisoners-guild", name: "Poisoners Guild", spellcastTrait: "Knowledge" }] },
  { id: "bard", name: "Bard", domains: ["Grace", "Codex"], evasion: 10, hp: 5, items: ["A romance novel", "A letter never opened"], subclasses: [{ id: "troubadour", name: "Troubadour", spellcastTrait: "Presence" }, { id: "wordsmith", name: "Wordsmith", spellcastTrait: "Presence" }] },
  { id: "brawler", name: "Brawler", domains: ["Valor", "Bone"], evasion: 10, hp: 6, items: ["Hand wraps from a mentor", "A book about your secret hobby"], subclasses: [{ id: "juggernaut", name: "Juggernaut" }, { id: "martial-artist", name: "Martial Artist" }] },
  { id: "druid", name: "Druid", domains: ["Sage", "Arcana"], evasion: 10, hp: 6, items: ["A small bag of rocks and bones", "A strange pendant found in the dirt"], subclasses: [{ id: "warden-elements", name: "Warden of the Elements", spellcastTrait: "Instinct" }, { id: "warden-renewal", name: "Warden of Renewal", spellcastTrait: "Instinct" }] },
  { id: "guardian", name: "Guardian", domains: ["Valor", "Blade"], evasion: 9, hp: 7, items: ["A totem from your mentor", "A secret key"], subclasses: [{ id: "stalwart", name: "Stalwart" }, { id: "vengeance", name: "Vengeance" }] },
  { id: "ranger", name: "Ranger", domains: ["Bone", "Sage"], evasion: 12, hp: 6, items: ["A trophy from your first kill", "A seemingly broken compass"], subclasses: [{ id: "beastbound", name: "Beastbound", spellcastTrait: "Agility" }, { id: "wayfinder", name: "Wayfinder", spellcastTrait: "Agility" }] },
  { id: "rogue", name: "Rogue", domains: ["Midnight", "Grace"], evasion: 12, hp: 6, items: ["A set of forgery tools", "A grappling hook"], subclasses: [{ id: "nightwalker", name: "Nightwalker", spellcastTrait: "Finesse" }, { id: "syndicate", name: "Syndicate", spellcastTrait: "Finesse" }] },
  { id: "seraph", name: "Seraph", domains: ["Splendor", "Valor"], evasion: 9, hp: 7, items: ["A bundle of offerings", "A sigil of your god"], subclasses: [{ id: "divine-wielder", name: "Divine Wielder", spellcastTrait: "Strength" }, { id: "winged-sentinel", name: "Winged Sentinel", spellcastTrait: "Strength" }] },
  { id: "sorcerer", name: "Sorcerer", domains: ["Arcana", "Midnight"], evasion: 10, hp: 6, items: ["A whispering orb", "A family heirloom"], subclasses: [{ id: "elemental-origin", name: "Elemental Origin", spellcastTrait: "Instinct" }, { id: "primal-origin", name: "Primal Origin", spellcastTrait: "Instinct" }] },
  { id: "warlock", name: "Warlock", domains: ["Dread", "Grace"], evasion: 11, hp: 5, items: ["A carving that symbolizes your patron", "A ring you can’t remove"], subclasses: [{ id: "pact-endless", name: "Pact of the Endless", spellcastTrait: "Presence" }, { id: "pact-wrathful", name: "Pact of the Wrathful", spellcastTrait: "Presence" }] },
  { id: "warrior", name: "Warrior", domains: ["Blade", "Bone"], evasion: 11, hp: 6, items: ["The drawing of a lover", "A sharpening stone"], subclasses: [{ id: "call-brave", name: "Call of the Brave" }, { id: "call-slayer", name: "Call of the Slayer" }] },
  { id: "witch", name: "Witch", domains: ["Sage", "Dread"], evasion: 10, hp: 6, items: ["A small, harmless pet", "A scrying stone"], subclasses: [{ id: "hedge-witch", name: "Hedge", spellcastTrait: "Knowledge" }, { id: "moon", name: "Moon", spellcastTrait: "Instinct" }] },
  { id: "wizard", name: "Wizard", domains: ["Codex", "Splendor"], evasion: 11, hp: 5, items: ["A book you’re trying to translate", "A tiny, harmless elemental pet"], subclasses: [{ id: "school-knowledge", name: "School of Knowledge", spellcastTrait: "Knowledge" }, { id: "school-war", name: "School of War", spellcastTrait: "Knowledge" }] },
];

const feature = (name, description) => ({ name, description });

const CLASS_DETAILS = {
  assassin: {
    hopeFeature: feature("Deadly Determination", "Spend 3 Hope to clear 2 Stress."),
    features: [feature("Marked for Death", "On a successful weapon attack, mark a Stress to mark the target. When you deal damage to a marked target, add d4s equal to your tier."), feature("Get In & Get Out", "Spend a Hope to ask the GM for a quick or inconspicuous way into or out of a place you can see. Your next roll acting on that information has advantage.")],
    backgroundQuestions: ["You once killed someone you were close to. What happened, and how did it change you?", "What organization trained you in the art of killing, and how did you become a member?", "Throughout your career, one target has eluded you. Who are they, and how have they slipped through your fingers?"],
    connections: ["I’ve killed someone for you. Who were they?", "How did you save me when I was on the brink of death? What have I promised you as repayment?", "What secret about myself did I tell you, and how did it change your view of me?"],
  },
  bard: {
    hopeFeature: feature("Make a Scene", "Spend 3 Hope to temporarily Distract a target within Close range, giving them a -2 penalty to their Difficulty."),
    features: [feature("Rally", "Once per session, describe how you rally the party and give yourself and each ally a d6 Rally Die. A PC can spend it on an action, reaction, damage roll, or to clear Stress equal to the result.")],
    backgroundQuestions: ["Who from your community taught you to have such confidence in yourself?", "You were in love once. Who did you adore, and how did they hurt you?", "You’ve always looked up to another bard. Who are they, and why do you idolize them?"],
    connections: ["What made you realize we were going to be such good friends?", "What do I do that annoys you?", "Why do you grab my hand at night?"],
  },
  brawler: {
    hopeFeature: feature("Square Up", "Spend 3 Hope to intimidate a target within Close range, making them temporarily Vulnerable."),
    features: [feature("I Am the Weapon", "While you have no other Active Weapons, you have a Brawler’s Strike primary weapon using a trait of your choice, Melee range, and d8+d6 physical damage. You also gain +1 Evasion."), feature("Combo Strike", "After rolling damage on a successful Melee attack, mark a Stress to roll your Combo Die repeatedly, adding the descending results to the attack’s damage.")],
    backgroundQuestions: ["Where did you spend time during your formative years that taught you how to fight?", "What organization has vowed to kill you on sight, and what did you do to invoke their ire?", "Who did you recently lose a fight to that you’re desperate for a rematch against?"],
    connections: ["What is one thing we’re both afraid of?", "What do I rely on you for during our travels?", "I still haven’t forgiven you for something you said to me. What was it?"],
  },
  druid: {
    hopeFeature: feature("Evolution", "Spend 3 Hope to transform into a Beastform you know without marking Stress."),
    features: [feature("Beastform", "You can transform into a Beastform from your tier or lower. While transformed, use its trait, Evasion, damage thresholds, and features; your equipment is absorbed and you retain your HP, Stress, Hope, and class features."), feature("Wildtouch", "You can communicate with natural beasts and plants, and you can spend a Hope to gain advantage on a roll using your knowledge of nature.")],
    backgroundQuestions: ["What place in nature feels most like home to you?", "Which mentor or spirit taught you to respect the living world?", "What threat to the natural world are you determined to stop?"],
    connections: ["What creature do I remind you of?", "What part of the natural world do we protect together?", "What have I done that made you question my relationship with nature?"],
  },
  guardian: {
    hopeFeature: feature("Frontline Tank", "Spend 3 Hope to clear 2 Armor Slots."),
    features: [feature("Frontline Warrior", "When you succeed on an attack against a target within Melee range, you can mark a Stress to make them temporarily Vulnerable."), feature("Unstoppable", "You gain a permanent +1 bonus to your Severe damage threshold and can spend a Hope to stand firm against forced movement.")],
    backgroundQuestions: ["Who did you vow to protect, and why?", "What battle changed your understanding of strength?", "What do you fear you will fail to defend?"],
    connections: ["What promise did I make to protect you?", "What do you trust me to do when things go wrong?", "When did I first prove I would stand beside you?"],
  },
  ranger: {
    hopeFeature: feature("Hold Them Off", "Spend 3 Hope to make a successful attack against a target temporarily Vulnerable and push them to Far range."),
    features: [feature("Ranger’s Focus", "Mark a Stress to place a Focus token on a target you can see. When you deal damage to that target, spend Focus to add a d6 per token, then clear the tokens."), feature("Ruthless Predator", "When you succeed on an attack against a target with Ranger’s Focus, you can spend a Hope to add your Proficiency to the damage roll.")],
    backgroundQuestions: ["What creature or person did you track for the longest time?", "Who taught you to survive beyond the safety of a settlement?", "What trail are you still following?"],
    connections: ["What trail did we follow together?", "What part of the wilderness do you trust me to navigate?", "What do you know about my past that I have not told the others?"],
  },
  rogue: {
    hopeFeature: feature("Rogue’s Dodge", "Spend 3 Hope to gain a +2 bonus to your Evasion until the next time you’re hit."),
    features: [feature("Cloaked", "When you are out of sight, you can mark a Stress to become Hidden. While Hidden, you have advantage on your next attack and remain hidden until you make an attack or loud action."), feature("Lucky", "Once per session, after you roll a Fear, you can reroll it and must use the new result.")],
    backgroundQuestions: ["What did you steal that you still regret?", "Who taught you to move unseen?", "What powerful person wants you caught?"],
    connections: ["What secret did we keep together?", "Why do you trust me with your back turned?", "What did I steal for you?"],
  },
  seraph: {
    hopeFeature: feature("Life Support", "Spend 3 Hope to clear a Hit Point on yourself or an ally within Close range."),
    features: [feature("Prayer Dice", "At the beginning of each session, roll a number of d4s equal to your Presence and store them. Spend one to add its result to a roll by you or an ally within Close range."), feature("Beacons of Hope", "When you succeed with Hope, you can give the Hope to an ally within Close range instead of keeping it.")],
    backgroundQuestions: ["What power or ideal do you serve?", "What sign convinced you that you were chosen?", "What do you secretly doubt about your faith?"],
    connections: ["What blessing have I given you?", "What do you think my faith asks of me?", "What did you see me do that changed your view of my ideals?"],
  },
  sorcerer: {
    hopeFeature: feature("Volatile Magic", "Spend 3 Hope to reroll any number of damage dice on a spell, keeping the new results."),
    features: [feature("Channel Raw Power", "Once per session, mark a Stress to add your Spellcast trait to a damage roll or increase a spell’s range by one step."), feature("Arcane Sense", "You can sense active magic nearby and identify the domain or broad purpose of a magical effect with an Instinct Roll.")],
    backgroundQuestions: ["When did your magic first manifest?", "Who taught you to control your power?", "What magical effect do you wish you could undo?"],
    connections: ["When did my magic save you?", "What do you fear I will do with my power?", "What spell did we learn together?"],
  },
  warlock: {
    hopeFeature: feature("Patron’s Boon", "When you fail a roll, spend 3 Hope to reroll with advantage."),
    features: [feature("Patron’s Pact", "Choose a supernatural patron and its sphere of influence. Before a related action roll, spend Favor to add your Patron Die. You start with 3 Favor."), feature("Favor", "Use a downtime move to show tribute and gain Favor equal to your Spellcast trait, or gain Favor instead of Hope when you succeed with Hope. You can hold up to 6 Favor.")],
    backgroundQuestions: ["Who from your community shunned you after you made a pact?", "What desperate situation led you to pledge your life to your patron?", "What task has your patron given you above all else?"],
    connections: ["Why do you think I confide in you about my patron?", "What did you see when I showed tribute to my patron?", "What foolish thing did I do that you still remember?"],
  },
  warrior: {
    hopeFeature: feature("No Mercy", "Spend 3 Hope to gain +1 to attack rolls until your next rest."),
    features: [feature("Attack of Opportunity", "When an adversary within Melee range attempts to leave, make a reaction roll. On a success, stop them, deal primary-weapon damage, or move with them; choose two on a critical success."), feature("Combat Training", "Ignore burden when equipping weapons. When you deal physical damage, add your level to the damage roll.")],
    backgroundQuestions: ["Who taught you to fight, and why did they stay behind when you left home?", "Who defeated you in battle and left you to die?", "What legendary place have you always wanted to visit?"],
    connections: ["We knew each other long before this party. How?", "What mundane task do you help me with off the battlefield?", "What fear am I helping you overcome?"],
  },
  witch: {
    hopeFeature: feature("Witch’s Charm", "When you or an ally within Far range fails an action roll, spend 3 Hope to change it into a success with Fear instead."),
    features: [feature("Hex", "Mark a Stress to temporarily Hex a target within Far range. While Hexed, the target has a penalty to damage rolls and Difficulty equal to your tier."), feature("Commune", "Once per long rest during calm, ask an ancestor, deity, spirit, or otherworldly being a question and roll d6s equal to your Spellcast trait to learn how the answer appears.")],
    backgroundQuestions: ["Who from your community feared your magical craft?", "Who did you help with your power in a dire situation?", "What did your magic once open that should have stayed closed?"],
    connections: ["What ritual or practice have I taught you?", "What vision did I share with you in a dream?", "What do you come to me for advice about?"],
  },
  wizard: {
    hopeFeature: feature("Not This Time", "Spend 3 Hope to force an adversary within Far range to reroll an attack or damage roll."),
    features: [feature("Prestidigitation", "Perform harmless, subtle magical effects at will, such as changing a color, lighting a candle, floating a tiny object, or repairing a small object."), feature("Strange Patterns", "Choose a number from 1 to 12. When you roll that number on a Duality Die, gain a Hope or clear a Stress; change the number after a long rest.")],
    backgroundQuestions: ["What responsibility did your community count on you for, and how did you let them down?", "What book or object of great significance are you searching for?", "Who is your powerful rival, and why must you defeat them?"],
    connections: ["What favor have I asked of you?", "What weird hobby or fascination do we share?", "What secret have you entrusted only to me?"],
  },
};

const SUBCLASS_FOUNDATIONS = {
  "executioners-guild": feature("First Strike", "The first time in a scene you succeed on an attack, deal double damage. Your Marked for Death feature uses d6s instead of d4s."),
  "poisoners-guild": feature("Toxic Concoctions", "Mark a Stress to place 1d4+1 poison tokens. On a successful weapon attack, spend a token to inflict Ghost Petal, Grave Spore, or Leech Weed."),
  troubadour: feature("Gifted Performer", "Once per long rest, perform a relaxing, epic, or heartbreaking song to clear an HP, make a target Vulnerable, or grant Hope."),
  wordsmith: feature("Rousing Speech", "Once per long rest, give an inspiring speech; all allies within Far range clear 2 Stress. You can also spend Hope to add a d4 to a social action roll."),
  juggernaut: feature("Rugged", "Gain a permanent +3 bonus to your Severe damage threshold. On a successful attack, spend Hope to throw the target within Close or make them mark Stress."),
  "martial-artist": feature("Stance Fighter", "Take two Tier 1 martial stances. Each level, choose another stance from your tier or lower."),
  "warden-elements": feature("Elemental Incarnation", "Choose an element and a Beastform associated with it; while in that form, your attacks can channel the element."),
  "warden-renewal": feature("Regeneration", "Once per rest, mark a Stress to clear an HP on yourself or an ally within Close range."),
  stalwart: feature("Unwavering", "When you would mark 1 or more Armor Slots, you can mark a Stress instead to reduce the number of slots marked by one."),
  vengeance: feature("At Any Cost", "When an adversary within Melee range damages an ally, you can mark a Stress to gain advantage on your next attack against that adversary."),
  beastbound: feature("Companion", "Gain a loyal animal companion with its own attack and support features; it acts when you use an action to direct it."),
  wayfinder: feature("Ruthless", "When you succeed on a ranged attack, you can mark a Stress to deal extra damage equal to your Proficiency."),
  nightwalker: feature("Shadow Step", "Once per scene, spend a Hope to teleport between two areas of shadow within Far range."),
  syndicate: feature("Well Connected", "When you need information, name a criminal contact who can help; you have advantage on the first roll to leverage that connection."),
  "divine-wielder": feature("Sacred Weapon", "Choose a divine weapon. When you deal damage with it, you can spend Hope to add your Spellcast trait to the damage roll."),
  "winged-sentinel": feature("Wings of Light", "You can fly. When you land after flying, you can clear a Stress for yourself or an ally within Close range."),
  "elemental-origin": feature("Elemental Specialization", "Choose an element. Your spells can manifest that element and gain a related narrative benefit; mark Stress to intensify its effect."),
  "primal-origin": feature("Primal Power", "When you roll a spell with Fear, you can mark a Stress to add your Proficiency to the damage roll."),
  "pact-endless": feature("Patron’s Mantle", "Spend a Favor to cloak yourself in your patron’s aspect, gaining a bonus to damage thresholds equal to your tier and advantage to intimidate."),
  "pact-wrathful": feature("Patron’s Fury", "Spend a Favor to imbue your attacks with your patron’s power; while active, add Patron Dice equal to your tier to damage rolls."),
  "call-slayer": feature("Slayer", "On a roll with Hope, place a d6 Slayer Die instead of gaining Hope. Spend stored Slayer Dice on attack or damage rolls."),
  "call-brave": feature("Courage", "When you fail a roll with Fear, gain a Hope. Once per long rest, perform a battle ritual to clear 2 Stress and gain 2 Hope."),
  "hedge-witch": feature("Herbal Remedies", "When you or an ally clears HP or Stress from a consumable, increase the amount cleared by 1. Once per rest, imbue a talisman with Hope."),
  moon: feature("Night’s Glamour", "Make a Spellcast Roll (13) to Glamour yourself. While Glamoured, you have advantage on rolls leveraging your illusory appearance and nearby adversaries must mark Stress to attack you."),
  "school-knowledge": feature("Prepared", "Take an additional domain card of your level or lower from a domain you can access. When using an Experience, mark Stress instead of spending Hope to double its modifier."),
  "school-war": feature("Battlemage", "Gain an additional Hit Point slot. When you succeed with Fear on an attack roll, deal an extra 1d10 magic damage."),
};

export const CLASSES = BASE_CLASSES.map((item) => ({ ...item, ...CLASS_DETAILS[item.id], subclasses: item.subclasses.map((subclass) => ({
  ...subclass,
  foundation: SUBCLASS_FOUNDATIONS[subclass.id] ?? feature("Subclass Foundation", "Choose this subclass at character creation; its Foundation feature is always active."),
})) }));

const ancestry = (name, firstName, firstDescription, secondName, secondDescription, coreSetAvailable = true) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, coreSetAvailable,
  features: [feature(firstName, firstDescription), feature(secondName, secondDescription)],
});

export const ANCESTRIES = [
  ancestry("Aetheris", "Hallowed Aura", "Once per long rest, when an ally within Close range rolls with Fear, change it into Hope.", "Celestial Wings", "You can fly. Once per scene while flying, spend Hope instead of an Armor Slot.", false),
  ancestry("Clank", "Purposeful Design", "Decide who made you and why. At creation, choose a related Experience and permanently gain +1 to it.", "Efficient", "During a short rest, choose a long-rest downtime move instead of a short-rest move."),
  ancestry("Drakona", "Scales", "When you take Severe damage, mark a Stress to mark one fewer HP.", "Elemental Breath", "Choose an element. Target a creature or group within Very Close with an Instinct weapon attack that deals d8 magic damage using Proficiency."),
  ancestry("Dwarf", "Thick Skin", "When you take Minor damage, mark 2 Stress instead of marking an HP.", "Increased Fortitude", "Spend 3 Hope to halve incoming physical damage.", true),
  ancestry("Earthkin", "Stoneskin", "Permanently gain +1 Armor Score and increase both damage thresholds by 1 at creation.", "Immovable", "While touching the ground, you cannot be lifted or moved against your will.", false),
  ancestry("Elf", "Quick Reactions", "Mark a Stress to gain advantage on a reaction roll.", "Celestial Trance", "During a rest, enter a trance and choose one additional downtime move."),
  ancestry("Emberkin", "Fireproof", "You are immune to magical and mundane flame.", "Ignition", "Mark a Stress to wreathe your primary weapon in flame for the scene; it sheds bright light and deals +1d6 damage.", false),
  ancestry("Faerie", "Luckbender", "Once per session after you or a willing ally within Close rolls, spend 3 Hope to reroll the Duality Dice.", "Wings", "You can fly. While flying, after an adversary attacks you, mark a Stress to gain +2 Evasion against it."),
  ancestry("Faun", "Caprine Leap", "Leap anywhere within Close as normal movement and vault obstacles without a roll.", "Kick", "After a successful Melee attack, mark a Stress to deal +2d6 damage and knock yourself and the target to Very Close."),
  ancestry("Firbolg", "Charge", "After moving from Far or Very Far to Melee, mark a Stress on a successful Agility Roll to deal d12 physical damage to all targets in Melee.", "Unshakable", "When you mark Stress, roll a d6; on a 6, do not mark it."),
  ancestry("Fungril", "Fungril Network", "Make an Instinct Roll (12) to communicate across any distance with another Fungril.", "Death Connection", "Touch a recent corpse and mark a Stress to extract one memory, emotion, or sensation."),
  ancestry("Galapa", "Shell", "Gain bonus damage thresholds equal to your Proficiency.", "Retract", "Mark a Stress to retract into your shell, gaining resistance to physical damage but disadvantage on action rolls and no movement."),
  ancestry("Giant", "Endurance", "Gain one additional HP slot at character creation.", "Reach", "Treat your Melee range as Very Close."),
  ancestry("Gnome", "Nimble Fingers", "On a Finesse Roll, spend 2 Hope to reroll the Hope Die.", "Flicker Step", "Once per scene, teleport to a point you can see within Far range."),
  ancestry("Goblin", "Surefooted", "Ignore disadvantage on Agility Rolls.", "Danger Sense", "Once per rest, mark a Stress to force an adversary attacking you or an ally within Very Close to reroll."),
  ancestry("Halfling", "Luckbringer", "At the start of each session, everyone in the party gains Hope.", "Internal Compass", "When your Hope Die result is 1, reroll it."),
  ancestry("Human", "High Stamina", "Gain one additional Stress slot at character creation.", "Adaptability", "After failing a roll using an Experience, mark a Stress to reroll."),
  ancestry("Infernis", "Fearless", "When you roll with Fear, mark 2 Stress to change it into Hope.", "Dread Visage", "You have advantage on rolls to intimidate hostile creatures."),
  ancestry("Katari", "Feline Instincts", "On an Agility Roll, spend 2 Hope to reroll the Hope Die.", "Retracting Claws", "Make an Agility Roll to scratch a target in Melee; on a success, it becomes temporarily Vulnerable."),
  ancestry("Orc", "Sturdy", "When you have 1 HP, attacks against you have disadvantage.", "Tusks", "After a successful attack against a target in Melee, spend Hope to deal +1d6 damage."),
  ancestry("Ribbet", "Amphibious", "You can breathe and move underwater.", "Long Tongue", "Grab a target within Close, or mark a Stress to use your tongue as a d12 physical Close weapon using Proficiency."),
  ancestry("Simiah", "Natural Climber", "You have advantage on Agility Rolls to balance or climb.", "Nimble", "Permanently gain +1 Evasion at character creation."),
  ancestry("Skykin", "Gale Force", "Mark a Stress to carry yourself or an ally within Very Close on a gust to Very Far, or control a fall.", "Eye of the Storm", "Spend 2 Hope to grant yourself or an ally within Melee +1 Evasion until Severe damage is taken or this feature is used again.", false),
  ancestry("Tidekin", "Amphibious", "You can breathe and move underwater.", "Lifespring", "Once per rest near a small amount of water, mark a Stress to clear an HP on yourself or an ally within Very Close.", false),
];

const community = (name, adjectives, featureName, description, coreSetAvailable = true) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, adjectives, coreSetAvailable,
  feature: feature(featureName, description),
});

export const COMMUNITIES = [
  community("Duneborne", ["adaptable", "centered", "collaborative", "devoted", "cheerful", "observant"], "Oasis", "During a short rest, you or an ally can reroll the die used for a downtime move and take the higher result."),
  community("Freeborne", ["optimistic", "guarded", "courageous", "joyful", "subversive", "traumatized"], "Unbound", "Once per session when you roll with Fear, change it into Hope."),
  community("Frostborne", ["cunning", "gregarious", "intrepid", "purposeful", "quiet", "warm"], "Hardy", "When you take a rest, clear an HP."),
  community("Hearthborne", ["careful", "generous", "insular", "loquacious", "smiley", "traditional"], "Close-Knit", "Once per long rest, spend any Hope to grant an ally within Far range that much Hope."),
  community("Highborne", ["amiable", "candid", "conniving", "enterprising", "ostentatious", "unflappable"], "Privilege", "You have advantage when consorting with nobles, negotiating prices, or leveraging your reputation.", true),
  community("Loreborne", ["direct", "eloquent", "inquisitive", "patient", "rhapsodic", "witty"], "Well-Read", "You have advantage on rolls involving history, culture, politics, or a prominent person or place.", true),
  community("Orderborne", ["ambitious", "benevolent", "pensive", "prudent", "sardonic", "stoic"], "Dedicated", "Record three sayings or values. Once per rest, describe embodying one and roll a d20 as your Hope Die.", true),
  community("Reborne", ["curious", "hopeful", "innocent", "isolated", "mournful", "uncanny"], "Found Family", "Once per rest, spend Hope to use an ally’s Experience. You can trade a community card when you find or rediscover community."),
  community("Ridgeborne", ["bold", "hardy", "indomitable", "loyal", "reserved", "stubborn"], "Steady", "You have advantage traversing dangerous cliffs and ledges, navigating harsh environments, and recalling survival knowledge.", true),
  community("Seaborne", ["candid", "cooperative", "exuberant", "fierce", "resolute", "weathered"], "Know the Tide", "When you roll with Fear, add a Tide token. Before an action, spend any tokens to gain +1 per token; clear them at session end.", true),
  community("Slyborne", ["calculating", "clever", "formidable", "perceptive", "shrewd", "tenacious"], "Scoundrel", "You have advantage negotiating with criminals, detecting lies, and finding safe hiding places.", true),
  community("Underborne", ["composed", "elusive", "indomitable", "innovative", "resourceful", "unpretentious"], "Low-Light Living", "In low light or shadow, you have advantage to hide, investigate, and perceive.", true),
  community("Warborne", ["strategic", "devastated", "determined", "calculating", "unwavering", "devoted"], "Brave Face", "Once per session when forced to mark Stress, spend Hope instead."),
  community("Wanderborne", ["inscrutable", "magnanimous", "mirthful", "reliable", "savvy", "unorthodox"], "Nomadic Pack", "Add a Nomadic Pack to your inventory. Once per session, spend Hope to pull out a useful mundane item.", true),
  community("Wildborne", ["hardy", "loyal", "nurturing", "reclusive", "sagacious", "vibrant"], "Lightfoot", "You move silently and have advantage when attempting to move unheard.", true),
];

export const PRIMARY_WEAPONS = [
  ["Broadsword", "Agility", "Melee", "d8", 0, "physical", 1, "Reliable: +1 to attack rolls"],
  ["Katana", "Agility", "Melee", "d10", 3, "physical", 2, "Quick: mark a Stress to target another creature within range"],
  ["Longsword", "Agility", "Melee", "d10", 3, "physical", 2, ""],
  ["Battleaxe", "Strength", "Melee", "d10", 3, "physical", 2, ""],
  ["Brass Knuckles", "Strength", "Melee", "d8", 1, "physical", 1, ""],
  ["Greatsword", "Strength", "Melee", "d10", 3, "physical", 2, "Massive: -1 Evasion; roll an additional damage die and discard the lowest"],
  ["Mace", "Strength", "Melee", "d8", 1, "physical", 1, ""],
  ["Warhammer", "Strength", "Melee", "d12", 3, "physical", 2, "Heavy: -1 Evasion"],
  ["Dagger", "Finesse", "Melee", "d8", 1, "physical", 1, ""],
  ["Quarterstaff", "Instinct", "Melee", "d10", 3, "physical", 2, ""],
  ["Cutlass", "Presence", "Melee", "d8", 1, "physical", 1, ""],
  ["Rapier", "Presence", "Melee", "d8", 0, "physical", 1, "Quick: mark a Stress to target another creature within range"],
  ["Scimitar", "Presence", "Melee", "d8", 1, "physical", 1, ""],
  ["Twisted Dagger", "Knowledge", "Melee", "d8", 0, "physical", 1, "Piercing: -2 to the target’s Major threshold"],
  ["Halberd", "Strength", "Very Close", "d10", 2, "physical", 2, "Cumbersome: -1 Finesse"],
  ["Spear", "Finesse", "Very Close", "d8", 3, "physical", 2, ""],
  ["Whipsword", "Finesse", "Very Close", "d8", 0, "physical", 1, "Versatile: may also use Finesse, Melee, d10"],
  ["Rope Dart", "Instinct", "Close", "d6", 1, "physical", 2, ""],
  ["Shortbow", "Agility", "Far", "d6", 3, "physical", 2, ""],
  ["Crossbow", "Finesse", "Far", "d6", 1, "physical", 1, ""],
  ["Longbow", "Agility", "Very Far", "d8", 3, "physical", 2, "Cumbersome: -1 Finesse"],
].map(([name, trait, range, die, bonus, damageType, burden, feature]) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, category: "Primary", tier: 1, trait, range, die, bonus, damageType, burden, feature }));

export const SECONDARY_WEAPONS = [
  ["Dagger", "Finesse", "Melee", "d8", 1], ["Rapier", "Presence", "Melee", "d8", 0], ["Shortbow", "Agility", "Far", "d6", 3], ["Crossbow", "Finesse", "Far", "d6", 1], ["Hallowed Axe", "Strength", "Melee", "d8", 1], ["Hand Runes", "Instinct", "Very Close", "d10", 0],
].map(([name, trait, range, die, bonus]) => ({ id: `secondary-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, name, category: "Secondary", tier: 1, trait, range, die, bonus, damageType: "physical", burden: 1, feature: "" }));

export const ARMOR = [
  ["Mage Robes", 4, 10, 2, "Enchanted: add your Spellcast trait to damage thresholds"],
  ["Gambeson Armor", 5, 11, 3, "Flexible: +1 Evasion"],
  ["Brigandine Armor", 6, 12, 3, "Lined: mark a Stress to negate Minor damage"],
  ["Leather Armor", 6, 13, 3, ""],
  ["Scale Mail Armor", 7, 14, 3, "Cumbersome: -1 Finesse"],
  ["Chainmail Armor", 7, 15, 4, "Heavy: -1 Evasion"],
  ["Banded Armor", 8, 16, 4, "Bulky: -1 Evasion; mark a Stress when taking Severe damage"],
  ["Full Plate Armor", 8, 17, 4, "Very Heavy: -2 Evasion; -1 Agility"],
].map(([name, major, severe, score, feature]) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, tier: 1, baseMajor: major, baseSevere: severe, baseScore: score, feature }));

const BASE_LEVEL_ONE_DOMAIN_CARDS = [
  ["Rune Ward", "Arcana", "Spell", 0], ["Unleash Chaos", "Arcana", "Spell", 1], ["Wall Walk", "Arcana", "Spell", 1],
  ["Get Back Up", "Blade", "Ability", 1], ["Not Good Enough", "Blade", "Ability", 1], ["Whirlwind", "Blade", "Ability", 0],
  ["Deft Maneuvers", "Bone", "Ability", 0], ["I See It Coming", "Bone", "Ability", 1], ["Untouchable", "Bone", "Ability", 1],
  ["Book of Ava", "Codex", "Grimoire", 2], ["Book of Illiat", "Codex", "Grimoire", 2], ["Book of Tyfar", "Codex", "Grimoire", 2],
  ["Blighting Strike", "Dread", "Spell", 1], ["Umbral Veil", "Dread", "Spell", 1], ["Voice of Dread", "Dread", "Spell", 0],
  ["Deft Deceiver", "Grace", "Ability", 0], ["Enrapture", "Grace", "Spell", 0], ["Inspirational Words", "Grace", "Ability", 1], ["Pick and Pull", "Midnight", "Ability", 0], ["Rain of Blades", "Midnight", "Spell", 1], ["Uncanny Disguise", "Midnight", "Spell", 0],
  ["Gifted Tracker", "Sage", "Ability", 0], ["Nature’s Tongue", "Sage", "Ability", 0], ["Vicious Entangle", "Sage", "Spell", 1],
  ["Bolt Beacon", "Splendor", "Spell", 1], ["Mending Touch", "Splendor", "Spell", 1], ["Reassurance", "Splendor", "Ability", 0], ["Bare Bones", "Valor", "Ability", 0], ["Forceful Push", "Valor", "Ability", 0],
];

const LEVEL_ONE_CARD_DESCRIPTIONS = {
  "rune-ward": "Infuse a personal trinket as a ward. Its holder can spend Hope to reduce incoming damage by 1d8; recharge it on your next rest.",
  "unleash-chaos": "At session start, gain tokens equal to your Spellcast trait. Make a Spellcast Roll against a target within Far and spend tokens to deal that many d10 magic damage.",
  "wall-walk": "Spend a Hope to let a creature you touch climb walls and ceilings as easily as walking until the scene ends or you cast this again.",
  "get-back-up": "When you take Severe damage, mark a Stress to reduce the severity by one threshold.",
  "not-good-enough": "When you roll damage dice, reroll any 1s or 2s.",
  whirlwind: "After a successful attack against a target within Very Close, spend a Hope to use the attack against all other targets within Very Close for half damage.",
  "deft-maneuvers": "Describe a clever maneuver and gain advantage on an Agility or Finesse roll when the maneuver creates an opening.",
  "i-see-it-coming": "When an adversary you can see succeeds on an attack against you, spend a Hope to gain advantage on the reaction roll to evade it.",
  untouchable: "When you succeed on an Agility or Finesse roll to avoid danger, you can mark a Stress to move anywhere within Close without triggering reactions.",
  "book-of-ava": "Gain access to a small collection of Codex spells recorded in Ava’s book; choose one spell from this grimoire to use as your action.",
  "book-of-illiat": "Gain access to a small collection of Codex spells recorded in Illiat’s book; choose one spell from this grimoire to use as your action.",
  "book-of-tyfar": "Gain access to a small collection of Codex spells recorded in Tyfar’s book; choose one spell from this grimoire to use as your action.",
  "blighting-strike": "Make a Spellcast Roll against a target within Melee. On a success, deal d8+2 magic damage and reduce the target’s Severe threshold by 1 until the scene ends.",
  "umbral-veil": "Spend a Hope to become cloaked in shadow until you make an attack or the scene ends; while cloaked, you are difficult to perceive.",
  "voice-of-dread": "Make a Spellcast Roll against a target within Close. On a success, they must mark Stress and become temporarily Vulnerable.",
  "deft-deceiver": "When you make a roll to deceive, disguise, or misdirect, you can spend a Hope to gain advantage and leave no obvious evidence.",
  enrapture: "Make a Spellcast Roll against a target within Close. On a success, they are temporarily Charmed and cannot willingly attack you until the condition ends.",
  "inspirational-words": "Once per rest, encourage an ally within Close after they fail an action roll; they can reroll the Duality Dice.",
  "pick-and-pull": "On a successful attack, spend a Hope to pull the target to Melee or move yourself to a position within Very Close of them.",
  "rain-of-blades": "Make a Spellcast Roll against all targets within Close. Targets you succeed against take d8+2 physical damage using your Proficiency.",
  "uncanny-disguise": "Spend a Hope to create a convincing disguise. It lasts until someone sees through it or you take a rest.",
  "gifted-tracker": "When tracking a creature, ask the GM one additional question about its path, condition, or destination and gain advantage on the next related roll.",
  "nature-s-tongue": "You can communicate with natural beasts and plants and understand their basic needs, fears, and observations.",
  "vicious-entangle": "Make a Spellcast Roll against a target within Close. On a success, deal d8 magic damage and temporarily Restrain them.",
  "bolt-beacon": "Make a Spellcast Roll against a target within Far. On a success, spend a Hope to deal d8+2 magic damage, make them Vulnerable, and cause them to glow brightly.",
  "mending-touch": "After a few minutes of focus, spend 2 Hope to clear an HP or Stress on a creature you touch; once per long rest, clear 2 instead when you share something personal.",
  reassurance: "Once per rest, after an ally rolls but before consequences, offer support to let them reroll their dice.",
  "bare-bones": "When you choose not to equip armor, use Armor Score 3 + Strength and Tier 1 damage thresholds 9/19.",
  "forceful-push": "Attack a target within Melee. On a success, deal damage and knock them back to Close; on a success with Hope, add a d6 to damage. Spend Hope to make them Vulnerable.",
};

export const LEVEL_ONE_DOMAIN_CARDS = BASE_LEVEL_ONE_DOMAIN_CARDS.map(([name, domain, type, recallCost]) => {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return { id, name, domain, type, level: 1, recallCost, description: LEVEL_ONE_CARD_DESCRIPTIONS[id] ?? "Use this level-1 domain card according to its feature text." };
});

export const STANDARD_INVENTORY = [
  "Torch",
  "50 feet of rope",
  "Basic supplies",
  "Handful of gold",
];

export const EXPERIENCE_EXAMPLES = ["Blacksmith", "Bodyguard", "Scholar", "Sellsword", "Storyteller", "Thief", "Navigator", "Survivalist", "Tactician", "World Traveler"];
