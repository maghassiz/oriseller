export type Category = 'courses' | 'ebooks' | 'templates' | 'presets' | 'software' | 'coaching' | 'other'
export type Platform = 'mayar' | 'scalev' | 'lynk'
export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export const CATEGORY_LABELS: Record<Category, string> = {
  courses: 'Online Course',
  ebooks: 'E-Book',
  templates: 'Template',
  presets: 'Preset',
  software: 'Software / App',
  coaching: 'Coaching',
  other: 'Lainnya',
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  mayar: 'Mayar',
  scalev: 'Scalev',
  lynk: 'Lynk',
}

export const CATEGORIES = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))
export const PLATFORMS = Object.entries(PLATFORM_LABELS).map(([value, label]) => ({ value, label }))

export interface Submission {
  id: string
  full_name: string
  username: string
  email: string
  bio: string | null
  category: Category
  website: string | null
  twitter: string | null
  instagram: string | null
  platform: Platform
  status: SubmissionStatus
  verified_mrr: number
  verified_total_revenue: number
  verified_total_orders: number
  is_featured: boolean
  submitted_at: string
  verified_at: string | null
}

export interface LeaderboardEntry extends Submission {
  rank: number
}
