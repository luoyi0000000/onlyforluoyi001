import { Beaker, ChevronRight, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ToolDetailActions } from '@/components/tool-detail-actions'
import { badgeTone } from '@/components/tool-card'
import { ToolWorkspaceShell, type ToolWorkspaceLabels } from '@/components/tool-workspace-shell'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { IconTile } from '@/components/ui/icon-tile'
import { createTranslator } from '@/lib/i18n'
import { resolveIcon } from '@/lib/icons'
import { getCategory, getTool, shellToolIds } from '@/lib/tools'
import { cn, localePath } from '@/lib/utils'
import { isLocale, locales, type Locale } from '@/types/i18n'
import type { BadgeKind, ToolItem } from '@/types/tool'

/**
 * The tool page shell: everything around a tool except the tool.
 *
 * One route serves every registered entry, so adding a tool to
 * `config/tools.ts` produces a page here with no file created and no route
 * touched. `generateStaticParams` is what makes that work under
 * `output: 'export'` — the list of pages is the registry, resolved at build
 * time.
 *
 * The page has three shapes, chosen from config alone: an external entry states
 * where it goes and shows the address before you click it; anything else gets
 * the reserved workspace slot. A seed entry additionally says so in words,
 * because a DEMO badge is easy to miss on a page you arrived at directly.
 */

interface RouteParams {
  locale: string
  id: string
}

export function generateStaticParams(): Array<{ locale: Locale; id: string }> {
  const ids = shellToolIds()
  return locales.flatMap((locale) => ids.map((id) => ({ locale, id })))
}

function requireLocale(raw: string): Locale {
  if (!isLocale(raw)) throw new Error(`[i18n] Unsupported locale segment "${raw}".`)
  return raw
}

/**
 * A build-time assertion, not error handling. `generateStaticParams` only ever
 * emits ids that exist, so reaching this means the registry contradicts itself —
 * which should fail `pnpm build` loudly rather than render a 404 that hides it.
 */
function requireTool(id: string): ToolItem {
  const tool = getTool(id)
  if (tool === undefined) {
    throw new Error(`[tools] No enabled tool with id "${id}" — check config/tools.ts.`)
  }
  return tool
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { locale: rawLocale, id } = await params
  const locale = requireLocale(rawLocale)
  const tool = requireTool(id)

  // `title` is a plain string, so the parent layout's template turns it into
  // "<tool> · <site>" without this page knowing the site name.
  return {
    title: tool.name[locale],
    description: tool.desc[locale],
    alternates: {
      canonical: localePath(locale, `t/${tool.id}`),
      languages: Object.fromEntries(
        locales.map((code) => [code, localePath(code, `t/${tool.id}`)]),
      ),
    },
  }
}

const crumbLink = cn(
  'rounded-sm px-1 py-0.5 text-muted-foreground',
  'transition-colors duration-200 ease-glide hover:text-foreground',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
)

