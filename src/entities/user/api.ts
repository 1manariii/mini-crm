import { supabase } from '@/shared/api/supabase'
import type { Profile } from './model/types'

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as Profile
}

export async function fetchExecutors(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('role', 'executor')
    .order('full_name')

  if (error) throw error
  return data as Profile[]
}
