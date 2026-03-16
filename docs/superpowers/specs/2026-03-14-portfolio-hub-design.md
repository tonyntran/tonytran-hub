# Design: Portfolio Hub (Phase 1)

**Status**: Approved
**Author**: Tony Tran
**Date**: 2026-03-14

---

## 1. Overview

A single Next.js application serving two purposes:

1. **Public landing page** — a creative portfolio/CV with 6 sections, scroll animations, and a hero standout moment.
2. **Authenticated dashboard** — a private admin area with an app launchpad for spoke applications and a CMS for managing landing page content.

Single-user system. Tony is the only user. Auth is gated by an email allowlist in middleware.

### Scope (Phase 1)

- Public landing page (6 sections)
- OAuth authentication (GitHub) with email allowlist
- Dashboard: app launchpad + CMS (forms + markdown editor)

### Out of Scope (Future Phases)

- Phase 2: Kanban board (drag-and-drop project/idea management)
- Phase 3: Analytics dashboard (page views, interactions, Supabase metrics)
- Phase 4: Personal CRM (contacts, interaction history, notes)
- Phase 5: Cost tracker (Vercel, Claude API, other platform usage)
- Cross-domain SSO cookie scoping (deferred until first spoke app ships)

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15+ (App Router, `app/` directory) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Lucide icons) |
| Database & Auth | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| Hosting | Vercel |
| Markdown rendering | react-markdown |
| Markdown editing | Plain `<Textarea>` with a live preview toggle (no third-party editor) |
| Animations | Framer Motion (hero animation + scroll-triggered section transitions) |

---

## 3. Architecture

### Route Groups

```
src/app/
  (public)/       → /                    Public landing page
  (protected)/    → /dashboard/*         Authenticated dashboard
  auth/           → /auth/*              Login, callback, error
```

Route groups `(public)` and `(protected)` do not appear in URLs. The `(protected)` group shares a dashboard layout with sidebar navigation.

### Middleware

A root `middleware.ts` file handles:

1. Refreshing the Supabase session on every request (required by `@supabase/ssr`).
2. Protecting `/dashboard` and sub-routes.
3. Redirecting unauthenticated users to `/auth/login`.
4. Checking authenticated user's email against `ALLOWED_EMAILS` env var.
5. If email doesn't match: signing out and redirecting to `/auth/error?reason=unauthorized`.

Public routes and `/auth/*` routes pass through untouched.

### No RLS

Since this is a single-user system with middleware-gated access, Row Level Security is not used. The middleware is the access gate. If the system goes multi-user in the future, `user_id` columns and RLS policies would be added at that point.

### Server Actions

All database mutations happen through Next.js Server Actions in `src/lib/actions/`. Each file starts with `"use server"` and uses the Supabase server client. The anon key is sufficient since RLS is disabled.

### Error Handling Philosophy

- **Landing page**: if Supabase is unreachable, render a static fallback (name, tagline, contact links) rather than an error page. The landing page should never show a broken state to visitors.
- **Dashboard forms**: validation errors show inline messages below the relevant field. Server errors (Supabase unreachable, action failure) show a toast notification via shadcn/ui Sonner or similar.
- **Sort ordering**: server-round-trip (not optimistic UI). Arrow buttons disable during the request to prevent double-clicks.

### Caching Strategy

The landing page uses Next.js on-demand ISR. The page is statically generated at build time and cached. When CMS server actions modify content, they call `revalidatePath('/')` to regenerate the page. This means visitors get fast static responses, and content updates appear within seconds of saving.

---

## 4. Data Model

Two tables in Supabase.

### `content_blocks`

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | `gen_random_uuid()` | |
| type | text | NOT NULL | | `hero`, `about`, `experience`, `skill`, `project`, `contact` |
| title | text | | NULL | Display title |
| metadata | jsonb | NOT NULL | `'{}'::jsonb` | Structured fields per type |
| body_md | text | | NULL | Markdown content |
| sort_order | integer | NOT NULL | 0 | Ordering within type |
| visible | boolean | NOT NULL | `true` | Show/hide on public site |
| created_at | timestamptz | NOT NULL | `now()` | |
| updated_at | timestamptz | NOT NULL | `now()` | Updated via trigger |

**Indexes:**
- `idx_content_blocks_type` on `type` (filter queries)
- `idx_content_blocks_visible_type` on `(visible, type)` (landing page query)

#### Singleton vs. Collection Types

| Type | Cardinality | Enforcement |
|------|-------------|-------------|
| hero | Singleton (1) | CMS hides "New" button when a block exists. Server action rejects create if one exists. |
| about | Singleton (1) | Same as hero. |
| experience | Collection (many) | No limit. |
| skill | Collection (many) | No limit. |
| project | Collection (many) | No limit. |
| contact | Collection (many) | No limit. |

