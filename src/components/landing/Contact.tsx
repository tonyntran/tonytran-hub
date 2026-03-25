'use client'

import { motion } from 'framer-motion'
import type { ContentBlock, ContactMetadata } from '@/lib/types'

interface Props {
  blocks: ContentBlock[]
}

export function Contact({ blocks }: Props) {
  if (blocks.length === 0) return null

  const emailContact = blocks.find(
    (b) => (b.metadata as ContactMetadata).platform.toLowerCase() === 'email'
  )
  const emailUrl = emailContact
    ? (emailContact.metadata as ContactMetadata).url
    : '#'

  return (
    <motion.div
      className="landing-card landing-contact"
      id="contact"
      initial={{ opacity: 0, y: 60, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <div>
        <div className="landing-contact-heading">Let&apos;s work together</div>
        <div className="landing-contact-sub">
          Always open to interesting projects and conversations.
        </div>
      </div>
      <div className="landing-contact-links">
        <a className="landing-contact-btn landing-contact-btn-primary" href={emailUrl}>
          Get in Touch
        </a>
        <a className="landing-contact-btn landing-contact-btn-secondary" href="#" target="_blank" rel="noopener noreferrer">
          Resume
        </a>
      </div>
    </motion.div>
  )
}
