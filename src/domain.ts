export type AbilityName = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export type AbilityScores = Record<AbilityName, number>

export type ClassId = 'barbarian' | 'bard' | 'cleric' | 'druid' | 'fighter' | 'monk' | 'paladin' | 'ranger' | 'rogue' | 'sorcerer' | 'wizard' | 'mystic' | 'noble'
export type PrestigeClassId = 'knight-of-the-crown' | 'knight-of-the-sword' | 'knight-of-the-rose' | 'knight-of-neraka' | 'renegade-hunter' | 'white-robed-wizard' | 'red-robed-wizard' | 'black-robed-wizard' | 'master-of-the-way'
export type FeatId = string

export type ContentSourceId = 'core-35-srd' | 'dragonlance-user-pack'

export interface ContentSource {
  id: ContentSourceId
  name: string
  enabled: boolean
  attribution: string
}

export const contentSources: Record<ContentSourceId, ContentSource> = {
  'core-35-srd': { id: 'core-35-srd', name: 'D&D 3.5 Core SRD', enabled: true, attribution: 'Open game rules content' },
  'dragonlance-user-pack': { id: 'dragonlance-user-pack', name: 'Dragonlance user content pack', enabled: false, attribution: 'Enable only with authorized source data' },
}

export interface ClassDefinition {
  id: ClassId
  name: string
  source: ContentSourceId
  hitDie: 4 | 6 | 8 | 10 | 12
  skillPoints: number
  baseAttackBonus: 'good' | 'medium' | 'poor'
  fortitude: 'good' | 'poor'
  reflex: 'good' | 'poor'
  will: 'good' | 'poor'
  spellcasting: boolean
}

export interface RaceDefinition {
  id: string
  name: string
  source: ContentSourceId
  abilityModifiers: Partial<Record<AbilityName, number>>
  racialSkillBonuses?: Partial<Record<string, number>>
  levelAdjustment?: number
  size?: 'Fine' | 'Diminutive' | 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan' | 'Colossal'
  speed?: number
  traits?: string[]
  specialAbilities?: string[]
}

export interface PrestigeClassDefinition {
  id: PrestigeClassId
  name: string
  source: ContentSourceId
  prerequisites: { bab?: number; ability?: Partial<Record<AbilityName, number>>; feats?: string[]; classes?: ClassId[] }
  features: string[]
}

export interface ClassLevel {
  classId: ClassId
  level: number
}

export interface FeatDefinition {
  id: FeatId
  name: string
  source: ContentSourceId
  description: string
  prerequisites?: {
    abilities?: Partial<Record<AbilityName, number>>
    baseAttackBonus?: number
    feats?: FeatId[]
  }
  fighterBonus?: boolean
}

export interface Character {
  name: string
  player: string
  race: string
  alignment: string
  abilities: AbilityScores
  classLevels: ClassLevel[]
  hitPoints: number
  feats: string[]
  featSelections: Record<string, FeatId | ''>
  skills: Record<string, number>
  skillRanksByClass: Record<string, Record<string, number>>
  knownSpells: string[]
  preparedSpells: string[]
  equipment: Record<string, string>
  inventory: Record<string, number>
  languages: string[]
  prestigeClass?: PrestigeClassId
}

export interface LevelUpDraft {
  original: Character
  proposed: Character
  classId: ClassId
  hitPointRoll: number | null
  validationErrors: string[]
}

