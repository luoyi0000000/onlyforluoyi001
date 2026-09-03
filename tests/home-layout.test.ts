import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { shouldRenderHomeSlot } from '../lib/home-layout.ts'

describe('shouldRenderHomeSlot', () => {
  it('removes an empty slot when its placeholder is hidden', () => {
    assert.equal(shouldRenderHomeSlot(false, 'hidden'), false)
  })

  it('keeps compact and full editing placeholders visible', () => {
    assert.equal(shouldRenderHomeSlot(false, 'compact'), true)
    assert.equal(shouldRenderHomeSlot(false, 'full'), true)
  })

  it('always renders owner content regardless of the empty-slot setting', () => {
    for (const presentation of ['hidden', 'compact', 'full'] as const) {
      assert.equal(shouldRenderHomeSlot(true, presentation), true)
    }
  })
})
