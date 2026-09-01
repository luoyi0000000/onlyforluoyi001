import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'

import {
  readString,
  readStringList,
  removeKey,
  writeString,
  writeStringList,
} from '../lib/storage.ts'

/**
 * Unit tests for the localStorage layer.
 *
 * These matter more than they look: everything under `lib/storage.ts` reads a
 * value that anyone can edit — devtools, a browser extension, another script on
 * the origin — so it is untrusted input, and "we validate it" is a claim that
 * needs evidence. The other half is availability: `localStorage` throws outright
 * in Safari private mode and wherever site data is blocked, and a saved
 * preference must never be able to take the page down.
 *
 * `window` is stubbed rather than emulated. The module only ever touches
 * `window.localStorage`, so a two-method fake reaches every branch, and no DOM
 * implementation is needed. Requires Node >= 22.18; run with `pnpm test`.
 */

/** The slice of localStorage this module uses. */
interface FakeStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

/** Records what was written, so the cap on writes can be asserted. */
interface Written {
  key: string
  value: string
}

function installWindow(storage: Partial<FakeStorage>): Written[] {
  const written: Written[] = []
  const fake: FakeStorage = {
    getItem: storage.getItem ?? (() => null),
    setItem: storage.setItem ?? ((key, value) => void written.push({ key, value })),
    removeItem: storage.removeItem ?? (() => {}),
  }
  globalThis.window = { localStorage: fake } as unknown as Window & typeof globalThis
  return written
}

/** One stored payload, whatever the key. */
function stored(raw: string): Written[] {
  return installWindow({ getItem: () => raw })
}

function throwing(): never {
  throw new Error('SecurityError: access to storage is denied')
}

afterEach(() => {
  // Not `delete globalThis.window`: `window` is not an optional property.
  Reflect.deleteProperty(globalThis, 'window')
})

describe('readStringList — no window', () => {
  it('returns an empty list during prerender instead of throwing', () => {
    // `afterEach` has removed the stub, so this is the server case.
    assert.equal(typeof globalThis.window, 'undefined')
    assert.deepEqual(readStringList('favourites'), [])
  })
})

describe('readStringList — hostile storage', () => {
  it('survives a getItem that throws', () => {
    installWindow({ getItem: throwing })
    assert.deepEqual(readStringList('favourites'), [])
  })

  it('returns an empty list when the key is absent', () => {
    installWindow({ getItem: () => null })
    assert.deepEqual(readStringList('favourites'), [])
  })

  it('discards malformed JSON', () => {
    stored('{not json')
    assert.deepEqual(readStringList('favourites'), [])
  })

  it('discards JSON that is not an array', () => {
    for (const raw of ['null', '42', '"base64"', '{"0":"base64"}', 'true']) {
      stored(raw)
      assert.deepEqual(readStringList('favourites'), [], `payload ${raw}`)
    }
  })
})

describe('readStringList — filtering', () => {
  it('drops entries that are not strings', () => {
    stored(JSON.stringify(['base64', 1, null, true, { id: 'x' }, ['y'], 'hash']))
    assert.deepEqual(readStringList('favourites'), ['base64', 'hash'])
  })

  it('drops empty strings and anything longer than 64 characters', () => {
    const long = 'a'.repeat(65)
    const exact = 'b'.repeat(64)
    stored(JSON.stringify(['', long, exact, 'hash']))
    assert.deepEqual(readStringList('favourites'), [exact, 'hash'])
  })

  it('keeps the first occurrence of a duplicate and nothing more', () => {
    stored(JSON.stringify(['base64', 'hash', 'base64', 'hash', 'qr-code']))
    assert.deepEqual(readStringList('recent'), ['base64', 'hash', 'qr-code'])
  })

  it('stops at 200 items however long the stored list is', () => {
    const flood = Array.from({ length: 5_000 }, (_, index) => `tool-${index}`)
    stored(JSON.stringify(flood))
    const list = readStringList('recent')
    assert.equal(list.length, 200)
    assert.equal(list[0], 'tool-0')
    assert.equal(list.at(-1), 'tool-199')
  })

  it('does not resurrect an id just because it looks like one', () => {
    // The filter is shape-only; matching against the registry happens upstream.
    // This documents that, so nobody reads the filter as an authorisation check.
    stored(JSON.stringify(['../../etc/passwd', '<script>', 'not-a-tool']))
    assert.deepEqual(readStringList('favourites'), ['../../etc/passwd', '<script>', 'not-a-tool'])
  })
})

describe('writeStringList', () => {
  it('writes JSON and caps the list at 200 items', () => {
    const written = installWindow({})
    writeStringList(
      'recent',
      Array.from({ length: 500 }, (_, index) => `tool-${index}`),
    )

    assert.equal(written.length, 1)
    assert.equal(written[0]?.key, 'recent')
    const parsed: unknown = JSON.parse(written[0]?.value ?? '')
    assert.ok(Array.isArray(parsed))
    assert.equal(parsed.length, 200)
  })

  it('swallows a storage quota or permission error', () => {
    installWindow({ setItem: throwing })
    assert.doesNotThrow(() => writeStringList('recent', ['base64']))
  })

  it('does nothing without a window', () => {
    assert.doesNotThrow(() => writeStringList('recent', ['base64']))
  })
})

describe('readString / writeString / removeKey', () => {
  it('passes the raw value through', () => {
    installWindow({ getItem: (key) => (key === 'theme' ? 'dark' : null) })
    assert.equal(readString('theme'), 'dark')
    assert.equal(readString('locale'), null)
  })

  it('returns null instead of throwing when reads are blocked', () => {
    installWindow({ getItem: throwing })
    assert.equal(readString('theme'), null)
  })

  it('swallows write and remove failures', () => {
    installWindow({ setItem: throwing, removeItem: throwing })
    assert.doesNotThrow(() => writeString('theme', 'dark'))
    assert.doesNotThrow(() => removeKey('theme'))
  })

  it('is inert without a window', () => {
    assert.equal(readString('theme'), null)
    assert.doesNotThrow(() => writeString('theme', 'dark'))
    assert.doesNotThrow(() => removeKey('theme'))
  })
})
