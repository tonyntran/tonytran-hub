export type ContentBlockType = 'hero' | 'about' | 'experience' | 'skill' | 'project' | 'contact'

export const SINGLETON_TYPES: ContentBlockType[] = ['hero', 'about']
export const COLLECTION_TYPES: ContentBlockType[] = ['experience', 'skill', 'project', 'contact']
export const ALL_CONTENT_TYPES: ContentBlockType[] = [...SINGLETON_TYPES, ...COLLECTION_TYPES]

export interface HeroMetadata {
  tagline: string
  subtitle: string
}

export interface AboutMetadata {
  avatar_url: string
  location: string
}

export interface ExperienceMetadata {
  company: string
  role: string
  start_date: string
  end_date: string | null
  logo_url: string | null
}

export interface SkillMetadata {
  category: string
  level: string | null
}

export interface ProjectMetadata {
  url: string | null
  github_url: string | null
  tech_stack: string[]
  image_url: string | null
  is_featured: boolean
}

export interface ContactMetadata {
  platform: string
  url: string
  icon: string
  display_text: string
}

export type ContentMetadata =
  | HeroMetadata
  | AboutMetadata
  | ExperienceMetadata
  | SkillMetadata
  | ProjectMetadata
  | ContactMetadata

export interface ContentBlock {
  id: string
  type: ContentBlockType
  title: string | null
  metadata: ContentMetadata
  body_md: string | null
  sort_order: number
  visible: boolean
  created_at: string
  updated_at: string
}

export type ApplicationStatus = 'active' | 'maintenance' | 'disabled'

export interface Application {
  id: string
  name: string
  description: string | null
  url: string
  icon: string
  status: ApplicationStatus
  sort_order: number
  created_at: string
  updated_at: string
}