#### Metadata shapes per type

| Type | Metadata Fields |
|------|----------------|
| hero | `{ tagline: string, subtitle: string }` |
| about | `{ avatar_url: string, location: string }` |
| experience | `{ company: string, role: string, start_date: string, end_date: string \| null, logo_url: string \| null }` |
| skill | `{ category: string, level: string \| null }` |
| project | `{ url: string \| null, github_url: string \| null, tech_stack: string[], image_url: string \| null, is_featured: boolean }` |
| contact | `{ platform: string, url: string, icon: string, display_text: string }` |

These shapes are enforced by TypeScript types in `src/lib/types.ts`, not by database constraints.

#### Sort Order Initialization

When creating a new content block, `sort_order` is set to `MAX(sort_order) + 1` for that type (queried in the server action). If it's the first block of that type, `sort_order` starts at 0. Same logic applies to `applications`.

### `applications`

| Column | Type | Constraints | Default | Notes |
|--------|------|-------------|---------|-------|
| id | uuid | PK | `gen_random_uuid()` | |
| name | text | NOT NULL | | App display name |
| description | text | | NULL | Short description |
| url | text | NOT NULL | | Link to the spoke app |
| icon | text | NOT NULL | | Emoji character (e.g., "💒", "📋") |
| status | text | NOT NULL | `'active'` | `active`, `maintenance`, `disabled` |
| sort_order | integer | NOT NULL | 0 | Display ordering |
| created_at | timestamptz | NOT NULL | `now()` | |
| updated_at | timestamptz | NOT NULL | `now()` | Updated via trigger |

**Icon format:** The `icon` column stores emoji characters. If a richer icon system is needed later (e.g., Lucide icon names or image URLs), the column type remains `text` and the rendering component handles the format.

### SQL Migration

