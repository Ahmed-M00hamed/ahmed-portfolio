import { supabase } from './supabase'

export async function getAllSkills() {
    const { data, error } = await supabase
        .from('portfolio_skills')
        .select('*')
        .order('display_order', { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return data || []
}

export async function getSkillById(id) {
    const { data, error } = await supabase
        .from('portfolio_skills')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function createSkill(skill) {
    const { data, error } = await supabase
        .from('portfolio_skills')
        .insert(skill)
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function updateSkill(id, skill) {
    const { data, error } = await supabase
        .from('portfolio_skills')
        .update(skill)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function deleteSkill(id) {
    const { error } = await supabase
        .from('portfolio_skills')
        .delete()
        .eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    return true
}