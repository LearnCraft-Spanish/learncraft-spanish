import type { CreateVerb, Verb } from '@learncraft-spanish/shared';

export interface VerbPort {
  getVerbs: () => Promise<Verb[]>;
  createVerb: (verb: CreateVerb) => Promise<Verb>;
}
