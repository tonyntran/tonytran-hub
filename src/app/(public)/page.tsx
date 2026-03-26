import { createClient } from '@/lib/supabase/server'
import { Hero } from '@/components/landing/Hero'
import { LandingShell } from '@/components/landing/LandingShell'
import { About } from '@/components/landing/About'
import { Skills } from '@/components/landing/Skills'
import { Projects } from '@/components/landing/Projects'
import { Experience } from '@/components/landing/Experience'
import { Contact } from '@/components/landing/Contact'
import type { ContentBlock, ContentBlockType } from '@/lib/types'

function StaticFallback() {
  return (
    <div className="landing-theme">
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div
            className="landing-hero-name"
            style={{ opacity: 1, transform: 'none', animation: 'none' }}
          >
            Tony Tran
          </div>
          <div
            className="landing-hero-tagline"
            style={{ opacity: 1, transform: 'none', animation: 'none' }}
          >
            Full-Stack Developer
          </div>
        </div>
      </section>
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

  const grouped = blocks.reduce<Record<string, ContentBlock[]>>((acc, block) => {
    if (!acc[block.type]) acc[block.type] = []
    acc[block.type].push(block)
    return acc
  }, {})

  const get = (type: ContentBlockType) => grouped[type] ?? []
  const getOne = (type: ContentBlockType) => get(type)[0]

  return (
    <div className="landing-theme">
      <Hero block={getOne('hero')} />
      <LandingShell aboutBlock={getOne('about')} contactBlocks={get('contact')}>
        <div className="landing-bento-left">
          <About block={getOne('about')} />
          <Experience blocks={get('experience')} />
          <Skills blocks={get('skill')} />
        </div>
        <div className="landing-bento-right">
          <Projects blocks={get('project')} />
        </div>
        <Contact blocks={get('contact')} aboutBlock={getOne('about')} />
      </LandingShell>
    </div>
  )
}
