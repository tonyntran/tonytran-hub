'use client'

import { motion } from 'framer-motion'
import type { ContentBlock, HeroMetadata } from '@/lib/types'

interface Props {
  block: ContentBlock | undefined
}

export function Hero({ block }: Props) {
  if (!block) return null
  const { tagline, subtitle } = block.metadata as HeroMetadata

  return (
    <section className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <motion.h1
          className="text-5xl font-bold tracking-tight sm:text-7xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {block.title}
        </motion.h1>
        <motion.p
          className="mt-4 text-xl text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        >
          {tagline}
        </motion.p>
        <motion.p
          className="mt-2 text-lg text-muted-foreground/70"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  )
}