```sql
-- content_blocks
CREATE TABLE content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  body_md text,
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_blocks_type ON content_blocks (type);
CREATE INDEX idx_content_blocks_visible_type ON content_blocks (visible, type);

ALTER TABLE content_blocks ADD CONSTRAINT chk_content_blocks_type
  CHECK (type IN ('hero', 'about', 'experience', 'skill', 'project', 'contact'));

ALTER TABLE applications ADD CONSTRAINT chk_applications_status
  CHECK (status IN ('active', 'maintenance', 'disabled'));

-- applications
CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  url text NOT NULL,
  icon text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_blocks_updated_at
  BEFORE UPDATE ON content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 5. Authentication Flow

### OAuth Provider

GitHub OAuth via Supabase Auth.

### Flow

1. User visits `/dashboard`.
2. Middleware checks for Supabase session — no session found.
3. Redirect to `/auth/login`.
4. User clicks "Sign in with GitHub".
5. Supabase redirects to GitHub OAuth → user authorizes → GitHub redirects back.
6. `/auth/callback` route exchanges code for session.
7. Middleware checks session → session exists → checks email against allowlist.
8. **Email matches** → proceed to `/dashboard`.
9. **Email doesn't match** → sign out → redirect to `/auth/error?reason=unauthorized` (friendly page: "This dashboard is private. Head back to the Portfolio.").

### Auth Callback Implementation

The `/auth/callback/route.ts` handler:

1. Reads the `code` query parameter from the URL.
2. Creates a Supabase server client using `createServerClient` with cookie setters on the `NextResponse`.
3. Calls `supabase.auth.exchangeCodeForSession(code)`.
4. Redirects to `/dashboard` on success.
5. Redirects to `/auth/error?reason=callback_failed` on failure.

No "return to" parameter is supported in Phase 1 — the callback always redirects to `/dashboard`.

### Sign Out

A sign-out button is rendered in the dashboard sidebar (bottom of the nav, below the navigation items). Clicking it triggers the `signOut` server action in `lib/actions/auth.ts`, which calls `supabase.auth.signOut()` and redirects to `/`.

### Allowlist

The `ALLOWED_EMAILS` environment variable holds a comma-separated list of permitted emails. Scaling path: hardcoded list → env-driven list → open registration with roles.

### SSO Prep

The Supabase middleware client reads an optional `COOKIE_DOMAIN` env var. When unset (local dev), cookies scope to the current host. When set to `.mydomain.com` in production, session cookies are readable by all subdomains. This requires custom logic in the `@supabase/ssr` cookie adapter's `set` callback to inject the `domain` attribute on the cookie options — `@supabase/ssr` does not natively support a `cookieDomain` option. This is deferred until the first spoke app ships.

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret admin key for local seeding/migrations only. Not used at runtime — exclude from Vercel production env unless needed. |
| `ALLOWED_EMAILS` | Comma-separated allowlist |
| `COOKIE_DOMAIN` | Optional, set to `.mydomain.com` for SSO (deferred) |

---

## 6. Public Landing Page

### Sections (in order)

1. **Hero** — Name, title, tagline. Standout moment #1: hero animation (animated text, particle effect, or creative intro). Content from `content_blocks WHERE type = 'hero'`.
2. **About** — Avatar, location, bio rendered from `body_md` via react-markdown. Content from `content_blocks WHERE type = 'about'`.
3. **Experience** — Timeline layout with role, company, dates, and markdown descriptions. Content from `content_blocks WHERE type = 'experience' ORDER BY sort_order`.
4. **Skills** — Grouped by `metadata.category`, rendered as pill/tag elements. Content from `content_blocks WHERE type = 'skill'`.
5. **Projects** — Card grid showing featured projects only on landing page (`metadata.is_featured = true`). Each card shows image, title, tech stack tags. Content from `content_blocks WHERE type = 'project'`.
6. **Contact** — Social links with custom `display_text` labels. Content from `content_blocks WHERE type = 'contact'`.

### Design Philosophy: Progressive Disclosure

- **Layer 1**: Clean layout, clear typography, easy navigation. Works even with JS disabled. Serves recruiters and hiring managers.
- **Layer 2**: Smooth scroll-triggered animations (fade-up, slide) as sections enter the viewport using Framer Motion. Noticed by developers.
- **Layer 3**: Two standout moments — hero animation and one creative section transition. Rewards exploration.

### Data Flow

1. Landing page uses on-demand ISR (statically generated, revalidated when content changes).
2. Server Component fetches all `content_blocks` where `visible = true`.
3. Groups by `type`, sorts by `sort_order`.
4. Passes each group to its section component.
5. Section components render structured metadata + markdown body.
6. Hero and scroll animations are Client Components (need browser APIs).
7. CMS server actions call `revalidatePath('/')` after mutations to regenerate the cached page.
8. If Supabase is unreachable, a static fallback renders (name, tagline, contact links).

---

## 7. Dashboard

### Layout

Sidebar navigation with three items:
- **Overview** — `/dashboard`
- **Content** — `/dashboard/content`
- **Applications** — `/dashboard/apps`

Future modules (Kanban, Analytics, CRM, Costs) shown greyed out in sidebar as placeholders.

**Sign out button** at the bottom of the sidebar. Triggers `signOut` server action → redirects to `/`.

### Overview Page (`/dashboard`)

- Welcome header with "View live site →" link
- **App Launchpad**: grid of spoke application cards + "Add application" card
- **Content Quick View**: count of content blocks per type (Hero: 1, About: 1, Experience: 4, etc.)

### App Launchpad

- `<AppCard>` component: entire card is a link (`<a>` wrapping the full card)
- Links use `target="_blank" rel="noopener noreferrer"` so the hub stays open
- Status badge per card: `active` (green), `maintenance` (amber), `disabled` (dimmed, link removed)

### Applications Management (`/dashboard/apps`)

A CRUD page for managing spoke applications, structured similarly to the content CMS:

- **List view**: table with columns — Name, URL, Status (badge), Sort Order, Actions (Edit, Delete)
- **Add form**: dialog/modal with fields — Name, Description, URL, Icon (emoji picker or text input), Status dropdown
- **Edit**: same dialog pre-filled with existing values
- **Delete**: confirmation dialog ("Remove this application?") before deleting
- **Sort ordering**: same ▲/▼ arrow pattern as content blocks

### CMS: Content List (`/dashboard/content`)

- Filterable by content type using tabs (All, Hero, Experience, Projects, etc.)
- Table columns: Order, Title, Type, Visible, Updated, Actions (Edit, Delete)
- Hidden items shown dimmed
- **Sort ordering**: when filtered by a specific type, an Order column appears with ▲/▼ arrow buttons. Clicking an arrow fires a server action that swaps `sort_order` values between adjacent rows and calls `revalidatePath`. Arrows disabled at boundaries. Arrow buttons disable during the server action request to prevent double-clicks. Can upgrade to drag-and-drop (`@hello-pangea/dnd`) later.
- **Delete**: confirmation dialog before deleting. After deletion, remaining blocks' `sort_order` values are re-normalized (0, 1, 2, ...) to avoid gaps. Same re-normalization applies to `applications` after delete.
- **Singleton types** (hero, about): "New block" button is hidden when a block of that type already exists. The server action also rejects the create if one exists.

### CMS: Edit Form (`/dashboard/content/:id`)

Hybrid form approach:
- **Structured form fields** for metadata (company, role, dates, URLs, etc.)
- **Markdown editor** for `body_md`: a plain shadcn `<Textarea>` with a "Preview" toggle button that renders the markdown via react-markdown
- **Visible toggle** (shadcn Switch component)
- **Save button** triggers a server action
- **Validation**: Zod schemas per content type, connected via `@hookform/resolvers`. Required fields show inline error messages. URL fields validate format. Date fields accept YYYY-MM format. Experience `end_date`: a "Currently working here" checkbox nulls out `end_date` and disables the date input. Zod schema makes `end_date` required only when the checkbox is unchecked.

Dynamic form rendering:
- The `<ContentForm>` component reads the content type.
- A switch statement renders the appropriate fields sub-component (`<ExperienceFields>`, `<ProjectFields>`, `<SkillFields>`, etc.).
- Each fields component maps to that type's metadata shape from `lib/types.ts`.

Type locking:
- **Create form** (`/dashboard/content/new`): type is selectable, fields render based on selection.
- **Edit form** (`/dashboard/content/:id`): type is displayed but locked. To change type, delete and create new.

### CMS: Create Form (`/dashboard/content/new`)

- Type selector (dropdown) at the top.
- Selecting a type renders the appropriate metadata fields + markdown editor.
- For singleton types that already have a block, the option is disabled in the dropdown with "(already exists)" label.
- Submit triggers a server action to insert a new `content_block` with `sort_order = MAX(sort_order) + 1` for that type.

---

## 8. Project Structure

```
src/
  app/
    (public)/
      page.tsx                  — Landing page (renders all 6 sections)
      layout.tsx                — Public layout (no auth UI)
    (protected)/
      dashboard/
        page.tsx                — Dashboard overview (app grid + stats)
        content/
          page.tsx              — CMS list view (all content blocks)
          [id]/page.tsx         — CMS edit form (single block)
          new/page.tsx          — CMS create form
        apps/
          page.tsx              — Manage spoke applications
      layout.tsx                — Dashboard layout (sidebar nav, sign out, user menu)
    auth/
      login/page.tsx            — Sign in with GitHub
      callback/route.ts         — OAuth code exchange → redirect to /dashboard
      error/page.tsx            — Unauthorized / error states (?reason=unauthorized|callback_failed)
    layout.tsx                  — Root layout (html, body, fonts)
  components/
    landing/                    — Hero, About, Experience, Skills, Projects, Contact
    dashboard/                  — Sidebar, AppCard, ContentForm, *Fields, MarkdownEditor
    ui/                         — shadcn/ui primitives (Button, Input, Card, etc.)
  lib/
    supabase/
      client.ts                 — Browser client (createBrowserClient)
      server.ts                 — Server component client (cookies)
      middleware.ts             — Middleware client (req/res cookies + COOKIE_DOMAIN)
    actions/
      content.ts                — Server actions: CRUD for content blocks (create, update, delete, reorder)
      apps.ts                   — Server actions: CRUD for spoke applications
      auth.ts                   — Server actions: sign-out (calls supabase.auth.signOut, redirects to /)
    types.ts                    — TypeScript types (ContentBlock, Application, metadata per type)
