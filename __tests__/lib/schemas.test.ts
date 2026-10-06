import { describe, it, expect } from 'vitest'
import {
  heroMetadataSchema,
  aboutMetadataSchema,
  experienceMetadataSchema,
  skillMetadataSchema,
  projectMetadataSchema,
  contactMetadataSchema,
  blogPostMetadataSchema,
  pollMetadataSchema,
  applicationSchema,
} from '@/lib/schemas'

// All metadata schemas + applicationSchema are tested below

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
      resume_url: null,
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

describe('blogPostMetadataSchema', () => {
  it('accepts valid blog post metadata', () => {
    const result = blogPostMetadataSchema.safeParse({
      slug: 'week-4-recap',
      excerpt: 'A wild week in the league.',
      cover_image_url: 'https://example.com/cover.jpg',
    })
    expect(result.success).toBe(true)
  })

  it('accepts null excerpt and cover_image_url', () => {
    const result = blogPostMetadataSchema.safeParse({
      slug: 'week-4-recap',
      excerpt: null,
      cover_image_url: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a slug with uppercase letters or spaces', () => {
    const result = blogPostMetadataSchema.safeParse({
      slug: 'Week 4 Recap',
      excerpt: null,
      cover_image_url: null,
    })
    expect(result.success).toBe(false)
  })

  describe('component field', () => {
    const base = { slug: 'week-4-recap', excerpt: null, cover_image_url: null }

    it('accepts metadata with no component field at all', () => {
      expect(blogPostMetadataSchema.safeParse(base).success).toBe(true)
    })

    it('accepts a null component', () => {
      expect(blogPostMetadataSchema.safeParse({ ...base, component: null }).success).toBe(true)
    })

    it('accepts a registered component key', () => {
      const result = blogPostMetadataSchema.safeParse({ ...base, component: 'dirty-p-week-4' })
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.component).toBe('dirty-p-week-4')
    })

    it('normalises an empty component string to null', () => {
      const result = blogPostMetadataSchema.safeParse({ ...base, component: '' })
      expect(result.success).toBe(true)
      if (result.success) expect(result.data.component).toBeNull()
    })
  })
})

describe('pollMetadataSchema', () => {
  it('accepts valid poll options', () => {
    const result = pollMetadataSchema.safeParse({ options: ['Yes', 'No'] })
    expect(result.success).toBe(true)
  })

  it('rejects fewer than 2 options', () => {
    const result = pollMetadataSchema.safeParse({ options: ['Only one'] })
    expect(result.success).toBe(false)
  })

  it('rejects more than 8 options', () => {
    const result = pollMetadataSchema.safeParse({ options: Array.from({ length: 9 }, (_, i) => `Option ${i}`) })
    expect(result.success).toBe(false)
  })

  it('rejects an empty option string', () => {
    const result = pollMetadataSchema.safeParse({ options: ['Yes', ''] })
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

describe('blog_post metadata round-trip through the dashboard form', () => {
  it('keeps the component key when the form submits one', () => {
    const fd = new FormData()
    fd.set('slug', 'the-standings-are-lying-to-you')
    fd.set('excerpt', 'Week 4 recap.')
    fd.set('cover_image_url', '')
    fd.set('component', 'dirty-p-week-4')

    const metadata = {
      slug: fd.get('slug'),
      excerpt: (fd.get('excerpt') as string) || null,
      cover_image_url: (fd.get('cover_image_url') as string) || null,
      component: (fd.get('component') as string) || null,
    }
    const result = blogPostMetadataSchema.safeParse(metadata)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.component).toBe('dirty-p-week-4')
  })

  it('stores null when the form leaves the custom layout unset', () => {
    const fd = new FormData()
    fd.set('slug', 'a-normal-post')
    fd.set('excerpt', '')
    fd.set('cover_image_url', '')
    fd.set('component', '')

    const result = blogPostMetadataSchema.safeParse({
      slug: fd.get('slug'),
      excerpt: (fd.get('excerpt') as string) || null,
      cover_image_url: (fd.get('cover_image_url') as string) || null,
      component: (fd.get('component') as string) || null,
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.component).toBeNull()
  })
})
