/**
 * SettingsPanel.jsx
 *
 * Full translation of optionsView.swift. Renders all toggles for:
 *  - person (include tu / vocês)
 *  - verb groups (regulares / irregulares)
 *  - tenses (indicativo, subjuntivo, condicional)
 *
 * Enforces the same guards as the Swift original:
 *  - atLeastOneTempus() — at least one tense must stay enabled
 *  - atLeastOneVerbGroup() — at least one verb group must stay enabled
 */

const TENSES = [
  {
    group: 'Indicativo',
    items: [
      { label: 'Presente Indicativo', key: 'isPresenteInd' },
      { label: 'Pretérito Perfeito Simples Indicativo', key: 'isPerfeitoInd' },
      { label: 'Pretérito Imperfeito Indicativo', key: 'isImperfeitoInd' },
      { label: 'Pretérito Perfeito Composto Indicativo', key: 'isPerfeitoCompInd' },
      { label: 'Pretérito Mais-que-Perfeito Composto Indicativo', key: 'isPMQPCompInd' },
      { label: 'Pretérito Mais-que-Perfeito Indicativo', key: 'isPMQPInd' },
      { label: 'Futuro Simples Indicativo', key: 'isFuturoIInd' },
      { label: 'Futuro Composto Indicativo', key: 'isFuturoIIInd' },
    ],
  },
  {
    group: 'Subjuntivo',
    items: [
      { label: 'Presente Subjuntivo', key: 'isPresenteSub' },
      { label: 'Pretérito Perfeito Simples Subjuntivo', key: 'isPerfeitoSub' },
      { label: 'Pretérito Imperfeito Subjuntivo', key: 'isImperfeitoSub' },
      { label: 'Pretérito Mais-que-Perfeito Subjuntivo', key: 'isPMQPSub' },
      { label: 'Futuro Simples Subjuntivo', key: 'isFuturoISub' },
      { label: 'Futuro Composto Subjuntivo', key: 'isFuturoIISub' },
    ],
  },
  {
    group: 'Condicional',
    items: [
      { label: 'Futuro do Préterito (Condicional I)', key: 'isCondicionalI' },
      { label: 'Futuro do Préterito Composto (Condicional II)', key: 'isCondicionalII' },
    ],
  },
];

const TENSE_KEYS = TENSES.flatMap((g) => g.items.map((i) => i.key));

export default function SettingsPanel({ settings, onChange, onBack }) {
  /** Mirrors atLeastOneTempus() — re-enables Presente Indicativo if all off. */
  function handleTenseChange(key, value) {
    const next = { ...settings, [key]: value };
    const anyOn = TENSE_KEYS.some((k) => next[k]);
    if (!anyOn) next.isPresenteInd = true;
    onChange(next);
  }

  /** Mirrors atLeastOneVerbGroup() — prevents turning off the last group. */
  function handleVerbGroupChange(key, value) {
    const next = { ...settings, [key]: value };
    if (!next.regulares && !next.irregulares) {
      // Revert: keep the setting that was true before
      next[key] = true;
    }
    onChange(next);
  }

  return (
    <div className="settings-panel">
      <div className="settings-panel__header">
        <button className="btn btn--icon" onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <h2 className="settings-panel__title">Opções</h2>
      </div>

      <div className="settings-panel__body">
        {/* ── Pessoas ── */}
        <section className="settings-section">
          <h3 className="settings-section__title">Pessoas</h3>
          <ToggleRow
            label="Incluir tu e vocês"
            checked={settings.isTu}
            onChange={(v) => onChange({ ...settings, isTu: v })}
          />
        </section>

        {/* ── Verbos ── */}
        <section className="settings-section">
          <h3 className="settings-section__title">Verbos</h3>
          <ToggleRow
            label="Verbos regulares"
            checked={settings.regulares}
            onChange={(v) => handleVerbGroupChange('regulares', v)}
          />
          <ToggleRow
            label="Verbos irregulares"
            checked={settings.irregulares}
            onChange={(v) => handleVerbGroupChange('irregulares', v)}
          />
        </section>

        {/* ── Tenses (grouped) ── */}
        {TENSES.map(({ group, items }) => (
          <section className="settings-section" key={group}>
            <h3 className="settings-section__title">{group}</h3>
            {items.map(({ label, key }) => (
              <ToggleRow
                key={key}
                label={label}
                checked={settings[key]}
                onChange={(v) => handleTenseChange(key, v)}
              />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

/** Reusable toggle row — replaces SwiftUI Toggle. */
function ToggleRow({ label, checked, onChange }) {
  const id = `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <label className="toggle-row" htmlFor={id}>
      <span className="toggle-row__label">{label}</span>
      <span className={`toggle-switch ${checked ? 'toggle-switch--on' : ''}`}>
        <input
          id={id}
          type="checkbox"
          className="toggle-switch__input"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle-switch__track">
          <span className="toggle-switch__thumb" />
        </span>
      </span>
    </label>
  );
}
