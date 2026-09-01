'use client'

import { Star } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { useFavorites } from '@/hooks/use-favorites'
import { useRecent } from '@/hooks/use-recent'
import { cn, fill } from '@/lib/utils'

/**
 * The two things a tool page needs a browser for: the favourite star and the
 * visit record.
 *
 * They share one component because they share one reason to exist — both read
 * and write localStorage — and one island is cheaper than two. Recording the
 * visit here rather than on the card that linked here is what makes "recent"
 * correct for every entry point: a bookmark, a pasted URL and a command-palette
 * jump all land on this page, and only this page sees all three.
 */
export interface ToolDetailActionsProps {
  toolId: string
  name: string
  labels: {
    /** Templates carrying `{name}`. */
    pinOn: string
    pinOff: string
  }
}

export function ToolDetailActions({ toolId, name, labels }: ToolDetailActionsProps) {
  const { isFavorite, toggle } = useFavorites()
  const { push } = useRecent()

  useEffect(() => {
    push(toolId)
  }, [push, toolId])

  const favorite = isFavorite(toolId)
  const label = fill(favorite ? labels.pinOff : labels.pinOn, { name })

  return (
    <Button
      variant="glass"
      size="icon"
      aria-pressed={favorite}
      aria-label={label}
      title={label}
      onClick={() => toggle(toolId)}
      className={cn(favorite && 'text-warning')}
    >
      <Star aria-hidden="true" className="size-4" fill={favorite ? 'currentColor' : 'none'} />
    </Button>
  )
}
