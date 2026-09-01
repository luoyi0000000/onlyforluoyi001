import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { matchesHotkey, type HotkeyEventLike, type Hotkey } from '../hooks/use-hotkeys.ts'

/**
 * Unit tests for the shortcut matcher.
 *
 * Why these exist rather than a browser check: the only browser backend
 * available in this project's development environment does not deliver
 * synthetic keyboard events at all — `press()` and `keypress()` insert nothing,
 * so ⌘K, `/`, `?` and Escape cannot be exercised by driving the page. The rules
 * that decide whether a keystroke belongs to a shortcut are therefore pulled out
 * of the effect and tested directly. What is *not* covered here: `isEditableTarget`
 * needs a real DOM, so the `editable` flag is supplied by the test.
 *
 * Requires Node >= 22.18 (or >= 23.6), where `.ts` files run without a loader.
 * Run with `pnpm test`.
 */

/** A keyboard event as the matcher sees it. Nothing else is read. */
function press(key: string, held: Partial<Omit<HotkeyEventLike, 'key'>> = {}): HotkeyEventLike {
  return {
    key,
    metaKey: held.metaKey ?? false,
    ctrlKey: held.ctrlKey ?? false,
    shiftKey: held.shiftKey ?? false,
    altKey: held.altKey ?? false,
    isComposing: held.isComposing ?? false,
  }
}

const noop = () => {}

/** The three shortcuts this site actually registers, in registration order. */
const openHelp: Hotkey = { key: '?', handler: noop }
const openPalette: Hotkey = { key: 'k', mod: true, allowInEditable: true, handler: noop }
const focusSearch: Hotkey = { key: '/', handler: noop }

describe('matchesHotkey — the modifier contract', () => {
  it('fires ⌘K on Apple and Ctrl+K elsewhere', () => {
    assert.equal(matchesHotkey(press('k', { metaKey: true }), openPalette, false), true)
    assert.equal(matchesHotkey(press('k', { ctrlKey: true }), openPalette, false), true)
  })

  it('does not fire on a bare "k", so the letter still types', () => {
    assert.equal(matchesHotkey(press('k'), openPalette, false), false)
  })

  it('does not fire a modifier-free shortcut while a modifier is held', () => {
    // Ctrl+/ and Ctrl+? belong to the browser, not to this site.
    assert.equal(matchesHotkey(press('/', { ctrlKey: true }), focusSearch, false), false)
    assert.equal(matchesHotkey(press('?', { metaKey: true }), openHelp, false), false)
  })

  it('never fires with Alt held', () => {
    assert.equal(
      matchesHotkey(press('k', { ctrlKey: true, altKey: true }), openPalette, false),
      false,
    )
    assert.equal(matchesHotkey(press('/', { altKey: true }), focusSearch, false), false)
  })

  it('matches the produced character regardless of case', () => {
    // Shift+K produces "K"; the shortcut is still ⌘K.
    assert.equal(matchesHotkey(press('K', { metaKey: true }), openPalette, false), true)
  })

  it('honours an explicit shift requirement in both directions', () => {
    const shifted: Hotkey = { key: 'p', mod: true, shift: true, handler: noop }
    assert.equal(matchesHotkey(press('p', { ctrlKey: true, shiftKey: true }), shifted, false), true)
    assert.equal(matchesHotkey(press('p', { ctrlKey: true }), shifted, false), false)

    const unshifted: Hotkey = { key: 'p', mod: true, shift: false, handler: noop }
    assert.equal(
      matchesHotkey(press('p', { ctrlKey: true, shiftKey: true }), unshifted, false),
      false,
    )
  })

  it('ignores shift when the shortcut does not care', () => {
    // "?" needs Shift on most layouts and none on some; both must work.
    assert.equal(matchesHotkey(press('?', { shiftKey: true }), openHelp, false), true)
    assert.equal(matchesHotkey(press('?'), openHelp, false), true)
  })
})

describe('matchesHotkey — keeping hands off text fields', () => {
  it('lets "/" and "?" type themselves inside an input', () => {
    assert.equal(matchesHotkey(press('/'), focusSearch, true), false)
    assert.equal(matchesHotkey(press('?', { shiftKey: true }), openHelp, true), false)
  })

  it('still opens the palette from inside an input', () => {
    assert.equal(matchesHotkey(press('k', { metaKey: true }), openPalette, true), true)
  })

  it('allows Escape through, which is the documented exception', () => {
    const close: Hotkey = { key: 'Escape', allowInEditable: true, handler: noop }
    assert.equal(matchesHotkey(press('Escape'), close, true), true)
  })
})

describe('matchesHotkey — IME', () => {
  it('yields every key to an active composition session', () => {
    for (const hotkey of [openHelp, openPalette, focusSearch]) {
      const event = press(hotkey.key, { metaKey: hotkey.mod === true, isComposing: true })
      assert.equal(matchesHotkey(event, hotkey, false), false)
    }
  })

  it('treats a missing isComposing as "not composing"', () => {
    const bare: HotkeyEventLike = {
      key: '/',
      metaKey: false,
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
    }
    assert.equal(matchesHotkey(bare, focusSearch, false), true)
  })
})

describe('the registered set does not overlap', () => {
  const registered = [openHelp, openPalette, focusSearch]

  it('routes each real keystroke to exactly one shortcut', () => {
    const cases: Array<[HotkeyEventLike, Hotkey]> = [
      [press('?', { shiftKey: true }), openHelp],
      [press('k', { metaKey: true }), openPalette],
      [press('/'), focusSearch],
    ]

    for (const [event, expected] of cases) {
      const matched = registered.filter((hotkey) => matchesHotkey(event, hotkey, false))
      assert.deepEqual(matched, [expected])
    }
  })

  it('leaves ordinary typing alone', () => {
    for (const key of ['a', 'k', 'K', 'Enter', 'Tab', 'ArrowDown', ' ', '1']) {
      const matched = registered.filter((hotkey) => matchesHotkey(press(key), hotkey, false))
      assert.deepEqual(matched, [], `"${key}" should not be a shortcut`)
    }
  })
})
