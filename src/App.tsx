import { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  abilityModifier,
  armorClass,
  carryingCapacity,
  beginLevelUp,
  classDefinitions,
  changeRace,
  cloneCharacter,
  deityDefinitions,
  dragonlancePrestigeClasses,
  hitPointGain,
  initialCharacter,
  raceDefinitions,
  rollHitDie,
  type AbilityName,
  type Character,
  type ClassId,
  type FeatDefinition,
  type PrestigeClassId,
  type LevelUpDraft,
  validateLevelUp,
} from "./domain";
import { srdSpells } from "./srdSpells";

const abilities = [
  ["STR", "Strength"],
  ["DEX", "Dexterity"],
  ["CON", "Constitution"],
  ["INT", "Intelligence"],
  ["WIS", "Wisdom"],
  ["CHA", "Charisma"],
];
const skills = [
  "Appraise",
  "Balance",
  "Bluff",
  "Climb",
  "Concentration",
  "Craft",
  "Decipher Script",
  "Diplomacy",
  "Disable Device",
  "Disguise",
  "Escape Artist",
  "Forgery",
  "Gather Information",
  "Handle Animal",
  "Heal",
  "Hide",
  "Intimidate",
  "Jump",
  "Knowledge (arcana)",
  "Knowledge (architecture and engineering)",
  "Knowledge (dungeoneering)",
  "Knowledge (geography)",
  "Knowledge (history)",
  "Knowledge (local)",
  "Knowledge (nature)",
  "Knowledge (nobility and royalty)",
  "Knowledge (religion)",
  "Knowledge (the planes)",
  "Listen",
  "Move Silently",
  "Open Lock",
  "Perform (act)",
  "Perform (comedy)",
  "Perform (dance)",
  "Perform (keyboard instruments)",
  "Perform (mime)",
  "Perform (oratory)",
  "Perform (percussion instruments)",
  "Perform (sing)",
  "Perform (string instruments)",
  "Perform (wind instruments)",
  "Profession",
  "Ride",
  "Search",
  "Sense Motive",
  "Sleight of Hand",
  "Speak Language",
  "Spellcraft",
  "Spot",
  "Survival",
  "Swim",
  "Tumble",
  "Use Magic Device",
  "Use Rope",
];
const languageCatalog = [
  "Abyssal",
  "Aquan",
  "Auran",
  "Celestial",
  "Common",
  "Draconic",
  "Dwarven",
  "Elven",
  "Giant",
  "Gnome",
  "Goblin",
  "Halfling",
  "Infernal",
  "Kender",
  "Minotaur",
  "Orc",
  "Sylvan",
  "Terran",
  "Undercommon",
];
const racialLanguages: Record<string, string[]> = {
  human: ["Common"],
  dwarf: ["Common", "Dwarven"],
  elf: ["Common", "Elven"],
  "half-elf": ["Common", "Elven"],
  halfling: ["Common", "Halfling"],
  gnome: ["Common", "Gnome"],
  "half-orc": ["Common", "Orc"],
  kender: ["Common", "Kender"],
  draconian: ["Common", "Draconic"],
  "qualinesti-elf": ["Common", "Elven"],
  "silvanesti-elf": ["Common", "Elven"],
  "kagonesti-elf": ["Common", "Elven"],
  "dargonesti-elf": ["Common", "Elven"],
  "dimernesti-elf": ["Common", "Elven"],
  "hill-dwarf": ["Common", "Dwarven"],
  "mountain-dwarf": ["Common", "Dwarven"],
  "deep-dwarf": ["Common", "Dwarven"],
  minotaur: ["Common", "Minotaur"],
  irda: ["Common"],
  "gully-dwarf": ["Common", "Dwarven"],
};

function getRacialLanguages(character: Character) {
  const raceId = character.race.toLowerCase().replaceAll(" ", "-");
  return racialLanguages[raceId] ?? ["Common"];
}

function getLanguageBonusSlots(character: Character) {
  return (
    Math.max(0, abilityModifier(character.abilities.int)) +
    (character.race === "Human" ? 1 : 0)
  );
}

function getCharacterLanguages(character: Character) {
  return [
    ...new Set([
      ...getRacialLanguages(character),
      ...(character.languages ?? []),
    ]),
  ];
}
const skillDescriptions: Record<string, string> = {
  Appraise: "Estimate the value of common or rare objects.",
  Balance: "Keep your footing on narrow or unstable surfaces.",
  Bluff: "Convince others that something untrue is believable.",
  Climb: "Climb surfaces, ropes, and other handholds.",
  Concentration: "Maintain focus while distracted, injured, or casting.",
  Craft: "Create or repair items in a chosen craft.",
  "Decipher Script":
    "Understand unfamiliar writing, codes, and ancient scripts.",
  Diplomacy: "Influence attitudes and negotiate agreements.",
  "Disable Device": "Disarm traps and sabotage or repair devices.",
  Disguise: "Change your appearance to look like someone else.",
  "Escape Artist": "Slip restraints or squeeze through tight spaces.",
  Forgery: "Create or detect false documents and signatures.",
  "Gather Information":
    "Learn rumors and useful information through conversation.",
  "Handle Animal": "Train, control, and work with animals.",
  Heal: "Treat wounds, stabilize the dying, and diagnose conditions.",
  Hide: "Conceal yourself from sight.",
  Intimidate: "Influence others through threats or displays of force.",
  Jump: "Leap across gaps or over obstacles.",
  "Knowledge (arcana)":
    "Recall lore about magic, dragons, and magical traditions.",
  "Knowledge (architecture and engineering)":
    "Recall lore about buildings, structures, and engineering.",
  "Knowledge (dungeoneering)":
    "Recall lore about underground environments, aberrations, and caves.",
  "Knowledge (geography)":
    "Recall lore about lands, terrain, climates, and peoples.",
  "Knowledge (history)":
    "Recall important events, rulers, wars, and civilizations.",
  "Knowledge (local)": "Recall lore about a region, its people, and its laws.",
  "Knowledge (nature)":
    "Recall lore about animals, plants, fey, weather, and nature.",
  "Knowledge (nobility and royalty)":
    "Recall lore about noble families, heraldry, and etiquette.",
  "Knowledge (religion)":
    "Recall lore about deities, rites, undead, and religious traditions.",
  "Knowledge (the planes)":
    "Recall lore about the planes, outsiders, and planar portals.",
  Listen: "Notice sounds and details that are not immediately visible.",
  "Move Silently": "Move without making noise.",
  "Open Lock": "Open locks without the proper key.",
  "Perform (act)": "Perform dramatic acting and theatrical roles.",
  "Perform (comedy)": "Perform jokes, comic routines, and humorous stories.",
  "Perform (dance)": "Perform dances and choreographed movement.",
  "Perform (keyboard instruments)": "Play keyboard instruments.",
  "Perform (mime)": "Perform silent physical expression and pantomime.",
  "Perform (oratory)": "Deliver speeches, recitations, and persuasive oratory.",
  "Perform (percussion instruments)": "Play percussion instruments.",
  "Perform (sing)": "Perform vocal music and singing.",
  "Perform (string instruments)": "Play string instruments.",
  "Perform (wind instruments)": "Play wind instruments.",
  Profession: "Practice a trained occupation and earn a living from it.",
  Ride: "Ride and control a mount, including during combat.",
  Search: "Find hidden objects, secret doors, and clues.",
  "Sense Motive":
    "Detect deception and understand another creature's intentions.",
  "Sleight of Hand": "Palm objects, pick pockets, and perform legerdemain.",
  "Speak Language": "Communicate in an additional language.",
  Spellcraft: "Identify spells and understand magical effects.",
  Spot: "Notice creatures, movement, and visual details.",
  Survival: "Track, find food, navigate, and endure the wilderness.",
  Swim: "Move through water and avoid drowning.",
  Tumble: "Roll, dive, and move safely through threatened spaces.",
  "Use Magic Device":
    "Activate magic items despite lacking the usual requirements.",
  "Use Rope": "Tie knots, secure ropes, and work with rope-based tools.",
};
const classSkills: Partial<Record<ClassId, string[]>> = {
  barbarian: [
    "Climb",
    "Handle Animal",
    "Intimidate",
    "Jump",
    "Listen",
    "Ride",
    "Survival",
    "Swim",
  ],
  bard: [
    "Appraise",
    "Balance",
    "Bluff",
    "Climb",
    "Concentration",
    "Craft",
    "Decipher Script",
    "Diplomacy",
    "Disguise",
    "Escape Artist",
    "Gather Information",
    "Hide",
    "Jump",
    "Knowledge (arcana)",
    "Knowledge (architecture and engineering)",
    "Knowledge (dungeoneering)",
    "Knowledge (geography)",
    "Knowledge (history)",
    "Knowledge (local)",
    "Knowledge (nature)",
    "Knowledge (nobility and royalty)",
    "Knowledge (religion)",
    "Knowledge (the planes)",
    "Listen",
    "Move Silently",
    "Perform (act)",
    "Perform (comedy)",
    "Perform (dance)",
    "Perform (keyboard instruments)",
    "Perform (mime)",
    "Perform (oratory)",
    "Perform (percussion instruments)",
    "Perform (sing)",
    "Perform (string instruments)",
    "Perform (wind instruments)",
    "Profession",
    "Sense Motive",
    "Sleight of Hand",
    "Speak Language",
    "Spellcraft",
    "Swim",
    "Tumble",
    "Use Magic Device",
    "Use Rope",
  ],
  cleric: [
    "Concentration",
    "Craft",
    "Diplomacy",
    "Heal",
    "Knowledge (arcana)",
    "Knowledge (history)",
    "Knowledge (religion)",
    "Knowledge (the planes)",
    "Profession",
    "Spellcraft",
  ],
  druid: [
    "Concentration",
    "Craft",
    "Diplomacy",
    "Handle Animal",
    "Heal",
    "Knowledge (nature)",
    "Listen",
    "Profession",
    "Ride",
    "Spellcraft",
    "Spot",
    "Survival",
    "Swim",
  ],
  fighter: [
    "Climb",
    "Craft",
    "Handle Animal",
    "Intimidate",
    "Jump",
    "Ride",
    "Swim",
  ],
  monk: [
    "Balance",
    "Climb",
    "Concentration",
    "Craft",
    "Escape Artist",
    "Hide",
    "Jump",
    "Knowledge (arcana)",
    "Knowledge (religion)",
    "Listen",
    "Move Silently",
    "Profession",
    "Sense Motive",
    "Swim",
    "Tumble",
  ],
  paladin: [
    "Concentration",
    "Craft",
    "Diplomacy",
    "Handle Animal",
    "Heal",
    "Knowledge (nobility and royalty)",
    "Knowledge (religion)",
    "Profession",
    "Ride",
    "Sense Motive",
  ],
  ranger: [
    "Climb",
    "Concentration",
    "Craft",
    "Handle Animal",
    "Heal",
    "Hide",
    "Jump",
    "Knowledge (dungeoneering)",
    "Knowledge (geography)",
    "Knowledge (nature)",
    "Listen",
    "Move Silently",
    "Profession",
    "Ride",
    "Search",
    "Spot",
    "Survival",
    "Swim",
    "Use Rope",
  ],
  rogue: [
    "Appraise",
    "Balance",
    "Bluff",
    "Climb",
    "Decipher Script",
    "Diplomacy",
    "Disable Device",
    "Disguise",
    "Escape Artist",
    "Forgery",
    "Gather Information",
    "Hide",
    "Intimidate",
    "Jump",
    "Knowledge (local)",
    "Listen",
    "Move Silently",
    "Open Lock",
    "Perform (act)",
    "Search",
    "Sense Motive",
    "Sleight of Hand",
    "Swim",
    "Tumble",
    "Use Magic Device",
    "Use Rope",
  ],
  sorcerer: [
    "Bluff",
    "Concentration",
    "Craft",
    "Knowledge (arcana)",
    "Profession",
    "Spellcraft",
  ],
  wizard: [
    "Concentration",
    "Craft",
    "Decipher Script",
    "Knowledge (arcana)",
    "Knowledge (architecture and engineering)",
    "Knowledge (dungeoneering)",
    "Knowledge (geography)",
    "Knowledge (history)",
    "Knowledge (local)",
    "Knowledge (nature)",
    "Knowledge (nobility and royalty)",
    "Knowledge (religion)",
    "Knowledge (the planes)",
    "Profession",
    "Spellcraft",
  ],
  mystic: [
    "Concentration",
    "Craft",
    "Diplomacy",
    "Heal",
    "Knowledge (arcana)",
    "Knowledge (religion)",
    "Profession",
    "Spellcraft",
    "Survival",
  ],
  noble: [
    "Appraise",
    "Bluff",
    "Diplomacy",
    "Disguise",
    "Forgery",
    "Gather Information",
    "Knowledge (history)",
    "Knowledge (local)",
    "Knowledge (nobility and royalty)",
    "Listen",
    "Perform (oratory)",
    "Profession",
    "Ride",
    "Sense Motive",
    "Speak Language",
  ],
};
const featCatalog: FeatDefinition[] = [
  {
    id: "alertness",
    name: "Alertness",
    source: "core-35-srd",
    description: "+2 bonus on Listen and Spot checks.",
  },
  {
    id: "blind-fight",
    name: "Blind-Fight",
    source: "core-35-srd",
    description: "Reroll miss chances from concealment in melee.",
    fighterBonus: true,
  },
  {
    id: "combat-casting",
    name: "Combat Casting",
    source: "core-35-srd",
    description:
      "+4 bonus on Concentration checks for defensive casting or casting while grappled.",
    fighterBonus: true,
  },
  {
    id: "combat-expertise",
    name: "Combat Expertise",
    source: "core-35-srd",
    description: "Trade attack bonus for dodge bonus to Armor Class.",
    prerequisites: { abilities: { int: 13 } },
    fighterBonus: true,
  },
  {
    id: "cleave",
    name: "Cleave",
    source: "core-35-srd",
    description: "Make one extra melee attack after dropping an opponent.",
    prerequisites: { abilities: { str: 13 }, feats: ["power-attack"] },
    fighterBonus: true,
  },
  {
    id: "deceitful",
    name: "Deceitful",
    source: "core-35-srd",
    description: "+2 bonus on Disguise and Forgery checks.",
  },
  {
    id: "dodge",
    name: "Dodge",
    source: "core-35-srd",
    description:
      "+1 dodge bonus to Armor Class against one designated opponent.",
    prerequisites: { abilities: { dex: 13 } },
    fighterBonus: true,
  },
  {
    id: "endurance",
    name: "Endurance",
    source: "core-35-srd",
    description:
      "+4 bonus on checks to resist exhausting environmental conditions.",
  },
  {
    id: "diehard",
    name: "Diehard",
    source: "core-35-srd",
    description: "Remain conscious and act while below 0 hit points.",
    prerequisites: { feats: ["endurance"] },
  },
  {
    id: "great-cleave",
    name: "Great Cleave",
    source: "core-35-srd",
    description: "Make multiple Cleave attacks in one round.",
    prerequisites: {
      abilities: { str: 13 },
      baseAttackBonus: 4,
      feats: ["cleave"],
    },
    fighterBonus: true,
  },
  {
    id: "great-fortitude",
    name: "Great Fortitude",
    source: "core-35-srd",
    description: "+2 bonus on Fortitude saves.",
  },
  {
    id: "improved-bull-rush",
    name: "Improved Bull Rush",
    source: "core-35-srd",
    description: "Avoid attacks of opportunity when bull rushing.",
    prerequisites: { abilities: { str: 13 }, feats: ["power-attack"] },
    fighterBonus: true,
  },
  {
    id: "improved-disarm",
    name: "Improved Disarm",
    source: "core-35-srd",
    description: "Avoid attacks of opportunity when attempting to disarm.",
    prerequisites: { abilities: { int: 13 }, feats: ["combat-expertise"] },
    fighterBonus: true,
  },
  {
    id: "improved-grapple",
    name: "Improved Grapple",
    source: "core-35-srd",
    description: "Avoid attacks of opportunity when grappling.",
    prerequisites: {
      abilities: { dex: 13 },
      feats: ["improved-unarmed-strike"],
    },
    fighterBonus: true,
  },
  {
    id: "improved-initiative",
    name: "Improved Initiative",
    source: "core-35-srd",
    description: "+4 bonus on initiative checks.",
    fighterBonus: true,
  },
  {
    id: "improved-overrun",
    name: "Improved Overrun",
    source: "core-35-srd",
    description: "Avoid attacks of opportunity when overrunning an opponent.",
    prerequisites: { abilities: { str: 13 }, feats: ["power-attack"] },
    fighterBonus: true,
  },
  {
    id: "improved-sunder",
    name: "Improved Sunder",
    source: "core-35-srd",
    description: "Avoid attacks of opportunity when attempting to sunder.",
    prerequisites: { abilities: { str: 13 }, feats: ["power-attack"] },
    fighterBonus: true,
  },
  {
    id: "improved-trip",
    name: "Improved Trip",
    source: "core-35-srd",
    description:
      "Avoid attacks of opportunity when tripping and gain a follow-up attack.",
    prerequisites: { abilities: { int: 13 }, feats: ["combat-expertise"] },
    fighterBonus: true,
  },
  {
    id: "improved-unarmed-strike",
    name: "Improved Unarmed Strike",
    source: "core-35-srd",
    description: "Attack unarmed without provoking attacks of opportunity.",
    fighterBonus: true,
  },
  {
    id: "investigator",
    name: "Investigator",
    source: "core-35-srd",
    description: "+2 bonus on Search and Gather Information checks.",
  },
  {
    id: "iron-will",
    name: "Iron Will",
    source: "core-35-srd",
    description: "+2 bonus on Will saves.",
  },
  {
    id: "lightning-reflexes",
    name: "Lightning Reflexes",
    source: "core-35-srd",
    description: "+2 bonus on Reflex saves.",
  },
  {
    id: "magical-aptitude",
    name: "Magical Aptitude",
    source: "core-35-srd",
    description: "+2 bonus on Spellcraft and Use Magic Device checks.",
  },
  {
    id: "mobility",
    name: "Mobility",
    source: "core-35-srd",
    description:
      "+4 dodge bonus to Armor Class against attacks of opportunity caused by movement.",
    prerequisites: { abilities: { dex: 13 }, feats: ["dodge"] },
    fighterBonus: true,
  },
  {
    id: "negotiator",
    name: "Negotiator",
    source: "core-35-srd",
    description: "+2 bonus on Diplomacy and Sense Motive checks.",
  },
  {
    id: "nimble-fingers",
    name: "Nimble Fingers",
    source: "core-35-srd",
    description: "+2 bonus on Disable Device and Open Lock checks.",
  },
  {
    id: "point-blank-shot",
    name: "Point Blank Shot",
    source: "core-35-srd",
    description: "+1 attack and damage within 30 feet.",
    fighterBonus: true,
  },
  {
    id: "power-attack",
    name: "Power Attack",
    source: "core-35-srd",
    description: "Trade melee attack bonus for melee damage.",
    prerequisites: { abilities: { str: 13 } },
    fighterBonus: true,
  },
  {
    id: "precise-shot",
    name: "Precise Shot",
    source: "core-35-srd",
    description: "Ignore the normal -4 penalty for shooting into melee.",
    prerequisites: { feats: ["point-blank-shot"] },
    fighterBonus: true,
  },
  {
    id: "persuasive",
    name: "Persuasive",
    source: "core-35-srd",
    description: "+2 bonus on Bluff and Intimidate checks.",
  },
  {
    id: "quick-draw",
    name: "Quick Draw",
    source: "core-35-srd",
    description: "Draw a weapon as a free action.",
    prerequisites: { baseAttackBonus: 1 },
    fighterBonus: true,
  },
  {
    id: "run",
    name: "Run",
    source: "core-35-srd",
    description: "Move five times your normal speed when running.",
  },
  {
    id: "self-sufficient",
    name: "Self-Sufficient",
    source: "core-35-srd",
    description: "+2 bonus on Heal and Survival checks.",
  },
  {
    id: "skill-focus",
    name: "Skill Focus",
    source: "core-35-srd",
    description: "+3 bonus on one selected skill.",
  },
  {
    id: "spring-attack",
    name: "Spring Attack",
    source: "core-35-srd",
    description:
      "Move before and after a melee attack without provoking from the target.",
    prerequisites: {
      abilities: { dex: 13 },
      baseAttackBonus: 4,
      feats: ["dodge", "mobility"],
    },
    fighterBonus: true,
  },
  {
    id: "toughness",
    name: "Toughness",
    source: "core-35-srd",
    description: "Gain 3 additional hit points.",
    fighterBonus: true,
  },
  {
    id: "two-weapon-fighting",
    name: "Two-Weapon Fighting",
    source: "core-35-srd",
    description: "Reduce penalties when fighting with two weapons.",
    prerequisites: { abilities: { dex: 15 } },
    fighterBonus: true,
  },
  {
    id: "weapon-finesse",
    name: "Weapon Finesse",
    source: "core-35-srd",
    description:
      "Use Dexterity instead of Strength for attacks with a light weapon.",
    prerequisites: { baseAttackBonus: 1 },
    fighterBonus: true,
  },
  {
    id: "weapon-focus",
    name: "Weapon Focus",
    source: "core-35-srd",
    description: "+1 attack with one selected weapon type.",
    prerequisites: { baseAttackBonus: 1 },
    fighterBonus: true,
  },
  {
    id: "whirlwind-attack",
    name: "Whirlwind Attack",
    source: "core-35-srd",
    description: "Make one melee attack against every nearby opponent.",
    prerequisites: {
      abilities: { dex: 13, int: 13 },
      baseAttackBonus: 4,
      feats: ["dodge", "mobility", "spring-attack"],
    },
    fighterBonus: true,
  },
];
const spells = srdSpells;
const spellSlots: Partial<Record<ClassId, number[][]>> = {
  bard: [[2], [1], [0]],
  cleric: [[3], [1], [0]],
  druid: [[3], [1], [0]],
  mystic: [[3], [1], [0]],
  paladin: [
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
  ],
  ranger: [
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
    [0],
  ],
  sorcerer: [[5], [3], [1]],
  wizard: [[3], [1], [0]],
};
const abilityNames: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
const abilityLabels: Record<AbilityName, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};
const startingClassFeatures: Partial<Record<ClassId, string[]>> = {
  barbarian: ["Rage", "Fast Movement"],
  bard: ["Bardic Music", "Countersong", "Fascinate", "Inspire Courage"],
  cleric: ["Turn or Rebuke Undead", "Domains"],
  druid: ["Animal Companion", "Nature Sense", "Wild Empathy"],
  fighter: ["Bonus Feat"],
  monk: ["Flurry of Blows", "Improved Unarmed Strike", "Evasion"],
  paladin: ["Aura of Good", "Detect Evil", "Smite Evil"],
  ranger: ["Favored Enemy", "Track", "Wild Empathy"],
  rogue: ["Sneak Attack", "Trapfinding"],
  sorcerer: ["Spells"],
  wizard: ["Spellbook", "Summon Familiar"],
  mystic: ["Divine Spellcasting"],
  noble: ["Coordinate"],
};
type StoreCategory =
  | "Weapons"
  | "Armor"
  | "Shields"
  | "Ammunition"
  | "Adventuring Gear"
  | "Tools & Kits"
  | "Consumables"
  | "Potions, Scrolls & Wands"
  | "Rings & Magic Items"
  | "Head"
  | "Neck"
  | "Shoulders"
  | "Arms"
  | "Hands"
  | "Rings"
  | "Waist"
  | "Feet"
  | "Body & Wondrous Items"
  | "Mounts & Vehicles";
