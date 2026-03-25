import type { ContentBlock, HeroMetadata } from '@/lib/types'
import { AnimatedCard } from './AnimatedCard'

interface Props {
  block: ContentBlock | undefined
}

export function BentoHero({ block }: Props) {
  if (!block) return null
  const { subtitle } = block.metadata as HeroMetadata

  return (
    <AnimatedCard className="landing-card landing-bento-hero" delay={0}>
      <div className="landing-bento-hello">// Hello, world</div>
      <div className="landing-bento-title">
        Building things<br />for the web
      </div>
      <div className="landing-bento-subtitle">
        Full-stack developer crafting modern applications with{' '}
        <span className="landing-hero-highlight">React</span>,{' '}
        <span className="landing-hero-highlight">Next.js</span>, and{' '}
        <span className="landing-hero-highlight">cloud infrastructure</span>.{' '}
        {subtitle}
      </div>
    </AnimatedCard>
  )
}
