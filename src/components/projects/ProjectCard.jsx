import {
    ExternalLink,
    GitBranch,
} from 'lucide-react'
import { Link } from 'react-router-dom'

function ProjectCard({
    project,
    variant = 'default',
}) {
    const isDetailed = variant === 'detailed'

    const projectImage =
        project.cover_image ||
        project.galleryImages?.[0]?.image_url ||
        null

    function handleImageError(event) {
        const image = event.currentTarget

        image.style.display = 'none'

        const parent = image.parentElement

        if (!parent) return

        parent.classList.add(
            'flex',
            'items-center',
            'justify-center'
        )

        const fallback = document.createElement('span')

        fallback.className =
            'text-6xl font-bold text-slate-700'

        fallback.textContent =
            project.title?.charAt(0) || '?'

        parent.appendChild(fallback)
    }

    const description =
        project.short_description ||
        project.description ||
        'No description available.'

    const technologies = project.tech_stack || []

    return (
        <article
            className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition duration-300 hover:-translate-y-1 hover:border-slate-700 ${isDetailed ? '' : ''
                }`}
        >
            {/* Project Image */}
            <div className="aspect-video shrink-0 overflow-hidden bg-slate-800">
                {projectImage ? (
                    <img
                        src={projectImage}
                        alt={`${project.title} preview`}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={handleImageError}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-6xl font-bold text-slate-700">
                        {project.title?.charAt(0) || '?'}
                    </div>
                )}
            </div>

            {/* Content */}
            <div
                className={`flex flex-1 flex-col ${isDetailed
                        ? 'p-5 sm:p-7'
                        : 'p-5 sm:p-6'
                    }`}
            >
                {/* Category / Featured */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                        {project.category || 'Project'}
                    </span>

                    {project.featured && (
                        <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
                            Featured
                        </span>
                    )}

                    {!isDetailed && (
                        <span className="ml-auto text-xs text-slate-500">
                            {technologies.length}{' '}
                            {technologies.length === 1
                                ? 'technology'
                                : 'technologies'}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h2
                    className={
                        isDetailed
                            ? 'mt-4 line-clamp-2 text-2xl font-bold leading-tight'
                            : 'mt-4 line-clamp-2 text-xl font-semibold leading-tight'
                    }
                >
                    {project.title}
                </h2>

                {/* Description */}
                <p
                    className={
                        isDetailed
                            ? 'mt-3 line-clamp-4 text-sm leading-7 text-slate-400 sm:text-base'
                            : 'mt-3 line-clamp-3 text-sm leading-6 text-slate-400'
                    }
                >
                    {description}
                </p>

                {/* Technologies */}
                {technologies.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                        {(isDetailed
                            ? technologies
                            : technologies.slice(0, 4)
                        ).map((tech) => (
                            <span
                                key={tech}
                                className={`max-w-full wrap-break-word rounded-lg border border-slate-800 bg-slate-950 text-xs text-slate-400 ${isDetailed
                                        ? 'px-3 py-1.5'
                                        : 'px-2.5 py-1'
                                    }`}
                            >
                                {tech}
                            </span>
                        ))}

                        {!isDetailed &&
                            technologies.length > 4 && (
                                <span className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-500">
                                    +{technologies.length - 4}
                                </span>
                            )}
                    </div>
                )}

                {/* Actions */}
                <div
                    className={`mt-auto grid grid-cols-1 pt-6 sm:grid-cols-3 ${isDetailed
                            ? 'gap-2.5'
                            : 'gap-2'
                        }`}
                >
                    {/* Details */}
                    <Link
                        to={`/projects/${project.slug}`}
                        aria-label={`View details for ${project.title}`}
                        className={`inline-flex min-w-0 items-center justify-center rounded-xl bg-blue-600 text-center font-semibold text-white transition hover:bg-blue-500 ${isDetailed
                                ? 'px-3 py-3 text-sm'
                                : 'px-3 py-2.5 text-xs sm:text-sm'
                            }`}
                    >
                        Details
                    </Link>

                    {/* Live */}
                    {project.live_url ? (
                        <a
                            href={project.live_url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open live demo for ${project.title}`}
                            className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-700 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white ${isDetailed
                                    ? 'px-3 py-3 text-sm'
                                    : 'px-3 py-2.5 text-xs sm:text-sm'
                                }`}
                        >
                            {isDetailed && (
                                <ExternalLink
                                    size={16}
                                    className="shrink-0"
                                />
                            )}

                            <span>
                                {isDetailed
                                    ? 'Live'
                                    : 'Live Demo'}
                            </span>
                        </a>
                    ) : (
                        <div
                            className={`inline-flex min-w-0 cursor-not-allowed items-center justify-center rounded-xl border border-slate-800 text-center text-slate-600 ${isDetailed
                                    ? 'px-3 py-3 text-sm'
                                    : 'px-3 py-2.5 text-xs sm:text-sm'
                                }`}
                        >
                            {isDetailed
                                ? 'Live'
                                : 'Live Demo'}
                        </div>
                    )}

                    {/* GitHub */}
                    {project.github_url ? (
                        <a
                            href={project.github_url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open GitHub repository for ${project.title}`}
                            className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-700 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white ${isDetailed
                                    ? 'px-3 py-3 text-sm'
                                    : 'px-3 py-2.5 text-xs sm:text-sm'
                                }`}
                        >
                            {isDetailed && (
                                <GitBranch
                                    size={17}
                                    className="shrink-0"
                                />
                            )}

                            <span>GitHub</span>
                        </a>
                    ) : (
                        <div
                            className={`inline-flex min-w-0 cursor-not-allowed items-center justify-center rounded-xl border border-slate-800 text-center text-slate-600 ${isDetailed
                                    ? 'px-3 py-3 text-sm'
                                    : 'px-3 py-2.5 text-xs sm:text-sm'
                                }`}
                        >
                            GitHub
                        </div>
                    )}
                </div>
            </div>
        </article>
    )
}

export default ProjectCard