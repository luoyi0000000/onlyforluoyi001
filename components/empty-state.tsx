import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'

/**
 * Shown wherever a list can legitimately be empty. It always says what to do
 * next, because "no results" on its own is a dead end.
 */
export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <GlassCard
      surface="inset"
      pad="lg"
      className={cn('flex flex-col items-center gap-2 text-center', className)}
    >
      <Icon aria-hidden="true" className="size-6 text-muted-foreground" />
      <p className="text-xs font-medium">{title}</p>
      <p className="measure text-2xs text-muted-foreground">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </GlassCard>
  )
}
