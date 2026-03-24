import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, type Mock } from 'vitest'
import type { ContentBlock } from '@/lib/types'

// Mock canvas context since jsdom doesn't support it
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  fillRect: vi.fn(),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  set strokeStyle(_v: string) {},
  set fillStyle(_v: string | CanvasGradient) {},
  set lineWidth(_v: number) {},
})) as unknown as typeof HTMLCanvasElement.prototype.getContext

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        return ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
          const Element = prop as keyof React.JSX.IntrinsicElements
          return <Element {...props}>{children}</Element>
        }
      },
    }
  ),
}))

// Helper to make a content block for tests
function makeBlock(overrides: Partial<ContentBlock> & { type: ContentBlock['type']; metadata: ContentBlock['metadata'] }): ContentBlock {
  return {
    id: '1',
    title: null,
    body_md: null,
    sort_order: 0,
    visible: true,
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

describe('ParticleCanvas', () => {
  it('renders a canvas element', async () => {
    const { ParticleCanvas } = await import('@/components/landing/ParticleCanvas')
    render(<ParticleCanvas />)
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })
})

describe('Hero', () => {
  it('renders hero name and tagline from content block', async () => {
    const { Hero } = await import('@/components/landing/Hero')
    const block = makeBlock({
      type: 'hero',
      title: 'Tony Tran',
      metadata: { tagline: 'Full-Stack Developer', subtitle: 'Building for the web' },
    })
    render(<Hero block={block} />)
    expect(screen.getByText('Tony Tran')).toBeInTheDocument()
    expect(screen.getByText('Full-Stack Developer')).toBeInTheDocument()
  })

  it('returns null when no block provided', async () => {
    const { Hero } = await import('@/components/landing/Hero')
    const { container } = render(<Hero block={undefined} />)
    expect(container.innerHTML).toBe('')
  })
})

describe('Sidebar', () => {
  it('renders name and location', async () => {
    const { Sidebar } = await import('@/components/landing/Sidebar')
    const aboutBlock = makeBlock({
      type: 'about',
      title: 'About',
      metadata: { avatar_url: '', location: 'Based in the US' },
    })
    render(<Sidebar aboutBlock={aboutBlock} contactBlocks={[]} visible={true} />)
    expect(screen.getByText('Tony Tran')).toBeInTheDocument()
    expect(screen.getByText('Based in the US')).toBeInTheDocument()
  })
})

describe('BentoHero', () => {
  it('renders greeting and subtitle', async () => {
    const { BentoHero } = await import('@/components/landing/BentoHero')
    const block = makeBlock({
      type: 'hero',
      title: 'Tony Tran',
      metadata: { tagline: 'Full-Stack Developer', subtitle: 'Building modern applications' },
    })
    render(<BentoHero block={block} />)
    expect(screen.getByText('// Hello, world')).toBeInTheDocument()
  })
})

describe('About', () => {
  it('renders about text from body_md', async () => {
    const { About } = await import('@/components/landing/About')
    const block = makeBlock({
      type: 'about',
      title: 'About',
      metadata: { avatar_url: '', location: 'US' },
      body_md: 'Developer with a passion for building.',
    })
    render(<About block={block} />)
    expect(screen.getByText(/Developer with a passion/)).toBeInTheDocument()
  })
})

describe('Skills', () => {
  it('renders skill tags grouped by category', async () => {
    const { Skills } = await import('@/components/landing/Skills')
    const blocks = [
      makeBlock({ id: '1', type: 'skill', title: 'React', metadata: { category: 'Frontend', level: null } }),
      makeBlock({ id: '2', type: 'skill', title: 'Node.js', metadata: { category: 'Backend', level: null }, sort_order: 1 }),
    ]
    render(<Skills blocks={blocks} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.getByText('Frontend')).toBeInTheDocument()
  })
})

describe('Experience', () => {
  it('renders timeline entries', async () => {
    const { Experience } = await import('@/components/landing/Experience')
    const blocks = [
      makeBlock({
        type: 'experience',
        metadata: { company: 'Acme Corp', role: 'Software Engineer', start_date: '2023-01', end_date: null, logo_url: null },
        body_md: 'Built platforms.',
      }),
    ]
    render(<Experience blocks={blocks} />)
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })
})

describe('MediaCard', () => {
  it('renders project title and tech tags', async () => {
    const { MediaCard } = await import('@/components/landing/MediaCard')
    const block = makeBlock({
      type: 'project',
      title: 'Portfolio Hub',
      metadata: { url: null, github_url: null, tech_stack: ['Next.js', 'Supabase'], image_url: null, is_featured: true },
      body_md: 'A modular portfolio system.',
    })
    render(<MediaCard block={block} />)
    expect(screen.getByText('Portfolio Hub')).toBeInTheDocument()
    expect(screen.getByText('Next.js')).toBeInTheDocument()
  })
})

describe('Contact', () => {
  it('renders heading', async () => {
    const { Contact } = await import('@/components/landing/Contact')
    const blocks = [
      makeBlock({
        type: 'contact',
        title: 'Email',
        metadata: { platform: 'Email', url: 'mailto:test@test.com', icon: 'mail', display_text: 'test@test.com' },
      }),
    ]
    render(<Contact blocks={blocks} />)
    expect(screen.getByText("Let's work together")).toBeInTheDocument()
  })
})
