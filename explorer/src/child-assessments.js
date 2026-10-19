// Answer-bearing quizzes live outside the canonical taxonomy. Authored tasks map
// to source evidence; generated guided missions stay practice-only, not mastery.
import { assessmentPromptFor } from "./taxonomy.js";
import { preschoolActivityFor } from "./preschool-activities.js?v=assignment-path-17";

const ASSESSMENTS = {
  mt_SsS7GptD_o: {
    icon: "💰",
    tasks: [
      {
        evidenceIndex: 0,
        vocabulary: [{ en: "money", ro: "bani" }],
        prompt: {
          en: "What can people use money to pay for? Choose both!",
          ro: "Ce pot plăti oamenii cu bani? Alege ambele imagini!",
        },
        select: "multiple",
        requiredCount: 2,
        choices: [
          { icon: "🥪", label: { en: "Food people need", ro: "Mâncare de care au nevoie" }, correct: true },
          { icon: "🧸", label: { en: "A toy someone wants", ro: "O jucărie pe care și-o doresc" }, correct: true },
          { icon: "🪙🎩", label: { en: "Make a coin into a hat", ro: "Să facem o pălărie dintr-o monedă" } },
          { icon: "🧱", label: { en: "Build a wall from coins", ro: "Să construim un zid din monede" } },
        ],
      },
      {
        evidenceIndex: 1,
        vocabulary: [{ en: "swap", ro: "a schimba" }],
        prompt: {
          en: "Before money, how could a baker get some eggs?",
          ro: "Înainte să existe banii, cum putea brutarul să primească ouă?",
        },
        select: "single",
        choices: [
          { icon: "🍞 ↔️ 🥚", label: { en: "Swap bread for eggs", ro: "Schimbă pâine pe ouă" }, correct: true },
          { icon: "💳 ➡️ 🥚", label: { en: "Tap a bank card", ro: "Atinge un card bancar" } },
          { icon: "🪄", label: { en: "Use a magic wand", ro: "Folosește o baghetă magică" } },
        ],
      },
      {
        evidenceIndex: 2,
        vocabulary: [{ en: "coins", ro: "monede" }, { en: "notes", ro: "bancnote" }],
        prompt: {
          en: "Tap at least two ways people can pay today!",
          ro: "Atinge cel puțin două feluri în care putem plăti azi!",
        },
        select: "multiple",
        requiredCount: 2,
        choices: [
          { icon: "🪙", label: { en: "Coins", ro: "Monede" }, correct: true },
          { icon: "💵", label: { en: "Notes", ro: "Bancnote" }, correct: true },
          { icon: "💳", label: { en: "Bank card", ro: "Card bancar" }, correct: true },
          { icon: "📱", label: { en: "Pay by phone", ro: "Plată cu telefonul" }, correct: true },
          { icon: "🍌", label: { en: "Banana", ro: "Banană" } },
          { icon: "🧸", label: { en: "Teddy bear", ro: "Ursuleț" } },
        ],
      },
    ],
  },
  mt_FNSeo9_T2Z: {
    icon: "👛",
    tasks: [
      {
        evidenceIndex: 0,
        vocabulary: [{ en: "safe", ro: "în siguranță" }],
        prompt: {
          en: "Where can money stay safe? Pick two!",
          ro: "Unde putem păstra banii în siguranță? Alege două!",
        },
        select: "multiple",
        requiredCount: 2,
        choices: [
          { icon: "👛", label: { en: "In a purse", ro: "Într-un portofel" }, correct: true },
          { icon: "🐷", label: { en: "In a money box", ro: "Într-o pușculiță" }, correct: true },
          { icon: "🧑‍🧑‍🧒", label: { en: "Give it to a grown-up to keep safe", ro: "Îl dau unui adult să-l păstreze" }, correct: true },
          { icon: "🪑", label: { en: "Leave it on the floor", ro: "Îl las pe jos" } },
          { icon: "🌧️", label: { en: "Leave it outside", ro: "Îl las afară" } },
        ],
      },
      {
        evidenceIndex: 1,
        vocabulary: [{ en: "need", ro: "nevoie" }, { en: "want", ro: "dorință" }],
        prompt: {
          en: "Why is it important not to lose your money?",
          ro: "De ce e bine să nu pierdem banii?",
        },
        select: "single",
        choices: [
          { icon: "🛍️", label: { en: "You can use it for something you need or want", ro: "Îl poți folosi pentru ceva necesar sau dorit" }, correct: true },
          { icon: "🪄", label: { en: "It turns into a magic wand", ro: "Se transformă într-o baghetă magică" } },
          { icon: "🎈", label: { en: "It floats back home by itself", ro: "Se întoarce singur acasă" } },
        ],
      },
      {
        evidenceIndex: 2,
        vocabulary: [{ en: "money box", ro: "pușculiță" }],
        prompt: {
          en: "Shop is over! What should you do with the play coins?",
          ro: "Joaca de-a magazinul s-a terminat! Ce faci cu monedele?",
        },
        select: "single",
        choices: [
          { icon: "🐷", label: { en: "Put them in a money box", ro: "Le pun în pușculiță" }, correct: true },
          { icon: "🛝", label: { en: "Leave them on the playground", ro: "Le las în parc" } },
          { icon: "🗑️", label: { en: "Throw them away", ro: "Le arunc" } },
        ],
      },
    ],
  },
  mt_zrCyqhngYm: {
    icon: "🐷",
    tasks: [
      {
        evidenceIndex: 0,
        vocabulary: [{ en: "save", ro: "a economisi" }],
        prompt: {
          en: "Why might you save some coins?",
          ro: "De ce ai putea păstra niște monede?",
        },
        select: "single",
        choices: [
          { icon: "🎁", label: { en: "To use them for something later", ro: "Ca să le folosești mai târziu" }, correct: true },
          { icon: "🪄", label: { en: "So they turn into magic beans", ro: "Ca să se transforme în boabe magice" } },
          { icon: "🫥", label: { en: "So you never have to think about them", ro: "Ca să nu te mai gândești la ele" } },
        ],
      },
      {
        evidenceIndex: 1,
        vocabulary: [{ en: "goal", ro: "scop" }],
        prompt: {
          en: "Which one is a saving goal?",
          ro: "Care este un scop pentru care poți economisi?",
        },
        select: "single",
        choices: [
          { icon: "📚", label: { en: "Save coins for a book", ro: "Păstrez monede pentru o carte" }, correct: true },
          { icon: "🍬", label: { en: "Spend every coin right now", ro: "Cheltuiesc toate monedele acum" } },
          { icon: "🫣", label: { en: "Hide coins and forget where they are", ro: "Ascund monedele și uit unde sunt" } },
        ],
      },
      {
        evidenceIndex: 2,
        vocabulary: [{ en: "enough", ro: "destul" }],
        prompt: {
          en: "You want a big toy. What can you do?",
          ro: "Îți dorești o jucărie mare. Ce poți face?",
        },
        select: "single",
        choices: [
          { icon: "🐷➡️🧸", label: { en: "Save a little and wait until you have enough", ro: "Păstrez câte puțin până am destul" }, correct: true },
          { icon: "💸", label: { en: "Spend all your coins on a tiny treat first", ro: "Cheltuiesc toți banii pe o gustare mică" } },
          { icon: "😭", label: { en: "Give up because waiting is impossible", ro: "Renunț, pentru că nu pot aștepta" } },
        ],
      },
    ],
  },
};

