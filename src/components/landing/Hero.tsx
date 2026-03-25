'use client'

import { useEffect, useRef } from 'react'
import type { ContentBlock } from '@/lib/types'
import { ParticleCanvas } from './ParticleCanvas'

interface Props {
  block: ContentBlock | undefined
}

export function Hero({ block }: Props) {
  if (!block) return null

  const avatarRef = useRef<HTMLDivElement>(null)

  const scrollToPortfolio = () => {
    document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Mouse parallax — rings tilt slightly toward cursor
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      const el = avatarRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / window.innerWidth
      const dy = (e.clientY - cy) / window.innerHeight
      el.style.setProperty('--mx', `${dx * 12}deg`)
      el.style.setProperty('--my', `${dy * -12}deg`)
    }

    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  return (
    <section className="landing-hero" id="heroSection">
      <ParticleCanvas />
      <div className="landing-hero-content">
        <div className="landing-hero-avatar" ref={avatarRef}>
          {/* Orbital rings with traveling dots */}
          <div className="landing-hero-ring landing-hero-ring-1">
            <span className="landing-hero-orbit-dot" />
            <span className="landing-hero-orbit-dot" style={{ '--dot-pos': '0.5turn' } as React.CSSProperties} />
          </div>
          <div className="landing-hero-ring landing-hero-ring-2">
            <span className="landing-hero-orbit-dot" />
          </div>
          <div className="landing-hero-ring landing-hero-ring-3">
            <span className="landing-hero-orbit-dot" />
            <span className="landing-hero-orbit-dot" style={{ '--dot-pos': '0.6turn' } as React.CSSProperties} />
            <span className="landing-hero-orbit-dot" style={{ '--dot-pos': '0.3turn' } as React.CSSProperties} />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/profile.png" alt="Tony Tran" />
        </div>
        <div className="landing-hero-text">
          <div className="landing-hero-pre">Portfolio / 2026</div>
          <div className="landing-hero-name">{block.title}</div>
          <div className="landing-hero-divider" />
          <div className="landing-hero-tagline">Full Stack Engineer</div>
          <button className="landing-hero-cta" onClick={scrollToPortfolio}>
            Explore My Work
          </button>
        </div>
      </div>
      <div className="landing-scroll-indicator">
        <span>Scroll</span>
        <div className="landing-scroll-line" />
      </div>
    </section>
  )
}
