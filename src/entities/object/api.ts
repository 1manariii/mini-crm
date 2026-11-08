import { supabase } from '@/shared/api/supabase'
import type { ConstructionObject } from './model/types'

export async function fetchObjects(): Promise<ConstructionObject[]> {
  const { data, error } = await supabase
    .from('objects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ConstructionObject[]
}

export async function fetchObject(id: string): Promise<ConstructionObject | null> {
  const { data, error } = await supabase.from('objects').select('*').eq('id', id).maybeSingle()

  if (error) throw error
  return data as ConstructionObject | null
}

export async function createObject(input: {
  name: string
  address: string
  created_by: string
}): Promise<ConstructionObject> {
  const { data, error } = await supabase.from('objects').insert(input).select().single()

  if (error) throw error
  return data as ConstructionObject
}

export async function updateObject(
  id: string,
  input: { name: string; address: string },
): Promise<void> {
  const { error } = await supabase.from('objects').update(input).eq('id', id)

  if (error) throw error
}

export async function deleteObject(id: string): Promise<void> {
  const { error } = await supabase.from('objects').delete().eq('id', id)

  if (error) throw error
}
