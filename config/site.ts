import type { Localized } from '@/types/i18n'
import type { ThemeAccent } from '@/types/tool'

/**
 * Everything a site owner should ever need to change lives here or in
 * `config/tools.ts`. Components read this object; they never hard-code copy,
 * links or feature availability.
 */
export interface SiteConfig {
  /** Brand wordmark. Rendered next to the logo slot in the header. */
  name: Localized
  brand: {
    /**
     * Path to an image under `public/`, e.g. `/logo.svg`. Leave `null` to use
     * the generated gradient mark instead — no component edit either way.
     */
    logoSrc: string | null
    /** Alt text for `logoSrc`. Ignored when the generated mark is used. */
    logoAlt: Localized
  }
  /** One-line positioning statement, used in metadata and the hero. */
  slogan: Localized
  /** Longer description for `<meta name="description">`. */
  description: Localized
  /** Site-wide default accent ramp. Users can override it at runtime. */
  defaultAccent: ThemeAccent
  hero: {
    title: Localized
    subtitle: Localized
    primaryCta: { label: Localized; href: string }
    secondaryCta: { label: Localized; href: string }
    /** Whether the hero can be dismissed and remembered in localStorage. */
    dismissible: boolean
  }
  footer: {
    links: ReadonlyArray<{ label: Localized; href: string; external?: boolean }>
  }
  /** How many entries the command palette's "Recent" group keeps. */
  recentLimit: number
  features: {
    showHero: boolean
    enableCommandPalette: boolean
    enableDensityToggle: boolean
    enableAccentPicker: boolean
  }
}

export const siteConfig: SiteConfig = {
  name: { zh: '工具箱', en: 'Toolbox' },

  brand: {
    logoSrc: null,
    logoAlt: { zh: '工具箱标志', en: 'Toolbox logo' },
  },

  slogan: {
    zh: '把常用工具收进一个地方，键盘一按就到。',
    en: 'Every tool you reach for, one keystroke away.',
  },

  description: {
    zh: '一个纯前端的个人工具站：所有数据留在本机，不上传、不追踪。',
    en: 'A client-only personal toolbox. Nothing is uploaded, nothing is tracked.',
  },

  defaultAccent: 'indigo',

  hero: {
    title: {
      zh: '你的工具，一个入口',
      en: 'One entry point for every tool',
    },
    subtitle: {
      // The ⌘K story is told by the hint line under the buttons, which picks
      // the right glyph per platform at runtime. Config copy cannot, so it
      // stays out of the way and says what the page is instead.
      zh: '常用的网页都收在这里，按分组平铺，一眼就能点进去。收藏与最近使用只留在这台设备上。',
      en: 'Every page you keep coming back to, laid out by group and one click away. Pins and history never leave this device.',
    },
    primaryCta: {
      label: { zh: '浏览全部工具', en: 'Browse all tools' },
      href: '#all-tools',
    },
    secondaryCta: {
      label: { zh: '关于本站', en: 'About this site' },
      href: 'about',
    },
    dismissible: true,
  },

  footer: {
    links: [
      { label: { zh: '关于', en: 'About' }, href: 'about' },
      {
        label: { zh: '源码', en: 'Source' },
        href: 'https://github.com/luoyi0000000/onlyforluoyi001',
        external: true,
      },
    ],
  },

  recentLimit: 6,

  features: {
    showHero: true,
    enableCommandPalette: true,
    enableDensityToggle: true,
    enableAccentPicker: true,
  },
}

/** localStorage keys. Namespaced so the site never collides with anything else. */
export const storageKeys = {
  theme: 'toolbox.theme',
  locale: 'toolbox.locale',
  density: 'toolbox.density',
  accent: 'toolbox.accent',
  favorites: 'toolbox.favorites',
  recent: 'toolbox.recent',
  heroDismissed: 'toolbox.hero-dismissed',
} as const
