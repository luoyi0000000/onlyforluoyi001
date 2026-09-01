'use client'

import { useCallback, useRef } from 'react'

import { cn } from '@/lib/utils'

export interface SegmentedOption<T extends string> {
  value: T
  /** Visible when `iconOnly` is false; always used as the accessible name. */
  label: string
  icon?: React.ReactNode
}

export interface SegmentedControlProps<T extends string> {
  /** Accessible name of the whole group, e.g. "Theme". */
  label: string
  options: ReadonlyArray<SegmentedOption<T>>
  value: T
  onChange: (next: T) => void
  iconOnly?: boolean
  className?: string
  /** Suppresses the checked styling until the stored value is known. */
  ready?: boolean
  /**
   * `fill` paints the selected segment with the accent — right for labels and
   * monochrome icons. `ring` only draws a ring around it, which is what colour
   * swatches need, since filling them would hide the colour being chosen.
   */
  checkedStyle?: 'fill' | 'ring'
}

/**
 * ARIA radiogroup with a roving tabindex: one Tab stop for the whole control,
 * arrow keys move between options, Home/End jump to the ends. Used by the
 * theme, density and accent switchers so the keyboard contract is written once.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  iconOnly = false,
  className,
  ready = true,
  checkedStyle = 'fill',
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)

  const focusAt = useCallback((index: number) => {
    const radios = containerRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    radios?.item(index)?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = options.findIndex((option) => option.value === value)
      if (currentIndex < 0) return

      let nextIndex: number | null = null
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = (currentIndex + 1) % options.length
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = (currentIndex - 1 + options.length) % options.length
          break
        case 'Home':
          nextIndex = 0
          break
        case 'End':
          nextIndex = options.length - 1
          break
        default:
          return
      }

      const target = options[nextIndex]
      if (!target) return
      event.preventDefault()
      onChange(target.value)
      focusAt(nextIndex)
    },
    [options, value, onChange, focusAt],
  )

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn('inline-flex items-center gap-0.5 rounded-md glass-inset p-0.5', className)}
    >
      {options.map((option) => {
        const checked = ready && option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={iconOnly ? option.label : undefined}
            title={iconOnly ? option.label : undefined}
            tabIndex={option.value === value ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative inline-flex items-center justify-center gap-1.5 rounded-sm',
              'text-2xs font-medium whitespace-nowrap',
              'transition-[background-color,color,opacity,box-shadow] duration-200 ease-glide',
              'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring',
              iconOnly ? 'size-8 coarse:size-11' : 'h-8 px-2.5 coarse:h-11 coarse:px-4',
              checkedStyle === 'fill'
                ? checked
                  ? 'bg-primary text-primary-foreground shadow-e1'
                  : 'text-muted-foreground hover:bg-foreground/8 hover:text-foreground'
                : cn(
                    'text-foreground',
                    checked ? 'ring-2 ring-foreground/70' : 'hover:ring-2 hover:ring-foreground/25',
                  ),
            )}
          >
            {option.icon}
            {iconOnly ? null : <span>{option.label}</span>}
          </button>
        )
      })}
    </div>
  )
}
