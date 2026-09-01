import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'

/**
 * Loading placeholder for the card grid.
 *
 * The internal structure mirrors `ToolCard` element for element — same padding
 * token, same 48px tile on its own row, same name row, same two description
 * lines, same badge row — so a card that replaces a skeleton occupies exactly
 * the same box and the layout never shifts. Matching a guessed fixed height
 * would not survive a density switch.
 *
 * `aria-hidden` plus a single live label: a screen reader should hear "loading"
 * once, not eight identical shells.
 */
export interface SkeletonGridProps {
  count?: number
  label: string
  className?: string
}

function SkeletonCard() {
  return (
    <li className="list-none">
      {/* `inset` to match `ToolCard`: the real card sits on a carrying glass
          panel and adds no blur of its own, so the placeholder must not either,
          or the swap would visibly change surface. */}
      <GlassCard surface="inset" className="flex h-full flex-col gap-3 p-card">
        <span className="size-12 animate-pulse rounded-md bg-foreground/10" />
        <div className="flex flex-col gap-1">
          <span className="h-4 w-2/3 animate-pulse rounded-sm bg-foreground/10" />
          <span className="mt-1 h-2.5 w-full animate-pulse rounded-sm bg-foreground/8" />
          <span className="mt-1 h-2.5 w-4/5 animate-pulse rounded-sm bg-foreground/8" />
        </div>
        <div className="mt-auto flex items-center gap-1.5">
          <span className="h-4 w-10 animate-pulse rounded-sm bg-foreground/8" />
        </div>
      </GlassCard>
    </li>
  )
}

export function SkeletonGrid({ count = 8, label, className }: SkeletonGridProps) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      <ul aria-hidden="true" className={cn('m-0 tool-grid list-none p-0')}>
        {Array.from({ length: count }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </ul>
    </div>
  )
}
