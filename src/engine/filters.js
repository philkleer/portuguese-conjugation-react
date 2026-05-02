/**
 * filters.js
 *
 * Pure functions that handle random-but-non-repetitive selection of tenses,
 * verbs, persons, and numerus. Translates setTense(), setVerb(), setPerson(),
 * setNumerus() and their helpers from the Swift source.
 */

import verbsData from '../data/verbs.json';

// ─── Tense metadata ───────────────────────────────────────────────────────────

/** Ordered list of all supported tenses. */
export const ALL_TENSES = [
  'Presente Indicativo',
  'Pretérito Perfeito Simples Indicativo',
  'Pretérito Imperfeito Indicativo',
  'Pretérito Perfeito Composto Indicativo',
  'Pretérito Mais-que-Perfeito Composto Indicativo',
  'Pretérito Mais-que-Perfeito Indicativo',
  'Futuro Simples Indicativo',
  'Futuro Composto Indicativo',
  'Presente Subjuntivo',
  'Pretérito Perfeito Simples Subjuntivo',
  'Pretérito Imperfeito Subjuntivo',
  'Pretérito Mais-que-Perfeito Subjuntivo',
  'Futuro Simples Subjuntivo',
  'Futuro Composto Subjuntivo',
  'Futuro do Préterito (Condicional I)',
  'Futuro do Préterito Composto (Condicional II)',
];

/** Maps each tense to the settings key that enables it. */
const TENSE_SETTING_KEY = {
  'Presente Indicativo': 'isPresenteInd',
  'Pretérito Perfeito Simples Indicativo': 'isPerfeitoInd',
  'Pretérito Imperfeito Indicativo': 'isImperfeitoInd',
  'Pretérito Perfeito Composto Indicativo': 'isPerfeitoCompInd',
  'Pretérito Mais-que-Perfeito Composto Indicativo': 'isPMQPCompInd',
  'Pretérito Mais-que-Perfeito Indicativo': 'isPMQPInd',
  'Futuro Simples Indicativo': 'isFuturoIInd',
  'Futuro Composto Indicativo': 'isFuturoIIInd',
  'Presente Subjuntivo': 'isPresenteSub',
  'Pretérito Perfeito Simples Subjuntivo': 'isPerfeitoSub',
  'Pretérito Imperfeito Subjuntivo': 'isImperfeitoSub',
  'Pretérito Mais-que-Perfeito Subjuntivo': 'isPMQPSub',
  'Futuro Simples Subjuntivo': 'isFuturoISub',
  'Futuro Composto Subjuntivo': 'isFuturoIISub',
  'Futuro do Préterito (Condicional I)': 'isCondicionalI',
  'Futuro do Préterito Composto (Condicional II)': 'isCondicionalII',
};

// ─── helpers ──────────────────────────────────────────────────────────────────

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Picks a random element from `pool` that is not already in `history`,
 * then updates the history with a sliding window of size `maxHistory`.
 *
 * Mirrors the repeat-prevention logic in Swift's setTense() / setVerb().
 *
 * @param {string[]} pool       - available options
 * @param {string[]} history    - recently used options (mutated copy returned)
 * @param {number}   maxHistory - sliding window size
 * @returns {{ choice: string, newHistory: string[] }}
 */
function pickWithHistory(pool, history, maxHistory) {
  let choice;

  if (history.length === 0) {
    choice = randomFrom(pool);
  } else {
    do {
      choice = randomFrom(pool);
    } while (history.includes(choice));
  }

  let newHistory = [...history, choice];
  if (newHistory.length > maxHistory) newHistory = newHistory.slice(1);

  return { choice, newHistory };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the subset of tenses that are currently enabled in settings.
 * Equivalent to the todos_tempos construction in Swift's setTense().
 */
export function buildTenseList(settings) {
  return ALL_TENSES.filter((t) => settings[TENSE_SETTING_KEY[t]]);
}

/**
 * Picks the next tense to practise, avoiding recent repeats when the pool is
 * large enough (>= 3). Returns the chosen tense and the updated history array.
 *
 * @param {string[]} todos_tempos  - enabled tenses
 * @param {string[]} lastTenses  - recent tense history
 * @returns {{ tense: string, newLastTenses: string[] }}
 */
export function pickTense(todos_tempos, lastTenses) {
  if (todos_tempos.length === 0) {
    return { tense: 'Presente Indicativo', newLastTenses: [] };
  }

  // With fewer than 3 options there is no meaningful history to keep.
  if (todos_tempos.length < 3) {
    return { tense: randomFrom(todos_tempos), newLastTenses: lastTenses };
  }

  const maxHistory = todos_tempos.length - Math.floor(todos_tempos.length / 3);
  const { choice, newHistory } = pickWithHistory(todos_tempos, lastTenses, maxHistory);
  return { tense: choice, newLastTenses: newHistory };
}

/**
 * Builds the pool of available verbs based on the user's regulares /
 * irregulares toggle selections.
 */
export function buildVerbArray(settings) {
  const { regulares, irregulares } = settings;
  if (irregulares && !regulares) return verbsData.irregular;
  if (regulares && !irregulares) return verbsData.regular;
  return [...verbsData.regular, ...verbsData.irregular];
}

/**
 * Picks the next verb, avoiding recent repeats.
 * Returns the chosen [infinitive, classKey] pair and the updated history.
 *
 * @param {string[][]} todos_verbos - pool of [infinitive, classKey] pairs
 * @param {string[]}   lastVerbs  - history of recently used infinitives
 * @returns {{ verb: string[], newLastVerbs: string[] }}
 */
export function pickVerb(todos_verbos, lastVerbs) {
  const maxHistory = todos_verbos.length - Math.floor(todos_verbos.length / 3);

  // Build a parallel pool of infinitives for the history check.
  const infinitives = todos_verbos.map((v) => v[0]);
  const { choice: chosenInfinitive, newHistory } = pickWithHistory(
    infinitives,
    lastVerbs,
    maxHistory
  );

  const verb = todos_verbos.find((v) => v[0] === chosenInfinitive);
  return { verb, newLastVerbs: newHistory };
}

/**
 * Randomly selects the grammatical person (1, 2, or 3).
 * Person 2 is only included when isTu is enabled — mirroring setPerson().
 */
export function pickPerson(isTu) {
  const options = isTu ? [1, 2, 3] : [1, 3];
  return randomFrom(options);
}

/** Randomly selects singular or plural — mirrors setNumerus(). */
export function pickNumerus() {
  return Math.random() < 0.5 ? 'singular' : 'plural';
}

/**
 * Returns the Portuguese pronoun label for a given (person, numerus) pair.
 * Mirrors the personText assignment inside newRound().
 */
export function getPersonText(person, numerus) {
  if (numerus === 'plural') {
    if (person === 1) return 'nós';
    if (person === 2) return 'vós';
    return 'eles/elas/vocês';
  }
  if (person === 1) return 'eu';
  if (person === 2) return 'tu';
  return 'ele/ela/você';
}
