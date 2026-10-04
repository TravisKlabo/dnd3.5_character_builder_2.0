import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./App.css";
import {
  abilityModifier,
  armorClass,
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
  type SpellAcquisition,
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
const dragonlanceLanguages = new Set(["Kender", "Minotaur"]);

function getAvailableLanguages(
  ruleset: "core-35-srd" | "dragonlance-user-pack" | "dragonlance-monster-classes",
) {
  return languageCatalog.filter(
    (language) =>
      ruleset !== "core-35-srd" || !dragonlanceLanguages.has(language),
  );
}
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
    id: "scribe-scroll",
    name: "Scribe Scroll",
    source: "core-35-srd",
    description: "Create magic scrolls containing spells you can cast.",
  },
  {
    id: "craft-wand",
    name: "Craft Wand",
    source: "core-35-srd",
    description: "Create wands containing spells of 4th level or lower.",
  },
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
const fullCasterProgression = `3 1|4 2|4 2 1|4 3 2|4 3 2 1|4 3 3 2|4 4 3 2 1|4 4 3 3 2|4 4 4 3 2 1|4 4 4 3 3 2|4 4 4 4 3 2 1|4 4 4 4 3 3 2|4 4 4 4 4 3 2 1|4 4 4 4 4 3 3 2|4 4 4 4 4 4 3 2 1|4 4 4 4 4 4 3 3 2|4 4 4 4 4 4 4 3 2 1|4 4 4 4 4 4 4 3 3 2|4 4 4 4 4 4 4 4 3 3|4 4 4 4 4 4 4 4 4 4`.split("|").map((row) => row.split(" ").map(Number));
const sorcererProgression = `5 3|6 4|6 5|6 6 3|6 6 4|6 6 5 3|6 6 6 4|6 6 6 5 3|6 6 6 6 4|6 6 6 6 5 3|6 6 6 6 6 4|6 6 6 6 6 5 3|6 6 6 6 6 6 4|6 6 6 6 6 6 5 3|6 6 6 6 6 6 6 4|6 6 6 6 6 6 6 5 3|6 6 6 6 6 6 6 6 4|6 6 6 6 6 6 6 6 5 3|6 6 6 6 6 6 6 6 6 4|6 6 6 6 6 6 6 6 6 6`.split("|").map((row) => row.split(" ").map(Number));
const bardProgression = `2|3|3 1|3 2|3 3 1|3 3 2|3 3 2 1|3 3 3 1|3 3 3 2|3 3 3 2 1|3 3 3 3 1|3 3 3 3 2|3 3 3 3 2 1|3 3 3 3 3 1|3 3 3 3 3 2|3 3 3 3 3 2 1|3 3 3 3 3 3 1|3 3 3 3 3 3 2|3 3 3 3 3 3 3|4 4 4 4 4 4 4`.split("|").map((row) => row.split(" ").map(Number));
const partialCasterProgression = `| | |0|0|1|1|1 0|1 0|1 1|1 1 0|1 1 1|1 1 1|2 1 1 0|2 1 1 1|2 2 1 1|2 2 2 1|3 2 2 1|3 3 3 2|3 3 3 3`.split("|").map((row) => row.trim() ? row.trim().split(" ").map(Number) : []);
const bardKnownProgression = `4 2|5 2|6 3|6 3 2|6 4 3|6 4 3 2|6 4 4 3|6 4 4 3 2|6 4 4 4 3|6 4 4 4 3 2|6 4 4 4 4 3|6 4 4 4 4 3 2|6 4 4 4 4 4 3|6 4 4 4 4 4 3 2|6 4 4 4 4 4 4 3|6 4 4 4 4 4 4 3 2|6 4 4 4 4 4 4 4 3|6 4 4 4 4 4 4 4 3 2|6 4 4 4 4 4 4 4 4 3|6 4 4 4 4 4 4 4 4 4`.split("|").map((row) => row.split(" ").map(Number));
const sorcererKnownProgression = `4 2|5 3|6 4|6 5 2|6 6 3|6 6 4 2|6 6 5 3|6 6 6 4|6 6 6 5 2|6 6 6 6 3|6 6 6 6 4 2|6 6 6 6 5 3|6 6 6 6 6 4|6 6 6 6 6 5 2|6 6 6 6 6 6 3|6 6 6 6 6 6 4 2|6 6 6 6 6 6 5 3|6 6 6 6 6 6 6 4|6 6 6 6 6 6 6 5 2|6 6 6 6 6 6 6 6 3`.split("|").map((row) => row.split(" ").map(Number));
const spellProgressions: Partial<Record<ClassId, number[][]>> = {
  bard: bardProgression,
  cleric: fullCasterProgression,
  druid: fullCasterProgression,
  mystic: fullCasterProgression,
  paladin: partialCasterProgression,
  ranger: partialCasterProgression,
  sorcerer: sorcererProgression,
  wizard: fullCasterProgression,
};
function baseSpellSlots(classId: ClassId, classLevel: number, spellLevel: number) {
  return spellProgressions[classId]?.[Math.max(0, classLevel - 1)]?.[spellLevel] ?? 0;
}
function hasSpellLevelAtClassLevel(
  classId: ClassId,
  classLevel: number,
  spellLevel: number,
) {
  if (spellLevel === 0) return !["paladin", "ranger"].includes(classId);
  if (classId === "paladin" || classId === "ranger") return classLevel >= 4;
  if (classId === "bard")
    return bardKnownProgression[classLevel - 1]?.[spellLevel] !== undefined;
  return classLevel >= spellLevel * 2 - 1;
}
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
  bard: [
    "Bardic Knowledge",
    "Bardic Music",
    "Countersong",
    "Fascinate",
    "Inspire Courage",
  ],
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
const classFeatureDescriptions: Record<string, string> = {
  "Bardic Knowledge":
    "Make a special check to recall legends, notable people, and obscure information.",
  "Bardic Music":
    "Use performance to create magical effects while meeting the required ranks and level.",
  Countersong:
    "Grant nearby allies a new saving throw against sonic or language-dependent effects.",
  Fascinate:
    "Use performance to captivate creatures that can see and hear you.",
  "Inspire Courage":
    "Grant allies a morale bonus on saves against fear and charm and on weapon damage rolls.",
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
  | "Mounts & Vehicles"
  | "Instruments";
type StoreItem = {
  name: string;
  category: StoreCategory;
  price: number;
  weight: string;
  description?: string;
  custom?: boolean;
  damage?: string;
  damageSmall?: string;
  damageMedium?: string;
  damageLarge?: string;
  damageType?: string;
  critical?: string;
  proficiency?: "Simple" | "Martial" | "Exotic";
  handedness?: "Light" | "One-handed" | "Two-handed" | "Ranged";
  finesse?: boolean;
  rangeIncrement?: string;
  rangeSmall?: string;
  rangeMedium?: string;
  rangeLarge?: string;
  reach?: string;
  specialProperties?: string;
  armorBonus?: number;
  maxDexterity?: number;
  armorCheckPenalty?: number;
  arcaneSpellFailure?: number;
  armorSpeed?: string;
  armorCategory?: "Light" | "Medium" | "Heavy";
  shieldBonus?: number;
  shieldType?: "Buckler" | "Light" | "Heavy" | "Tower" | "Custom";
  shieldCheckPenalty?: number;
  shieldSpellFailure?: number;
  towerShieldProficiency?: boolean;
};
const storeItems: StoreItem[] = [
  { name: "Longsword", category: "Weapons", price: 15, weight: "4 lb." },
  { name: "Rapier", category: "Weapons", price: 20, weight: "2 lb." },
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
const customStoreItemsStorageKey = "dnd35-character-builder.custom-store-items";
const savedCharacterStorageKey = "dnd35-character-builder-character";

function loadSavedCharacter() {
  if (typeof window === "undefined") return initialCharacter;
  try {
    const stored = window.localStorage.getItem(savedCharacterStorageKey);
    if (!stored) return initialCharacter;
    const character = JSON.parse(stored) as Character;
    return {
      ...character,
      classLevels: character.classLevels.filter(
        (level) =>
          !("prestigeClassId" in level && level.prestigeClassId === "wizard-of-high-sorcery"),
      ),
    };
  } catch {
    return initialCharacter;
  }
}

function loadCustomStoreItems() {
  try {
    const stored = window.localStorage.getItem(customStoreItemsStorageKey);
    if (!stored) return [];
    const items = JSON.parse(stored) as StoreItem[];
    return Array.isArray(items) ? items.filter((item) => item.custom && item.name && item.category) : [];
  } catch {
    return [];
  }
}

function saveCustomStoreItems() {
  const customItems = storeItems.filter((item) => item.custom);
  window.localStorage.setItem(customStoreItemsStorageKey, JSON.stringify(customItems));
}

function formatCustomItemName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[A-Za-z][^\s-]*/g, (word) =>
      word.charAt(0).toUpperCase() + word.slice(1),
    );
}

