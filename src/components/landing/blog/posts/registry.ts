/**
 * Blog posts whose body is a React component rather than markdown.
 *
 * Most posts are markdown in Supabase. A few need their own layout — bespoke type
 * scale, charts, tables that markdown can't express. Those live here and are opted
 * into per-post via `metadata.component`.
 *
 * Each component owns its own scoped styles and renders inside the blog shell but
 * outside the default prose wrapper, so it controls its own width and typography.
 *
 * To add one: write the component, add its key to CUSTOM_POST_KEYS, and add a case
 * to CustomPostBody. The switch is deliberate — looking a component up in a map and
 * rendering the result trips the React Compiler's "cannot create components during
 * render" rule, so the JSX references stay static.
 */
export const CUSTOM_POST_KEYS = ['dirty-p-week-4'] as const

export type CustomPostKey = (typeof CUSTOM_POST_KEYS)[number]

/**
 * Whether a post should render a component body. An unknown key returns false so the
 * post falls back to its markdown instead of blanking the page.
 */
export function hasCustomPostBody(key: string | null | undefined): key is CustomPostKey {
  if (!key) return false
  return (CUSTOM_POST_KEYS as readonly string[]).includes(key)
}