middleware.ts                   — Root: route protection + allowlist
tailwind.config.ts
.env.local                      — Supabase keys, ALLOWED_EMAILS, COOKIE_DOMAIN
```

### Key Patterns

- Route groups `(public)` / `(protected)` separate concerns without affecting URLs.
- Components grouped by domain (`landing/` vs `dashboard/`) not by component type.
- Shared UI primitives in `components/ui/` via shadcn/ui.
- Supabase clients isolated in `lib/supabase/`.
- All TypeScript types in a single `lib/types.ts` for co-located metadata shapes.
- Server actions in `lib/actions/` — `"use server"` directive, Supabase server client, `revalidatePath()` after mutations.

---

## 9. Dependencies

| Package | Purpose |
|---------|---------|
| `next` (15+) | Framework |
| `react`, `react-dom` | UI library |
| `typescript` | Language |
| `tailwindcss` | Styling |
| `@supabase/ssr` | Supabase SSR auth |
| `@supabase/supabase-js` | Supabase client |
| `react-markdown` | Render markdown in landing page sections and CMS preview |
| `remark-gfm` | GitHub Flavored Markdown plugin (tables, strikethroughs, auto-linking URLs) |
| `framer-motion` | Hero animation + scroll-triggered section transitions |
| `react-hook-form` | Form state management (required by shadcn/ui `<Form>`) |
| `zod` | Schema validation for form fields (URLs, required fields, dates) |
| `@hookform/resolvers` | Connects Zod schemas to React Hook Form |
| shadcn/ui components | UI primitives (installed via CLI, not an npm package) |
