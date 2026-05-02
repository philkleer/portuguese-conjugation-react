/**
 * useExercise.js
 *
 * Central React hook that drives the training session. Manages:
 *  - current round (verb, tense, person, numerus, personText)
 *  - the user's typed answer (hint)
 *  - feedback after checking (correct/wrong + the expected answer)
 *  - session score
 *
 * The history arrays (lastTenses, lastVerbs) live in refs so that
 * `startNewRound` never captures a stale closure.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { generateRound } from '../engine/generator.js';
import { trainTarget } from '../engine/conjugate.js';

/**
 * @param {object} settings - the current user settings object
 */
export default function useExercise(settings) {
  // Keep settings accessible inside callbacks without stale-closure issues.
  const settingsRef    = useRef(settings);
  const lastTensesRef  = useRef([]);
  const lastVerbsRef   = useRef([]);

  const [round,    setRound]    = useState(null);
  const [hint,     setHint]     = useState('');
  // feedback: null while waiting for input, or { correct: bool, target: string }
  const [feedback, setFeedback] = useState(null);
  const [score,    setScore]    = useState({ correct: 0, wrong: 0 });

  // Sync settingsRef and reset history whenever the user changes settings.
  useEffect(() => {
    settingsRef.current   = settings;
    lastTensesRef.current = [];
    lastVerbsRef.current  = [];
  }, [settings]);

  /** Generates a new round and resets input / feedback. */
  const startNewRound = useCallback(() => {
    const r = generateRound(
      settingsRef.current,
      lastTensesRef.current,
      lastVerbsRef.current,
    );

    lastTensesRef.current = r.newLastTenses;
    lastVerbsRef.current  = r.newLastVerbs;

    setRound({
      tense:      r.tense,
      verb:       r.verb,
      verbHelper: r.verbHelper,
      person:     r.person,
      numerus:    r.numerus,
      personText: r.personText,
    });
    setHint('');
    setFeedback(null);
  }, []); // no deps — always reads from refs

  // Kick off the very first round when the hook mounts.
  useEffect(() => {
    startNewRound();
  }, [startNewRound]);

  /**
   * Checks the user's answer against the conjugation engine and stores the
   * feedback. Mirrors the "Teste" button action in trainView.
   */
  const submitAnswer = useCallback(() => {
    if (!round || !hint.trim()) return;

    const target    = trainTarget(round.person, round.numerus, round.tense, round.verbHelper);
    const isCorrect = hint.trim() === target;

    setFeedback({ correct: isCorrect, target });
  }, [round, hint]);

  /**
   * Dismisses the feedback, records the result, and starts the next round.
   * `countAsCorrect` lets the caller decide whether a typo should count as a
   * correct answer — mirroring the two "wrong" alert buttons in Swift.
   *
   * @param {boolean} countAsCorrect
   */
  const confirmResult = useCallback((countAsCorrect) => {
    setScore((s) => ({
      correct: s.correct + (countAsCorrect ? 1 : 0),
      wrong:   s.wrong   + (countAsCorrect ? 0 : 1),
    }));
    startNewRound();
  }, [startNewRound]);

  const resetScore = useCallback(() => setScore({ correct: 0, wrong: 0 }), []);

  return {
    round,
    hint,
    setHint,
    feedback,
    submitAnswer,
    confirmResult,
    score,
    resetScore,
    startNewRound,
  };
}
