import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

/**
 * All five states are covered here rather than per usage site:
 * hover / focus-visible / active / disabled / loading.
 *
 * Touch targets: the `icon` size grows to 44x44 under `(pointer: coarse)`
 * instead of relying on an invisible expanded hit box, which would overlap
 * neighbouring controls and steal their taps.
 */
export const buttonVariants = cva(
  cn(
    'relative inline-flex shrink-0 items-center justify-center gap-2 rounded-md',
    'text-xs font-medium whitespace-nowrap select-none',
    // `scale`, not `transform`: every variant's press state is `active:scale-*`,
    // and Tailwind v4 compiles that to the standalone `scale` property, so a
    // list naming `transform` never animated the press at all.
    'transition-[scale,opacity,background-color,border-color,box-shadow] duration-200 ease-glide',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    'disabled:pointer-events-none disabled:opacity-45',
    'aria-busy:pointer-events-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ),
  {
    variants: {
      variant: {
        primary: cn(
          'bg-primary text-primary-foreground shadow-e1',
          'hover:brightness-110 active:scale-[0.98] active:brightness-95',
        ),
        glass: cn('glass text-foreground', 'hover:bg-foreground/8 active:scale-[0.98]'),
        outline: cn(
          'border border-input bg-transparent text-foreground',
          'hover:bg-foreground/6 active:scale-[0.98]',
        ),
        ghost: cn(
          'text-muted-foreground hover:bg-foreground/6 hover:text-foreground active:scale-[0.98]',
        ),
        destructive: cn(
          'bg-destructive text-destructive-foreground shadow-e1',
          'hover:brightness-110 active:scale-[0.98] active:brightness-95',
        ),
      },
      size: {
        sm: 'h-8 px-3 text-2xs coarse:h-11',
        md: 'h-10 px-4 coarse:h-11',
        lg: 'h-12 px-6 text-base',
        icon: 'size-9 px-0 coarse:size-11',
        'icon-lg': 'size-11 px-0',
      },
    },
    defaultVariants: { variant: 'glass', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Renders a spinner, blocks pointer events and sets `aria-busy`. */
  loading?: boolean
  /** Announced while `loading` is true, so the state is not colour-only. */
  loadingLabel?: string
  children?: ReactNode
}

export function Button({
  className,
  variant,
  size,
  loading = false,
  loadingLabel,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
      {children}
      {loading && loadingLabel ? <span className="sr-only">{loadingLabel}</span> : null}
    </button>
  )
}
