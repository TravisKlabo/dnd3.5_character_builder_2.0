import { useEffect, useState } from "react";
import "./App.css";
import {
  abilityModifier,
  armorClass,
  carryingCapacity,
  beginLevelUp,
  classDefinitions,
  changeRace,
  cloneCharacter,
  dragonlancePrestigeClasses,
  hitPointGain,
  initialCharacter,
  raceDefinitions,
  rollHitDie,
  type AbilityName,
  type Character,
  type ClassId,
  type PrestigeClassId,
  type LevelUpDraft,
  validateLevelUp,
} from "./domain";

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
const skillDescriptions: Record<string, string> = {
  Appraise: "Estimate the value of common or rare objects.",
  Balance: "Keep your footing on narrow or unstable surfaces.",
  Bluff: "Convince others that something untrue is believable.",
  Climb: "Climb surfaces, ropes, and other handholds.",
  Concentration: "Maintain focus while distracted, injured, or casting.",
  Craft: "Create or repair items in a chosen craft.",
  "Decipher Script": "Understand unfamiliar writing, codes, and ancient scripts.",
  Diplomacy: "Influence attitudes and negotiate agreements.",
  "Disable Device": "Disarm traps and sabotage or repair devices.",
  Disguise: "Change your appearance to look like someone else.",
  "Escape Artist": "Slip restraints or squeeze through tight spaces.",
  Forgery: "Create or detect false documents and signatures.",
  "Gather Information": "Learn rumors and useful information through conversation.",
  "Handle Animal": "Train, control, and work with animals.",
  Heal: "Treat wounds, stabilize the dying, and diagnose conditions.",
  Hide: "Conceal yourself from sight.",
  Intimidate: "Influence others through threats or displays of force.",
  Jump: "Leap across gaps or over obstacles.",
  "Knowledge (arcana)": "Recall lore about magic, dragons, and magical traditions.",
  "Knowledge (architecture and engineering)": "Recall lore about buildings, structures, and engineering.",
  "Knowledge (dungeoneering)": "Recall lore about underground environments, aberrations, and caves.",
  "Knowledge (geography)": "Recall lore about lands, terrain, climates, and peoples.",
  "Knowledge (history)": "Recall important events, rulers, wars, and civilizations.",
  "Knowledge (local)": "Recall lore about a region, its people, and its laws.",
  "Knowledge (nature)": "Recall lore about animals, plants, fey, weather, and nature.",
  "Knowledge (nobility and royalty)": "Recall lore about noble families, heraldry, and etiquette.",
  "Knowledge (religion)": "Recall lore about deities, rites, undead, and religious traditions.",
  "Knowledge (the planes)": "Recall lore about the planes, outsiders, and planar portals.",
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
  "Sense Motive": "Detect deception and understand another creature's intentions.",
  "Sleight of Hand": "Palm objects, pick pockets, and perform legerdemain.",
  "Speak Language": "Communicate in an additional language.",
  Spellcraft: "Identify spells and understand magical effects.",
  Spot: "Notice creatures, movement, and visual details.",
  Survival: "Track, find food, navigate, and endure the wilderness.",
  Swim: "Move through water and avoid drowning.",
  Tumble: "Roll, dive, and move safely through threatened spaces.",
  "Use Magic Device": "Activate magic items despite lacking the usual requirements.",
  "Use Rope": "Tie knots, secure ropes, and work with rope-based tools.",
};
const classSkills: Partial<Record<ClassId, string[]>> = {
  barbarian: ["Climb", "Handle Animal", "Intimidate", "Jump", "Listen", "Ride", "Survival", "Swim"],
  bard: ["Appraise", "Balance", "Bluff", "Climb", "Concentration", "Craft", "Decipher Script", "Diplomacy", "Disguise", "Escape Artist", "Gather Information", "Hide", "Jump", "Knowledge (arcana)", "Knowledge (architecture and engineering)", "Knowledge (dungeoneering)", "Knowledge (geography)", "Knowledge (history)", "Knowledge (local)", "Knowledge (nature)", "Knowledge (nobility and royalty)", "Knowledge (religion)", "Knowledge (the planes)", "Listen", "Move Silently", "Perform (act)", "Perform (comedy)", "Perform (dance)", "Perform (keyboard instruments)", "Perform (mime)", "Perform (oratory)", "Perform (percussion instruments)", "Perform (sing)", "Perform (string instruments)", "Perform (wind instruments)", "Profession", "Sense Motive", "Sleight of Hand", "Speak Language", "Spellcraft", "Swim", "Tumble", "Use Magic Device", "Use Rope"],
  cleric: ["Concentration", "Craft", "Diplomacy", "Heal", "Knowledge (arcana)", "Knowledge (history)", "Knowledge (religion)", "Knowledge (the planes)", "Profession", "Spellcraft"],
  druid: ["Concentration", "Craft", "Diplomacy", "Handle Animal", "Heal", "Knowledge (nature)", "Listen", "Profession", "Ride", "Spellcraft", "Spot", "Survival", "Swim"],
  fighter: ["Climb", "Craft", "Handle Animal", "Intimidate", "Jump", "Ride", "Swim"],
  monk: ["Balance", "Climb", "Concentration", "Craft", "Escape Artist", "Hide", "Jump", "Knowledge (arcana)", "Knowledge (religion)", "Listen", "Move Silently", "Profession", "Sense Motive", "Swim", "Tumble"],
  paladin: ["Concentration", "Craft", "Diplomacy", "Handle Animal", "Heal", "Knowledge (nobility and royalty)", "Knowledge (religion)", "Profession", "Ride", "Sense Motive"],
  ranger: ["Climb", "Concentration", "Craft", "Handle Animal", "Heal", "Hide", "Jump", "Knowledge (dungeoneering)", "Knowledge (geography)", "Knowledge (nature)", "Listen", "Move Silently", "Profession", "Ride", "Search", "Spot", "Survival", "Swim", "Use Rope"],
  rogue: ["Appraise", "Balance", "Bluff", "Climb", "Decipher Script", "Diplomacy", "Disable Device", "Disguise", "Escape Artist", "Forgery", "Gather Information", "Hide", "Intimidate", "Jump", "Knowledge (local)", "Listen", "Move Silently", "Open Lock", "Perform (act)", "Search", "Sense Motive", "Sleight of Hand", "Swim", "Tumble", "Use Magic Device", "Use Rope"],
  sorcerer: ["Bluff", "Concentration", "Craft", "Knowledge (arcana)", "Profession", "Spellcraft"],
  wizard: ["Concentration", "Craft", "Decipher Script", "Knowledge (arcana)", "Knowledge (architecture and engineering)", "Knowledge (dungeoneering)", "Knowledge (geography)", "Knowledge (history)", "Knowledge (local)", "Knowledge (nature)", "Knowledge (nobility and royalty)", "Knowledge (religion)", "Knowledge (the planes)", "Profession", "Spellcraft"],
  mystic: ["Concentration", "Craft", "Diplomacy", "Heal", "Knowledge (arcana)", "Knowledge (religion)", "Profession", "Spellcraft", "Survival"],
  noble: ["Appraise", "Bluff", "Diplomacy", "Disguise", "Forgery", "Gather Information", "Knowledge (history)", "Knowledge (local)", "Knowledge (nobility and royalty)", "Listen", "Perform (oratory)", "Profession", "Ride", "Sense Motive", "Speak Language"],
};
const spells = [
  "Detect Magic",
  "Read Magic",
  "Magic Missile",
  "Shield",
  "Sleep",
];
const abilityNames: AbilityName[] = ["str", "dex", "con", "int", "wis", "cha"];
const abilityLabels: Record<AbilityName, string> = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};
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
    .map(([ability, value]) => `${ability.toUpperCase()} ${Number(value) > 0 ? "+" : ""}${value}`)
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
      classDefinition.skillPoints + abilityModifier(character.abilities.int) +
        (character.race.toLowerCase() === "human" ? 1 : 0),
    );
    available += pointsPerLevel * (index === 0 ? 4 : 1) * entry.level;
  });
  return available;
}