const SOURCE_REFERENCE = /\b(research|studies|study|framework|theory|view of|et al\.|effect size|evidence base|assessment research|journal)\b/i;
const ACTION_START = /^(identify|name|list|point|describe|explain|give|use|solve|match|sort|compare|distinguish|recognise|recognize|show|create|make|build|draw|model|act|record|write|understand)\b/i;

function isSourceReference(value) {
  return value.length <= 120 && SOURCE_REFERENCE.test(value) && !ACTION_START.test(value);
}

function makeImperative(value) {
  const rewrites = [
    [/^Names\b/i, "Name"], [/^Explains\b/i, "Explain"], [/^Describes\b/i, "Describe"],
    [/^Identifies\b/i, "Identify"], [/^Gives\b/i, "Give"], [/^Uses\b/i, "Use"],
    [/^Solves\b/i, "Solve"], [/^Matches\b/i, "Match"], [/^Sorts\b/i, "Sort"],
    [/^Distinguishes\b/i, "Distinguish"], [/^Recognises\b/i, "Recognise"], [/^Recognizes\b/i, "Recognize"],
    [/^Compares\b/i, "Compare"], [/^Creates\b/i, "Create"], [/^Builds\b/i, "Build"],
    [/^Draws\b/i, "Draw"], [/^Writes\b/i, "Write"], [/^Records\b/i, "Record"],
    [/^Counts\b/i, "Count"], [/^Labels\b/i, "Label"], [/^Points\b/i, "Point"],
    [/^Says\b/i, "Say"], [/^States\b/i, "State"], [/^Acts\b/i, "Act"],
    [/^Reads\b/i, "Read"], [/^Asks\b/i, "Ask"], [/^Keeps\b/i, "Keep"],
  ];
  for (const [pattern, replacement] of rewrites) {
    if (pattern.test(value)) return value.replace(pattern, replacement);
  }
  return value;
}

