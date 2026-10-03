import { supabase } from './supabase'

export async function loginAdmin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function logoutAdmin() {
    const { error } = await supabase.auth.signOut()

    if (error) {
        throw new Error(error.message)
    }
}

export async function getCurrentUser() {
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return user
}