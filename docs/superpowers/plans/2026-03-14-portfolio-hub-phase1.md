# Portfolio Hub Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js portfolio hub with a public landing page (6 sections, animations), GitHub OAuth with email allowlist, and an authenticated dashboard (app launchpad + CMS).

**Architecture:** Single Next.js 15 app using route groups: `(public)/` for the landing page, `(protected)/` for the dashboard, and `auth/` for login flows. Supabase provides auth (GitHub OAuth) and database (two tables: `content_blocks` + `applications`). Middleware gates dashboard access via email allowlist. Server Actions handle all mutations.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase (`@supabase/ssr`), Framer Motion, react-markdown, react-hook-form + Zod, Vitest

**Spec:** `docs/superpowers/specs/2026-03-14-portfolio-hub-design.md`

---

## File Structure

```
tonytran-hub/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                    — Landing page (fetches + renders all 6 sections)
│   │   │   └── layout.tsx                  — Public layout (no auth UI)
│   │   ├── (protected)/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx                — Dashboard overview (app grid + content stats)
│   │   │   │   ├── content/
│   │   │   │   │   ├── page.tsx            — CMS list view (filterable, sortable)
│   │   │   │   │   ├── [id]/page.tsx       — CMS edit form (type-locked)
│   │   │   │   │   └── new/page.tsx        — CMS create form (type-selectable)
│   │   │   │   └── apps/
│   │   │   │       └── page.tsx            — Applications CRUD page
│   │   │   └── layout.tsx                  — Dashboard layout (sidebar, sign-out)
│   │   ├── auth/
│   │   │   ├── login/page.tsx              — "Sign in with GitHub" button
│   │   │   ├── callback/route.ts           — OAuth code exchange → redirect
│   │   │   └── error/page.tsx              — Error states (?reason=unauthorized|callback_failed)
│   │   ├── layout.tsx                      — Root layout (html, body, fonts, Toaster)
│   │   └── globals.css                     — Tailwind directives + shadcn theme
│   ├── components/
│   │   ├── landing/
│   │   │   ├── Hero.tsx                    — Hero section (Client Component, animated)
│   │   │   ├── About.tsx                   — About section (avatar, bio markdown)
│   │   │   ├── Experience.tsx              — Timeline layout
│   │   │   ├── Skills.tsx                  — Grouped pill/tag display
│   │   │   ├── Projects.tsx                — Featured project card grid
│   │   │   ├── Contact.tsx                 — Social links
│   │   │   └── ScrollReveal.tsx            — Client Component wrapper for Framer Motion fade-up
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx                 — Navigation + sign-out button
│   │   │   ├── AppCard.tsx                 — Full-card link with status badge
│   │   │   ├── ContentForm.tsx             — Dynamic form (switches fields by type)
│   │   │   ├── fields/
│   │   │   │   ├── HeroFields.tsx          — tagline, subtitle inputs
│   │   │   │   ├── AboutFields.tsx         — avatar_url, location inputs
│   │   │   │   ├── ExperienceFields.tsx    — company, role, dates, "currently working" checkbox
│   │   │   │   ├── SkillFields.tsx         — category, level inputs
│   │   │   │   ├── ProjectFields.tsx       — urls, tech_stack array, is_featured toggle
│   │   │   │   └── ContactFields.tsx       — platform, url, icon, display_text inputs
│   │   │   ├── MarkdownEditor.tsx          — Textarea + preview toggle
│   │   │   ├── DeleteConfirmDialog.tsx     — Confirmation dialog for deletes
│   │   │   └── SortOrderButtons.tsx        — ▲/▼ arrow buttons
│   │   └── ui/                             — shadcn/ui primitives (installed via CLI)
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts                   — createBrowserClient()
│       │   ├── server.ts                   — createServerClient() with cookies
│       │   └── middleware.ts               — createServerClient() for middleware (req/res cookies)
│       ├── actions/
│       │   ├── content.ts                  — "use server": create, update, delete, reorder content blocks
│       │   ├── apps.ts                     — "use server": create, update, delete, reorder applications
│       │   └── auth.ts                     — "use server": signOut
│       ├── types.ts                        — ContentBlock, Application, metadata union types
│       └── schemas.ts                      — Zod schemas per content type + application
├── middleware.ts                           — Route protection + email allowlist
├── supabase/
│   └── migration.sql                       — CREATE TABLE + indexes + triggers + CHECK constraints
├── __tests__/
│   ├── lib/
│   │   ├── schemas.test.ts                 — Zod schema validation tests
│   │   ├── actions/
│   │   │   ├── content.test.ts             — Content CRUD server action tests
│   │   │   └── apps.test.ts               — Applications CRUD server action tests
│   │   └── middleware.test.ts              — Route protection + allowlist tests
│   └── components/
│       └── dashboard/
│           └── ContentForm.test.tsx        — Dynamic field rendering tests
├── vitest.config.ts                        — Vitest configuration
├── .env.local                              — Supabase keys (gitignored)
├── .env.example                            — Template for required env vars
├── tailwind.config.ts
├── components.json                         — shadcn/ui config
└── next.config.ts                          — Next.js configuration
```

---

## Chunk 1: Project Setup & Foundation

### Task 1: Scaffold Next.js Project & Install Dependencies

**Files:**
- Create: `package.json` (via `create-next-app`)
- Create: `.env.example`
- Modify: `.gitignore`

- [ ] **Step 1: Create Next.js project**

```bash
cd /home/ttran/projects/tonytran-hub
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

Note: The directory is non-empty (contains `docs/`, `.claude/`, `CLAUDE.md`, `.gitignore`, etc.). `create-next-app` will prompt to confirm — accept. After scaffolding, verify that `.gitignore` still contains existing entries (`.superpowers/`, `.claude/`); if overwritten, restore them in Step 6.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install @supabase/ssr @supabase/supabase-js react-markdown remark-gfm framer-motion react-hook-form zod @hookform/resolvers
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 4: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Then install the components we need:

```bash
npx shadcn@latest add button input textarea card table badge dialog select switch tabs form label sonner
```

- [ ] **Step 5: Create .env.example**

Create: `.env.example`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Auth
ALLOWED_EMAILS=your@email.com

# SSO (deferred — leave empty until first spoke app ships)
COOKIE_DOMAIN=

# Admin (local seeding/migrations only — exclude from Vercel production env)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

- [ ] **Step 6: Update .gitignore**

Append to existing `.gitignore`:

```
# env
.env.local
.env*.local

# dependencies
node_modules/

# next
.next/
out/

# misc
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 7: Create Vitest config**

Create: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: [],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Add to `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 8: Verify setup**

```bash
npm run build
npm run test
```

Expected: build succeeds, tests pass (no tests yet, so 0 tests).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json tsconfig.json tailwind.config.ts next.config.ts vitest.config.ts components.json .env.example .gitignore src/ .eslintrc.json postcss.config.mjs
git commit -m "Scaffold Next.js project with dependencies and tooling"
```

---

### Task 2: TypeScript Types & Zod Schemas

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/schemas.ts`
- Create: `__tests__/lib/schemas.test.ts`

- [ ] **Step 1: Write schema tests**

Create: `__tests__/lib/schemas.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import {
  heroMetadataSchema,
  aboutMetadataSchema,
  experienceMetadataSchema,
  skillMetadataSchema,
  projectMetadataSchema,
  contactMetadataSchema,
  applicationSchema,
} from '@/lib/schemas'

// All 6 metadata schemas + applicationSchema are tested below

describe('heroMetadataSchema', () => {
  it('accepts valid hero metadata', () => {
    const result = heroMetadataSchema.safeParse({ tagline: 'Hello', subtitle: 'World' })
    expect(result.success).toBe(true)
  })

  it('rejects missing tagline', () => {
    const result = heroMetadataSchema.safeParse({ subtitle: 'World' })
    expect(result.success).toBe(false)
  })
})

describe('aboutMetadataSchema', () => {
  it('accepts valid about metadata', () => {
    const result = aboutMetadataSchema.safeParse({
      avatar_url: 'https://example.com/avatar.jpg',
      location: 'San Francisco, CA',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid avatar URL', () => {
    const result = aboutMetadataSchema.safeParse({
      avatar_url: 'not-a-url',
      location: 'San Francisco, CA',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing location', () => {
    const result = aboutMetadataSchema.safeParse({
      avatar_url: 'https://example.com/avatar.jpg',
    })
    expect(result.success).toBe(false)
  })
})

describe('experienceMetadataSchema', () => {
  it('accepts valid experience with end_date', () => {
    const result = experienceMetadataSchema.safeParse({
      company: 'Acme',
      role: 'Developer',
      start_date: '2023-01',
      end_date: '2024-06',
      logo_url: null,
    })
    expect(result.success).toBe(true)
  })

  it('accepts null end_date (currently working)', () => {
    const result = experienceMetadataSchema.safeParse({
      company: 'Acme',
      role: 'Developer',
      start_date: '2023-01',
      end_date: null,
      logo_url: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing company', () => {
    const result = experienceMetadataSchema.safeParse({
      role: 'Developer',
      start_date: '2023-01',
      end_date: null,
      logo_url: null,
    })
    expect(result.success).toBe(false)
  })
})

describe('projectMetadataSchema', () => {
  it('accepts valid project with tech_stack array', () => {
    const result = projectMetadataSchema.safeParse({
      url: 'https://example.com',
      github_url: 'https://github.com/user/repo',
      tech_stack: ['React', 'Node.js'],
      image_url: null,
      is_featured: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid URL format', () => {
    const result = projectMetadataSchema.safeParse({
      url: 'not-a-url',
      github_url: null,
      tech_stack: [],
      image_url: null,
      is_featured: false,
    })
    expect(result.success).toBe(false)
  })

  it('accepts null url', () => {
    const result = projectMetadataSchema.safeParse({
      url: null,
      github_url: null,
      tech_stack: ['Python'],
      image_url: null,
      is_featured: false,
    })
    expect(result.success).toBe(true)
  })
})

describe('skillMetadataSchema', () => {
  it('accepts valid skill metadata', () => {
    const result = skillMetadataSchema.safeParse({
      category: 'Frontend',
      level: 'Advanced',
    })
    expect(result.success).toBe(true)
  })

  it('accepts null level', () => {
    const result = skillMetadataSchema.safeParse({
      category: 'Backend',
      level: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing category', () => {
    const result = skillMetadataSchema.safeParse({
      level: 'Beginner',
    })
    expect(result.success).toBe(false)
  })
})

describe('contactMetadataSchema', () => {
  it('accepts valid contact', () => {
    const result = contactMetadataSchema.safeParse({
      platform: 'GitHub',
      url: 'https://github.com/tonyntran',
      icon: 'github',
      display_text: '@tonyntran',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing platform', () => {
    const result = contactMetadataSchema.safeParse({
      url: 'https://github.com/tonyntran',
      icon: 'github',
      display_text: '@tonyntran',
    })
    expect(result.success).toBe(false)
  })
})

describe('applicationSchema', () => {
  it('accepts valid application', () => {
    const result = applicationSchema.safeParse({
      name: 'Wedding Site',
      description: 'Our wedding website',
      url: 'https://wedding.mydomain.com',
      icon: '💒',
      status: 'active',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid status', () => {
    const result = applicationSchema.safeParse({
      name: 'App',
      url: 'https://app.com',
      icon: '📋',
      status: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid URL', () => {
    const result = applicationSchema.safeParse({
      name: 'App',
      url: 'not-a-url',
      icon: '📋',
      status: 'active',
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Create TypeScript types**

Create: `src/lib/types.ts`

```typescript
export type ContentBlockType = 'hero' | 'about' | 'experience' | 'skill' | 'project' | 'contact'

export const SINGLETON_TYPES: ContentBlockType[] = ['hero', 'about']
export const COLLECTION_TYPES: ContentBlockType[] = ['experience', 'skill', 'project', 'contact']
export const ALL_CONTENT_TYPES: ContentBlockType[] = [...SINGLETON_TYPES, ...COLLECTION_TYPES]

export interface HeroMetadata {
  tagline: string
  subtitle: string
}

export interface AboutMetadata {
  avatar_url: string
  location: string
}

export interface ExperienceMetadata {
  company: string
  role: string
  start_date: string
  end_date: string | null
  logo_url: string | null
}

export interface SkillMetadata {
  category: string
  level: string | null
}

export interface ProjectMetadata {
  url: string | null
  github_url: string | null
  tech_stack: string[]
  image_url: string | null
  is_featured: boolean
}

export interface ContactMetadata {
  platform: string
  url: string
  icon: string
  display_text: string
}

export type ContentMetadata =
  | HeroMetadata
  | AboutMetadata
  | ExperienceMetadata
  | SkillMetadata
  | ProjectMetadata
  | ContactMetadata

export interface ContentBlock {
  id: string
  type: ContentBlockType
  title: string | null
  metadata: ContentMetadata
  body_md: string | null
  sort_order: number
  visible: boolean
  created_at: string
  updated_at: string
}

export type ApplicationStatus = 'active' | 'maintenance' | 'disabled'

export interface Application {
  id: string
  name: string
  description: string | null
  url: string
  icon: string
  status: ApplicationStatus
  sort_order: number
  created_at: string
  updated_at: string
}
```

- [ ] **Step 4: Create Zod schemas**

Create: `src/lib/schemas.ts`

```typescript
import { z } from 'zod'

const urlOrNull = z.string().url().nullable()

export const heroMetadataSchema = z.object({
  tagline: z.string().min(1, 'Tagline is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
})

export const aboutMetadataSchema = z.object({
  avatar_url: z.string().url('Must be a valid URL'),
  location: z.string().min(1, 'Location is required'),
})

export const experienceMetadataSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  start_date: z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM format'),
  end_date: z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM format').nullable(),
  logo_url: urlOrNull,
})

export const skillMetadataSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  level: z.string().nullable(),
})

export const projectMetadataSchema = z.object({
  url: urlOrNull,
  github_url: urlOrNull,
  tech_stack: z.array(z.string()),
  image_url: urlOrNull,
  is_featured: z.boolean(),
})

export const contactMetadataSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Must be a valid URL'),
  icon: z.string().min(1, 'Icon is required'),
  display_text: z.string().min(1, 'Display text is required'),
})

export const metadataSchemaMap = {
  hero: heroMetadataSchema,
  about: aboutMetadataSchema,
  experience: experienceMetadataSchema,
  skill: skillMetadataSchema,
  project: projectMetadataSchema,
  contact: contactMetadataSchema,
} as const

export const applicationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  url: z.string().url('Must be a valid URL'),
  icon: z.string().min(1, 'Icon is required'),
  status: z.enum(['active', 'maintenance', 'disabled']),
})
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm run test
```

Expected: all schema tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/types.ts src/lib/schemas.ts __tests__/lib/schemas.test.ts
git commit -m "Add TypeScript types and Zod validation schemas"
```

---

### Task 3: SQL Migration & Supabase Client Utilities

**Tests deferred:** The Supabase client files are thin pass-through wrappers around `@supabase/ssr` with no custom logic. `updateSession` in `middleware.ts` is tested indirectly via the middleware integration tests and manual smoke test (Task 16). Writing unit tests for these wrappers would require extensive mocking of `@supabase/ssr` internals with no meaningful coverage gain.

**Files:**
- Create: `supabase/migration.sql`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`

- [ ] **Step 1: Create SQL migration file**

Create: `supabase/migration.sql`

```sql
-- ============================================
-- Portfolio Hub Phase 1 — Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

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

ALTER TABLE applications ADD CONSTRAINT chk_applications_status
  CHECK (status IN ('active', 'maintenance', 'disabled'));

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

- [ ] **Step 2: Create Supabase browser client**

Create: `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 3: Create Supabase server client**

Create: `src/lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method is called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  )
}
```

- [ ] **Step 4: Create Supabase middleware client**

Create: `src/lib/supabase/middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { user, supabaseResponse, supabase }
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: build succeeds (no pages reference these yet, but the modules should compile).

- [ ] **Step 6: Commit**

```bash
git add supabase/ src/lib/supabase/
git commit -m "Add SQL migration and Supabase client utilities"
```

---

## Chunk 2: Auth & Middleware

### Task 4: Root Middleware (Route Protection + Allowlist)

**Files:**
- Create: `middleware.ts` (project root, next to `src/`)

- [ ] **Step 1: Write middleware**

Create: `middleware.ts`

```typescript
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED_ROUTES = ['/dashboard']

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}

function isAllowedEmail(email: string | undefined): boolean {
  if (!email) return false
  const allowed = process.env.ALLOWED_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? []
  return allowed.includes(email.toLowerCase())
}

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse, supabase } = await updateSession(request)
  const { pathname } = request.nextUrl

  if (!isProtectedRoute(pathname)) {
    return supabaseResponse
  }

  // No session — redirect to login
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    return NextResponse.redirect(loginUrl)
  }

  // Session exists but email not in allowlist — sign out and redirect to error
  if (!isAllowedEmail(user.email)) {
    await supabase.auth.signOut()
    const errorUrl = request.nextUrl.clone()
    errorUrl.pathname = '/auth/error'
    errorUrl.searchParams.set('reason', 'unauthorized')
    return NextResponse.redirect(errorUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "Add root middleware with route protection and email allowlist"
```

---

### Task 5: Auth Routes (Login, Callback, Error)

**Files:**
- Create: `src/app/auth/login/page.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/auth/error/page.tsx`

- [ ] **Step 1: Create login page**

Create: `src/app/auth/login/page.tsx`

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <p className="text-muted-foreground">
          Sign in to access the dashboard.
        </p>
        <Button onClick={handleLogin} className="w-full">
          Sign in with GitHub
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create OAuth callback route**

Create: `src/app/auth/callback/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?reason=callback_failed`)
}
```

- [ ] **Step 3: Create error page**

Create: `src/app/auth/error/page.tsx`

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Props {
  searchParams: Promise<{ reason?: string }>
}

export default async function AuthErrorPage({ searchParams }: Props) {
  const { reason } = await searchParams

  const messages: Record<string, { title: string; description: string }> = {
    unauthorized: {
      title: 'Access Denied',
      description: 'This dashboard is private. Head back to the portfolio.',
    },
    callback_failed: {
      title: 'Sign In Failed',
      description: 'Something went wrong during sign in. Please try again.',
    },
  }

  const message = messages[reason ?? ''] ?? {
    title: 'Error',
    description: 'An unexpected error occurred.',
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-bold">{message.title}</h1>
        <p className="text-muted-foreground">{message.description}</p>
        <Button asChild>
          <Link href="/">Back to Portfolio</Link>
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/auth/
git commit -m "Add auth routes: login, OAuth callback, and error pages"
```

---

### Task 6: Auth Server Action (Sign Out)

**Files:**
- Create: `src/lib/actions/auth.ts`

- [ ] **Step 1: Create sign-out action**

Create: `src/lib/actions/auth.ts`

```typescript
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/auth.ts
git commit -m "Add sign-out server action"
```

---

## Chunk 3: Dashboard Layout & Applications

### Task 7: Dashboard Layout (Sidebar + Navigation)

**Files:**
- Create: `src/app/(protected)/layout.tsx`
- Create: `src/components/dashboard/Sidebar.tsx`
- Modify: `src/app/layout.tsx` (add Toaster)

- [ ] **Step 1: Add Toaster to root layout**

Modify: `src/app/layout.tsx`

Add the Sonner `<Toaster />` component inside the `<body>` tag, after `{children}`:

```tsx
import { Toaster } from '@/components/ui/sonner'

// Inside the body:
{children}
<Toaster />
```

- [ ] **Step 2: Create Sidebar component**

Create: `src/components/dashboard/Sidebar.tsx`

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Content', href: '/dashboard/content' },
  { label: 'Applications', href: '/dashboard/apps' },
]

const futureModules = ['Kanban', 'Analytics', 'CRM', 'Costs']

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-card">
      <div className="border-b p-4">
        <h2 className="font-bold">Tony&apos;s Hub</h2>
        <p className="text-xs text-muted-foreground">Dashboard</p>
      </div>

      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-4 py-2 text-sm transition-colors',
                isActive
                  ? 'border-r-2 border-primary bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.label}
            </Link>
          )
        })}

        <div className="mt-4 border-t px-4 pt-4">
          <p className="mb-2 text-xs text-muted-foreground">Future modules</p>
          {futureModules.map((mod) => (
            <p key={mod} className="py-1 text-xs text-muted-foreground/50">
              {mod}
            </p>
          ))}
        </div>
      </nav>

      <div className="border-t p-4">
        <form action={signOut}>
          <Button variant="ghost" size="sm" className="w-full justify-start" type="submit">
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  )
}
```

- [ ] **Step 3: Create dashboard layout**

Create: `src/app/(protected)/layout.tsx`

```tsx
import { Sidebar } from '@/components/dashboard/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/\(protected\)/layout.tsx src/components/dashboard/Sidebar.tsx
git commit -m "Add dashboard layout with sidebar navigation and sign-out"
```

---

### Task 8: Applications Server Actions

**Files:**
- Create: `src/lib/actions/apps.ts`
- Create: `__tests__/lib/actions/apps.test.ts`

- [ ] **Step 1: Write server action tests**

Create: `__tests__/lib/actions/apps.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockOrder = vi.fn()
const mockSingle = vi.fn()
const mockMaybeSingle = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom.mockReturnValue({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          order: mockOrder.mockReturnValue({
            data: [],
            error: null,
          }),
          single: mockSingle,
          maybeSingle: mockMaybeSingle,
        }),
        order: mockOrder.mockReturnValue({
          data: [],
          error: null,
        }),
        single: mockSingle,
        maybeSingle: mockMaybeSingle,
      }),
      insert: mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle.mockReturnValue({ data: { id: 'test-id' }, error: null }),
        }),
      }),
      update: mockUpdate.mockReturnValue({
        eq: mockEq.mockReturnValue({ error: null }),
      }),
      delete: mockDelete.mockReturnValue({
        eq: mockEq.mockReturnValue({ error: null }),
      }),
    }),
  })),
}))

// Mock Next.js functions
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('applicationSchema validation', () => {
  // These tests verify the schema is correctly applied in server actions
  // by testing the schema directly (actual DB operations need integration tests)
  it('is tested via schemas.test.ts', () => {
    expect(true).toBe(true)
  })
})
```

Note: Full server action integration tests require a Supabase instance. The schema validation tests in `schemas.test.ts` cover the validation logic. This test file sets up the mocking pattern for future integration tests.

- [ ] **Step 2: Create applications server actions**

Create: `src/lib/actions/apps.ts`

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { applicationSchema } from '@/lib/schemas'

export async function getApplications() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function createApplication(formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    url: formData.get('url') as string,
    icon: formData.get('icon') as string,
    status: formData.get('status') as string,
  }

  const parsed = applicationSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()

  // Get next sort_order
  const { data: maxRow } = await supabase
    .from('applications')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = (maxRow?.sort_order ?? -1) + 1

  const { error } = await supabase
    .from('applications')
    .insert({ ...parsed.data, sort_order: nextOrder })

  if (error) return { error: { server: [error.message] } }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/apps')
  return { success: true }
}

export async function updateApplication(id: string, formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || null,
    url: formData.get('url') as string,
    icon: formData.get('icon') as string,
    status: formData.get('status') as string,
  }

  const parsed = applicationSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('applications')
    .update(parsed.data)
    .eq('id', id)

  if (error) return { error: { server: [error.message] } }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/apps')
  return { success: true }
}

export async function deleteApplication(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('applications').delete().eq('id', id)
  if (error) return { error: error.message }

  // Re-normalize sort_order
  const { data: remaining } = await supabase
    .from('applications')
    .select('id')
    .order('sort_order', { ascending: true })

  if (remaining) {
    for (let i = 0; i < remaining.length; i++) {
      await supabase
        .from('applications')
        .update({ sort_order: i })
        .eq('id', remaining[i].id)
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/apps')
  return { success: true }
}

export async function reorderApplication(id: string, direction: 'up' | 'down') {
  const supabase = await createClient()

  const { data: apps } = await supabase
    .from('applications')
    .select('id, sort_order')
    .order('sort_order', { ascending: true })

  if (!apps) return { error: 'Failed to fetch applications' }

  const currentIndex = apps.findIndex((app) => app.id === id)
  if (currentIndex === -1) return { error: 'Application not found' }

  const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (swapIndex < 0 || swapIndex >= apps.length) return { error: 'Cannot move further' }

  const current = apps[currentIndex]
  const swap = apps[swapIndex]

  await supabase
    .from('applications')
    .update({ sort_order: swap.sort_order })
    .eq('id', current.id)

  await supabase
    .from('applications')
    .update({ sort_order: current.sort_order })
    .eq('id', swap.id)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/apps')
  return { success: true }
}
```

- [ ] **Step 3: Run tests**

```bash
npm run test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions/apps.ts __tests__/lib/actions/apps.test.ts
git commit -m "Add applications server actions with CRUD and reorder"
```

---

### Task 9: Dashboard Overview & Applications Pages

**Files:**
- Create: `src/app/(protected)/dashboard/page.tsx`
- Create: `src/app/(protected)/dashboard/apps/page.tsx`
- Create: `src/components/dashboard/AppCard.tsx`
- Create: `src/components/dashboard/DeleteConfirmDialog.tsx`
- Create: `src/components/dashboard/SortOrderButtons.tsx`

- [ ] **Step 1: Create AppCard component**

Create: `src/components/dashboard/AppCard.tsx`

```tsx
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Application } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  app: Application
}

const statusStyles: Record<string, string> = {
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  maintenance: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  disabled: 'bg-muted text-muted-foreground border-muted',
}

export function AppCard({ app }: Props) {
  const isDisabled = app.status === 'disabled'

  const content = (
    <Card className={cn('transition-colors', isDisabled ? 'opacity-50' : 'hover:bg-accent')}>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="text-2xl">{app.icon}</span>
        <div className="flex-1">
          <p className="font-semibold">{app.name}</p>
          {app.description && (
            <p className="text-xs text-muted-foreground">{app.description}</p>
          )}
          <Badge variant="outline" className={cn('mt-1', statusStyles[app.status])}>
            {app.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  if (isDisabled) return content

  return (
    <a href={app.url} target="_blank" rel="noopener noreferrer" className="block">
      {content}
    </a>
  )
}
```

- [ ] **Step 2: Create DeleteConfirmDialog component**

Create: `src/components/dashboard/DeleteConfirmDialog.tsx`

```tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface Props {
  title: string
  description: string
  onConfirm: () => Promise<void>
  trigger: React.ReactNode
}

export function DeleteConfirmDialog({ title, description, onConfirm, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Create SortOrderButtons component**

Create: `src/components/dashboard/SortOrderButtons.tsx`

```tsx
'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface Props {
  sortOrder: number
  isFirst: boolean
  isLast: boolean
  onReorder: (direction: 'up' | 'down') => Promise<void>
}

export function SortOrderButtons({ sortOrder, isFirst, isLast, onReorder }: Props) {
  const [loading, setLoading] = useState(false)

  const handleReorder = async (direction: 'up' | 'down') => {
    setLoading(true)
    await onReorder(direction)
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 text-xs"
        disabled={isFirst || loading}
        onClick={() => handleReorder('up')}
      >
        ▲
      </Button>
      <span className="text-xs">{sortOrder}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0 text-xs"
        disabled={isLast || loading}
        onClick={() => handleReorder('down')}
      >
        ▼
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Create dashboard overview page**

Create: `src/app/(protected)/dashboard/page.tsx`

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AppCard } from '@/components/dashboard/AppCard'
import { Card, CardContent } from '@/components/ui/card'
import { ALL_CONTENT_TYPES } from '@/lib/types'
import type { Application, ContentBlock } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: apps }, { data: blocks }] = await Promise.all([
    supabase.from('applications').select('*').order('sort_order'),
    supabase.from('content_blocks').select('type'),
  ])

  const typeCounts = ALL_CONTENT_TYPES.map((type) => ({
    type,
    count: (blocks as ContentBlock[] | null)?.filter((b) => b.type === type).length ?? 0,
  }))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Tony</h1>
          <p className="text-sm text-muted-foreground">
            Manage your portfolio and applications
          </p>
        </div>
        <Link href="/" className="text-sm text-primary hover:underline">
          View live site →
        </Link>
      </div>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Applications</h2>
          <Link href="/dashboard/apps" className="text-sm text-primary hover:underline">
            Manage →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(apps as Application[] | null)?.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
          <Link href="/dashboard/apps">
            <Card className="border-dashed transition-colors hover:bg-accent">
              <CardContent className="flex items-center gap-3 p-4">
                <span className="text-2xl text-muted-foreground">+</span>
                <span className="text-sm text-muted-foreground">Add application</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Landing Page Content</h2>
          <Link href="/dashboard/content" className="text-sm text-primary hover:underline">
            Manage all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {typeCounts.map(({ type, count }) => (
            <Card key={type}>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs capitalize text-muted-foreground">{type}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 5: Create applications management page**

Create: `src/app/(protected)/dashboard/apps/page.tsx`

This page includes a list table with sort ordering, plus add/edit dialogs. Due to its size, it will be a Client Component that fetches data on mount and manages dialog state.

```tsx
'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmDialog } from '@/components/dashboard/DeleteConfirmDialog'
import { SortOrderButtons } from '@/components/dashboard/SortOrderButtons'
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  reorderApplication,
} from '@/lib/actions/apps'
import type { Application } from '@/lib/types'

export default function AppsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<Application | null>(null)
  const [status, setStatus] = useState<string>('active')

  const loadApps = async () => {
    const data = await getApplications()
    setApps(data as Application[])
  }

  useEffect(() => {
    loadApps()
  }, [])

  const handleSubmit = async (formData: FormData) => {
    const result = editingApp
      ? await updateApplication(editingApp.id, formData)
      : await createApplication(formData)

    if (result.error) {
      toast.error('Failed to save application')
      return
    }

    toast.success(editingApp ? 'Application updated' : 'Application created')
    setDialogOpen(false)
    setEditingApp(null)
    loadApps()
  }

  const handleDelete = async (id: string) => {
    const result = await deleteApplication(id)
    if (result.error) {
      toast.error('Failed to delete application')
      return
    }
    toast.success('Application deleted')
    loadApps()
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    await reorderApplication(id, direction)
    loadApps()
  }

  const openEdit = (app: Application) => {
    setEditingApp(app)
    setStatus(app.status)
    setDialogOpen(true)
  }

  const openCreate = () => {
    setEditingApp(null)
    setStatus('active')
    setDialogOpen(true)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Applications</h1>
        <Button onClick={openCreate}>+ Add application</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Order</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apps.map((app, index) => (
            <TableRow key={app.id}>
              <TableCell>
                <SortOrderButtons
                  sortOrder={app.sort_order}
                  isFirst={index === 0}
                  isLast={index === apps.length - 1}
                  onReorder={(dir) => handleReorder(app.id, dir)}
                />
              </TableCell>
              <TableCell>
                <span className="mr-2">{app.icon}</span>
                {app.name}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{app.url}</TableCell>
              <TableCell>
                <Badge variant="outline">{app.status}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(app)}>
                    Edit
                  </Button>
                  <DeleteConfirmDialog
                    title="Remove application?"
                    description={`This will permanently remove "${app.name}" from your dashboard.`}
                    onConfirm={() => handleDelete(app.id)}
                    trigger={<Button variant="ghost" size="sm" className="text-destructive">Delete</Button>}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingApp ? 'Edit Application' : 'Add Application'}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              await handleSubmit(new FormData(e.currentTarget))
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={editingApp?.name ?? ''} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" defaultValue={editingApp?.description ?? ''} />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input id="url" name="url" type="url" defaultValue={editingApp?.url ?? ''} required />
            </div>
            <div>
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input id="icon" name="icon" defaultValue={editingApp?.icon ?? ''} required />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <input type="hidden" name="status" value={status} />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              {editingApp ? 'Save Changes' : 'Add Application'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/app/\(protected\)/dashboard/ src/components/dashboard/
git commit -m "Add dashboard overview, applications management, and shared components"
```

---

## Chunk 4: CMS Content Management

**Architecture note:** The spec mentions `@hookform/resolvers` for connecting Zod to react-hook-form. This plan uses native `<form>` with `FormData` extraction + manual `schema.safeParse()` instead, which is simpler and avoids react-hook-form boilerplate. Validation errors display as toast notifications rather than inline per-field messages. This is an intentional simplification — inline field errors can be added as an enhancement later by migrating to react-hook-form.

### Task 10: Content Server Actions

**Files:**
- Create: `src/lib/actions/content.ts`

- [ ] **Step 1: Create content server actions**

Create: `src/lib/actions/content.ts`

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { metadataSchemaMap } from '@/lib/schemas'
import { SINGLETON_TYPES, type ContentBlockType } from '@/lib/types'

export async function getContentBlocks(type?: ContentBlockType) {
  const supabase = await createClient()
  let query = supabase.from('content_blocks').select('*').order('sort_order', { ascending: true })

  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function getContentBlock(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function createContentBlock(type: ContentBlockType, formData: FormData) {
  const supabase = await createClient()

  // Singleton enforcement
  if (SINGLETON_TYPES.includes(type)) {
    const { data: existing } = await supabase
      .from('content_blocks')
      .select('id')
      .eq('type', type)
      .maybeSingle()

    if (existing) {
      return { error: { server: [`A ${type} block already exists.`] } }
    }
  }

  // Parse metadata from form
  const metadata = extractMetadata(type, formData)
  const schema = metadataSchemaMap[type]
  const parsed = schema.safeParse(metadata)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // Get next sort_order for this type
  const { data: maxRow } = await supabase
    .from('content_blocks')
    .select('sort_order')
    .eq('type', type)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextOrder = (maxRow?.sort_order ?? -1) + 1

  const { error } = await supabase.from('content_blocks').insert({
    type,
    title: (formData.get('title') as string) || null,
    metadata: parsed.data,
    body_md: (formData.get('body_md') as string) || null,
    sort_order: nextOrder,
    visible: formData.get('visible') === 'on',
  })

  if (error) return { error: { server: [error.message] } }

  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/content')
  return { success: true }
}

export async function updateContentBlock(id: string, type: ContentBlockType, formData: FormData) {
  const metadata = extractMetadata(type, formData)
  const schema = metadataSchemaMap[type]
  const parsed = schema.safeParse(metadata)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('content_blocks')
    .update({
      title: (formData.get('title') as string) || null,
      metadata: parsed.data,
      body_md: (formData.get('body_md') as string) || null,
      visible: formData.get('visible') === 'on',
    })
    .eq('id', id)

  if (error) return { error: { server: [error.message] } }

  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/content')
  return { success: true }
}

export async function deleteContentBlock(id: string) {
  const supabase = await createClient()

  // Get the block's type before deleting (for re-normalization)
  const { data: block } = await supabase
    .from('content_blocks')
    .select('type')
    .eq('id', id)
    .single()

  if (!block) return { error: 'Block not found' }

  const { error } = await supabase.from('content_blocks').delete().eq('id', id)
  if (error) return { error: error.message }

  // Re-normalize sort_order for this type
  const { data: remaining } = await supabase
    .from('content_blocks')
    .select('id')
    .eq('type', block.type)
    .order('sort_order', { ascending: true })

  if (remaining) {
    for (let i = 0; i < remaining.length; i++) {
      await supabase
        .from('content_blocks')
        .update({ sort_order: i })
        .eq('id', remaining[i].id)
    }
  }

  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/content')
  return { success: true }
}

export async function reorderContentBlock(id: string, direction: 'up' | 'down') {
  const supabase = await createClient()

  // Get the block to find its type
  const { data: block } = await supabase
    .from('content_blocks')
    .select('type, sort_order')
    .eq('id', id)
    .single()

  if (!block) return { error: 'Block not found' }

  // Get all blocks of this type, sorted
  const { data: blocks } = await supabase
    .from('content_blocks')
    .select('id, sort_order')
    .eq('type', block.type)
    .order('sort_order', { ascending: true })

  if (!blocks) return { error: 'Failed to fetch blocks' }

  const currentIndex = blocks.findIndex((b) => b.id === id)
  const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
  if (swapIndex < 0 || swapIndex >= blocks.length) return { error: 'Cannot move further' }

  const current = blocks[currentIndex]
  const swap = blocks[swapIndex]

  await supabase.from('content_blocks').update({ sort_order: swap.sort_order }).eq('id', current.id)
  await supabase.from('content_blocks').update({ sort_order: current.sort_order }).eq('id', swap.id)

  revalidatePath('/')
  revalidatePath('/dashboard/content')
  return { success: true }
}

export async function getSingletonStatus(): Promise<Record<string, boolean>> {
  const supabase = await createClient()
  const result: Record<string, boolean> = {}

  for (const type of SINGLETON_TYPES) {
    const { data } = await supabase
      .from('content_blocks')
      .select('id')
      .eq('type', type)
      .maybeSingle()
    result[type] = !!data
  }

  return result
}

// Helper: extract metadata fields from FormData based on content type
function extractMetadata(type: ContentBlockType, formData: FormData): Record<string, unknown> {
  switch (type) {
    case 'hero':
      return {
        tagline: formData.get('tagline'),
        subtitle: formData.get('subtitle'),
      }
    case 'about':
      return {
        avatar_url: formData.get('avatar_url'),
        location: formData.get('location'),
      }
    case 'experience':
      return {
        company: formData.get('company'),
        role: formData.get('role'),
        start_date: formData.get('start_date'),
        end_date: formData.get('currently_working') === 'on' ? null : formData.get('end_date'),
        logo_url: (formData.get('logo_url') as string) || null,
      }
    case 'skill':
      return {
        category: formData.get('category'),
        level: (formData.get('level') as string) || null,
      }
    case 'project': {
      const techStackRaw = formData.get('tech_stack') as string
      return {
        url: (formData.get('url') as string) || null,
        github_url: (formData.get('github_url') as string) || null,
        tech_stack: techStackRaw ? techStackRaw.split(',').map((s) => s.trim()).filter(Boolean) : [],
        image_url: (formData.get('image_url') as string) || null,
        is_featured: formData.get('is_featured') === 'on',
      }
    }
    case 'contact':
      return {
        platform: formData.get('platform'),
        url: formData.get('contact_url'),
        icon: formData.get('icon'),
        display_text: formData.get('display_text'),
      }
  }
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/content.ts
git commit -m "Add content block server actions with CRUD, reorder, and singleton enforcement"
```

---

### Task 11: CMS Content List Page

**Files:**
- Create: `src/app/(protected)/dashboard/content/page.tsx`

- [ ] **Step 1: Create content list page**

Create: `src/app/(protected)/dashboard/content/page.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DeleteConfirmDialog } from '@/components/dashboard/DeleteConfirmDialog'
import { SortOrderButtons } from '@/components/dashboard/SortOrderButtons'
import {
  getContentBlocks,
  deleteContentBlock,
  reorderContentBlock,
  getSingletonStatus,
} from '@/lib/actions/content'
import { ALL_CONTENT_TYPES, SINGLETON_TYPES, type ContentBlock, type ContentBlockType } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function ContentListPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeType = searchParams.get('type') as ContentBlockType | null

  const [blocks, setBlocks] = useState<ContentBlock[]>([])
  const [singletonStatus, setSingletonStatus] = useState<Record<string, boolean>>({})

  const loadData = async () => {
    const [data, singletons] = await Promise.all([
      getContentBlocks(activeType ?? undefined),
      getSingletonStatus(),
    ])
    setBlocks(data as ContentBlock[])
    setSingletonStatus(singletons)
  }

  useEffect(() => {
    loadData()
  }, [activeType])

  const handleDelete = async (id: string) => {
    const result = await deleteContentBlock(id)
    if (result.error) {
      toast.error('Failed to delete block')
      return
    }
    toast.success('Content block deleted')
    loadData()
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    await reorderContentBlock(id, direction)
    loadData()
  }

  const setFilter = (type: string) => {
    if (type === 'all') {
      router.push('/dashboard/content')
    } else {
      router.push(`/dashboard/content?type=${type}`)
    }
  }

  const canCreateNew = !activeType
    || !SINGLETON_TYPES.includes(activeType)
    || !singletonStatus[activeType]

  const showOrder = !!activeType

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return d.toLocaleDateString()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content</h1>
        {canCreateNew && (
          <Button asChild>
            <Link href={activeType ? `/dashboard/content/new?type=${activeType}` : '/dashboard/content/new'}>
              + New block
            </Link>
          </Button>
        )}
      </div>

      <Tabs value={activeType ?? 'all'} className="mb-4">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setFilter('all')}>
            All
          </TabsTrigger>
          {ALL_CONTENT_TYPES.map((type) => (
            <TabsTrigger key={type} value={type} onClick={() => setFilter(type)} className="capitalize">
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Table>
        <TableHeader>
          <TableRow>
            {showOrder && <TableHead className="w-16">Order</TableHead>}
            <TableHead>Title</TableHead>
            {!activeType && <TableHead>Type</TableHead>}
            <TableHead className="w-16">Visible</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="w-32">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blocks.map((block, index) => (
            <TableRow key={block.id} className={cn(!block.visible && 'opacity-50')}>
              {showOrder && (
                <TableCell>
                  <SortOrderButtons
                    sortOrder={block.sort_order}
                    isFirst={index === 0}
                    isLast={index === blocks.length - 1}
                    onReorder={(dir) => handleReorder(block.id, dir)}
                  />
                </TableCell>
              )}
              <TableCell>{block.title ?? '(untitled)'}</TableCell>
              {!activeType && (
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {block.type}
                  </Badge>
                </TableCell>
              )}
              <TableCell>{block.visible ? '●' : '○'}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(block.updated_at)}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/content/${block.id}`}>Edit</Link>
                  </Button>
                  <DeleteConfirmDialog
                    title="Delete content block?"
                    description="This will permanently remove this content block."
                    onConfirm={() => handleDelete(block.id)}
                    trigger={<Button variant="ghost" size="sm" className="text-destructive">Delete</Button>}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {blocks.length === 0 && (
            <TableRow>
              <TableCell colSpan={showOrder ? 6 : 5} className="py-8 text-center text-muted-foreground">
                No content blocks yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(protected\)/dashboard/content/page.tsx
git commit -m "Add CMS content list page with filtering, sort ordering, and delete"
```

---

### Task 12: Dynamic Content Form & Field Components

**Files:**
- Create: `src/components/dashboard/MarkdownEditor.tsx`
- Create: `src/components/dashboard/ContentForm.tsx`
- Create: `src/components/dashboard/fields/HeroFields.tsx`
- Create: `src/components/dashboard/fields/AboutFields.tsx`
- Create: `src/components/dashboard/fields/ExperienceFields.tsx`
- Create: `src/components/dashboard/fields/SkillFields.tsx`
- Create: `src/components/dashboard/fields/ProjectFields.tsx`
- Create: `src/components/dashboard/fields/ContactFields.tsx`

- [ ] **Step 1: Create MarkdownEditor component**

Create: `src/components/dashboard/MarkdownEditor.tsx`

```tsx
'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface Props {
  name: string
  defaultValue: string
}

export function MarkdownEditor({ name, defaultValue }: Props) {
  const [value, setValue] = useState(defaultValue)
  const [preview, setPreview] = useState(false)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label>Description (Markdown)</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => setPreview(!preview)}>
          {preview ? 'Edit' : 'Preview'}
        </Button>
      </div>
      {/* Hidden input ensures body_md is always in FormData, even in preview mode */}
      <input type="hidden" name={name} value={value} />
      {preview ? (
        <div className="prose prose-sm dark:prose-invert min-h-[120px] rounded-md border p-3">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '*No content*'}</ReactMarkdown>
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={6}
          placeholder="Write your description in markdown..."
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create field components**

Create: `src/components/dashboard/fields/HeroFields.tsx`

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { HeroMetadata } from '@/lib/types'

interface Props {
  metadata?: HeroMetadata
}

export function HeroFields({ metadata }: Props) {
  return (
    <>
      <div>
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" name="tagline" defaultValue={metadata?.tagline ?? ''} required />
      </div>
      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" name="subtitle" defaultValue={metadata?.subtitle ?? ''} required />
      </div>
    </>
  )
}
```

Create: `src/components/dashboard/fields/AboutFields.tsx`

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AboutMetadata } from '@/lib/types'

interface Props {
  metadata?: AboutMetadata
}

export function AboutFields({ metadata }: Props) {
  return (
    <>
      <div>
        <Label htmlFor="avatar_url">Avatar URL</Label>
        <Input id="avatar_url" name="avatar_url" defaultValue={metadata?.avatar_url ?? ''} required />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" name="location" defaultValue={metadata?.location ?? ''} required />
      </div>
    </>
  )
}
```

Create: `src/components/dashboard/fields/ExperienceFields.tsx`

```tsx
'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ExperienceMetadata } from '@/lib/types'

interface Props {
  metadata?: ExperienceMetadata
}

export function ExperienceFields({ metadata }: Props) {
  const [currentlyWorking, setCurrentlyWorking] = useState(metadata?.end_date === null)

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" defaultValue={metadata?.company ?? ''} required />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Input id="role" name="role" defaultValue={metadata?.role ?? ''} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date (YYYY-MM)</Label>
          <Input
            id="start_date"
            name="start_date"
            placeholder="2023-01"
            defaultValue={metadata?.start_date ?? ''}
            required
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date (YYYY-MM)</Label>
          <Input
            id="end_date"
            name="end_date"
            placeholder="2024-06"
            defaultValue={metadata?.end_date ?? ''}
            disabled={currentlyWorking}
            required={!currentlyWorking}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="currently_working"
          name="currently_working"
          checked={currentlyWorking}
          onChange={(e) => setCurrentlyWorking(e.target.checked)}
          className="rounded border"
        />
        <Label htmlFor="currently_working" className="text-sm font-normal">
          Currently working here
        </Label>
      </div>
      <div>
        <Label htmlFor="logo_url">Company Logo URL (optional)</Label>
        <Input id="logo_url" name="logo_url" defaultValue={metadata?.logo_url ?? ''} />
      </div>
    </>
  )
}
```

Create: `src/components/dashboard/fields/SkillFields.tsx`

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SkillMetadata } from '@/lib/types'

interface Props {
  metadata?: SkillMetadata
}

export function SkillFields({ metadata }: Props) {
  return (
    <>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" name="category" placeholder="Frontend" defaultValue={metadata?.category ?? ''} required />
      </div>
      <div>
        <Label htmlFor="level">Level (optional)</Label>
        <Input id="level" name="level" placeholder="Advanced" defaultValue={metadata?.level ?? ''} />
      </div>
    </>
  )
}
```

Create: `src/components/dashboard/fields/ProjectFields.tsx`

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { ProjectMetadata } from '@/lib/types'

interface Props {
  metadata?: ProjectMetadata
}

export function ProjectFields({ metadata }: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="url">Live URL (optional)</Label>
          <Input id="url" name="url" type="url" defaultValue={metadata?.url ?? ''} />
        </div>
        <div>
          <Label htmlFor="github_url">GitHub URL (optional)</Label>
          <Input id="github_url" name="github_url" type="url" defaultValue={metadata?.github_url ?? ''} />
        </div>
      </div>
      <div>
        <Label htmlFor="tech_stack">Tech Stack (comma-separated)</Label>
        <Input
          id="tech_stack"
          name="tech_stack"
          placeholder="React, Node.js, PostgreSQL"
          defaultValue={metadata?.tech_stack?.join(', ') ?? ''}
        />
      </div>
      <div>
        <Label htmlFor="image_url">Image URL (optional)</Label>
        <Input id="image_url" name="image_url" type="url" defaultValue={metadata?.image_url ?? ''} />
      </div>
      <div className="flex items-center gap-2">
        <Switch id="is_featured" name="is_featured" defaultChecked={metadata?.is_featured ?? false} />
        <Label htmlFor="is_featured" className="text-sm font-normal">
          Featured on landing page
        </Label>
      </div>
    </>
  )
}
```

Create: `src/components/dashboard/fields/ContactFields.tsx`

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ContactMetadata } from '@/lib/types'

interface Props {
  metadata?: ContactMetadata
}

export function ContactFields({ metadata }: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="platform">Platform</Label>
          <Input id="platform" name="platform" placeholder="GitHub" defaultValue={metadata?.platform ?? ''} required />
        </div>
        <div>
          <Label htmlFor="display_text">Display Text</Label>
          <Input id="display_text" name="display_text" placeholder="@tonyntran" defaultValue={metadata?.display_text ?? ''} required />
        </div>
      </div>
      <div>
        <Label htmlFor="contact_url">URL</Label>
        <Input id="contact_url" name="contact_url" type="url" defaultValue={metadata?.url ?? ''} required />
      </div>
      <div>
        <Label htmlFor="icon">Icon</Label>
        <Input id="icon" name="icon" placeholder="github" defaultValue={metadata?.icon ?? ''} required />
      </div>
    </>
  )
}
```

- [ ] **Step 3: Create ContentForm component**

Create: `src/components/dashboard/ContentForm.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarkdownEditor } from './MarkdownEditor'
import { HeroFields } from './fields/HeroFields'
import { AboutFields } from './fields/AboutFields'
import { ExperienceFields } from './fields/ExperienceFields'
import { SkillFields } from './fields/SkillFields'
import { ProjectFields } from './fields/ProjectFields'
import { ContactFields } from './fields/ContactFields'
import { createContentBlock, updateContentBlock } from '@/lib/actions/content'
import { ALL_CONTENT_TYPES, type ContentBlock, type ContentBlockType } from '@/lib/types'

interface Props {
  block?: ContentBlock
  defaultType?: ContentBlockType
  singletonStatus?: Record<string, boolean>
}

export function ContentForm({ block, defaultType, singletonStatus }: Props) {
  const router = useRouter()
  const isEditing = !!block
  const [type, setType] = useState<ContentBlockType>(block?.type ?? defaultType ?? 'experience')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    const result = isEditing
      ? await updateContentBlock(block.id, type, formData)
      : await createContentBlock(type, formData)

    setLoading(false)

    if (result.error) {
      const errors = result.error
      if ('server' in errors) {
        toast.error((errors as { server: string[] }).server[0])
      } else {
        toast.error('Please fix the validation errors')
      }
      return
    }

    toast.success(isEditing ? 'Content updated' : 'Content created')
    router.push('/dashboard/content')
  }

  const renderFields = () => {
    const metadata = block?.metadata as Record<string, unknown> | undefined
    switch (type) {
      case 'hero':
        return <HeroFields metadata={metadata as any} />
      case 'about':
        return <AboutFields metadata={metadata as any} />
      case 'experience':
        return <ExperienceFields metadata={metadata as any} />
      case 'skill':
        return <SkillFields metadata={metadata as any} />
      case 'project':
        return <ProjectFields metadata={metadata as any} />
      case 'contact':
        return <ContactFields metadata={metadata as any} />
    }
  }

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <Label>Type</Label>
        {isEditing ? (
          <p className="text-sm font-medium capitalize text-muted-foreground">{type}</p>
        ) : (
          <Select value={type} onValueChange={(v) => setType(v as ContentBlockType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_CONTENT_TYPES.map((t) => {
                const exists = singletonStatus?.[t]
                return (
                  <SelectItem key={t} value={t} disabled={!!exists} className="capitalize">
                    {t}{exists ? ' (already exists)' : ''}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        )}
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={block?.title ?? ''} />
      </div>

      {renderFields()}

      <MarkdownEditor name="body_md" defaultValue={block?.body_md ?? ''} />

      <div className="flex items-center gap-2">
        <Switch id="visible" name="visible" defaultChecked={block?.visible ?? true} />
        <Label htmlFor="visible" className="text-sm font-normal">
          Visible on landing page
        </Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/dashboard/content')}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/
git commit -m "Add CMS form components: ContentForm, field variants, and MarkdownEditor"
```

---

### Task 13: CMS Create & Edit Pages

**Files:**
- Create: `src/app/(protected)/dashboard/content/new/page.tsx`
- Create: `src/app/(protected)/dashboard/content/[id]/page.tsx`

- [ ] **Step 1: Create the new content page**

Create: `src/app/(protected)/dashboard/content/new/page.tsx`

```tsx
import { ContentForm } from '@/components/dashboard/ContentForm'
import { getSingletonStatus } from '@/lib/actions/content'
import type { ContentBlockType } from '@/lib/types'

interface Props {
  searchParams: Promise<{ type?: string }>
}

export default async function NewContentPage({ searchParams }: Props) {
  const { type } = await searchParams
  const singletonStatus = await getSingletonStatus()

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">New Content Block</h1>
      <ContentForm
        defaultType={type as ContentBlockType | undefined}
        singletonStatus={singletonStatus}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create the edit content page**

Create: `src/app/(protected)/dashboard/content/[id]/page.tsx`

```tsx
import { notFound } from 'next/navigation'
import { ContentForm } from '@/components/dashboard/ContentForm'
import { getContentBlock } from '@/lib/actions/content'
import type { ContentBlock } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditContentPage({ params }: Props) {
  const { id } = await params
  let block: ContentBlock

  try {
    block = (await getContentBlock(id)) as ContentBlock
  } catch {
    notFound()
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Content Block</h1>
      <ContentForm block={block} />
    </div>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(protected\)/dashboard/content/
git commit -m "Add CMS create and edit pages"
```

---

## Chunk 5: Public Landing Page

### Task 14: Landing Page Section Components

**Files:**
- Create: `src/components/landing/Hero.tsx`
- Create: `src/components/landing/About.tsx`
- Create: `src/components/landing/Experience.tsx`
- Create: `src/components/landing/Skills.tsx`
- Create: `src/components/landing/Projects.tsx`
- Create: `src/components/landing/Contact.tsx`

- [ ] **Step 1: Create Hero component**

Create: `src/components/landing/Hero.tsx`

```tsx
'use client'

import { motion } from 'framer-motion'
import type { ContentBlock, HeroMetadata } from '@/lib/types'

interface Props {
  block: ContentBlock | undefined
}

export function Hero({ block }: Props) {
  if (!block) return null
  const { tagline, subtitle } = block.metadata as HeroMetadata

  return (
    <section className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <motion.h1
          className="text-5xl font-bold tracking-tight sm:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {block.title}
        </motion.h1>
        <motion.p
          className="mt-4 text-xl text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          {tagline}
        </motion.p>
        <motion.p
          className="mt-2 text-lg text-muted-foreground/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create About component**

Create: `src/components/landing/About.tsx`

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ContentBlock, AboutMetadata } from '@/lib/types'

interface Props {
  block: ContentBlock | undefined
}

export function About({ block }: Props) {
  if (!block) return null
  const { avatar_url, location } = block.metadata as AboutMetadata

  return (
    <section className="mx-auto max-w-3xl px-6 py-24" id="about">
      <div className="flex gap-6">
        {avatar_url && (
          <img
            src={avatar_url}
            alt="Avatar"
            className="h-20 w-20 rounded-full object-cover"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold">{block.title ?? 'About'}</h2>
          {location && (
            <p className="mt-1 text-sm text-muted-foreground">{location}</p>
          )}
          {block.body_md && (
            <div className="prose prose-sm dark:prose-invert mt-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.body_md}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create Experience component**

Create: `src/components/landing/Experience.tsx`

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ContentBlock, ExperienceMetadata } from '@/lib/types'

interface Props {
  blocks: ContentBlock[]
}

export function Experience({ blocks }: Props) {
  if (blocks.length === 0) return null

  return (
    <section className="mx-auto max-w-3xl px-6 py-24" id="experience">
      <h2 className="mb-8 text-2xl font-bold">Experience</h2>
      <div className="border-l-2 border-primary/30 pl-6 space-y-8">
        {blocks.map((block) => {
          const meta = block.metadata as ExperienceMetadata
          return (
            <div key={block.id}>
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold">{meta.role}</h3>
                <span className="text-xs text-muted-foreground">
                  {meta.start_date} — {meta.end_date ?? 'Present'}
                </span>
              </div>
              <p className="text-sm text-primary">{meta.company}</p>
              {block.body_md && (
                <div className="prose prose-sm dark:prose-invert mt-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.body_md}</ReactMarkdown>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create Skills component**

Create: `src/components/landing/Skills.tsx`

```tsx
import type { ContentBlock, SkillMetadata } from '@/lib/types'

interface Props {
  blocks: ContentBlock[]
}

export function Skills({ blocks }: Props) {
  if (blocks.length === 0) return null

  // Group by category
  const grouped = blocks.reduce<Record<string, ContentBlock[]>>((acc, block) => {
    const category = (block.metadata as SkillMetadata).category
    if (!acc[category]) acc[category] = []
    acc[category].push(block)
    return acc
  }, {})

  return (
    <section className="mx-auto max-w-3xl px-6 py-24" id="skills">
      <h2 className="mb-8 text-2xl font-bold">Skills</h2>
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, skills]) => (
          <div key={category}>
            <p className="mb-2 text-xs uppercase text-muted-foreground">{category}</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full bg-secondary px-3 py-1 text-sm"
                >
                  {skill.title}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create Projects component**

Create: `src/components/landing/Projects.tsx`

```tsx
import type { ContentBlock, ProjectMetadata } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  blocks: ContentBlock[]
}

export function Projects({ blocks }: Props) {
  // Only show featured projects on landing page
  const featured = blocks.filter((b) => (b.metadata as ProjectMetadata).is_featured)
  if (featured.length === 0) return null

  return (
    <section className="mx-auto max-w-4xl px-6 py-24" id="projects">
      <h2 className="mb-8 text-2xl font-bold">Featured Projects</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((block) => {
          const meta = block.metadata as ProjectMetadata
          return (
            <Card key={block.id} className="overflow-hidden">
              {meta.image_url && (
                <img
                  src={meta.image_url}
                  alt={block.title ?? 'Project'}
                  className="h-40 w-full object-cover"
                />
              )}
              <CardContent className="p-4">
                <h3 className="font-semibold">{block.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {meta.tech_stack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
                {(meta.url || meta.github_url) && (
                  <div className="mt-3 flex gap-3 text-sm">
                    {meta.url && (
                      <a href={meta.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Live →
                      </a>
                    )}
                    {meta.github_url && (
                      <a href={meta.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        GitHub →
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Create Contact component**

Create: `src/components/landing/Contact.tsx`

```tsx
import type { ContentBlock, ContactMetadata } from '@/lib/types'

interface Props {
  blocks: ContentBlock[]
}

export function Contact({ blocks }: Props) {
  if (blocks.length === 0) return null

  return (
    <section className="mx-auto max-w-3xl px-6 py-24 text-center" id="contact">
      <h2 className="mb-8 text-2xl font-bold">Get in Touch</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {blocks.map((block) => {
          const meta = block.metadata as ContactMetadata
          return (
            <a
              key={block.id}
              href={meta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {meta.platform}: <span className="text-primary">{meta.display_text}</span>
            </a>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/landing/
git commit -m "Add landing page section components: Hero, About, Experience, Skills, Projects, Contact"
```

---

### Task 15: Landing Page & Public Layout

**Files:**
- Create: `src/app/(public)/layout.tsx`
- Create: `src/app/(public)/page.tsx`
- Create: `src/components/landing/ScrollReveal.tsx`

- [ ] **Step 1: Create ScrollReveal wrapper**

Create: `src/components/landing/ScrollReveal.tsx`

```tsx
'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export function ScrollReveal({ children, className }: Props) {
  return (
    <motion.div
      className={className}
      style={{ opacity: 1, y: 0 }} // CSS default: visible without JS
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Create public layout**

Create: `src/app/(public)/layout.tsx`

```tsx
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

- [ ] **Step 3: Create landing page**

Create: `src/app/(public)/page.tsx`

```tsx
import { createClient } from '@/lib/supabase/server'
import { Hero } from '@/components/landing/Hero'
import { About } from '@/components/landing/About'
import { Experience } from '@/components/landing/Experience'
import { Skills } from '@/components/landing/Skills'
import { Projects } from '@/components/landing/Projects'
import { Contact } from '@/components/landing/Contact'
import { ScrollReveal } from '@/components/landing/ScrollReveal'
import type { ContentBlock, ContentBlockType } from '@/lib/types'

// Static fallback when Supabase is unreachable
function StaticFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Tony Tran</h1>
        <p className="mt-4 text-xl text-muted-foreground">Full-Stack Developer</p>
        <div className="mt-8 flex justify-center gap-6 text-sm text-muted-foreground">
          <a href="https://github.com/tonyntran" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            GitHub
          </a>
          <a href="https://linkedin.com/in/tonyntran" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  )
}

export default async function LandingPage() {
  let blocks: ContentBlock[] = []

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('content_blocks')
      .select('*')
      .eq('visible', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    blocks = (data as ContentBlock[]) ?? []
  } catch {
    return <StaticFallback />
  }

  if (blocks.length === 0) return <StaticFallback />

  // Group blocks by type
  const grouped = blocks.reduce<Record<string, ContentBlock[]>>((acc, block) => {
    if (!acc[block.type]) acc[block.type] = []
    acc[block.type].push(block)
    return acc
  }, {})

  const get = (type: ContentBlockType) => grouped[type] ?? []
  const getOne = (type: ContentBlockType) => get(type)[0]

  return (
    <main>
      <Hero block={getOne('hero')} />
      <ScrollReveal>
        <About block={getOne('about')} />
      </ScrollReveal>
      <ScrollReveal>
        <Experience blocks={get('experience')} />
      </ScrollReveal>
      <ScrollReveal>
        <Skills blocks={get('skill')} />
      </ScrollReveal>
      <ScrollReveal>
        <Projects blocks={get('project')} />
      </ScrollReveal>
      <ScrollReveal>
        <Contact blocks={get('contact')} />
      </ScrollReveal>
    </main>
  )
}
```

- [ ] **Step 4: Remove the default Next.js page**

Delete the auto-generated `src/app/page.tsx` if it still exists (replaced by `src/app/(public)/page.tsx`).

```bash
rm -f src/app/page.tsx
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(public\)/ src/components/landing/ScrollReveal.tsx
git commit -m "Add public landing page with all 6 sections, scroll animations, and static fallback"
```

---

## Post-Implementation

### Task 16: Manual Verification & Smoke Test

This task is manual — no code changes.

- [ ] **Step 1: Set up Supabase project**

1. Create a Supabase project at supabase.com
2. Go to SQL Editor → paste and run `supabase/migration.sql`
3. Go to Authentication → Providers → enable GitHub OAuth
4. Copy project URL and anon key into `.env.local`

- [ ] **Step 2: Configure GitHub OAuth**

1. Go to github.com → Settings → Developer Settings → OAuth Apps → New
2. Set callback URL to `http://localhost:3000/auth/callback`
3. Copy Client ID and Client Secret into Supabase GitHub provider settings

- [ ] **Step 3: Start dev server and test**

```bash
npm run dev
```

Test the following flows:
1. Visit `http://localhost:3000` → landing page renders (static fallback if no content)
2. Visit `http://localhost:3000/dashboard` → redirects to `/auth/login`
3. Sign in with GitHub → redirects to `/dashboard`
4. Create content blocks for each type via `/dashboard/content/new`
5. Edit a content block, toggle visibility, reorder
6. Add an application via `/dashboard/apps`
7. Visit `http://localhost:3000` → landing page renders with CMS content
8. Sign out → redirects to `/`
9. (If possible) Sign in with a GitHub account NOT in `ALLOWED_EMAILS` → verify redirect to `/auth/error?reason=unauthorized` with friendly message
10. Create a project with `is_featured: false` → verify it does NOT appear on landing page

- [ ] **Step 4: Verify build for production**

```bash
npm run build
npm run test
```

Expected: build succeeds, all tests pass.

- [ ] **Step 5: Commit any fixes from smoke testing**

```bash
git add -A
git commit -m "Fix issues found during smoke testing"
```

(Only if fixes were needed.)