function topicPrompt(topic) {
  if (topic.assessmentPrompt) return assessmentPromptFor(topic, "you");
  const description = topic.description?.trim();
  return `Show what you know about ${topic.name}${description ? `: ${description}` : "."}`;
}

function guidedAssessment(topic) {
  const evidence = Array.isArray(topic.evidence) ? topic.evidence : [];
  const referenceOnly = evidence.length > 0 && evidence.every(isSourceReference);

  if (!evidence.length || referenceOnly) {
    return {
      kind: "guided",
      tasks: [{
        evidenceIndexes: referenceOnly ? [] : evidence.map((_, index) => index),
        prompt: { en: topicPrompt(topic) },
        language: "en-US",
      }],
    };
  }

  return {
    kind: "guided",
    tasks: evidence.map((criterion, index) => ({
      evidenceIndexes: [index],
      prompt: { en: `Show what you know: ${makeImperative(criterion)}` },
      language: "en-US",
    })),
  };
}

export function childAssessmentFor(topic) {
  const assessment = ASSESSMENTS[topic.id];
  if (assessment && assessment.tasks.length === topic.evidence?.length) {
    const evidenceIndexes = assessment.tasks.map(({ evidenceIndex }) => evidenceIndex);
    if (evidenceIndexes.every((index, position) => index === position)) return { ...assessment, kind: "choice" };
  }

  const game = preschoolActivityFor(topic);
  const hasSelfCheckingChoices = Array.isArray(game?.choices) && game.choices.length >= 2 && game.choices.some(({ correct }) => correct);
  const hasTapSort = game?.interaction?.kind === "tap-sort" && Array.isArray(game.interaction.bins) && game.interaction.bins.length >= 2 &&
    Array.isArray(game.interaction.items) && game.interaction.items.length >= 2 &&
    game.interaction.items.every((item) => item && game.interaction.bins.some((candidate) => candidate?.id === item.bin));
  if (game?.prompt?.en && (hasSelfCheckingChoices || hasTapSort)) {
    return {
      kind: "practice-game",
      icon: game.icon,
      tasks: [{
        evidenceIndexes: [],
        prompt: game.prompt,
        ...(hasSelfCheckingChoices ? { select: "single" } : {}),
        ...(game.interaction ? { interaction: game.interaction } : {}),
        ...(hasSelfCheckingChoices ? { choices: game.choices } : {}),
        ...(Array.isArray(game.vocabulary) ? { vocabulary: game.vocabulary } : {}),
      }],
    };
  }

  return guidedAssessment(topic);
}