type StoreItem = {
  name: string;
  category: StoreCategory;
  price: number;
  weight: string;
  description?: string;
};
const storeItems: StoreItem[] = [
  { name: "Longsword", category: "Weapons", price: 15, weight: "4 lb." },
  { name: "Dagger", category: "Weapons", price: 2, weight: "1 lb." },
  { name: "Greatsword", category: "Weapons", price: 50, weight: "8 lb." },
  { name: "Shortbow", category: "Weapons", price: 30, weight: "2 lb." },
  { name: "Longbow", category: "Weapons", price: 75, weight: "3 lb." },
  {
    name: "Chain Shirt",
    category: "Armor",
    price: 100,
    weight: "25 lb.",
  },
  {
    name: "Breastplate",
    category: "Armor",
    price: 200,
    weight: "30 lb.",
  },
  {
    name: "Heavy Steel Shield",
    category: "Shields",
    price: 20,
    weight: "15 lb.",
  },
  {
    name: "Tower Shield",
    category: "Shields",
    price: 30,
    weight: "45 lb.",
  },
  { name: "Arrows (20)", category: "Ammunition", price: 1, weight: "3 lb." },
  {
    name: "Crossbow Bolts (10)",
    category: "Ammunition",
    price: 1,
    weight: "1 lb.",
  },
  { name: "Backpack", category: "Adventuring Gear", price: 2, weight: "2 lb." },
  {
    name: "Rope (50 ft.)",
    category: "Adventuring Gear",
    price: 1,
    weight: "10 lb.",
  },
  { name: "Lantern", category: "Adventuring Gear", price: 7, weight: "2 lb." },
  { name: "Tent", category: "Adventuring Gear", price: 10, weight: "20 lb." },
  {
    name: "Thieves' Tools",
    category: "Tools & Kits",
    price: 30,
    weight: "1 lb.",
  },
  {
    name: "Healer's Kit",
    category: "Tools & Kits",
    price: 50,
    weight: "1 lb.",
  },
  { name: "Flint and Steel", category: "Tools & Kits", price: 1, weight: "—" },
  {
    name: "Rations (5 days)",
    category: "Consumables",
    price: 2.5,
    weight: "5 lb.",
  },
  { name: "Healing Potion", category: "Consumables", price: 50, weight: "—" },
  { name: "Antitoxin", category: "Consumables", price: 50, weight: "—" },
  {
    name: "Ring of Protection +1",
    category: "Rings",
    price: 2000,
    weight: "—",
  },
  {
    name: "Cloak of Resistance +1",
    category: "Rings & Magic Items",
    price: 1000,
    weight: "1 lb.",
  },
  {
    name: "Bag of Holding",
    category: "Rings & Magic Items",
    price: 2500,
    weight: "15 lb.",
  },
  {
    name: "Headband of Intellect +2",
    category: "Rings & Magic Items",
    price: 4000,
    weight: "1 lb.",
  },
  {
    name: "Light Horse",
    category: "Mounts & Vehicles",
    price: 75,
    weight: "—",
  },
  {
    name: "Riding Saddle",
    category: "Mounts & Vehicles",
    price: 10,
    weight: "25 lb.",
  },
];

storeItems.push(
  { name: "Ring of Feather Falling", category: "Rings", price: 2200, weight: "—", description: "You always fall as though from 60 feet or less." },
  { name: "Ring of Swimming", category: "Rings", price: 2500, weight: "—", description: "+5 competence bonus on Swim checks." },
  { name: "Ring of Sustenance", category: "Rings", price: 2500, weight: "—", description: "Requires only 2 hours of sleep and sustains the wearer without food or water." },
  { name: "Ring of Climbing", category: "Rings", price: 2500, weight: "—", description: "+5 competence bonus on Climb checks." },
  { name: "Ring of Jumping", category: "Rings", price: 2500, weight: "—", description: "+5 competence bonus on Jump checks." },
  { name: "Ring of Mind Shielding", category: "Rings", price: 8000, weight: "—", description: "Protects against mind-reading and alignment detection." },
  { name: "Ring of Invisibility", category: "Rings", price: 20000, weight: "—", description: "Allows the wearer to become invisible on command." },
  { name: "Ring of Blinking", category: "Rings", price: 27000, weight: "—", description: "The wearer blinks in and out of the Material Plane." },
  { name: "Ring of Evasion", category: "Rings", price: 25000, weight: "—", description: "A successful Reflex save negates damage from an applicable attack." },
  { name: "Ring of Freedom of Movement", category: "Rings", price: 40000, weight: "—", description: "The wearer is continually affected by freedom of movement." },
  { name: "Ring of Spell Storing", category: "Rings", price: 50000, weight: "—", description: "Stores up to five levels of spells for later casting." },
  { name: "Ring of Regeneration", category: "Rings", price: 90000, weight: "—", description: "The wearer regains hit points over time and reattaches severed limbs." },
  { name: "Ring of Wizardry I", category: "Rings", price: 20000, weight: "—", description: "Doubles 1st-level arcane spells per day." },
  { name: "Ring of Wizardry II", category: "Rings", price: 40000, weight: "—", description: "Doubles 2nd-level arcane spells per day." },
  { name: "Ring of Wizardry III", category: "Rings", price: 70000, weight: "—", description: "Doubles 3rd-level arcane spells per day." },
  { name: "Ring of Wizardry IV", category: "Rings", price: 100000, weight: "—", description: "Doubles 4th-level arcane spells per day." },
  { name: "Ring of Djinni Summoning", category: "Rings", price: 125000, weight: "—", description: "Summons a djinni from the ring once per day." },
);

const armorBonuses: Record<string, number> = {
  "Padded Armor": 1,
  "Leather Armor": 2,
  "Studded Leather": 3,
  "Hide Armor": 3,
  "Scale Mail": 4,
  Chainmail: 5,
  "Splint Mail": 6,
  "Half-Plate": 7,
  "Full Plate": 8,
  "Chain Shirt": 4,
  Breastplate: 5,
  "Mithral Chain Shirt": 4,
  "Mithral Breastplate": 5,
  "Mithral Full Plate": 8,
};
const armorMaximumDexterity: Record<string, number> = {
  "Padded Armor": 8,
  "Leather Armor": 6,
  "Studded Leather": 5,
  "Hide Armor": 4,
  "Scale Mail": 3,
  Chainmail: 2,
  "Splint Mail": 0,
  "Half-Plate": 0,
  "Full Plate": 1,
  "Chain Shirt": 4,
  Breastplate: 3,
  "Mithral Chain Shirt": 6,
  "Mithral Breastplate": 5,
  "Mithral Full Plate": 3,
};
const armorCheckPenalties: Record<string, number> = {
  "Padded Armor": 0,
  "Leather Armor": 0,
  "Studded Leather": -1,
  "Hide Armor": -3,
  "Scale Mail": -4,
  Chainmail: -5,
  "Splint Mail": -6,
  "Half-Plate": -7,
  "Full Plate": -6,
  "Chain Shirt": -2,
  Breastplate: -4,
  "Mithral Chain Shirt": 0,
  "Mithral Breastplate": -1,
  "Mithral Full Plate": -3,
};
const armorClasses: Record<string, "Light" | "Medium" | "Heavy"> = {
  "Padded Armor": "Light",
  "Leather Armor": "Light",
  "Studded Leather": "Light",
  "Chain Shirt": "Light",
  "Mithral Chain Shirt": "Light",
  "Hide Armor": "Medium",
  "Scale Mail": "Medium",
  Chainmail: "Medium",
  Breastplate: "Medium",
  "Mithral Breastplate": "Medium",
  "Splint Mail": "Heavy",
  "Half-Plate": "Heavy",
  "Full Plate": "Heavy",
  "Mithral Full Plate": "Heavy",
};
const shieldBonuses: Record<string, number> = {
  Buckler: 1,
  "Light Wooden Shield": 1,
  "Light Steel Shield": 1,
  "Heavy Wooden Shield": 2,
  "Heavy Steel Shield": 2,
  "Tower Shield": 4,
};
const shieldCheckPenalties: Record<string, number> = {
  Buckler: -1,
  "Light Wooden Shield": -1,
  "Light Steel Shield": -1,
  "Heavy Wooden Shield": -2,
  "Heavy Steel Shield": -2,
  "Tower Shield": -10,
};

function getEquipmentArmorClass(character: Character) {
  const equipment = character.equipment ?? {};
  const armorName = equipment.Armor ?? "";
  const shieldName = equipment.Shield ?? "";
  const armorBaseName = Object.keys(armorBonuses)
    .sort((left, right) => right.length - left.length)
    .find((name) => armorName.includes(name));
  const shieldBaseName = Object.keys(shieldBonuses)
    .sort((left, right) => right.length - left.length)
    .find((name) => shieldName.includes(name));
  const maximumDexterityBonus = armorBaseName
    ? armorMaximumDexterity[armorBaseName]
    : Infinity;
  const armorEnhancement = armorName.match(/\+(\d+)/)?.[1];
  const shieldEnhancement = shieldName.match(/\+(\d+)/)?.[1];
  return armorClass(
    character,
    (armorBaseName ? armorBonuses[armorBaseName] : 0) +
      (armorEnhancement ? Number(armorEnhancement) : 0),
    maximumDexterityBonus,
    (shieldBaseName ? shieldBonuses[shieldBaseName] : 0) +
      (shieldEnhancement ? Number(shieldEnhancement) : 0),
  );
}

function getStoreItemDescription(item: StoreItem) {
  if (item.category === "Armor") {
    const name = Object.keys(armorBonuses)
      .sort((left, right) => right.length - left.length)
      .find((entry) => item.name.includes(entry));
    const armorBonus = name ? armorBonuses[name] : 0;
    const armorClass = name ? armorClasses[name] : "Unknown";
    const maximumDexterity = name ? armorMaximumDexterity[name] : Infinity;
    const checkPenalty = name ? armorCheckPenalties[name] : 0;
    const baseDescription = item.description ? `${item.description} ` : "";
    return `${baseDescription}${armorClass} armor; armor bonus +${armorBonus}; max Dex ${maximumDexterity === Infinity ? "—" : `+${maximumDexterity}`}; armor check penalty ${checkPenalty}.`;
  }
  if (item.description) return item.description;
  if (item.category === "Weapons") {
    const profile = getWeaponProfile(item.name);
    const damageType = weaponDamageTypes[item.name] ?? "varies";
    const critical = profile.crit === "20/x2" ? "" : `; crit ${profile.crit}`;
    return `${damageType}; ${profile.damage} damage${critical}.`;
  }
  if (item.category === "Shields") {
    const name = Object.keys(shieldBonuses).find((entry) => item.name.includes(entry));
    const shieldBonus = name ? shieldBonuses[name] : 0;
    const checkPenalty = name ? shieldCheckPenalties[name] : 0;
    return `Shield bonus +${shieldBonus}; armor check penalty ${checkPenalty}; uses the off hand.`;
  }
  if (item.category === "Ammunition") return "Ammunition used with a compatible ranged weapon.";
  if (item.category === "Tools & Kits") return "A tool or kit used for a specific task.";
  if (item.category === "Consumables") return "A consumable item used once or over a short duration.";
  if (item.category === "Potions, Scrolls & Wands") return "A magical item that provides a spell or magical effect.";
  if (item.category === "Rings") return "A magical ring that occupies a ring slot.";
  if (["Head", "Neck", "Shoulders", "Hands", "Waist", "Feet"].includes(item.category))
    return `A magical item worn in the ${item.category.toLowerCase()} slot.`;
  return "An adventuring item useful during travel or exploration.";
}

function getSizeStep(size: string) {
  return size === "Small" ? -1 : size === "Large" ? 1 : 0;
}

function getSizedStorePrice(item: StoreItem, size: string) {
  const step = getSizeStep(size);
  return item.category === "Weapons" || item.category === "Armor" || item.category === "Shields"
    ? item.price * (step === 1 ? 2 : step === -1 ? 0.5 : 1)
    : item.price;
}

function getSizedStoreWeight(item: StoreItem, size: string) {
  if (item.weight === "—" || item.weight === "varies") return item.weight;
  const numericWeight = Number.parseFloat(item.weight);
  if (Number.isNaN(numericWeight)) return item.weight;
  const multiplier =
    getSizeStep(size) === 1 ? 2 : getSizeStep(size) === -1 ? 0.5 : 1;
  return `${numericWeight * multiplier} lb.`;
}

function getInventoryEntryDetails(key: string) {
  const match = key.match(/^(.*) \((Small|Medium|Large)\)$/);
  const name = match?.[1] ?? key;
  const size = match?.[2] ?? "Medium";
  const item = [...storeItems]
    .sort((left, right) => right.name.length - left.name.length)
    .find((entry) => name.includes(entry.name));
  const weight = item ? getSizedStoreWeight(item, size) : "—";
  const numericWeight = Number.parseFloat(weight);
  return {
    name,
    size,
    weight,
    description: item ? getStoreItemDescription(item) : "Inventory item.",
    numericWeight: Number.isNaN(numericWeight) ? 0 : numericWeight,
  };
}
function getWeaponSizeNote(size: string) {
  return size === "Small"
    ? "smaller damage die; 5-ft. reach"
    : size === "Large"
      ? "larger damage die; 10-ft. reach where applicable"
      : "standard damage die; 5-ft. reach";
}

function getEnhancementPrice(value: string, special = false) {
  if (value === "Normal" || value === "None") return 0;
  return special ? 8000 : Number(value.slice(1)) * 2000;
}

function getEnchantmentDescription(value: string, special = false) {
  if (value === "Normal" || value === "None") return "No magical enhancement.";
  if (!special) return `Adds ${value} to attack and damage rolls.`;
  const descriptions: Record<string, string> = {
    Flaming: "Deals an extra 1d6 points of fire damage on a hit.",
    Frost: "Deals an extra 1d6 points of cold damage on a hit.",
    Shock: "Deals an extra 1d6 points of electricity damage on a hit.",
    Keen: "Doubles the weapon's threat range; it does not stack with keen edge.",
    Holy: "Deals extra damage to evil creatures and is strongly aligned.",
    Vicious: "Deals extra damage to the target and its wielder on a hit.",
    Bane: "Deals extra damage and gains an attack bonus against its chosen foe.",
    Fortification: "Gives a chance to ignore critical hits and sneak attacks.",
    Shadow: "Improves the wearer's Hide checks.",
    "Silent Moves": "Improves the wearer's Move Silently checks.",
    Slick: "Improves the wearer's Escape Artist checks.",
    Glamered:
      "Makes the armor appear to be a different suit of armor or clothing.",
    Invulnerability: "Grants damage reduction against weapon attacks.",
  };
  return descriptions[value] ?? "A special magical ability.";
}

const weaponProfiles: Record<string, { damage: string; crit: string }> = {
  Longsword: { damage: "1d8", crit: "19–20/x2" },
  Dagger: { damage: "1d4", crit: "19–20/x2" },
  Greatsword: { damage: "2d6", crit: "19–20/x2" },
  Shortbow: { damage: "1d6", crit: "x3" },
  Longbow: { damage: "1d8", crit: "x3" },
  Rapier: { damage: "1d6", crit: "18–20/x2" },
  Scimitar: { damage: "1d6", crit: "18–20/x2" },
  Battleaxe: { damage: "1d8", crit: "x3" },
  Greataxe: { damage: "1d12", crit: "x3" },
  Warhammer: { damage: "1d8", crit: "x3" },
  Mace: { damage: "1d8", crit: "x2" },
  Spear: { damage: "1d8", crit: "x3" },
  Quarterstaff: { damage: "1d6", crit: "x2" },
  "Light Crossbow": { damage: "1d8", crit: "19–20/x2" },
  "Heavy Crossbow": { damage: "1d10", crit: "19–20/x2" },
  Sling: { damage: "1d4", crit: "x2" },
};

