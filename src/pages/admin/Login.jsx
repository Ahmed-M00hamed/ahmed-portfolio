import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../../lib/supabase'
import { loginAdmin, logoutAdmin } from '../../lib/auth'

function Login() {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()

        setError('')
        setLoading(true)

        try {
            const { user } = await loginAdmin(email, password)

            if (!user) {
                throw new Error('Login failed')
            }

            const { data: admin, error: adminError } = await supabase
                .from('portfolio_admins')
                .select('user_id')
                .eq('user_id', user.id)
                .maybeSingle()

            if (adminError) {
                throw new Error(adminError.message)
            }

            if (!admin) {
                await logoutAdmin()
                throw new Error(
                    'You are not authorized to access the dashboard'
                )
            }

            navigate('/admin')
        } catch (err) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8"
            >
                <h1 className="text-3xl font-bold">
                    Admin Login
                </h1>

                <p className="mt-2 text-slate-400">
                    Sign in to manage your portfolio
                </p>

                <div className="mt-8 space-y-5">
                    <div>
                        <label className="mb-2 block text-sm text-slate-300">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-slate-300">
                            Password
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Login