/**
 * Translation typing, written without relying on module augmentation so every TypeScript
 * version and editor resolves it the same way.
 *
 * The English files are the source of truth for the shape of `Messages`. `src/messages/index.ts`
 * fails to compile when another locale is missing a key or has an extra one.
 */
import type { messages } from '@/messages';

/** Shape of every locale: `{ common: { ... }, health: { ... } }`. */
export type Messages = (typeof messages)['en'];

/** Dotted paths to every translatable string: `'common.actions.retry'`. */
export type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

/** Dotted paths to every group of strings: `'common'`, `'common.actions'`. */
export type Branches<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? never : `${Prefix}${K}` | Branches<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

type Get<T, Path extends string> = Path extends `${infer Head}.${infer Rest}`
  ? Head extends keyof T
    ? Get<T[Head], Rest>
    : never
  : Path extends keyof T
    ? T[Path]
    : never;

/** Namespaces accepted by `useTranslations(...)`: any group of messages. */
export type Namespace = Branches<Messages>;

/** Keys available inside a namespace, or the full dotted path when there is none. */
export type TranslationKey<NS extends Namespace | undefined = undefined> = NS extends Namespace
  ? Leaves<Get<Messages, NS>>
  : Leaves<Messages>;

export type TranslationValues = Record<string, string | number | boolean | Date | null | undefined>;

export interface Translator<NS extends Namespace | undefined = undefined> {
  (key: TranslationKey<NS>, values?: TranslationValues): string;
  /** `true` when the key exists in the active locale. */
  has: (key: TranslationKey<NS>) => boolean;
  /** Raw message (no ICU formatting), useful for arrays or objects stored in JSON. */
  raw: (key: TranslationKey<NS>) => unknown;
}