const weaponDamageTypes: Record<string, string> = {
  Longsword: "slashing",
  Dagger: "piercing or slashing",
  Greatsword: "slashing",
  Shortbow: "piercing",
  Longbow: "piercing",
  Rapier: "piercing",
  Scimitar: "slashing",
  Battleaxe: "slashing",
  Greataxe: "slashing",
  Warhammer: "bludgeoning",
  Mace: "bludgeoning",
  Spear: "piercing",
  Quarterstaff: "bludgeoning",
  "Light Crossbow": "piercing",
  "Heavy Crossbow": "piercing",
  Sling: "bludgeoning",
};

function getWeaponProfile(name: string) {
  return weaponProfiles[name] ?? { damage: "varies", crit: "20/x2" };
}

const rangedWeaponNames = new Set([
  "Shortbow",
  "Longbow",
  "Light Crossbow",
  "Heavy Crossbow",
  "Repeating Crossbow",
  "Hand Crossbow",
  "Sling",
  "Dart",
  "Javelin",
  "Shuriken",
]);

const lightOffHandWeaponNames = new Set([
  "Dagger",
  "Handaxe",
  "Kukri",
  "Kama",
  "Sickle",
  "Light Mace",
  "Light Hammer",
  "Sap",
  "Nunchaku",
  "Sai",
  "Siangham",
  "Shuriken",
]);
const twoHandedWeaponNames = new Set([
  "Greatsword",
  "Greataxe",
  "Glaive",
  "Halberd",
  "Guisarme",
  "Spiked Chain",
  "Falchion",
  "Lance",
  "Longbow",
  "Heavy Crossbow",
  "Repeating Crossbow",
]);

function EquipmentItemPicker({
  items,
  size,
  owned,
  onSelect,
  onPurchase,
  bulk = false,
  menuOnLeft = false,
}: {
  items: StoreItem[];
  size: string;
  owned: Record<string, number>;
  onSelect: (item: StoreItem) => void;
  onPurchase: (item: StoreItem, quantity?: number) => void;
  bulk?: boolean;
  menuOnLeft?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<StoreItem>();
  const [quantity, setQuantity] = useState(1);
  const [hovered, setHovered] = useState<StoreItem>();
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);
  const results = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase().trim()),
  );
  const purchaseSelected = () => {
    if (!selected) return;
    onPurchase(selected, bulk ? quantity : 1);
    setSelected(undefined);
    setHovered(undefined);
  };
  const chooseItem = (item: StoreItem) => {
    setSelected(item);
    onSelect(item);
    setOpen(false);
    setHovered(undefined);
  };
  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        !pickerRef.current?.contains(event.target)
      ) {
        setOpen(false);
        setHovered(undefined);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);
  return (
    <div
      className={`class-field feat-picker equipment-item-picker${menuOnLeft ? " menu-on-left" : ""}`}
      ref={pickerRef}
    >
      <button
        className="race-trigger"
        type="button"
        aria-expanded={open}
        onClick={() => {
          const nextOpen = !open;
          setOpen(nextOpen);
          setQuery("");
          setHighlightedIndex(0);
          if (nextOpen) setSelected(undefined);
          setHovered(nextOpen ? results[0] : undefined);
        }}
      >
        {selected?.name ?? "Choose an item..."}
        <span aria-hidden="true">▾</span>
      </button>
      {bulk ? (
        <span className="equipment-quantity-control">
          <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>−</button>
          <span>{quantity}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => current + 1)}>+</button>
          <button className="equipment-purchase-button equipment-cart-button" type="button" disabled={!selected} aria-label={selected ? `Purchase ${quantity} ${selected.name}` : "Choose an item to purchase"} title={selected ? `Purchase ${quantity} ${selected.name}` : "Choose an item first"} onClick={purchaseSelected}><span aria-hidden="true">$+</span></button>
        </span>
      ) : (
        <button className="equipment-purchase-button" type="button" disabled={!selected} aria-label={selected ? `Purchase ${selected.name}` : "Choose an item to purchase"} title={selected ? `Purchase ${selected.name}` : "Choose an item first"} onClick={purchaseSelected}><span aria-hidden="true">$</span></button>
      )}
      {hovered && (
        <span className="feat-picker-tooltip" role="tooltip">
          <strong>{hovered.name}</strong>
          <br />
          {hovered.category === "Weapons"
            ? `${getWeaponProfile(hovered.name).damage} damage; crit ${getWeaponProfile(hovered.name).crit}; ${getWeaponSizeNote(size)}.`
            : hovered.category === "Armor"
              ? getStoreItemDescription(hovered)
            : null}
          <br />
          {getSizedStoreWeight(hovered, size)} carried weight;{" "}
          {getSizedStorePrice(hovered, size).toLocaleString()} gp.
          <br />
          {owned[`${hovered.name} (${size})`]
            ? `Owned: ${owned[`${hovered.name} (${size})`]}`
            : "Not owned yet."}
        </span>
      )}
      {open && (
        <div
          className="race-menu"
          role="listbox"
          aria-label="Equipment choices"
        >
          <div className="feat-search">
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value;
                const nextResults = items.filter((item) =>
                  item.name.toLowerCase().includes(nextQuery.toLowerCase().trim()),
                );
                setQuery(nextQuery);
                setHighlightedIndex(0);
                setHovered(nextResults[0]);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  const nextIndex = results.length
                    ? (highlightedIndex + 1) % results.length
                    : 0;
                  setHighlightedIndex(nextIndex);
                  setHovered(results[nextIndex]);
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  const nextIndex = results.length
                    ? (highlightedIndex - 1 + results.length) % results.length
                    : 0;
                  setHighlightedIndex(nextIndex);
                  setHovered(results[nextIndex]);
                } else if (event.key === "Enter" && results[highlightedIndex]) {
                  event.preventDefault();
                  chooseItem(results[highlightedIndex]);
                } else if (event.key === "Escape") {
                  setOpen(false);
                  setHovered(undefined);
                }
              }}
              placeholder="Search items"
              aria-label="Search equipment"
            />
          </div>
          {results.map((item, index) => (
            <button
              className={`race-option${index === highlightedIndex ? " is-highlighted" : ""}`}
              key={item.name}
              type="button"
              role="option"
              onMouseEnter={() => {
                setHighlightedIndex(index);
                setHovered(item);
              }}
              onFocus={() => {
                setHighlightedIndex(index);
                setHovered(item);
              }}
              onMouseLeave={() => setHovered(undefined)}
              onBlur={() => setHovered(undefined)}
              onClick={() => chooseItem(item)}
            >
              {item.name} — {getSizedStorePrice(item, size).toLocaleString()} gp
              — {getSizedStoreWeight(item, size)}
            </button>
          ))}
          {!results.length && (
            <span className="feat-no-results">No items match.</span>
          )}
        </div>
      )}
    </div>
  );
}
storeItems.push(
  ...[
    "Handaxe",
    "Javelin",
    "Trident",
    "Net",
    "Whip",
    "Kukri",
    "Kama",
    "Sickle",
    "Glaive",
    "Halberd",
    "Guisarme",
    "Spiked Chain",
    "Falchion",
    "Lance",
    "Morningstar",
    "Light Mace",
    "Light Hammer",
    "Shuriken",
    "Repeating Crossbow",
    "Hand Crossbow",
    "Sap",
    "Nunchaku",
    "Sai",
    "Siangham",
    "Dart",
  ].map((name) => ({
    name,
    category: "Weapons" as StoreCategory,
    price: 1,
    weight: "varies",
  })),
  ...[
    "Padded Armor",
    "Leather Armor",
    "Studded Leather",
    "Hide Armor",
    "Scale Mail",
    "Chainmail",
    "Splint Mail",
    "Half-Plate",
    "Full Plate",
    "Buckler",
    "Light Wooden Shield",
    "Heavy Wooden Shield",
    "Light Steel Shield",
    "Mithral Chain Shirt",
    "Mithral Breastplate",
    "Mithral Full Plate",
  ].map((name) => ({
    name,
    category: new Set([
      "Buckler",
      "Light Wooden Shield",
      "Heavy Wooden Shield",
      "Light Steel Shield",
      "Heavy Steel Shield",
      "Tower Shield",
    ]).has(name)
      ? ("Shields" as StoreCategory)
      : ("Armor" as StoreCategory),
    price: 100,
    weight: "varies",
  })),
  ...[
    "Bedroll",
    "Flint and Steel",
    "Waterskin",
    "Grappling Hook",
    "Crowbar",
    "Oil (1 pint)",
    "Torches (5)",
    "Holy Symbol",
    "Spell Component Pouch",
    "Musical Instrument",
    "Traveler's Cloak",
    "Sunrod",
    "Tanglefoot Bag",
    "Thunderstone",
    "Smokestick",
    "Silk Rope",
    "Masterwork Tool",
    "Manacles",
    "Desert Outfit",
    "Cold-Weather Outfit",
    "Steel Coin Purse",
    "Gnomish Device",
    "Kender Hoopak",
  ].map((name) => ({
    name,
    category: "Adventuring Gear" as StoreCategory,
    price: 5,
    weight: "varies",
  })),
  ...[
    "Scroll of Identify",
    "Scroll of Protection from Evil",
    "Wand of Cure Light Wounds",
    "Wand of Magic Missile",
    "Potion of Cure Light Wounds",
    "Potion of Shield of Faith +2",
  ].map((name) => ({
    name,
    category: "Potions, Scrolls & Wands" as StoreCategory,
    price: 25,
    weight: "—",
  })),
  { name: "Goggles of Night", category: "Head", price: 8000, weight: "—" },
  {
    name: "Headband of Intellect +2",
    category: "Head",
    price: 4000,
    weight: "1 lb.",
  },
  {
    name: "Amulet of Natural Armor +1",
    category: "Neck",
    price: 2000,
    weight: "—",
  },
  { name: "Pearl of Power (1st)", category: "Neck", price: 1000, weight: "—" },
  {
    name: "Cloak of Resistance +1",
    category: "Shoulders",
    price: 1000,
    weight: "1 lb.",
  },
  {
    name: "Gloves of Dexterity +2",
    category: "Hands",
    price: 4000,
    weight: "—",
  },
  {
    name: "Belt of Giant Strength +2",
    category: "Waist",
    price: 4000,
    weight: "1 lb.",
  },
  {
    name: "Boots of Elvenkind",
    category: "Feet",
    price: 2500,
    weight: "1 lb.",
  },
  {
    name: "Ring of Protection +1",
    category: "Rings",
    price: 2000,
    weight: "—",
  },
  {
    name: "Bag of Holding",
    category: "Body & Wondrous Items",
    price: 2500,
    weight: "15 lb.",
  },
  {
    name: "Handy Haversack",
    category: "Body & Wondrous Items",
    price: 2000,
    weight: "5 lb.",
  },
  {
    name: "Dust of Disappearance",
    category: "Body & Wondrous Items",
    price: 3500,
    weight: "—",
  },
  {
    name: "Rope of Climbing",
    category: "Body & Wondrous Items",
    price: 3000,
    weight: "3 lb.",
  },
  {
    name: "Decanter of Endless Water",
    category: "Body & Wondrous Items",
    price: 9000,
    weight: "2 lb.",
  },
  {
    name: "Rowboat",
    category: "Mounts & Vehicles",
    price: 50,
    weight: "100 lb.",
  },
  {
    name: "Watercraft, Rowboat",
    category: "Mounts & Vehicles",
    price: 50,
    weight: "100 lb.",
  },
);
const pointBuyCosts: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 6,
  15: 8,
  16: 10,
  17: 13,
  18: 16,
};

function formatRaceModifiers(modifiers: Partial<Record<AbilityName, number>>) {
  const entries = Object.entries(modifiers).filter(([, value]) => value);
  if (!entries.length) return "no ability modifiers";
  return entries
    .map(
      ([ability, value]) =>
        `${ability.toUpperCase()} ${Number(value) > 0 ? "+" : ""}${value}`,
    )
    .join(", ");
}

function formatRaceDetails(race: (typeof raceDefinitions)[string]) {
  const abilities = race.specialAbilities ?? race.traits ?? [];
  return `${formatRaceModifiers(race.abilityModifiers)}; Size ${race.size ?? "not specified"}; ${abilities.length ? abilities.join(", ") : "No special abilities recorded"}`;
}

function isClassSkill(character: Character, skill: string) {
  const classIds = character.classLevels.map((entry) => entry.classId);
  return classIds.some((classId) => classSkills[classId]?.includes(skill));
}

function getAvailableSkillCount(character: Character) {
  let available = 0;
  character.classLevels.forEach((entry, index) => {
    const classDefinition = classDefinitions[entry.classId];
    const pointsPerLevel = Math.max(
      1,
      classDefinition.skillPoints +
        abilityModifier(character.abilities.int) +
        (character.race.toLowerCase() === "human" ? 1 : 0),
    );
    available += pointsPerLevel * (index === 0 ? 4 : 1) * entry.level;
  });
  return available;
}

function getSpentSkillPoints(character: Character) {
  return Object.entries(character.skills).reduce((total, [skill, ranks]) => {
    return (
      total + Number(ranks || 0) * (isClassSkill(character, skill) ? 1 : 2)
    );
  }, 0);
}

function getSkillMaximum(character: Character, skill: string) {
  const characterLevel = character.classLevels.reduce(
    (total, entry) => total + entry.level,
    0,
  );
  return isClassSkill(character, skill)
    ? characterLevel + 3
    : Math.floor((characterLevel + 3) / 2);
}

function getBaseAttackBonus(character: Character) {
  return character.classLevels.reduce((total, entry) => {
    const progression = classDefinitions[entry.classId].baseAttackBonus;
    return (
      total +
      (progression === "good"
        ? entry.level
        : progression === "medium"
          ? Math.floor(entry.level * 0.75)
          : Math.floor(entry.level * 0.5))
    );
  }, 0);
}

function getFeatSlots(character: Character) {
  const slots: { id: string; label: string; fighterOnly: boolean }[] = [];
  const level = character.classLevels.reduce(
    (total, entry) => total + entry.level,
    0,
  );
  for (let slotLevel = 1; slotLevel <= level; slotLevel += 1) {
    if (slotLevel === 1 || slotLevel % 3 === 0)
      slots.push({
        id: `general-${slotLevel}`,
        label: `General feat (level ${slotLevel})`,
        fighterOnly: false,
      });
  }
  if (character.race.toLowerCase() === "human")
    slots.push({
      id: "human-1",
      label: "Human bonus feat",
      fighterOnly: false,
    });
  character.classLevels
    .filter((entry) => entry.classId === "fighter")
    .forEach((entry) => {
      for (let classLevel = 1; classLevel <= entry.level; classLevel += 1) {
        if (classLevel === 1 || classLevel % 2 === 0)
          slots.push({
            id: `fighter-${classLevel}`,
            label: `Fighter bonus feat (fighter level ${classLevel})`,
            fighterOnly: true,
          });
      }
    });
  return slots;
}

function getChosenFeats(character: Character, excludingSlot?: string) {
  return Object.entries(character.featSelections ?? {})
    .filter(([slotId, featId]) => slotId !== excludingSlot && featId)
    .map(([, featId]) => featId);
}

function featQualifies(
  character: Character,
  feat: FeatDefinition,
  slot: { fighterOnly: boolean },
  excludingSlot?: string,
) {
  if (slot.fighterOnly && !feat.fighterBonus) return false;
  const prerequisites = feat.prerequisites;
  if (
    prerequisites?.baseAttackBonus &&
    getBaseAttackBonus(character) < prerequisites.baseAttackBonus
  )
    return false;
  if (
    prerequisites?.abilities &&
    Object.entries(prerequisites.abilities).some(
      ([ability, score]) => character.abilities[ability as AbilityName] < score,
    )
  )
    return false;
  const chosenFeats = getChosenFeats(character, excludingSlot);
  return !(prerequisites?.feats ?? []).some(
    (requiredFeat) => !chosenFeats.includes(requiredFeat),
  );
}

function getAvailableFeats(
  character: Character,
  slot: { fighterOnly: boolean },
  excludingSlot?: string,
) {
  const chosenFeats = getChosenFeats(character, excludingSlot);
  return featCatalog.filter(
    (feat) =>
      !chosenFeats.includes(feat.id) &&
      featQualifies(character, feat, slot, excludingSlot),
  );
}

function normalizeFeatSelections(
  character: Character,
  selections: Record<string, string>,
) {
  const normalized: Record<string, string> = {};
  getFeatSlots(character).forEach((slot) => {
    const featId = selections[slot.id];
    const feat = featCatalog.find((entry) => entry.id === featId);
    if (
      feat &&
      featQualifies(
        { ...character, featSelections: normalized },
        feat,
        slot,
        slot.id,
      )
    )
      normalized[slot.id] = feat.id;
  });
  return normalized;
}

function canIncreaseSkillRank(character: Character, skill: string) {
  const currentRanks = Number(character.skills[skill] || 0);
  const pointCost = isClassSkill(character, skill) ? 1 : 2;
  return (
    currentRanks < getSkillMaximum(character, skill) &&
    getSpentSkillPoints(character) + pointCost <=
      getAvailableSkillCount(character)
  );
}

function getSkillAbility(skill: string): AbilityName | null {
  const dexteritySkills = [
    "Balance",
    "Disable Device",
    "Disguise",
    "Escape Artist",
    "Forgery",
    "Hide",
    "Move Silently",
    "Open Lock",
    "Ride",
    "Sleight of Hand",
    "Tumble",
    "Use Rope",
  ];
  const constitutionSkills = ["Concentration"];
  const intelligenceSkills = [
    "Appraise",
    "Craft",
    "Decipher Script",
    "Search",
    "Spellcraft",
  ];
  const wisdomSkills = [
    "Heal",
    "Listen",
    "Profession",
    "Sense Motive",
    "Spot",
    "Survival",
  ];
  const charismaSkills = [
    "Bluff",
    "Diplomacy",
    "Gather Information",
    "Handle Animal",
    "Intimidate",
    "Perform (act)",
    "Perform (comedy)",
    "Perform (dance)",
    "Perform (keyboard instruments)",
    "Perform (mime)",
    "Perform (oratory)",
    "Perform (percussion instruments)",
    "Perform (sing)",
    "Perform (string instruments)",
    "Perform (wind instruments)",
    "Use Magic Device",
  ];
  const strengthSkills = ["Climb", "Jump", "Swim"];
  if (skill === "Speak Language") return null;
  if (dexteritySkills.includes(skill)) return "dex";
  if (constitutionSkills.includes(skill)) return "con";
  if (intelligenceSkills.includes(skill) || skill.startsWith("Knowledge ("))
    return "int";
  if (wisdomSkills.includes(skill)) return "wis";
  if (charismaSkills.includes(skill)) return "cha";
  if (strengthSkills.includes(skill)) return "str";
  return null;
}

function getRacialSkillBonus(character: Character, skill: string) {
  const race =
    raceDefinitions[character.race.toLowerCase().replaceAll(" ", "-")];
  return race?.racialSkillBonuses?.[skill] ?? 0;
}

function getCharacterRace(character: Character) {
  return (
    raceDefinitions[character.race.toLowerCase().replaceAll(" ", "-")]?.name ??
    character.race
  );
}