export const classDefinitions: Record<ClassId, ClassDefinition> = {
  barbarian: { id: 'barbarian', name: 'Barbarian', source: 'core-35-srd', hitDie: 12, skillPoints: 4, baseAttackBonus: 'good', fortitude: 'good', reflex: 'poor', will: 'poor', spellcasting: false },
  bard: { id: 'bard', name: 'Bard', source: 'core-35-srd', hitDie: 6, skillPoints: 6, baseAttackBonus: 'medium', fortitude: 'poor', reflex: 'good', will: 'good', spellcasting: true },
  fighter: { id: 'fighter', name: 'Fighter', source: 'core-35-srd', hitDie: 10, skillPoints: 2, baseAttackBonus: 'good', fortitude: 'good', reflex: 'poor', will: 'poor', spellcasting: false },
  druid: { id: 'druid', name: 'Druid', source: 'core-35-srd', hitDie: 8, skillPoints: 4, baseAttackBonus: 'medium', fortitude: 'good', reflex: 'poor', will: 'good', spellcasting: true },
  monk: { id: 'monk', name: 'Monk', source: 'core-35-srd', hitDie: 8, skillPoints: 4, baseAttackBonus: 'medium', fortitude: 'good', reflex: 'good', will: 'good', spellcasting: false },
  paladin: { id: 'paladin', name: 'Paladin', source: 'core-35-srd', hitDie: 10, skillPoints: 2, baseAttackBonus: 'good', fortitude: 'good', reflex: 'poor', will: 'good', spellcasting: true },
  ranger: { id: 'ranger', name: 'Ranger', source: 'core-35-srd', hitDie: 8, skillPoints: 6, baseAttackBonus: 'good', fortitude: 'good', reflex: 'good', will: 'poor', spellcasting: true },
  rogue: { id: 'rogue', name: 'Rogue', source: 'core-35-srd', hitDie: 6, skillPoints: 8, baseAttackBonus: 'medium', fortitude: 'poor', reflex: 'good', will: 'poor', spellcasting: false },
  sorcerer: { id: 'sorcerer', name: 'Sorcerer', source: 'core-35-srd', hitDie: 4, skillPoints: 2, baseAttackBonus: 'poor', fortitude: 'poor', reflex: 'poor', will: 'good', spellcasting: true },
  wizard: { id: 'wizard', name: 'Wizard', source: 'core-35-srd', hitDie: 4, skillPoints: 2, baseAttackBonus: 'poor', fortitude: 'poor', reflex: 'poor', will: 'good', spellcasting: true },
  cleric: { id: 'cleric', name: 'Cleric', source: 'core-35-srd', hitDie: 8, skillPoints: 2, baseAttackBonus: 'medium', fortitude: 'good', reflex: 'poor', will: 'good', spellcasting: true },
  mystic: { id: 'mystic', name: 'Mystic', source: 'dragonlance-user-pack', hitDie: 8, skillPoints: 4, baseAttackBonus: 'medium', fortitude: 'good', reflex: 'poor', will: 'good', spellcasting: true },
  noble: { id: 'noble', name: 'Noble', source: 'dragonlance-user-pack', hitDie: 8, skillPoints: 4, baseAttackBonus: 'medium', fortitude: 'poor', reflex: 'good', will: 'good', spellcasting: false },
}

