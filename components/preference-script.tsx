import { siteConfig, storageKeys } from '@/config/site'
import { themeAccents } from '@/types/tool'

const densities = ['comfortable', 'compact'] as const

/**
 * Synchronous pre-paint script for accent, density and the hero's collapsed
 * state.
 *
 * These live outside next-themes, so they need their own blocking read of
 * localStorage: without it the first frame renders with the server defaults and
 * then visibly snaps to the stored preference. Runs as the first child of
 * <body>, before any content is painted.
 *
 * This is the only inline script on the site. It is also the sole reason the
 * recommended CSP needs `script-src 'unsafe-inline'` — a nonce cannot be minted
 * for a prerendered static file.
 */
export function PreferenceScript() {
  const accentPattern = `^(${themeAccents.join('|')})$`
  const densityPattern = `^(${densities.join('|')})$`
  // Only honoured while the hero can actually be reopened; otherwise a stale
  // value would hide the panel with no control left to bring it back.
  const heroDismissible = siteConfig.features.showHero && siteConfig.hero.dismissible

  const script = [
    '(function(){try{',
    'var d=document.documentElement,s=window.localStorage;',
    `var a=s.getItem(${JSON.stringify(storageKeys.accent)});`,
    `if(a&&new RegExp(${JSON.stringify(accentPattern)}).test(a))d.setAttribute("data-accent",a);`,
    `var n=s.getItem(${JSON.stringify(storageKeys.density)});`,
    `if(n&&new RegExp(${JSON.stringify(densityPattern)}).test(n))d.setAttribute("data-density",n);`,
    ...(heroDismissible
      ? [
          `var h=s.getItem(${JSON.stringify(storageKeys.heroDismissed)});`,
          'if(h==="1")d.setAttribute("data-hero","dismissed");',
        ]
      : []),
    '}catch(e){}})()',
  ].join('')

  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
