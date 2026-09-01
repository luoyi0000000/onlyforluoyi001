import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Conditional class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Build an in-site path that always carries the active locale prefix. */
export function localePath(locale: string, path = ''): string {
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '')
  return clean ? `/${locale}/${clean}/` : `/${locale}/`
}

export function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:')
}

/**
 * Fills `{name}` placeholders in a template string.
 *
 * The same job as the interpolation inside `translate()`, but importable from a
 * client component without dragging both dictionaries into the browser bundle:
 * the server hands down the already-selected template, the client only fills in
 * per-item values like a tool name.
 */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(vars, key) ? String(vars[key]) : match,
  )
}
