// @ts-check
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { dirname, extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Serves `out/` the way Cloudflare Static Assets will, so the exported site can
 * be checked before it is deployed: directory paths resolve to `index.html`, a
 * miss falls back to `/404.html` with a real 404 status, and nothing is rewritten
 * or injected. Zero dependencies, and it binds to loopback only — it is a local
 * rehearsal, not a server to expose.
 *
 * Usage: `pnpm run serve:out` after `pnpm build`, then open the printed address.
 */

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(root, 'out')
const port = Number(process.env.PORT ?? 4321)

/** @type {Record<string, string>} */
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
}

/** @param {string} candidate */
async function fileAt(candidate) {
  try {
    const info = await stat(candidate)
    return info.isFile() ? candidate : null
  } catch {
    return null
  }
}

/**
 * Resolve a request path to a file inside `out/`, or null.
 * @param {string} pathname
 */
async function resolveAsset(pathname) {
  const decoded = decodeURIComponent(pathname)
  // `normalize` collapses `..` before the prefix check, so traversal cannot escape.
  const target = resolve(out, `.${normalize(decoded)}`)
  if (target !== out && !target.startsWith(out + sep)) return null

  if (decoded.endsWith('/')) return fileAt(join(target, 'index.html'))
  return (await fileAt(target)) ?? (await fileAt(join(target, 'index.html')))
}

const server = createServer((req, res) => {
  void (async () => {
    // A request-target is always a path, never an authority. Left as-is,
    // `new URL('//package.json', base)` reads the `//` as protocol-relative,
    // takes `package.json` for the host and hands back a pathname of `/` — so a
    // junk request quietly answers 200 with the root page instead of 404.
    // Collapsing the leading run of separators keeps the whole target in the path.
    const requestTarget = (req.url ?? '/').replace(/^[/\\]+/, '/')
    const pathname = new URL(requestTarget, 'http://localhost').pathname
    const asset = await resolveAsset(pathname)

    if (asset === null) {
      const fallback = await fileAt(join(out, '404.html'))
      if (fallback === null) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
        res.end('404')
        return
      }
      res.writeHead(404, { 'content-type': contentTypes['.html'] ?? 'text/html' })
      createReadStream(fallback).pipe(res)
      return
    }

    const type = contentTypes[extname(asset).toLowerCase()] ?? 'application/octet-stream'
    // Deliberately no caching, so a rebuild is visible on a plain reload.
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' })
    createReadStream(asset).pipe(res)
  })()
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving out/ at http://127.0.0.1:${port}/  (loopback only, Ctrl+C to stop)`)
})
