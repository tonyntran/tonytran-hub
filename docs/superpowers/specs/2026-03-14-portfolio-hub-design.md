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
| UI Components | shadcn/ui |
| Database & Auth | Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| Hosting | Vercel |
| Markdown rendering | react-markdown |
| Animations | Framer Motion (scroll transitions) or Intersection Observer |

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

---

## 4. Data Model

Two tables in Supabase.

### `content_blocks`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | `gen_random_uuid()` |
| type | text | `hero`, `about`, `experience`, `skill`, `project`, `contact` |
| title | text | Display title (nullable) |
| metadata | jsonb | Structured fields per type (see below) |
| body_md | text | Markdown content (nullable) |
| sort_order | integer | Ordering within type |
| visible | boolean | Show/hide on public site |
| created_at | timestamptz | Auto-managed |
| updated_at | timestamptz | Auto-managed |

#### Metadata shapes per type

| Type | Metadata Fields |
|------|----------------|
| hero | `{ tagline, subtitle }` |
| about | `{ avatar_url, location }` |
| experience | `{ company, role, start_date, end_date, logo_url }` |
| skill | `{ category, level }` |
| project | `{ url, github_url, tech_stack[], image_url, is_featured }` |
| contact | `{ platform, url, icon, display_text }` |

These shapes are enforced by TypeScript types in `src/lib/types.ts`, not by database constraints.

### `applications`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | `gen_random_uuid()` |
| name | text | App display name |
| description | text | Short description |
| url | text | Link to the spoke app |
| icon | text | Icon name or emoji |
| status | text | `active`, `maintenance`, `disabled` |
| sort_order | integer | Display ordering |
| created_at | timestamptz | Auto-managed |

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

### Allowlist

The `ALLOWED_EMAILS` environment variable holds a comma-separated list of permitted emails. Scaling path: hardcoded list → env-driven list → open registration with roles.

### SSO Prep

The Supabase middleware client reads an optional `COOKIE_DOMAIN` env var. When unset (local dev), cookies scope to the current host. When set to `.mydomain.com` in production, session cookies are readable by all subdomains. One env var change, zero code changes needed later. This is deferred until the first spoke app ships.

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (safe for client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret admin key (NEVER prefix with `NEXT_PUBLIC_`) |
| `ALLOWED_EMAILS` | Comma-separated allowlist |
| `COOKIE_DOMAIN` | Optional, set to `.mydomain.com` for SSO |

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
- **Layer 2**: Smooth scroll-triggered animations (fade-up, slide) as sections enter the viewport. Uses Intersection Observer or Framer Motion. Noticed by developers.
- **Layer 3**: Two standout moments — hero animation and one creative section transition. Rewards exploration.

### Data Flow

1. Landing page is a Server Component.
2. Fetches all `content_blocks` where `visible = true`.
3. Groups by `type`, sorts by `sort_order`.
4. Passes each group to its section component.
5. Section components render structured metadata + markdown body.
6. Hero and scroll animations are Client Components (need browser APIs).
7. Cached by Next.js. CMS server actions call `revalidatePath('/')` to bust cache.

---

## 7. Dashboard

### Layout

Sidebar navigation with three items:
- **Overview** — `/dashboard`
- **Content** — `/dashboard/content`
- **Applications** — `/dashboard/apps`

Future modules (Kanban, Analytics, CRM, Costs) shown greyed out in sidebar as placeholders.

### Overview Page (`/dashboard`)

- Welcome header with "View live site →" link
- **App Launchpad**: grid of spoke application cards + "Add application" card
- **Content Quick View**: count of content blocks per type (Hero: 1, About: 1, Experience: 4, etc.)

### App Launchpad

- `<AppCard>` component: entire card is a link (`<a>` wrapping the full card)
- Links use `target="_blank" rel="noopener noreferrer"` so the hub stays open
- Status badge per card: `active` (green), `maintenance` (amber), `disabled` (dimmed, link removed)

### CMS: Content List (`/dashboard/content`)

- Filterable by content type using tabs (All, Hero, Experience, Projects, etc.)
- Table columns: Order, Title, Type, Visible, Updated, Edit link
- Hidden items shown dimmed
- **Sort ordering**: when filtered by a specific type, an Order column appears with ▲/▼ arrow buttons. Clicking an arrow fires a server action that swaps `sort_order` values between adjacent rows and calls `revalidatePath`. Arrows disabled at boundaries. Can upgrade to drag-and-drop (`@hello-pangea/dnd`) later.

### CMS: Edit Form (`/dashboard/content/:id`)

Hybrid form approach:
- **Structured form fields** for metadata (company, role, dates, URLs, etc.)
- **Markdown editor** for `body_md` (description/body content)
- **Visible toggle** (shadcn Switch component)
- **Save button** triggers a server action

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
- Submit triggers a server action to insert a new `content_block`.

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
      layout.tsx                — Dashboard layout (sidebar nav, user menu)
    auth/
      login/page.tsx            — Sign in with GitHub
      callback/route.ts         — OAuth code exchange
      error/page.tsx            — Unauthorized / error states
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
      content.ts                — Server actions: CRUD for content blocks
      apps.ts                   — Server actions: CRUD for spoke applications
      auth.ts                   — Server actions: sign-out logic
    types.ts                    — TypeScript types (ContentBlock, Application, metadata)
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
| `react-markdown` | Render markdown in landing page sections |
| `framer-motion` (or Intersection Observer) | Scroll animations, hero animation |
| shadcn/ui components | UI primitives (installed via CLI, not an npm package) |
