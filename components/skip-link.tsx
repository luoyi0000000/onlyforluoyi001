import { cn } from '@/lib/utils'

/**
 * First focusable element on the page. Visually hidden until focused, then it
 * becomes a normal glass button so keyboard users can always jump past the
 * header chrome.
 */
export function SkipLink({ label, targetId = 'main' }: { label: string; targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'sr-only rounded-md px-4 py-2 text-xs font-medium',
        'focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3',
        'focus-visible:z-100 focus-visible:glass focus-visible:text-foreground',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      )}
    >
      {label}
    </a>
  )
}
