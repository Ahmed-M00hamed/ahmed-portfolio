import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    ExternalLink,
    GitBranch,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    Image as ImageIcon,
    Eye,
    Star,
    ArrowUp,
    ArrowDown,
} from 'lucide-react'

import {
    deleteProject,
    getAllProjects,
    getProjectImages,
    updateProject,
} from '../../lib/projects'

function Projects() {
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deletingId, setDeletingId] = useState(null)
    const [updatingId, setUpdatingId] = useState(null)
    const [reorderingId, setReorderingId] = useState(null)

    async function loadProjects() {
        setLoading(true)
        setError('')

        try {
            const data = await getAllProjects()

            const sortedProjects = [...data].sort(
                (a, b) => a.display_order - b.display_order
            )

            const projectsWithImages = await Promise.all(
                sortedProjects.map(async (project) => {
                    try {
                        const images = await getProjectImages(project.id)

                        return {
                            ...project,
                            galleryImages: images || [],
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
                })
            )

            setProjects(projectsWithImages)
        } catch (err) {
            console.error(
                'Failed to load projects:',
                err
            )

            setError(
                err.message || 'Failed to load projects'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProjects()
    }, [])

    async function handleToggle(project, field) {
        if (updatingId) return

        const newValue = !project[field]

        setUpdatingId(project.id)
        setError('')

        try {
            const updatedProject = await updateProject(
                project.id,
                {
                    [field]: newValue,
                }
            )

            setProjects((currentProjects) =>
                currentProjects.map((item) =>
                    item.id === project.id
                        ? {
                            ...item,
                            ...updatedProject,
                        }
                        : item
                )
            )
        } catch (err) {
            console.error(
                `Failed to update ${field}:`,
                err
            )

            setError(
                err.message ||
                `Failed to update ${field}`
            )
        } finally {
            setUpdatingId(null)
        }
    }

    async function handleDelete(project) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${project.title}"?\n\nThis action cannot be undone.`
        )

        if (!confirmed) return

        setDeletingId(project.id)
        setError('')

        try {
            await deleteProject(project.id)

            setProjects((currentProjects) =>
                currentProjects.filter(
                    (item) => item.id !== project.id
                )
            )
        } catch (err) {
            console.error(
                'Failed to delete project:',
                err
            )

            setError(
                err.message || 'Failed to delete project'
            )
        } finally {
            setDeletingId(null)
        }
    }

    async function handleMove(projectId, direction) {
        if (reorderingId) return

        const currentIndex = projects.findIndex(
            (project) => project.id === projectId
        )

        if (currentIndex === -1) return

        const targetIndex =
            direction === 'up'
                ? currentIndex - 1
                : currentIndex + 1

        if (
            targetIndex < 0 ||
            targetIndex >= projects.length
        ) {
            return
        }

        const currentProject = projects[currentIndex]
        const targetProject = projects[targetIndex]

        setReorderingId(projectId)
        setError('')

        try {
            await Promise.all([
                updateProject(currentProject.id, {
                    display_order:
                        targetProject.display_order,
                }),
                updateProject(targetProject.id, {
                    display_order:
                        currentProject.display_order,
                }),
            ])

            const reorderedProjects = [...projects]

            reorderedProjects[currentIndex] =
                targetProject

            reorderedProjects[targetIndex] =
                currentProject

            setProjects(reorderedProjects)
        } catch (err) {
            console.error(
                'Failed to reorder projects:',
                err
            )

            setError(
                err.message ||
                'Failed to reorder projects'
            )
        } finally {
            setReorderingId(null)
        }
    }

    function getProjectImage(project) {
        if (project.cover_image) {
            return project.cover_image
        }

        if (project.galleryImages?.length > 0) {
            return project.galleryImages[0].image_url
        }

        return null
    }

    return (
        <div className="mx-auto w-full max-w-7xl">
            {/* Page Header */}
            <div className="mb-8 flex flex-col gap-5">
                <div>
                    <p className="text-sm font-medium text-blue-500">
                        Portfolio Admin
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                        Projects
                    </h1>

                    <p className="mt-2 text-sm text-slate-400 sm:text-base">
                        Manage all projects in your portfolio.
                    </p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <button
                        type="button"
                        onClick={loadProjects}
                        disabled={loading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        <RefreshCw
                            size={18}
                            className={
                                loading
                                    ? 'animate-spin'
                                    : ''
                            }
                        />

                        {loading
                            ? 'Refreshing...'
                            : 'Refresh'}
                    </button>

                    <Link
                        to="/admin/projects/add"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 sm:w-auto"
                    >
                        <Plus size={18} />

                        Add Project
                    </Link>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-900/80 bg-red-950/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-red-300">
                            Something went wrong
                        </p>

                        <p className="mt-1 break-words text-sm text-red-400">
                            {error}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadProjects}
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

            {/* Loading */}
            {loading && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

                    <p className="mt-4 text-sm text-slate-400">
                        Loading projects...
                    </p>
                </div>
            )}

            {/* Empty State */}
            {!loading && projects.length === 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center sm:p-10">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                        <FolderKanbanIcon />
                    </div>

                    <h2 className="mt-5 text-xl font-semibold text-white">
                        No projects yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                        Add your first project to your portfolio
                        and it will appear here.
                    </p>

                    <Link
                        to="/admin/projects/add"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                        <Plus size={18} />

                        Add Project
                    </Link>
                </div>
            )}

            {/* Projects */}
            {!loading && projects.length > 0 && (
                <div className="grid gap-5 xl:grid-cols-2">
                    {projects.map((project, index) => {
                        const projectImage =
                            getProjectImage(project)

                        const isUpdating =
                            updatingId === project.id

                        const isReordering =
                            reorderingId === project.id

                        const isDeleting =
                            deletingId === project.id

                        return (
                            <article
                                key={project.id}
                                className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition duration-300 hover:border-slate-700"
                            >
                                {/* Cover */}
                                <div className="relative h-52 overflow-hidden bg-slate-800 sm:h-56">
                                    {projectImage ? (
                                        <img
                                            src={projectImage}
                                            alt={project.title}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 text-slate-500">
                                                <ImageIcon
                                                    size={22}
                                                />
                                            </div>

                                            <p className="mt-3 max-w-full truncate text-lg font-semibold text-slate-400">
                                                {project.title}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-600">
                                                No project image
                                            </p>
                                        </div>
                                    )}

                                    {/* Top Badges */}
                                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                                        <span className="rounded-lg bg-black/70 px-2.5 py-1.5 text-xs font-medium text-slate-200 backdrop-blur-sm">
                                            #{index + 1}
                                        </span>

                                        {project.featured && (
                                            <span className="inline-flex items-center gap-1 rounded-lg bg-yellow-500/20 px-2.5 py-1.5 text-xs font-medium text-yellow-300 backdrop-blur-sm">
                                                <Star
                                                    size={13}
                                                    fill="currentColor"
                                                />
                                                Featured
                                            </span>
                                        )}
                                    </div>

                                    {/* Gallery Count */}
                                    {project.galleryImages?.length >
                                        0 && (
                                            <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                                                <ImageIcon size={14} />

                                                {
                                                    project
                                                        .galleryImages
                                                        .length
                                                }{' '}
                                                {project
                                                    .galleryImages
                                                    .length === 1
                                                    ? 'image'
                                                    : 'images'}
                                            </div>
                                        )}
                                </div>

                                {/* Content */}
                                <div className="p-5 sm:p-6">
                                    {/* Title + Status */}
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <h2 className="truncate text-xl font-bold text-white">
                                                {project.title}
                                            </h2>

                                            {project.category && (
                                                <p className="mt-1 text-sm text-blue-400">
                                                    {
                                                        project.category
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex shrink-0 flex-wrap gap-2">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-medium ${project.published
                                                        ? 'bg-green-500/10 text-green-400'
                                                        : 'bg-slate-800 text-slate-400'
                                                    }`}
                                            >
                                                {project.published
                                                    ? 'Published'
                                                    : 'Draft'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-400">
                                        {project.short_description ||
                                            'No description available.'}
                                    </p>

                                    {/* Tech Stack */}
                                    {project.tech_stack?.length >
                                        0 && (
                                            <div className="mt-5 flex flex-wrap gap-2">
                                                {project.tech_stack
                                                    .slice(0, 6)
                                                    .map(
                                                        (
                                                            tech,
                                                            techIndex
                                                        ) => (
                                                            <span
                                                                key={`${tech}-${techIndex}`}
                                                                className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300"
                                                            >
                                                                {tech}
                                                            </span>
                                                        )
                                                    )}

                                                {project.tech_stack
                                                    .length > 6 && (
                                                        <span className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-500">
                                                            +
                                                            {project
                                                                .tech_stack
                                                                .length -
                                                                6}
                                                        </span>
                                                    )}
                                            </div>
                                        )}

                                    {/* Quick Controls */}
                                    <div className="mt-6 grid gap-3 border-t border-slate-800 pt-5 sm:grid-cols-2">
                                        {/* Published Toggle */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToggle(
                                                    project,
                                                    'published'
                                                )
                                            }
                                            disabled={
                                                isUpdating ||
                                                isDeleting
                                            }
                                            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-left transition hover:border-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Visibility
                                                </p>

                                                <p
                                                    className={`mt-1 text-sm font-semibold ${project.published
                                                            ? 'text-green-400'
                                                            : 'text-slate-400'
                                                        }`}
                                                >
                                                    {project.published
                                                        ? 'Published'
                                                        : 'Draft'}
                                                </p>
                                            </div>

                                            <div
                                                className={`relative h-6 w-11 rounded-full transition ${project.published
                                                        ? 'bg-green-600'
                                                        : 'bg-slate-700'
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${project.published
                                                            ? 'left-6'
                                                            : 'left-1'
                                                        }`}
                                                />
                                            </div>
                                        </button>

                                        {/* Featured Toggle */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleToggle(
                                                    project,
                                                    'featured'
                                                )
                                            }
                                            disabled={
                                                isUpdating ||
                                                isDeleting
                                            }
                                            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-left transition hover:border-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Homepage
                                                </p>

                                                <p
                                                    className={`mt-1 text-sm font-semibold ${project.featured
                                                            ? 'text-yellow-400'
                                                            : 'text-slate-400'
                                                        }`}
                                                >
                                                    {project.featured
                                                        ? 'Featured'
                                                        : 'Not Featured'}
                                                </p>
                                            </div>

                                            <div
                                                className={`flex h-9 w-9 items-center justify-center rounded-lg ${project.featured
                                                        ? 'bg-yellow-500/10 text-yellow-400'
                                                        : 'bg-slate-800 text-slate-500'
                                                    }`}
                                            >
                                                <Star
                                                    size={18}
                                                    fill={
                                                        project.featured
                                                            ? 'currentColor'
                                                            : 'none'
                                                    }
                                                />
                                            </div>
                                        </button>
                                    </div>

                                    {/* Reorder */}
                                    <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Display Order
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-slate-300">
                                                Position #{index + 1}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleMove(
                                                        project.id,
                                                        'up'
                                                    )
                                                }
                                                disabled={
                                                    index === 0 ||
                                                    isReordering ||
                                                    Boolean(
                                                        reorderingId
                                                    )
                                                }
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                                aria-label="Move project up"
                                                title="Move up"
                                            >
                                                <ArrowUp size={16} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleMove(
                                                        project.id,
                                                        'down'
                                                    )
                                                }
                                                disabled={
                                                    index ===
                                                    projects.length -
                                                    1 ||
                                                    isReordering ||
                                                    Boolean(
                                                        reorderingId
                                                    )
                                                }
                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                                aria-label="Move project down"
                                                title="Move down"
                                            >
                                                <ArrowDown size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                                        {/* Preview */}
                                        {project.published ? (
                                            <Link
                                                to={`/projects/${project.slug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
                                            >
                                                <Eye size={16} />
                                                Preview
                                            </Link>
                                        ) : (
                                            <div
                                                className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2.5 text-sm font-medium text-slate-600"
                                                title="Publish the project to preview it publicly"
                                            >
                                                <Eye size={16} />
                                                Preview
                                            </div>
                                        )}

                                        {/* Edit */}
                                        <Link
                                            to={`/admin/projects/edit/${project.id}`}
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                                        >
                                            <Pencil size={16} />
                                            Edit
                                        </Link>

                                        {/* Live */}
                                        {project.live_url && (
                                            <a
                                                href={
                                                    project.live_url
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                                            >
                                                <ExternalLink
                                                    size={16}
                                                />
                                                Live
                                            </a>
                                        )}

                                        {/* GitHub */}
                                        {project.github_url && (
                                            <a
                                                href={
                                                    project.github_url
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                                            >
                                                <GitBranch
                                                    size={16}
                                                />
                                                GitHub
                                            </a>
                                        )}

                                        {/* Delete */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    project
                                                )
                                            }
                                            disabled={
                                                isDeleting ||
                                                isUpdating ||
                                                isReordering
                                            }
                                            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto sm:col-span-1"
                                        >
                                            <Trash2 size={16} />

                                            {isDeleting
                                                ? 'Deleting...'
                                                : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

function FolderKanbanIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-7 w-7"
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h2m2 0h2m2 0h2M8 16h2m2 0h2"
            />
        </svg>
    )
}

export default Projects