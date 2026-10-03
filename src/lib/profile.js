import { supabase } from './supabase'

export async function getProfile() {
    const { data, error } = await supabase
        .from('portfolio_profile')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function createProfile(profile) {
    const { data, error } = await supabase
        .from('portfolio_profile')
        .insert(profile)
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function updateProfile(id, profile) {
    const { data, error } = await supabase
        .from('portfolio_profile')
        .update({
            ...profile,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}