import { supabase } from './supabase'

export async function getDashboardStats() {
    const [
        projectsResult,
        featuredResult,
        publishedResult,
        skillsResult,
    ] = await Promise.all([
        supabase
            .from('portfolio_projects')
            .select('*', { count: 'exact', head: true }),

        supabase
            .from('portfolio_projects')
            .select('*', { count: 'exact', head: true })
            .eq('featured', true),

        supabase
            .from('portfolio_projects')
            .select('*', { count: 'exact', head: true })
            .eq('published', true),

        supabase
            .from('portfolio_skills')
            .select('*', { count: 'exact', head: true }),
    ])

    if (projectsResult.error) {
        throw new Error(projectsResult.error.message)
    }

    if (featuredResult.error) {
        throw new Error(featuredResult.error.message)
    }

    if (publishedResult.error) {
        throw new Error(publishedResult.error.message)
    }

    if (skillsResult.error) {
        throw new Error(skillsResult.error.message)
    }

    return {
        totalProjects: projectsResult.count || 0,
        featuredProjects: featuredResult.count || 0,
        publishedProjects: publishedResult.count || 0,
        totalSkills: skillsResult.count || 0,
    }
}