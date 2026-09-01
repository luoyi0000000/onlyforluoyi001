'use client'

import { useEffect, useState } from 'react'

/**
 * Global keyboard shortcuts.
 *
 * The rule that matters: while the caret is in a text field, the site keeps its
 * hands off the keyboard. Typing "/" into the search box must insert a slash,
 * not re-focus the box; typing "k" must not swallow the letter. Escape is the
 * single exception, because dismissing an overlay is the one thing a visitor
 * always needs, even mid-typing.
 *
 * Handlers are matched on `event.key`, so the shortcut is the character the
 * layout actually produces rather than a physical key position — "?" works on
 * layouts where it needs Shift and on those where it does not.
 */
export interface Hotkey {
  /** The produced character or key name, e.g. 'k', '/', '?', 'Escape'. */
  key: string
  /** Require Cmd on Apple platforms, Ctrl elsewhere. */
  mod?: boolean
  shift?: boolean
  /** Only Escape should set this. */
  allowInEditable?: boolean
  handler: (event: KeyboardEvent) => void
}

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

/** True when the event originated somewhere the visitor is composing text. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (EDITABLE_TAGS.has(target.tagName)) return true
  if (target.isContentEditable) return true
  const role = target.getAttribute('role')
  return role === 'textbox' || role === 'searchbox' || role === 'combobox'
}

/**
 * The parts of a `KeyboardEvent` a shortcut is matched on.
 *
 * Declared structurally so the rules below can be exercised without a DOM: a
 * real `KeyboardEvent` satisfies this, and so does a plain object in a test.
 * That matters because these rules are otherwise only reachable by pressing
 * keys, and "it looked right when I read it" is not a test.
 */
export interface HotkeyEventLike {
  key: string
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  isComposing?: boolean
}

/** Every rule that decides whether a keystroke belongs to a shortcut. */
export function matchesHotkey(
  event: HotkeyEventLike,
  hotkey: Hotkey,
  /** Whether the caret is in a text field — see `isEditableTarget`. */
  editable: boolean,
): boolean {
  // An IME composition session owns every key until it commits.
  if (event.isComposing === true) return false
  if (event.key.toLowerCase() !== hotkey.key.toLowerCase()) return false
  if (editable && hotkey.allowInEditable !== true) return false

  const wantsMod = hotkey.mod === true
  const hasMod = event.metaKey || event.ctrlKey
  if (wantsMod !== hasMod) return false
  if (hotkey.shift !== undefined && hotkey.shift !== event.shiftKey) return false
  // A shortcut that does not ask for Alt should not fire with Alt held: that
  // combination usually belongs to the OS or the browser.
  if (event.altKey) return false

  return true
}

export function useHotkeys(hotkeys: readonly Hotkey[], enabled = true): void {
  useEffect(() => {
    if (!enabled) return

    function onKeyDown(event: KeyboardEvent) {
      const editable = isEditableTarget(event.target)

      for (const hotkey of hotkeys) {
        if (!matchesHotkey(event, hotkey, editable)) continue
        event.preventDefault()
        hotkey.handler(event)
        return
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [hotkeys, enabled])
}

/**
 * Whether to render ⌘ instead of Ctrl in shortcut hints.
 *
 * Resolved after mount, never during render: the server has no idea what the
 * visitor is holding, and guessing would either mislabel every shortcut on a
 * Mac or throw away the tree on hydration.
 */
export function useApplePlatform(): boolean {
  const [apple, setApple] = useState(false)

  useEffect(() => {
    const platform = navigator.platform || ''
    const agent = navigator.userAgent || ''
    setApple(/Mac|iPhone|iPad|iPod/i.test(platform) || /Mac OS X|iPhone|iPad/i.test(agent))
  }, [])

  return apple
}
