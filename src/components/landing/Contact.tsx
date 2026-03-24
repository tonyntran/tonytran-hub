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
    <div className="landing-card landing-contact" id="contact">
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
    </div>
  )
}
