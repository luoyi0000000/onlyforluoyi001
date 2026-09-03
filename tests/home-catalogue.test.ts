import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { selectHomeTools } from '../lib/home-catalogue.ts'
import type { ToolItem } from '../types/tool.ts'

const tools: ToolItem[] = [
  {
    id: 'notes',
    name: { zh: '我的笔记', en: 'My Notes' },
    desc: { zh: '快速记录想法', en: 'Capture ideas quickly' },
    categoryId: 'daily',
    icon: 'NotebookPen',
    kind: 'internal',
    tags: ['write'],
    pinyin: 'wdbj',
  },
  {
    id: 'snippets',
    name: { zh: '代码片段', en: 'Code Snippets' },
    desc: { zh: '保存常用代码', en: 'Keep reusable code' },
    categoryId: 'work',
    icon: 'SquareCode',
    kind: 'internal',
    tags: ['code'],
    pinyin: 'dmpd',
  },
  {
    id: 'budget',
    name: { zh: '记账本', en: 'Budget' },
    desc: { zh: '记录日常开销', en: 'Track daily spending' },
    categoryId: 'life',
    icon: 'PiggyBank',
    kind: 'internal',
    tags: ['money'],
    pinyin: 'jzb',
  },
]

describe('selectHomeTools', () => {
  it('keeps registry order for an empty query and no category', () => {
    const selected = selectHomeTools(tools, { query: '   ', categoryId: null })
    assert.deepEqual(
      selected.map((tool) => tool.id),
      ['notes', 'snippets', 'budget'],
    )
  })

  it('finds the same tool by English copy, Chinese copy, tag, or pinyin', () => {
    for (const query of ['notes', '笔记', 'write', 'wdbj']) {
      const selected = selectHomeTools(tools, { query, categoryId: null })
      assert.deepEqual(
        selected.map((tool) => tool.id),
        ['notes'],
        query,
      )
    }
  })

  it('limits the catalogue to one category', () => {
    const selected = selectHomeTools(tools, { query: '', categoryId: 'work' })
    assert.deepEqual(
      selected.map((tool) => tool.id),
      ['snippets'],
    )
  })

  it('applies the category before ranking the query', () => {
    const selected = selectHomeTools(tools, { query: 'daily', categoryId: 'life' })
    assert.deepEqual(
      selected.map((tool) => tool.id),
      ['budget'],
    )
  })
})
