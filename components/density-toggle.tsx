'use client'

import { Rows3, Rows4 } from 'lucide-react'

import { SegmentedControl, type SegmentedOption } from '@/components/ui/segmented-control'
import { useDensity, type Density } from '@/hooks/use-preference'

export interface DensityToggleLabels {
  group: string
  comfortable: string
  compact: string
}

/**
 * Comfortable / compact. The value only flips `data-density` on <html>; every
 * spacing change happens in CSS through the `--d-*` tokens, so no component
 * re-renders and there is no layout thrash.
 */
export function DensityToggle({ labels }: { labels: DensityToggleLabels }) {
  const { value, setValue, ready } = useDensity()

  const options: ReadonlyArray<SegmentedOption<Density>> = [
    {
      value: 'comfortable',
      label: labels.comfortable,
      icon: <Rows3 aria-hidden="true" className="size-4" />,
    },
    {
      value: 'compact',
      label: labels.compact,
      icon: <Rows4 aria-hidden="true" className="size-4" />,
    },
  ]

  return (
    <SegmentedControl
      label={labels.group}
      options={options}
      value={value}
      onChange={setValue}
      iconOnly
      ready={ready}
    />
  )
}
