import { z } from 'zod'

const urlOrNull = z.string().url().nullable()

export const heroMetadataSchema = z.object({
  tagline: z.string().min(1, 'Tagline is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
})

export const aboutMetadataSchema = z.object({
  avatar_url: z.string().url('Must be a valid URL'),
  location: z.string().min(1, 'Location is required'),
  resume_url: z.string().url('Must be a valid URL').nullable(),
})

export const experienceMetadataSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  start_date: z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM format'),
  end_date: z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM format').nullable(),
  logo_url: urlOrNull,
})

export const skillMetadataSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  level: z.string().nullable(),
})

export const projectMetadataSchema = z.object({
  url: urlOrNull,
  github_url: urlOrNull,
  tech_stack: z.array(z.string()),
  image_url: urlOrNull,
  is_featured: z.boolean(),
})

export const contactMetadataSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Must be a valid URL'),
  icon: z.string().min(1, 'Icon is required'),
  display_text: z.string().min(1, 'Display text is required'),
})

export const metadataSchemaMap = {
  hero: heroMetadataSchema,
  about: aboutMetadataSchema,
  experience: experienceMetadataSchema,
  skill: skillMetadataSchema,
  project: projectMetadataSchema,
  contact: contactMetadataSchema,
} as const

export const applicationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  url: z.string().url('Must be a valid URL'),
  icon: z.string().min(1, 'Icon is required'),
  status: z.enum(['active', 'maintenance', 'disabled']),
})
