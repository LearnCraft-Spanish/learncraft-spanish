export enum PreSetQuizPreset {
  SerEstar = 'Ser/Estar',
  Subjunctives = 'Subjunctives',
  Idioms = 'Idioms',
  PorPara = 'Por/Para',
  None = 'None',
}

export interface PreSetQuiz {
  preset: PreSetQuizPreset;
  SkillTagKeys: string[];
}

export const preSetQuizzes: PreSetQuiz[] = [
  {
    preset: PreSetQuizPreset.None,
    SkillTagKeys: [],
  },
  {
    preset: PreSetQuizPreset.SerEstar,
    SkillTagKeys: ['Verb-1', 'Verb-5'],
  },
  {
    preset: PreSetQuizPreset.Subjunctives,
    SkillTagKeys: [
      'Conjugation-Subjunctive past',
      'Conjugation-Subjunctive present',
    ],
  },
  {
    preset: PreSetQuizPreset.Idioms,
    SkillTagKeys: ['Subcategory-49'],
  },
  {
    preset: PreSetQuizPreset.PorPara,
    SkillTagKeys: [
      'Vocabulary-1',
      'Vocabulary-50',
      'Vocabulary-51',
      'Vocabulary-52',
      'Vocabulary-53',
      'Vocabulary-54',
      'Vocabulary-55',
      'Vocabulary-56',
      'Vocabulary-58',
      'Vocabulary-302',
      'Vocabulary-354',
      'Vocabulary-428',
      'Vocabulary-1627',
      'Vocabulary-1928',
      'Vocabulary-2049',
      'Vocabulary-2591',
      'Vocabulary-3290',
      'Idiom-57',
      'Idiom-59',
      'Idiom-165',
      'Idiom-361',
      'Idiom-362',
      'Idiom-367',
      'Idiom-1116',
      'Idiom-1185',
      'Idiom-1243',
      'Idiom-1424',
      'Idiom-1425',
      'Idiom-1612',
      'Idiom-1624',
      'Idiom-1839',
      'Idiom-1857',
      'Idiom-2050',
      'Idiom-2113',
      'Idiom-2560',
      'Idiom-2679',
      'Idiom-3292',
      'Idiom-3347',
      'Idiom-351',
      'Idiom-1852',
      'Idiom-1853',
      'Idiom-1854',
      'Idiom-1856',
      'Idiom-2564',
    ],
  },
];
