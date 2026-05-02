/**
 * conjugate.js
 *
 * Core conjugation engine. Translates the Swift `trainTarget`, `buildPerfeitoHelper`,
 * and `buildPresenteHelper` functions into JavaScript.
 *
 * Convention (mirroring Swift):
 *   verbo[0]  = infinitive string, e.g. "fazer"
 *   verbo[1]  = verb class key, e.g. "fazer" | "ar" | "er" | "ir" | "estar" | "ira" |
 *               "ser" | "vir" | "ver" | "ter" | "por" | "trazer" | "saber" |
 *               "poder" | "querer"
 *   pessoa    = 1 | 2 | 3
 *   numero    = "singular" | "plural"
 *   caso      = tense name string (e.g. "Presente Indicativo")
 */

import endings from '../data/endings.json';
import irregulars from '../data/irregulars.json';

const { auxiliaries, participios, indicativo, subjuntivo, condicional, partialIrregulars } = endings;

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Drop the last `n` characters of a string (mirrors Swift's String.dropLast). */
const dropLast = (str, n) => str.slice(0, -n);

/** Return the last `n` characters of a string (mirrors Swift's String.suffix). */
const suffix = (str, n) => str.slice(-n);

/**
 * Map (pessoa, numero) to a 0-based array index.
 *   singular: pessoa 1→0, 2→1, 3→2
 *   plural:   pessoa 1→3, 2→4, 3→5
 */
const toIndex = (pessoa, numero) => numero === 'singular' ? pessoa - 1 : pessoa + 2;

// ─── stem helpers ────────────────────────────────────────────────────────────

/**
 * buildPerfeitoHelper
 *
 * Derives a stem from the 3rd-person plural Pretérito Perfeito Simples, then
 * drops `cair` characters from the end. Used by several other tenses (PMQP,
 * Imperfeito Subjuntivo, Futuro Subjuntivo).
 */
export function buildPerfeitoHelper(verbo, cair) {
  const form = trainTarget(3, 'plural', 'Pretérito Perfeito Simples Indicativo', verbo);
  return dropLast(form, cair);
}

/**
 * buildPresenteHelper
 *
 * Derives a stem from the 1st-person singular Presente Indicativo, then drops
 * `cair` characters from the end. Used by Presente Subjuntivo.
 */
export function buildPresenteHelper(verbo, cair) {
  const form = trainTarget(1, 'singular', 'Presente Indicativo', verbo);
  return dropLast(form, cair);
}

// ─── main conjugation function ───────────────────────────────────────────────

/**
 * trainTarget
 *
 * Returns the correctly conjugated form of `verbo` for the given `pessoa`,
 * `numero`, and `caso` (tense). Returns an empty string if the combination
 * is not yet handled.
 *
 * @param {1|2|3}             pessoa
 * @param {"singular"|"plural"} numero
 * @param {string}            caso   – tense name
 * @param {[string, string]}  verbo  – [infinitive, classKey]
 * @returns {string}
 */
export function trainTarget(pessoa, numero, caso, verbo) {
  let alvo = '';
  let raiz = '';
  let ajuda_verbo = '';
  let ajuda_verbo_perfeito = '';

  const i = toIndex(pessoa, numero);   // array index 0-5

  // ── Presente Indicativo ────────────────────────────────────────────────────
  if (caso === 'Presente Indicativo') {
    raiz = dropLast(verbo[0], 2);

    if (verbo[1] === 'ar') {
      if (suffix(verbo[0], 3) === 'ear') {
        alvo = raiz + indicativo.presente.ear[i];
      } else {
        alvo = raiz + indicativo.presente.ar[i];
      }

    } else if (
      verbo[1] === 'er' || verbo[1] === 'saber' || verbo[1] === 'poder' ||
      verbo[1] === 'perder' || verbo[1] === 'dizer' || verbo[1] === 'querer' ||
      verbo[1] === 'fazer' || verbo[1] === 'trazer'
    ) {
      if (i === 0 && suffix(verbo[0], 3) === 'cer') {
        raiz = dropLast(verbo[0], 3);
        alvo = raiz + partialIrregulars.presenteCer[i];
      } else if (i === 0 && verbo[0] === 'saber') {
        alvo = partialIrregulars.presenteSaber[i];
      } else if (i === 0 && verbo[0] === 'poder') {
        alvo = partialIrregulars.presentePoder[i];
      } else if (i === 0 && verbo[0] === 'perder') {
        alvo = partialIrregulars.presentePerder[i];
      } else if (i === 2 && verbo[0] === 'querer') {
        alvo = partialIrregulars.presenteQuerer[i];
      } else if ((i === 0 || i === 2) && verbo[0] === 'dizer') {
        alvo = partialIrregulars.presenteDizer[i];
      } else if ((i === 0 || i === 2) && verbo[0] === 'fazer') {
        alvo = partialIrregulars.presenteFazer[i];
      } else if ((i === 0 || i === 2) && verbo[0] === 'trazer') {
        alvo = partialIrregulars.presenteTrazer[i];
      } else if (verbo[0] === 'ler') {
        alvo = irregulars.presenteIndicativo.ler[i];
      } else {
        alvo = raiz + indicativo.presente.er[i];
      }

    } else if (verbo[1] === 'ir') {
      if (suffix(verbo[0], 3) === 'air') {
        raiz = dropLast(verbo[0], 3);
        alvo = raiz + partialIrregulars.presenteAir[i];
      } else if (i === 0 && verbo[0] === 'dormir') {
        alvo = partialIrregulars.presenteDormir[i];
      } else if (i === 0 && (verbo[0] === 'mentir' || verbo[0] === 'sentir')) {
        raiz = dropLast(verbo[0], 5);
        alvo = raiz + partialIrregulars.presenteEntir[i];
      } else if (i === 0 && verbo[0] === 'servir') {
        raiz = dropLast(verbo[0], 5);
        alvo = raiz + partialIrregulars.presenteErvir[i];
      } else {
        alvo = raiz + indicativo.presente.ir[i];
      }

    } else if (verbo[1] === 'ira') { alvo = irregulars.presenteIndicativo.ira[i]; }
    else if (verbo[1] === 'ser') { alvo = irregulars.presenteIndicativo.ser[i]; }
    else if (verbo[1] === 'estar') { alvo = irregulars.presenteIndicativo.estar[i]; }
    else if (verbo[1] === 'vir') { alvo = irregulars.presenteIndicativo.vir[i]; }
    else if (verbo[1] === 'ver') { alvo = irregulars.presenteIndicativo.ver[i]; }
    else if (verbo[1] === 'ter') { alvo = irregulars.presenteIndicativo.ter[i]; }
    else if (verbo[1] === 'por') { alvo = irregulars.presenteIndicativo.por[i]; }

    // ── Pretérito Perfeito Simples Indicativo ────────────────────────────────
  } else if (caso === 'Pretérito Perfeito Simples Indicativo') {
    raiz = dropLast(verbo[0], 2);

    if (verbo[1] === 'ar') {
      alvo = raiz + indicativo.perfeito.ar[i];

    } else if (verbo[1] === 'er') {
      if (verbo[0] === 'dizer') {
        raiz = dropLast(verbo[0], 3);                           // "di"
        alvo = raiz + irregulars.perfeitoIndicativo.dizer[i]; // "disse", etc.
      } else {
        alvo = raiz + indicativo.perfeito.er[i];
      }

    } else if (verbo[1] === 'ir' || verbo[1] === 'ver') {
      if (suffix(verbo[0], 3) === 'air') {
        raiz = dropLast(verbo[0], 2);
        alvo = raiz + indicativo.perfeito.air[i];
      } else {
        alvo = raiz + indicativo.perfeito.ir[i];
      }

    } else if (verbo[1] === 'ser' || verbo[1] === 'ira') { alvo = irregulars.perfeitoIndicativo.ser[i]; }
    else if (verbo[1] === 'estar') { alvo = irregulars.perfeitoIndicativo.estar[i]; }
    else if (verbo[1] === 'vir') { alvo = irregulars.perfeitoIndicativo.vir[i]; }
    else if (verbo[1] === 'ter') { alvo = irregulars.perfeitoIndicativo.ter[i]; }
    else if (verbo[1] === 'fazer') { alvo = irregulars.perfeitoIndicativo.fazer[i]; }
    else if (verbo[1] === 'trazer') { alvo = irregulars.perfeitoIndicativo.trazer[i]; }
    else if (verbo[1] === 'saber') { alvo = irregulars.perfeitoIndicativo.saber[i]; }
    else if (verbo[1] === 'poder') { alvo = irregulars.perfeitoIndicativo.poder[i]; }
    else if (verbo[1] === 'querer') { alvo = irregulars.perfeitoIndicativo.querer[i]; }
    else if (verbo[1] === 'por') { alvo = irregulars.perfeitoIndicativo.por[i]; }

    // ── Pretérito Imperfeito Indicativo ──────────────────────────────────────
  } else if (caso === 'Pretérito Imperfeito Indicativo') {
    raiz = dropLast(verbo[0], 2);

    if (verbo[1] === 'ar' || verbo[1] === 'estar') {
      alvo = raiz + indicativo.imperfeito.ar[i];
    } else if (
      verbo[1] === 'er' || verbo[1] === 'ver' || verbo[1] === 'fazer' ||
      verbo[1] === 'trazer' || verbo[1] === 'saber' || verbo[1] === 'poder' ||
      verbo[1] === 'querer'
    ) {
      alvo = raiz + indicativo.imperfeito.er[i];
    } else if (verbo[1] === 'ir' || verbo[1] === 'ira') {
      if (suffix(verbo[0], 3) === 'air') {
        alvo = raiz + indicativo.imperfeito.air[i];
      } else {
        alvo = raiz + indicativo.imperfeito.ir[i];
      }
    } else if (verbo[1] === 'ser') { alvo = irregulars.imperfeitoIndicativo.ser[i]; }
    else if (verbo[1] === 'vir') { alvo = irregulars.imperfeitoIndicativo.vir[i]; }
    else if (verbo[1] === 'ter') { alvo = irregulars.imperfeitoIndicativo.ter[i]; }
    else if (verbo[1] === 'por') { alvo = irregulars.imperfeitoIndicativo.por[i]; }

    // ── Pretérito Perfeito Composto Indicativo ───────────────────────────────
  } else if (caso === 'Pretérito Perfeito Composto Indicativo') {
    ajuda_verbo = auxiliaries.ppcHv[i];
    raiz = dropLast(verbo[0], 2);
    alvo = buildCompostoForm(ajuda_verbo, raiz, verbo, participios);

    // ── Pretérito Mais-que-Perfeito Composto Indicativo ──────────────────────
  } else if (caso === 'Pretérito Mais-que-Perfeito Composto Indicativo') {
    ajuda_verbo = auxiliaries.pmqpHv[i];
    raiz = dropLast(verbo[0], 2);
    alvo = buildCompostoForm(ajuda_verbo, raiz, verbo, participios);

    // ── Pretérito Mais-que-Perfeito Indicativo ───────────────────────────────
  } else if (caso === 'Pretérito Mais-que-Perfeito Indicativo') {
    if (i === 3 || i === 4) {
      ajuda_verbo_perfeito = buildPerfeitoHelper(verbo, 4);
      if (
        verbo[1] === 'estar' || verbo[1] === 'vir' || verbo[1] === 'ter' ||
        verbo[1] === 'fazer' || verbo[0] === 'dizer' || verbo[1] === 'trazer' ||
        verbo[1] === 'saber' || verbo[1] === 'poder' || verbo[1] === 'querer' ||
        verbo[1] === 'por'
      ) {
        alvo = ajuda_verbo_perfeito + indicativo.pmqp.er2[i];
      } else if (verbo[1] === 'ar') {
        alvo = ajuda_verbo_perfeito + indicativo.pmqp.ar[i];
      } else if (verbo[1] === 'er') {
        alvo = ajuda_verbo_perfeito + indicativo.pmqp.er[i];
      } else if (verbo[1] === 'ir' || verbo[1] === 'ver') {
        alvo = ajuda_verbo_perfeito + indicativo.pmqp.ir[i];
      } else if (verbo[1] === 'ser' || verbo[1] === 'ira') {
        alvo = ajuda_verbo_perfeito + indicativo.pmqp.ser[i];
      }
    } else {
      ajuda_verbo_perfeito = buildPerfeitoHelper(verbo, 2);
      alvo = ajuda_verbo_perfeito + indicativo.pmqp.common[i];
    }

    // ── Futuro Simples Indicativo ────────────────────────────────────────────
  } else if (caso === 'Futuro Simples Indicativo') {
    if (verbo[1] === 'fazer' || verbo[1] === 'trazer' || verbo[0] === 'dizer') {
      raiz = dropLast(verbo[0], 3);
      alvo = raiz + indicativo.futuroSimples.irr[i];
    } else if (verbo[1] === 'por') {
      alvo = indicativo.futuroSimples.por[i];
    } else {
      alvo = verbo[0] + indicativo.futuroSimples.regular[i];
    }

    // ── Futuro Composto Indicativo ───────────────────────────────────────────
  } else if (caso === 'Futuro Composto Indicativo') {
    ajuda_verbo = auxiliaries.futcomHv[i];
    raiz = dropLast(verbo[0], 2);
    alvo = buildCompostoForm(ajuda_verbo, raiz, verbo, participios);

    // ── Presente Subjuntivo ──────────────────────────────────────────────────
  } else if (caso === 'Presente Subjuntivo') {
    raiz = buildPresenteHelper(verbo, 1);

    if (verbo[1] === 'ar') {
      if (verbo[0] === 'pagar') {
        raiz = buildPresenteHelper(verbo, 1);
        alvo = raiz + 'u' + subjuntivo.presente.ar[i];
      } else if (verbo[0] === 'significar') {
        raiz = buildPresenteHelper(verbo, 2);
        alvo = raiz + 'qu' + subjuntivo.presente.ar[i];
      } else {
        alvo = raiz + subjuntivo.presente.ar[i];
      }
    } else if (
      verbo[1] === 'er' || verbo[1] === 'ir' || verbo[0] === 'dizer' ||
      verbo[1] === 'por' || verbo[1] === 'vir' || verbo[1] === 'ver' ||
      verbo[1] === 'ter' || verbo[1] === 'poder' || verbo[1] === 'saber' ||
      verbo[1] === 'querer' || verbo[1] === 'fazer' || verbo[1] === 'trazer'
    ) {
      if (verbo[1] === 'saber') {
        raiz = buildPresenteHelper(verbo, 2);
        alvo = raiz + 'aib' + subjuntivo.presente.erIr[i];
      } else if (verbo[1] === 'querer') {
        raiz = buildPresenteHelper(verbo, 2);
        alvo = raiz + 'ir' + subjuntivo.presente.erIr[i];
      } else {
        alvo = raiz + subjuntivo.presente.erIr[i];
      }
    } else if (suffix(verbo[0], 3) === 'ear') {
      alvo = raiz + subjuntivo.presente.ear[i];
    } else if (verbo[1] === 'ser' || verbo[1] === 'estar') {
      raiz = buildPresenteHelper(verbo, 2);
      alvo = raiz + subjuntivo.presente.serEstar[i];
    } else if (verbo[1] === 'ira') {
      alvo = subjuntivo.presente.ira[i];
    }

    // ── Pretérito Perfeito Simples Subjuntivo ────────────────────────────────
  } else if (caso === 'Pretérito Perfeito Simples Subjuntivo') {
    ajuda_verbo = auxiliaries.perfeitoSubHv[i];
    raiz = dropLast(verbo[0], 2);
    alvo = buildCompostoForm(ajuda_verbo, raiz, verbo, participios);

    // ── Pretérito Imperfeito Subjuntivo ──────────────────────────────────────
  } else if (caso === 'Pretérito Imperfeito Subjuntivo') {
    if (i === 3 || i === 4) {
      ajuda_verbo_perfeito = buildPerfeitoHelper(verbo, 4);
      if (verbo[1] === 'ar') {
        alvo = ajuda_verbo_perfeito + subjuntivo.imperfeito.ar[i];
      } else if (verbo[1] === 'er') {
        alvo = ajuda_verbo_perfeito + subjuntivo.imperfeito.er[i];
      } else if (verbo[1] === 'ir' || verbo[1] === 'ver') {
        alvo = ajuda_verbo_perfeito + subjuntivo.imperfeito.ir[i];
      } else if (verbo[1] === 'ser' || verbo[1] === 'ira') {
        alvo = ajuda_verbo_perfeito + subjuntivo.imperfeito.ser[i];
      } else if (
        verbo[1] === 'estar' || verbo[1] === 'vir' || verbo[1] === 'ter' ||
        verbo[1] === 'fazer' || verbo[0] === 'dizer' || verbo[1] === 'trazer' ||
        verbo[1] === 'saber' || verbo[1] === 'poder' || verbo[1] === 'querer' ||
        verbo[1] === 'por'
      ) {
        alvo = ajuda_verbo_perfeito + subjuntivo.imperfeito.er2[i];
      }
    } else {
      ajuda_verbo_perfeito = buildPerfeitoHelper(verbo, 3);
      alvo = ajuda_verbo_perfeito + subjuntivo.imperfeito.common[i];
    }

    // ── Pretérito Mais-que-Perfeito Subjuntivo ─────────────────────────────────
  } else if (caso === 'Pretérito Mais-que-Perfeito Subjuntivo') {
    ajuda_verbo = auxiliaries.pmqpCompSubHv[i];
    raiz = dropLast(verbo[0], 2);
    alvo = buildCompostoForm(ajuda_verbo, raiz, verbo, participios);

    // ── Futuro Simples Subjuntivo ──────────────────────────────────────────────
  } else if (caso === 'Futuro Simples Subjuntivo') {
    if (suffix(verbo[0], 3) === 'air') {
      ajuda_verbo_perfeito = buildPerfeitoHelper(verbo, 4);
      alvo = ajuda_verbo_perfeito + subjuntivo.futuro.air[i];
    } else {
      ajuda_verbo_perfeito = buildPerfeitoHelper(verbo, 2);
      alvo = ajuda_verbo_perfeito + subjuntivo.futuro.regular[i];
    }

    // ── Futuro Composto Subjuntivo ───────────────────────────────────────────
  } else if (caso === 'Futuro Composto Subjuntivo') {
    ajuda_verbo = auxiliaries.futuroCompSubHv[i];
    raiz = dropLast(verbo[0], 2);
    alvo = buildCompostoForm(ajuda_verbo, raiz, verbo, participios);

    // ── Futuro do Préterito / Condicional I ──────────────────────────────────
  } else if (caso === 'Futuro do Préterito (Condicional I)') {
    if (verbo[0] === 'dizer' || verbo[0] === 'trazer' || verbo[0] === 'fazer') {
      raiz = dropLast(verbo[0], 3);
      alvo = raiz + condicional.Irr[i];
    } else if (verbo[1] === 'por') {
      alvo = condicional.por[i];
    } else {
      alvo = verbo[0] + condicional.I[i];
    }

    // ── Futuro do Préterito Composto / Condicional II ────────────────────────
  } else if (caso === 'Futuro do Préterito Composto (Condicional II)') {
    ajuda_verbo = auxiliaries.condIIHv[i];
    raiz = dropLast(verbo[0], 2);
    alvo = buildCompostoForm(ajuda_verbo, raiz, verbo, participios);
  }

  return alvo;
}

// ─── shared helper for all compound (aux + participio) tenses ────────────────

/**
 * buildCompostoForm
 *
 * Used by all compound tenses (Perfeito Composto, PMQP Composto, etc.).
 * Picks the correct participio for the verb class and concatenates it with
 * the auxiliary verb.
 */
function buildCompostoForm(aux, raiz, verbo, part) {
  if (verbo[0] === 'dizer') return aux + ' ' + part.dizer;
  if (verbo[0] === 'abrir') return aux + ' ' + part.abrir;
  if (verbo[0] === 'fazer') return aux + ' ' + part.fazer;
  if (verbo[1] === 'ver') return aux + ' ' + part.ver;
  if (verbo[1] === 'vir') return aux + ' ' + raiz + part.vir;
  if (verbo[1] === 'por') return aux + ' ' + part.por;
  if (verbo[1] === 'ser') return aux + ' ' + raiz + part.er;

  if (verbo[1] === 'ar' || verbo[1] === 'estar') {
    return aux + ' ' + raiz + part.ar;
  }
  if (
    verbo[1] === 'er' || verbo[1] === 'trazer' || verbo[1] === 'saber' ||
    verbo[1] === 'poder' || verbo[1] === 'querer'
  ) {
    return aux + ' ' + raiz + part.er;
  }
  if (verbo[1] === 'ir' || verbo[1] === 'ira' || verbo[1] === 'ter') {
    if (verbo[0].slice(-3) === 'air') {
      const airStemm = verbo[0].slice(0, -2);
      return aux + ' ' + airStemm + part.air;
    }
    return aux + ' ' + raiz + part.ir;
  }

  return '';
}
