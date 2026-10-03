import { supabase } from './supabase'

export async function getAllProjects() {
    const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('display_order', { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return data || []
}

export async function getPublishedProjects() {
    const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return data || []
}

export async function getProjectById(id) {
    const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function createProject(project) {
    const { data, error } = await supabase
        .from('portfolio_projects')
        .insert(project)
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function updateProject(id, project) {
    const { data, error } = await supabase
        .from('portfolio_projects')
        .update(project)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function deleteProject(id) {
    const { error } = await supabase
        .from('portfolio_projects')
        .delete()
        .eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    return true
}

export async function getProjectBySlug(slug) {
    const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single()

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function getProjectImages(projectId) {
    const { data, error } = await supabase
        .from('portfolio_project_images')
        .select('*')
        .eq('project_id', projectId)
        .order('display_order', { ascending: true })

    if (error) {
        throw new Error(error.message)
    }

    return data || []
}