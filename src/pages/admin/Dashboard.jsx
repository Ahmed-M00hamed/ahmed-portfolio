import { useEffect, useState } from 'react'
import {
    FolderKanban,
    Star,
    Eye,
    Code2,
    RefreshCw,
} from 'lucide-react'

import { getDashboardStats } from '../../lib/dashboard'

function Dashboard() {
    const [stats, setStats] = useState({
        totalProjects: 0,
        featuredProjects: 0,
        publishedProjects: 0,
        totalSkills: 0,
    })

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    async function loadStats() {
        setLoading(true)
        setError('')

        try {
            const data = await getDashboardStats()

            setStats({
                totalProjects: data?.totalProjects || 0,
                featuredProjects: data?.featuredProjects || 0,
                publishedProjects: data?.publishedProjects || 0,
                totalSkills: data?.totalSkills || 0,
            })
        } catch (err) {
            console.error(
                'Failed to load dashboard statistics:',
                err
            )

            setError(
                err.message ||
                'Failed to load dashboard statistics'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStats()
    }, [])

    const cards = [
        {
            title: 'Total Projects',
            value: stats.totalProjects,
            icon: FolderKanban,
        },
        {
            title: 'Featured Projects',
            value: stats.featuredProjects,
            icon: Star,
        },
        {
            title: 'Published',
            value: stats.publishedProjects,
            icon: Eye,
        },
        {
            title: 'Skills',
            value: stats.totalSkills,
            icon: Code2,
        },
    ]

    return (
        <div className="mx-auto w-full max-w-7xl">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-blue-500">
                        Portfolio Admin
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                        Dashboard
                    </h1>

                    <p className="mt-2 text-sm text-slate-400 sm:text-base">
                        Welcome back, Ahmed 👋
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadStats}
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                    <RefreshCw
                        size={17}
                        className={
                            loading ? 'animate-spin' : ''
                        }
                    />

                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-900/80 bg-red-950/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-red-300">
                            Failed to load dashboard
                        </p>

                        <p className="mt-1 text-sm text-red-400">
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadStats}
                        disabled={loading}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-800 bg-red-950/50 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-900/40 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={15}
                            className={
                                loading
                                    ? 'animate-spin'
                                    : ''
                            }
                        />

                        Try Again
                    </button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon

                    return (
                        <div
                            key={card.title}
                            className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-slate-700 sm:p-6"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-400">
                                        {card.title}
                                    </p>

                                    <div className="mt-4">
                                        {loading ? (
                                            <div className="h-9 w-16 animate-pulse rounded-lg bg-slate-800" />
                                        ) : (
                                            <h2 className="text-3xl font-bold text-white">
                                                {card.value}
                                            </h2>
                                        )}
                                    </div>
                                </div>

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition group-hover:bg-blue-500/15">
                                    <Icon size={21} />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Portfolio Overview */}
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:mt-8 sm:p-6">
                <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                        <FolderKanban size={21} />
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-white sm:text-xl">
                            Portfolio Overview
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Your portfolio data is connected to
                            Supabase. Any changes you make from
                            the admin panel will automatically
                            appear on your public portfolio.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard