import { useEffect, useState } from 'react'
import {
    ArrowLeft,
    ExternalLink,
    GitBranch,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import {
    getProjectBySlug,
    getProjectImages,
} from '../lib/projects'

import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ProjectGallery from '../components/projects/ProjectGallery'

function ProjectDetails() {
    const { slug } = useParams()

    const [project, setProject] = useState(null)
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let mounted = true

        async function loadProject() {
            try {
                setLoading(true)
                setError('')

                const projectData =
                    await getProjectBySlug(slug)

                if (!mounted) return

                setProject(projectData)

                const imageData =
                    await getProjectImages(projectData.id)

                if (!mounted) return

                setImages(imageData || [])
            } catch (err) {
                console.error(
                    'Failed to load project:',
                    err
                )

                if (!mounted) return

                setError(
                    err.message ||
                    'Failed to load project'
                )
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        loadProject()

        return () => {
            mounted = false
        }
    }, [slug])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

                    <p className="mt-4 text-sm text-slate-400">
                        Loading project...
                    </p>
                </div>
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
                <div className="w-full max-w-md text-center">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                            !
                        </div>

                        <h1 className="mt-5 text-2xl font-bold">
                            Project not found
                        </h1>

                        <p className="mt-3 wrap-break-word text-sm leading-6 text-slate-400">
                            {error ||
                                'This project does not exist or is not published.'}
                        </p>

                        <Link
                            to="/projects"
                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 sm:w-auto"
                        >
                            <ArrowLeft size={17} />
                            Back to Projects
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const mainImage =
        project.cover_image ||
        images[0]?.image_url ||
        null

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Navbar />

            <main>
                <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 md:py-20">

                    {/* Project Header */}
                    <div className="max-w-4xl">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            {project.category && (
                                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                                    {project.category}
                                </span>
                            )}

                            {project.featured && (
                                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                                    Featured
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="mt-5 wrap-break-word text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                            {project.title}
                        </h1>

                        {/* Short Description */}
                        {project.short_description && (
                            <p className="mt-5 max-w-3xl wrap-break-word text-base leading-7 text-slate-400 sm:mt-6 sm:text-lg sm:leading-8 md:text-xl">
                                {project.short_description}
                            </p>
                        )}

                        {/* Action Buttons */}
                        {(project.live_url ||
                            project.github_url) && (
                                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                    {project.live_url && (
                                        <a
                                            href={project.live_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500 sm:w-auto"
                                        >
                                            <ExternalLink
                                                size={17}
                                            />
                                            Live Demo
                                        </a>
                                    )}

                                    {project.github_url && (
                                        <a
                                            href={project.github_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white sm:w-auto"
                                        >
                                            <GitBranch
                                                size={17}
                                            />
                                            GitHub
                                        </a>
                                    )}
                                </div>
                            )}
                    </div>

                    {/* Divider */}
                    <div className="my-10 border-t border-slate-900 sm:my-12" />

                    {/* Gallery */}
                    <ProjectGallery
                        project={project}
                        mainImage={mainImage}
                        images={images}
                    />

                    {/* Project Information */}
                    <div className="mt-12 border-t border-slate-900 pt-12 sm:mt-16 sm:pt-16">
                        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">

                            {/* Description */}
                            <div className="min-w-0">
                                <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
                                    About The Project
                                </p>

                                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                                    About This Project
                                </h2>

                                <div className="mt-5 text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
                                    {project.description ? (
                                        <p className="whitespace-pre-line wrap-break-word">
                                            {project.description}
                                        </p>
                                    ) : (
                                        <p>
                                            {project.short_description ||
                                                'Project description coming soon.'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Technologies */}
                            <aside className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                                <h2 className="text-lg font-bold">
                                    Technologies
                                </h2>

                                {project.tech_stack?.length >
                                    0 ? (
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {project.tech_stack.map(
                                            (tech) => (
                                                <span
                                                    key={tech}
                                                    className="max-w-full wrap-break-word rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300"
                                                >
                                                    {tech}
                                                </span>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <p className="mt-4 text-sm text-slate-500">
                                        No technologies
                                        added yet.
                                    </p>
                                )}
                            </aside>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="mt-12 border-t border-slate-900 pt-8 sm:mt-16 sm:pt-10">
                        <Link
                            to="/projects"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white sm:w-auto"
                        >
                            <ArrowLeft size={17} />
                            Back to Projects
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default ProjectDetails