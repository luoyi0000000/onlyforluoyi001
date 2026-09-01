// @ts-check
import { copyFile, readFile, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Post-export fixup. Runs as part of `pnpm build`, right after `next build`.
 *
 * Why it exists: Cloudflare's `not_found_handling: "404-page"` serves the file at
 * `/404.html`. A static export only writes that file from a *root-level*
 * `app/not-found.tsx`, which this project cannot have — its root layout lives at
 * `app/[locale]/layout.tsx` so that `<html lang>` is correct in both prerendered
 * language trees. Next therefore emits its own built-in 404 page and overwrites
 * `public/404.html` with it. That default is English-only, carries no `lang`
 * attribute at all (WCAG 3.1.1), ignores the site's visual language, and still
 * pulls in the app bundle.
 *
 * So the hand-written page is copied back over both paths Next wrote it to.
 * Everything else is asserted, not repaired: if a future Next version changes
 * what it emits, the build fails here instead of shipping a broken entry point.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'out')

/** Marker strings that prove a given output file is the one we authored. */
const entryPoints = [
  { file: 'index.html', marker: 'Redirecting to your language', label: 'root language gate' },
  { file: 'zh/index.html', marker: 'lang="zh-Hans"', label: 'Chinese home' },
  { file: 'en/index.html', marker: 'lang="en"', label: 'English home' },
]

/** @param {string} path */
async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function main() {
  if (!(await exists(out))) {
    throw new Error('[finalize] `out/` is missing. Did `next build` run?')
  }

  const source = join(root, 'public', '404.html')
  if (!(await exists(source))) {
    throw new Error('[finalize] `public/404.html` is missing; the error page has no source.')
  }

  // `404.html` is what Cloudflare serves; `404/index.html` is where a visitor
  // typing the path lands. The two must not disagree.
  const targets = ['404.html', join('404', 'index.html')]
  for (const target of targets) {
    const path = join(out, target)
    if (target === '404.html' || (await exists(path))) {
      await copyFile(source, path)
    }
  }

  const restored = await readFile(join(out, '404.html'), 'utf8')
  if (!restored.includes('这里没有页面')) {
    throw new Error('[finalize] The restored 404 page is not the hand-written one.')
  }

  for (const { file, marker, label } of entryPoints) {
    const path = join(out, file)
    if (!(await exists(path))) {
      throw new Error(`[finalize] Expected the ${label} at out/${file}; it was not exported.`)
    }
    const html = await readFile(path, 'utf8')
    if (!html.includes(marker)) {
      throw new Error(`[finalize] out/${file} is missing the ${label} marker "${marker}".`)
    }
  }

  console.log('[finalize] Restored the hand-written /404.html and verified every entry point.')
}

await main()
