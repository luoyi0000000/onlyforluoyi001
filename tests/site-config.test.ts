import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { siteConfig } from '../config/site.ts'
import { categories, tools } from '../config/tools.ts'

describe('owner toolbox configuration', () => {
  it('keeps only the two requested everyday links', () => {
    assert.deepEqual(
      categories.map((category) => category.id),
      ['daily'],
    )
    assert.deepEqual(
      tools.map((tool) => ({
        id: tool.id,
        name: tool.name.zh,
        desc: tool.desc.zh,
        categoryId: tool.categoryId,
        kind: tool.kind,
        href: tool.href,
        iconSrc: tool.iconSrc,
      })),
      [
        {
          id: 'convert-node',
          name: '转换节点',
          desc: '节点都在这哦',
          categoryId: 'daily',
          kind: 'link',
          href: 'https://convert.onlyforluoyi001.com/dashboard',
          iconSrc: '/images/p4.png',
        },
        {
          id: 'probe',
          name: '探针',
          desc: '看看机机还活着吗',
          categoryId: 'daily',
          kind: 'link',
          href: 'https://monitor.onlyforluoyi001.com/',
          iconSrc: '/images/p3.png',
        },
      ],
    )
    assert.equal(
      tools.some((tool) => tool.demo === true),
      false,
    )
  })

  it('uses the supplied brand artwork and a lower background crop', () => {
    assert.equal(siteConfig.brand.logoSrc, '/images/p2.png')
    assert.equal(siteConfig.background.imageSrc, '/images/toolbox-background.png')
    assert.equal(siteConfig.background.position, 'center 42%')
    assert.equal(siteConfig.background.mobilePosition, '66% 42%')
  })
})
