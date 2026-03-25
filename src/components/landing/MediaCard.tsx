'use client'

import { useRef, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import type { ContentBlock, ProjectMetadata } from '@/lib/types'
import { AnimatedCard } from './AnimatedCard'
import { FantasyFootballPreview } from './previews/FantasyFootballPreview'
import { PokemonTCGPreview } from './previews/PokemonTCGPreview'
import { WeddingPreview } from './previews/WeddingPreview'

const PREVIEW_MATCHERS: Array<{ keywords: string[]; component: React.ComponentType }> = [
  { keywords: ['football', 'auction', 'draft'], component: FantasyFootballPreview },
  { keywords: ['pokemon', 'tcg', 'card market'], component: PokemonTCGPreview },
  { keywords: ['wedding'], component: WeddingPreview },
]

function getPreviewComponent(title: string | null): React.ComponentType | null {
  if (!title) return null
  const lower = title.toLowerCase()
  const match = PREVIEW_MATCHERS.find(m => m.keywords.some(kw => lower.includes(kw)))
  return match?.component ?? null
}

interface Props {
  block: ContentBlock
  className?: string
  hasVideo?: boolean
  index?: number
}

const GRADIENTS = [
  'linear-gradient(135deg, #2D3748 0%, #1A365D 40%, #2A4365 100%)',
  'linear-gradient(135deg, #2D2D2D 0%, #1A1A2E 40%, #16213E 100%)',
  'linear-gradient(135deg, #1A1F16 0%, #2D3320 40%, #1A2410 100%)',
]

const LIGHT_GRADIENTS = [
  'linear-gradient(135deg, #D8CDBC 0%, #CCBFAC 40%, #D2C7B4 100%)',
  'linear-gradient(135deg, #D5C9B8 0%, #C8BBAA 40%, #CEBFAE 100%)',
  'linear-gradient(135deg, #DCD1C0 0%, #CFC3B2 40%, #D6CBBA 100%)',
]

function MockApp() {
  return (
    <div className="landing-mock-app">
      <div className="landing-mock-topbar">
        <span className="landing-mock-dot" />
        <span className="landing-mock-dot" />
        <span className="landing-mock-dot" />
      </div>
      <div className="landing-mock-side" />
      <div className="landing-mock-body">
        <div className="landing-mock-line" />
        <div className="landing-mock-line short" />
        <div className="landing-mock-line accent" />
        <div className="landing-mock-line" />
        <div className="landing-mock-line short" />
      </div>
    </div>
  )
}

export function MediaCard({ block, className = '', hasVideo = false, index = 0 }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Use dark gradients during SSR to match server render, then swap after mount
  const gradients = mounted && theme === 'light' ? LIGHT_GRADIENTS : GRADIENTS
  const meta = block.metadata as ProjectMetadata

  // Auto-measure info panel height for hover transition
  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    const info = card.querySelector('.landing-media-info') as HTMLElement | null
    if (!info) return

    info.style.transform = 'translateY(0)'
    info.style.opacity = '1'
    const h = info.offsetHeight
    info.style.transform = ''
    info.style.opacity = ''
    card.style.setProperty('--info-h', `${h}px`)
  }, [])

  const gradientIndex = Math.abs(block.id.charCodeAt(0)) % gradients.length

  return (
    <AnimatedCard delay={0.05 + index * 0.1}>
      <div ref={cardRef} className={`landing-card landing-media-card ${className}`}>
        <div className="landing-media-wrapper">
        <div className="landing-media-info">
          <div className="landing-media-title">{block.title}</div>
          <div className="landing-media-meta">
            {meta.tech_stack[0] ?? 'Project'} &middot; {new Date(block.created_at || Date.now()).getFullYear()}
          </div>
          {block.body_md && (
            <div className="landing-media-desc">{block.body_md}</div>
          )}
          {meta.tech_stack.length > 0 && (
            <div className="landing-media-tags">
              {meta.tech_stack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>
          )}
          <div className="landing-media-links">
            {meta.url && (
              <a href={meta.url} target="_blank" rel="noopener noreferrer">
                Live Demo &rarr;
              </a>
            )}
            {meta.github_url && (
              <a href={meta.github_url} target="_blank" rel="noopener noreferrer">
                GitHub &rarr;
              </a>
            )}
          </div>
        </div>
        <div className="landing-media-visual">
          {meta.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={meta.image_url} alt={block.title ?? 'Project'} />
          ) : (() => {
            const PreviewComponent = getPreviewComponent(block.title)
            return PreviewComponent ? (
              <div
                className="landing-media-visual-placeholder"
                style={{ background: 'var(--landing-bg-card)' }}
              >
                <PreviewComponent />
              </div>
            ) : (
              <div
                className="landing-media-visual-placeholder"
                style={{ background: gradients[gradientIndex] }}
              >
                <MockApp />
              </div>
            )
          })()}
          {hasVideo && <div className="landing-play-icon" />}
        </div>
      </div>
      <span className="landing-media-close">&times;</span>
      </div>
    </AnimatedCard>
  )
}