function getSpentSkillPoints(character: Character) {
  return Object.entries(character.skills).reduce((total, [skill, ranks]) => {
    return total + Number(ranks || 0) * (isClassSkill(character, skill) ? 1 : 2);
  }, 0);
}

function getSkillMaximum(character: Character, skill: string) {
  const characterLevel = character.classLevels.reduce((total, entry) => total + entry.level, 0);
  return isClassSkill(character, skill)
    ? characterLevel + 3
    : Math.floor((characterLevel + 3) / 2);
}

function canIncreaseSkillRank(character: Character, skill: string) {
  const currentRanks = Number(character.skills[skill] || 0);
  const pointCost = isClassSkill(character, skill) ? 1 : 2;
  return currentRanks < getSkillMaximum(character, skill)
    && getSpentSkillPoints(character) + pointCost <= getAvailableSkillCount(character);
}

function getSkillAbility(skill: string): AbilityName {
  const dexteritySkills = ["Balance", "Disable Device", "Disguise", "Escape Artist", "Forgery", "Hide", "Move Silently", "Open Lock", "Ride", "Sleight of Hand", "Tumble", "Use Rope"];
  const intelligenceSkills = ["Appraise", "Craft", "Decipher Script", "Search", "Spellcraft"];
  const wisdomSkills = ["Heal", "Listen", "Profession", "Sense Motive", "Spot", "Survival"];
  const charismaSkills = ["Bluff", "Diplomacy", "Gather Information", "Handle Animal", "Intimidate", "Perform (act)", "Perform (comedy)", "Perform (dance)", "Perform (keyboard instruments)", "Perform (mime)", "Perform (oratory)", "Perform (percussion instruments)", "Perform (sing)", "Perform (string instruments)", "Perform (wind instruments)", "Use Magic Device"];
  if (dexteritySkills.includes(skill)) return "dex";
  if (intelligenceSkills.includes(skill) || skill.startsWith("Knowledge (")) return "int";
  if (wisdomSkills.includes(skill)) return "wis";
  if (charismaSkills.includes(skill)) return "cha";
  return "str";
}

