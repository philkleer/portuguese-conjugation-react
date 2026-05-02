/**
 * AnswerInput.jsx
 *
 * Renders the text input and submit button, plus the inline feedback card
 * that replaces the Swift Alert dialog. The feedback card offers the same
 * three response options as the original:
 *  - Correct:  "Joia! 👍🏾" → counts as correct
 *  - Wrong:    "Que pena! ☹️" → counts as wrong
 *  - Wrong:    "Erro de digitação! 🤦🏽‍♂️" → counts as correct (typo)
 */

import { useEffect, useRef } from 'react';

export default function AnswerInput({ hint, setHint, feedback, submitAnswer, confirmResult }) {
  const inputRef = useRef(null);

  // Auto-focus the input when a new round starts (feedback is null).
  useEffect(() => {
    if (!feedback && inputRef.current) inputRef.current.focus();
  }, [feedback]);

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    if (!feedback && hint.trim()) { submitAnswer(); return; }
    if (feedback) confirmResult(feedback.correct);
  };

  return (
    <div className="answer-section">
      {/* ── Input row ── */}
      <div className="answer-input-row">
        <input
          ref={inputRef}
          className="answer-input"
          type="text"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite a conjugação ..."
          disabled={!!feedback}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />
        <button
          className="btn btn--primary"
          onClick={submitAnswer}
          disabled={!hint.trim() || !!feedback}
        >
          Testar
        </button>
      </div>

      {/* ── Feedback card ── */}
      {feedback && (
        <div className={`feedback-card feedback-card--${feedback.correct ? 'correct' : 'wrong'}`}>
          {feedback.correct ? (
            <>
              <p className="feedback-card__message">✅ Arrasou! A sua dica foi correta. 🚀</p>
              <div className="feedback-card__actions">
                <button className="btn btn--success" onClick={() => confirmResult(true)}>
                  Joia! 👍🏾
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="feedback-card__message">
                🙅🏽‍♂️ Esta vez não! ❌
              </p>
              <p className="feedback-card__correct">
                A forma correta é:&nbsp;<strong>{feedback.target}</strong>
              </p>
              <div className="feedback-card__actions">
                <button className="btn btn--danger" onClick={() => confirmResult(false)}>
                  Que pena! ☹️
                </button>
                <button className="btn btn--outline" onClick={() => confirmResult(true)}>
                  Erro de digitação! 🤦🏽‍♂️
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