export default async function ToolPage({ params }: { params: Promise<RouteParams> }) {
  const { locale: rawLocale, id } = await params
  const locale = requireLocale(rawLocale)
  const tool = requireTool(id)
  const t = createTranslator(locale)

  const category = getCategory(tool.categoryId)
  const Icon = resolveIcon(tool.icon)
  const name = tool.name[locale]
  const tags = tool.tags ?? []
  const external = tool.kind === 'link'
  const href = tool.href ?? ''

  const badgeLabels: Record<BadgeKind, string> = {
    new: t('badge.new'),
    beta: t('badge.beta'),
    wip: t('badge.wip'),
  }

  const workspaceLabels: ToolWorkspaceLabels = {
    title: t('tool.workspaceTitle'),
    placeholder: t('tool.workspacePlaceholder'),
    hint: t('tool.workspaceHint'),
    inputLabel: t('tool.inputLabel'),
    outputLabel: t('tool.outputLabel'),
    inputPlaceholder: t('tool.inputPlaceholder'),
    outputPlaceholder: t('tool.outputPlaceholder'),
    copy: t('actions.copy'),
    copied: t('actions.copied'),
    copyFailed: t('actions.copyFailed'),
    clear: t('actions.clear'),
    paste: t('actions.paste'),
    pasteFailed: t('actions.pasteFailed'),
    download: t('actions.download'),
  }

  const categoryHref =
    category === undefined
      ? undefined
      : `${localePath(locale)}?category=${category.id}#cat-${category.id}`

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-grid px-4 py-section safe-x sm:px-6">
      <nav aria-label={t('a11y.breadcrumbLandmark')}>
        <ol className="flex flex-wrap items-center gap-0.5 text-2xs">
          <li>
            <Link href={localePath(locale)} className={crumbLink}>
              {t('nav.home')}
            </Link>
          </li>

          {category !== undefined && categoryHref !== undefined ? (
            <>
              <li aria-hidden="true" className="text-muted-foreground/60">
                <ChevronRight className="size-3" />
              </li>
              <li>
                <Link href={categoryHref} className={crumbLink}>
                  {category.name[locale]}
                </Link>
              </li>
            </>
          ) : null}

          <li aria-hidden="true" className="text-muted-foreground/60">
            <ChevronRight className="size-3" />
          </li>
          {/* The last crumb is not a link: it points at the page you are on. */}
          <li aria-current="page" className="truncate px-1 py-0.5 font-medium text-foreground">
            {name}
          </li>
        </ol>
      </nav>

      <GlassCard as="header" pad="lg" className="flex flex-col gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <IconTile icon={Icon} accent={tool.accent} size="lg" />

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{name}</h1>
              {tool.demo === true ? (
                <Badge tone="demo" title={t('card.demoHint')}>
                  {t('badge.demo')}
                </Badge>
              ) : null}
              {tool.badge ? (
                <Badge tone={badgeTone[tool.badge]}>{badgeLabels[tool.badge]}</Badge>
              ) : null}
            </div>

            <p className="measure text-xs text-muted-foreground">{tool.desc[locale]}</p>
          </div>

          <ToolDetailActions
            toolId={tool.id}
            name={name}
            labels={{ pinOn: t('card.pinOn'), pinOff: t('card.pinOff') }}
          />
        </div>

        {category !== undefined || tags.length > 0 ? (
          <dl className="flex flex-wrap items-start gap-x-6 gap-y-3 border-t border-border pt-4">
            {category !== undefined && categoryHref !== undefined ? (
              <div className="flex items-center gap-2">
                <dt className="text-2xs text-muted-foreground">{t('tool.categoryLabel')}</dt>
                <dd className="text-2xs">
                  <Link href={categoryHref} className={cn(crumbLink, 'text-foreground')}>
                    {category.name[locale]}
                  </Link>
                </dd>
              </div>
            ) : null}

            {tags.length > 0 ? (
              <div className="flex min-w-0 items-start gap-2">
                <dt className="pt-0.5 text-2xs text-muted-foreground">{t('tool.tagsLabel')}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <Badge key={tag} tone="neutral">
                      {tag}
                    </Badge>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </GlassCard>

      {tool.demo === true ? (
        <GlassCard surface="inset" pad="md" className="flex items-start gap-3">
          <Beaker aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-warning" />
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-foreground">{t('tool.demoTitle')}</p>
            <p className="measure text-2xs text-muted-foreground">{t('tool.demoBody')}</p>
          </div>
        </GlassCard>
      ) : null}

      {external ? (
        <GlassCard as="section" pad="lg" className="flex flex-col items-start gap-4">
          <h2 className="text-lg font-semibold text-foreground">{t('tool.externalTitle')}</h2>
          <p className="measure text-xs text-muted-foreground">{t('tool.externalBody')}</p>

          {/* The address is shown, not hidden behind the button: a link that
              leaves the site should say where it goes before it is clicked. */}
          <code className="w-full rounded-sm border border-border bg-inset px-2 py-1.5 font-mono text-2xs break-all text-muted-foreground">
            {href}
          </code>

          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: 'primary', size: 'md' })}
          >
            {t('tool.openExternal')}
            <ExternalLink aria-hidden="true" className="size-4" />
            <span className="sr-only">{t('a11y.externalLink')}</span>
          </a>
        </GlassCard>
      ) : (
        // No children: the slot renders its own "put the tool UI here" notice and
        // the reusable two-pane template underneath it.
        <ToolWorkspaceShell labels={workspaceLabels} />
      )}
    </div>
  )
}
