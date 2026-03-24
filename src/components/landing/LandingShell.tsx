'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import type { ContentBlock } from '@/lib/types'

interface Props {
  aboutBlock: ContentBlock | undefined
  contactBlocks: ContentBlock[]
  children: ReactNode
}

export function LandingShell({ aboutBlock, contactBlocks, children }: Props) {
  const [revealed, setRevealed] = useState(false)
  const revealedRef = useRef(false)

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY
      const heroH = window.innerHeight
      const progress = Math.min(scrollY / (heroH * 0.6), 1)

      // Fade hero section
      const hero = document.getElementById('heroSection')
      if (hero) {
        hero.style.opacity = String(1 - progress)
        hero.style.transform = `scale(${1 - progress * 0.05})`
      }

      // Reveal at 40%, hide if scrolled back above 20%
      if (progress > 0.4 && !revealedRef.current) {
        revealedRef.current = true
        setRevealed(true)
      }
      if (progress < 0.2 && revealedRef.current) {
        revealedRef.current = false
        setRevealed(false)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="landing-layout" id="portfolio">
      <Sidebar
        aboutBlock={aboutBlock}
        contactBlocks={contactBlocks}
        visible={revealed}
      />
      <main className={`landing-main ${revealed ? 'visible' : ''}`} id="mainContent">
        <div className="landing-bento">
          {children}
        </div>
      </main>
    </div>
  )
}
