import {
  ArrowLeftRight,
  Binary,
  BookOpen,
  Bookmark,
  Braces,
  Briefcase,
  Calculator,
  CalendarClock,
  CaseSensitive,
  ClipboardList,
  Clock,
  Cloud,
  Crop,
  Diff,
  Droplet,
  Dumbbell,
  FileCode,
  FileText,
  Film,
  Fingerprint,
  FlaskConical,
  Globe,
  Hash,
  House,
  Image,
  Kanban,
  KeyRound,
  Link2,
  ListTodo,
  Lock,
  Network,
  NotebookPen,
  Palette,
  Percent,
  PiggyBank,
  QrCode,
  Regex,
  Ruler,
  Scissors,
  ShieldCheck,
  Shuffle,
  Sigma,
  SquareCode,
  Table,
  Terminal,
  Timer,
  Type,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'

/**
 * Icons are referenced from `config/tools.ts` by name, as plain strings, so the
 * config file stays free of imports and JSX and can be edited by someone who
 * has never opened a component.
 *
 * The map is explicit rather than a dynamic lookup into the whole lucide
 * package for two reasons: a namespace import would defeat tree-shaking and
 * drag all 6,000+ icons into the bundle, and an unknown name would become a
 * runtime crash instead of a build-time complaint.
 *
 * To use an icon that is not here yet: add one import above and one entry
 * below. That is the only component-side edit the tool registry ever needs.
 */
export const iconRegistry = {
  ArrowLeftRight,
  Binary,
  BookOpen,
  Bookmark,
  Braces,
  Briefcase,
  Calculator,
  CalendarClock,
  CaseSensitive,
  ClipboardList,
  Clock,
  Cloud,
  Crop,
  Diff,
  Droplet,
  Dumbbell,
  FileCode,
  FileText,
  Film,
  Fingerprint,
  FlaskConical,
  Globe,
  Hash,
  House,
  Image,
  Kanban,
  KeyRound,
  Link2,
  ListTodo,
  Lock,
  Network,
  NotebookPen,
  Palette,
  Percent,
  PiggyBank,
  QrCode,
  Regex,
  Ruler,
  Scissors,
  ShieldCheck,
  Shuffle,
  Sigma,
  SquareCode,
  Table,
  Terminal,
  Timer,
  Type,
  Wrench,
  Zap,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof iconRegistry

/** Shown when a config entry names an icon that is not registered. */
export const fallbackIcon: LucideIcon = Wrench

export function isIconName(name: string): name is IconName {
  return Object.hasOwn(iconRegistry, name)
}

/**
 * Never throws. A typo in an icon name should not take the whole page down —
 * `validateConfig` reports it as a warning at build time and the card still
 * renders with the wrench.
 */
export function resolveIcon(name: string): LucideIcon {
  return isIconName(name) ? iconRegistry[name] : fallbackIcon
}

/** Sorted list of registered names, used by the config validator's messages. */
export function iconNames(): string[] {
  return Object.keys(iconRegistry).sort()
}