function getSkillTotalTooltip(character: Character, skill: string) {
  const ability = getSkillAbility(skill);
  const abilityBonus = ability
    ? abilityModifier(character.abilities[ability])
    : 0;
  const racialBonus = getRacialSkillBonus(character, skill);
  const ranks = Number(character.skills[skill] || 0);
  const rankBreakdown = Object.entries(character.skillRanksByClass ?? {})
    .map(([classId, classSkills]) => ({
      classId,
      ranks: Number(classSkills[skill] || 0),
    }))
    .filter((entry) => entry.ranks > 0);
  const trackedRanks = rankBreakdown.reduce(
    (total, entry) => total + entry.ranks,
    0,
  );
  const lines = [
    ...(ability
      ? [`${abilityLabels[ability]}: ${formatModifier(abilityBonus)}`]
      : []),
    racialBonus
      ? `${getCharacterRace(character)}: ${formatModifier(racialBonus)}`
      : "",
    ...(rankBreakdown.length
      ? rankBreakdown.map(
          (entry) =>
            `${classDefinitions[entry.classId as ClassId]?.name ?? entry.classId}: ${entry.ranks}`,
        )
      : []),
    ...(trackedRanks < ranks
      ? [`Unattributed ranks: ${ranks - trackedRanks}`]
      : []),
  ];
  return lines.filter(Boolean).join("\n");
}

function formatClassDetails(
  classDefinition: (typeof classDefinitions)[ClassId],
) {
  const attack =
    classDefinition.baseAttackBonus === "good"
      ? "good"
      : classDefinition.baseAttackBonus;
  const saves = [
    classDefinition.fortitude === "good" ? "Fortitude" : "",
    classDefinition.reflex === "good" ? "Reflex" : "",
    classDefinition.will === "good" ? "Will" : "",
  ].filter(Boolean);
  return `d${classDefinition.hitDie} Hit Die; ${attack} base attack; ${saves.length ? `${saves.join(", ")} good save${saves.length > 1 ? "s" : ""}` : "no good saves"}; ${classDefinition.skillPoints} skill points per level; ${classDefinition.spellcasting ? "spellcasting class" : "non-spellcasting class"}.`;
}

function formatPrestigeClassDetails(
  prestigeClass: (typeof dragonlancePrestigeClasses)[PrestigeClassId],
) {
  const prerequisites = prestigeClass.prerequisites;
  const requirements = [
    prerequisites.bab ? `BAB +${prerequisites.bab}` : "",
    prerequisites.ability
      ? Object.entries(prerequisites.ability)
          .map(([ability, score]) => `${ability.toUpperCase()} ${score}`)
          .join(", ")
      : "",
    prerequisites.classes?.length
      ? prerequisites.classes
          .map((classId) => classDefinitions[classId].name)
          .join(" or ")
      : "",
    prerequisites.races?.length ? prerequisites.races.join(" or ") : "",
    prerequisites.feats?.length ? prerequisites.feats.join(", ") : "",
  ].filter(Boolean);
  return `${requirements.length ? `Prerequisites: ${requirements.join("; ")}. ` : ""}Features: ${prestigeClass.features.join(", ")}.`;
}

function isPrestigeClassEligible(
  definition: (typeof dragonlancePrestigeClasses)[PrestigeClassId],
  classId: ClassId,
  race: string,
) {
  const prerequisites = definition.prerequisites;
  const raceId = race.toLowerCase().replaceAll(" ", "-");
  return (
    (!prerequisites.classes?.length || prerequisites.classes.includes(classId)) &&
    (!prerequisites.races?.length || prerequisites.races.includes(raceId))
  );
}

const alignmentDescriptions: Record<string, string> = {
  "Lawful Good": "Upholds order and acts for the welfare of others.",
  "Neutral Good": "Helps others while balancing order and freedom.",
  "Chaotic Good": "Protects others through compassion and personal freedom.",
  "Lawful Neutral":
    "Values order, duty, and consistent principles above moral extremes.",
  "True Neutral":
    "Seeks balance or avoids strong commitments to law, chaos, good, or evil.",
  "Chaotic Neutral":
    "Follows personal freedom and instinct rather than imposed order.",
  "Lawful Evil":
    "Uses order, ambition, and rules to pursue selfish or harmful ends.",
  "Neutral Evil": "Pursues personal gain without loyalty to law or chaos.",
  "Chaotic Evil":
    "Acts through cruelty, destruction, and disregard for order or others.",
};

function isNeutralAlignment(alignment: string) {
  return alignment === "True Neutral" || alignment.startsWith("Neutral ") || alignment.endsWith(" Neutral");
}

function isClassAlignmentAllowed(classId: ClassId, alignment: string) {
  if (classId === "barbarian" || classId === "bard")
    return !alignment.startsWith("Lawful ");
  if (classId === "monk") return alignment.startsWith("Lawful ");
  if (classId === "paladin") return alignment === "Lawful Good";
  if (classId === "druid") return isNeutralAlignment(alignment);
  return true;
}

function getClassAlignmentRestriction(classId: ClassId) {
  if (classId === "barbarian" || classId === "bard") return "must be non-lawful";
  if (classId === "monk") return "must be lawful";
  if (classId === "paladin") return "must be Lawful Good";
  if (classId === "druid") return "must be neutral on at least one alignment axis";
  return "";
}

function isHighSorceryAlignmentAllowed(order: Character["highSorceryOrder"], alignment: string) {
  if (order === "white") return alignment.endsWith(" Good") || alignment === "Good";
  if (order === "black") return alignment.endsWith(" Evil") || alignment === "Evil";
  return order === "red" ? isNeutralAlignment(alignment) : true;
}

function alignmentDistance(first: string, second: string) {
  const axes = (alignment: string) => ({
    law: alignment.startsWith("Lawful ") ? -1 : alignment.startsWith("Chaotic ") ? 1 : 0,
    moral: alignment.endsWith(" Good") ? 1 : alignment.endsWith(" Evil") ? -1 : 0,
  });
  const left = axes(first);
  const right = axes(second);
  return Math.max(Math.abs(left.law - right.law), Math.abs(left.moral - right.moral));
}

