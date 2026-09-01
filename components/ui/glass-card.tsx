import { cva, type VariantProps } from 'class-variance-authority'
import type { ElementType, HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export const glassCardVariants = cva(
  cn(
    'relative rounded-lg',
    // `translate`, not `transform`: Tailwind v4 compiles `-translate-y-0.5` to
    // the standalone `translate` property, so a list naming `transform` left the
    // hover lift snapping instantly instead of gliding.
    'transition-[translate,box-shadow,border-color,opacity] duration-200 ease-glide',
  ),
  {
    variants: {
      surface: {
        /** The default translucent pane. Carries the single backdrop blur. */
        glass: 'glass',
        /** Nests inside `glass` without adding a second blur layer. */
        inset: 'glass-inset',
        /** Fully opaque — used where text density is highest. */
        solid: 'border border-border bg-card text-card-foreground shadow-e1',
      },
      pad: {
        none: 'p-0',
        sm: 'p-3',
        md: 'p-card',
        lg: 'p-6',
        /**
         * For panes that *carry* other surfaces. Scales down on narrow screens
         * so a 320px viewport does not spend 48px of its width on the frame of
         * a container.
         */
        panel: 'p-3 sm:p-4 lg:p-6',
      },
      interactive: {
        // `shadow-lift` rather than `shadow-e3`: same geometry, but its wide
        // ambient layer is tinted with the live accent, so a raised card reads
        // as lit by the page instead of dropped on grey paper.
        //
        // Focus gets the shadow too. It used to lift without it, which made the
        // keyboard state a visibly cheaper version of the pointer one.
        true: cn(
          'hover:-translate-y-0.5 hover:shadow-lift',
          'focus-within:-translate-y-0.5 focus-within:shadow-lift',
          'active:translate-y-0 active:shadow-e1',
        ),
        false: '',
      },
    },
    defaultVariants: { surface: 'glass', pad: 'md', interactive: false },
  },
)

export interface GlassCardProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof glassCardVariants> {
  as?: ElementType
  children?: ReactNode
}

/**
 * The one glass container. Anything that needs a translucent panel composes
 * this instead of hand-writing `backdrop-blur`, which is what keeps the
 * two-blurred-layers-per-region budget auditable.
 */
export function GlassCard({
  as: Tag = 'div',
  className,
  surface,
  pad,
  interactive,
  children,
  ...props
}: GlassCardProps) {
  return (
    <Tag className={cn(glassCardVariants({ surface, pad, interactive }), className)} {...props}>
      {children}
    </Tag>
  )
}