export const raceDefinitions: Record<string, RaceDefinition> = {
  human: { id: 'human', name: 'Human', source: 'core-35-srd', size: 'Medium', abilityModifiers: {}, specialAbilities: ['Bonus feat', 'Extra skill points'] },
  dwarf: { id: 'dwarf', name: 'Dwarf', source: 'core-35-srd', speed: 20, abilityModifiers: { con: 2, cha: -2 }, specialAbilities: ['Darkvision 60 ft.', 'Stonecunning', 'Stability', 'Dwarven weapon familiarity', 'Dwarven armor familiarity', '+2 racial bonus on saves against poison', '+2 racial bonus on saves against spells and spell-like effects'] },
  elf: { id: 'elf', name: 'Elf', source: 'core-35-srd', abilityModifiers: { dex: 2, con: -2 }, racialSkillBonuses: { Listen: 2, Search: 2, Spot: 2 }, specialAbilities: ['Low-light vision'] },
  halfling: { id: 'halfling', name: 'Halfling', source: 'core-35-srd', speed: 20, abilityModifiers: { dex: 2, str: -2 }, racialSkillBonuses: { Climb: 2, Jump: 2, Listen: 2, 'Move Silently': 2 }, specialAbilities: ['+1 racial bonus on all saving throws', '+2 morale bonus on saves against fear', '+1 racial bonus on attacks with thrown weapons and slings', 'Halfling weapon familiarity', 'Lucky'] },
  gnome: { id: 'gnome', name: 'Gnome', source: 'core-35-srd', speed: 20, abilityModifiers: { con: 2, str: -2 }, racialSkillBonuses: { Listen: 2, Craft: 2 }, specialAbilities: ['Low-light vision', '+2 racial bonus on saves against illusions', '+1 racial bonus to the save DC of illusion spells', 'Gnome weapon familiarity', 'Speak with animals'] },
  'half-orc': { id: 'half-orc', name: 'Half-orc', source: 'core-35-srd', abilityModifiers: { str: 2, int: -2, cha: -2 }, specialAbilities: ['Darkvision 60 ft.'] },
  'half-elf': { id: 'half-elf', name: 'Half-elf', source: 'core-35-srd', abilityModifiers: {}, racialSkillBonuses: { Listen: 1, Search: 1, Spot: 1 }, specialAbilities: ['Low-light vision', 'Immunity to sleep spells and effects', '+2 racial bonus on saves against enchantment spells and effects', '+2 racial bonus on Diplomacy and Gather Information checks'] },
  kender: { id: 'kender', name: 'Kender', source: 'dragonlance-user-pack', size: 'Small', speed: 20, abilityModifiers: { str: -2, dex: 2, cha: 2 }, traits: ['Fearless', 'Kender Pockets', 'Taunt', 'Curiosity'] },
  draconian: { id: 'draconian', name: 'Draconian', source: 'dragonlance-user-pack', size: 'Medium', abilityModifiers: { str: 2, con: 2, cha: -2 }, traits: ['Darkvision', 'Draconic Heritage', 'Death Throes'] },
  'qualinesti-elf': { id: 'qualinesti-elf', name: 'Qualinesti Elf', source: 'dragonlance-user-pack', size: 'Medium', abilityModifiers: { str: -2, dex: 2, con: -2, int: 2 }, traits: ['Keen Senses', 'Low-Light Vision', 'Elven Resistance'] },
  'silvanesti-elf': { id: 'silvanesti-elf', name: 'Silvanesti Elf', source: 'dragonlance-user-pack', size: 'Medium', abilityModifiers: { str: -2, dex: 2, con: -2, int: 2 }, traits: ['Keen Senses', 'Low-Light Vision', 'Elven Resistance'] },
  'kagonesti-elf': { id: 'kagonesti-elf', name: 'Kagonesti Elf', source: 'dragonlance-user-pack', size: 'Medium', abilityModifiers: {}, traits: ['Wild Elf heritage', 'Keen Senses', 'Low-Light Vision'] },
  'dargonesti-elf': { id: 'dargonesti-elf', name: 'Dargonesti Elf', source: 'dragonlance-user-pack', size: 'Medium', abilityModifiers: {}, traits: ['Aquatic Elf heritage', 'Low-Light Vision', 'Water adaptation'] },
  'dimernesti-elf': { id: 'dimernesti-elf', name: 'Dimernesti Elf', source: 'dragonlance-user-pack', size: 'Medium', abilityModifiers: {}, traits: ['Aquatic Elf heritage', 'Low-Light Vision', 'Water adaptation'] },
  'hill-dwarf': { id: 'hill-dwarf', name: 'Hill Dwarf', source: 'dragonlance-user-pack', size: 'Medium', abilityModifiers: { con: 2, cha: -2 }, traits: ['Darkvision', 'Dwarven resilience', 'Stonecunning'] },
  'mountain-dwarf': { id: 'mountain-dwarf', name: 'Mountain Dwarf', source: 'dragonlance-user-pack', size: 'Medium', abilityModifiers: { con: 2, cha: -2 }, traits: ['Darkvision', 'Dwarven resilience', 'Stonecunning'] },
  'deep-dwarf': { id: 'deep-dwarf', name: 'Deep Dwarf', source: 'dragonlance-user-pack', size: 'Medium', abilityModifiers: { con: 2, cha: -2 }, traits: ['Deep Darkvision', 'Dwarven resilience', 'Stonecunning'] },
  minotaur: { id: 'minotaur', name: 'Minotaur', source: 'dragonlance-user-pack', levelAdjustment: 2, size: 'Medium', abilityModifiers: { str: 4, con: 2, int: -2, cha: -2 }, traits: ['Darkvision', 'Natural Armor', 'Powerful Build'] },
  irda: { id: 'irda', name: 'Irda', source: 'dragonlance-user-pack', size: 'Medium', abilityModifiers: { int: 2, wis: 2, cha: 2 }, traits: ['Ancient Heritage', 'Change Shape', 'Low-Light Vision'] },
  'gully-dwarf': { id: 'gully-dwarf', name: 'Gully Dwarf', source: 'dragonlance-user-pack', size: 'Small', speed: 20, abilityModifiers: { str: -4, dex: 2, con: 2, int: -2, cha: -4 }, traits: ['Darkvision', 'Gully dwarf cunning', 'Small stature'] },
}

