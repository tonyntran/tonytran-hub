'use client'

import type { ContentBlock, HeroMetadata } from '@/lib/types'
import { ParticleCanvas } from './ParticleCanvas'

interface Props {
  block: ContentBlock | undefined
}

export function Hero({ block }: Props) {
  if (!block) return null
  const { tagline } = block.metadata as HeroMetadata

  const scrollToPortfolio = () => {
    document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="landing-hero" id="heroSection">
      <ParticleCanvas />
      <div className="landing-hero-content">
        <div className="landing-hero-avatar">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/profile.png" alt="Tony Tran" />
        </div>
        <div className="landing-hero-name">{block.title}</div>
        <div className="landing-hero-tagline">{tagline}</div>
        <button className="landing-hero-cta" onClick={scrollToPortfolio}>
          Explore My Work
        </button>
      </div>
      <div className="landing-scroll-indicator">
        <span>Scroll</span>
        <div className="landing-scroll-line" />
      </div>
    </section>
  )
}
