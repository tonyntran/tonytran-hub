import { DirtyPWeek4 } from './DirtyPWeek4'

interface Props {
  componentKey: string | null | undefined
}

/**
 * Renders the component body for a post that opted into one. Returns null for an
 * absent or unrecognised key so the caller can fall back to markdown.
 *
 * The switch is intentional rather than a lookup map: resolving a component value at
 * render time and then rendering it trips React Compiler's "cannot create components
 * during render" rule. Static JSX per branch keeps the lint clean.
 */
export function CustomPostBody({ componentKey }: Props) {
  switch (componentKey) {
    case 'dirty-p-week-4':
      return <DirtyPWeek4 />
    default:
      return null
  }
}
