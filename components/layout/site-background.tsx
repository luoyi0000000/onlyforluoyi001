import type { CSSProperties } from 'react'

import { siteConfig } from '@/config/site'

type BackgroundStyle = CSSProperties & {
  '--site-background-image': string
  '--site-background-position': string
  '--site-background-position-mobile': string
}

/** Fixed, decorative and same-origin background configured in `config/site.ts`. */
export function SiteBackground() {
  const { imageSrc, position, mobilePosition } = siteConfig.background
  if (imageSrc === null) return null

  const style: BackgroundStyle = {
    '--site-background-image': `url(${JSON.stringify(imageSrc)})`,
    '--site-background-position': position,
    '--site-background-position-mobile': mobilePosition,
  }

  return <div className="site-background" style={style} aria-hidden="true" />
}
