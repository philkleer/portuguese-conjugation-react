export function conjugate(verb, tense, person, data) {
  // 1. Special case: participio
  if (tense === "participio") {
    return getParticipio(verb, data);
  }

  // 2. Irregular override
  if (
    data.irregulars[tense] &&
    data.irregulars[tense][verb] &&
    data.irregulars[tense][verb][person]
  ) {
    return data.irregulars[tense][verb][person];
  }

  // 3. Regular conjugation
  const group = data.verbs[verb].group;
  const stem = verb.slice(0, -2);
  const ending = data.endings[tense][group][person];

  return stem + ending;
}

function getParticipio(verb, data) {
  if (
    data.irregulars.participio &&
    data.irregulars.participio[verb]
  ) {
    return data.irregulars.participio[verb];
  }

  const group = data.verbs[verb].group;
  return verb.slice(0, -2) + data.endings.participio[group];
}