function getRacialSkillBonus(character: Character, skill: string) {
  const race = raceDefinitions[character.race.toLowerCase().replaceAll(" ", "-")];
  return race?.racialSkillBonuses?.[skill] ?? 0;
}

function getCharacterRace(character: Character) {
  return raceDefinitions[character.race.toLowerCase().replaceAll(" ", "-")]?.name ?? character.race;
}

function getSkillTotalTooltip(character: Character, skill: string) {
  const ability = getSkillAbility(skill);
  const abilityBonus = abilityModifier(character.abilities[ability]);
  const racialBonus = getRacialSkillBonus(character, skill);
  const ranks = Number(character.skills[skill] || 0);
  const rankBreakdown = Object.entries(character.skillRanksByClass ?? {})
    .map(([classId, classSkills]) => ({ classId, ranks: Number(classSkills[skill] || 0) }))
    .filter((entry) => entry.ranks > 0);
  const trackedRanks = rankBreakdown.reduce((total, entry) => total + entry.ranks, 0);
  const lines = [
    `${abilityLabels[ability]}: ${formatModifier(abilityBonus)}`,
    racialBonus ? `${getCharacterRace(character)}: ${formatModifier(racialBonus)}` : "",
    ...(rankBreakdown.length
      ? rankBreakdown.map((entry) => `${classDefinitions[entry.classId as ClassId]?.name ?? entry.classId}: ${entry.ranks}`)
      : []),
    ...(trackedRanks < ranks ? [`Unattributed ranks: ${ranks - trackedRanks}`] : []),
  ];
  return lines.filter(Boolean).join("\n");
}

function formatClassDetails(classDefinition: (typeof classDefinitions)[ClassId]) {
  const attack = classDefinition.baseAttackBonus === "good" ? "good" : classDefinition.baseAttackBonus;
  const saves = [
    classDefinition.fortitude === "good" ? "Fortitude" : "",
    classDefinition.reflex === "good" ? "Reflex" : "",
    classDefinition.will === "good" ? "Will" : "",
  ].filter(Boolean);
  return `d${classDefinition.hitDie} Hit Die; ${attack} base attack; ${saves.length ? `${saves.join(", ")} good save${saves.length > 1 ? "s" : ""}` : "no good saves"}; ${classDefinition.skillPoints} skill points per level; ${classDefinition.spellcasting ? "spellcasting class" : "non-spellcasting class"}.`;
}

function formatPrestigeClassDetails(prestigeClass: (typeof dragonlancePrestigeClasses)[PrestigeClassId]) {
  const prerequisites = prestigeClass.prerequisites;
  const requirements = [
    prerequisites.bab ? `BAB +${prerequisites.bab}` : "",
    prerequisites.ability ? Object.entries(prerequisites.ability).map(([ability, score]) => `${ability.toUpperCase()} ${score}`).join(", ") : "",
    prerequisites.classes?.length ? prerequisites.classes.map((classId) => classDefinitions[classId].name).join(" or ") : "",
    prerequisites.feats?.length ? prerequisites.feats.join(", ") : "",
  ].filter(Boolean);
  return `${requirements.length ? `Prerequisites: ${requirements.join("; ")}. ` : ""}Features: ${prestigeClass.features.join(", ")}.`;
}

