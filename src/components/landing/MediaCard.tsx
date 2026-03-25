'use client'

import { useRef, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import type { ContentBlock, ProjectMetadata } from '@/lib/types'

interface Props {
  block: ContentBlock
  className?: string
  hasVideo?: boolean
}

const GRADIENTS = [
  'linear-gradient(135deg, #2D3748 0%, #1A365D 40%, #2A4365 100%)',
  'linear-gradient(135deg, #2D2D2D 0%, #1A1A2E 40%, #16213E 100%)',
  'linear-gradient(135deg, #1A1F16 0%, #2D3320 40%, #1A2410 100%)',
]

const LIGHT_GRADIENTS = [
  'linear-gradient(135deg, #E0D6C6 0%, #D2C7B4 40%, #DCD2C3 100%)',
  'linear-gradient(135deg, #DDD3C4 0%, #CFC3B2 40%, #D8CDBC 100%)',
  'linear-gradient(135deg, #E2D9CA 0%, #D4C9B8 40%, #DED4C5 100%)',
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

export function MediaCard({ block, className = '', hasVideo = false }: Props) {
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
          ) : (
            <div
              className="landing-media-visual-placeholder"
              style={{ background: gradients[gradientIndex] }}
            >
              <MockApp />
            </div>
          )}
          {hasVideo && <div className="landing-play-icon" />}
        </div>
      </div>
      <span className="landing-media-close">&times;</span>
    </div>
  )
}
