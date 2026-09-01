/** The two locales the site is statically exported for. */
export const locales = ['zh', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'zh'

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** Every user-facing string in the config layer carries both languages. */
export type Localized = Record<Locale, string>

/** `<html lang>` values and the labels shown in the language switcher. */
export const localeMeta: Record<Locale, { htmlLang: string; label: string; shortLabel: string }> = {
  zh: { htmlLang: 'zh-Hans', label: '简体中文', shortLabel: '中' },
  en: { htmlLang: 'en', label: 'English', shortLabel: 'EN' },
}
