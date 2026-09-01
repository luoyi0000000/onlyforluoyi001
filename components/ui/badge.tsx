import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * Every tone shares one recessed fill (`bg-inset`) and carries its meaning in
 * the border and text colour. A tone-tinted fill was the first attempt, but a
 * 12% tint over a glass pane sitting on a glow lobe pushed the dark danger
 * badge to 3.85:1 — measured. Against the recessed fill the same text is
 * 5.86:1, and it no longer depends on what happens to be behind the badge.
 */
export const badgeVariants = cva(
  cn(
    'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5',
    'bg-inset text-2xs leading-none font-medium whitespace-nowrap',
  ),
  {
    variants: {
      tone: {
        neutral: 'border-border text-muted-foreground',
        primary: 'border-primary/60 text-accent-foreground',
        success: 'border-success/60 text-success',
        warning: 'border-warning/60 text-warning',
        danger: 'border-destructive/60 text-destructive',
        /** Reserved for seed data, so demo entries can never be mistaken for real tools. */
        demo: 'border-dashed border-warning/70 text-warning',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  children?: ReactNode
}

export function Badge({ className, tone, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {children}
    </span>
  )
}