export const dragonlancePrestigeClasses: Record<PrestigeClassId, PrestigeClassDefinition> = {
  'knight-of-the-crown': { id: 'knight-of-the-crown', name: 'Knight of the Crown', source: 'dragonlance-user-pack', prerequisites: { bab: 4, feats: ['Mounted Combat'], classes: ['fighter', 'paladin', 'ranger'] }, features: ['Crown oath', 'Knightly challenge', 'Mounted combat training'] },
  'knight-of-the-sword': { id: 'knight-of-the-sword', name: 'Knight of the Sword', source: 'dragonlance-user-pack', prerequisites: { bab: 5, feats: ['Weapon Focus'], classes: ['fighter', 'paladin'] }, features: ['Sword oath', 'Fearless courage', 'Smite evil improvement'] },
  'knight-of-the-rose': { id: 'knight-of-the-rose', name: 'Knight of the Rose', source: 'dragonlance-user-pack', prerequisites: { bab: 6, feats: ['Leadership'], classes: ['fighter', 'paladin'] }, features: ['Rose oath', 'Inspire courage', 'Command authority'] },
  'knight-of-neraka': { id: 'knight-of-neraka', name: 'Knight of Neraka', source: 'dragonlance-user-pack', prerequisites: { bab: 5, feats: ['Knight of Takhisis'], classes: ['fighter', 'paladin', 'ranger'] }, features: ['Dark allegiance', 'Aura of command', 'Terror tactics'] },
  'renegade-hunter': { id: 'renegade-hunter', name: 'Renegade Hunter', source: 'dragonlance-user-pack', prerequisites: { feats: ['Spell Focus'] }, features: ['Magic detection', 'Counterspell training', 'Hunter of renegades'] },
  'white-robed-wizard': { id: 'white-robed-wizard', name: 'White-Robed Wizard', source: 'dragonlance-user-pack', prerequisites: { ability: { int: 13 }, feats: ['Mages of High Sorcery'], classes: ['wizard', 'sorcerer'] }, features: ['White robe oath', 'Protective magic', 'Lunar spell power'] },
  'red-robed-wizard': { id: 'red-robed-wizard', name: 'Red-Robed Wizard', source: 'dragonlance-user-pack', prerequisites: { ability: { int: 13 }, feats: ['Mages of High Sorcery'], classes: ['wizard', 'sorcerer'] }, features: ['Red robe oath', 'Neutral magic', 'Lunar spell power'] },
  'black-robed-wizard': { id: 'black-robed-wizard', name: 'Black-Robed Wizard', source: 'dragonlance-user-pack', prerequisites: { ability: { int: 13 }, feats: ['Mages of High Sorcery'], classes: ['wizard', 'sorcerer'] }, features: ['Black robe oath', 'Aggressive magic', 'Lunar spell power'] },
  'master-of-the-way': { id: 'master-of-the-way', name: 'Master of the Way', source: 'dragonlance-user-pack', prerequisites: { ability: { wis: 13 }, feats: ['Improved Unarmed Strike'], classes: ['monk'] }, features: ['Monastic discipline', 'Ki strike', 'Way mastery'] },
}

export const initialCharacter: Character = {
  name: 'Unnamed Hero', player: 'Player', race: 'Human', alignment: 'Neutral Good',
  abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  classLevels: [{ classId: 'fighter', level: 1 }], hitPoints: 10, feats: [], featSelections: {}, skills: {}, skillRanksByClass: {}, knownSpells: [], preparedSpells: [], equipment: {}, inventory: {}, languages: ['Common'], prestigeClass: undefined,
}

export function abilityModifier(score: number) {
  return Math.floor((score - 10) / 2)
}

