/**
 * generator.js
 *
 * Combines all the filter functions into a single `generateRound()` call.
 * Mirrors the Swift `newRound()` wrapper function in trainView.
 */

import {
  buildTenseList,
  pickTense,
  buildVerbArray,
  pickVerb,
  pickPerson,
  pickNumerus,
  getPersonText,
} from './filters.js';

/**
 * Generates all the data needed to start a new conjugation round.
 *
 * @param {object}   settings      - current user settings (enabled tenses, verb groups, isTu)
 * @param {string[]} lastTenses    - history of recently used tenses
 * @param {string[]} lastVerbs     - history of recently used verb infinitives
 *
 * @returns {{
 *   tense:         string,
 *   verb:          string,
 *   verbHelper:    string[],
 *   person:        1|2|3,
 *   numerus:       'singular'|'plural',
 *   personText:    string,
 *   newLastTenses: string[],
 *   newLastVerbs:  string[],
 * }}
 */
export function generateRound(settings, lastTenses, lastVerbs) {
  const todos_tempos = buildTenseList(settings);
  const todos_verbos = buildVerbArray(settings);

  const { tense, newLastTenses } = pickTense(todos_tempos, lastTenses);
  const { verb, newLastVerbs } = pickVerb(todos_verbos, lastVerbs);

  const person = pickPerson(settings.isTu);
  const numerus = pickNumerus();
  const personText = getPersonText(person, numerus);

  return {
    tense,
    verb: verb[0],      // infinitive string shown to the user
    verbHelper: verb,         // [infinitive, classKey] used by the conjugation engine
    person,
    numerus,
    personText,
    newLastTenses,
    newLastVerbs,
  };
}
