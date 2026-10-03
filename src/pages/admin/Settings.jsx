import {
    ExternalLink,
    Globe,
    ShieldCheck,
    Database,
    Code2,
    LogOut,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import { logoutAdmin } from '../../lib/auth'

function Settings() {
    const navigate = useNavigate()

    const portfolioUrl =
        window.location.origin

    async function handleLogout() {
        try {
            await logoutAdmin()
            navigate('/admin/login')
        } catch (error) {
            console.error(
                'Logout failed:',
                error
            )
        }
    }

    return (
        <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="mb-8">
                <p className="text-sm font-medium text-blue-500">
                    Configuration
                </p>

                <h1 className="mt-1 text-3xl font-bold text-white">
                    Settings
                </h1>

                <p className="mt-2 text-slate-400">
                    Manage your portfolio settings and
                    system information.
                </p>
            </div>

            <div className="space-y-6">
                {/* Website */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                            <Globe size={21} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Portfolio Website
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Your public portfolio website.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wider text-slate-500">
                                Website URL
                            </p>

                            <p className="mt-1 truncate text-sm text-slate-300">
                                {portfolioUrl}
                            </p>
                        </div>

                        <a
                            href={portfolioUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            Open Website
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </section>

                {/* System */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                            <Code2 size={21} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                System Information
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Technologies powering your portfolio.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-500">
                                Frontend
                            </p>

                            <p className="mt-2 font-semibold text-white">
                                React + Vite
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-500">
                                Styling
                            </p>

                            <p className="mt-2 font-semibold text-white">
                                Tailwind CSS
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                            <p className="text-xs uppercase tracking-wider text-slate-500">
                                Database
                            </p>

                            <p className="mt-2 font-semibold text-white">
                                Supabase
                            </p>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                            <ShieldCheck size={21} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Security
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Your admin area is protected by
                                Supabase Authentication.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                                    <ShieldCheck size={18} />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Authentication
                                    </p>

                                    <p className="mt-1 text-xs text-green-400">
                                        Active
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                                    <Database size={18} />
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Database
                                    </p>

                                    <p className="mt-1 text-xs text-blue-400">
                                        Supabase
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Account
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Manage your current admin session.
                        </p>
                    </div>

                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-900/70 bg-red-950/30 px-5 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-950/60 hover:text-red-300"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default Settings