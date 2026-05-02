/**
 * VerbDisplay.jsx
 *
 * Shows the conjugation prompt: verb, person, numerus, and tense.
 * Maps to the middle VStack in trainView.body.
 */

export default function VerbDisplay({ round }) {
  if (!round) return <div className="verb-display verb-display--loading">A carregar...</div>;

  const { verb, person, numerus, personText, tense } = round;

  return (
    <div className="verb-display">
      <p className="verb-display__prompt">Forme a conjugação de</p>
      <h1 className="verb-display__verb">{verb}</h1>
      <p className="verb-display__person">
        na&nbsp;<strong>{person}ª&nbsp;pessoa&nbsp;{numerus}</strong>&nbsp;
        <span className="verb-display__pronoun">({personText})</span>
      </p>
      <p className="verb-display__tense">de&nbsp;<em>{tense}</em></p>
    </div>
  );
}
