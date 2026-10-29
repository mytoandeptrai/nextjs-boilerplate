import type { Locale } from '@/i18n/routing';
import enAuth from './en/auth.json';
import enCommon from './en/common.json';
import enHome from './en/home.json';
import enItem from './en/item.json';
import enLangName from './en/langName.json';
import enMessages from './en/messages.json';
import enNav from './en/nav.json';
import enValidation from './en/validation.json';
import viAuth from './vi/auth.json';
import viCommon from './vi/common.json';
import viHome from './vi/home.json';
import viItem from './vi/item.json';
import viLangName from './vi/langName.json';
import viMessages from './vi/messages.json';
import viNav from './vi/nav.json';
import viValidation from './vi/validation.json';

/**
 * Every message of every locale. Adding a locale or a namespace:
 *  1. create `src/messages/<locale>/<namespace>.json`
 *  2. import it here and register it below
 *  3. add the locale to `LOCALES` in `src/i18n/routing.ts`
 *
 * The compile-time check at the bottom makes the build fail when a locale does not
 * have exactly the same keys as English.
 */
export const messages = {
  en: {
    auth: enAuth,
    common: enCommon,
    home: enHome,
    item: enItem,
    langName: enLangName,
    messages: enMessages,
    nav: enNav,
    validation: enValidation,
  },
  vi: {
    auth: viAuth,
    common: viCommon,
    home: viHome,
    item: viItem,
    langName: viLangName,
    messages: viMessages,
    nav: viNav,
    validation: viValidation,
  },
} as const satisfies Record<Locale, unknown>;

/** Namespaces registered above. */
export const NAMESPACES = Object.keys(messages.en) as (keyof typeof messages.en)[];

/* -------------------------------------------------------------------------- */
/*                 Compile-time check: all locales share the same keys         */
/* -------------------------------------------------------------------------- */

type Paths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Paths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

type Reference = Paths<(typeof messages)['en']>;

type CheckLocale<L extends Locale> = [
  Exclude<Reference, Paths<(typeof messages)[L]>>,
  Exclude<Paths<(typeof messages)[L]>, Reference>,
] extends [never, never]
  ? true
  : {
      error: `Locale "${L}" must have exactly the same keys as "en"`;
      missing: Exclude<Reference, Paths<(typeof messages)[L]>>;
      extra: Exclude<Paths<(typeof messages)[L]>, Reference>;
    };

type Parity = { [L in Locale]: CheckLocale<L> };

/** If this line has a type error, read `missing` / `extra` in the message: those keys differ from English. */
export const localeParity: { [L in Locale]: true } = {} as Parity;