const alignmentDescriptions: Record<string, string> = {
  "Lawful Good": "Upholds order and acts for the welfare of others.",
  "Neutral Good": "Helps others while balancing order and freedom.",
  "Chaotic Good": "Protects others through compassion and personal freedom.",
  "Lawful Neutral": "Values order, duty, and consistent principles above moral extremes.",
  "True Neutral": "Seeks balance or avoids strong commitments to law, chaos, good, or evil.",
  "Chaotic Neutral": "Follows personal freedom and instinct rather than imposed order.",
  "Lawful Evil": "Uses order, ambition, and rules to pursue selfish or harmful ends.",
  "Neutral Evil": "Pursues personal gain without loyalty to law or chaos.",
  "Chaotic Evil": "Acts through cruelty, destruction, and disregard for order or others.",
};

function App() {
  const [activeSheet, setActiveSheet] = useState("character");
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const [creationDraft, setCreationDraft] = useState<Character>(() =>
    cloneCharacter(initialCharacter),
  );
  const [creationOpen, setCreationOpen] = useState(true);
  const [creationLocked, setCreationLocked] = useState(false);
  const [ruleset, setRuleset] = useState<"core-35-srd" | "dragonlance-user-pack" | "dragonlance-monster-classes">("core-35-srd");
  const [abilityMethod, setAbilityMethod] = useState<
    "roll" | "pointBuy" | "manual"
  >("manual");
  const [rolledScores, setRolledScores] = useState<number[] | null>(null);
  const [rolledAssignments, setRolledAssignments] = useState<number[] | null>(null);
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
  ) => setCreationDraft({ ...creationDraft, [key]: value });
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
      if (change > 0 && currentSpent + pointCost > getAvailableSkillCount(current)) return current;
      const classId = current.classLevels.at(-1)?.classId;
      if (!classId) return current;
      const currentClassRanks = current.skillRanksByClass?.[classId]?.[skill] ?? 0;
      const nextClassRanks = Math.max(0, currentClassRanks + (nextRanks - currentRanks));
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
  const updateCreationRace = (race: string) => setCreationDraft(changeRace(creationDraft, race));
  const createCharacter = () => {
    const classId = creationDraft.classLevels[0].classId;
    setCharacter({
      ...cloneCharacter(creationDraft),
      hitPoints: classDefinitions[classId].hitDie,
    });
    setLevelUpDraft(null);
    setCreationLocked(true);
    setCreationOpen(false);
  };
  const calculatedCharacter = creationOpen && !creationLocked ? creationDraft : character;

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">D&D 3.5 rules workspace</p>
          <h1>
            D&D 3.5 Character Builder <span>2.0</span>
          </h1>
        </div>
        <div className="header-actions">
          <button className="quiet-button" type="button">
            Save
          </button>
          <button className="quiet-button" type="button">
            Export
          </button>
          <button
            className="level-button"
            type="button"
            onClick={() => startLevelUp("fighter")}
          >
            Enter Level-Up Mode
          </button>
        </div>
      </header>
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
          ["spells", "Spells"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={activeSheet === id ? "active" : ""}
            type="button"
            onClick={() => setActiveSheet(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      {activeSheet === "character" && (
        <>
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
            onRaceChange={updateCreationRace}
            ruleset={ruleset}
            onRulesetChange={(nextRuleset) => {
              setRuleset(nextRuleset);
              if (nextRuleset === "core-35-srd" && raceDefinitions[creationDraft.race.toLowerCase().replaceAll(" ", "-")]?.source !== "core-35-srd") {
                updateCreationRace("Human");
              }
            }}
            onAbilityChange={updateCreationAbility}
            onCreate={createCharacter}
          />
          <CharacterSheet character={levelUpDraft?.proposed ?? calculatedCharacter} onSkillRankChange={updateSkillRanks} />
        </>
      )}
      {activeSheet === "equipment" && <EquipmentSheet />}
      {activeSheet === "spells" && <SpellSheet />}
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
  onRaceChange: (race: string) => void;
  ruleset: "core-35-srd" | "dragonlance-user-pack" | "dragonlance-monster-classes";
  onRulesetChange: (ruleset: "core-35-srd" | "dragonlance-user-pack" | "dragonlance-monster-classes") => void;
  onAbilityChange: (ability: AbilityName, value: number) => void;
  onCreate: () => void;
}) {
  const [raceMenuOpen, setRaceMenuOpen] = useState(false);
  const [classMenuOpen, setClassMenuOpen] = useState(false);
  const [prestigeClassMenuOpen, setPrestigeClassMenuOpen] = useState(false);
  const [alignmentMenuOpen, setAlignmentMenuOpen] = useState(false);
  useEffect(() => {
    const closeMenus = () => {
      setRaceMenuOpen(false);
      setClassMenuOpen(false);
      setPrestigeClassMenuOpen(false);
      setAlignmentMenuOpen(false);
    };
    const handleDocumentPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest(".race-field, .class-field")) {
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
  const selectedRace = raceDefinitions[draft.race.toLowerCase().replaceAll(" ", "-")] ?? raceDefinitions.human;
  const availableClasses = Object.values(classDefinitions).filter(
    (definition) => definition.source === "core-35-srd" || ruleset !== "core-35-srd",
  );
  const raceOptions = Object.values(raceDefinitions).filter(
    (race) =>
      (race.source === "core-35-srd" || race.source === "dragonlance-user-pack") &&
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
    onAbilityChange("str", scores[0] + (selectedRace.abilityModifiers.str ?? 0));
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
              onChange={(event) => onRulesetChange(event.target.value as typeof ruleset)}
            >
              <option value="core-35-srd">Core 3.5 SRD</option>
              <option value="dragonlance-user-pack">Dragonlance</option>
              <option value="dragonlance-monster-classes">Dragonlance (Monster Classes Allowed)</option>
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
                onClick={() => setRaceMenuOpen((isOpen) => !isOpen)}
              >
                {draft.race}
                <span aria-hidden="true">▾</span>
              </button>
              {raceMenuOpen && (
                <div className="race-menu" role="listbox" aria-label="Race choices">
                  {raceOptions.map((race) => (
                    <button
                      className={`race-option ${draft.race === race.name ? "selected" : ""}`}
                      key={race.id}
                      type="button"
                      role="option"
                      aria-selected={draft.race === race.name}
                      onClick={() => {
                        onRaceChange(race.name);
                        setRaceMenuOpen(false);
                      }}
                    >
                      <span>{race.name}</span>
                      <span className="race-option-tooltip" role="tooltip">
                        {formatRaceDetails(race)}{race.levelAdjustment ? `; Level adjustment +${race.levelAdjustment}` : ""}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </label>
            <label>
              Class
              <div className="class-field">
                <button
                  className="race-trigger"
                  type="button"
                  aria-expanded={classMenuOpen}
                  onClick={() => setClassMenuOpen((isOpen) => !isOpen)}
                >
                  {classDefinitions[classId].name}
                  <span aria-hidden="true">▾</span>
                </button>
                {classMenuOpen && (
                  <div className="race-menu" role="listbox" aria-label="Class choices">
                    {availableClasses.map((definition) => (
                      <button
                        className={`race-option ${classId === definition.id ? "selected" : ""}`}
                        key={definition.id}
                        type="button"
                        role="option"
                        aria-selected={classId === definition.id}
                        onClick={() => {
                          onChange("classLevels", [{ classId: definition.id, level: 1 }]);
                          setClassMenuOpen(false);
                        }}
                      >
                        <span>{definition.name}</span>
                        <span className="race-option-tooltip" role="tooltip">
                          {formatClassDetails(definition)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </label>
            <label>
              Prestige Class
              <div className="class-field menu-left">
                <button
                  className="race-trigger"
                  type="button"
                  aria-expanded={prestigeClassMenuOpen}
                  onClick={() => setPrestigeClassMenuOpen((isOpen) => !isOpen)}
                >
                  {draft.prestigeClass ? dragonlancePrestigeClasses[draft.prestigeClass].name : "None"}
                  <span aria-hidden="true">▾</span>
                </button>
                {prestigeClassMenuOpen && (
                  <div className="race-menu" role="listbox" aria-label="Prestige class choices">
                    <button
                      className={`race-option ${!draft.prestigeClass ? "selected" : ""}`}
                      type="button"
                      role="option"
                      aria-selected={!draft.prestigeClass}
                      onClick={() => {
                        onChange("prestigeClass", undefined);
                        setPrestigeClassMenuOpen(false);
                      }}
                    >
                      <span>None</span>
                      <span className="race-option-tooltip" role="tooltip">
                        Optional prestige class; no prestige-class prerequisites or features are applied.
                      </span>
                    </button>
                    {Object.values(dragonlancePrestigeClasses).map((definition) => (
                      <button
                        className={`race-option ${draft.prestigeClass === definition.id ? "selected" : ""}`}
                        key={definition.id}
                        type="button"
                        role="option"
                        aria-selected={draft.prestigeClass === definition.id}
                        onClick={() => {
                          onChange("prestigeClass", definition.id);
                          setPrestigeClassMenuOpen(false);
                        }}
                      >
                        <span>{definition.name}</span>
                        <span className="race-option-tooltip" role="tooltip">
                          {formatPrestigeClassDetails(definition)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </label>
            <label>
              Alignment
              <div className="class-field menu-left">
                <button
                  className="race-trigger"
                  type="button"
                  aria-expanded={alignmentMenuOpen}
                  onClick={() => setAlignmentMenuOpen((isOpen) => !isOpen)}
                >
                  {draft.alignment}
                  <span aria-hidden="true">▾</span>
                </button>
                {alignmentMenuOpen && (
                  <div className="race-menu" role="listbox" aria-label="Alignment choices">
                    {Object.keys(alignmentDescriptions).map((alignment) => (
                      <button
                        className={`race-option ${draft.alignment === alignment ? "selected" : ""}`}
                        key={alignment}
                        type="button"
                        role="option"
                        aria-selected={draft.alignment === alignment}
                        onClick={() => {
                          onChange("alignment", alignment);
                          setAlignmentMenuOpen(false);
                        }}
                      >
                        <span>{alignment}</span>
                        <span className="race-option-tooltip" role="tooltip">
                          {alignmentDescriptions[alignment]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </label>
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
              const selectedValue = method === "roll" && rolledAssignments
                ? String(rolledAssignments[abilityNames.indexOf(ability)])
                : String(draft.abilities[ability]);
              const racialAdjustment = selectedRace.abilityModifiers[ability] ?? 0;
              const finalScore = draft.abilities[ability];
              const baseScore =
                method === "roll" && rolledScores && rolledAssignments
                  ? rolledScores[rolledAssignments[abilityNames.indexOf(ability)]]
                  : finalScore - racialAdjustment;
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
                      const optionValue = method === "roll" ? entry.index : score;
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
                    Roll {baseScore} {racialAdjustment > 0 ? "+" : ""}
                    {racialAdjustment || ""}{racialAdjustment ? ` ${selectedRace.name}` : ""} = {finalScore}
                  </small>
                </label>
              );
            })}
          </div>
          <div className="creation-actions">
            <span>
              Starting hit points: d{classDefinitions[classId].hitDie}
            </span>
            <button className="level-button" type="button" onClick={onCreate}>
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

function CharacterSheet({ character, onSkillRankChange }: { character: Character; onSkillRankChange: (skill: string, change: number) => void }) {
  const classId = character.classLevels.at(-1)?.classId ?? "fighter";
  return (
    <div className="sheet-grid">
      <Panel title="Identity" className="identity-panel">
        <div className="identity-grid">
          <label>
            Character name
            <input value={character.name} readOnly />
          </label>
          <label>
            Player
            <input value={character.player} readOnly />
          </label>
          <label>
            Race
            <input value={character.race} readOnly />
          </label>
          <label>
            Class
            <input value={classDefinitions[classId].name} readOnly />
          </label>
          <label>
            Level
            <input value={character.classLevels.length} readOnly />
          </label>
          <label>
            Alignment
            <input value={character.alignment} readOnly />
          </label>
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
              raceDefinitions[character.race.toLowerCase().replaceAll(" ", "-")] ??
              raceDefinitions.human;
            const racialAdjustment = characterRace.abilityModifiers[ability] ?? 0;
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
          <Stat
            label="Armor Class"
            value={String(armorClass(character))}
          />
          <Stat
            label="Initiative"
            value={formatModifier(abilityModifier(character.abilities.dex))}
          />
          <Stat
            label="Speed"
            value={`${(raceDefinitions[character.race.toLowerCase().replaceAll(" ", "-")] ?? raceDefinitions.human).speed ?? 30} ft.`}
          />
          <Stat
            label="Hit Points"
            value={`${character.hitPoints} / ${character.hitPoints}`}
          />
          <Stat label="Base Attack" value="+1" />
          <Stat label="Fort / Ref / Will" value="+2 / +0 / +0" />
        </div>
        <p className="combat-note">
          Size: {(raceDefinitions[character.race.toLowerCase().replaceAll(" ", "-")] ?? raceDefinitions.human).size ?? "Medium"}
          {(() => {
            const capacity = carryingCapacity(character);
            return ` | Carry: ${capacity.light}/${capacity.medium}/${capacity.heavy} lb. (light/medium/heavy)`;
          })()}
        </p>
      </Panel>
      <Panel title={`Skills (${getSpentSkillPoints(character)}/${getAvailableSkillCount(character)})`} className="skills-panel">
        <div className="list-grid">
          {skills.map((skill) => (
            <div className="list-row" key={skill}>
              <span className="skill-name"><input type="checkbox" title={isClassSkill(character, skill) ? "Class skill: 1 point per rank; maximum ranks equal character level + 3." : "Cross-class skill: 2 points per rank; maximum ranks equal half of character level + 3."} checked={isClassSkill(character, skill)} readOnly aria-label={`${skill} class skill`} /><span title={skillDescriptions[skill]}>{skill}</span></span>
              <span className="skill-racial">{getRacialSkillBonus(character, skill) ? `${getCharacterRace(character)} (${formatModifier(getRacialSkillBonus(character, skill))})` : ""}</span>
              <span className="skill-ability">{abilityLabels[getSkillAbility(skill)]} ({formatModifier(abilityModifier(character.abilities[getSkillAbility(skill)]))})</span>
              <span className="skill-ranks"><button type="button" onClick={() => onSkillRankChange(skill, -1)} disabled={!character.skills[skill]} aria-label={`Remove rank from ${skill}`}>−</button><span>{character.skills[skill] || 0}</span><button type="button" onClick={() => onSkillRankChange(skill, 1)} disabled={!canIncreaseSkillRank(character, skill)} aria-label={`Add rank to ${skill}`}>+</button></span>
              <strong title={getSkillTotalTooltip(character, skill)}>{formatModifier(abilityModifier(character.abilities[getSkillAbility(skill)]) + Number(character.skills[skill] || 0) + getRacialSkillBonus(character, skill))}</strong>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Feats & Special Abilities" className="feats-panel">
        <div className="empty-state">
          No selections yet. Choices will be validated against class, race,
          ability, and prerequisite rules.
        </div>
      </Panel>
    </div>
  );
}

function formatModifier(value: number) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function EquipmentSheet() {
  const items = [
    ["Longsword", "weapon", "Equipped"],
    ["Chain Shirt", "armor", "Equipped"],
    ["Backpack", "carried", "Carried"],
    ["Ring of Protection +1", "ring", "Available"],
  ];
  return (
    <div className="sheet-grid single-column">
      <Panel title="Equipment & Encumbrance">
        <div className="equipment-summary">
          <Stat label="Load" value="Light" />
          <Stat label="Carried Weight" value="36 lb." />
          <Stat label="Currency" value="120 gp" />
        </div>
        <div className="equipment-table">
          <div className="table-head">
            <span>Item</span>
            <span>Slot</span>
            <span>Status</span>
          </div>
          {items.map(([item, slot, status]) => (
            <div className="table-row" key={item}>
              <strong>{item}</strong>
              <span>{slot}</span>
              <span className={status === "Equipped" ? "good" : ""}>
                {status}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function SpellSheet() {
  return (
    <div className="sheet-grid single-column">
      <Panel title="Spellcasting Overview">
        <div className="equipment-summary">
          <Stat label="Class" value="Wizard 1" />
          <Stat label="Ability" value="Intelligence" />
          <Stat label="Caster Level" value="1" />
          <Stat label="Spell DC" value="11" />
        </div>
      </Panel>
      <Panel title="Prepared Spells">
        <div className="spell-levels">
          {spells.map((spell) => (
            <div className="spell-row" key={spell}>
              <span>1st</span>
              <strong>{spell}</strong>
              <small>School and casting details appear here</small>
            </div>
          ))}
        </div>
      </Panel>
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
