import { createClient } from '@/lib/supabase/server'
import { Hero } from '@/components/landing/Hero'
import { About } from '@/components/landing/About'
import { Experience } from '@/components/landing/Experience'
import { Skills } from '@/components/landing/Skills'
import { Projects } from '@/components/landing/Projects'
import { Contact } from '@/components/landing/Contact'
import { ScrollReveal } from '@/components/landing/ScrollReveal'
import type { ContentBlock, ContentBlockType } from '@/lib/types'

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