function App() {
  const [activeSheet, setActiveSheet] = useState("character");
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [creationDraft, setCreationDraft] = useState<Character>(() =>
    cloneCharacter(initialCharacter),
  );
  const [creationOpen, setCreationOpen] = useState(true);
  const [creationLocked, setCreationLocked] = useState(false);
  const [printPreviewHtml, setPrintPreviewHtml] = useState<string | null>(null);
  const [ruleset, setRuleset] = useState<
    "core-35-srd" | "dragonlance-user-pack" | "dragonlance-monster-classes"
  >("core-35-srd");
  const [abilityMethod, setAbilityMethod] = useState<
    "roll" | "pointBuy" | "manual"
  >("manual");
  const [rolledScores, setRolledScores] = useState<number[] | null>(null);
  const [rolledAssignments, setRolledAssignments] = useState<number[] | null>(
    null,
  );
  const [levelUpDraft, setLevelUpDraft] = useState<LevelUpDraft | null>(null);
  const levelUpMode = levelUpDraft !== null;

  const startLevelUp = (classId: ClassId) =>
    setLevelUpDraft(beginLevelUp(character, classId));
  const rollDraftHitPoints = () => {
    if (!levelUpDraft) return;
    const hitPointRoll = rollHitDie(
      classDefinitions[levelUpDraft.classId].hitDie,
    );
    setLevelUpDraft({ ...levelUpDraft, hitPointRoll, validationErrors: [] });
  };
  const confirmLevelUp = () => {
    if (!levelUpDraft) return;
    const validationErrors = validateLevelUp(levelUpDraft);
    if (validationErrors.length) {
      setLevelUpDraft({ ...levelUpDraft, validationErrors });
      return;
    }
    const proposed = {
      ...levelUpDraft.proposed,
      hitPoints:
        character.hitPoints +
        hitPointGain(character, levelUpDraft.hitPointRoll!),
    };
    setCharacter(proposed);
    setLevelUpDraft(null);
  };
  const updateCreationDraft = <Key extends keyof Character>(
    key: Key,
    value: Character[Key],
  ) => setCreationDraft((current) => ({ ...current, [key]: value }));
  const updateCreationAbility = (ability: AbilityName, value: number) =>
    setCreationDraft((current) => ({
      ...current,
      abilities: { ...current.abilities, [ability]: value },
    }));
  const updateSkillRanks = (skill: string, change: number) => {
    const update = (current: Character) => {
      const classSkill = isClassSkill(current, skill);
      const currentRanks = Number(current.skills[skill] || 0);
      const maxRanks = getSkillMaximum(current, skill);
      const nextRanks = Math.max(0, Math.min(maxRanks, currentRanks + change));
      const currentSpent = getSpentSkillPoints(current);
      const pointCost = classSkill ? 1 : 2;
      if (
        change > 0 &&
        currentSpent + pointCost > getAvailableSkillCount(current)
      )
        return current;
      const classId = current.classLevels.at(-1)?.classId;
      if (!classId) return current;
      const currentClassRanks =
        current.skillRanksByClass?.[classId]?.[skill] ?? 0;
      const nextClassRanks = Math.max(
        0,
        currentClassRanks + (nextRanks - currentRanks),
      );
      return {
        ...current,
        skills: { ...current.skills, [skill]: nextRanks },
        skillRanksByClass: {
          ...(current.skillRanksByClass ?? {}),
          [classId]: {
            ...(current.skillRanksByClass?.[classId] ?? {}),
            [skill]: nextClassRanks,
          },
        },
      };
    };
    if (creationOpen && !creationLocked) setCreationDraft(update);
    else setCharacter(update);
  };
  const updateFeatSelection = (slotId: string, featId: string) => {
    const update = (current: Character) => {
      const featSelections = normalizeFeatSelections(current, {
        ...(current.featSelections ?? {}),
        [slotId]: featId,
      });
      return {
        ...current,
        featSelections,
        feats: Object.values(featSelections).filter(Boolean),
      };
    };
    if (creationOpen && !creationLocked) setCreationDraft(update);
    else if (levelUpDraft)
      setLevelUpDraft({
        ...levelUpDraft,
        proposed: update(levelUpDraft.proposed),
      });
    else setCharacter(update);
  };
  const resetCreationChoices = (draft: Character): Character => ({
    ...draft,
    feats: [],
    featSelections: {},
    skills: {},
    skillRanksByClass: {},
  });
  const updateLanguages = (languages: string[]) => {
    const update = (current: Character) => ({
      ...current,
      languages: [...new Set(languages)],
    });
    if (creationOpen && !creationLocked) setCreationDraft(update);
    else if (levelUpDraft)
      setLevelUpDraft({
        ...levelUpDraft,
        proposed: update(levelUpDraft.proposed),
      });
    else setCharacter(update);
  };
  const updateKnownSpells = (knownSpells: string[]) => {
    const update = (current: Character) => ({ ...current, knownSpells });
    if (creationOpen && !creationLocked) setCreationDraft(update);
    else if (levelUpDraft)
      setLevelUpDraft({
        ...levelUpDraft,
        proposed: update(levelUpDraft.proposed),
      });
    else setCharacter(update);
  };
  const updatePreparedSpells = (preparedSpells: string[]) => {
    const update = (current: Character) => ({ ...current, preparedSpells });
    if (creationOpen && !creationLocked) setCreationDraft(update);
    else if (levelUpDraft)
      setLevelUpDraft({
        ...levelUpDraft,
        proposed: update(levelUpDraft.proposed),
      });
    else setCharacter(update);
  };
  const updateEquipment = (equipment: Record<string, string>) => {
    const update = (current: Character) => ({ ...current, equipment });
    if (creationOpen && !creationLocked)
      setCreationDraft(update(creationDraft));
    else if (levelUpDraft)
      setLevelUpDraft({
        ...levelUpDraft,
        proposed: update(levelUpDraft.proposed),
      });
    else setCharacter(update(character));
  };
  const updateInventory = (inventory: Record<string, number>) => {
    const update = (current: Character) => ({ ...current, inventory });
    if (creationOpen && !creationLocked)
      setCreationDraft(update(creationDraft));
    else if (levelUpDraft)
      setLevelUpDraft({
        ...levelUpDraft,
        proposed: update(levelUpDraft.proposed),
      });
    else setCharacter(update(character));
  };
  const updateCreationRace = (race: string) =>
    setCreationDraft(resetCreationChoices(changeRace(creationDraft, race)));
  const updateCreationClass = (classId: ClassId) =>
    setCreationDraft(
      resetCreationChoices({
        ...creationDraft,
        classLevels: [{ classId, level: 1 }],
        alignment: "",
        deity: undefined,
        highSorceryOrder: undefined,
      }),
    );
  const getCreationAbilities = () =>
    abilityMethod === "roll" && rolledScores && rolledAssignments
      ? (Object.fromEntries(
          abilityNames.map((ability, index) => [
            ability,
            rolledScores[rolledAssignments[index]] +
              (raceDefinitions[
                creationDraft.race.toLowerCase().replaceAll(" ", "-")
              ]?.abilityModifiers[ability] ?? 0),
          ]),
        ) as Character["abilities"])
      : creationDraft.abilities;
  useEffect(() => {
    if (abilityMethod !== "roll" || !rolledScores || !rolledAssignments) return;
    const nextAbilities = getCreationAbilities();
    setCreationDraft((current) => {
      const unchanged = abilityNames.every(
        (ability) => current.abilities[ability] === nextAbilities[ability],
      );
      return unchanged ? current : { ...current, abilities: nextAbilities };
    });
  }, [abilityMethod, rolledScores, rolledAssignments]);
  const createCharacter = () => {
    const classId = creationDraft.classLevels[0].classId;
    setCharacter({
      ...cloneCharacter(creationDraft),
      abilities: getCreationAbilities(),
      classFeatures: startingClassFeatures[classId] ?? [],
      hitPoints: Math.max(
        1,
        classDefinitions[classId].hitDie +
          abilityModifier(creationDraft.abilities.con),
      ),
    });
    setLevelUpDraft(null);
    setCreationLocked(true);
    setCreationOpen(false);
  };
  const reopenCreation = () => {
    setCreationDraft(cloneCharacter(character));
    setCreationLocked(false);
    setCreationOpen(true);
    setLevelUpDraft(null);
  };
  const createNewCharacter = () => {
    setCharacter(cloneCharacter(initialCharacter));
    setCreationDraft(cloneCharacter(initialCharacter));
    setCreationLocked(false);
    setCreationOpen(true);
    setLevelUpDraft(null);
    setAbilityMethod("manual");
    setRolledScores(null);
    setRolledAssignments(null);
  };
  const showPrintPreview = () => {
    const appShell = document.querySelector<HTMLElement>(".app-shell");
    if (!appShell) return;
    const preview = appShell.cloneNode(true) as HTMLElement;
    preview
      .querySelectorAll(
        ".app-header, .sheet-tabs, .creation-area, .equipment-store-header, .equipment-store-grid, .store-size-row, .equipment-inventory-actions",
      )
      .forEach((element) => element.remove());
    setPrintPreviewHtml(preview.innerHTML);
  };
  const discardCreation = () => {
    if (creationLocked) return;
    setCreationDraft(cloneCharacter(character));
    setCreationOpen(false);
    if (character.name === initialCharacter.name) setCreationOpen(true);
  };
  const calculatedCharacter = !creationLocked
    ? {
        ...creationDraft,
        abilities: getCreationAbilities(),
        hitPoints: Math.max(
          1,
          classDefinitions[creationDraft.classLevels[0].classId].hitDie +
            abilityModifier(creationDraft.abilities.con),
        ),
      }
    : character;
  const displayedCharacter = levelUpDraft?.proposed ?? calculatedCharacter;
  const hasSpellcasting = displayedCharacter.classLevels.some(
    (level) => classDefinitions[level.classId].spellcasting,
  );
  const visibleSheet =
    !hasSpellcasting && activeSheet === "spells" ? "character" : activeSheet;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-title">
          <p className="eyebrow">D&D 3.5 rules workspace</p>
          <h1>
            D&D 3.5 Character Builder <span>2.0</span>
          </h1>
        </div>
        <div className="header-actions">
          <button
            className="quiet-button print-button"
            type="button"
            onClick={showPrintPreview}
          >
            Print
          </button>
          <button className="quiet-button" type="button">
            Save
          </button>
          <button className="quiet-button" type="button">
            Export
          </button>
          {creationLocked && (
            <>
              <button className="quiet-button" type="button" onClick={reopenCreation}>
                Reopen Setup
              </button>
              <button className="quiet-button" type="button" onClick={createNewCharacter}>
                Create New
              </button>
            </>
          )}
          {!creationLocked && (
            <button className="quiet-button" type="button" onClick={discardCreation}>
              Discard / Clear
            </button>
          )}
          {creationLocked && (
            <button
              className="level-button"
              type="button"
              onClick={() => startLevelUp("fighter")}
            >
              Enter Level-Up Mode
            </button>
          )}
        </div>
      </header>
      {printPreviewHtml && (
        <div className="print-preview-modal" role="dialog" aria-modal="true">
          <div className="print-preview-dialog">
            <div className="print-preview-header">
              <h2>Print Preview</h2>
              <button
                className="quiet-button"
                type="button"
                onClick={() => setPrintPreviewHtml(null)}
              >
                Close Preview
              </button>
            </div>
            <div
              className="print-preview-content"
              dangerouslySetInnerHTML={{ __html: printPreviewHtml }}
            />
            <div className="print-preview-actions">
              <button
                className="quiet-button"
                type="button"
                onClick={() => setPrintPreviewHtml(null)}
              >
                Cancel
              </button>
              <button
                className="level-button"
                type="button"
                onClick={() => {
                  setPrintPreviewHtml(null);
                  window.print();
                }}
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
      {levelUpMode && levelUpDraft && (
        <section className="level-banner">
          <div>
            <strong>Level-Up Draft</strong>
            <span>
              Choices are provisional until you confirm the new level.
            </span>
            <label className="draft-class">
              Class
              <select
                value={levelUpDraft.classId}
                onChange={(event) =>
                  startLevelUp(event.target.value as ClassId)
                }
              >
                {Object.values(classDefinitions).map((definition) => (
                  <option key={definition.id} value={definition.id}>
                    {definition.name}
                  </option>
                ))}
              </select>
            </label>
            <span>
              Hit die: d{classDefinitions[levelUpDraft.classId].hitDie}{" "}
              {levelUpDraft.hitPointRoll === null
                ? "not rolled"
                : `roll ${levelUpDraft.hitPointRoll}`}
            </span>
            <button
              className="quiet-button"
              type="button"
              onClick={rollDraftHitPoints}
            >
              Roll Hit Points
            </button>
            {levelUpDraft.validationErrors.map((error) => (
              <small className="validation-error" key={error}>
                {error}
              </small>
            ))}
          </div>
          <div className="level-actions">
            <button
              className="quiet-button"
              type="button"
              onClick={() => setLevelUpDraft(null)}
            >
              Discard Draft
            </button>
            <button
              className="level-button"
              type="button"
              onClick={confirmLevelUp}
            >
              Confirm Level-Up
            </button>
          </div>
        </section>
      )}
      <nav className="sheet-tabs" aria-label="Character sheets">
        {[
          ["character", "Character"],
          ["equipment", "Equipment"],
          ...(hasSpellcasting ? [["spells", "Spells"]] : []),
        ].map(([id, label]) => (
          <button
            key={id}
            className={visibleSheet === id ? "active" : ""}
            type="button"
            onClick={() => setActiveSheet(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      {visibleSheet === "character" && (
        <>
          {!creationLocked && (
            <CreationPanel
              draft={creationDraft}
              open={creationOpen}
              locked={creationLocked}
              method={abilityMethod}
              rolledScores={rolledScores}
              onRolledScoresChange={setRolledScores}
              rolledAssignments={rolledAssignments}
              onRolledAssignmentsChange={setRolledAssignments}
              onToggle={() => setCreationOpen(!creationOpen)}
              onMethodChange={setAbilityMethod}
              onChange={updateCreationDraft}
              onClassChange={updateCreationClass}
              onRaceChange={updateCreationRace}
              ruleset={ruleset}
              onRulesetChange={(nextRuleset) => {
                setRuleset(nextRuleset);
                if (
                  nextRuleset === "core-35-srd" &&
                  raceDefinitions[
                    creationDraft.race.toLowerCase().replaceAll(" ", "-")
                  ]?.source !== "core-35-srd"
                ) {
                  updateCreationRace("Human");
                }
              }}
              onAbilityChange={updateCreationAbility}
              onCreate={createCharacter}
            />
          )}
          <CharacterSheet
            character={displayedCharacter}
            onSkillRankChange={updateSkillRanks}
            onFeatChange={updateFeatSelection}
            onLanguagesChange={updateLanguages}
            allowFeatSelection={!creationLocked || levelUpMode}
            finalized={creationLocked && !levelUpMode}
            editable={!creationLocked && !levelUpMode}
            onCharacterNameChange={(name) => updateCreationDraft("name", name)}
            onPlayerNameChange={(player) => updateCreationDraft("player", player)}
          />
        </>
      )}
      {visibleSheet === "equipment" && (
        <EquipmentSheet
          key={displayedCharacter.race}
          character={displayedCharacter}
          onEquipmentChange={updateEquipment}
          onInventoryChange={updateInventory}
        />
      )}
      {visibleSheet === "spells" && (
        <SpellSheet
          character={displayedCharacter}
          onKnownSpellsChange={updateKnownSpells}
          onPreparedSpellsChange={updatePreparedSpells}
          editable={!creationLocked || levelUpMode}
        />
      )}
    </main>
  );
}

function CreationPanel({
  draft,
  open,
  locked,
  method,
  rolledScores,
  onRolledScoresChange,
  rolledAssignments,
  onRolledAssignmentsChange,
  onToggle,
  onMethodChange,
  onChange,
  onClassChange,
  onRaceChange,
  ruleset,
  onRulesetChange,
  onAbilityChange,
  onCreate,
}: {
  draft: Character;
  open: boolean;
  locked: boolean;
  method: "roll" | "pointBuy" | "manual";
  rolledScores: number[] | null;
  onRolledScoresChange: (scores: number[]) => void;
  rolledAssignments: number[] | null;
  onRolledAssignmentsChange: (assignments: number[]) => void;
  onToggle: () => void;
  onMethodChange: (method: "roll" | "pointBuy" | "manual") => void;
  onChange: <Key extends keyof Character>(
    key: Key,
    value: Character[Key],
  ) => void;
  onClassChange: (classId: ClassId) => void;
  onRaceChange: (race: string) => void;
  ruleset:
    "core-35-srd" | "dragonlance-user-pack" | "dragonlance-monster-classes";
  onRulesetChange: (
    ruleset:
      "core-35-srd" | "dragonlance-user-pack" | "dragonlance-monster-classes",
  ) => void;
  onAbilityChange: (ability: AbilityName, value: number) => void;
  onCreate: () => void;
}) {
  const [raceMenuOpen, setRaceMenuOpen] = useState(false);
  const [classMenuOpen, setClassMenuOpen] = useState(false);
  const [prestigeClassMenuOpen, setPrestigeClassMenuOpen] = useState(false);
  const [alignmentMenuOpen, setAlignmentMenuOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState({
    race: "",
    class: "",
    prestige: "",
    alignment: "",
  });
  const [menuTooltip, setMenuTooltip] = useState({
    field: "",
    description: "",
  });
  const toggleMenu = (menu: "race" | "class" | "prestige" | "alignment") => {
    const nextOpen =
      menu === "race"
        ? !raceMenuOpen
        : menu === "class"
          ? !classMenuOpen
          : menu === "prestige"
            ? !prestigeClassMenuOpen
            : !alignmentMenuOpen;
    setRaceMenuOpen(menu === "race" && nextOpen);
    setClassMenuOpen(menu === "class" && nextOpen);
    setPrestigeClassMenuOpen(menu === "prestige" && nextOpen);
    setAlignmentMenuOpen(menu === "alignment" && nextOpen);
    if (!nextOpen) setMenuTooltip({ field: "", description: "" });
    if (nextOpen) setMenuQuery((current) => ({ ...current, [menu]: "" }));
  };
  const matchesMenuQuery = (label: string, menu: keyof typeof menuQuery) =>
    label.toLowerCase().includes(menuQuery[menu].toLowerCase().trim());
  useEffect(() => {
    const closeMenus = () => {
      setRaceMenuOpen(false);
      setClassMenuOpen(false);
      setPrestigeClassMenuOpen(false);
      setAlignmentMenuOpen(false);
      setMenuTooltip({ field: "", description: "" });
    };
    const handleDocumentPointerDown = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        !event.target.closest(".race-field, .class-field")
      ) {
        closeMenus();
      }
    };
    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenus();
    };
    document.addEventListener("pointerdown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown);
      document.removeEventListener("keydown", handleDocumentKeyDown);
    };
  }, []);
  const classId = draft.classLevels[0].classId;
  const selectedRace =
    raceDefinitions[draft.race.toLowerCase().replaceAll(" ", "-")] ??
    raceDefinitions.human;
  const availableClasses = Object.values(classDefinitions).filter(
    (definition) =>
      (definition.source === "core-35-srd" || ruleset !== "core-35-srd") &&
      (!draft.alignment ||
        isClassAlignmentAllowed(definition.id, draft.alignment) ||
        definition.id === classId),
  );
  const availableAlignments = Object.keys(alignmentDescriptions).filter((alignment) =>
    isClassAlignmentAllowed(classId, alignment),
  );
  const availableDeities = deityDefinitions.filter(
    (deity) =>
      (deity.source === "core-35-srd" || ruleset !== "core-35-srd") &&
      (classId === "cleric"
        ? alignmentDistance(draft.alignment, deity.alignment) <= 1
        : classId === "paladin"
          ? deity.alignment === "Lawful Good"
          : true),
  );
  const dragonlanceRuleset = ruleset !== "core-35-srd";
  const availablePrestigeClasses = Object.values(dragonlancePrestigeClasses).filter(
    (definition) =>
      !["white-robed-wizard", "red-robed-wizard", "black-robed-wizard"].includes(
        definition.id,
      ) && isPrestigeClassEligible(definition, classId, draft.race),
  );
  const raceOptions = Object.values(raceDefinitions).filter(
    (race) =>
      (race.source === "core-35-srd" ||
        race.source === "dragonlance-user-pack") &&
      (ruleset === "dragonlance-monster-classes" || !race.levelAdjustment),
  );
  const pointBuyTotal = abilityNames.reduce(
    (total, ability) => total + (pointBuyCosts[draft.abilities[ability]] ?? 0),
    0,
  );
  const rollAbilities = () => {
    const scores = abilityNames.map(() => {
      const dice = [1, 2, 3, 4]
        .map(() => Math.floor(Math.random() * 6) + 1)
        .sort((a, b) => a - b);
      return dice[1] + dice[2] + dice[3];
    });
    onRolledScoresChange(scores);
    onRolledAssignmentsChange(abilityNames.map((_, index) => index));
    onAbilityChange(
      "str",
      scores[0] + (selectedRace.abilityModifiers.str ?? 0),
    );
    abilityNames
      .slice(1)
      .forEach((ability, index) =>
        onAbilityChange(
          ability,
          scores[index + 1] + (selectedRace.abilityModifiers[ability] ?? 0),
        ),
      );
  };
  const assignRolledScore = (ability: AbilityName, poolIndex: number) => {
    if (!rolledScores || !rolledAssignments) return;
    const abilityIndex = abilityNames.indexOf(ability);
    const currentPoolIndex = rolledAssignments[abilityIndex];
    const otherAbilityIndex = rolledAssignments.indexOf(poolIndex);
    const nextAssignments = [...rolledAssignments];
    nextAssignments[abilityIndex] = poolIndex;
    if (otherAbilityIndex !== -1 && otherAbilityIndex !== abilityIndex) {
      nextAssignments[otherAbilityIndex] = currentPoolIndex;
    }
    onRolledAssignmentsChange(nextAssignments);
    onAbilityChange(
      ability,
      rolledScores[poolIndex] + (selectedRace.abilityModifiers[ability] ?? 0),
    );
    if (otherAbilityIndex !== -1 && otherAbilityIndex !== abilityIndex) {
      const otherAbility = abilityNames[otherAbilityIndex];
      onAbilityChange(
        otherAbility,
        rolledScores[currentPoolIndex] +
          (selectedRace.abilityModifiers[otherAbility] ?? 0),
      );
    }
  };
  const creationErrors: string[] = [];
  if (!draft.name.trim()) creationErrors.push("Enter a character name.");
  if (!draft.player.trim()) creationErrors.push("Enter a player name.");
  if (!draft.alignment) creationErrors.push("Choose an alignment.");
  if (!isClassAlignmentAllowed(classId, draft.alignment))
    creationErrors.push(
      `${classDefinitions[classId].name} ${getClassAlignmentRestriction(classId)}.`,
    );
  const selectedDeity = deityDefinitions.find((deity) => deity.id === draft.deity);
  if ((classId === "cleric" || classId === "paladin") && !selectedDeity)
    creationErrors.push(`${classDefinitions[classId].name} characters must choose a deity.`);
  if (selectedDeity && classId === "cleric" && alignmentDistance(draft.alignment, selectedDeity.alignment) > 1)
    creationErrors.push(`Cleric alignment must be within one step of ${selectedDeity.name}.`);
  if (selectedDeity && classId === "paladin" && selectedDeity.alignment !== "Lawful Good")
    creationErrors.push("Paladins must choose a Lawful Good deity.");
    if (dragonlanceRuleset && draft.highSorceryOrder &&
      (classId === "wizard" || classId === "sorcerer") &&
      !isHighSorceryAlignmentAllowed(draft.highSorceryOrder, draft.alignment))
    creationErrors.push("That High Sorcery order is not legal for this alignment.");
  if (method === "pointBuy" && pointBuyTotal !== 25)
    creationErrors.push("Point buy must use exactly 25 points.");
  if (
    method === "roll" &&
    (!rolledScores ||
      rolledScores.length !== abilityNames.length ||
      !rolledAssignments ||
      rolledAssignments.length !== abilityNames.length ||
      new Set(rolledAssignments).size !== abilityNames.length)
  )
    creationErrors.push("Roll and assign all six ability scores.");
  if (
    method === "manual" &&
    abilityNames.some((ability) => {
      const score = draft.abilities[ability];
      return score < 3 || score > 18;
    })
  )
    creationErrors.push("Set every manual ability score between 3 and 18.");
  if (getSpentSkillPoints(draft) !== getAvailableSkillCount(draft))
    creationErrors.push("Spend all available starting skill points.");
  if (getFeatSlots(draft).some((slot) => !draft.featSelections?.[slot.id]))
    creationErrors.push("Select every required starting feat.");
  if (!(draft.languages ?? []).length)
    creationErrors.push("Select at least one starting language.");
  if (!Object.values(draft.inventory).some((quantity) => quantity > 0))
    creationErrors.push("Select at least one piece of starting equipment.");
  const spellcastingLevel = draft.classLevels.find(
    (level) => classDefinitions[level.classId].spellcasting,
  );
  if (spellcastingLevel) {
    const spellcastingClass = classDefinitions[spellcastingLevel.classId];
    const castingAbility: Partial<Record<ClassId, AbilityName>> = {
      bard: "cha",
      cleric: "wis",
      druid: "wis",
      paladin: "cha",
      ranger: "wis",
      sorcerer: "cha",
      wizard: "int",
      mystic: "wis",
    };
    const castingModifier = abilityModifier(
      draft.abilities[castingAbility[spellcastingClass.id] ?? "int"],
    );
    const bonusSpells = (level: number) =>
      level < 1 || castingModifier < level
        ? 0
        : Math.floor((castingModifier - level) / 4) + 1;
    const knownLimits: Partial<Record<ClassId, number[]>> = {
      bard: [4, 2],
      sorcerer: [4, 2],
    };
    const learningMode =
      spellcastingClass.id === "wizard"
        ? "Spellbook"
        : spellcastingClass.id === "bard" || spellcastingClass.id === "sorcerer"
          ? "Spells Known"
          : "Prepared Spells";
    const classSpells = spells.filter((spell) =>
      spell.classes.includes(spellcastingClass.id),
    );
    const selectedSpells = new Set(draft.knownSpells);
    const availableLevels = (spellSlots[spellcastingClass.id] ?? [])
      .map((slots, level) => (slots[0] > 0 ? level : -1))
      .filter((level) => level >= 0);
    availableLevels.forEach((level) => {
      const required =
        learningMode === "Spells Known"
          ? (knownLimits[spellcastingClass.id]?.[level] ?? 0) +
            (level > 0 ? bonusSpells(level) : 0)
          : learningMode === "Spellbook"
            ? level === 0
              ? classSpells.filter((spell) => spell.level === 0).length
              : level === 1
                ? 3 + Math.max(0, castingModifier)
                : 2
            : (spellSlots[spellcastingClass.id]?.[level]?.[0] ?? 0) +
              bonusSpells(level);
      const selected = classSpells.filter(
        (spell) => spell.level === level && selectedSpells.has(spell.name),
      ).length;
      if (selected < required)
        creationErrors.push(
          `Select ${required} level ${level} ${learningMode.toLowerCase()} spell${required === 1 ? "" : "s"}.`,
        );
    });
  }
  return (
    <section className={`creation-area ${locked ? "creation-locked" : ""}`}>
      <div className="creation-heading">
        <div>
          <p className="eyebrow">Character setup</p>
          <h2>Create Character</h2>
          <span>
            {locked
              ? "Character creation is locked after confirmation."
              : "Choose your starting identity and ability generation method."}
          </span>
        </div>
        <div className="ruleset-control">
          {locked ? (
            <span className="ruleset-value">
              {ruleset === "core-35-srd"
                ? "Core 3.5 SRD"
                : ruleset === "dragonlance-monster-classes"
                  ? "Dragonlance (Monster Classes Allowed)"
                  : "Dragonlance"}
            </span>
          ) : (
            <select
              value={ruleset}
              onChange={(event) =>
                onRulesetChange(event.target.value as typeof ruleset)
              }
            >
              <option value="core-35-srd">Core 3.5 SRD</option>
              <option value="dragonlance-user-pack">Dragonlance</option>
              <option value="dragonlance-monster-classes">
                Dragonlance (Monster Classes Allowed)
              </option>
            </select>
          )}
        </div>
        <button
          className="quiet-button"
          type="button"
          onClick={onToggle}
          disabled={locked}
        >
          {locked ? "Locked" : open ? "Close Setup" : "Open Setup"}
        </button>
      </div>
      {open && !locked && (
        <Panel title="Starting Details" className="creation-panel">
          <div className="creation-grid">
            <label>
              Character name
              <input
                value={draft.name}
                onChange={(event) => onChange("name", event.target.value)}
              />
            </label>
            <label>
              Player
              <input
                value={draft.player}
                onChange={(event) => onChange("player", event.target.value)}
              />
            </label>
            <label className="race-field">
              Race
              <button
                className="race-trigger"
                type="button"
                aria-expanded={raceMenuOpen}
                onClick={() => toggleMenu("race")}
              >
                {draft.race}
                <span aria-hidden="true">▾</span>
              </button>
              {raceMenuOpen && (
                <div
                  className="race-menu"
                  role="listbox"
                  aria-label="Race choices"
                  onKeyDown={handleScrollableMenuKeyDown}
                >
                  <div className="menu-search">
                    <input
                      autoFocus
                      value={menuQuery.race}
                      onChange={(event) =>
                        setMenuQuery({ ...menuQuery, race: event.target.value })
                      }
                      placeholder="Search races"
                      aria-label="Search races"
                    />
                  </div>
                  {raceOptions
                    .filter((race) => matchesMenuQuery(race.name, "race"))
                    .map((race) => (
                      <button
                        className={`race-option ${draft.race === race.name ? "selected" : ""}`}
                        key={race.id}
                        type="button"
                        role="option"
                        aria-selected={draft.race === race.name}
                        title={`${formatRaceDetails(race)}${race.levelAdjustment ? `; Level adjustment +${race.levelAdjustment}` : ""}`}
                        onMouseEnter={() =>
                          setMenuTooltip({
                            field: "race",
                            description: `${formatRaceDetails(race)}${race.levelAdjustment ? `; Level adjustment +${race.levelAdjustment}` : ""}`,
                          })
                        }
                        onFocus={() =>
                          setMenuTooltip({
                            field: "race",
                            description: `${formatRaceDetails(race)}${race.levelAdjustment ? `; Level adjustment +${race.levelAdjustment}` : ""}`,
                          })
                        }
                        onMouseLeave={() =>
                          setMenuTooltip({ field: "", description: "" })
                        }
                        onBlur={() =>
                          setMenuTooltip({ field: "", description: "" })
                        }
                        onClick={() => {
                          onRaceChange(race.name);
                          setRaceMenuOpen(false);
                          setMenuTooltip({ field: "", description: "" });
                        }}
                      >
                        <span>{race.name}</span>
                      </button>
                    ))}
                </div>
              )}
              {menuTooltip.field === "race" && (
                <span className="creation-menu-tooltip" role="tooltip">
                  {menuTooltip.description}
                </span>
              )}
            </label>
            <label>
              Class
              <div className="class-field">
                <button
                  className="race-trigger"
                  type="button"
                  aria-expanded={classMenuOpen}
                  onClick={() => toggleMenu("class")}
                >
                  {classDefinitions[classId].name}
                  <span aria-hidden="true">▾</span>
                </button>
                {classMenuOpen && (
                  <div
                    className="race-menu"
                    role="listbox"
                    aria-label="Class choices"
                    onKeyDown={handleScrollableMenuKeyDown}
                  >
                    <div className="menu-search">
                      <input
                        autoFocus
                        value={menuQuery.class}
                        onChange={(event) =>
                          setMenuQuery({
                            ...menuQuery,
                            class: event.target.value,
                          })
                        }
                        placeholder="Search classes"
                        aria-label="Search classes"
                      />
                    </div>
                    {availableClasses
                      .filter((definition) =>
                        matchesMenuQuery(definition.name, "class"),
                      )
                      .map((definition) => (
                        <button
                          className={`race-option ${classId === definition.id ? "selected" : ""}`}
                          key={definition.id}
                          type="button"
                          role="option"
                          aria-selected={classId === definition.id}
                          title={formatClassDetails(definition)}
                          onMouseEnter={() =>
                            setMenuTooltip({
                              field: "class",
                              description: formatClassDetails(definition),
                            })
                          }
                          onFocus={() =>
                            setMenuTooltip({
                              field: "class",
                              description: formatClassDetails(definition),
                            })
                          }
                          onMouseLeave={() =>
                            setMenuTooltip({ field: "", description: "" })
                          }
                          onBlur={() =>
                            setMenuTooltip({ field: "", description: "" })
                          }
                          onClick={() => {
                            onClassChange(definition.id);
                            setClassMenuOpen(false);
                            setMenuTooltip({ field: "", description: "" });
                          }}
                        >
                          <span>{definition.name}</span>
                        </button>
                      ))}
                  </div>
                )}
                {menuTooltip.field === "class" && (
                  <span className="creation-menu-tooltip" role="tooltip">
                    {menuTooltip.description}
                  </span>
                )}
              </div>
            </label>
            <label className="prestige-creation-field">
              Prestige Class
              <div className="class-field menu-left">
                <button
                  className="race-trigger"
                  type="button"
                  aria-expanded={prestigeClassMenuOpen}
                  onClick={() => toggleMenu("prestige")}
                >
                  {draft.prestigeClass
                    ? dragonlancePrestigeClasses[draft.prestigeClass].name
                    : "None"}
                  <span aria-hidden="true">▾</span>
                </button>
                {prestigeClassMenuOpen && (
                  <div
                    className="race-menu"
                    role="listbox"
                    aria-label="Prestige class choices"
                    onKeyDown={handleScrollableMenuKeyDown}
                  >
                    <div className="menu-search">
                      <input
                        autoFocus
                        value={menuQuery.prestige}
                        onChange={(event) =>
                          setMenuQuery({
                            ...menuQuery,
                            prestige: event.target.value,
                          })
                        }
                        placeholder="Search prestige classes"
                        aria-label="Search prestige classes"
                      />
                    </div>
                    <button
                      className={`race-option ${!draft.prestigeClass ? "selected" : ""}`}
                      type="button"
                      role="option"
                      aria-selected={!draft.prestigeClass}
                      title="Optional prestige class; no prestige-class prerequisites or features are applied."
                      onMouseEnter={() =>
                        setMenuTooltip({
                          field: "prestige",
                          description:
                            "Optional prestige class; no prestige-class prerequisites or features are applied.",
                        })
                      }
                      onFocus={() =>
                        setMenuTooltip({
                          field: "prestige",
                          description:
                            "Optional prestige class; no prestige-class prerequisites or features are applied.",
                        })
                      }
                      onMouseLeave={() =>
                        setMenuTooltip({ field: "", description: "" })
                      }
                      onBlur={() =>
                        setMenuTooltip({ field: "", description: "" })
                      }
                      onClick={() => {
                        onChange("prestigeClass", undefined);
                        onChange("highSorceryOrder", undefined);
                        setPrestigeClassMenuOpen(false);
                        setMenuTooltip({ field: "", description: "" });
                      }}
                    >
                      <span>None</span>
                    </button>
                    {availablePrestigeClasses
                      .filter((definition) =>
                        matchesMenuQuery(definition.name, "prestige"),
                      )
                      .map((definition) => (
                        <button
                          className={`race-option ${draft.prestigeClass === definition.id ? "selected" : ""}`}
                          key={definition.id}
                          type="button"
                          role="option"
                          aria-selected={draft.prestigeClass === definition.id}
                          title={formatPrestigeClassDetails(definition)}
                          onMouseEnter={() =>
                            setMenuTooltip({
                              field: "prestige",
                              description:
                                formatPrestigeClassDetails(definition),
                            })
                          }
                          onFocus={() =>
                            setMenuTooltip({
                              field: "prestige",
                              description:
                                formatPrestigeClassDetails(definition),
                            })
                          }
                          onMouseLeave={() =>
                            setMenuTooltip({ field: "", description: "" })
                          }
                          onBlur={() =>
                            setMenuTooltip({ field: "", description: "" })
                          }
                          onClick={() => {
                            onChange("prestigeClass", definition.id);
                            if (definition.id !== "wizard-of-high-sorcery")
                              onChange("highSorceryOrder", undefined);
                            setPrestigeClassMenuOpen(false);
                            setMenuTooltip({ field: "", description: "" });
                          }}
                        >
                          <span>{definition.name}</span>
                        </button>
                      ))}
                  </div>
                )}
                {menuTooltip.field === "prestige" && (
                  <span className="creation-menu-tooltip" role="tooltip">
                    {menuTooltip.description}
                  </span>
                )}
              </div>
            </label>
            <label className="alignment-creation-field">
              Alignment
              <div className="class-field menu-left">
                <button
                  className="race-trigger"
                  type="button"
                  aria-expanded={alignmentMenuOpen}
                  onClick={() => toggleMenu("alignment")}
                >
                  {draft.alignment || "No alignment selected"}
                  <span aria-hidden="true">▾</span>
                </button>
                {alignmentMenuOpen && (
                  <div
                    className="race-menu"
                    role="listbox"
                    aria-label="Alignment choices"
                    onKeyDown={handleScrollableMenuKeyDown}
                  >
                    <div className="menu-search">
                      <input
                        autoFocus
                        value={menuQuery.alignment}
                        onChange={(event) =>
                          setMenuQuery({
                            ...menuQuery,
                            alignment: event.target.value,
                          })
                        }
                        placeholder="Search alignments"
                        aria-label="Search alignments"
                      />
                    </div>
                    <button
                      className={`race-option ${!draft.alignment ? "selected" : ""}`}
                      type="button"
                      role="option"
                      aria-selected={!draft.alignment}
                      onClick={() => {
                        onChange("alignment", "");
                        setAlignmentMenuOpen(false);
                        setMenuTooltip({ field: "", description: "" });
                      }}
                    >
                      <span>No alignment selected</span>
                    </button>
                    {availableAlignments
                      .filter((alignment) =>
                        matchesMenuQuery(alignment, "alignment"),
                      )
                      .map((alignment) => (
                        <button
                          className={`race-option ${draft.alignment === alignment ? "selected" : ""}`}
                          key={alignment}
                          type="button"
                          role="option"
                          aria-selected={draft.alignment === alignment}
                          title={alignmentDescriptions[alignment]}
                          onMouseEnter={() =>
                            setMenuTooltip({
                              field: "alignment",
                              description: alignmentDescriptions[alignment],
                            })
                          }
                          onFocus={() =>
                            setMenuTooltip({
                              field: "alignment",
                              description: alignmentDescriptions[alignment],
                            })
                          }
                          onMouseLeave={() =>
                            setMenuTooltip({ field: "", description: "" })
                          }
                          onBlur={() =>
                            setMenuTooltip({ field: "", description: "" })
                          }
                          onClick={() => {
                            onChange("alignment", alignment);
                            setAlignmentMenuOpen(false);
                            setMenuTooltip({ field: "", description: "" });
                          }}
                        >
                          <span>{alignment}</span>
                        </button>
                      ))}
                  </div>
                )}
                {menuTooltip.field === "alignment" && (
                  <span className="creation-menu-tooltip" role="tooltip">
                    {menuTooltip.description}
                  </span>
                )}
              </div>
            </label>
            <label className="deity-creation-field">
              Deity
              <select
                value={draft.deity ?? ""}
                onChange={(event) =>
                  onChange("deity", event.target.value || undefined)
                }
              >
                <option value="">No deity selected</option>
                {availableDeities.map((deity) => (
                  <option key={deity.id} value={deity.id}>
                    {deity.name} ({deity.alignment})
                  </option>
                ))}
              </select>
            </label>
            {dragonlanceRuleset &&
              (draft.prestigeClass === "wizard-of-high-sorcery" ||
                draft.prestigeClass === "white-robed-wizard" ||
                draft.prestigeClass === "red-robed-wizard" ||
                draft.prestigeClass === "black-robed-wizard") && (
              <label className="high-sorcery-creation-field">
                High Sorcery order
                <select
                  value={draft.highSorceryOrder ?? ""}
                  onChange={(event) =>
                    onChange(
                      "highSorceryOrder",
                      (event.target.value || undefined) as Character["highSorceryOrder"],
                    )
                  }
                >
                  <option value="">No order selected</option>
                  <option value="white">White Robes (good)</option>
                  <option value="red">Red Robes (neutral)</option>
                  <option value="black">Black Robes (evil)</option>
                </select>
              </label>
            )}
          </div>
          <div className="ability-methods">
            <button
              type="button"
              className={method === "roll" ? "selected" : ""}
              onClick={() => onMethodChange("roll")}
            >
              Roll 4d6
            </button>
            <button
              type="button"
              className={method === "pointBuy" ? "selected" : ""}
              onClick={() => onMethodChange("pointBuy")}
            >
              Point Buy
            </button>
            <button
              type="button"
              className={method === "manual" ? "selected" : ""}
              onClick={() => onMethodChange("manual")}
            >
              Manual
            </button>
            {method === "roll" && (
              <>
                <button
                  className="quiet-button"
                  type="button"
                  onClick={rollAbilities}
                >
                  Roll Abilities
                </button>
                {rolledScores && (
                  <span>
                    Rolled: {rolledScores.join(", ")}. Choose where each result
                    goes below.
                  </span>
                )}
              </>
            )}
            {method === "pointBuy" && (
              <span>Points used: {pointBuyTotal} / 25</span>
            )}
          </div>
          <div className="language-choices">
            <div>
              <h3>Languages</h3>
              <p className="language-summary">
                <strong>Automatic:</strong>{" "}
                {getRacialLanguages(draft).join(", ")}
              </p>
            </div>
            {Array.from(
              { length: getLanguageBonusSlots(draft) },
              (_, index) => {
                const automatic = getRacialLanguages(draft);
                const chosen = (draft.languages ?? []).filter(
                  (language) => !automatic.includes(language),
                );
                const current = chosen[index] ?? "";
                const taken = new Set([
                  ...automatic,
                  ...chosen.filter((_, choiceIndex) => choiceIndex !== index),
                ]);
                return (
                  <label key={`language-${index}`}>
                    Bonus language {index + 1}
                    <LanguagePicker
                      selected={current}
                      options={languageCatalog.filter(
                        (language) =>
                          !taken.has(language) || language === current,
                      )}
                      onChange={(language) => {
                        const next = [...chosen];
                        next[index] = language;
                        onChange("languages", [
                          ...new Set(next.filter(Boolean)),
                        ]);
                      }}
                    />
                  </label>
                );
              },
            )}
            {!getLanguageBonusSlots(draft) && (
              <p className="language-empty">
                No bonus language slots. Increase Intelligence to gain
                additional choices.
              </p>
            )}
          </div>
          <div className="creation-abilities">
            {abilities.map(([short, name]) => {
              const ability = short.toLowerCase() as AbilityName;
              const availableScores =
                method === "roll" && rolledScores && rolledAssignments
                  ? rolledAssignments.map((poolIndex) => ({
                      score: rolledScores[poolIndex],
                      index: poolIndex,
                    }))
                  : [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(
                      (score, index) => ({ score, index }),
                    );
              const selectedPoolIndex =
                method === "roll" && rolledAssignments
                  ? rolledAssignments[abilityNames.indexOf(ability)]
                  : undefined;
              const selectedValue =
                selectedPoolIndex !== undefined
                  ? String(selectedPoolIndex)
                  : String(draft.abilities[ability]);
              const finalScore =
                selectedPoolIndex !== undefined && rolledScores
                  ? rolledScores[selectedPoolIndex] +
                    (selectedRace.abilityModifiers[ability] ?? 0)
                  : draft.abilities[ability];
              return (
                <label key={ability}>
                  {name}
                  <select
                    value={selectedValue}
                    onChange={(event) =>
                      method === "roll"
                        ? assignRolledScore(ability, Number(event.target.value))
                        : onAbilityChange(ability, Number(event.target.value))
                    }
                  >
                    {availableScores.map((entry, index) => {
                      const score = entry.score;
                      const optionValue =
                        method === "roll" ? entry.index : score;
                      return (
                        <option
                          key={`${score}-${index}`}
                          value={optionValue}
                          disabled={
                            method === "pointBuy" &&
                            pointBuyTotal -
                              (pointBuyCosts[draft.abilities[ability]] ?? 0) +
                              (pointBuyCosts[score] ?? 0) >
                              25
                          }
                        >
                          {score} ({formatModifier(abilityModifier(score))})
                          {selectedRace.abilityModifiers[ability]
                            ? ` ${selectedRace.abilityModifiers[ability] > 0 ? "+" : ""}${selectedRace.abilityModifiers[ability]} ${selectedRace.name} = ${score + (selectedRace.abilityModifiers[ability] ?? 0)}`
                            : ""}
                        </option>
                      );
                    })}
                  </select>
                  <small className="racial-adjustment">
                    {finalScore} ({formatModifier(abilityModifier(finalScore))})
                  </small>
                </label>
              );
            })}
          </div>
          <div className="creation-actions">
            {creationErrors.length > 0 && (
              <ul className="creation-validation-errors">
                {creationErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}
            <span>
              Starting hit points:{" "}
              {Math.max(
                1,
                classDefinitions[classId].hitDie +
                  abilityModifier(draft.abilities.con),
              )}{" "}
              (d{classDefinitions[classId].hitDie} + Constitution modifier)
            </span>
            <button
              className="level-button"
              type="button"
              disabled={creationErrors.length > 0}
              onClick={onCreate}
            >
              Create Character
            </button>
          </div>
        </Panel>
      )}
    </section>
  );
}

function Panel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-title">
        <h2>{title}</h2>
        <span className="rule-status">Calculated</span>
      </div>
      {children}
    </section>
  );
}

function handleScrollableMenuKeyDown(
  event: React.KeyboardEvent<HTMLDivElement>,
) {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  const options = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>(
      'button[role="option"]',
    ),
  );
  if (!options.length) return;
  const currentIndex = options.indexOf(
    document.activeElement as HTMLButtonElement,
  );
  const nextIndex =
    event.key === "ArrowDown"
      ? Math.min(currentIndex + 1, options.length - 1)
      : Math.max(currentIndex > -1 ? currentIndex - 1 : options.length - 1, 0);
  event.preventDefault();
  options[nextIndex].focus();
  options[nextIndex].scrollIntoView({ block: "nearest" });
}

function FeatPicker({
  selected,
  options,
  selectedFeat,
  onChange,
}: {
  selected: string;
  options: FeatDefinition[];
  selectedFeat?: FeatDefinition;
  onChange: (featId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOffset, setMenuOffset] = useState(0);
  const [hoveredDescription, setHoveredDescription] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const choices =
    selectedFeat && !options.some((feat) => feat.id === selectedFeat.id)
      ? [selectedFeat, ...options]
      : options;
  const filteredChoices = choices.filter((feat) =>
    feat.name.toLowerCase().includes(query.toLowerCase().trim()),
  );
  useEffect(() => {
    if (!open) return;
    const firstPicker = document.querySelector<HTMLElement>(
      ".feat-choices .feat-picker",
    );
    if (firstPicker && pickerRef.current)
      setMenuOffset(
        firstPicker.getBoundingClientRect().top -
          pickerRef.current.getBoundingClientRect().top,
      );
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        !pickerRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const closeWhenAnotherPickerOpens = (event: Event) => {
      if (event.target !== pickerRef.current) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("feat-picker-open", closeWhenAnotherPickerOpens);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener(
        "feat-picker-open",
        closeWhenAnotherPickerOpens,
      );
    };
  }, [open]);
  return (
    <div className="class-field feat-picker" ref={pickerRef}>
      <button
        className="race-trigger"
        type="button"
        aria-expanded={open}
        onClick={() => {
          if (!open) document.dispatchEvent(new Event("feat-picker-open"));
          setOpen((isOpen) => !isOpen);
          setQuery("");
        }}
      >
        {selectedFeat?.name ?? "Choose a feat"}
        <span aria-hidden="true">▾</span>
      </button>
      {hoveredDescription && (
        <span
          className="feat-picker-tooltip"
          role="tooltip"
          style={{ top: `${menuOffset}px` }}
        >
          {hoveredDescription}
        </span>
      )}
      {open && (
        <div
          className="race-menu"
          style={{ top: `${menuOffset}px` }}
          role="listbox"
          aria-label="Feat choices"
          onKeyDown={handleScrollableMenuKeyDown}
        >
          <div className="feat-search">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search feats"
              aria-label="Search feats"
            />
          </div>
          <button
            className="race-option"
            type="button"
            role="option"
            aria-selected={!selected}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            <span>Choose a feat</span>
          </button>
          {filteredChoices.map((feat) => (
            <button
              className={`race-option ${feat.id === selected ? "selected" : ""}`}
              key={feat.id}
              type="button"
              role="option"
              aria-selected={feat.id === selected}
              title={feat.description}
              onMouseEnter={() => setHoveredDescription(feat.description)}
              onFocus={() => setHoveredDescription(feat.description)}
              onMouseLeave={() => setHoveredDescription("")}
              onBlur={() => setHoveredDescription("")}
              onClick={() => {
                onChange(feat.id);
                setOpen(false);
              }}
            >
              <span>{feat.name}</span>
            </button>
          ))}
          {!filteredChoices.length && (
            <span className="feat-no-results">No eligible feats match.</span>
          )}
        </div>
      )}
    </div>
  );
}

function LanguagePicker({
  selected,
  options,
  onChange,
}: {
  selected: string;
  options: string[];
  onChange: (language: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const filteredOptions = options.filter((language) =>
    language.toLowerCase().includes(query.toLowerCase().trim()),
  );
  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        !pickerRef.current?.contains(event.target)
      )
        setOpen(false);
    };
    const closeWhenAnotherPickerOpens = (event: Event) => {
      if (event.target !== pickerRef.current) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener(
      "language-picker-open",
      closeWhenAnotherPickerOpens,
    );
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener(
        "language-picker-open",
        closeWhenAnotherPickerOpens,
      );
    };
  }, [open]);
  return (
    <div className="class-field language-picker" ref={pickerRef}>
      <button
        className="race-trigger"
        type="button"
        aria-expanded={open}
        onClick={() => {
          if (!open) document.dispatchEvent(new Event("language-picker-open"));
          setOpen((isOpen) => !isOpen);
          setQuery("");
        }}
      >
        {selected || "Choose a language"}
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div
          className="race-menu"
          role="listbox"
          aria-label="Language choices"
          onKeyDown={handleScrollableMenuKeyDown}
        >
          <div className="feat-search">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search languages"
              aria-label="Search languages"
            />
          </div>
          <button
            className="race-option"
            type="button"
            role="option"
            aria-selected={!selected}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            <span>Choose a language</span>
          </button>
          {filteredOptions.map((language) => (
            <button
              className={`race-option ${language === selected ? "selected" : ""}`}
              key={language}
              type="button"
              role="option"
              aria-selected={language === selected}
              onClick={() => {
                onChange(language);
                setOpen(false);
              }}
            >
              <span>{language}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CharacterSheet({
  character,
  onSkillRankChange,
  onFeatChange,
  onLanguagesChange,
  allowFeatSelection,
  finalized,
  editable,
  onCharacterNameChange,
  onPlayerNameChange,
}: {
  character: Character;
  onSkillRankChange: (skill: string, change: number) => void;
  onFeatChange: (slotId: string, featId: string) => void;
  onLanguagesChange: (languages: string[]) => void;
  allowFeatSelection: boolean;
  finalized: boolean;
  editable: boolean;
  onCharacterNameChange: (name: string) => void;
  onPlayerNameChange: (player: string) => void;
}) {
  const classId = character.classLevels.at(-1)?.classId ?? "fighter";
  const characterRace =
    raceDefinitions[character.race.toLowerCase().replaceAll(" ", "-")] ??
    raceDefinitions.human;
  const specialAbilities = [
    ...(characterRace.traits ?? []).map((ability) => ({
      source: characterRace.name,
      ability,
    })),
    ...(characterRace.specialAbilities ?? []).map((ability) => ({
      source: characterRace.name,
      ability,
    })),
    ...character.classLevels
      .map((level) => {
        const definition = classDefinitions[level.classId];
        return [
          {
            source: `${definition.name} ${level.level}`,
            ability: `${definition.baseAttackBonus} base attack progression`,
          },
          {
            source: `${definition.name} ${level.level}`,
            ability: `${definition.skillPoints} skill points per level`,
          },
          ...(definition.spellcasting
            ? [
                {
                  source: `${definition.name} ${level.level}`,
                  ability: "Spellcasting",
                },
              ]
            : []),
        ];
      })
      .flat(),
    ...(character.classFeatures ?? []).map((ability) => ({
      source: classDefinitions[classId].name,
      ability,
    })),
    ...(character.prestigeClass
      ? (
          dragonlancePrestigeClasses[character.prestigeClass]?.features ?? []
        ).map((ability) => ({
          source: dragonlancePrestigeClasses[character.prestigeClass!].name,
          ability,
        }))
      : []),
  ];
  return (
    <div className="sheet-grid">
      <Panel title="Identity" className="identity-panel">
        <div className="identity-grid">
          <label>
            Character name
            {finalized ? <span className="sheet-value">{character.name}</span> : <input value={character.name} readOnly={!editable} onChange={(event) => onCharacterNameChange(event.target.value)} />}
          </label>
          <label>
            Player
            {finalized ? <span className="sheet-value">{character.player}</span> : <input value={character.player} readOnly={!editable} onChange={(event) => onPlayerNameChange(event.target.value)} />}
          </label>
          <label>
            Race
            {finalized ? <span className="sheet-value">{character.race}</span> : <input value={character.race} readOnly />}
          </label>
          <label>
            Class
            {finalized ? (
              <span className="sheet-value">{classDefinitions[classId].name}</span>
            ) : (
              <input value={classDefinitions[classId].name} readOnly />
            )}
          </label>
          {character.prestigeClass && (
            <label className="prestige-identity-field">
              Prestige Class
              {finalized ? (
                <span className="sheet-value">
                  {dragonlancePrestigeClasses[character.prestigeClass]?.name ?? "Prestige Class"}
                </span>
              ) : (
                <input
                  value={dragonlancePrestigeClasses[character.prestigeClass]?.name ?? "Prestige Class"}
                  readOnly
                />
              )}
            </label>
          )}
          <label>
            Level
            {finalized ? <span className="sheet-value">{character.classLevels.length}</span> : <input value={character.classLevels.length} readOnly />}
          </label>
          <label>
            Alignment
            {finalized ? <span className="sheet-value">{character.alignment}</span> : <input value={character.alignment} readOnly />}
          </label>
          {character.deity && (
            <label>
              Deity
              <span className="sheet-value">
                {deityDefinitions.find((deity) => deity.id === character.deity)?.name ?? character.deity}
              </span>
            </label>
          )}
          {(character.highSorceryOrder ||
            character.prestigeClass === "wizard-of-high-sorcery" ||
            character.prestigeClass === "white-robed-wizard" ||
            character.prestigeClass === "red-robed-wizard" ||
            character.prestigeClass === "black-robed-wizard") && (
            <label>
              High Sorcery
              <span className="sheet-value">
                {character.highSorceryOrder
                  ? `${character.highSorceryOrder[0].toUpperCase()}${character.highSorceryOrder.slice(1)} Robes`
                  : "Unselected order"}
              </span>
            </label>
          )}
        </div>
      </Panel>
      <Panel title="Ability Scores" className="ability-panel">
        <div className="ability-grid">
          {abilities.map(([short, name]) => {
            const score =
              character.abilities[
                short.toLowerCase() as keyof Character["abilities"]
              ];
            const ability = short.toLowerCase() as AbilityName;
            const characterRace =
              raceDefinitions[
                character.race.toLowerCase().replaceAll(" ", "-")
              ] ?? raceDefinitions.human;
            const racialAdjustment =
              characterRace.abilityModifiers[ability] ?? 0;
            const modifier = abilityModifier(score);
            return (
              <div className="ability-card" key={short}>
                <span>{short}</span>
                <small>{name}</small>
                <strong>{score}</strong>
                <em>
                  {modifier >= 0 ? "+" : ""}
                  {modifier}
                </em>
                <em className="score-breakdown">
                  {racialAdjustment !== 0
                    ? `${characterRace.name} (${racialAdjustment > 0 ? "+" : ""}${racialAdjustment})`
                    : null}
                </em>
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel title="Combat Summary" className="combat-panel">
        <div className="stat-grid">
          <Stat label="Armor Class" value={String(getEquipmentArmorClass(character))} />
          <Stat
            label="Initiative"
            value={formatModifier(abilityModifier(character.abilities.dex))}
          />
          <Stat
            label="Speed"
            value={`${(raceDefinitions[character.race.toLowerCase().replaceAll(" ", "-")] ?? raceDefinitions.human).speed ?? 30} ft.`}
          />
          <Stat label="Hit Points" value={String(character.hitPoints)} />
          <Stat label="Base Attack" value="+1" />
          <Stat label="Fort / Ref / Will" value="+2 / +0 / +0" />
        </div>
        <p className="combat-note">
          Size:{" "}
          {(
            raceDefinitions[
              character.race.toLowerCase().replaceAll(" ", "-")
            ] ?? raceDefinitions.human
          ).size ?? "Medium"}
          {(() => {
            const capacity = carryingCapacity(character);
            return ` | Carry: ${capacity.light}/${capacity.medium}/${capacity.heavy} lb. (light/medium/heavy)`;
          })()}
        </p>
      </Panel>
      <Panel title="Languages" className="languages-panel">
        <div className="languages-display">
          {finalized ? (
            <span className="sheet-value">{getCharacterLanguages(character).join(", ")}</span>
          ) : (
            getCharacterLanguages(character).map((language) => (
              <span className="language-chip" key={language}>{language}</span>
            ))
          )}
        </div>
        {allowFeatSelection && (
          <div className="language-panel-choices">
            <p>
              <strong>Automatic:</strong>{" "}
              {getRacialLanguages(character).join(", ")}
            </p>
            {Array.from(
              { length: getLanguageBonusSlots(character) },
              (_, index) => {
                const automatic = getRacialLanguages(character);
                const chosen = (character.languages ?? []).filter(
                  (language) => !automatic.includes(language),
                );
                const current = chosen[index] ?? "";
                const taken = new Set([
                  ...automatic,
                  ...chosen.filter((_, choiceIndex) => choiceIndex !== index),
                ]);
                return (
                  <label key={`sheet-language-${index}`}>
                    Bonus language {index + 1}
                    <LanguagePicker
                      selected={current}
                      options={languageCatalog.filter(
                        (language) =>
                          !taken.has(language) || language === current,
                      )}
                      onChange={(language) => {
                        const next = [...chosen];
                        next[index] = language;
                        onLanguagesChange(next.filter(Boolean));
                      }}
                    />
                  </label>
                );
              },
            )}
          </div>
        )}
      </Panel>
      <Panel
        title={`Skills (${getSpentSkillPoints(character)}/${getAvailableSkillCount(character)})`}
        className="skills-panel"
      >
        <div className="list-grid">
          {skills.map((skill) => (
            <div className="list-row" key={skill}>
              <span className="skill-name">
                <span className="tooltip-anchor">
                  <input
                    type="checkbox"
                    checked={isClassSkill(character, skill)}
                    readOnly
                    aria-label={`${skill} class skill`}
                  />
                  <span className="inline-tooltip" role="tooltip">
                    {isClassSkill(character, skill)
                      ? "Class skill: 1 point per rank; maximum ranks equal character level + 3."
                      : "Cross-class skill: 2 points per rank; maximum ranks equal half of character level + 3."}
                  </span>
                </span>
                <span className="tooltip-anchor">
                  {skill}
                  <span className="inline-tooltip" role="tooltip">
                    {skillDescriptions[skill]}
                  </span>
                </span>
              </span>
              {!finalized && <span className="skill-racial">
                {getRacialSkillBonus(character, skill)
                  ? `${getCharacterRace(character)} (${formatModifier(getRacialSkillBonus(character, skill))})`
                  : ""}
              </span>}
              <span className="skill-ability">
                {getSkillAbility(skill)
                  ? `${abilityLabels[getSkillAbility(skill)!]} (${formatModifier(abilityModifier(character.abilities[getSkillAbility(skill)!]))})`
                  : "—"}
              </span>
              {(!finalized || allowFeatSelection) && <span className="skill-ranks">
                <button
                  type="button"
                  onClick={() => onSkillRankChange(skill, -1)}
                  disabled={!character.skills[skill]}
                  aria-label={`Remove rank from ${skill}`}
                >
                  −
                </button>
                <span>{character.skills[skill] || 0}</span>
                <button
                  type="button"
                  onClick={() => onSkillRankChange(skill, 1)}
                  disabled={!canIncreaseSkillRank(character, skill)}
                  aria-label={`Add rank to ${skill}`}
                >
                  +
                </button>
              </span>}
              <strong title={getSkillTotalTooltip(character, skill)}>
                {formatModifier(
                  (getSkillAbility(skill)
                    ? abilityModifier(
                        character.abilities[getSkillAbility(skill)!],
                      )
                    : 0) +
                    Number(character.skills[skill] || 0) +
                    getRacialSkillBonus(character, skill),
                )}
              </strong>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Feats & Special Abilities" className="feats-panel">
        <div className="feats-abilities-grid">
          <div className="feats-column">
            <h3>Feats</h3>
            <div className="chosen-feats">
              {Object.values(character.featSelections ?? {})
                .filter(Boolean)
                .map((featId) => {
                  const feat = featCatalog.find((entry) => entry.id === featId);
                  return feat ? (
                    <div className="chosen-feat" key={feat.id}>
                      <span className="chosen-feat-name tooltip-anchor">
                        {feat.name}
                        <span className="inline-tooltip" role="tooltip">
                          {feat.description}
                        </span>
                      </span>
                      <span className="chosen-feat-description">
                        {" "}
                        - {feat.description}
                      </span>
                    </div>
                  ) : null;
                })}
              {!Object.values(character.featSelections ?? {}).some(Boolean) && (
                <div className="empty-state">No feats selected.</div>
              )}
            </div>
            {allowFeatSelection && (
              <div className="feat-choices level-up-feat-choices">
                {getFeatSlots(character).map((slot) => {
                  const options = getAvailableFeats(character, slot, slot.id);
                  const selected = character.featSelections?.[slot.id] ?? "";
                  const selectedFeat = featCatalog.find(
                    (feat) => feat.id === selected,
                  );
                  return (
                    <label key={slot.id}>
                      {slot.label}
                      <FeatPicker
                        selected={selected}
                        options={options}
                        selectedFeat={selectedFeat}
                        onChange={(featId) => onFeatChange(slot.id, featId)}
                      />
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <div className="abilities-column">
            <h3>Special Abilities</h3>
            <div className="special-abilities-list">
              {specialAbilities.map(({ source, ability }, index) => (
                <div
                  className="special-ability"
                  key={`${source}-${ability}-${index}`}
                >
                  <strong>{ability}</strong>
                  <span>({source})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function formatModifier(value: number) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function EquipmentSheet({
  character,
  onEquipmentChange,
  onInventoryChange,
}: {
  character: Character;
  onEquipmentChange: (equipment: Record<string, string>) => void;
  onInventoryChange: (inventory: Record<string, number>) => void;
}) {
  const slots = [
    "Head",
    "Neck",
    "Shoulders",
    "Arms",
    "Hands",
    "Rings 1",
    "Rings 2",
    "Waist",
    "Feet",
    "Main Weapon",
    "Off Hand Weapon",
    "Ranged Weapon",
    "Armor",
    "Shield",
    "Miscellaneous",
  ];
  const equipment = character.equipment ?? {};
  const setSlot = (slot: string, value: string) =>
    onEquipmentChange({ ...equipment, [slot]: value });
  return (
    <div className="equipment-sheet">
      <div className="equipment-sheet-title">EQUIPMENT SLOTS</div>
      <div className="equipment-slot-grid">
        <div className="equipment-column">
          {slots.slice(0, 8).map((slot) => (
            <EquipmentSlot
              key={slot}
              label={slot}
              value={equipment[slot] ?? ""}
              onChange={(value) => setSlot(slot, value)}
            />
          ))}
        </div>
        <div className="equipment-figure" aria-hidden="true">
          EQUIP
        </div>
        <div className="equipment-column">
          {slots.slice(8).map((slot) => (
            <EquipmentSlot
              key={slot}
              label={slot}
              value={equipment[slot] ?? ""}
              onChange={(value) => setSlot(slot, value)}
            />
          ))}
        </div>
      </div>
      <div className="equipment-footer">
        <label>
          Runestones
          <input
            value={equipment.Runestones ?? ""}
            onChange={(event) => setSlot("Runestones", event.target.value)}
          />
        </label>
        <label>
          Currency
          <input
            value={equipment.Currency ?? ""}
            onChange={(event) => setSlot("Currency", event.target.value)}
          />
        </label>
      </div>
      <div className="equipment-summary">
        <Stat label="Load" value="Light" />
        <Stat label="Carried Weight" value="0 lb." />
        <Stat label="Armor Class" value={String(getEquipmentArmorClass(character))} />
      </div>
      <EquipmentStore
        character={character}
        onEquipmentChange={onEquipmentChange}
        onInventoryChange={onInventoryChange}
      />
    </div>
  );
}

function EquipmentStore({
  character,
  onEquipmentChange,
  onInventoryChange,
}: {
  character: Character;
  onEquipmentChange: (equipment: Record<string, string>) => void;
  onInventoryChange: (inventory: Record<string, number>) => void;
}) {
  const [storeOpen, setStoreOpen] = useState(true);
  const [enhancements, setEnhancements] = useState<Record<string, string>>({});
  const [specialEnchantments, setSpecialEnchantments] = useState<
    Record<string, string>
  >({});
  const [selectedWeapons, setSelectedWeapons] = useState<StoreItem[]>([]);
  const [selectedArmor, setSelectedArmor] = useState<StoreItem>();
  const playerRaceId = character.race.toLowerCase().replaceAll(" ", "-");
  const playerSize = raceDefinitions[playerRaceId]?.size ?? "Medium";
  const [itemSize, setItemSize] = useState<string>(playerSize);
  const sizeOptions = ["Small", "Medium", "Large"];
  const inventory = character.inventory ?? {};
  const totalItems = Object.values(inventory).reduce(
    (total, quantity) => total + quantity,
    0,
  );
  const inventoryEntries = Object.entries(inventory).map(([key, quantity]) => {
    const details = getInventoryEntryDetails(key);
    return { key, quantity, ...details, totalWeight: details.numericWeight * quantity };
  });
  const totalInventoryWeight = inventoryEntries.reduce((total, entry) => total + entry.totalWeight, 0);
  const selectItem = (item: StoreItem) => {
    if (item.category === "Weapons") setSelectedWeapons([item]);
    if (item.category === "Armor" || item.category === "Shields") setSelectedArmor(item);
  };
  const buy = (item: StoreItem, quantity = 1) => {
    const enhancement = enhancements[item.category] ?? "Normal";
    const special = specialEnchantments[item.category] ?? "None";
    const enchantmentName =
      item.category === "Weapons" || item.category === "Armor" || item.category === "Shields"
        ? `${enhancement === "Normal" ? "" : `${enhancement} `}${item.name}${special === "None" ? "" : ` ${special}`}`
        : item.name;
    const sizedName = `${enchantmentName} (${itemSize})`;
    onInventoryChange({
      ...inventory,
      [sizedName]: (inventory[sizedName] ?? 0) + quantity,
    });
    if (item.category === "Weapons" || item.category === "Armor" || item.category === "Shields") {
      setEnhancements((current) => ({ ...current, [item.category]: "Normal" }));
      setSpecialEnchantments((current) => ({ ...current, [item.category]: "None" }));
    }
  };
  const removeInventoryItem = (key: string) => {
    const nextInventory = { ...inventory };
    if (nextInventory[key] <= 1) delete nextInventory[key];
    else nextInventory[key] -= 1;
    onInventoryChange(nextInventory);
  };
  const equipInventoryItem = (key: string) => {
    const itemName = getInventoryEntryDetails(key).name;
    const item = [...storeItems]
      .sort((left, right) => right.name.length - left.name.length)
      .find((entry) => itemName.includes(entry.name));
    let slot = "Miscellaneous";
    let nextEquipment = { ...(character.equipment ?? {}) };
    if (item?.category === "Shields") {
      slot = "Shield";
      delete nextEquipment["Off Hand Weapon"];
    } else if (item?.category === "Armor") slot = "Armor";
    else if (item?.name.startsWith("Ring of ")) {
      slot = nextEquipment["Rings 1"] ? "Rings 2" : "Rings 1";
    } else if (item?.name.startsWith("Headband of ")) slot = "Head";
    else if (item?.name.startsWith("Cloak of ")) slot = "Shoulders";
    if (item?.category === "Weapons") {
      if (rangedWeaponNames.has(item.name)) {
        slot = "Ranged Weapon";
      }
      else if (twoHandedWeaponNames.has(item.name)) {
        slot = "Main Weapon";
        delete nextEquipment["Off Hand Weapon"];
        delete nextEquipment["Ranged Weapon"];
      }
      else if (character.equipment?.Shield) {
        window.alert(
          "A shield occupies your off hand, so this weapon cannot be equipped in Off Hand Weapon. Unequip the shield first.",
        );
        return;
      }
      else if (!character.equipment?.["Main Weapon"]) slot = "Main Weapon";
      else if (!lightOffHandWeaponNames.has(item.name)) {
        window.alert(
          "This weapon is not a light melee weapon and cannot be equipped in the Off Hand Weapon slot under D&D 3.5 rules. It will replace the Main Weapon.",
        );
        slot = "Main Weapon";
      }
      else {
        const useOffHand = window.confirm(
          "Your Main Weapon slot is occupied. Equip this light melee weapon in Off Hand Weapon?",
        );
        slot = useOffHand ? "Off Hand Weapon" : "Main Weapon";
      }
    }
    nextEquipment[slot] = key;
    onEquipmentChange(nextEquipment);
  };
  const selectedWeapon = selectedWeapons.at(-1);
  const weaponEnhancement = enhancements.Weapons ?? "Normal";
  const weaponSpecial = specialEnchantments.Weapons ?? "None";
  const weaponPrice = selectedWeapon
    ? getSizedStorePrice(selectedWeapon, itemSize) +
      (weaponEnhancement === "Normal"
        ? 0
        : Number(weaponEnhancement.slice(1)) * 2000) +
      (weaponSpecial === "None" ? 0 : 8000)
    : 0;
  const weaponName = selectedWeapon
    ? `${weaponEnhancement === "Normal" ? "" : `${weaponEnhancement} `}${selectedWeapon.name}${weaponSpecial === "None" ? "" : ` ${weaponSpecial}`}`
    : "";
  const armorEnhancement = enhancements.Armor ?? "Normal";
  const armorSpecial = specialEnchantments.Armor ?? "None";
  const armorPrice = selectedArmor
    ? getSizedStorePrice(selectedArmor, itemSize) +
      getEnhancementPrice(armorEnhancement) +
      getEnhancementPrice(armorSpecial, true)
    : 0;
  const armorName = selectedArmor
    ? `${armorEnhancement === "Normal" ? "" : `${armorEnhancement} `}${selectedArmor.name}${armorSpecial === "None" ? "" : ` ${armorSpecial}`}`
    : "Choose armor";
  const categoryOrder: StoreCategory[] = [
    "Weapons",
    "Armor",
    "Shields",
    "Shoulders",
    "Arms",
    "Hands",
    "Rings",
    "Waist",
    "Feet",
    "Body & Wondrous Items",
    "Head",
    "Neck",
    "Ammunition",
    "Adventuring Gear",
    "Tools & Kits",
    "Consumables",
    "Potions, Scrolls & Wands",
    "Rings & Magic Items",
    "Mounts & Vehicles",
  ];
  const categories = categoryOrder.filter((itemCategory) =>
    storeItems.some((item) => item.category === itemCategory),
  );
  return (
    <section className="equipment-store">
      <div className="equipment-store-header">
        <div>
          <p className="eyebrow">Town market</p>
          <h2>General Store</h2>
          <p>Buy gear, arms, armor, and magic items for this character.</p>
        </div>
        <strong>
          {totalItems} item{totalItems === 1 ? "" : "s"} owned
        </strong>
        <button
          className="secondary-button store-toggle"
          type="button"
          onClick={() => setStoreOpen((current) => !current)}
          aria-expanded={storeOpen}
        >
          {storeOpen ? "Close Store" : "Open Store"}
        </button>
      </div>
      {storeOpen ? (
        <>
          <label className="store-size-row">
            <span>Item size</span>
            <select
              value={itemSize}
              onChange={(event) => setItemSize(event.target.value)}
            >
              {sizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                  {size === playerSize ? ` (${character.race})` : ""}
                </option>
              ))}
            </select>
            <small>Defaults to the character's size: {playerSize}.</small>
          </label>
          <div className="equipment-store-grid">
        {categories.map((itemCategory) => {
          const itemSelect = (
            <EquipmentItemPicker
              items={storeItems.filter(
                (item) => item.category === itemCategory,
              )}
              size={itemSize}
              owned={inventory}
              onSelect={selectItem}
                onPurchase={buy}
                bulk={["Ammunition", "Tools & Kits", "Consumables", "Potions, Scrolls & Wands"].includes(itemCategory)}
                menuOnLeft={["Head", "Neck", "Hands", "Rings", "Feet", "Body & Wondrous Items", "Adventuring Gear", "Tools & Kits", "Potions, Scrolls & Wands", "Rings & Magic Items"].includes(itemCategory)}
            />
          );
          const hasEnhancement =
            itemCategory === "Weapons" || itemCategory === "Armor" || itemCategory === "Shields";
          const specialOptions =
            itemCategory === "Weapons"
              ? [
                  "None",
                  "Flaming",
                  "Frost",
                  "Shock",
                  "Keen",
                  "Holy",
                  "Vicious",
                  "Bane",
                ]
              : [
                  "None",
                  "Fortification",
                  "Shadow",
                  "Silent Moves",
                  "Slick",
                  "Glamered",
                  "Invulnerability",
                ];
          const hasPreview =
            itemCategory === "Weapons"
              ? Boolean(selectedWeapon)
              : itemCategory === "Armor" || itemCategory === "Shields"
                ? Boolean(selectedArmor)
                : false;
          const isPreviewCategory =
            itemCategory === "Weapons" || itemCategory === "Armor" || itemCategory === "Shields";
          const previewName =
            itemCategory === "Weapons" ? weaponName : armorName;
          const previewPrice =
            itemCategory === "Weapons" ? weaponPrice : armorPrice;
          return (
            <div
              className={`store-category${
                itemCategory === "Shields" ? " shields-store-category" : ""
              }`}
              key={itemCategory}
            >
              {itemCategory}
              {hasEnhancement ? (
                <span className="store-category-controls">
                  {itemSelect}
                  <select
                    value={enhancements[itemCategory] ?? "Normal"}
                    onChange={(event) =>
                      setEnhancements({
                        ...enhancements,
                        [itemCategory]: event.target.value,
                      })
                    }
                    aria-label={`${itemCategory} enhancement`}
                    title={`Enhancement price: ${getEnhancementPrice(enhancements[itemCategory] ?? "Normal").toLocaleString()} gp`}
                  >
                    <option value="Normal" title={getEnchantmentDescription("Normal")}>Normal (0 gp)</option>
                    {[1, 2, 3, 4, 5].map((bonus) => (
                      <option key={bonus} value={`+${bonus}`} title={getEnchantmentDescription(`+${bonus}`)}>
                        +{bonus} (
                        {getEnhancementPrice(`+${bonus}`).toLocaleString()} gp)
                      </option>
                    ))}
                  </select>
                  <select
                    value={specialEnchantments[itemCategory] ?? "None"}
                    onChange={(event) =>
                      setSpecialEnchantments({
                        ...specialEnchantments,
                        [itemCategory]: event.target.value,
                      })
                    }
                    aria-label={`${itemCategory} special enchantment`}
                    title={`Special enchantment price: ${getEnhancementPrice(specialEnchantments[itemCategory] ?? "None", true).toLocaleString()} gp`}
                  >
                    {specialOptions.map((option) => (
                      <option key={option} value={option} title={getEnchantmentDescription(option, true)}>
                        {option} (
                        {getEnhancementPrice(option, true).toLocaleString()} gp)
                      </option>
                    ))}
                  </select>
                  {isPreviewCategory && hasPreview ? (
                    <span className="store-built-item tooltip-anchor">
                      {previewName}
                      <strong>{previewPrice.toLocaleString()} gp</strong>
                      <span className="inline-tooltip" role="tooltip">
                        {itemCategory === "Weapons" && selectedWeapon
                          ? `${getWeaponProfile(selectedWeapon.name).damage} damage; crit ${getWeaponProfile(selectedWeapon.name).crit}; ${getWeaponSizeNote(itemSize)}. `
                          : "Armor preview. "}
                        {getEnchantmentDescription(enhancements[itemCategory] ?? "Normal")}{" "}
                        {getEnchantmentDescription(specialEnchantments[itemCategory] ?? "None", true)}
                      </span>
                    </span>
                  ) : null}
                </span>
              ) : (
                itemSelect
              )}
            </div>
          );
            })}
          </div>
        </>
      ) : null}
      <section className="equipment-inventory" aria-labelledby="equipment-inventory-title">
        <div className="equipment-inventory-header">
          <h3 id="equipment-inventory-title">Inventory</h3>
          <strong>{totalInventoryWeight.toLocaleString()} lb. total</strong>
        </div>
        {inventoryEntries.length ? (
          <div className="equipment-inventory-list">
            {inventoryEntries.map((entry) => (
              <div className="equipment-inventory-row" key={entry.key}>
                <div className="equipment-inventory-name">
                  <strong>
                    {entry.name} ({entry.size[0]})
                  </strong>
                  <small>{entry.description}</small>
                </div>
                <span>Qty. {entry.quantity}</span>
                <span>{entry.weight} each</span>
                <span>{entry.totalWeight ? `${entry.totalWeight} lb. total` : "Weight varies"}</span>
                <span className="equipment-inventory-actions">
                  <button className={Object.values(character.equipment ?? {}).includes(entry.key) ? "is-equipped" : ""} type="button" title={Object.values(character.equipment ?? {}).includes(entry.key) ? "Equipped" : "Equip this item"} onClick={() => equipInventoryItem(entry.key)}>
                    {Object.values(character.equipment ?? {}).includes(entry.key) ? "Equipped" : "Equip"}
                  </button>
                  <button type="button" onClick={() => removeInventoryItem(entry.key)}>Remove</button>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="equipment-inventory-empty">No items purchased yet.</p>
        )}
      </section>
    </section>
  );
}

function EquipmentSlot({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <section className="equipment-slot">
      <h3>{label}</h3>
      <div className="equipment-slot-control">
        <input
          aria-label={`${label} equipment`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder=""
        />
        {value && (
          <button type="button" onClick={() => onChange("")}>
            Unequip
          </button>
        )}
      </div>
    </section>
  );
}

function SpellPicker({
  spells,
  selected,
  onChange,
  placeholder = "Choose a spell",
}: {
  spells: {
    name: string;
    level: number;
    classes: string[];
    description: string;
  }[];
  selected?: string;
  onChange: (spell: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOffset, setMenuOffset] = useState(0);
  const [hoveredSpell, setHoveredSpell] = useState<{
    level: number;
    classes: string[];
    description: string;
  }>();
  const pickerRef = useRef<HTMLDivElement>(null);
  const filteredSpells = spells.filter((spell) =>
    spell.name.toLowerCase().includes(query.toLowerCase().trim()),
  );
  useEffect(() => {
    if (!open) return;
    const firstPicker = document.querySelector<HTMLElement>(
      ".spell-levels .spell-picker",
    );
    if (firstPicker && pickerRef.current)
      setMenuOffset(
        firstPicker.getBoundingClientRect().top -
          pickerRef.current.getBoundingClientRect().top,
      );
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        !(event.target instanceof Element) ||
        !pickerRef.current?.contains(event.target)
      ) {
        setOpen(false);
        setHoveredSpell(undefined);
      }
    };
    const closeWhenAnotherPickerOpens = (event: Event) => {
      if (event.target !== pickerRef.current) {
        setOpen(false);
        setHoveredSpell(undefined);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("spell-picker-open", closeWhenAnotherPickerOpens);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener(
        "spell-picker-open",
        closeWhenAnotherPickerOpens,
      );
    };
  }, [open]);
  return (
    <div className="class-field feat-picker spell-picker" ref={pickerRef}>
      <button
        className="race-trigger"
        type="button"
        aria-expanded={open}
        onClick={() => {
          if (!open) document.dispatchEvent(new Event("spell-picker-open"));
          setOpen(!open);
          setQuery("");
          if (open) setHoveredSpell(undefined);
        }}
      >
        {selected ?? placeholder}
        <span aria-hidden="true">▾</span>
      </button>
      {hoveredSpell && (
        <span
          className="feat-picker-tooltip"
          role="tooltip"
          style={{ top: `${menuOffset}px` }}
        >
          <strong>
            {hoveredSpell.level === 0
              ? "Cantrip"
              : `Level ${hoveredSpell.level}`}{" "}
            ·{" "}
            {hoveredSpell.classes
              .map(
                (classId) =>
                  classDefinitions[classId as ClassId]?.name ?? classId,
              )
              .join(", ")}
          </strong>
          <br />
          {hoveredSpell.description || "No description available."}
        </span>
      )}
      {open && (
        <div
          className="race-menu"
          style={{ top: `${menuOffset}px` }}
          role="listbox"
          aria-label="Spell choices"
          onKeyDown={handleScrollableMenuKeyDown}
        >
          <div className="feat-search">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search spells"
              aria-label="Search spells"
            />
          </div>
          {filteredSpells.map((spell) => (
            <button
              className={`race-option ${selected === spell.name ? "selected" : ""}`}
              key={spell.name}
              type="button"
              role="option"
              aria-selected={selected === spell.name}
              onMouseEnter={() => setHoveredSpell(spell)}
              onFocus={() => setHoveredSpell(spell)}
              onMouseLeave={() => setHoveredSpell(undefined)}
              onBlur={() => setHoveredSpell(undefined)}
              onClick={() => {
                onChange(spell.name);
                setOpen(false);
                setHoveredSpell(undefined);
              }}
            >
              {spell.name}
            </button>
          ))}
          {!filteredSpells.length && (
            <span className="feat-no-results">No spells match.</span>
          )}
        </div>
      )}
    </div>
  );
}

function formatSpellDuration(duration: string) {
  return duration
    .replace(/Concentration/gi, "Con")
    .replace(/Permanent/gi, "Perm")
    .replace(/Instantaneous/gi, "Inst")
    .replace(/rounds?/gi, "rds")
    .replace(/minutes?/gi, "min")
    .replace(/hours?/gi, "hr")
    .replace(/days?/gi, "day")
    .replace(/weeks?/gi, "wk")
    .replace(/months?/gi, "mo")
    .replace(/years?/gi, "yr");
}

function SpellSheet({
  character,
  onKnownSpellsChange,
  onPreparedSpellsChange,
  editable,
}: {
  character: Character;
  onKnownSpellsChange: (spells: string[]) => void;
  onPreparedSpellsChange: (spells: string[]) => void;
  editable: boolean;
}) {
  const spellcastingLevel = character.classLevels.find(
    (level) => classDefinitions[level.classId].spellcasting,
  );
  const spellcastingClass = spellcastingLevel
    ? classDefinitions[spellcastingLevel.classId]
    : classDefinitions.wizard;
  const learningMode =
    spellcastingClass.id === "wizard"
      ? "Spellbook"
      : spellcastingClass.id === "bard" || spellcastingClass.id === "sorcerer"
        ? "Spells Known"
        : "Prepared Spells";
  const availableLevels = (spellSlots[spellcastingClass.id] ?? [])
    .map((slots, index) => (slots[0] > 0 ? index : -1))
    .filter((level) => level >= 0);
  const selectedSpells = new Set(character.knownSpells);
  const preparedSpells = new Set(character.preparedSpells);
  const preparedSpellCount = character.preparedSpells.length;
  const classSpells = spells.filter((spell) =>
    spell.classes.includes(spellcastingClass.id),
  );
  const castingAbility: Partial<Record<ClassId, keyof Character["abilities"]>> =
    {
      bard: "cha",
      cleric: "wis",
      druid: "wis",
      paladin: "cha",
      ranger: "wis",
      sorcerer: "cha",
      wizard: "int",
    };
  const castingModifier = abilityModifier(
    character.abilities[castingAbility[spellcastingClass.id] ?? "int"],
  );
  const knownLimits: Partial<Record<ClassId, number[]>> = {
    bard: [4, 2],
    sorcerer: [4, 2],
  };
  const bonusSpells = (level: number) => {
    if (level < 1 || castingModifier < level) return 0;
    return Math.floor((castingModifier - level) / 4) + 1;
  };
  const levelLimit = (level: number) =>
    learningMode === "Spells Known"
      ? (knownLimits[spellcastingClass.id]?.[level] ?? 0) +
        (level > 0 ? bonusSpells(level) : 0)
      : learningMode === "Spellbook"
        ? level === 0
          ? classSpells.filter((spell) => spell.level === 0).length
          : level === 1
            ? 3 + Math.max(0, castingModifier)
            : 2
        : (spellSlots[spellcastingClass.id]?.[level]?.[0] ?? 0) +
          bonusSpells(level);
  const dailySpellCapacity = availableLevels.reduce(
    (total, level) =>
      total +
      (spellSlots[spellcastingClass.id]?.[level]?.[0] ?? 0) +
      bonusSpells(level),
    0,
  );
  const setSpellSlot = (level: number, slot: number, spell: string) => {
    const levelSelections = classSpells
      .filter((entry) => entry.level === level)
      .map((entry) => entry.name)
      .filter((name) => selectedSpells.has(name));
    const nextLevelSelections = [...levelSelections];
    nextLevelSelections[slot] = spell;
    const next = [...selectedSpells].filter(
      (name) =>
        classSpells.find((entry) => entry.name === name)?.level !== level,
    );
    onKnownSpellsChange([
      ...next,
      ...nextLevelSelections.filter(
        (name, index) => name && nextLevelSelections.indexOf(name) === index,
      ),
    ]);
  };

  return (
    <div className="spell-sheet">
      <div className="spell-sheet-header">
        <div>
          <label>
            Character Name
            <input value={character.name} readOnly />
          </label>
          <label>
            Spells Casting Class and Level
            <input
              value={`${spellcastingClass.name} ${spellcastingLevel?.level ?? 1}`}
              readOnly
            />
          </label>
        </div>
        <div>
          <label>
            Player
            <input value={character.player} readOnly />
          </label>
          <label>
            Spellcasting Ability
            <input
              value={(
                castingAbility[spellcastingClass.id] ?? "int"
              ).toUpperCase()}
              readOnly
            />
          </label>
        </div>
        <div className="spell-sheet-brand">CHARACTER SPELL SHEET</div>
      </div>
      <div className="spell-sheet-stats">
        <Stat label="Spell Save DC" value={String(10 + castingModifier + 1)} />
        <Stat label="Spellcasting Class" value={spellcastingClass.name} />
        <Stat
          label="Prepared Spells Available"
          value={
            learningMode === "Prepared Spells" || learningMode === "Spellbook"
              ? String(dailySpellCapacity)
              : "N/A"
          }
        />
        <Stat label="Selection" value={learningMode} />
      </div>
      <div className="spell-sheet-title">SPELLS</div>
      {availableLevels.map((level) => {
        const levelSpells = classSpells.filter(
          (spell) => spell.level === level,
        );
        const limit = levelLimit(level);
        const selectedForLevel = levelSpells
          .filter((spell) => selectedSpells.has(spell.name))
          .map((spell) => spell.name);
        const rowCount =
          level === 0 && learningMode === "Spellbook"
            ? Math.max(6, levelSpells.length)
            : Math.max(6, Math.max(limit, selectedForLevel.length) + 4);
        return (
          <section className="spell-level-table" key={level}>
            <div className="spell-level-heading">
              <strong>
                {level === 0 ? "CANTRIPS" : `LEVEL ${level} SPELLS`}
              </strong>
              <span>EXPENDED SLOTS</span>
              {Array.from({ length: Math.max(4, limit) }, (_, index) => (
                <input
                  className="slot-box"
                  type="checkbox"
                  key={index}
                  aria-label={`Expended level ${level} slot ${index + 1}`}
                />
              ))}
            </div>
            <table>
              <thead>
                <tr>
                  <th>PREPARED</th>
                  <th>SPELL NAME</th>
                  <th>DESCRIPTION</th>
                  <th>CONCENTRATION</th>
                  <th>SAVE</th>
                  <th>RANGE</th>
                  <th>CASTING TIME</th>
                  <th>COMPONENTS</th>
                  <th>DURATION</th>
                  <th>SCHOOL</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: rowCount }, (_, slot) => {
                  const spellName =
                    level === 0 && learningMode === "Spellbook"
                      ? levelSpells[slot]?.name
                      : selectedForLevel[slot];
                  const spell = levelSpells.find(
                    (entry) => entry.name === spellName,
                  );
                  const isPrepared = spellName
                    ? preparedSpells.has(spellName)
                    : false;
                  const preparationLimitReached =
                    preparedSpellCount >= dailySpellCapacity;
                  return (
                    <tr className={spellName ? undefined : "empty-spell-row"} key={slot}>
                      <td>
                        {learningMode === "Prepared Spells" && (
                          <input
                            type="checkbox"
                            checked={isPrepared}
                            disabled={
                              !spellName ||
                              (!isPrepared && preparationLimitReached)
                            }
                            title={
                              !isPrepared && preparationLimitReached
                                ? "Preparation limit reached. Unprepare a spell before selecting another."
                                : undefined
                            }
                            onChange={(event) =>
                              spellName &&
                              onPreparedSpellsChange(
                                event.target.checked
                                  ? [
                                      ...new Set([
                                        ...character.preparedSpells,
                                        spellName,
                                      ]),
                                    ]
                                  : character.preparedSpells.filter(
                                      (name) => name !== spellName,
                                    ),
                              )
                            }
                          />
                        )}
                      </td>
                      <td>
                        {level === 0 && learningMode === "Spellbook" ? (
                          spellName
                        ) : !editable ? (
                          spellName || ""
                        ) : (
                          <SpellPicker
                            spells={levelSpells.filter(
                              (entry) =>
                                !selectedForLevel.includes(entry.name) ||
                                selectedForLevel[slot] === entry.name,
                            )}
                            selected={spellName}
                            placeholder={slot < limit ? "Choose a spell" : ""}
                            onChange={(name) => setSpellSlot(level, slot, name)}
                          />
                        )}
                      </td>
                      <td className="spell-description-cell">
                        {spell?.description || ""}
                      </td>
                      <td />
                      <td>{spell?.savingThrow || ""}</td>
                      <td>{spell?.range || ""}</td>
                      <td>{spell?.castingTime || ""}</td>
                      <td>{spell?.components || ""}</td>
                      <td>{formatSpellDuration(spell?.duration || "")}</td>
                      <td>{spell?.school || ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat">
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

export default App;