export function armorClass(
  character: Character,
  armorBonus = 0,
  maximumDexterityBonus = Infinity,
  shieldBonus = 0,
) {
  const dexterityBonus = Math.min(
    abilityModifier(character.abilities.dex),
    maximumDexterityBonus,
  )
  const race = raceDefinitions[character.race.toLowerCase().replaceAll(' ', '-')]
  const sizeModifiers = {
    Fine: 8,
    Diminutive: 4,
    Tiny: 2,
    Small: 1,
    Medium: 0,
    Large: -1,
    Huge: -2,
    Gargantuan: -4,
    Colossal: -8,
  } as const
  const sizeBonus = sizeModifiers[race?.size ?? 'Medium']
  return 10 + armorBonus + shieldBonus + dexterityBonus + sizeBonus
}

export function carryingCapacity(character: Character) {
  const race = raceDefinitions[character.race.toLowerCase().replaceAll(' ', '-')]
  const size = race?.size ?? 'Medium'
  const lightCapacity: Record<number, number> = {
    1: 3, 2: 6, 3: 10, 4: 13, 5: 16, 6: 20, 7: 23, 8: 26, 9: 30,
    10: 33, 11: 38, 12: 43, 13: 50, 14: 58, 15: 66, 16: 76, 17: 86,
    18: 100, 19: 116, 20: 133, 21: 153, 22: 173, 23: 200, 24: 230,
    25: 266, 26: 306, 27: 346, 28: 400, 29: 460,
  }
  const strength = Math.max(1, character.abilities.str)
  const lightBase = lightCapacity[Math.min(strength, 29)] ?? 460 * 4 ** Math.floor((strength - 29) / 10)
  const sizeMultiplier = {
    Fine: 0.125, Diminutive: 0.25, Tiny: 0.5, Small: 0.75,
    Medium: 1, Large: 2, Huge: 4, Gargantuan: 8, Colossal: 16,
  } as const
  const roundLoad = (load: number) => Math.round(load)
  const roundTableLoad = (load: number) => Math.round(load / 5) * 5
  const light = roundLoad(lightBase * sizeMultiplier[size])
  const medium = roundTableLoad(lightBase * 2 * sizeMultiplier[size])
  const heavy = roundTableLoad(lightBase * 3 * sizeMultiplier[size])
  return { light, medium, heavy }
}

export function cloneCharacter(character: Character): Character {
  return structuredClone(character)
}

export function changeRace(character: Character, race: string): Character {
  const nextCharacter = cloneCharacter(character)
  const oldModifiers = raceDefinitions[character.race.toLowerCase().replaceAll(' ', '-')]?.abilityModifiers ?? {}
  const newModifiers = raceDefinitions[race.toLowerCase().replaceAll(' ', '-')]?.abilityModifiers ?? {}
  for (const ability of Object.keys(nextCharacter.abilities) as AbilityName[]) {
    nextCharacter.abilities[ability] -= oldModifiers[ability] ?? 0
    nextCharacter.abilities[ability] += newModifiers[ability] ?? 0
  }
  nextCharacter.race = race
  return nextCharacter
}

export function nextClassLevel(character: Character, classId: ClassId) {
  return Math.max(0, ...character.classLevels.filter((entry) => entry.classId === classId).map((entry) => entry.level)) + 1
}

export function rollHitDie(hitDie: number) {
  return Math.floor(Math.random() * hitDie) + 1
}

export function hitPointGain(character: Character, hitPointRoll: number) {
  return Math.max(1, hitPointRoll + abilityModifier(character.abilities.con))
}

export function beginLevelUp(character: Character, classId: ClassId): LevelUpDraft {
  const proposed = cloneCharacter(character)
  proposed.classLevels = [...proposed.classLevels, { classId, level: nextClassLevel(character, classId) }]
  return { original: cloneCharacter(character), proposed, classId, hitPointRoll: null, validationErrors: [] }
}

export function validateLevelUp(draft: LevelUpDraft): string[] {
  const errors: string[] = []
  if (draft.proposed.classLevels.length !== draft.original.classLevels.length + 1) errors.push('A level-up must add exactly one class level.')
  if (draft.proposed.classLevels.some((entry) => entry.level < 1)) errors.push('Class levels must be at least 1.')
  if (draft.hitPointRoll === null) errors.push('Roll hit points before confirming the level-up.')
  return errors
}
