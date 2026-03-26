'use client'

import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  Globe,
  Instagram,
  Youtube,
  Facebook,
  type LucideIcon,
} from 'lucide-react'
import type { ContentBlock, AboutMetadata, ContactMetadata } from '@/lib/types'
import { ThemeToggle } from './ThemeToggle'

interface Props {
  aboutBlock: ContentBlock | undefined
  contactBlocks: ContentBlock[]
  visible: boolean
}

const NAV_ITEMS = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
]

const ICON_MAP: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  mail: Mail,
  email: Mail,
  globe: Globe,
  website: Globe,
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
}

function getIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName.toLowerCase()] ?? Globe
}

export function Sidebar({ aboutBlock, contactBlocks, visible }: Props) {
  const about = aboutBlock?.metadata as AboutMetadata | undefined

  return (
    <aside className={`landing-sidebar ${visible ? 'visible' : ''}`} id="sidebar">
      <div>
        <div className="landing-sidebar-avatar">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/profile.png" alt="Tony Tran" />
        </div>
        <div className="landing-sidebar-name">Tony Tran</div>
        <div className="landing-sidebar-role">Full-Stack Developer</div>
        {about?.location && (
          <div className="landing-sidebar-location">{about.location}</div>
        )}
        <nav className="landing-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
      <div>
        <div className="landing-sidebar-status">
          <span className="landing-status-dot" />
          Open to opportunities
        </div>
        <ThemeToggle />
        <div className="landing-sidebar-socials">
          {contactBlocks.map((block) => {
            const meta = block.metadata as ContactMetadata
            const Icon = getIcon(meta.icon)
            return (
              <a
                key={block.id}
                href={meta.url}
                target="_blank"
                rel="noopener noreferrer"
                title={meta.platform}
              >
                <Icon size={16} />
              </a>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
