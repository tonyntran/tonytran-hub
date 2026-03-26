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
