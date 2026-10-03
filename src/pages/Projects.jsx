import { useEffect, useState } from 'react'
import {
    ArrowLeft,
    FolderKanban,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import {
    getPublishedProjects,
    getProjectImages,
} from '../lib/projects'

import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ProjectCard from '../components/projects/ProjectCard'

function Projects() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let mounted = true

        async function loadProjects() {
            try {
                setLoading(true)
                setError('')

                const publishedProjects =
                    await getPublishedProjects()

                if (!mounted) return

                const sortedProjects = [
                    ...publishedProjects,
                ].sort((a, b) => {
                    return (
                        (a.display_order || 0) -
                        (b.display_order || 0)
                    )
                })

                const projectsWithImages =
                    await Promise.all(
                        sortedProjects.map(
                            async (project) => {
                                try {
                                    const images =
                                        await getProjectImages(
                                            project.id
                                        )

                                    return {
                                        ...project,
                                        galleryImages:
                                            images || [],
                                    }
                                } catch (imageError) {
                                    console.error(
                                        `Failed to load images for ${project.title}:`,
                                        imageError
                                    )

                                    return {
                                        ...project,
                                        galleryImages: [],
                                    }
                                }
                            }
                        )
                    )

                if (!mounted) return

                setProjects(projectsWithImages)
            } catch (err) {
                console.error(
                    'Failed to load projects:',
                    err
                )

                if (!mounted) return

                setError(
                    err.message ||
                    'Failed to load projects'
                )
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        loadProjects()

        return () => {
            mounted = false
        }
    }, [])

    /* Loading */
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

                    <p className="mt-4 text-sm text-slate-400">
                        Loading projects...
                    </p>
                </div>
            </div>
        )
    }

    /* Error */
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
                <div className="w-full max-w-md rounded-2xl border border-red-900/80 bg-red-950/20 p-6 text-center sm:p-8">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                        !
                    </div>

                    <h1 className="mt-5 text-xl font-bold sm:text-2xl">
                        Something went wrong
                    </h1>

                    <p className="mt-3 wrap-break-word text-sm leading-6 text-red-300/80">
                        {error}
                    </p>

                    <Link
                        to="/"
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 sm:w-auto"
                    >
                        <ArrowLeft size={17} />
                        Back Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Navbar />

            <main>
                <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">

                    {/* Page Intro */}
                    <div className="max-w-3xl">
                        <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
                            Portfolio
                        </p>

                        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                                My Projects
                            </h1>

                            {projects.length > 0 && (
                                <span className="w-fit rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
                                    {projects.length}{' '}
                                    {projects.length === 1
                                        ? 'Project'
                                        : 'Projects'}
                                </span>
                            )}
                        </div>

                        <p className="mt-5 text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
                            A collection of web applications
                            and projects I've built using
                            modern frontend and full-stack
                            technologies.
                        </p>
                    </div>

                    {/* Divider */}
                    <div className="mt-10 border-t border-slate-900 sm:mt-12" />

                    {/* Projects */}
                    {projects.length === 0 ? (
                        <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center sm:mt-16 sm:p-10">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-500">
                                <FolderKanban size={24} />
                            </div>

                            <h2 className="mt-5 text-xl font-bold">
                                No Projects Yet
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                No published projects are
                                available right now.
                            </p>

                            <Link
                                to="/"
                                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 sm:w-auto"
                            >
                                <ArrowLeft size={17} />
                                Back Home
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 sm:gap-8 md:grid-cols-2">
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    variant="detailed"
                                />
                            ))}
                        </div>
                    )}

                    {/* Back Home */}
                    {projects.length > 0 && (
                        <div className="mt-12 border-t border-slate-900 pt-8 sm:mt-14 sm:pt-10">
                            <Link
                                to="/"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white sm:w-auto"
                            >
                                <ArrowLeft size={17} />
                                Back Home
                            </Link>
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default Projects