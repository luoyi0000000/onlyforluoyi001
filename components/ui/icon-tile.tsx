import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { AccentName } from '@/types/tool'

/**
 * The gradient square that carries a tool's icon.
 *
 * The colour comes from `[data-tile]` in `globals.css`, not from a class here,
 * so adding an accent ramp is a CSS-token change and the component never learns
 * a colour value. Glyphs are white on a capped-lightness gradient, which keeps
 * the 3:1 non-text contrast floor.
 */
const tileSizes = {
  sm: 'size-8 rounded-sm [&_svg]:size-4',
  md: 'size-10 rounded-md [&_svg]:size-5',
  lg: 'size-12 rounded-md [&_svg]:size-6',
} as const

export interface IconTileProps {
  icon: LucideIcon
  accent?: AccentName
  size?: keyof typeof tileSizes
  className?: string
}

export function IconTile({ icon: Icon, accent = 'indigo', size = 'md', className }: IconTileProps) {
  return (
    <span
      data-tile={accent}
      className={cn(
        'inline-flex shrink-0 tile-gradient items-center justify-center shadow-e1',
        tileSizes[size],
        className,
      )}
    >
      <Icon aria-hidden="true" strokeWidth={1.75} />
    </span>
  )
}
