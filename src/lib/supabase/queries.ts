import { supabase } from './client'

export interface DbCategory {
  id: string
  name: string
  description: string
  max_points: number
  levels: string[]
  strategies: string
  icon_key: string
}

export type CategoryUpdatePatch = Partial<
  Pick<
    DbCategory,
    'name' | 'description' | 'max_points' | 'levels' | 'strategies' | 'icon_key'
  >
>

export async function updateCategory(id: string, patch: CategoryUpdatePatch) {
  const { error } = await supabase.from('categories').update(patch).eq('id', id)
  if (error) throw error
}

export async function fetchCategories(): Promise<DbCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id,name,description,max_points,levels,strategies,icon_key')
    .order('id', { ascending: true })
  if (error) throw error
  return data || []
}

export interface FeedbackInsert {
  role: string
  role_other?: string | null
  tools?: Record<string, unknown> | null
}

export async function submitFeedback(payload: FeedbackInsert) {
  const { error } = await supabase.from('feedback').insert(payload)
  if (error) throw error
}

// Feedback querying for admin cards
export type FeedbackRow = {
  id: string
  role: string
  role_other?: string | null
  tools?: any | null
  created_at?: string | null
}

export async function fetchFeedback(): Promise<FeedbackRow[]> {
  const { data, error } = await supabase
    .from('feedback')
    .select('id, role, role_other, tools, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as any) || []
}

export interface ContactRequestInsert {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  job_title: string
  company_name: string
  message: string
  hear_about_us?: string | null
}

export async function submitContactRequest(payload: ContactRequestInsert) {
  const { error } = await supabase.from('contact_requests').insert(payload)
  if (error) throw error
}

// Auth helpers
export async function getUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user ?? null
}

// Project Scores
export type ProjectRow = {
  id: string
  user_id: string
  name: string
  scores: Record<string, number>
  created_at: string
  updated_at: string
}

export async function listProjects(): Promise<ProjectRow[]> {
  const { data, error } = await supabase
    .from('project_scores')
    .select('id,user_id,name,scores,created_at,updated_at')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data as any) || []
}

export async function saveProjectScores(
  name: string,
  scores: Record<string, number>
) {
  // get current user id from auth
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')
  const payload = {
    user_id: user.id,
    name,
    scores,
  }
  const { error } = await supabase
    .from('project_scores')
    .upsert(payload, { onConflict: 'user_id,name' })
  if (error) throw error
}

export async function loadProjectScores(
  name: string
): Promise<Record<string, number> | null> {
  const user = await getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await supabase
    .from('project_scores')
    .select('scores')
    .eq('user_id', user.id)
    .eq('name', name)
    .maybeSingle()
  if (error) throw error
  return (data?.scores as any) ?? null
}
