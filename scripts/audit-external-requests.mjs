// @ts-check
import { readdir, readFile } from 'node:fs/promises'
import { dirname, extname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Mechanical proof of the privacy promise: the exported site must not cause the
 * browser to contact any third party.
 *
 * A naive "grep for https://" does not work, and pretending otherwise would make
 * this check theatre. Real bundles are full of absolute URLs that nothing ever
 * fetches: XML namespace identifiers, documentation links inside error messages,
 * URL-parser test fixtures in core-js, licence headers, the OFL text shipped
 * beside the font. So the audit is split in two.
 *
 *   Pass A — subresource positions (hard failure). Every URL the browser would
 *   fetch on its own: `src` / `href` on <link>, <script>, <img>, <iframe>;
 *   `srcset`, `poster`, `action`, `formaction`, `data`; a meta-refresh target;
 *   `url()` and `@import` in CSS. All of these must stay on this origin.
 *   `<a href>` is excluded — that is a navigation the visitor chose — but every
 *   outbound link is printed so it can be eyeballed.
 *
 *   Pass B — known third-party hosts (hard failure, any position). Font CDNs,
 *   analytics, tag managers, script CDNs, error trackers. These have no innocent
 *   reason to appear anywhere in the output, so position does not matter.
 *
 * Anything else absolute is listed as informational, with the file it came from,
 * so nothing is hidden behind an allow-list.
 *
 * Usage: `pnpm audit:external` after a build.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'out')

const SCANNABLE = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt', '.webmanifest'])

/** Hosts that can only mean a third-party request. Matched on hostname, exactly. */
const forbiddenHosts = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.tailwindcss.com',
  'cdn.jsdelivr.net',
  'unpkg.com',
  'cdnjs.cloudflare.com',
  'esm.sh',
  'ajax.googleapis.com',
  'www.google-analytics.com',
  'google-analytics.com',
  'www.googletagmanager.com',
  'googletagmanager.com',
  'stats.g.doubleclick.net',
  'plausible.io',
  'vitals.vercel-insights.com',
  'va.vercel-scripts.com',
  'sentry.io',
  'static.hotjar.com',
  'www.clarity.ms',
]

/** Attributes a browser fetches without being asked. */
const fetchedAttributes = ['src', 'srcset', 'poster', 'action', 'formaction', 'data']

/** @param {string} dir @returns {Promise<string[]>} */
async function walk(dir) {
  /** @type {string[]} */
  const files = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(full)))
    else if (SCANNABLE.has(extname(entry.name).toLowerCase())) files.push(full)
  }
  return files
}

/** @param {string} value */
function isOffOrigin(value) {
  const url = value.trim()
  if (url === '') return false
  // Protocol-relative URLs resolve against the current scheme but a foreign host.
  if (url.startsWith('//')) return true
  return /^[a-z][a-z0-9+.-]*:/i.test(url) && !/^(data|blob|mailto|tel|about|javascript):/i.test(url)
}

/** @param {string} url */
function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }
}

/**
 * Pass A for one HTML file.
 * @param {string} html
 * @returns {{ subresources: string[]; links: string[] }}
 */
function scanHtml(html) {
  /** @type {string[]} */
  const subresources = []
  /** @type {string[]} */
  const links = []

  for (const tagMatch of html.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)\b([^>]*)>/g)) {
    const tag = (tagMatch[1] ?? '').toLowerCase()
    const attrs = tagMatch[2] ?? ''

    /** @param {string} name */
    const attr = (name) => {
      const found = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i').exec(attrs)
      return found ? (found[2] ?? found[3] ?? '') : null
    }

    for (const name of fetchedAttributes) {
      const value = attr(name)
      if (value === null) continue
      // srcset holds a comma-separated candidate list.
      for (const candidate of value.split(',')) {
        const url = candidate.trim().split(/\s+/)[0] ?? ''
        if (isOffOrigin(url)) subresources.push(url)
      }
    }

    const href = attr('href')
    if (href !== null && isOffOrigin(href)) {
      if (tag === 'a' || tag === 'area') links.push(href)
      else subresources.push(href)
    }

    if (tag === 'meta' && (attr('http-equiv') ?? '').toLowerCase() === 'refresh') {
      const target = /url\s*=\s*(.+)$/i.exec(attr('content') ?? '')
      if (target && isOffOrigin(target[1] ?? '')) subresources.push((target[1] ?? '').trim())
    }
  }

  return { subresources, links }
}

/** @param {string} css @returns {string[]} */
function scanCss(css) {
  /** @type {string[]} */
  const found = []
  for (const match of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) {
    if (isOffOrigin(match[2] ?? '')) found.push((match[2] ?? '').trim())
  }
  for (const match of css.matchAll(/@import\s+(?:url\()?\s*['"]([^'"]+)['"]/g)) {
    if (isOffOrigin(match[1] ?? '')) found.push((match[1] ?? '').trim())
  }
  return found
}

/**
 * @param {Map<string, Set<string>>} bag
 * @param {string} key
 * @param {string} file
 */
function record(bag, key, file) {
  const seen = bag.get(key) ?? new Set()
  seen.add(file)
  bag.set(key, seen)
}

/** @param {Map<string, Set<string>>} bag */
function print(bag) {
  for (const [url, files] of [...bag.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const where = [...files].sort()
    const shown = where.slice(0, 3).join(', ')
    const more = where.length > 3 ? ` (+${where.length - 3} more)` : ''
    console.log(`    ${url}\n      in: ${shown}${more}`)
  }
}

async function main() {
  /** @type {Map<string, Set<string>>} */
  const subresources = new Map()
  /** @type {Map<string, Set<string>>} */
  const outboundLinks = new Map()
  /** @type {Map<string, Set<string>>} */
  const forbidden = new Map()
  /** @type {Map<string, Set<string>>} */
  const incidental = new Map()

  const files = await walk(out)

  for (const file of files) {
    const where = relative(out, file).split(sep).join('/')
    const source = await readFile(file, 'utf8')
    const ext = extname(file).toLowerCase()

    if (ext === '.html') {
      const { subresources: subs, links } = scanHtml(source)
      for (const url of subs) record(subresources, url, where)
      for (const url of links) record(outboundLinks, url, where)
    }

    if (ext === '.css') {
      for (const url of scanCss(source)) record(subresources, url, where)
    }

    for (const match of source.matchAll(/https?:\/\/[^\s"'`)\]}<>\\]+/g)) {
      const url = (match[0] ?? '').replace(/[.,;:]+$/, '')
      const host = hostOf(url)
      if (host !== null && forbiddenHosts.includes(host)) record(forbidden, url, where)
      else record(incidental, url, where)
    }
  }

  console.log(`Scanned ${files.length} shipped file(s) under out/.\n`)

  console.log(`Pass A — off-origin subresources: ${subresources.size}`)
  print(subresources)

  console.log(`\nPass B — known third-party hosts: ${forbidden.size}`)
  print(forbidden)

  console.log(`\nOutbound <a href> links (visitor-initiated, allowed): ${outboundLinks.size}`)
  print(outboundLinks)

  console.log(`\nIncidental absolute URLs in file text (never fetched): ${incidental.size}`)
  print(incidental)

  const failures = subresources.size + forbidden.size
  if (failures > 0) {
    console.error(`\nFAILED: ${failures} URL(s) would leave this origin.`)
    process.exitCode = 1
    return
  }

  console.log('\nPASSED: every subresource is same-origin and no third-party host appears.')
}

await main()
