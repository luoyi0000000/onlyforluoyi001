import { en } from '@/dictionaries/en'
import { zh, type Dictionary } from '@/dictionaries/zh'
import type { Locale, Localized } from '@/types/i18n'

const dictionaries: Record<Locale, Dictionary> = { zh, en }

/**
 * Every valid dot path through the dictionary, as a union of string literals.
 * `t(locale, 'nav.hme')` is a compile error, not a silent empty string.
 */
export type DictPath<T = Dictionary> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${DictPath<T[K]>}`
}[keyof T & string]

export type TranslateVars = Record<string, string | number>

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

function resolve(dict: Dictionary, path: string): string | undefined {
  let node: unknown = dict
  for (const key of path.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined
    node = (node as Record<string, unknown>)[key]
  }
  return typeof node === 'string' ? node : undefined
}

/** Replaces `{name}` placeholders. Unknown placeholders are left untouched. */
function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  )
}

export function translate(locale: Locale, path: DictPath, vars?: TranslateVars): string {
  const value = resolve(dictionaries[locale], path)
  if (value === undefined) {
    // Unreachable through the typed API; only a hand-rolled cast gets here.
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`[i18n] Missing dictionary key "${path}" for locale "${locale}".`)
    }
    return path
  }
  return interpolate(value, vars)
}

export type Translator = (path: DictPath, vars?: TranslateVars) => string

/** Bind a translator to one locale — the shape components receive. */
export function createTranslator(locale: Locale): Translator {
  return (path, vars) => translate(locale, path, vars)
}

/** Pick the active language out of a `{ zh, en }` pair from the config layer. */
export function pick(value: Localized, locale: Locale): string {
  return value[locale]
}
