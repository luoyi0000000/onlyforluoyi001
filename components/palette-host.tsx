'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useState } from 'react'

import type { CommandPaletteLabels } from '@/components/command-palette'
import type { ShortcutRow } from '@/components/shortcuts-dialog'
import { useHotkeys, type Hotkey } from '@/hooks/use-hotkeys'
import { HELP_OPEN_EVENT, PALETTE_OPEN_EVENT, onWindowEvent } from '@/lib/palette-events'
import type { Locale } from '@/types/i18n'

/**
 * The keyboard entry point for the whole site, and the reason the palette costs
 * the first paint nothing.
 *
 * What ships in the initial bundle is this file: two booleans, one keydown
 * listener and two `window` event subscriptions. `cmdk`, Radix's dialog and the
 * palette itself live in a separate chunk that is not even requested until
 * something asks for an overlay — a keystroke, the header's search trigger, or
 * the footer's shortcut link.
 *
 * Once requested, the overlay stays mounted for the rest of the session. It
 * renders nothing while closed, so keeping it costs a boolean, and reopening is
 * instant instead of paying the chunk fetch again.
 */
const CommandPalette = dynamic(
  () => import('@/components/command-palette').then((mod) => mod.CommandPalette),
  { ssr: false },
)

const ShortcutsDialog = dynamic(
  () => import('@/components/shortcuts-dialog').then((mod) => mod.ShortcutsDialog),
  { ssr: false },
)

export interface PaletteHostLabels {
  palette: CommandPaletteLabels
  shortcuts: {
    title: string
    desc: string
    close: string
    openPalette: string
    focusSearch: string
    showHelp: string
    closeOverlay: string
    openInNewTab: string
    moveInGrid: string
  }
}

export interface PaletteHostProps {
  locale: Locale
  /** Mirrors `siteConfig.features.enableCommandPalette`. */
  enablePalette: boolean
  labels: PaletteHostLabels
}

export function PaletteHost({ locale, enablePalette, labels }: PaletteHostProps) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  // "Has this overlay ever been asked for?" — what gates the lazy chunk.
  const [paletteUsed, setPaletteUsed] = useState(false)
  const [helpUsed, setHelpUsed] = useState(false)

  const openPalette = useCallback(() => {
    if (!enablePalette) return
    setHelpOpen(false)
    setPaletteUsed(true)
    setPaletteOpen(true)
  }, [enablePalette])

  const showHelp = useCallback(() => {
    setPaletteOpen(false)
    setHelpUsed(true)
    setHelpOpen(true)
  }, [])

  useEffect(() => onWindowEvent(PALETTE_OPEN_EVENT, openPalette), [openPalette])
  useEffect(() => onWindowEvent(HELP_OPEN_EVENT, showHelp), [showHelp])

  const hotkeys = useMemo<Hotkey[]>(() => {
    const list: Hotkey[] = [{ key: '?', handler: showHelp }]

    if (enablePalette) {
      list.push({
        key: 'k',
        mod: true,
        // The one shortcut that is allowed to fire from inside a text field:
        // ⌘K means "search" everywhere on this site, including while the caret
        // sits in the page's own search box or in the palette itself, where it
        // toggles back off.
        allowInEditable: true,
        handler: () => {
          if (paletteOpen) setPaletteOpen(false)
          else openPalette()
        },
      })

      // `/` used to focus the home page's inline search field. That field is
      // gone — search is the palette now — so the key keeps its meaning by
      // opening the palette instead of quietly doing nothing. Unlike ⌘K it is
      // deliberately not `allowInEditable`, or it would swallow every slash
      // typed into a tool's own input.
      list.push({ key: '/', handler: openPalette })
    }

    return list
  }, [enablePalette, showHelp, openPalette, paletteOpen])

  useHotkeys(hotkeys)

  const shortcutRows = useMemo<ShortcutRow[]>(() => {
    const rows: ShortcutRow[] = []
    if (enablePalette) {
      rows.push(
        { keys: ['mod', 'K'], label: labels.shortcuts.openPalette },
        { keys: ['/'], label: labels.shortcuts.focusSearch },
      )
    }
    rows.push(
      { keys: ['?'], label: labels.shortcuts.showHelp },
      { keys: ['esc'], label: labels.shortcuts.closeOverlay },
    )
    if (enablePalette) {
      rows.push({ keys: ['mod', 'enter'], label: labels.shortcuts.openInNewTab })
    }
    rows.push({ keys: ['left', 'up', 'down', 'right'], label: labels.shortcuts.moveInGrid })
    return rows
  }, [enablePalette, labels.shortcuts])

  return (
    <>
      {paletteUsed ? (
        <CommandPalette
          locale={locale}
          labels={labels.palette}
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          onShowHelp={showHelp}
        />
      ) : null}

      {helpUsed ? (
        <ShortcutsDialog
          open={helpOpen}
          onOpenChange={setHelpOpen}
          labels={{
            title: labels.shortcuts.title,
            desc: labels.shortcuts.desc,
            close: labels.shortcuts.close,
          }}
          rows={shortcutRows}
        />
      ) : null}
    </>
  )
}
