'use client'

import { Check } from 'lucide-react'

import { SegmentedControl, type SegmentedOption } from '@/components/ui/segmented-control'
import { useAccent } from '@/hooks/use-preference'
import { cn } from '@/lib/utils'
import { themeAccents, type ThemeAccent } from '@/types/tool'

/**
 * Swatch classes are a fixed map rather than a template string, because Tailwind
 * only emits classes it can see in the source.
 */
const swatchClass: Record<ThemeAccent, string> = {
  indigo: 'bg-swatch-indigo',
  violet: 'bg-swatch-violet',
  cyan: 'bg-swatch-cyan',
  emerald: 'bg-swatch-emerald',
}

export interface AccentToggleLabels {
  group: string
  /** One label per ramp, keyed by accent so adding a ramp is a compile error here. */
  accents: Record<ThemeAccent, string>
}

/**
 * Four accent ramps, one attribute on <html>. Selection is marked by a ring and
 * a check glyph, never by colour alone — the swatches are all colours, so colour
 * cannot also be the state indicator.
 */
export function AccentToggle({ labels }: { labels: AccentToggleLabels }) {
  const { value, setValue, ready } = useAccent()

  const options: ReadonlyArray<SegmentedOption<ThemeAccent>> = themeAccents.map((accent) => ({
    value: accent,
    label: labels.accents[accent],
    icon: (
      <span
        className={cn('flex size-4 items-center justify-center rounded-full', swatchClass[accent])}
      >
        {ready && accent === value ? (
          <Check aria-hidden="true" className="size-3 text-background" strokeWidth={3} />
        ) : null}
      </span>
    ),
  }))

  return (
    <SegmentedControl
      label={labels.group}
      options={options}
      value={value}
      onChange={setValue}
      iconOnly
      ready={ready}
      checkedStyle="ring"
    />
  )
}