storeItems.push(
  { name: "Club", category: "Weapons", price: 0, weight: "3 lb." },
  { name: "Quarterstaff", category: "Weapons", price: 0, weight: "4 lb." },
  { name: "Short Sword", category: "Weapons", price: 10, weight: "2 lb." },
  { name: "Battleaxe", category: "Weapons", price: 10, weight: "6 lb." },
  { name: "Warhammer", category: "Weapons", price: 12, weight: "5 lb." },
  { name: "Heavy Mace", category: "Weapons", price: 12, weight: "8 lb." },
  { name: "Dwarven Waraxe", category: "Weapons", price: 30, weight: "8 lb." },
  { name: "Greataxe", category: "Weapons", price: 20, weight: "12 lb." },
  { name: "Glaive", category: "Weapons", price: 8, weight: "10 lb." },
  { name: "Halberd", category: "Weapons", price: 10, weight: "12 lb." },
  { name: "Guisarme", category: "Weapons", price: 9, weight: "12 lb." },
  { name: "Lance", category: "Weapons", price: 10, weight: "10 lb." },
  { name: "Spear", category: "Weapons", price: 2, weight: "6 lb." },
  { name: "Heavy Crossbow", category: "Weapons", price: 50, weight: "8 lb." },
  { name: "Light Crossbow", category: "Weapons", price: 35, weight: "4 lb." },
  { name: "Sling", category: "Weapons", price: 0, weight: "0 lb." },
  { name: "Net", category: "Weapons", price: 20, weight: "6 lb." },
  { name: "Light Mace", category: "Weapons", price: 5, weight: "4 lb." },
  { name: "Morningstar", category: "Weapons", price: 8, weight: "6 lb." },
  { name: "Flail", category: "Weapons", price: 8, weight: "5 lb." },
  { name: "Sickle", category: "Weapons", price: 6, weight: "2 lb." },
  { name: "Javelin", category: "Weapons", price: 1, weight: "2 lb." },
  { name: "Short Spear", category: "Weapons", price: 1, weight: "3 lb." },
  { name: "Handaxe", category: "Weapons", price: 6, weight: "3 lb." },
  { name: "Kukri", category: "Weapons", price: 8, weight: "2 lb." },
  { name: "Scimitar", category: "Weapons", price: 15, weight: "4 lb." },
  { name: "Trident", category: "Weapons", price: 15, weight: "4 lb." },
  { name: "Hand Crossbow", category: "Weapons", price: 100, weight: "2 lb." },
  { name: "Repeating Heavy Crossbow", category: "Weapons", price: 400, weight: "12 lb." },
  { name: "Repeating Light Crossbow", category: "Weapons", price: 250, weight: "6 lb." },
  { name: "Composite Shortbow", category: "Weapons", price: 75, weight: "2 lb." },
  { name: "Composite Longbow", category: "Weapons", price: 100, weight: "3 lb." },
  { name: "Mithral Chain Shirt", category: "Armor", price: 1100, weight: "12.5 lb." },
  { name: "Mithral Breastplate", category: "Armor", price: 4200, weight: "15 lb." },
  { name: "Mithral Full Plate", category: "Armor", price: 10500, weight: "25 lb." },
  { name: "Masterwork Longsword", category: "Weapons", price: 315, weight: "4 lb." },
  { name: "Masterwork Rapier", category: "Weapons", price: 320, weight: "2 lb." },
  { name: "Masterwork Dagger", category: "Weapons", price: 302, weight: "1 lb." },
  { name: "Masterwork Greatsword", category: "Weapons", price: 350, weight: "8 lb." },
  { name: "Masterwork Shortbow", category: "Weapons", price: 330, weight: "2 lb." },
  { name: "Masterwork Longbow", category: "Weapons", price: 375, weight: "3 lb." },
  { name: "Masterwork Chain Shirt", category: "Armor", price: 250, weight: "25 lb." },
  { name: "Masterwork Breastplate", category: "Armor", price: 350, weight: "30 lb." },
  { name: "Masterwork Full Plate", category: "Armor", price: 1650, weight: "50 lb." },
  { name: "Masterwork Heavy Steel Shield", category: "Shields", price: 170, weight: "15 lb." },
  { name: "Cold Iron Longsword", category: "Weapons", price: 315, weight: "4 lb." },
  { name: "Silver Dagger", category: "Weapons", price: 22, weight: "1 lb." },
  { name: "Mithral Longsword", category: "Weapons", price: 1015, weight: "4 lb." },
  { name: "Ring of Feather Falling", category: "Rings", price: 2200, weight: "—", description: "You always fall as though from 60 feet or less." },
  { name: "Ring of Acid Resistance", category: "Rings", price: 12000, weight: "—", description: "The wearer gains resistance 10 against acid." },
  { name: "Ring of Chameleon", category: "Rings", price: 12700, weight: "—", description: "The wearer gains a +10 competence bonus on Hide checks." },
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
  { name: "Ring of Protection +4", category: "Rings", price: 32000, weight: "—", description: "+4 deflection bonus to AC." },
  { name: "Ring of Protection +5", category: "Rings", price: 50000, weight: "—", description: "+5 deflection bonus to AC." },
  { name: "Ring of Shooting Stars", category: "Rings", price: 50000, weight: "—", description: "Provides several fire-based spell-like effects." },
  { name: "Ring of X-Ray Vision", category: "Rings", price: 25000, weight: "—", description: "Allows the wearer to see through solid matter for a limited time." },
  { name: "Ring of Spell Turning", category: "Rings", price: 100000, weight: "—", description: "Turns spells and spell-like abilities back upon their casters." },
  { name: "Ring of Greater Energy Resistance", category: "Rings", price: 66000, weight: "—", description: "The wearer gains resistance 30 against one energy type." },
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

if (typeof window !== "undefined") {
  storeItems.push(...loadCustomStoreItems());
}

function getEquipmentArmorClass(character: Character) {
  const equipment = character.equipment ?? {};
  const armorName = equipment.Armor ?? "";
  const shieldName = equipment.Shield ?? "";
  const bracersName = Object.values(equipment).find((value) => /Bracers of Armor/.test(value)) ?? "";
  const armorBaseName = Object.keys(armorBonuses)
    .sort((left, right) => right.length - left.length)
    .find((name) => armorName.includes(name));
  const customArmor = [...storeItems]
    .sort((left, right) => right.name.length - left.name.length)
    .find((item) => item.category === "Armor" && armorName.includes(item.name));
  const shieldBaseName = Object.keys(shieldBonuses)
    .sort((left, right) => right.length - left.length)
    .find((name) => shieldName.includes(name));
  const bracersArmorBonus = !armorBaseName && bracersName
    ? Number(bracersName.match(/\+(\d+)/)?.[1] ?? 0)
    : 0;
  const maximumDexterityBonus = armorBaseName
    ? armorMaximumDexterity[armorBaseName]
    : customArmor?.maxDexterity ?? Infinity;
  const armorEnhancement = armorName.match(/\+(\d+)/)?.[1];
  const shieldEnhancement = shieldName.match(/\+(\d+)/)?.[1];
  return armorClass(
    character,
    (armorBaseName ? armorBonuses[armorBaseName] : customArmor?.armorBonus ?? 0) +
      (armorEnhancement ? Number(armorEnhancement) : 0) +
      bracersArmorBonus,
    maximumDexterityBonus,
    (shieldBaseName ? shieldBonuses[shieldBaseName] : 0) +
      (shieldEnhancement ? Number(shieldEnhancement) : 0),
  );
}

const weaponDamageBySize: Record<string, { smaller: string; larger: string }> = {
  "1d2": { smaller: "1", larger: "1d3" },
  "1d3": { smaller: "1d2", larger: "1d4" },
  "1d4": { smaller: "1d3", larger: "1d6" },
  "1d6": { smaller: "1d4", larger: "1d8" },
  "1d8": { smaller: "1d6", larger: "2d6" },
  "1d10": { smaller: "1d8", larger: "2d8" },
  "1d12": { smaller: "1d10", larger: "3d6" },
  "2d4": { smaller: "1d4", larger: "2d6" },
  "2d6": { smaller: "1d8", larger: "3d6" },
};

function getSizedWeaponDamage(damage: string, size: string) {
  if (size === "Small") return weaponDamageBySize[damage]?.smaller ?? damage;
  if (size === "Large") return weaponDamageBySize[damage]?.larger ?? damage;
  return damage;
}

function getWeaponDamageForSize(item: StoreItem, size: string) {
  const customDamage = size === "Small" ? item.damageSmall : size === "Large" ? item.damageLarge : item.damageMedium;
  return customDamage ?? getSizedWeaponDamage(item.damage ?? getWeaponProfile(item.name).damage, size);
}

function getWeaponRangeForSize(item: StoreItem, size: string) {
  return size === "Small"
    ? item.rangeSmall ?? item.rangeIncrement
    : size === "Large"
      ? item.rangeLarge ?? item.rangeIncrement
      : item.rangeMedium ?? item.rangeIncrement;
}

function getStoreItemDescription(item: StoreItem, size = "Medium") {
  if (item.category === "Armor") {
    const name = Object.keys(armorBonuses)
      .sort((left, right) => right.length - left.length)
      .find((entry) => item.name.includes(entry));
    const armorBonus = name ? armorBonuses[name] : item.armorBonus ?? 0;
    const armorClass = name ? armorClasses[name] : `${item.armorCategory ?? "Custom"} armor`;
    const maximumDexterity = name ? armorMaximumDexterity[name] : item.maxDexterity ?? Infinity;
    const checkPenalty = name
      ? armorCheckPenalties[name] - (item.name.startsWith("Masterwork ") ? 1 : 0)
      : item.armorCheckPenalty ?? 0;
    const baseDescription = item.description ? `${item.description} ` : "";
    const masterworkBenefit = item.name.startsWith("Masterwork ")
      ? " Masterwork: armor check penalty reduced by 1."
      : "";
    return `${baseDescription}${armorClass} armor; armor bonus +${armorBonus}; max Dex ${maximumDexterity === Infinity ? "—" : `+${maximumDexterity}`}; armor check penalty ${checkPenalty}; arcane spell failure ${item.arcaneSpellFailure ?? 0}%; speed ${item.armorSpeed ?? "varies"}.${masterworkBenefit}`;
  }
  if (item.category === "Weapons") {
    const profile = getWeaponProfile(item.name);
    const baseWeaponName = item.name.replace(/^(?:Masterwork|Cold Iron|Silver|Mithral) /, "");
    const damageType = item.damageType ?? weaponDamageTypes[item.name] ?? weaponDamageTypes[baseWeaponName] ?? "varies";
    const damage = getWeaponDamageForSize(item, size);
    const criticalValue = item.critical ?? profile.crit;
    const critical = item.custom || criticalValue !== "20/x2" ? `; crit ${criticalValue}` : "";
    const masterworkBenefit = item.name.startsWith("Masterwork ")
      ? " Masterwork: +1 enhancement bonus on attack rolls; this does not add damage."
      : "";
    const properties = [
      item.finesse ? "finesse" : "",
      getWeaponRangeForSize(item, size) ? `range ${getWeaponRangeForSize(item, size)}` : "",
      item.reach ? `reach ${item.reach}` : "",
      item.specialProperties ?? "",
    ].filter(Boolean).join(", ");
    return `${item.description ? `${item.description} ` : ""}${damageType}; ${damage} damage${critical}.${properties ? ` Properties: ${properties}.` : ""}${masterworkBenefit}`;
  }
  if (item.description) return item.description;
  if (item.category === "Shields") {
    const name = Object.keys(shieldBonuses).find((entry) => item.name.includes(entry));
    const shieldBonus = name ? shieldBonuses[name] : item.shieldBonus ?? 0;
    const checkPenalty = name
      ? shieldCheckPenalties[name] - (item.name.startsWith("Masterwork ") ? 1 : 0)
      : item.shieldCheckPenalty ?? 0;
    const masterworkBenefit = item.name.startsWith("Masterwork ")
      ? " Masterwork: shield check penalty reduced by 1."
      : "";
    return `Shield bonus +${shieldBonus}; armor check penalty ${checkPenalty}; arcane spell failure ${item.shieldSpellFailure ?? 0}%; ${item.shieldType ?? "custom"} shield; uses the off hand.${masterworkBenefit}`;
  }
  if (item.category === "Ammunition") return "Ammunition used with a compatible ranged weapon.";
  if (item.category === "Instruments") return "A musical instrument used for performance, bardic music, or magical effects.";
  if (item.category === "Tools & Kits") {
    if (item.name === "Masterwork Thieves' Tools") {
      return "+2 circumstance bonus on Disable Device and Open Lock checks.";
    }
    if (item.name === "Masterwork Tool") {
      return "+2 circumstance bonus on checks made with the tool's associated skill.";
    }
    return "A tool or kit used for a specific task.";
  }
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
    .find((entry) => entry.name === name) ??
    [...storeItems]
      .sort((left, right) => right.name.length - left.name.length)
      .find((entry) => name.includes(entry.name));
  const spellName = name.match(/^(?:Wand|Scroll) of (.+?) \(CL /)?.[1];
  const spell = spellName
    ? srdSpells.find((entry) => entry.name === spellName)
    : undefined;
  const weight = item ? getSizedStoreWeight(item, size) : "—";
  const numericWeight = Number.parseFloat(weight);
  return {
    name,
    size,
    weight,
    price: item ? getSizedStorePrice(item, size) : undefined,
    category: item?.category ?? "Crafted item",
    description: item ? getStoreItemDescription(item, size) : "Inventory item.",
    spell,
    numericWeight: Number.isNaN(numericWeight) ? 0 : numericWeight,
  };
}
function getCarriedWeight(character: Character) {
  return Object.entries(character.inventory ?? {}).reduce((total, [key, quantity]) => {
    const details = getInventoryEntryDetails(key);
    return total + details.numericWeight * quantity;
  }, 0);
}
function getWeaponSizeNote(size: string) {
  return size === "Small"
    ? "smaller damage die; 5-ft. reach"
    : size === "Large"
      ? "larger damage die; 10-ft. reach where applicable"
      : "standard damage die; 5-ft. reach";
}

const weaponProfiles: Record<string, { damage: string; crit: string }> = {
  Club: { damage: "1d6", crit: "x2" },
  "Short Sword": { damage: "1d6", crit: "19–20/x2" },
  "Heavy Mace": { damage: "1d8", crit: "x2" },
  "Dwarven Waraxe": { damage: "1d10", crit: "x3" },
  Longsword: { damage: "1d8", crit: "19–20/x2" },
  Dagger: { damage: "1d4", crit: "19–20/x2" },
  Handaxe: { damage: "1d6", crit: "x3" },
  Greatsword: { damage: "2d6", crit: "19–20/x2" },
  Shortbow: { damage: "1d6", crit: "x3" },
  Longbow: { damage: "1d8", crit: "x3" },
  Rapier: { damage: "1d6", crit: "18–20/x2" },
  Javelin: { damage: "1d6", crit: "x2" },
  Trident: { damage: "1d8", crit: "x2" },
  Net: { damage: "—", crit: "—" },
  Whip: { damage: "1d3", crit: "x2" },
  Kukri: { damage: "1d4", crit: "18–20/x2" },
  Kama: { damage: "1d6", crit: "x2" },
  Sickle: { damage: "1d6", crit: "x2" },
  Scimitar: { damage: "1d6", crit: "18–20/x2" },
  Battleaxe: { damage: "1d8", crit: "x3" },
  Greataxe: { damage: "1d12", crit: "x3" },
  Warhammer: { damage: "1d8", crit: "x3" },
  Mace: { damage: "1d8", crit: "x2" },
  "Light Mace": { damage: "1d6", crit: "x2" },
  "Light Hammer": { damage: "1d4", crit: "x2" },
  Spear: { damage: "1d8", crit: "x3" },
  Glaive: { damage: "1d10", crit: "x3" },
  Halberd: { damage: "1d10", crit: "x3" },
  Guisarme: { damage: "2d4", crit: "x3" },
  "Spiked Chain": { damage: "2d4", crit: "x2" },
  Falchion: { damage: "2d4", crit: "18–20/x2" },
  Lance: { damage: "1d8", crit: "x3" },
  Morningstar: { damage: "1d8", crit: "x2" },
  Quarterstaff: { damage: "1d6", crit: "x2" },
  "Light Crossbow": { damage: "1d8", crit: "19–20/x2" },
  "Heavy Crossbow": { damage: "1d10", crit: "19–20/x2" },
  "Repeating Crossbow": { damage: "1d8", crit: "19–20/x2" },
  "Hand Crossbow": { damage: "1d4", crit: "19–20/x2" },
  "Repeating Heavy Crossbow": { damage: "1d10", crit: "19–20/x2" },
  "Repeating Light Crossbow": { damage: "1d8", crit: "19–20/x2" },
  "Composite Shortbow": { damage: "1d6", crit: "x3" },
  "Composite Longbow": { damage: "1d8", crit: "x3" },
  Sap: { damage: "1d6", crit: "x2" },
  Nunchaku: { damage: "1d6", crit: "x2" },
  Sai: { damage: "1d4", crit: "x2" },
  Siangham: { damage: "1d6", crit: "x2" },
  Dart: { damage: "1d4", crit: "x2" },
  Shuriken: { damage: "1d2", crit: "x2" },
  Sling: { damage: "1d4", crit: "x2" },
};

const weaponDamageTypes: Record<string, string> = {
  Longsword: "slashing",
  Dagger: "piercing or slashing",
  Handaxe: "slashing",
  Greatsword: "slashing",
  Shortbow: "piercing",
  Longbow: "piercing",
  Rapier: "piercing",
  Javelin: "piercing",
  Trident: "piercing",
  Net: "—",
  Whip: "slashing",
  Kukri: "slashing",
  Kama: "slashing",
  Sickle: "slashing",
  Scimitar: "slashing",
  Battleaxe: "slashing",
  Greataxe: "slashing",
  Warhammer: "bludgeoning",
  Mace: "bludgeoning",
  "Light Mace": "bludgeoning",
  "Light Hammer": "bludgeoning",
  Spear: "piercing",
  Glaive: "slashing",
  Halberd: "slashing",
  Guisarme: "slashing",
  "Spiked Chain": "piercing",
  Falchion: "slashing",
  Lance: "piercing",
  Morningstar: "bludgeoning or piercing",
  Quarterstaff: "bludgeoning",
  "Light Crossbow": "piercing",
  "Heavy Crossbow": "piercing",
  "Repeating Crossbow": "piercing",
  "Hand Crossbow": "piercing",
  Sap: "bludgeoning",
  Nunchaku: "bludgeoning",
  Sai: "piercing",
  Siangham: "piercing",
  Dart: "piercing",
  Shuriken: "piercing",
  Sling: "bludgeoning",
};

function getWeaponProfile(name: string) {
  const baseName = name
    .replace(/^(?:Masterwork|Cold Iron|Silver|Mithral) /, "")
    .replace(/^Repeating (Heavy|Light) Crossbow$/, "Repeating $1 Crossbow");
  return weaponProfiles[name] ?? weaponProfiles[baseName] ?? { damage: "varies", crit: "20/x2" };
}

function getEquippedWeaponStats(character: Character, key: string, attackPenalty = 0) {
  const name = key.replace(/ \((Small|Medium|Large)\)$/, "");
  const size = key.match(/ \((Small|Medium|Large)\)$/)?.[1] ?? "Medium";
  const item = [...storeItems]
    .sort((left, right) => right.name.length - left.name.length)
    .find((entry) => name.includes(entry.name));
  if (!item || item.category !== "Weapons") return null;
  const profile = getWeaponProfile(item.name);
  const isRanged = item.handedness === "Ranged" || rangedWeaponNames.has(item.name);
  const hasWeaponFinesse = Object.values(character.featSelections ?? {}).includes("weapon-finesse");
  const usesFinesse = Boolean(item.finesse && hasWeaponFinesse && item.handedness === "Light");
  const ability = isRanged || usesFinesse ? character.abilities.dex : character.abilities.str;
  const enhancement = Number(name.match(/\+(\d+)/)?.[1] ?? 0);
  const masterwork = name.startsWith("Masterwork ") ? 1 : 0;
  const baseAttackBonus = getBaseAttackBonus(character);
  const abilityAttackBonus = abilityModifier(ability);
  const attack = baseAttackBonus + abilityAttackBonus + enhancement + masterwork + attackPenalty;
  const damageAbility = isRanged ? 0 : abilityModifier(ability);
  const elementalProperties = [
    ["Flaming", "fire"],
    ["Frost", "cold"],
    ["Shock", "electricity"],
  ].filter(([property]) => name.includes(`${property} `));
  return {
    name,
    attack,
    damage: `${getWeaponDamageForSize(item, size)}${damageAbility >= 0 ? `+${damageAbility}` : damageAbility}`,
    damageType: item.damageType ?? weaponDamageTypes[item.name] ?? "varies",
    critical: item.critical ?? profile.crit,
    baseAttackBonus,
    abilityAttackBonus,
    enhancement,
    enchantmentDamage: elementalProperties.map(([property, damageType]) => `${property}: 1d6 ${damageType} damage`),
  };
}

function getTwoWeaponAttackPenalty(character: Character, slot: "Main Weapon" | "Off Hand Weapon") {
  const mainWeapon = character.equipment?.["Main Weapon"];
  const offHandWeapon = character.equipment?.["Off Hand Weapon"];
  if (!mainWeapon || !offHandWeapon) return 0;
  if (getChosenFeats(character).includes("two-weapon-fighting")) return -2;
  const offHandName = getInventoryEntryDetails(offHandWeapon).name;
  const offHandItem = [...storeItems]
    .sort((left, right) => right.name.length - left.name.length)
    .find((entry) => offHandName.includes(entry.name));
  const offHandBaseName = offHandItem?.name ?? offHandName;
  return slot === "Main Weapon"
    ? (lightOffHandWeaponNames.has(offHandBaseName) ? -4 : -6)
    : (lightOffHandWeaponNames.has(offHandBaseName) ? -8 : -10);
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

const simpleWeaponNames = new Set([
  "Club",
  "Dagger",
  "Light Mace",
  "Light Hammer",
  "Morningstar",
  "Quarterstaff",
  "Sickle",
  "Light Crossbow",
  "Heavy Crossbow",
  "Sling",
  "Javelin",
  "Dart",
  "Shuriken",
  "Unarmed Strike",
]);

const martialWeaponNames = new Set([
  "Battleaxe",
  "Flail",
  "Heavy Flail",
  "Short Sword",
  "Longsword",
  "Rapier",
  "Greatsword",
  "Shortbow",
  "Longbow",
  "Handaxe",
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
  "Repeating Crossbow",
  "Hand Crossbow",
  "Morningstar",
  "Scimitar",
  "Spear",
  "Warhammer",
]);

const martialWeaponClasses = new Set(["barbarian", "fighter", "paladin", "ranger"]);

function getBaseEquipmentName(name: string) {
  return name.replace(/^(?:Masterwork|Cold Iron|Silver|Mithral) /, "");
}

function getItemProficiencyWarning(character: Character, item: StoreItem) {
  if (item.category === "Instruments" || item.category === "Adventuring Gear") return null;
  const classIds = character.classLevels.map((entry) => entry.classId);
  if (item.category === "Weapons") {
    if (item.custom && item.proficiency === "Simple") return null;
    const baseName = getBaseEquipmentName(item.name);
    const simple = simpleWeaponNames.has(baseName);
    const martial = item.custom
      ? item.proficiency === "Martial"
      : martialWeaponNames.has(baseName);
    const race = raceDefinitions[character.race.toLowerCase().replaceAll(" ", "-")];
    const racialWeapons = race?.id === "dwarf"
      ? ["Dwarven Waraxe", "Warhammer"]
      : race?.id === "elf" || race?.id?.includes("elf")
        ? ["Longsword", "Rapier", "Longbow", "Shortbow"]
        : race?.id === "gnome"
          ? ["Gnome Hooked Hammer"]
          : [];
    const proficient = classIds.some((classId) =>
      simple || (martial && martialWeaponClasses.has(classId)) ||
      (classId === "bard" && ["Longsword", "Rapier", "Shortbow", "Whip"].includes(baseName)) ||
      (classId === "rogue" && ["Rapier", "Hand Crossbow", "Shortbow", "Short Sword", "Sap"].includes(baseName)) ||
      (classId === "monk" && ["Kama", "Nunchaku", "Sai", "Shuriken", "Siangham"].includes(baseName)) ||
      racialWeapons.includes(baseName),
    );
    return proficient ? null : `${item.name}: this character is not proficient with this weapon and will take the normal nonproficiency penalties.`;
  }
  if (item.category === "Shields") {
    const baseName = getBaseEquipmentName(item.name);
    const towerShield = item.towerShieldProficiency || baseName === "Tower Shield";
    const metalShield = /steel|mithral|metal/i.test(baseName);
    const proficient = classIds.some((classId) =>
      ["barbarian", "bard", "cleric", "druid", "fighter", "paladin", "ranger"].includes(classId) &&
      (!towerShield || ["fighter", "paladin"].includes(classId)) &&
      !(classId === "druid" && metalShield),
    );
    return proficient ? null : `${item.name}: this character is not proficient with this shield and will take the normal nonproficiency penalties.`;
  }
  if (item.category === "Armor") {
    const baseName = getBaseEquipmentName(item.name);
    const mediumArmor = item.custom
      ? item.armorCategory === "Medium"
      : ["Hide Armor", "Scale Mail", "Chainmail", "Mithral Breastplate"].includes(baseName);
    const lightArmor = item.custom
      ? item.armorCategory === "Light"
      : ["Padded Armor", "Leather Armor", "Studded Leather", "Mithral Chain Shirt"].includes(baseName);
    const metalArmor = /chain|scale|breastplate|full plate|steel|mithral/i.test(baseName);
    const proficient = classIds.some((classId) => {
      if (classId === "druid") return !metalArmor && (lightArmor || mediumArmor);
      if (["fighter", "paladin", "cleric", "barbarian"].includes(classId)) return true;
      if (classId === "ranger") return lightArmor || mediumArmor;
      if (["bard", "rogue", "noble"].includes(classId)) return lightArmor;
      return false;
    });
    return proficient ? null : `${item.name}: this character is not proficient with this armor and will take the normal nonproficiency penalties.`;
  }
  return null;
}

function EquipmentItemPicker({
  items,
  size,
  owned,
  onSelect,
  onPurchase,
  bulk = false,
  menuOnLeft = false,
  tooltipOnLeft = false,
}: {
  items: StoreItem[];
  size: string;
  owned: Record<string, number>;
  onSelect: (item: StoreItem) => void;
  onPurchase: (item: StoreItem, quantity?: number) => void;
  bulk?: boolean;
  menuOnLeft?: boolean;
  tooltipOnLeft?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<StoreItem>();
  const [quantity, setQuantity] = useState(1);
  const [hovered, setHovered] = useState<StoreItem>();
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>();
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
          (!pickerRef.current?.contains(event.target) &&
            !event.target.closest(".equipment-portal-menu"))
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
      className={`class-field feat-picker equipment-item-picker${menuOnLeft ? " menu-on-left" : ""}${tooltipOnLeft ? " tooltip-on-left" : ""}`}
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
          if (nextOpen) {
            const rect = pickerRef.current?.getBoundingClientRect();
            if (rect) {
              setMenuPosition({ top: rect.bottom + 4, left: rect.left });
            }
          }
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
            ? `${getSizedWeaponDamage(getWeaponProfile(hovered.name).damage, size)} damage; crit ${getWeaponProfile(hovered.name).crit}; ${getWeaponSizeNote(size)}.`
            : hovered.category === "Armor"
              ? getStoreItemDescription(hovered, size)
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
      {open &&
        createPortal(
        <div
          className="race-menu equipment-portal-menu"
          style={
            menuPosition
              ? {
                  position: "fixed",
                  zIndex: 1000,
                  top: menuPosition.top,
                  left: menuPosition.left,
                }
              : undefined
          }
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
        </div>,
          document.body,
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
  { name: "Bagpipes", category: "Instruments", price: 30, weight: "6 lb.", description: "A wind instrument with a distinctive drone." },
  { name: "Drum", category: "Instruments", price: 5, weight: "3 lb.", description: "A percussion instrument played with a beater or the hands." },
  { name: "Dulcimer", category: "Instruments", price: 25, weight: "10 lb.", description: "A stringed instrument played by striking its strings." },
  { name: "Flute", category: "Instruments", price: 5, weight: "2 lb.", description: "A simple woodwind instrument." },
  { name: "Lute", category: "Instruments", price: 35, weight: "3 lb.", description: "A portable plucked string instrument." },
  { name: "Lyre", category: "Instruments", price: 30, weight: "3 lb.", description: "A small harp-like string instrument." },
  { name: "Mandolin", category: "Instruments", price: 15, weight: "3 lb.", description: "A small, short-necked string instrument." },
  { name: "Pan Pipes", category: "Instruments", price: 12, weight: "2 lb.", description: "A set of connected pipes played by blowing across their openings." },
  { name: "Shawm", category: "Instruments", price: 2, weight: "1 lb.", description: "A double-reed woodwind instrument." },
  { name: "Horn", category: "Instruments", price: 3, weight: "2 lb.", description: "A curved horn used as a signaling or musical instrument." },
  { name: "Drum of Panic", category: "Instruments", price: 30000, weight: "3 lb.", description: "Effect: playing the drum creates a panic effect in creatures that hear it." },
  { name: "Horn of Blasting", category: "Instruments", price: 20000, weight: "2 lb.", description: "Effect: a blast produces a powerful cone of sonic force that can damage and deafen creatures." },
  { name: "Horn of the Tritons", category: "Instruments", price: 15000, weight: "2 lb.", description: "Effects: can calm rough water, frighten aquatic creatures, and call or command creatures of the sea." },
  { name: "Lyre of Building", category: "Instruments", price: 13000, weight: "3 lb.", description: "Effect: playing the lyre aids construction, repairs structural damage, and protects structures from harm." },
  { name: "Pipes of Haunting", category: "Instruments", price: 6000, weight: "3 lb.", description: "Effect: playing the pipes creates a haunting tune that can frighten creatures that hear it." },
  { name: "Pipes of Pain", category: "Instruments", price: 12000, weight: "3 lb.", description: "Effect: playing the pipes causes intense pain and penalties to creatures that hear the music." },
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
  { name: "Goggles of Minute Seeing", category: "Head", price: 12500, weight: "—" },
  { name: "Goggles of the Dragon", category: "Head", price: 15000, weight: "—" },
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
  { name: "Amulet of Natural Armor +2", category: "Neck", price: 8000, weight: "—" },
  { name: "Amulet of Natural Armor +3", category: "Neck", price: 18000, weight: "—" },
  { name: "Amulet of Mighty Fists", category: "Neck", price: 6000, weight: "—" },
  { name: "Periapt of Proof against Poison", category: "Neck", price: 27000, weight: "—" },
  { name: "Periapt of Wound Closure", category: "Neck", price: 15000, weight: "—" },
  { name: "Pearl of Power (1st)", category: "Neck", price: 1000, weight: "—" },
  {
    name: "Cloak of Resistance +1",
    category: "Shoulders",
    price: 1000,
    weight: "1 lb.",
  },
  { name: "Cloak of Resistance +2", category: "Shoulders", price: 4000, weight: "1 lb." },
  { name: "Cloak of Resistance +3", category: "Shoulders", price: 9000, weight: "1 lb." },
  {
    name: "Cloak of Elvenkind",
    category: "Shoulders",
    price: 2500,
    weight: "1 lb.",
  },
  {
    name: "Cloak of Displacement (Minor)",
    category: "Shoulders",
    price: 24000,
    weight: "1 lb.",
  },
  { name: "Cloak of the Bat", category: "Shoulders", price: 26000, weight: "1 lb." },
  { name: "Cloak of Arachnida", category: "Shoulders", price: 14000, weight: "1 lb." },
  {
    name: "Cloak of Displacement (Major)",
    category: "Shoulders",
    price: 50000,
    weight: "1 lb.",
  },
  {
    name: "Cloak of the Manta",
    category: "Shoulders",
    price: 7200,
    weight: "1 lb.",
  },
  {
    name: "Cape of the Mountebank",
    category: "Shoulders",
    price: 10080,
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
  ...[
    ["Arms", "Bracers of Armor +1", 1000, "1 lb."],
    ["Arms", "Bracers of Armor +2", 4000, "1 lb."],
    ["Arms", "Bracers of Armor +3", 9000, "1 lb."],
    ["Arms", "Bracers of Archery, Lesser", 5000, "1 lb."],
    ["Arms", "Bracers of Archery, Greater", 25000, "1 lb."],
    ["Hands", "Gloves of Swimming and Climbing", 6250, "—"],
    ["Hands", "Gloves of Dexterity +4", 16000, "—"],
    ["Hands", "Gauntlets of Ogre Power", 4000, "4 lb."],
    ["Hands", "Gloves of Arrow Snaring", 4000, "—"],
    ["Rings", "Ring of Swimming", 2500, "—"],
    ["Rings", "Ring of Invisibility", 20000, "—"],
    ["Rings", "Ring of Feather Falling", 2200, "—"],
    ["Waist", "Belt of Dwarvenkind", 14900, "1 lb."],
    ["Waist", "Belt of Giant Strength +4", 16000, "1 lb."],
    ["Feet", "Boots of Speed", 12000, "1 lb."],
    ["Feet", "Boots of Striding and Springing", 5500, "1 lb."],
    ["Feet", "Boots of Levitation", 7500, "1 lb."],
    ["Feet", "Winged Boots", 16000, "1 lb."],
    ["Body & Wondrous Items", "Portable Hole", 20000, "—"],
    ["Body & Wondrous Items", "Figurine of Wondrous Power, Silver Raven", 3800, "1 lb."],
    ["Body & Wondrous Items", "Figurine of Wondrous Power, Ebony Fly", 10000, "1 lb."],
    ["Body & Wondrous Items", "Figurine of Wondrous Power, Golden Lions", 16500, "1 lb."],
    ["Body & Wondrous Items", "Figurine of Wondrous Power, Onyx Dog", 6000, "1 lb."],
    ["Body & Wondrous Items", "Dust of Dryness", 850, "—"],
    ["Head", "Circlet of Persuasion", 4500, "—"],
    ["Head", "Helm of Telepathy", 27000, "3 lb."],
    ["Neck", "Periapt of Wisdom +2", 4000, "—"],
    ["Neck", "Periapt of Health", 7400, "—"],
    ["Ammunition", "Cold Iron Arrows (20)", 2, "3 lb."],
    ["Ammunition", "Masterwork Arrows (20)", 61, "3 lb."],
    ["Tools & Kits", "Climber's Kit", 80, "5 lb."],
    ["Tools & Kits", "Disguise Kit", 50, "8 lb."],
    ["Consumables", "Smokestick", 20, "0.5 lb."],
    ["Consumables", "Thunderstone", 30, "1 lb."],
    ["Potions, Scrolls & Wands", "Potion of Cure Moderate Wounds", 300, "—"],
    ["Potions, Scrolls & Wands", "Potion of Invisibility", 300, "—"],
    ["Potions, Scrolls & Wands", "Wand of Cure Moderate Wounds", 4500, "—"],
    ["Mounts & Vehicles", "Light Horse", 75, "—"],
    ["Mounts & Vehicles", "Warhorse", 400, "—"],
    ["Mounts & Vehicles", "Mule", 8, "—"],
  ].map(([category, name, price, weight]) => ({
    category: category as StoreCategory,
    name: name as string,
    price: price as number,
    weight: weight as string,
  })),
);
const srdArmorStats: Record<string, { price: number; weight: string }> = {
  "Padded Armor": { price: 5, weight: "10 lb." },
  "Leather Armor": { price: 10, weight: "15 lb." },
  "Studded Leather": { price: 25, weight: "20 lb." },
  "Hide Armor": { price: 15, weight: "25 lb." },
  "Scale Mail": { price: 50, weight: "30 lb." },
  Chainmail: { price: 150, weight: "40 lb." },
  "Splint Mail": { price: 200, weight: "45 lb." },
  "Half-Plate": { price: 600, weight: "50 lb." },
  "Full Plate": { price: 1500, weight: "50 lb." },
  Buckler: { price: 15, weight: "5 lb." },
  "Light Wooden Shield": { price: 3, weight: "5 lb." },
  "Heavy Wooden Shield": { price: 7, weight: "10 lb." },
  "Light Steel Shield": { price: 9, weight: "6 lb." },
  "Heavy Steel Shield": { price: 20, weight: "15 lb." },
  "Tower Shield": { price: 30, weight: "45 lb." },
};
storeItems.forEach((item) => {
  const stats = srdArmorStats[item.name];
  if (stats) {
    item.price = stats.price;
    item.weight = stats.weight;
  }
});
storeItems.push(
  { name: "Candle", category: "Adventuring Gear", price: 0.01, weight: "—" },
  { name: "Chain (10 ft.)", category: "Adventuring Gear", price: 30, weight: "2 lb." },
  { name: "Chalk (1 piece)", category: "Adventuring Gear", price: 0.01, weight: "—" },
  { name: "Crowbar", category: "Tools & Kits", price: 2, weight: "5 lb." },
  { name: "Grappling Hook", category: "Adventuring Gear", price: 1, weight: "4 lb." },
  { name: "Hooded Lantern", category: "Adventuring Gear", price: 7, weight: "2 lb." },
  { name: "Ink (1 oz.)", category: "Tools & Kits", price: 8, weight: "—" },
  { name: "Iron Pot", category: "Adventuring Gear", price: 0.5, weight: "2 lb." },
  { name: "Ladder (10 ft.)", category: "Adventuring Gear", price: 5, weight: "20 lb." },
  { name: "Lock", category: "Tools & Kits", price: 80, weight: "1 lb." },
  { name: "Manacles", category: "Tools & Kits", price: 15, weight: "2 lb." },
  { name: "Mirror, Steel", category: "Adventuring Gear", price: 10, weight: "0.5 lb." },
  { name: "Piton", category: "Adventuring Gear", price: 0.1, weight: "0.5 lb." },
  { name: "Pole (10 ft.)", category: "Adventuring Gear", price: 0.2, weight: "8 lb." },
  { name: "Sack", category: "Adventuring Gear", price: 0.1, weight: "0.5 lb." },
  { name: "Whetstone", category: "Tools & Kits", price: 0.02, weight: "1 lb." },
  { name: "Acid (flask)", category: "Consumables", price: 10, weight: "1 lb." },
  { name: "Alchemist's Fire", category: "Consumables", price: 20, weight: "1 lb." },
  { name: "Holy Water", category: "Consumables", price: 25, weight: "1 lb." },
  { name: "Tindertwig", category: "Consumables", price: 1, weight: "—" },
  { name: "Sunrod", category: "Consumables", price: 2, weight: "1 lb." },
  { name: "Tanglefoot Bag", category: "Consumables", price: 50, weight: "4 lb." },
  { name: "Oil (1-pint flask)", category: "Consumables", price: 0.1, weight: "1 lb." },
  { name: "Powdered Silver", category: "Consumables", price: 25, weight: "—" },
  { name: "Donkey", category: "Mounts & Vehicles", price: 8, weight: "—" },
  { name: "Camel", category: "Mounts & Vehicles", price: 50, weight: "—" },
  { name: "Dog", category: "Mounts & Vehicles", price: 25, weight: "—" },
  { name: "Mastiff", category: "Mounts & Vehicles", price: 150, weight: "—" },
  { name: "Elephant", category: "Mounts & Vehicles", price: 2000, weight: "—" },
  { name: "Pony", category: "Mounts & Vehicles", price: 30, weight: "—" },
  { name: "Warpony", category: "Mounts & Vehicles", price: 100, weight: "—" },
  { name: "Heavy Horse", category: "Mounts & Vehicles", price: 200, weight: "—" },
  { name: "Cart", category: "Mounts & Vehicles", price: 15, weight: "200 lb." },
  { name: "Wagon", category: "Mounts & Vehicles", price: 35, weight: "400 lb." },
  { name: "Sled", category: "Mounts & Vehicles", price: 20, weight: "300 lb." },
  { name: "Canoe", category: "Mounts & Vehicles", price: 50, weight: "—" },
  { name: "Raft", category: "Mounts & Vehicles", price: 10, weight: "—" },
  { name: "Keelboat", category: "Mounts & Vehicles", price: 3000, weight: "—" },
  { name: "Sailing Ship", category: "Mounts & Vehicles", price: 10000, weight: "—" },
  { name: "Warship", category: "Mounts & Vehicles", price: 25000, weight: "—" },
  { name: "Galley", category: "Mounts & Vehicles", price: 30000, weight: "—" },
  { name: "Potion of Cure Light Wounds", category: "Potions, Scrolls & Wands", price: 50, weight: "—" },
  { name: "Potion of Cure Serious Wounds", category: "Potions, Scrolls & Wands", price: 750, weight: "—" },
  { name: "Potion of Cure Critical Wounds", category: "Potions, Scrolls & Wands", price: 1050, weight: "—" },
  { name: "Potion of Bear's Endurance", category: "Potions, Scrolls & Wands", price: 300, weight: "—" },
  { name: "Potion of Bull's Strength", category: "Potions, Scrolls & Wands", price: 300, weight: "—" },
  { name: "Potion of Cat's Grace", category: "Potions, Scrolls & Wands", price: 300, weight: "—" },
  { name: "Potion of Invisibility", category: "Potions, Scrolls & Wands", price: 300, weight: "—" },
  { name: "Potion of Fly", category: "Potions, Scrolls & Wands", price: 750, weight: "—" },
  { name: "Potion of Barkskin", category: "Potions, Scrolls & Wands", price: 300, weight: "—" },
  { name: "Potion of Haste", category: "Potions, Scrolls & Wands", price: 750, weight: "—" },
  { name: "Potion of Remove Disease", category: "Potions, Scrolls & Wands", price: 750, weight: "—" },
  { name: "Potion of Neutralize Poison", category: "Potions, Scrolls & Wands", price: 750, weight: "—" },
  { name: "Scroll of Identify", category: "Potions, Scrolls & Wands", price: 25, weight: "—" },
  { name: "Scroll of Knock", category: "Potions, Scrolls & Wands", price: 150, weight: "—" },
  { name: "Scroll of Fireball", category: "Potions, Scrolls & Wands", price: 375, weight: "—" },
  { name: "Scroll of Teleport", category: "Potions, Scrolls & Wands", price: 1125, weight: "—" },
  { name: "Scroll of Dispel Magic", category: "Potions, Scrolls & Wands", price: 375, weight: "—" },
  { name: "Scroll of Invisibility", category: "Potions, Scrolls & Wands", price: 150, weight: "—" },
  { name: "Wand of Magic Missile", category: "Potions, Scrolls & Wands", price: 750, weight: "—" },
  { name: "Wand of Cure Light Wounds", category: "Potions, Scrolls & Wands", price: 750, weight: "—" },
  { name: "Wand of Fireball", category: "Potions, Scrolls & Wands", price: 11250, weight: "—" },
  { name: "Wand of Acid Arrow", category: "Potions, Scrolls & Wands", price: 4500, weight: "—" },
  { name: "Wand of Scorching Ray", category: "Potions, Scrolls & Wands", price: 4500, weight: "—" },
  { name: "Rod of Metamagic, Empower", category: "Rings & Magic Items", price: 32500, weight: "5 lb." },
  { name: "Rod of Metamagic, Extend", category: "Rings & Magic Items", price: 11000, weight: "5 lb." },
  { name: "Rod of Metamagic, Maximize", category: "Rings & Magic Items", price: 73000, weight: "5 lb." },
  { name: "Rod of Absorption", category: "Rings & Magic Items", price: 50000, weight: "5 lb." },
  { name: "Rod of Cancellation", category: "Rings & Magic Items", price: 11000, weight: "5 lb." },
  { name: "Rod of Metamagic, Lesser Empower", category: "Rings & Magic Items", price: 9000, weight: "5 lb." },
  { name: "Rod of Metamagic, Lesser Extend", category: "Rings & Magic Items", price: 3000, weight: "5 lb." },
  { name: "Rod of Metamagic, Lesser Maximize", category: "Rings & Magic Items", price: 14000, weight: "5 lb." },
  { name: "Rod of Lordly Might", category: "Rings & Magic Items", price: 70000, weight: "10 lb." },
  { name: "Rod of Splendor", category: "Rings & Magic Items", price: 25000, weight: "5 lb." },
  { name: "Rod of Thunder and Lightning", category: "Rings & Magic Items", price: 33000, weight: "5 lb." },
  { name: "Rod of Wonder", category: "Rings & Magic Items", price: 12000, weight: "5 lb." },
  { name: "Immovable Rod", category: "Rings & Magic Items", price: 5000, weight: "8 lb." },
  { name: "Staff of Charming", category: "Rings & Magic Items", price: 16500, weight: "4 lb." },
  { name: "Staff of Healing", category: "Rings & Magic Items", price: 15500, weight: "4 lb." },
  { name: "Staff of Fire", category: "Rings & Magic Items", price: 18950, weight: "5 lb." },
  { name: "Staff of Power", category: "Rings & Magic Items", price: 211000, weight: "5 lb." },
  { name: "Pearl of Power, 1st-level", category: "Body & Wondrous Items", price: 1000, weight: "—" },
  { name: "Pearl of Power, 2nd-level", category: "Body & Wondrous Items", price: 4000, weight: "—" },
  { name: "Pearl of Power, 3rd-level", category: "Body & Wondrous Items", price: 9000, weight: "—" },
  { name: "Pearl of Power, 4th-level", category: "Body & Wondrous Items", price: 16000, weight: "—" },
  { name: "Dimensional Anchor", category: "Body & Wondrous Items", price: 5000, weight: "—" },
  { name: "Buckler", category: "Shields", price: 15, weight: "5 lb." },
  { name: "Light Wooden Shield", category: "Shields", price: 3, weight: "5 lb." },
  { name: "Heavy Wooden Shield", category: "Shields", price: 7, weight: "10 lb." },
  { name: "Light Steel Shield", category: "Shields", price: 9, weight: "6 lb." },
  { name: "Ring of Counterspells", category: "Rings", price: 4000, weight: "—" },
  { name: "Ring of Force Shield", category: "Rings", price: 8500, weight: "—" },
  { name: "Ring of Ram", category: "Rings", price: 8600, weight: "—" },
  { name: "Ring of Major Energy Resistance", category: "Rings", price: 44000, weight: "—" },
  { name: "Ring of Minor Energy Resistance", category: "Rings", price: 12000, weight: "—" },
  { name: "Ring of Protection +2", category: "Rings", price: 8000, weight: "—" },
  { name: "Ring of Protection +3", category: "Rings", price: 18000, weight: "—" },
  { name: "Ring of Three Wishes", category: "Rings", price: 97950, weight: "—" },
  { name: "Broom of Flying", category: "Body & Wondrous Items", price: 17000, weight: "3 lb." },
  { name: "Carpet of Flying, 5 ft. by 5 ft.", category: "Body & Wondrous Items", price: 20000, weight: "8 lb." },
  { name: "Hat of Disguise", category: "Body & Wondrous Items", price: 1800, weight: "—" },
  { name: "Necklace of Fireballs I", category: "Neck", price: 1650, weight: "—" },
  { name: "Robe of Useful Items", category: "Body & Wondrous Items", price: 7000, weight: "1 lb." },
  { name: "Stone of Good Luck", category: "Body & Wondrous Items", price: 20000, weight: "—" },
  { name: "Sling Bullets (10)", category: "Ammunition", price: 0.1, weight: "5 lb." },
  { name: "Masterwork Bolts (10)", category: "Ammunition", price: 51, weight: "1 lb." },
  { name: "Silver Arrows (20)", category: "Ammunition", price: 22, weight: "3 lb." },
  { name: "Silver Bolts (10)", category: "Ammunition", price: 11, weight: "1 lb." },
  { name: "Cold Iron Bolts (10)", category: "Ammunition", price: 1, weight: "1 lb." },
  { name: "Darts (10)", category: "Ammunition", price: 0.5, weight: "5 lb." },
  { name: "Blowgun Needles (10)", category: "Ammunition", price: 1, weight: "—" },
  { name: "Masterwork Sling Bullets (10)", category: "Ammunition", price: 30.1, weight: "5 lb." },
  { name: "Silver Sling Bullets (10)", category: "Ammunition", price: 20.1, weight: "5 lb." },
  { name: "Lute", category: "Instruments", price: 35, weight: "3 lb." },
  { name: "Lyre", category: "Instruments", price: 30, weight: "3 lb." },
  { name: "Flute", category: "Instruments", price: 2, weight: "2 lb." },
  { name: "Horn", category: "Instruments", price: 3, weight: "2 lb." },
  { name: "Fiddle", category: "Instruments", price: 30, weight: "3 lb." },
  { name: "Pan Pipes", category: "Instruments", price: 12, weight: "2 lb." },
  { name: "Masterwork Instrument", category: "Instruments", price: 100, weight: "varies" },
  { name: "Artisan's Tools", category: "Tools & Kits", price: 5, weight: "5 lb." },
  { name: "Fishing Tackle", category: "Tools & Kits", price: 1, weight: "5 lb." },
  { name: "Magnifying Glass", category: "Tools & Kits", price: 100, weight: "—" },
  { name: "Manacles, Masterwork", category: "Tools & Kits", price: 50, weight: "2 lb." },
  { name: "Merchant's Scale", category: "Tools & Kits", price: 2, weight: "1 lb." },
  { name: "Mess Kit", category: "Tools & Kits", price: 0.2, weight: "1 lb." },
  { name: "Musical Instrument, Common", category: "Tools & Kits", price: 5, weight: "3 lb." },
  { name: "Spyglass", category: "Tools & Kits", price: 1000, weight: "1 lb." },
  { name: "Signal Whistle", category: "Tools & Kits", price: 0.8, weight: "—" },
  { name: "Masterwork Thieves' Tools", category: "Tools & Kits", price: 100, weight: "2 lb." },
  { name: "Caltrops", category: "Tools & Kits", price: 1, weight: "2 lb." },
  { name: "Block and Tackle", category: "Tools & Kits", price: 5, weight: "5 lb." },
  { name: "Portable Ram", category: "Tools & Kits", price: 10, weight: "20 lb." },
  { name: "Battering Ram", category: "Tools & Kits", price: 10, weight: "20 lb." },
  { name: "Blanket, Winter", category: "Adventuring Gear", price: 0.5, weight: "3 lb." },
  { name: "Bucket", category: "Adventuring Gear", price: 0.5, weight: "2 lb." },
  { name: "Cooking Pot", category: "Adventuring Gear", price: 2, weight: "4 lb." },
  { name: "Crowbar, Masterwork", category: "Tools & Kits", price: 302, weight: "5 lb." },
  { name: "Soap", category: "Adventuring Gear", price: 0.5, weight: "1 lb." },
  { name: "Bedroll", category: "Adventuring Gear", price: 0.1, weight: "5 lb." },
  { name: "Waterskin", category: "Adventuring Gear", price: 1, weight: "4 lb." },
  { name: "Scroll Case", category: "Adventuring Gear", price: 1, weight: "0.5 lb." },
  { name: "Map Case", category: "Adventuring Gear", price: 1, weight: "0.5 lb." },
  { name: "Tarp", category: "Adventuring Gear", price: 0.5, weight: "5 lb." },
  { name: "Traveler's Outfit", category: "Adventuring Gear", price: 1, weight: "—" },
  { name: "Winter Blanket", category: "Adventuring Gear", price: 0.5, weight: "3 lb." },
);
const uniqueStoreItems = new Map<string, StoreItem>();
storeItems.forEach((item) => {
  if (!uniqueStoreItems.has(item.name)) uniqueStoreItems.set(item.name, item);
});
storeItems.splice(0, storeItems.length, ...uniqueStoreItems.values());
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

function isClassSkill(
  character: Character,
  skill: string,
  classId?: ClassId,
) {
  const classIds = classId
    ? [classId]
    : character.classLevels.map((entry) => entry.classId);
  return classIds.some((classId) => classSkills[classId]?.includes(skill));
}

function getAvailableSkillCount(character: Character) {
  let available = 0;
  character.classLevels.forEach((entry, index) => {
    const classDefinition = classDefinitions[entry.classId];
    if (!classDefinition) return;
    const pointsPerLevel = Math.max(
      1,
      classDefinition.skillPoints +
        abilityModifier(character.abilities.int) +
        (character.race.toLowerCase() === "human" ? 1 : 0),
    );
    available += pointsPerLevel * (entry.level + (index === 0 ? 3 : 0));
  });
  return available;
}

function getSkillPointsPerLevel(character: Character, classId: ClassId) {
  const classDefinition = classDefinitions[classId];
  return Math.max(
    1,
    classDefinition.skillPoints +
      abilityModifier(character.abilities.int) +
      (character.race.toLowerCase() === "human" ? 1 : 0),
  );
}

function getLevelUpSpellWarnings(original: Character, proposed: Character) {
  const classId = proposed.classLevels.find((entry) => {
    const originalEntry = original.classLevels.find(
      (candidate) => candidate.classId === entry.classId,
    );
    return entry.level > (originalEntry?.level ?? 0);
  })?.classId;
  if (!classId || !classDefinitions[classId].spellcasting) return [];
  const originalLevel = Math.max(
    0,
    ...original.classLevels
      .filter((entry) => entry.classId === classId)
      .map((entry) => entry.level),
  );
  const proposedLevel = Math.max(
    0,
    ...proposed.classLevels
      .filter((entry) => entry.classId === classId)
      .map((entry) => entry.level),
  );
  if (proposedLevel <= originalLevel) return [];
  const classSpells = srdSpells.filter((spell) => spell.classes.includes(classId));
  const selectedCount = (character: Character, level: number) =>
    (character.knownSpellsByClass?.[classId]?.length
      ? character.knownSpellsByClass[classId]
      : character.knownSpells
    ).filter((spellName) =>
      classSpells.some(
        (spell) =>
          spell.name === spellName &&
          spell.level === level &&
          (character.knownSpellsByClass?.[classId]?.length ||
            !character.knownSpellClasses?.[spellName] ||
            character.knownSpellClasses[spellName] === classId),
      ),
    ).length;
  const spellLevelName = (level: number) =>
    level === 0
      ? "0-level"
      : `${level}${level === 1 ? "st" : level === 2 ? "nd" : level === 3 ? "rd" : "th"}-level`;
  const warnings: string[] = [];
  if (classId === "bard" || classId === "sorcerer") {
    for (let level = 0; level <= 9; level += 1) {
      const base = classId === "bard"
        ? bardKnownProgression[proposedLevel - 1]?.[level] ?? 0
        : sorcererKnownProgression[proposedLevel - 1]?.[level] ?? 0;
      const originalBase = classId === "bard"
        ? bardKnownProgression[originalLevel - 1]?.[level] ?? 0
        : sorcererKnownProgression[originalLevel - 1]?.[level] ?? 0;
      const required = Math.max(0, base - originalBase);
      const originalSelected = selectedCount(original, level);
      const proposedSelected = selectedCount(proposed, level);
      const missing = Math.max(
        0,
        required - Math.max(0, proposedSelected - originalSelected),
      );
      if (missing) warnings.push(`Learn ${missing} additional ${spellLevelName(level)} ${classDefinitions[classId].name} spell${missing === 1 ? "" : "s"}.`);
    }
  } else if (classId === "wizard") {
    for (let level = 0; level <= 9; level += 1) {
      if (!hasSpellLevelAtClassLevel(classId, proposedLevel, level)) continue;
      const required = level === 0
        ? 0
        : level === 1
          ? originalLevel === 0
            ? 3
            : 2
          : 2;
      const originalSelected = selectedCount(original, level);
      const proposedSelected = selectedCount(proposed, level);
      const missing = Math.max(
        0,
        required - Math.max(0, proposedSelected - originalSelected),
      );
      if (missing) warnings.push(`Add ${missing} ${spellLevelName(level)} Wizard spell${missing === 1 ? "" : "s"} to the spellbook.`);
    }
  } else {
    return warnings;
  }
  return warnings;
}

function getLevelUpClassId(original: Character, proposed: Character): ClassId {
  return (
    proposed.classLevels.find((entry) => {
      const originalEntry = original.classLevels.find(
        (candidate) => candidate.classId === entry.classId,
      );
      return entry.level > (originalEntry?.level ?? 0);
    })?.classId ?? "fighter"
  );
}

function getNewLevelUpFeatSlots(original: Character, proposed: Character) {
  const originalSlots = new Set(getFeatSlots(original).map((slot) => slot.id));
  return getFeatSlots(proposed).filter((slot) => !originalSlots.has(slot.id));
}

function getLevelUpSkillWarnings(original: Character, proposed: Character) {
  const classId = getLevelUpClassId(original, proposed);
  const newSkillPoints =
    getAvailableSkillCount(proposed) - getAvailableSkillCount(original);
  const newSkillRanks =
    getLevelUpSpentSkillPoints(original, proposed, classId) -
    getSpentSkillPoints(original);
  if (newSkillRanks < newSkillPoints)
    return [
      `Spend all new skill points (${newSkillPoints - newSkillRanks} remaining).`,
    ];
  return [];
}

function getSpentSkillPoints(character: Character) {
  return Object.entries(character.skills).reduce((total, [skill, ranks]) => {
    return (
      total + Number(ranks || 0) * (isClassSkill(character, skill) ? 1 : 2)
    );
  }, 0);
}

function getLevelUpSpentSkillPoints(
  original: Character,
  proposed: Character,
  classId: ClassId,
) {
  const addedCost = skills.reduce((total, skill) => {
    const addedRanks = Math.max(
      0,
      Number(proposed.skills[skill] || 0) - Number(original.skills[skill] || 0),
    );
    return total + addedRanks * (isClassSkill(proposed, skill, classId) ? 1 : 2);
  }, 0);
  return getSpentSkillPoints(original) + addedCost;
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
    const progression = classDefinitions[entry.classId]?.baseAttackBonus;
    if (!progression) return total;
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

function getBaseSave(
  character: Character,
  save: "fortitude" | "reflex" | "will",
) {
  return character.classLevels.reduce((total, entry) => {
    const progression = classDefinitions[entry.classId]?.[save];
    if (!progression) return total;
    return total + (progression === "good" ? 2 + Math.floor(entry.level / 2) : Math.floor(entry.level / 3));
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

function canIncreaseSkillRank(
  character: Character,
  skill: string,
  levelUpOriginal?: Character,
  levelUpClassId?: ClassId,
  creationMode = false,
) {
  const currentRanks = Number(character.skills[skill] || 0);
  const activeLevelUpClassId = levelUpOriginal
    ? levelUpClassId ?? getLevelUpClassId(levelUpOriginal, character)
    : undefined;
  const pointCost = isClassSkill(character, skill, activeLevelUpClassId) ? 1 : 2;
  const availableSkillPoints = levelUpOriginal
    ? getAvailableSkillCount(levelUpOriginal) +
      getSkillPointsPerLevel(levelUpOriginal, activeLevelUpClassId ?? "fighter")
    : getAvailableSkillCount(character);
  const spentSkillPoints = levelUpOriginal
    ? getLevelUpSpentSkillPoints(
        levelUpOriginal,
        character,
        activeLevelUpClassId ?? "fighter",
      )
    : getSpentSkillPoints(character);
  const maximumRanks = creationMode
    ? (isClassSkill(character, skill, activeLevelUpClassId) ? 4 : 2)
    : getSkillMaximum(character, skill);
  return (
    currentRanks < maximumRanks &&
    spentSkillPoints + pointCost <=
      availableSkillPoints
  );
}

function getAssignedSkillRanks(
  character: Character,
  skill: string,
  levelUpOriginal?: Character,
) {
  const ranks = Number(character.skills[skill] || 0);
  return levelUpOriginal
    ? Math.max(0, ranks - Number(levelUpOriginal.skills[skill] || 0))
    : ranks;
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

function heightToTotalInches(height: string | undefined) {
  const match = (height ?? "").match(/^(\d+)\s*ft\.?\s*(\d+)\s*in\.?$/i);
  if (match) return Number(match[1]) * 12 + Math.min(11, Number(match[2]));
  const legacyInches = Number(height);
  return Number.isFinite(legacyInches) ? Math.max(0, legacyInches) : 0;
}

function App() {
  const [activeSheet, setActiveSheet] = useState("character");
  const [character, setCharacter] = useState<Character>(() => loadSavedCharacter());
  const [creationDraft, setCreationDraft] = useState<Character>(() =>
    cloneCharacter(loadSavedCharacter()),
  );
  const hasSavedCharacter = typeof window !== "undefined" && Boolean(window.localStorage.getItem(savedCharacterStorageKey));
  const [creationOpen, setCreationOpen] = useState(!hasSavedCharacter);
  const [creationLocked, setCreationLocked] = useState(hasSavedCharacter);
  const [printPreviewHtml, setPrintPreviewHtml] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
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
  const [lastLevelUpClassId, setLastLevelUpClassId] = useState<ClassId>(
    initialCharacter.classLevels.at(-1)?.classId ?? "fighter",
  );
  const levelUpMode = levelUpDraft !== null;
  const printVariant = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("print")
    : null;

  const changeAbilityMethod = (method: "roll" | "pointBuy" | "manual") => {
    setAbilityMethod(method);
    if (method !== "roll") return;
    setRolledScores(null);
    setRolledAssignments(null);
    setCreationDraft((current) => ({
      ...current,
      abilities: {
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
      },
    }));
  };

  const startLevelUp = (classId: ClassId) => {
    setLastLevelUpClassId(classId);
    if (classDefinitions[classId].spellcasting) setActiveSheet("spells");
    const freshDraft = beginLevelUp(cloneCharacter(character), classId);
    setLevelUpDraft({
      ...freshDraft,
      hitPointRoll: null,
      abilityIncrease: null,
      validationErrors: [],
    });
  };
  const updateLevelUpAbilityIncrease = (ability: AbilityName | null) => {
    if (!levelUpDraft) return;
    const abilities = { ...levelUpDraft.original.abilities };
    if (ability) abilities[ability] += 1;
    setLevelUpDraft({
      ...levelUpDraft,
      abilityIncrease: ability,
      proposed: { ...levelUpDraft.proposed, abilities },
      validationErrors: [],
    });
  };
  const rollDraftHitPoints = () => {
    if (!levelUpDraft || levelUpDraft.hitPointRoll !== null) return;
    const hitPointRoll = rollHitDie(
      classDefinitions[levelUpDraft.classId].hitDie,
    );
    setLevelUpDraft({ ...levelUpDraft, hitPointRoll, validationErrors: [] });
  };
  const confirmLevelUp = () => {
    if (!levelUpDraft) return;
    const validationErrors = [
      ...validateLevelUp(levelUpDraft),
      ...getLevelUpSkillWarnings(
        levelUpDraft.original,
        levelUpDraft.proposed,
      ),
      ...getNewLevelUpFeatSlots(
        levelUpDraft.original,
        levelUpDraft.proposed,
      )
        .filter((slot) => !levelUpDraft.proposed.featSelections?.[slot.id])
        .map((slot) => `Select ${slot.label} before confirming.`),
      ...getLevelUpSpellWarnings(
        levelUpDraft.original,
        levelUpDraft.proposed,
      ),
    ];
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
  ) => setCreationDraft((current) => {
    if (key === "prestigeClass") {
      const prestigeClass = value as Character["prestigeClass"];
      const classLevels = current.classLevels.filter(
        (level) => !("prestigeClassId" in level),
      );
      if (prestigeClass && prestigeClass !== "wizard-of-high-sorcery") {
        classLevels.push({
          classId: current.classLevels[0].classId,
          prestigeClassId: prestigeClass,
          level: 1,
        });
      }
      return { ...current, prestigeClass, classLevels };
    }
    return { ...current, [key]: value };
  });
  const updateCreationAbility = (ability: AbilityName, value: number) =>
    setCreationDraft((current) => ({
      ...current,
      abilities: { ...current.abilities, [ability]: value },
    }));
  const updateSkillRanks = (skill: string, change: number) => {
    const update = (current: Character) => {
      const classId = levelUpDraft?.classId ?? current.classLevels.at(-1)?.classId;
      const classSkill = isClassSkill(current, skill, classId);
      const currentRanks = Number(current.skills[skill] || 0);
      const minimumRanks = levelUpDraft
        ? Number(levelUpDraft.original.skills[skill] || 0)
        : 0;
      const maxRanks = creationOpen
        ? (classSkill ? 4 : 2)
        : getSkillMaximum(current, skill);
      const nextRanks = Math.max(
        minimumRanks,
        Math.min(maxRanks, currentRanks + change),
      );

      const pointCost = classSkill ? 1 : 2;
      const availableSkillPoints = levelUpDraft
        ? getAvailableSkillCount(levelUpDraft.original) +
          getSkillPointsPerLevel(levelUpDraft.original, levelUpDraft.classId)
        : getAvailableSkillCount(current);
      const currentSpent = levelUpDraft
        ? getLevelUpSpentSkillPoints(
            levelUpDraft.original,
            current,
            levelUpDraft.classId,
          )
        : getSpentSkillPoints(current);
      if (
        change > 0 &&
        currentSpent + pointCost > availableSkillPoints
      )
        return current;
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
    else if (levelUpDraft)
      setLevelUpDraft({
        ...levelUpDraft,
        proposed: update(levelUpDraft.proposed),
      });
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
  const updateKnownSpells = (
    knownSpells: string[],
    classId?: ClassId,
    acquisition: SpellAcquisition = levelUpDraft ? "level-up" : "starting",
  ) => {
    const update = (current: Character) => {
      const knownSpellsByClass = { ...(current.knownSpellsByClass ?? {}) };
      const spellAcquisitionByClass = {
        ...(current.spellAcquisitionByClass ?? {}),
      };
      if (classId) {
        knownSpellsByClass[classId] = [...new Set(knownSpells)];
        const previous = spellAcquisitionByClass[classId] ?? {};
        spellAcquisitionByClass[classId] = Object.fromEntries(
          knownSpells.map((spell) => [
            spell,
            previous[spell] ?? acquisition,
          ]),
        );
      }
      return {
        ...current,
        knownSpells: [...new Set(Object.values(knownSpellsByClass).flat())],
        knownSpellsByClass,
        spellAcquisitionByClass,
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
  const updateSpellAcquisition = (
    classId: ClassId,
    spell: string,
    acquisition: SpellAcquisition | null,
  ) => {
    if (!spell) return;
    const update = (current: Character) => {
      const classSpells = [
        ...(current.knownSpellsByClass?.[classId] ?? current.knownSpells),
      ];
      const knownSpellsByClass = { ...(current.knownSpellsByClass ?? {}) };
      const spellAcquisitionByClass = { ...(current.spellAcquisitionByClass ?? {}) };
      const previousAcquisition = spellAcquisitionByClass[classId]?.[spell];
      const nextSpells = acquisition
        ? [...new Set([...classSpells, spell])]
        : previousAcquisition === "level-up" || previousAcquisition === "starting"
          ? classSpells
          : classSpells.filter((name) => name !== spell);
      knownSpellsByClass[classId] = nextSpells;
      const nextAcquisitions = { ...(spellAcquisitionByClass[classId] ?? {}) };
      if (acquisition) nextAcquisitions[spell] = acquisition;
      else if (previousAcquisition !== "level-up" && previousAcquisition !== "starting")
        delete nextAcquisitions[spell];
      spellAcquisitionByClass[classId] = nextAcquisitions;
      return {
        ...current,
        knownSpells: [...new Set(Object.values(knownSpellsByClass).flat())],
        knownSpellsByClass,
        spellAcquisitionByClass,
      };
    };
    if (creationOpen && !creationLocked) setCreationDraft(update);
    else if (levelUpDraft)
      setLevelUpDraft({ ...levelUpDraft, proposed: update(levelUpDraft.proposed) });
    else setCharacter(update);
  };
  const updatePreparedSpells = (preparedSpells: string[], classId?: ClassId) => {
    const update = (current: Character) => {
      const preparedSpellsByClass = { ...(current.preparedSpellsByClass ?? {}) };
      if (classId) preparedSpellsByClass[classId] = [...new Set(preparedSpells)];
      return {
        ...current,
        preparedSpells: [...new Set(Object.values(preparedSpellsByClass).flat())],
        preparedSpellsByClass,
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
  const updateEquipmentAndInventory = (
    equipment: Record<string, string>,
    inventory: Record<string, number>,
  ) => {
    const update = (current: Character) => ({ ...current, equipment, inventory });
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
    const nextCharacter = cloneCharacter(creationDraft);
    if (classId === "wizard") {
      const cantrips = srdSpells
        .filter((spell) => spell.level === 0 && spell.classes.includes("wizard"))
        .map((spell) => spell.name);
      nextCharacter.knownSpells = [...new Set([...nextCharacter.knownSpells, ...cantrips])];
      nextCharacter.knownSpellsByClass = {
        ...(nextCharacter.knownSpellsByClass ?? {}),
        wizard: [...new Set([...(nextCharacter.knownSpellsByClass?.wizard ?? []), ...cantrips])],
      };
    }
    setCharacter({
      ...nextCharacter,
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
    setLastLevelUpClassId("fighter");
  };
  const showPrintPreview = () => {
    const appShell = document.querySelector<HTMLElement>(".app-shell");
    if (!appShell) return;
    localStorage.setItem(savedCharacterStorageKey, JSON.stringify(displayedCharacter));
    const preview = appShell.cloneNode(true) as HTMLElement;
    preview.classList.add("current-character-print");
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
    (level) => classDefinitions[level.classId as ClassId]?.spellcasting,
  );
  const levelUpWarnings = levelUpDraft
    ? [
        ...(levelUpDraft.proposed.classLevels.reduce(
          (total, entry) => total + entry.level,
          0,
        ) % 4 === 0 && !levelUpDraft.abilityIncrease
          ? [
              "Choose an ability score to increase by +1 before rolling hit points.",
            ]
          : []),
        ...(levelUpDraft.hitPointRoll === null
          ? ["Roll hit points before confirming the level-up."]
          : []),
        ...getLevelUpSkillWarnings(
          levelUpDraft.original,
          levelUpDraft.proposed,
        ),
        ...getNewLevelUpFeatSlots(
          levelUpDraft.original,
          levelUpDraft.proposed,
        )
          .filter((slot) => !levelUpDraft.proposed.featSelections?.[slot.id])
          .map((slot) => `Select ${slot.label} before confirming.`),
        ...getLevelUpSpellWarnings(
          levelUpDraft.original,
          levelUpDraft.proposed,
        ),
      ]
    : [];
  const canRollAndConfirmLevelUp =
    levelUpDraft !== null &&
    levelUpWarnings.every(
      (warning) => warning !== "Roll hit points before confirming the level-up.",
    );
  const levelUpTotalLevel = levelUpDraft?.proposed.classLevels.reduce(
    (total, entry) => total + entry.level,
    0,
  );
  const gainsAbilityIncrease =
    levelUpTotalLevel !== undefined && levelUpTotalLevel % 4 === 0;
  const saveCharacter = () => {
    localStorage.setItem(savedCharacterStorageKey, JSON.stringify(displayedCharacter));
    window.alert("Character saved.");
  };
  const exportCharacter = () => {
    const exportData = {
      ...displayedCharacter,
      customItems: storeItems.filter((item) => item.custom),
    };
    const file = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    const characterName = displayedCharacter.name.trim() || "character";
    const playerName = displayedCharacter.player.trim() || "player";
    link.download = `${characterName}-${playerName}.json`.replace(/[\\/:*?"<>|]/g, "-");
    link.click();
    URL.revokeObjectURL(url);
  };
  const importCharacter = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text()) as Character;
      if (
        typeof imported.name !== "string" ||
        typeof imported.player !== "string" ||
        typeof imported.race !== "string" ||
        typeof imported.alignment !== "string" ||
        !imported.abilities ||
        !Array.isArray(imported.classLevels)
      )
        throw new Error("Invalid character file");
      const importedCustomItems = (imported.customItems ?? []).filter(
        (item): item is StoreItem =>
          typeof item === "object" &&
          item !== null &&
          item.custom === true &&
          typeof item.name === "string" &&
          typeof item.category === "string",
      );
      const newCustomItems = importedCustomItems.filter(
        (item) =>
          !storeItems.some(
            (existing) =>
              existing.category === item.category &&
              existing.name.trim().toLowerCase() === item.name.trim().toLowerCase(),
          ),
      );
      if (newCustomItems.length) {
        storeItems.push(...newCustomItems);
        const storedCustomItems = [
          ...storeItems.filter((item) => item.custom),
        ];
        window.localStorage.setItem(
          customStoreItemsStorageKey,
          JSON.stringify(storedCustomItems),
        );
      }
      setCharacter(cloneCharacter(imported));
      setCreationDraft(cloneCharacter(imported));
      setCreationLocked(true);
      setCreationOpen(false);
      setLevelUpDraft(null);
      window.alert("Character imported.");
    } catch {
      window.alert("That file is not a valid D&D 3.5 character JSON file.");
    }
  };
  const visibleSheet =
    !hasSpellcasting && activeSheet === "spells" ? "character" : activeSheet;

  return (
    <main className={`app-shell ${printVariant === "reference" ? "reference-print" : "modern-print"}`}>
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
            Print Current Character
          </button>
          <button className="quiet-button" type="button" onClick={saveCharacter}>
            Save
          </button>
          <button className="quiet-button" type="button" onClick={exportCharacter}>
            Export
          </button>
          <button
            className="quiet-button"
            type="button"
            onClick={() => importInputRef.current?.click()}
          >
            Import
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={importCharacter}
          />
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
              onClick={() => startLevelUp(lastLevelUpClassId)}
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
            {gainsAbilityIncrease && (
              <label className="draft-class level-ability-choice">
                Ability score increase at level {levelUpTotalLevel}
                <span>
                  Choose one ability to increase by +1. This change is provisional
                  until you confirm the level-up.
                </span>
                <select
                  value={levelUpDraft.abilityIncrease ?? ""}
                  onChange={(event) =>
                    updateLevelUpAbilityIncrease(
                      (event.target.value || null) as AbilityName | null,
                    )
                  }
                >
                  <option value="">Choose an ability</option>
                  {abilityNames.map((ability) => (
                    <option key={ability} value={ability}>
                      {ability.toUpperCase()} ({levelUpDraft.proposed.abilities[ability]})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="level-roll-controls">
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
                disabled={
                  levelUpDraft.hitPointRoll !== null ||
                  levelUpWarnings.some(
                    (warning) =>
                      warning !== "Roll hit points before confirming the level-up.",
                  )
                }
              >
                Roll Hit Points
              </button>
            </div>
            <div className="level-todo-list">
              {levelUpWarnings.map((warning) => (
                <small className="validation-error" key={warning}>
                  {warning}
                </small>
              ))}
              {levelUpDraft.validationErrors.map((error) => (
                <small className="validation-error" key={error}>
                  {error}
                </small>
              ))}
            </div>
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
              disabled={!levelUpDraft.hitPointRoll || !canRollAndConfirmLevelUp}
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
          ["store", "Store"],
          ["forge", "Forge"],
          ["crafting", "Wands & Scrolls"],
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
              onMethodChange={changeAbilityMethod}
              onChange={updateCreationDraft}
              onClassChange={updateCreationClass}
              onRaceChange={updateCreationRace}
              ruleset={ruleset}
              onRulesetChange={(nextRuleset) => {
                if (
                  nextRuleset !== ruleset &&
                  !window.confirm(
                    "Changing the ruleset will reset all character creation choices, including abilities, class, race, deity, skills, feats, and spells. Continue?",
                  )
                ) {
                  return;
                }
                setRuleset(nextRuleset);
                setCreationDraft(cloneCharacter(initialCharacter));
                setAbilityMethod("manual");
                setRolledScores(null);
                setRolledAssignments(null);
              }}
              onAbilityChange={updateCreationAbility}
              onCreate={createCharacter}
            />
          )}
          <CharacterSheet
            character={displayedCharacter}
            levelUpOriginal={levelUpDraft?.original}
            levelUpClassId={levelUpDraft?.classId}
            creationMode={creationOpen && !creationLocked}
            onSkillRankChange={updateSkillRanks}
            onFeatChange={updateFeatSelection}
            onLanguagesChange={updateLanguages}
            allowFeatSelection={!creationLocked || levelUpMode}
            finalized={creationLocked && !levelUpMode}
            editable={!creationLocked && !levelUpMode}
            onCharacterNameChange={(name) => updateCreationDraft("name", name)}
            onPlayerNameChange={(player) => updateCreationDraft("player", player)}
            onCharacterAgeChange={(age) => setCharacter((current) => ({ ...current, age }))}
            onCharacterWeightChange={(weight) => setCharacter((current) => ({ ...current, weight }))}
            onCharacterHeightChange={(height) => setCharacter((current) => ({ ...current, height }))}
          />
        </>
      )}
      {visibleSheet === "equipment" && (
        <EquipmentSheet
          key={displayedCharacter.race}
          character={displayedCharacter}
          onEquipmentChange={updateEquipment}
          onEquipmentAndInventoryChange={updateEquipmentAndInventory}
        />
      )}
      {visibleSheet === "store" && (
        <EquipmentStore
          character={displayedCharacter}
          onEquipmentChange={updateEquipment}
          onInventoryChange={updateInventory}
          onEquipmentAndInventoryChange={updateEquipmentAndInventory}
        />
      )}
      {visibleSheet === "forge" && (
        <ForgePanel
          character={displayedCharacter}
          onInventoryChange={updateInventory}
        />
      )}
      {visibleSheet === "crafting" && (
        <WandsScrollPanel
          character={displayedCharacter}
          onInventoryChange={updateInventory}
        />
      )}
      {visibleSheet === "spells" && (
        displayedCharacter.classLevels
          .filter(
            (level) => classDefinitions[level.classId as ClassId]?.spellcasting,
          )
          .map((level) => (
            <SpellSheet
              key={level.classId}
              character={displayedCharacter}
              levelUpOriginal={
                levelUpDraft?.classId === level.classId
                  ? levelUpDraft.original
                  : undefined
              }
              levelUpClassId={
                levelUpDraft?.classId === level.classId
                  ? levelUpDraft.classId
                  : undefined
              }
              spellcastingClassId={level.classId as ClassId}
              onKnownSpellsChange={updateKnownSpells}
              onSpellAcquisitionChange={updateSpellAcquisition}
              onPreparedSpellsChange={updatePreparedSpells}
              editable={
                !creationLocked ||
                (levelUpMode && levelUpDraft?.classId === level.classId)
              }
            />
          ))
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
  const [deityMenuOpen, setDeityMenuOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState({
    race: "",
    class: "",
    prestige: "",
    alignment: "",
    deity: "",
  });
  const [menuTooltip, setMenuTooltip] = useState({
    field: "",
    description: "",
  });
  const heightParts = (draft.height ?? "").match(/^(\d+)\s*ft\.?\s*(\d+)\s*in\.?$/i);
  const legacyHeightInches = Number(draft.height);
  const heightFeet = heightParts
    ? Number(heightParts[1])
    : Number.isFinite(legacyHeightInches)
      ? Math.floor(legacyHeightInches / 12)
      : 5;
  const heightInches = heightParts
    ? Number(heightParts[2])
    : Number.isFinite(legacyHeightInches)
      ? legacyHeightInches % 12
      : 7;
  const updateHeight = (feet: number, inches: number) => {
    onChange("height", `${Math.max(0, feet)} ft. ${Math.min(11, Math.max(0, inches))} in.`);
  };
  const toggleMenu = (menu: "race" | "class" | "prestige" | "alignment" | "deity") => {
    const nextOpen =
      menu === "race"
        ? !raceMenuOpen
        : menu === "class"
          ? !classMenuOpen
          : menu === "prestige"
            ? !prestigeClassMenuOpen
            : menu === "alignment"
              ? !alignmentMenuOpen
              : !deityMenuOpen;
    setRaceMenuOpen(menu === "race" && nextOpen);
    setClassMenuOpen(menu === "class" && nextOpen);
    setPrestigeClassMenuOpen(menu === "prestige" && nextOpen);
    setAlignmentMenuOpen(menu === "alignment" && nextOpen);
    setDeityMenuOpen(menu === "deity" && nextOpen);
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
      setDeityMenuOpen(false);
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
      deity.source ===
        (ruleset === "core-35-srd"
          ? "core-35-srd"
          : "dragonlance-user-pack") &&
      (classId === "cleric"
        ? alignmentDistance(draft.alignment, deity.alignment) <= 1
        : classId === "paladin"
          ? deity.alignment === "Lawful Good"
          : true),
  );
          const dragonlanceRuleset = ruleset !== "core-35-srd";
  const availablePrestigeClasses = Object.values(dragonlancePrestigeClasses).filter(
    (definition) =>
      definition.source ===
        (ruleset === "core-35-srd"
          ? "core-35-srd"
          : "dragonlance-user-pack") &&
      !["white-robed-wizard", "red-robed-wizard", "black-robed-wizard"].includes(
        definition.id,
      ) &&
      isPrestigeClassEligible(definition, classId, draft.race),
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
  const availableLanguageSet = new Set(getAvailableLanguages(ruleset));
  const invalidLanguages = (draft.languages ?? []).filter(
    (language) => !availableLanguageSet.has(language),
  );
  if (invalidLanguages.length)
    creationErrors.push(
      `Remove languages unavailable in this ruleset: ${invalidLanguages.join(", ")}.`,
    );
  if (!Object.values(draft.inventory).some((quantity) => quantity > 0))
    creationErrors.push("Select at least one piece of starting equipment.");
  const spellcastingLevel = draft.classLevels.find(
    (level) => classDefinitions[level.classId as ClassId]?.spellcasting,
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
    const availableLevels = Array.from({ length: 10 }, (_, level) => level).filter(
      (level) => hasSpellLevelAtClassLevel(spellcastingClass.id, draft.classLevels[0]?.level ?? 1, level),
    );
    availableLevels.forEach((level) => {
      const required =
        learningMode === "Spells Known"
          ? (spellcastingClass.id === "bard"
              ? bardKnownProgression[draft.classLevels[0]?.level - 1]?.[level] ?? 0
              : sorcererKnownProgression[draft.classLevels[0]?.level - 1]?.[level] ?? 0)
          : learningMode === "Spellbook"
            ? level === 0
                ? 0
              : level === 1
                ? 3 + Math.max(0, castingModifier)
                : 2
            : baseSpellSlots(
                spellcastingClass.id,
                draft.classLevels[0]?.level ?? 1,
                level,
              ) + bonusSpells(level);
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
            <label>
              Gender
              <select value={draft.gender ?? ""} onChange={(event) => onChange("gender", event.target.value as Character["gender"])}>
                <option value="">Not specified</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </label>
            <label>Age (years)<input inputMode="numeric" pattern="[0-9]*" value={draft.age ?? ""} onChange={(event) => onChange("age", event.target.value.replace(/[^0-9]/g, ""))} placeholder="Years" /></label>
            <label>
              Height
              <span className="height-control">
                <input inputMode="numeric" pattern="[0-9]*" value={heightFeet} aria-label="Height in feet" onChange={(event) => updateHeight(Number(event.target.value.replace(/[^0-9]/g, "")) || 0, heightInches)} />
                <span>ft.</span>
                <input inputMode="numeric" pattern="[0-9]*" value={heightInches} aria-label="Height in inches" onChange={(event) => updateHeight(heightFeet, Number(event.target.value.replace(/[^0-9]/g, "")) || 0)} />
                <span>in.</span>
              </span>
            </label>
            <label>Weight (lb.)<input inputMode="numeric" pattern="[0-9]*" value={draft.weight ?? ""} onChange={(event) => onChange("weight", event.target.value.replace(/[^0-9]/g, ""))} placeholder="Pounds" /></label>
            <label>Hair color<input value={draft.hairColor ?? ""} onChange={(event) => onChange("hairColor", event.target.value)} /></label>
            <label>Eye color<input value={draft.eyeColor ?? ""} onChange={(event) => onChange("eyeColor", event.target.value)} /></label>
            <label>Skin color<input value={draft.skinColor ?? ""} onChange={(event) => onChange("skinColor", event.target.value)} /></label>
            <label className="creation-notes-field">Character notes<textarea value={draft.notes ?? ""} onChange={(event) => onChange("notes", event.target.value)} placeholder="Background, goals, allies, and other details." /></label>
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
              <div className="class-field menu-right">
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
              <div className="class-field menu-right">
                <button
                  className="race-trigger"
                  type="button"
                  aria-expanded={deityMenuOpen}
                  onClick={() => toggleMenu("deity")}
                >
                  {selectedDeity?.name ?? "No deity selected"}
                  <span aria-hidden="true">▾</span>
                </button>
                {deityMenuOpen && (
                  <div className="race-menu" role="listbox" aria-label="Deity choices">
                    <div className="menu-search">
                      <input
                        autoFocus
                        value={menuQuery.deity}
                        onChange={(event) =>
                          setMenuQuery({ ...menuQuery, deity: event.target.value })
                        }
                        placeholder="Search deities"
                        aria-label="Search deities"
                      />
                    </div>
                    <button
                      className={`race-option ${!draft.deity ? "selected" : ""}`}
                      type="button"
                      role="option"
                      aria-selected={!draft.deity}
                      onClick={() => {
                        onChange("deity", undefined);
                        setDeityMenuOpen(false);
                        setMenuTooltip({ field: "", description: "" });
                      }}
                    >
                      <span>No deity selected</span>
                    </button>
                    {availableDeities
                      .filter((deity) => matchesMenuQuery(deity.name, "deity"))
                      .map((deity) => (
                        <button
                          className={`race-option ${draft.deity === deity.id ? "selected" : ""}`}
                          key={deity.id}
                          type="button"
                          role="option"
                          aria-selected={draft.deity === deity.id}
                          onMouseEnter={() =>
                            setMenuTooltip({ field: "deity", description: deity.description })
                          }
                          onFocus={() =>
                            setMenuTooltip({ field: "deity", description: deity.description })
                          }
                          onMouseLeave={() => setMenuTooltip({ field: "", description: "" })}
                          onBlur={() => setMenuTooltip({ field: "", description: "" })}
                          onClick={() => {
                            onChange("deity", deity.id);
                            setDeityMenuOpen(false);
                            setMenuTooltip({ field: "", description: "" });
                          }}
                        >
                          <span>{deity.name} ({deity.alignment})</span>
                        </button>
                      ))}
                  </div>
                )}
                {menuTooltip.field === "deity" && (
                  <span className="creation-menu-tooltip" role="tooltip">
                    {menuTooltip.description}
                  </span>
                )}
              </div>
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
                      options={getAvailableLanguages(ruleset).filter(
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
              Finalize Character
            </button>
          </div>
        </Panel>
      )}
    </section>
  );
}

function Panel({
  title,
  headerLabel,
  children,
  className = "",
  showStatus = false,
  statusText = "Calculated",
}: {
  title: string;
  headerLabel?: string;
  children: React.ReactNode;
  className?: string;
  showStatus?: boolean;
  statusText?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-title">
        <h2>{title}</h2>
        {headerLabel && <span className="panel-header-label">{headerLabel}</span>}
        {showStatus && <span className="rule-status">{statusText}</span>}
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
        setHoveredDescription("");
      }
    };
    const closeWhenAnotherPickerOpens = (event: Event) => {
      if (event.target !== pickerRef.current) {
        setOpen(false);
        setHoveredDescription("");
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
          setOpen((isOpen) => {
            if (isOpen) setHoveredDescription("");
            return !isOpen;
          });
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
              setHoveredDescription("");
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
                setHoveredDescription("");
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
  levelUpOriginal,
  levelUpClassId,
  creationMode,
  onSkillRankChange,
  onFeatChange,
  onLanguagesChange,
  allowFeatSelection,
  finalized,
  editable,
  onCharacterNameChange,
  onPlayerNameChange,
  onCharacterAgeChange,
  onCharacterHeightChange,
  onCharacterWeightChange,
}: {
  character: Character;
  levelUpOriginal?: Character;
  levelUpClassId?: ClassId;
  creationMode: boolean;
  onSkillRankChange: (skill: string, change: number) => void;
  onFeatChange: (slotId: string, featId: string) => void;
  onLanguagesChange: (languages: string[]) => void;
  allowFeatSelection: boolean;
  finalized: boolean;
  editable: boolean;
  onCharacterNameChange: (name: string) => void;
  onPlayerNameChange: (player: string) => void;
  onCharacterAgeChange: (age: string) => void;
  onCharacterHeightChange: (height: string) => void;
  onCharacterWeightChange: (weight: string) => void;
}) {
  const classId = character.classLevels.at(-1)?.classId ?? "fighter";
  const skillDisplayClassId = levelUpOriginal
    ? levelUpClassId ?? getLevelUpClassId(levelUpOriginal, character)
    : undefined;
  const classSummary = character.classLevels
    .filter(
      (level) =>
        !("prestigeClassId" in level && level.prestigeClassId === "wizard-of-high-sorcery"),
    )
    .map(
      (level) => "prestigeClassId" in level
        ? `${dragonlancePrestigeClasses[level.prestigeClassId]?.name ?? level.prestigeClassId} ${level.level}`
        : `${classDefinitions[level.classId]?.name ?? level.classId} ${level.level}`,
    )
    .concat(
      character.prestigeClass &&
        character.prestigeClass !== "wizard-of-high-sorcery" &&
        !character.classLevels.some((level) => "prestigeClassId" in level)
        ? `${dragonlancePrestigeClasses[character.prestigeClass]?.name ?? "Prestige Class"} 1`
        : [],
    )
    .join(" / ");
  const characterRace =
    raceDefinitions[character.race.toLowerCase().replaceAll(" ", "-")] ??
    raceDefinitions.human;
  const classFeatureDisplay = [
    ...(startingClassFeatures[classId] ?? []),
    ...(character.classFeatures ?? []),
  ].filter((feature, index, features) => features.indexOf(feature) === index);
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
        if (!definition) return [];
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
    ...classFeatureDisplay.map((ability) => ({
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
      <Panel title={`${character.name || "Unnamed Character"}${character.player ? ` (${character.player})` : ""}`} headerLabel="Character Info" className={`identity-panel${finalized ? " finalized" : ""}`} showStatus statusText={`Level: ${character.classLevels.filter((entry) => !("prestigeClassId" in entry && entry.prestigeClassId === "wizard-of-high-sorcery")).reduce((total, entry) => total + entry.level, 0)}`}>
        <div className="identity-grid">
          {!finalized && <label>
            Character name
            <input value={character.name} readOnly={!editable} onChange={(event) => onCharacterNameChange(event.target.value)} />
          </label>}
          {!finalized && <label>
            Player
            <input value={character.player} readOnly={!editable} onChange={(event) => onPlayerNameChange(event.target.value)} />
          </label>}
          <label>Gender:<span className="sheet-value">{character.gender || "Not specified"}</span></label>
          <label>Hair Color:<span className="sheet-value">{character.hairColor || "Not specified"}</span></label>
          <label>Eye Color:<span className="sheet-value">{character.eyeColor || "Not specified"}</span></label>
          <label>Skin Color:<span className="sheet-value">{character.skinColor || "Not specified"}</span></label>
          <label className="finalized-race-field">
            Race:
            {finalized ? <span className="sheet-value">{character.race}</span> : <input value={character.race} readOnly />}
          </label>
          <label className="finalized-alignment-field">
            Alignment:
            {finalized ? <span className="sheet-value">{character.alignment}</span> : <input value={character.alignment} readOnly />}
          </label>
          <label className="finalized-deity-field">
            Deity:
            {finalized ? (
              <span className="sheet-value">
                {character.deity
                  ? deityDefinitions.find((deity) => deity.id === character.deity)?.name ?? character.deity
                  : "Not specified"}
              </span>
            ) : (
              <input
                value={character.deity ? deityDefinitions.find((deity) => deity.id === character.deity)?.name ?? character.deity : "Not specified"}
                readOnly
              />
            )}
          </label>
            <label className="print-age-field">Age:{finalized ? <span className="age-stepper"><button type="button" aria-label="Decrease age" onClick={() => onCharacterAgeChange(String(Math.max(0, Number(character.age) - 1 || 0)))}>-</button><span className="sheet-value">{character.age || "0"}</span><button type="button" aria-label="Increase age" onClick={() => onCharacterAgeChange(String((Number(character.age) || 0) + 1))}>+</button></span> : <span className="sheet-value">{character.age || "Not specified"}</span>}</label>
            <label>Height:{finalized ? <span className="age-stepper"><button type="button" aria-label="Decrease height" onClick={() => { const totalInches = Math.max(0, heightToTotalInches(character.height) - 1); onCharacterHeightChange(`${Math.floor(totalInches / 12)} ft. ${totalInches % 12} in.`); }}>-</button><span className="sheet-value">{character.height || "0 ft. 0 in."}</span><button type="button" aria-label="Increase height" onClick={() => { const totalInches = heightToTotalInches(character.height) + 1; onCharacterHeightChange(`${Math.floor(totalInches / 12)} ft. ${totalInches % 12} in.`); }}>+</button></span> : <span className="sheet-value">{character.height || "Not specified"}</span>}</label>
            <label>Weight:{finalized ? <span className="age-stepper"><button type="button" aria-label="Decrease weight" onClick={() => onCharacterWeightChange(String(Math.max(0, Number(character.weight) - 1 || 0)))}>-</button><span className="sheet-value">{character.weight || "0"}</span><button type="button" aria-label="Increase weight" onClick={() => onCharacterWeightChange(String((Number(character.weight) || 0) + 1))}>+</button></span> : <span className="sheet-value">{character.weight || "Not specified"}</span>}</label>

          <label className="finalized-class-field">
            Class:
            {finalized ? (
              <span className="sheet-value">{classSummary}</span>
            ) : (
              <input value={classSummary} readOnly />
            )}
          </label>
          {character.prestigeClass && (
            <label className="finalized-prestige-field">
              Prestige Class:
              <span className="sheet-value">
                {dragonlancePrestigeClasses[character.prestigeClass]?.name ?? "Prestige Class"}
              </span>
            </label>
          )}
          {(character.highSorceryOrder ||
            character.prestigeClass === "wizard-of-high-sorcery" ||
            character.prestigeClass === "white-robed-wizard" ||
            character.prestigeClass === "red-robed-wizard" ||
            character.prestigeClass === "black-robed-wizard") && (
            <label className="finalized-high-sorcery-field">
              High Sorcery:
              <span className="sheet-value">
                {character.highSorceryOrder
                  ? `${character.highSorceryOrder[0].toUpperCase()}${character.highSorceryOrder.slice(1)} Robes`
                  : "Unselected order"}
              </span>
            </label>
          )}
        </div>
      </Panel>
      <div className="top-combat-layout">
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
          <Stat label="Temporary HP" value={String(character.temporaryHitPoints ?? 0)} />
          <Stat label="Nonlethal Damage" value={String(character.nonlethalDamage ?? 0)} />
          <Stat label="Damage Reduction" value={character.damageReduction || "—"} />
          <Stat label="Spell Resistance" value={character.spellResistance || "—"} />
          <Stat label="Base Attack" value={formatModifier(getBaseAttackBonus(character))} />
        </div>
        </Panel>
      <div className="combat-panels-row attacks-saves-row">
      <Panel title="Attacks & Weapons" className="attacks-panel">
        <div className="combat-weapon-row">
          {(["Main Weapon", "Off Hand Weapon", "Ranged Weapon"] as const).map((slot) => {
            const attackPenalty =
              slot === "Main Weapon" || slot === "Off Hand Weapon"
                ? getTwoWeaponAttackPenalty(character, slot)
                : 0;
            const stats = character.equipment?.[slot]
              ? getEquippedWeaponStats(character, character.equipment[slot], attackPenalty)
              : null;
            return (
              <div className="combat-weapon-stat" key={slot}>
                <small>{slot.replace(" Weapon", "")}</small>
                <strong>Attack {stats ? formatModifier(stats.attack) : "—"}</strong>
                <span>Damage {stats?.damage ?? "—"}</span>
                <span>Crit {stats?.critical ?? "—"}</span>
              </div>
            );
          })}
        </div>
      </Panel>
      <Panel title="Saving Throws" className="saving-throws-panel">
        <div className="stat-grid saving-throws-grid">
          <Stat
            label="Fortitude"
            value={formatModifier(getBaseSave(character, "fortitude") + abilityModifier(character.abilities.con))}
            detail={[`Base ${formatModifier(getBaseSave(character, "fortitude"))}`, `CON ${formatModifier(abilityModifier(character.abilities.con))}`]}
          />
          <Stat
            label="Reflex"
            value={formatModifier(getBaseSave(character, "reflex") + abilityModifier(character.abilities.dex))}
            detail={[`Base ${formatModifier(getBaseSave(character, "reflex"))}`, `DEX ${formatModifier(abilityModifier(character.abilities.dex))}`]}
          />
          <Stat
            label="Will"
            value={formatModifier(getBaseSave(character, "will") + abilityModifier(character.abilities.wis))}
            detail={[`Base ${formatModifier(getBaseSave(character, "will"))}`, `WIS ${formatModifier(abilityModifier(character.abilities.wis))}`]}
          />
        </div>
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
      </div>
      </div>
      <Panel
        title={`Skills (${levelUpOriginal
          ? getLevelUpSpentSkillPoints(
              levelUpOriginal,
              character,
              getLevelUpClassId(levelUpOriginal, character),
            )
          : getSpentSkillPoints(character)}/${getAvailableSkillCount(character)}${
          levelUpOriginal &&
          getAvailableSkillCount(character) -
            getLevelUpSpentSkillPoints(
              levelUpOriginal,
              character,
              getLevelUpClassId(levelUpOriginal, character),
            ) ===
            1
            ? " - 1 point remains, but cross-class ranks cost 2"
            : ""
        })`}
        className="skills-panel"
      >
        <div className="list-grid">
          {skills.map((skill) => (
            <div className="list-row" key={skill}>
              <span className="skill-name">
                <span className="tooltip-anchor">
                  <input
                    type="checkbox"
                    checked={isClassSkill(character, skill, skillDisplayClassId)}
                    readOnly
                    aria-label={`${skill} class skill`}
                  />
                  <span className="inline-tooltip" role="tooltip">
                    {isClassSkill(character, skill, skillDisplayClassId)
                      ? "Class skill: 1 point per rank; maximum ranks equal character level + 3."
                      : "Cross-class skill: 2 points per rank; maximum ranks equal half of character level + 3."}
                  </span>
                </span>
                <span className="tooltip-anchor">
                  {skill}
                  {!finalized && (
                    <span
                      className={`skill-cost-indicator ${
                        isClassSkill(character, skill, skillDisplayClassId)
                          ? "class-skill"
                          : "cross-class-skill"
                      }`}
                    >
                      {isClassSkill(character, skill, skillDisplayClassId)
                        ? "Class skill - 1 pt"
                        : "Cross-class - 2 pts"}
                    </span>
                  )}
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
                  disabled={
                    levelUpOriginal
                      ? Number(character.skills[skill] || 0) <=
                        Number(levelUpOriginal.skills[skill] || 0)
                      : !character.skills[skill]
                  }
                  aria-label={`Remove rank from ${skill}`}
                >
                  −
                </button>
                <span>
                  {getAssignedSkillRanks(character, skill, levelUpOriginal)}
                </span>
                <button
                  type="button"
                  onClick={() => onSkillRankChange(skill, 1)}
                  disabled={
                    !canIncreaseSkillRank(
                      character,
                      skill,
                      levelUpOriginal,
                      levelUpClassId,
                      creationMode,
                    )
                  }
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
                {(levelUpOriginal
                  ? getNewLevelUpFeatSlots(levelUpOriginal, character)
                  : getFeatSlots(character)
                ).map((slot) => {
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
                  {classFeatureDescriptions[ability] && (
                    <span> - {classFeatureDescriptions[ability]}</span>
                  )}
                  <span>({source})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>
      <Panel title="Character Notes" className="notes-panel">
        <p className="character-notes">{character.notes || "No notes recorded."}</p>
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
  onEquipmentAndInventoryChange,
}: {
  character: Character;
  onEquipmentChange: (equipment: Record<string, string>) => void;
  onEquipmentAndInventoryChange: (
    equipment: Record<string, string>,
    inventory: Record<string, number>,
  ) => void;
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
        <Stat label="Carried Weight" value={`${getCarriedWeight(character).toLocaleString()} lb.`} />
        <Stat label="Armor Class" value={String(getEquipmentArmorClass(character))} />
      </div>
      <div className="equipment-combat-summary">
        <h3>Weapon Attacks</h3>
        {(["Main Weapon", "Off Hand Weapon", "Ranged Weapon"] as const).map((slot) => {
          const twoWeaponPenalty = slot === "Main Weapon" || slot === "Off Hand Weapon"
            ? getTwoWeaponAttackPenalty(character, slot)
            : 0;
          const stats = equipment[slot]
            ? getEquippedWeaponStats(character, equipment[slot], twoWeaponPenalty)
            : null;
          return (
            <div className="equipment-weapon-stat" key={slot}>
              <strong>{slot}</strong>
              {stats ? (
                <div className="equipment-weapon-details">
                  <strong>{stats.name}</strong>
                  <span>Attack: {formatModifier(stats.attack)} ({formatModifier(stats.baseAttackBonus)} base, {formatModifier(stats.abilityAttackBonus)} ability, {formatModifier(stats.enhancement)} enhancement)</span>
                  {twoWeaponPenalty !== 0 && <span>Two-weapon penalty: {formatModifier(twoWeaponPenalty)} attack</span>}
                  <span>Damage: {stats.damage} ({stats.damageType})</span>
                  <span>Critical: {stats.critical}</span>
                  {stats.enchantmentDamage.map((damage) => <span key={damage}>{damage}</span>)}
                </div>
              ) : (
                <span>Not equipped</span>
              )}
            </div>
          );
        })}
      </div>
      <InventorySummary
        character={character}
        onEquipmentChange={onEquipmentChange}
        onEquipmentAndInventoryChange={onEquipmentAndInventoryChange}
      />
    </div>
  );
}

function InventorySummary({
  character,
  onEquipmentChange,
  onEquipmentAndInventoryChange,
}: {
  character: Character;
  onEquipmentChange: (equipment: Record<string, string>) => void;
  onEquipmentAndInventoryChange: (
    equipment: Record<string, string>,
    inventory: Record<string, number>,
  ) => void;
}) {
  const entries = Object.entries(character.inventory ?? {}).map(([key, quantity]) => {
    const details = getInventoryEntryDetails(key);
    return { key, quantity, ...details, totalWeight: details.numericWeight * quantity };
  });
  const totalWeight = entries.reduce((total, entry) => total + entry.totalWeight, 0);
  return (
    <section className="equipment-inventory" aria-labelledby="equipment-summary-inventory-title">
      <div className="equipment-inventory-header">
        <h3 id="equipment-summary-inventory-title">Inventory</h3>
        <strong>{totalWeight.toLocaleString()} lb. total</strong>
      </div>
      {entries.length ? (
        <div className="equipment-inventory-list">
          {entries.map((entry) => (
            <div className="equipment-inventory-row" key={entry.key}>
              <div className="equipment-inventory-name">
                <span className="tooltip-anchor">
                  <strong tabIndex={0}>{entry.name} ({entry.size[0]})</strong>
                  <span className="inline-tooltip" role="tooltip">
                    <strong>{entry.name}</strong>
                    <br />
                    {entry.spell ? <>{entry.spell.description}<br />Spell level: {entry.spell.level}; school: {formatSpellSchool(entry.spell.school)}.</> : entry.description}
                    <br />
                    Category: {entry.category}; size: {entry.size}; weight: {entry.weight}.
                    {entry.price !== undefined && <><br />Store price: {entry.price.toLocaleString()} gp.</>}
                    {entry.name.startsWith("Wand of ") && entry.key.match(/\(CL \d+, (\d+) charges\)$/) && <><br />Remaining charges: {entry.key.match(/\(CL \d+, (\d+) charges\)$/)?.[1]} of 50.</>}
                  </span>
                </span>
                <small>{entry.description}</small>
              </div>
              {entry.name.startsWith("Wand of ") && entry.key.match(/\(CL \d+, (\d+) charges\)$/) ? (
                <span className="wand-charge-control">
                  <small>Charges</small>
                  <button
                    type="button"
                    aria-label="Use one wand charge"
                    disabled={Number(entry.key.match(/\(CL \d+, (\d+) charges\)$/)?.[1] ?? 0) <= 0}
                    onClick={() => adjustWandCharges(character, entry.key, -1, onEquipmentAndInventoryChange)}
                  >
                    −
                  </button>
                  <strong>{entry.key.match(/\(CL \d+, (\d+) charges\)$/)?.[1] ?? 0}</strong>
                  <button
                    type="button"
                    aria-label="Restore one wand charge"
                    disabled={Number(entry.key.match(/\(CL \d+, (\d+) charges\)$/)?.[1] ?? 0) >= 50}
                    onClick={() => adjustWandCharges(character, entry.key, 1, onEquipmentAndInventoryChange)}
                  >
                    +
                  </button>
                </span>
              ) : <span>Qty. {entry.quantity}</span>}
              <span>{entry.weight} each</span>
              <span>{entry.totalWeight ? `${entry.totalWeight} lb. total` : "Weight varies"}</span>
              <span className="equipment-inventory-actions">
                {Object.values(character.equipment ?? {}).includes(entry.key) ? (
                  <button type="button" className="is-equipped" onClick={() => unequipInventoryItem(character, entry.key, onEquipmentChange)}>Unequip</button>
                ) : (
                  <button type="button" onClick={() => equipInventoryItem(character, entry.key, onEquipmentChange)}>Equip</button>
                )}
                <button type="button" onClick={() => removeInventoryItem(character, entry.key, onEquipmentAndInventoryChange)}>Remove</button>
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="equipment-inventory-empty">No items purchased yet.</p>
      )}
    </section>
  );
}

function adjustWandCharges(
  character: Character,
  key: string,
  change: number,
  onEquipmentAndInventoryChange: (
    equipment: Record<string, string>,
    inventory: Record<string, number>,
  ) => void,
) {
  const match = key.match(/^(.*\(CL \d+, )(\d+)( charges\))$/);
  if (!match) return;
  const nextCharges = Math.max(0, Math.min(50, Number(match[2]) + change));
  if (nextCharges === Number(match[2])) return;
  const nextKey = `${match[1]}${nextCharges}${match[3]}`;
  const inventory = { ...(character.inventory ?? {}) };
  const quantity = inventory[key] ?? 0;
  delete inventory[key];
  inventory[nextKey] = (inventory[nextKey] ?? 0) + quantity;
  const equipment = Object.fromEntries(
    Object.entries(character.equipment ?? {}).map(([slot, value]) => [
      slot,
      value === key ? nextKey : value,
    ]),
  );
  onEquipmentAndInventoryChange(equipment, inventory);
}

function removeInventoryItem(
  character: Character,
  key: string,
  onEquipmentAndInventoryChange: (
    equipment: Record<string, string>,
    inventory: Record<string, number>,
  ) => void,
) {
  const inventory = { ...(character.inventory ?? {}) };
  if (inventory[key] <= 1) delete inventory[key];
  else inventory[key] -= 1;
  const itemName = getInventoryEntryDetails(key).name;
  const equipment = Object.fromEntries(
    Object.entries(character.equipment ?? {}).filter(
      ([, value]) => value !== key && getInventoryEntryDetails(value).name !== itemName,
    ),
  );
  onEquipmentAndInventoryChange(equipment, inventory);
}

const forgeWeaponProperties = [
  { name: "Flaming", bonus: 1, description: "+1d6 fire damage." },
  { name: "Frost", bonus: 1, description: "+1d6 cold damage." },
  { name: "Shock", bonus: 1, description: "+1d6 electricity damage." },
  { name: "Keen", bonus: 1, description: "Doubles the weapon's threat range." },
];
const forgeArmorProperties = [
  { name: "Fortification", bonus: 1, description: "50% chance to ignore extra damage from critical hits and sneak attacks." },
  { name: "Glamered", bonus: 0, flatCost: 4000, description: "Allows the armor to appear as normal clothing." },
  { name: "Slick", bonus: 0, flatCost: 3750, description: "Slick armor helps the wearer escape grapples." },
];
const forgeShieldProperties = [
  { name: "Arrow Catching", bonus: 1, description: "+1 AC against ranged attacks." },
  { name: "Bashing", bonus: 1, description: "Deals damage as though two size categories larger." },
  { name: "Blinding", bonus: 1, description: "Can blind an opponent once per day." },
  { name: "Animated", bonus: 2, description: "Can defend the wielder without being held." },
];

function ForgePanel({
  character,
  onInventoryChange,
}: {
  character: Character;
  onInventoryChange: (inventory: Record<string, number>) => void;
}) {
  const weapons = storeItems.filter((item) => item.category === "Weapons");
  const [weaponName, setWeaponName] = useState(weapons[0]?.name ?? "");
  const [enhancement, setEnhancement] = useState(1);
  const [propertyName, setPropertyName] = useState("");
  const [propertyNames, setPropertyNames] = useState<string[]>([]);
  const armors = storeItems.filter((item) => item.category === "Armor");
  const [armorName, setArmorName] = useState(armors[0]?.name ?? "");
  const [armorEnhancement, setArmorEnhancement] = useState(1);
  const [armorPropertyName, setArmorPropertyName] = useState("");
  const [armorPropertyNames, setArmorPropertyNames] = useState<string[]>([]);
  const shields = storeItems.filter((item) => item.category === "Shields");
  const [shieldName, setShieldName] = useState(shields[0]?.name ?? "");
  const [shieldEnhancement, setShieldEnhancement] = useState(1);
  const [shieldPropertyName, setShieldPropertyName] = useState("");
  const [shieldPropertyNames, setShieldPropertyNames] = useState<string[]>([]);
  const selectedWeapon = weapons.find((item) => item.name === weaponName);
  const selectedProperties = forgeWeaponProperties.filter((entry) => propertyNames.includes(entry.name));
  const propertyBonus = selectedProperties.reduce((total, entry) => total + entry.bonus, 0);
  const enhancementCost = enhancement * enhancement * 2000;
  const propertyCost = propertyBonus
    ? (enhancement + propertyBonus) * (enhancement + propertyBonus) * 2000 - enhancementCost
    : 0;
  const totalCost = (selectedWeapon?.price ?? 0) + enhancementCost + propertyCost;
  const forgedName = `${selectedProperties.length ? `${selectedProperties.map((entry) => entry.name).join(" ")} ` : ""}+${enhancement} ${weaponName} (${character.race ? raceDefinitions[character.race.toLowerCase().replaceAll(" ", "-")]?.size ?? "Medium" : "Medium"})`;
  const forge = () => {
    if (!selectedWeapon) return;
    const inventory = { ...(character.inventory ?? {}) };
    inventory[forgedName] = (inventory[forgedName] ?? 0) + 1;
    onInventoryChange(inventory);
    setEnhancement(1);
    setPropertyName("");
    setPropertyNames([]);
  };
  const selectedArmor = armors.find((item) => item.name === armorName);
  const selectedArmorProperties = forgeArmorProperties.filter((entry) => armorPropertyNames.includes(entry.name));
  const armorPropertyBonus = selectedArmorProperties.reduce((total, entry) => total + entry.bonus, 0);
  const armorEnhancementCost = armorEnhancement * armorEnhancement * 1000;
  const armorPropertyCost = (armorEnhancement + armorPropertyBonus) ** 2 * 1000 - armorEnhancementCost + selectedArmorProperties.reduce((total, entry) => total + (entry.flatCost ?? 0), 0);
  const forgedArmorName = `${selectedArmorProperties.length ? `${selectedArmorProperties.map((entry) => entry.name).join(" ")} ` : ""}+${armorEnhancement} ${armorName} (${character.race ? raceDefinitions[character.race.toLowerCase().replaceAll(" ", "-")]?.size ?? "Medium" : "Medium"})`;
  const forgeArmor = () => {
    if (!selectedArmor) return;
    const inventory = { ...(character.inventory ?? {}) };
    inventory[forgedArmorName] = (inventory[forgedArmorName] ?? 0) + 1;
    onInventoryChange(inventory);
    setArmorEnhancement(1);
    setArmorPropertyName("");
    setArmorPropertyNames([]);
  };
  const selectedShield = shields.find((item) => item.name === shieldName);
  const selectedShieldProperties = forgeShieldProperties.filter((entry) => shieldPropertyNames.includes(entry.name));
  const shieldPropertyBonus = selectedShieldProperties.reduce((total, entry) => total + entry.bonus, 0);
  const shieldEnhancementCost = shieldEnhancement * shieldEnhancement * 1000;
  const shieldPropertyCost = (shieldEnhancement + shieldPropertyBonus) ** 2 * 1000 - shieldEnhancementCost;
  const forgedShieldName = `${selectedShieldProperties.length ? `${selectedShieldProperties.map((entry) => entry.name).join(" ")} ` : ""}+${shieldEnhancement} ${shieldName} (${character.race ? raceDefinitions[character.race.toLowerCase().replaceAll(" ", "-")]?.size ?? "Medium" : "Medium"})`;
  const forgeShield = () => {
    if (!selectedShield) return;
    const inventory = { ...(character.inventory ?? {}) };
    inventory[forgedShieldName] = (inventory[forgedShieldName] ?? 0) + 1;
    onInventoryChange(inventory);
    setShieldEnhancement(1);
    setShieldPropertyName("");
    setShieldPropertyNames([]);
  };
  return (
    <section className="forge-panel panel">
      <div className="panel-title">
        <h2>Forge</h2>
        <span className="rule-status">Magical weapon creation</span>
      </div>
      <div className="forge-content">
        <p className="forge-intro">Create a magical weapon and add it to the character's inventory.</p>
        <div className="forge-grid">
          <label>
            Base weapon
            <select value={weaponName} onChange={(event) => setWeaponName(event.target.value)}>
              {weapons.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
            </select>
          </label>
          <label>
            Enhancement bonus
            <select value={enhancement} onChange={(event) => setEnhancement(Number(event.target.value))}>
              {[1, 2, 3, 4, 5].map((bonus) => {
                const change = (bonus * bonus - enhancement * enhancement) * 2000;
                const costLabel = change > 0
                  ? `adds ${change.toLocaleString()} gp`
                  : change < 0
                    ? `subtracts ${Math.abs(change).toLocaleString()} gp`
                    : "no cost change";
                return <option key={bonus} value={bonus}>+{bonus} - {costLabel}</option>;
              })}
            </select>
          </label>
          <label>
            Add special property
            <span className="forge-property-control">
              <select value={propertyName} onChange={(event) => setPropertyName(event.target.value)}>
                <option value="">None</option>
                {forgeWeaponProperties.filter((entry) => !propertyNames.includes(entry.name)).map((entry) => {
                  const priorCost = (enhancement + propertyBonus) ** 2 * 2000;
                  const nextCost = (enhancement + propertyBonus + entry.bonus) ** 2 * 2000;
                  return <option key={entry.name} value={entry.name}>{entry.name} (+{entry.bonus}) - adds {(nextCost - priorCost).toLocaleString()} gp</option>;
                })}
              </select>
              <button
                className="forge-add-property-button"
                type="button"
                aria-label={propertyName ? `Add ${propertyName} property` : "Choose a property to add"}
                title={propertyName ? `Add ${propertyName} property` : "Choose a property first"}
                onClick={() => { if (propertyName) { setPropertyNames((current) => [...current, propertyName]); setPropertyName(""); } }}
                disabled={!propertyName}
              >
                <span aria-hidden="true">+</span>
              </button>
            </span>
          </label>
        </div>
        <div className="forge-preview">
          <strong>{forgedName}</strong>
          <span>{selectedProperties.length ? selectedProperties.map((entry) => entry.description).join(" ") : "No special property selected."}</span>
          <span>Base weapon: {(selectedWeapon?.price ?? 0).toLocaleString()} gp</span>
          <span>Enhancement: +{enhancementCost.toLocaleString()} gp</span>
          {selectedProperties.map((entry, index) => {
            const priorBonus = selectedProperties.slice(0, index).reduce((total, item) => total + item.bonus, 0);
            const addedCost = (enhancement + priorBonus + entry.bonus) ** 2 * 2000 - (enhancement + priorBonus) ** 2 * 2000;
            return <span key={entry.name}>{entry.name}: +{addedCost.toLocaleString()} gp</span>;
          })}
          <strong>Total price: {totalCost.toLocaleString()} gp</strong>
        </div>
        <button className="level-button" type="button" onClick={forge} disabled={!selectedWeapon}>Forge Weapon</button>
        <div className="forge-divider" />
        <h3>Forge Armor</h3>
        <div className="forge-grid">
          <label>Base armor<select value={armorName} onChange={(event) => setArmorName(event.target.value)}>{armors.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
          <label>Enhancement bonus<select value={armorEnhancement} onChange={(event) => setArmorEnhancement(Number(event.target.value))}>{[1, 2, 3, 4, 5].map((bonus) => { const change = (bonus * bonus - armorEnhancement * armorEnhancement) * 1000; const label = change > 0 ? `adds ${change.toLocaleString()} gp` : change < 0 ? `subtracts ${Math.abs(change).toLocaleString()} gp` : "no cost change"; return <option key={bonus} value={bonus}>+{bonus} - {label}</option>; })}</select></label>
          <label>Add special property<span className="forge-property-control"><select value={armorPropertyName} onChange={(event) => setArmorPropertyName(event.target.value)}><option value="">None</option>{forgeArmorProperties.filter((entry) => !armorPropertyNames.includes(entry.name)).map((entry) => { const prior = (armorEnhancement + armorPropertyBonus) ** 2 * 1000; const next = (armorEnhancement + armorPropertyBonus + entry.bonus) ** 2 * 1000; const change = next - prior + (entry.flatCost ?? 0); return <option key={entry.name} value={entry.name}>{entry.name} {entry.bonus ? `(+${entry.bonus})` : ""} - adds {change.toLocaleString()} gp</option>; })}</select><button className="forge-add-property-button" type="button" onClick={() => { if (armorPropertyName) { setArmorPropertyNames((current) => [...current, armorPropertyName]); setArmorPropertyName(""); } }} disabled={!armorPropertyName} aria-label="Add armor property">+</button></span></label>
        </div>
        <div className="forge-preview"><strong>{forgedArmorName}</strong><span>Base armor: {(selectedArmor?.price ?? 0).toLocaleString()} gp</span><span>Enhancement: +{armorEnhancementCost.toLocaleString()} gp</span>{selectedArmorProperties.map((entry) => <span key={entry.name}>{entry.name}: +{(entry.flatCost ?? 0).toLocaleString()} gp{entry.bonus ? " plus equivalent bonus cost" : ""}</span>)}<strong>Total price: {((selectedArmor?.price ?? 0) + armorEnhancementCost + armorPropertyCost).toLocaleString()} gp</strong></div>
        <button className="level-button" type="button" onClick={forgeArmor} disabled={!selectedArmor}>Forge Armor</button>
        <div className="forge-divider" />
        <h3>Forge Shield</h3>
        <div className="forge-grid">
          <label>Base shield<select value={shieldName} onChange={(event) => setShieldName(event.target.value)}>{shields.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
          <label>Enhancement bonus<select value={shieldEnhancement} onChange={(event) => setShieldEnhancement(Number(event.target.value))}>{[1, 2, 3, 4, 5].map((bonus) => { const change = (bonus * bonus - shieldEnhancement * shieldEnhancement) * 1000; const label = change > 0 ? `adds ${change.toLocaleString()} gp` : change < 0 ? `subtracts ${Math.abs(change).toLocaleString()} gp` : "no cost change"; return <option key={bonus} value={bonus}>+{bonus} - {label}</option>; })}</select></label>
          <label>Add special property<span className="forge-property-control"><select value={shieldPropertyName} onChange={(event) => setShieldPropertyName(event.target.value)}><option value="">None</option>{forgeShieldProperties.filter((entry) => !shieldPropertyNames.includes(entry.name)).map((entry) => { const prior = (shieldEnhancement + shieldPropertyBonus) ** 2 * 1000; const next = (shieldEnhancement + shieldPropertyBonus + entry.bonus) ** 2 * 1000; return <option key={entry.name} value={entry.name}>{entry.name} (+{entry.bonus}) - adds {(next - prior).toLocaleString()} gp</option>; })}</select><button className="forge-add-property-button" type="button" onClick={() => { if (shieldPropertyName) { setShieldPropertyNames((current) => [...current, shieldPropertyName]); setShieldPropertyName(""); } }} disabled={!shieldPropertyName} aria-label="Add shield property">+</button></span></label>
        </div>
        <div className="forge-preview"><strong>{forgedShieldName}</strong><span>Base shield: {(selectedShield?.price ?? 0).toLocaleString()} gp</span><span>Enhancement: +{shieldEnhancementCost.toLocaleString()} gp</span>{selectedShieldProperties.map((entry) => <span key={entry.name}>{entry.name}: equivalent +{entry.bonus}</span>)}<strong>Total price: {((selectedShield?.price ?? 0) + shieldEnhancementCost + shieldPropertyCost).toLocaleString()} gp</strong></div>
        <button className="level-button" type="button" onClick={forgeShield} disabled={!selectedShield}>Forge Shield</button>
      </div>
    </section>
  );
}

function WandsScrollPanel({
  character,
  onInventoryChange,
}: {
  character: Character;
  onInventoryChange: (inventory: Record<string, number>) => void;
}) {
  const chosenFeats = getChosenFeats(character);
  const hasScribeScroll = chosenFeats.includes("scribe-scroll");
  const hasCraftWand = chosenFeats.includes("craft-wand");
  const [purchaseInstead, setPurchaseInstead] = useState(false);
  const spellcastingLevels = character.classLevels.filter((level) =>
    classDefinitions[level.classId]?.spellcasting,
  );
  const minimumCasterLevel = (spell: (typeof srdSpells)[number], classId: ClassId) => {
    if (spell.level === 0) return 1;
    return ["paladin", "ranger"].includes(classId)
      ? spell.level * 2 + 2
      : spell.level * 2 - 1;
  };
  const craftableSpells = srdSpells.filter((spell) =>
    spellcastingLevels.some((classLevel) =>
      spell.classes.includes(classLevel.classId) &&
      classLevel.level >= minimumCasterLevel(spell, classLevel.classId),
    ),
  );
  const availableScrollSpells = purchaseInstead ? srdSpells : craftableSpells;
  const wandSpells = (purchaseInstead ? srdSpells : craftableSpells).filter((spell) => spell.level <= 4);
  const [scrollSpellName, setScrollSpellName] = useState(availableScrollSpells[0]?.name ?? "");
  const [scrollCasterLevel, setScrollCasterLevel] = useState(1);
  const [wandSpellName, setWandSpellName] = useState(wandSpells[0]?.name ?? "");
  const [wandCasterLevel, setWandCasterLevel] = useState(1);
  const scrollSpell = availableScrollSpells.find((spell) => spell.name === scrollSpellName) ?? availableScrollSpells[0];
  const wandSpell = wandSpells.find((spell) => spell.name === wandSpellName) ?? wandSpells[0];
  const scrollMinimumCasterLevel = scrollSpell
    ? purchaseInstead
      ? (scrollSpell.level === 0 ? 1 : scrollSpell.level * 2 - 1)
      : Math.min(...spellcastingLevels.filter((classLevel) => scrollSpell.classes.includes(classLevel.classId)).map((classLevel) => minimumCasterLevel(scrollSpell, classLevel.classId)))
    : 1;
  const wandMinimumCasterLevel = wandSpell
    ? purchaseInstead
      ? (wandSpell.level === 0 ? 1 : wandSpell.level * 2 - 1)
      : Math.min(...spellcastingLevels.filter((classLevel) => wandSpell.classes.includes(classLevel.classId)).map((classLevel) => minimumCasterLevel(wandSpell, classLevel.classId)))
    : 1;
  const scrollLevel = scrollSpell?.level || 0.5;
  const wandLevel = wandSpell?.level || 0.5;
  const scrollPrice = 25 * scrollLevel * scrollCasterLevel;
  const wandPrice = 750 * wandLevel * wandCasterLevel;
  const scrollCreationCost = scrollPrice / 2;
  const wandCreationCost = wandPrice / 2;
  const scrollXpCost = scrollPrice / 25;
  const wandXpCost = wandPrice / 25;
  const scrollCraftingDays = Math.max(1, Math.ceil(scrollPrice / 1000));
  const wandCraftingDays = Math.max(1, Math.ceil(wandPrice / 1000));
  const addCraftedItem = (name: string) => {
    const inventory = { ...(character.inventory ?? {}) };
    inventory[name] = (inventory[name] ?? 0) + 1;
    onInventoryChange(inventory);
  };
  const forgeScroll = () => {
    if (!scrollSpell) return;
    if ((!hasScribeScroll && !purchaseInstead) || !scrollSpell || scrollCasterLevel < scrollMinimumCasterLevel) return;
    addCraftedItem(`Scroll of ${scrollSpell.name} (CL ${scrollCasterLevel})`);
    const nextSpell = availableScrollSpells[0];
    setScrollSpellName(nextSpell?.name ?? "");
    setScrollCasterLevel(nextSpell ? (purchaseInstead ? (nextSpell.level === 0 ? 1 : nextSpell.level * 2 - 1) : scrollMinimumCasterLevel) : 1);
  };
  const forgeWand = () => {
    if (!wandSpell) return;
    if ((!hasCraftWand && !purchaseInstead) || !wandSpell || wandCasterLevel < wandMinimumCasterLevel) return;
    addCraftedItem(`Wand of ${wandSpell.name} (CL ${wandCasterLevel}, 50 charges)`);
    const nextSpell = wandSpells[0];
    setWandSpellName(nextSpell?.name ?? "");
    setWandCasterLevel(nextSpell ? (purchaseInstead ? (nextSpell.level === 0 ? 1 : nextSpell.level * 2 - 1) : wandMinimumCasterLevel) : 1);
  };
  return (
    <section className="forge-panel panel">
      <div className="panel-title">
        <h2>Wands &amp; Scrolls</h2>
        <span className="rule-status">Spell completion items</span>
      </div>
      <div className="forge-content">
        <p className="forge-intro">Create a scroll or wand from a spell and add it to the character&apos;s inventory.</p>
        <label className="forge-purchase-toggle">
          <input type="checkbox" checked={purchaseInstead} onChange={(event) => setPurchaseInstead(event.target.checked)} />
          Purchase instead of craft
        </label>
        {!purchaseInstead && !hasScribeScroll && !hasCraftWand && <p className="validation-error">Select Scribe Scroll or Craft Wand before creating magical items.</p>}
        <h3>Make a Scroll</h3>
        <div className="forge-grid">
          <label>Spell<SpellPicker spells={availableScrollSpells} selected={scrollSpell?.name} onChange={setScrollSpellName} placeholder="Choose a scroll spell" disabled={(!hasScribeScroll && !purchaseInstead) || !availableScrollSpells.length} /></label>
          <label>Caster level<select value={scrollCasterLevel} onChange={(event) => setScrollCasterLevel(Number(event.target.value))} disabled={!scrollSpell || (!hasScribeScroll && !purchaseInstead)}>{Array.from({ length: Math.max(0, 20 - scrollMinimumCasterLevel + 1) }, (_, index) => index + scrollMinimumCasterLevel).map((level) => <option key={level} value={level}>CL {level}</option>)}</select></label>
        </div>
        <div className="forge-preview">
          <strong>Scroll of {scrollSpell?.name} (CL {scrollCasterLevel})</strong>
          <span>{scrollSpell?.description || "No spell description available."}</span>
          <span>Spell level: {scrollSpell?.level ?? 0}; school: {formatSpellSchool(scrollSpell?.school)}</span>
          <span>{purchaseInstead ? "Purchase cost" : "Market price"}: {scrollPrice.toLocaleString()} gp{purchaseInstead ? "" : `; creation cost: ${scrollCreationCost.toLocaleString()} gp`}</span>
          {!purchaseInstead && <span>XP cost: {scrollXpCost.toLocaleString()}; crafting time: {scrollCraftingDays} day{scrollCraftingDays === 1 ? "" : "s"}</span>}
        </div>
        <button className="level-button" type="button" onClick={forgeScroll} disabled={(!hasScribeScroll && !purchaseInstead) || !scrollSpell || scrollCasterLevel < scrollMinimumCasterLevel}>{purchaseInstead ? "Purchase Scroll" : "Make Scroll"}</button>
        <div className="forge-divider" />
        <h3>Make a Wand</h3>
        <div className="forge-grid">
          <label>Spell<SpellPicker spells={wandSpells} selected={wandSpell?.name} onChange={setWandSpellName} placeholder="Choose a wand spell" disabled={(!hasCraftWand && !purchaseInstead) || !wandSpells.length} /></label>
          <label>Caster level<select value={wandCasterLevel} onChange={(event) => setWandCasterLevel(Number(event.target.value))} disabled={!wandSpell || (!hasCraftWand && !purchaseInstead)}>{Array.from({ length: Math.max(0, 20 - wandMinimumCasterLevel + 1) }, (_, index) => index + wandMinimumCasterLevel).map((level) => <option key={level} value={level}>CL {level}</option>)}</select></label>
        </div>
        <div className="forge-preview">
          <strong>Wand of {wandSpell?.name} (CL {wandCasterLevel}, 50 charges)</strong>
          <span>{wandSpell?.description || "No spell description available."}</span>
          <span>Spell level: {wandSpell?.level ?? 0}; school: {formatSpellSchool(wandSpell?.school)}</span>
          <span>{purchaseInstead ? "Purchase cost" : "Market price"}: {wandPrice.toLocaleString()} gp{purchaseInstead ? "" : `; creation cost: ${wandCreationCost.toLocaleString()} gp`}</span>
          {!purchaseInstead && <span>XP cost: {wandXpCost.toLocaleString()}; crafting time: {wandCraftingDays} day{wandCraftingDays === 1 ? "" : "s"}</span>}
        </div>
        <button className="level-button" type="button" onClick={forgeWand} disabled={(!hasCraftWand && !purchaseInstead) || !wandSpell || wandCasterLevel < wandMinimumCasterLevel}>{purchaseInstead ? "Purchase Wand" : "Make Wand"}</button>
      </div>
    </section>
  );
}

function equipInventoryItem(
  character: Character,
  key: string,
  onEquipmentChange: (equipment: Record<string, string>) => void,
) {
  const itemName = getInventoryEntryDetails(key).name;
  const item = [...storeItems]
    .sort((left, right) => right.name.length - left.name.length)
    .find((entry) => itemName.includes(entry.name));
  if (item) {
    const proficiencyWarning = getItemProficiencyWarning(character, item);
    if (proficiencyWarning) {
      window.alert(proficiencyWarning);
    }
  }
  let slot = "Miscellaneous";
  const nextEquipment = { ...(character.equipment ?? {}) };
  if (item?.category === "Shields") {
    slot = "Shield";
    delete nextEquipment["Off Hand Weapon"];
  } else if (item?.category === "Armor") slot = "Armor";
  else if (item?.name.startsWith("Bracers of Armor")) slot = "Arms";
  else if (item?.name.startsWith("Ring of ")) slot = nextEquipment["Rings 1"] ? "Rings 2" : "Rings 1";
  else if (item?.name.startsWith("Headband of ")) slot = "Head";
  else if (item?.name.startsWith("Cloak of ")) slot = "Shoulders";
  if (item?.category === "Weapons") {
    if (rangedWeaponNames.has(item.name)) slot = "Ranged Weapon";
    else if (twoHandedWeaponNames.has(item.name)) {
      slot = "Main Weapon";
      delete nextEquipment["Off Hand Weapon"];
      delete nextEquipment["Ranged Weapon"];
    } else if (!character.equipment?.["Main Weapon"]) slot = "Main Weapon";
    else if (character.equipment?.Shield) {
      window.alert("A shield occupies your off hand, so this weapon cannot be equipped in Off Hand Weapon. Unequip the shield first.");
      return;
    } else if (!lightOffHandWeaponNames.has(item.name)) {
      window.alert("This weapon is not a light melee weapon and cannot be equipped in the Off Hand Weapon slot under D&D 3.5 rules. It will replace the Main Weapon.");
      slot = "Main Weapon";
    } else if (
      character.equipment?.["Main Weapon"] === key &&
      (character.inventory?.[key] ?? 0) < 2
    ) {
      window.alert("You only own one of this weapon, so it cannot be equipped in both hands.");
      return;
    } else {
      slot = window.confirm("Your Main Weapon slot is occupied. Equip this light melee weapon in Off Hand Weapon?")
        ? "Off Hand Weapon"
        : "Main Weapon";
    }
  }
  nextEquipment[slot] = key;
  onEquipmentChange(nextEquipment);
}

function unequipInventoryItem(
  character: Character,
  key: string,
  onEquipmentChange: (equipment: Record<string, string>) => void,
) {
  const nextEquipment = Object.fromEntries(
    Object.entries(character.equipment ?? {}).filter(([, value]) => value !== key),
  );
  onEquipmentChange(nextEquipment);
}

function EquipmentStore({
  character,
  onEquipmentChange,
  onInventoryChange,
  onEquipmentAndInventoryChange,
}: {
  character: Character;
  onEquipmentChange: (equipment: Record<string, string>) => void;
  onInventoryChange: (inventory: Record<string, number>) => void;
  onEquipmentAndInventoryChange: (
    equipment: Record<string, string>,
    inventory: Record<string, number>,
  ) => void;
}) {
  const [storeOpen, setStoreOpen] = useState(true);
  const [customItemOpen, setCustomItemOpen] = useState(false);
  const [customItemsOpen, setCustomItemsOpen] = useState(false);
  const customItems = storeItems.filter((item) => item.custom);
  const [customItemType, setCustomItemType] = useState<"Weapon" | "Armor" | "Shield" | "Miscellaneous">("Weapon");
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("0");
  const [customItemWeight, setCustomItemWeight] = useState("0 lb.");
  const [customItemDescription, setCustomItemDescription] = useState("");
  const [customDamage, setCustomDamage] = useState("1d8");
  const [customDamageSmall, setCustomDamageSmall] = useState("");
  const [customDamageMedium, setCustomDamageMedium] = useState("");
  const [customDamageLarge, setCustomDamageLarge] = useState("");
  const [customDamageType, setCustomDamageType] = useState("slashing");
  const [customCritical, setCustomCritical] = useState("20/x2");
  const [customProficiency, setCustomProficiency] = useState<StoreItem["proficiency"]>("Simple");
  const [customHandedness, setCustomHandedness] = useState<StoreItem["handedness"]>("One-handed");
  const [customWeaponMode, setCustomWeaponMode] = useState<"Melee" | "Ranged" | "Thrown">("Melee");
  const [customFinesse, setCustomFinesse] = useState(false);
  const [customRange, setCustomRange] = useState("");
  const [customRangeSmall, setCustomRangeSmall] = useState("");
  const [customRangeMedium, setCustomRangeMedium] = useState("");
  const [customRangeLarge, setCustomRangeLarge] = useState("");
  const [customReach, setCustomReach] = useState("");
  const [customProperties, setCustomProperties] = useState("");
  const [customArmorBonus, setCustomArmorBonus] = useState("0");
  const [customArmorCategory, setCustomArmorCategory] = useState<StoreItem["armorCategory"]>("Light");
  const [customMaxDexterity, setCustomMaxDexterity] = useState("");
  const [customArmorCheckPenalty, setCustomArmorCheckPenalty] = useState("0");
  const [customSpellFailure, setCustomSpellFailure] = useState("0");
  const [customArmorSpeed, setCustomArmorSpeed] = useState("30 ft.");
  const [customShieldBonus, setCustomShieldBonus] = useState("0");
  const [customShieldType, setCustomShieldType] = useState<StoreItem["shieldType"]>("Custom");
  const [customShieldCheckPenalty, setCustomShieldCheckPenalty] = useState("0");
  const [customShieldSpellFailure, setCustomShieldSpellFailure] = useState("0");
  const [customTowerShield, setCustomTowerShield] = useState(false);
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
    void item;
  };
  const buy = (item: StoreItem, quantity = 1) => {
    const sizedName = `${item.name} (${itemSize})`;
    onInventoryChange({
      ...inventory,
      [sizedName]: (inventory[sizedName] ?? 0) + quantity,
    });
  };
  const removeInventoryItem = (key: string) => {
    const nextInventory = { ...inventory };
    if (nextInventory[key] <= 1) delete nextInventory[key];
    else nextInventory[key] -= 1;
    const removedItemName = getInventoryEntryDetails(key).name;
    const nextEquipment = Object.fromEntries(
      Object.entries(character.equipment ?? {}).filter(
        ([, value]) =>
          value !== key && getInventoryEntryDetails(value).name !== removedItemName,
      ),
    );
    onEquipmentAndInventoryChange(nextEquipment, nextInventory);
  };
  const equipInventoryItem = (key: string) => {
    const itemName = getInventoryEntryDetails(key).name;
    const item = [...storeItems]
      .sort((left, right) => right.name.length - left.name.length)
      .find((entry) => itemName.includes(entry.name));
    if (item) {
      const proficiencyWarning = getItemProficiencyWarning(character, item);
      if (proficiencyWarning) {
        window.alert(proficiencyWarning);
      }
    }
    let slot = "Miscellaneous";
    let nextEquipment = { ...(character.equipment ?? {}) };
    if (item?.category === "Shields") {
      slot = "Shield";
      delete nextEquipment["Off Hand Weapon"];
    } else if (item?.category === "Armor") slot = "Armor";
    else if (item?.name.startsWith("Bracers of Armor")) slot = "Arms";
    else if (item?.name.startsWith("Ring of ")) {
      slot = nextEquipment["Rings 1"] ? "Rings 2" : "Rings 1";
    } else if (item?.name.startsWith("Headband of ")) slot = "Head";
    else if (item?.name.startsWith("Cloak of ")) slot = "Shoulders";
    if (item?.category === "Weapons") {
      if (rangedWeaponNames.has(item.name)) {
        slot = "Ranged Weapon";
      }
      else if (item?.handedness === "Two-handed" || twoHandedWeaponNames.has(item.name)) {
        slot = "Main Weapon";
        delete nextEquipment["Off Hand Weapon"];
        delete nextEquipment["Ranged Weapon"];
      }
      else if (!character.equipment?.["Main Weapon"]) slot = "Main Weapon";
      else if (character.equipment?.Shield) {
        window.alert(
          "A shield occupies your off hand, so this weapon cannot be equipped in Off Hand Weapon. Unequip the shield first.",
        );
        return;
      }
      else if (!lightOffHandWeaponNames.has(item.name)) {
        window.alert(
          "This weapon is not a light melee weapon and cannot be equipped in the Off Hand Weapon slot under D&D 3.5 rules. It will replace the Main Weapon.",
        );
        slot = "Main Weapon";
      }
      else if (
        character.equipment?.["Main Weapon"] === key &&
        (inventory[key] ?? 0) < 2
      ) {
        window.alert("You only own one of this weapon, so it cannot be equipped in both hands.");
        return;
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
    "Instruments",
  ];
  const categories = categoryOrder.filter((itemCategory) =>
    storeItems.some((item) => item.category === itemCategory),
  );
  const saveCustomItem = () => {
    const name = formatCustomItemName(customItemName);
    if (!name) return;
    const category: StoreCategory =
      customItemType === "Weapon"
        ? "Weapons"
        : customItemType === "Armor"
          ? "Armor"
          : customItemType === "Shield"
            ? "Shields"
            : "Adventuring Gear";
    const duplicateCustomItem = storeItems.some(
      (item) =>
        item.category === category &&
        item.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (duplicateCustomItem) {
      window.alert(`A custom ${customItemType.toLowerCase()} named "${name}" already exists.`);
      return;
    }
    const customItem: StoreItem = {
      name,
      category,
      price: Math.max(0, Number(customItemPrice) || 0),
      weight: customItemWeight.trim() || "0 lb.",
      description: customItemDescription.trim() || "Custom item.",
      custom: true,
      ...(customItemType === "Weapon"
        ? { damage: customDamage, damageSmall: customDamageSmall.trim() || undefined, damageMedium: customDamageMedium.trim() || undefined, damageLarge: customDamageLarge.trim() || undefined, damageType: customDamageType, critical: customCritical, proficiency: customProficiency, handedness: customHandedness, finesse: customFinesse, rangeIncrement: customRange.trim() || undefined, rangeSmall: customRangeSmall.trim() || undefined, rangeMedium: customRangeMedium.trim() || undefined, rangeLarge: customRangeLarge.trim() || undefined, reach: customReach.trim() || undefined, specialProperties: customProperties.trim() || undefined }
        : {}),
      ...(customItemType === "Armor"
        ? {
            armorBonus: Number(customArmorBonus) || 0,
            armorCategory: customArmorCategory,
            maxDexterity: customMaxDexterity === "" ? undefined : Number(customMaxDexterity),
            armorCheckPenalty: Number(customArmorCheckPenalty) || 0,
            arcaneSpellFailure: Number(customSpellFailure) || 0,
            armorSpeed: customArmorSpeed.trim() || "30 ft.",
          }
        : {}),
      ...(customItemType === "Shield"
        ? {
            shieldBonus: Number(customShieldBonus) || 0,
            shieldType: customShieldType,
            shieldCheckPenalty: Number(customShieldCheckPenalty) || 0,
            shieldSpellFailure: Number(customShieldSpellFailure) || 0,
            towerShieldProficiency: customTowerShield,
          }
        : {}),
    };
    storeItems.push(customItem);
    saveCustomStoreItems();
    setCustomItemName("");
    setCustomItemPrice("0");
    setCustomItemWeight("0 lb.");
    setCustomItemDescription("");
    setCustomDamage("1d8");
    setCustomDamageSmall("");
    setCustomDamageMedium("");
    setCustomDamageLarge("");
    setCustomDamageType("slashing");
    setCustomCritical("20/x2");
    setCustomProficiency("Simple");
    setCustomHandedness("One-handed");
    setCustomWeaponMode("Melee");
    setCustomFinesse(false);
    setCustomRange("");
    setCustomRangeSmall("");
    setCustomRangeMedium("");
    setCustomRangeLarge("");
    setCustomReach("");
    setCustomProperties("");
    setCustomArmorBonus("0");
    setCustomArmorCategory("Light");
    setCustomMaxDexterity("");
    setCustomArmorCheckPenalty("0");
    setCustomSpellFailure("0");
    setCustomArmorSpeed("30 ft.");
    setCustomShieldBonus("0");
    setCustomShieldType("Custom");
    setCustomShieldCheckPenalty("0");
    setCustomShieldSpellFailure("0");
    setCustomTowerShield(false);
    setCustomItemOpen(false);
  };
  const deleteCustomItem = (name: string) => {
    for (let index = storeItems.length - 1; index >= 0; index -= 1) {
      if (storeItems[index].custom && storeItems[index].name === name) storeItems.splice(index, 1);
    }
    saveCustomStoreItems();
  };
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
        <button className="secondary-button" type="button" onClick={() => setCustomItemOpen(true)}>
          Create Custom Item
        </button>
        <button className="secondary-button" type="button" onClick={() => setCustomItemsOpen(true)}>
          Custom Items List
        </button>
      </div>
      {customItemOpen && (
        <div className="print-preview-modal" role="dialog" aria-modal="true" aria-labelledby="custom-item-title">
          <div className="print-preview-dialog custom-item-dialog">
            <div className="print-preview-header">
              <div>
                <p className="eyebrow">Custom catalog</p>
                <h2 id="custom-item-title">Create Custom Item</h2>
              </div>
              <button className="secondary-button" type="button" onClick={() => setCustomItemOpen(false)}>Close</button>
            </div>
            <div className="custom-item-form">
              <label>Item type<select value={customItemType} onChange={(event) => setCustomItemType(event.target.value as typeof customItemType)}><option>Weapon</option><option>Armor</option><option>Shield</option><option>Miscellaneous</option></select></label>
              <label>Name<input value={customItemName} onChange={(event) => setCustomItemName(event.target.value)} placeholder="Moonlit Blade" /></label>
              <label>Value (gp)<input type="number" min="0" value={customItemPrice} onChange={(event) => setCustomItemPrice(event.target.value)} /></label>
              <label>Weight<input value={customItemWeight} onChange={(event) => setCustomItemWeight(event.target.value)} placeholder="4 lb." /></label>
              {customItemType === "Weapon" && <>
                <label>Damage dice<input value={customDamage} onChange={(event) => setCustomDamage(event.target.value)} placeholder="1d8" /></label>
                <label>Small damage dice<input value={customDamageSmall} onChange={(event) => setCustomDamageSmall(event.target.value)} placeholder="1d6" /></label>
                <label>Medium damage dice<input value={customDamageMedium} onChange={(event) => setCustomDamageMedium(event.target.value)} placeholder="1d8" /></label>
                <label>Large damage dice<input value={customDamageLarge} onChange={(event) => setCustomDamageLarge(event.target.value)} placeholder="2d6" /></label>
                <label>Damage type<select value={customDamageType} onChange={(event) => setCustomDamageType(event.target.value)}><option>bludgeoning</option><option>piercing</option><option>slashing</option></select></label>
                <label>Critical range/multiplier<input value={customCritical} onChange={(event) => setCustomCritical(event.target.value)} placeholder="19-20/x2" /></label>
                <label>Proficiency<select value={customProficiency} onChange={(event) => setCustomProficiency(event.target.value as StoreItem["proficiency"])}><option>Simple</option><option>Martial</option><option>Exotic</option></select></label>
                <label>Handedness<select value={customHandedness} onChange={(event) => setCustomHandedness(event.target.value as StoreItem["handedness"])}><option>Light</option><option>One-handed</option><option>Two-handed</option><option>Ranged</option></select></label>
                <label>Weapon mode<select value={customWeaponMode} onChange={(event) => setCustomWeaponMode(event.target.value as typeof customWeaponMode)}><option>Melee</option><option>Ranged</option><option>Thrown</option></select></label>
                <label>Finesse<input type="checkbox" checked={customFinesse} onChange={(event) => setCustomFinesse(event.target.checked)} /></label>
                {(customWeaponMode === "Ranged" || customWeaponMode === "Thrown") && <label>Range increment<input value={customRange} onChange={(event) => setCustomRange(event.target.value)} placeholder="30 ft." /></label>}
                {(customWeaponMode === "Ranged" || customWeaponMode === "Thrown") && <>
                  <label>Small range<input value={customRangeSmall} onChange={(event) => setCustomRangeSmall(event.target.value)} placeholder="20 ft." /></label>
                  <label>Medium range<input value={customRangeMedium} onChange={(event) => setCustomRangeMedium(event.target.value)} placeholder="30 ft." /></label>
                  <label>Large range<input value={customRangeLarge} onChange={(event) => setCustomRangeLarge(event.target.value)} placeholder="40 ft." /></label>
                </>}
                <label>Reach<input value={customReach} onChange={(event) => setCustomReach(event.target.value)} placeholder="5 ft." /></label>
                <label>Special properties<input value={customProperties} onChange={(event) => setCustomProperties(event.target.value)} placeholder="Trip, reach, brace" /></label>
              </>}
              {customItemType === "Armor" && <>
                <label>Armor category<select value={customArmorCategory} onChange={(event) => setCustomArmorCategory(event.target.value as StoreItem["armorCategory"])}><option>Light</option><option>Medium</option><option>Heavy</option></select></label>
                <label>Armor bonus<input type="number" value={customArmorBonus} onChange={(event) => setCustomArmorBonus(event.target.value)} min="0" /></label>
                <label>Maximum Dexterity<input type="number" value={customMaxDexterity} onChange={(event) => setCustomMaxDexterity(event.target.value)} min="0" placeholder="No limit" /></label>
                <label>Armor check penalty<input type="number" value={customArmorCheckPenalty} onChange={(event) => setCustomArmorCheckPenalty(event.target.value)} min="0" /></label>
                <label>Arcane spell failure %<input type="number" value={customSpellFailure} onChange={(event) => setCustomSpellFailure(event.target.value)} min="0" max="100" /></label>
                <label>Speed<input value={customArmorSpeed} onChange={(event) => setCustomArmorSpeed(event.target.value)} placeholder="20 ft." /></label>
              </>}
              {customItemType === "Shield" && <>
                <label>Shield bonus<input type="number" value={customShieldBonus} onChange={(event) => setCustomShieldBonus(event.target.value)} min="0" /></label>
                <label>Shield type<select value={customShieldType} onChange={(event) => setCustomShieldType(event.target.value as StoreItem["shieldType"])}><option>Buckler</option><option>Light</option><option>Heavy</option><option>Tower</option><option>Custom</option></select></label>
                <label>Armor check penalty<input type="number" value={customShieldCheckPenalty} onChange={(event) => setCustomShieldCheckPenalty(event.target.value)} min="0" /></label>
                <label>Arcane spell failure %<input type="number" value={customShieldSpellFailure} onChange={(event) => setCustomShieldSpellFailure(event.target.value)} min="0" max="100" /></label>
                <label>Tower shield proficiency required<input type="checkbox" checked={customTowerShield} onChange={(event) => setCustomTowerShield(event.target.checked)} /></label>
              </>}
              <label className="custom-item-description">Description<textarea value={customItemDescription} onChange={(event) => setCustomItemDescription(event.target.value)} placeholder="Describe the item and its special properties." /></label>
            </div>
            <div className="print-preview-actions"><button className="primary-button" type="button" disabled={!customItemName.trim()} onClick={saveCustomItem}>Save to Store</button></div>
          </div>
        </div>
      )}
      {customItemsOpen && (
        <div className="print-preview-modal" role="dialog" aria-modal="true" aria-labelledby="custom-items-title">
          <div className="print-preview-dialog custom-item-dialog">
            <div className="print-preview-header">
              <div>
                <p className="eyebrow">Custom catalog</p>
                <h2 id="custom-items-title">Custom Items List</h2>
              </div>
              <button className="secondary-button" type="button" onClick={() => setCustomItemsOpen(false)}>Close</button>
            </div>
            <section className="custom-item-catalog custom-item-catalog-standalone">
              {customItems.length ? customItems.map((item) => (
                <div className="custom-item-catalog-row" key={item.name}>
                  <span><strong>{item.name}</strong><small>{item.category}</small></span>
                  <button className="secondary-button" type="button" onClick={() => deleteCustomItem(item.name)}>Delete</button>
                </div>
              )) : <p className="equipment-inventory-empty">No custom items saved yet.</p>}
            </section>
          </div>
        </div>
      )}
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
                menuOnLeft={["Armor", "Shoulders", "Hands", "Waist", "Body & Wondrous Items", "Neck", "Adventuring Gear", "Consumables", "Rings & Magic Items", "Instruments"].includes(itemCategory)}
            />
          );
          return (
            <div
              className={`store-category${
                itemCategory === "Shields" ? " shields-store-category" : ""
              }`}
              key={itemCategory}
            >
              {itemCategory}
              {itemSelect}
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
                  {Object.values(character.equipment ?? {}).includes(entry.key) ? (
                    <button className="is-equipped" type="button" title="Unequip this item" onClick={() => unequipInventoryItem(character, entry.key, onEquipmentChange)}>Unequip</button>
                  ) : (
                    <button type="button" title="Equip this item" onClick={() => equipInventoryItem(entry.key)}>Equip</button>
                  )}
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
  onOpenChange,
  disabled = false,
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
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOffset, setMenuOffset] = useState(0);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>();
  const [hoveredSpell, setHoveredSpell] = useState<{
    level: number;
    classes: string[];
    description: string;
  }>();
  const pickerRef = useRef<HTMLDivElement>(null);
  const filteredSpells = spells.filter((spell) =>
    spell.name.toLowerCase().includes(query.toLowerCase().trim()),
  );
  const selectedSpell = spells.find((spell) => spell.name === selected);
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
        onOpenChange?.(false);
        setHoveredSpell(undefined);
      }
    };
    const closeWhenAnotherPickerOpens = (event: Event) => {
      if (event.target !== pickerRef.current) {
        setOpen(false);
        onOpenChange?.(false);
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
        disabled={disabled}
        aria-expanded={open}
        onClick={() => {
          if (!open) document.dispatchEvent(new Event("spell-picker-open"));
          setOpen(!open);
          onOpenChange?.(!open);
          setQuery("");
          if (!open) {
            const rect = pickerRef.current?.getBoundingClientRect();
            if (rect)
              setMenuPosition({ top: rect.top, left: rect.right + 18 });
          }
          if (open) setHoveredSpell(undefined);
        }}
      >
        {selectedSpell ? `${selectedSpell.name} (Level ${selectedSpell.level})` : placeholder}
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
          style={
            menuPosition
              ? {
                  position: "fixed",
                  zIndex: 1000,
                  top: menuPosition.top,
                  left: menuPosition.left,
                }
              : undefined
          }
          role="listbox"
          aria-label="Spell choices"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
              onOpenChange?.(false);
              setHoveredSpell(undefined);
              return;
            }
            handleScrollableMenuKeyDown(event);
          }}
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
                onOpenChange?.(false);
                setHoveredSpell(undefined);
              }}
            >
              {spell.name} (Level {spell.level})
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

function formatSpellSchool(school?: string) {
  const abbreviations: Record<string, string> = {
    Abjuration: "Abj",
    Conjuration: "Conj",
    Divination: "Div",
    Enchantment: "Ench",
    Evocation: "Evoc",
    Illusion: "Ill",
    Necromancy: "Necro",
    Transmutation: "Trans",
    Universal: "Univ",
  };
  return school ? abbreviations[school] ?? school : "";
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
  levelUpOriginal,
  levelUpClassId,
  spellcastingClassId,
  onKnownSpellsChange,
  onSpellAcquisitionChange,
  onPreparedSpellsChange,
  editable,
}: {
  character: Character;
  levelUpOriginal?: Character;
  levelUpClassId?: ClassId;
  spellcastingClassId?: ClassId;
  onKnownSpellsChange: (spells: string[], classId?: ClassId) => void;
  onSpellAcquisitionChange: (
    classId: ClassId,
    spell: string,
    acquisition: SpellAcquisition | null,
  ) => void;
  onPreparedSpellsChange: (spells: string[], classId?: ClassId) => void;
  editable: boolean;
}) {
  const [openSpellLevel, setOpenSpellLevel] = useState<number | null>(null);
  const levelUpSpellcastingClass = levelUpClassId
    ? classDefinitions[levelUpClassId]?.spellcasting
      ? levelUpClassId
      : undefined
    : undefined;
  const spellcastingLevel =
    character.classLevels.find((level) => level.classId === spellcastingClassId) ??
    character.classLevels.find((level) => level.classId === levelUpSpellcastingClass) ??
    character.classLevels.find(
      (level) => classDefinitions[level.classId as ClassId]?.spellcasting,
    );
  const spellcastingClass = spellcastingLevel
    ? classDefinitions[spellcastingLevel.classId]
    : classDefinitions.wizard;
  const castingAbility: Partial<Record<ClassId, keyof Character["abilities"]>> =
    {
      bard: "cha",
      cleric: "wis",
      druid: "wis",
      mystic: "wis",
      paladin: "cha",
      ranger: "wis",
      sorcerer: "cha",
      wizard: "int",
    };
  const learningMode =
    spellcastingClass.id === "wizard"
      ? "Spellbook"
      : spellcastingClass.id === "bard" || spellcastingClass.id === "sorcerer"
        ? "Spells Known"
        : "Prepared Spells";
        const classLevel = spellcastingLevel?.level ?? 1;
  const availableLevels = Array.from({ length: 10 }, (_, index) => index).filter((level) =>
    hasSpellLevelAtClassLevel(spellcastingClass.id, classLevel, level),
  );
  const activeClassKnownSpells = new Set(
    character.knownSpellsByClass?.[spellcastingClass.id]?.length
      ? character.knownSpellsByClass[spellcastingClass.id]
      : character.knownSpells.filter(
          (spell) =>
            !character.knownSpellClasses?.[spell] ||
            character.knownSpellClasses[spell] === spellcastingClass.id,
        ),
  );
  const preparedSpells = new Set(
    character.preparedSpellsByClass
      ? character.preparedSpellsByClass[spellcastingClass.id] ?? []
      : character.preparedSpells,
  );
  const preparedSpellCount = preparedSpells.size;
  const classSpells = spells.filter(
    (spell) => spell.classes.includes(spellcastingClass.id),
  );
  const addingNewSpellcastingClass = Boolean(
    levelUpClassId &&
      levelUpOriginal &&
      !levelUpOriginal.classLevels.some(
        (entry) => entry.classId === levelUpClassId,
      ),
  );
  const originalClassKnownSpells = new Set(
    levelUpOriginal?.knownSpellsByClass?.[spellcastingClass.id]?.length
      ? levelUpOriginal.knownSpellsByClass[spellcastingClass.id]
      : levelUpOriginal?.knownSpells.filter(
          (spell) =>
            !levelUpOriginal.knownSpellClasses?.[spell] ||
            levelUpOriginal.knownSpellClasses[spell] === spellcastingClass.id,
        ) ?? [],
  );
  const castingModifier = abilityModifier(
    character.abilities[castingAbility[spellcastingClass.id] ?? "int"],
  );
  const knownSpellLimit = (level: number) => {
    const progression = spellcastingClass.id === "bard"
      ? bardKnownProgression
      : spellcastingClass.id === "sorcerer"
        ? sorcererKnownProgression
        : [];
    return progression[classLevel - 1]?.[level] ?? 0;
  };
  const bonusSpells = (level: number) => {
    if (level < 1 || castingModifier < level) return 0;
    return Math.floor((castingModifier - level) / 4) + 1;
  };
  const levelLimit = (level: number) =>
    learningMode === "Spells Known"
      ? knownSpellLimit(level)
      : learningMode === "Spellbook"
        ? level === 0
          ? classSpells.filter((spell) => spell.level === 0).length
          : level === 1
            ? levelUpOriginal
              ? 2
              : 3 + Math.max(0, castingModifier)
            : 2
        : baseSpellSlots(spellcastingClass.id, classLevel, level) +
          bonusSpells(level);
  const dailySpellCapacity = availableLevels.reduce(
    (total, level) =>
      total +
      baseSpellSlots(spellcastingClass.id, classLevel, level) +
      bonusSpells(level),
    0,
  );
  const setSpellSlot = (level: number, slot: number, spell: string) => {
    const levelSelections = classSpells
      .filter((entry) => entry.level === level)
      .map((entry) => entry.name)
      .filter((name) => activeClassKnownSpells.has(name));
    const nextLevelSelections = [...levelSelections];
    nextLevelSelections[slot] = spell;
    const nextClassSelections = [...activeClassKnownSpells].filter(
      (name) => !levelSelections.includes(name),
    );
    onKnownSpellsChange(
      [
        ...nextClassSelections,
        ...nextLevelSelections.filter(
          (name, index) => name && nextLevelSelections.indexOf(name) === index,
        ),
      ],
      spellcastingClass.id,
    );
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
              value={`${spellcastingClass.name} ${spellcastingLevel?.level ?? 0}`}
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
              value={(castingAbility[spellcastingClass.id] ?? "int").toUpperCase()}
              readOnly
            />
          </label>
        </div>
        <div className="spell-sheet-brand">CHARACTER SPELL SHEET</div>
      </div>
      <div className="spell-sheet-stats">
        <Stat label="Spell Save DC" value={String(10 + castingModifier + 1)} />
        <Stat
          label="Spellcasting Class"
          value={`${spellcastingClass.name} ${spellcastingLevel?.level ?? 0}`}
        />
        <Stat
          label="Spells per Day"
          value={
            availableLevels
              .map(
                (level) =>
                  `L${level}: ${
                    baseSpellSlots(spellcastingClass.id, classLevel, level) +
                    bonusSpells(level)
                  }`,
              )
              .join(" · ") || "None"
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
        const dailySlotCount =
          baseSpellSlots(spellcastingClass.id, classLevel, level) +
          bonusSpells(level);
        const selectedForLevel = levelSpells
          .filter(
            (spell) =>
              learningMode === "Prepared Spells"
                ? preparedSpells.has(spell.name)
                : activeClassKnownSpells.has(spell.name),
          )
          .map((spell) => spell.name);
        const rowCount =
          (() => {
            const wizardSpellbookAdditions =
              learningMode === "Spellbook" && level > 0
                ? addingNewSpellcastingClass && level === 1
                  ? 3
                  : 2
                : 0;
            const knownSpellAdditions =
              learningMode === "Spells Known" && levelUpOriginal
                ? Math.max(
                    0,
                    levelLimit(level) -
                      classSpells.filter(
                        (spell) =>
                          spell.level === level &&
                          originalClassKnownSpells.has(spell.name),
                      ).length,
                  )
                : 0;
            const newSpellCount = levelUpOriginal
              ? selectedForLevel.filter(
                  (spellName) =>
                    !originalClassKnownSpells.has(spellName),
                ).length
              : 0;
            const remainingNewSpells = levelUpOriginal
              ? Math.max(
                  0,
                  (learningMode === "Spells Known"
                    ? knownSpellAdditions
                    : wizardSpellbookAdditions) - newSpellCount,
                )
              : 0;
            return level === 0 && learningMode === "Spellbook"
              ? Math.max(6, levelSpells.length)
              : learningMode === "Prepared Spells"
                ? Math.max(6, levelSpells.length)
                : levelUpOriginal && learningMode === "Spells Known"
                  ? Math.max(levelLimit(level), selectedForLevel.length)
                  : levelUpOriginal && learningMode === "Spellbook"
                    ? selectedForLevel.length + remainingNewSpells
              : Math.max(
                  6,
                  selectedForLevel.length + remainingNewSpells + 4,
                );
          })();
          const hasOpenLevelUpChoices =
            openSpellLevel === level ||
            (Boolean(levelUpOriginal) &&
              (learningMode === "Spells Known"
              ? selectedForLevel.length < levelLimit(level)
              : learningMode === "Spellbook" &&
                level > 0 &&
                selectedForLevel.filter(
                  (spellName) => !originalClassKnownSpells.has(spellName),
                ).length <
                  (addingNewSpellcastingClass && level === 1 ? 3 : 2)));
        return (
          <section
            className="spell-level-table"
            key={level}
            style={
              hasOpenLevelUpChoices || openSpellLevel === level
                ? { marginBottom: 340 }
                : undefined
            }
          >
            <div className="spell-level-heading">
              <strong>
                {level === 0 ? "CANTRIPS" : `LEVEL ${level} SPELLS`}
              </strong>
              <span>EXPENDED SLOTS</span>
              {Array.from({ length: dailySlotCount }, (_, index) => (
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
                      : learningMode === "Prepared Spells"
                        ? levelSpells[slot]?.name
                      : selectedForLevel[slot];
                  const spell = levelSpells.find(
                    (entry) => entry.name === spellName,
                  );
                  const spellAcquisition = spellName
                    ? character.spellAcquisitionByClass?.[spellcastingClass.id]?.[
                        spellName
                      ]
                    : undefined;
                  const isLevelUpLearned =
                    spellAcquisition === "level-up" ||
                    Boolean(
                      levelUpOriginal &&
                        spellName &&
                        !originalClassKnownSpells.has(spellName),
                    );
                  const spellMarker = isLevelUpLearned
                    ? " (L)"
                    : spellAcquisition === "scroll"
                      ? " (S)"
                      : "";
                  const removeScrollSpell = () => {
                    if (
                      spellName &&
                      spellAcquisition === "scroll" &&
                      window.confirm(`Remove ${spellName} learned from scroll?`)
                    ) {
                      onSpellAcquisitionChange(
                        spellcastingClass.id,
                        spellName,
                        null,
                      );
                    }
                  };
                  const isPrepared = spellName
                    ? preparedSpells.has(spellName)
                    : false;
                  const preparationLimitReached =
                    preparedSpellCount >= dailySpellCapacity;
                  return (
                    <>
                    {spellcastingClass.id === "wizard" && slot === selectedForLevel.length && (
                      <tr className="additional-spell-row" key={`scroll-${level}`}>
                        <td />
                        <td>
                          <SpellPicker
                            spells={levelSpells.filter((entry) => {
                              const normalizedName = entry.name.toLowerCase();
                              return ![
                                ...activeClassKnownSpells,
                                ...selectedForLevel,
                                ...originalClassKnownSpells,
                              ].some((name) => name.toLowerCase() === normalizedName);
                            })}
                            onChange={(spell) =>
                              onSpellAcquisitionChange(spellcastingClass.id, spell, "scroll")
                            }
                            placeholder="Read scroll"
                          />
                        </td>
                        <td className="spell-description-cell"><small>Read scroll</small></td>
                        <td /><td /><td /><td /><td /><td /><td />
                      </tr>
                    )}
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
                                        ...preparedSpells,
                                        spellName,
                                      ]),
                                    ]
                                  : [...preparedSpells].filter(
                                      (name) => name !== spellName,
                                    ),
                                spellcastingClass.id,
                              )
                            }
                          />
                        )}
                      </td>
                      <td>
                        {learningMode === "Prepared Spells" ||
                        (level === 0 && learningMode === "Spellbook") ? (
                          spellName ? (
                            <>
                              {spellName}
                              {spellAcquisition === "scroll" ? (
                                <button
                                  type="button"
                                  className="spell-source-marker"
                                  aria-label="Remove this spell learned from a scroll"
                                  data-tooltip="Remove this spell learned from a scroll"
                                  onClick={removeScrollSpell}
                                >
                                  (S)
                                </button>
                              ) : (
                                spellMarker
                              )}
                            </>
                          ) : ""
                        ) : !editable ? (
                          spellName ? (
                            <>
                              {spellName}
                              {spellAcquisition === "scroll" ? (
                                <button
                                  type="button"
                                  className="spell-source-marker"
                                  aria-label="Remove this spell learned from a scroll"
                                  data-tooltip="Remove this spell learned from a scroll"
                                  onClick={removeScrollSpell}
                                >
                                  (S)
                                </button>
                              ) : (
                                spellMarker
                              )}
                            </>
                          ) : ""
                        ) : (
                          <>
                            <SpellPicker
                              spells={levelSpells.filter(
                                (entry) =>
                                  !selectedForLevel.includes(entry.name) ||
                                  selectedForLevel[slot] === entry.name,
                              )}
                              selected={spellName}
                              placeholder={
                                levelUpOriginal && !spellName
                                  ? "Choose a new spell"
                                  : !levelUpOriginal && slot < limit
                                    ? "Choose a spell"
                                    : ""
                              }
                              onChange={(name) => setSpellSlot(level, slot, name)}
                              onOpenChange={(open) =>
                                setOpenSpellLevel(open ? level : null)
                              }
                            />
                            {spellMarker && (
                              spellAcquisition === "scroll" ? (
                                <button
                                  type="button"
                                  className="spell-source-marker"
                                  aria-label="Remove this spell learned from a scroll"
                                  data-tooltip="Remove this spell learned from a scroll"
                                  onClick={removeScrollSpell}
                                >
                                  (S)
                                </button>
                              ) : (
                                <small>{spellMarker}</small>
                              )
                            )}
                          </>
                        )}
                      </td>
                      <td className="spell-description-cell">
                        {spell && (
                          <>
                            {spell.description || ""}
                            <small>
                              ({classDefinitions[
                                character.knownSpellClasses?.[spell.name] as ClassId
                              ]?.name ??
                                spell.classes
                                  .map(
                                    (classId) =>
                                      classDefinitions[classId as ClassId]?.name ??
                                      classId,
                                  )
                                  .join(", ")})
                            </small>
                          </>
                        )}
                      </td>
                      <td />
                      <td>{spell?.savingThrow || ""}</td>
                      <td>{spell?.range || ""}</td>
                      <td>{spell?.castingTime || ""}</td>
                      <td>{spell?.components || ""}</td>
                      <td>{formatSpellDuration(spell?.duration || "")}</td>
                      <td>{formatSpellSchool(spell?.school)}</td>
                    </tr>
                    </>
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

function Stat({ label, value, detail }: { label: string; value: string; detail?: string[] }) {
  return (
    <div className="stat">
      <small>{label}</small>
      <strong>{value}</strong>
      {detail?.map((line) => <span className="stat-detail" key={line}>{line}</span>)}
    </div>
  );
}

export default App;
