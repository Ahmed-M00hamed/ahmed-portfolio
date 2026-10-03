import { ArrowRight, FolderKanban } from 'lucide-react'
import { Link } from 'react-router-dom'

import ProjectCard from '../projects/ProjectCard'

function ProjectsSection({ projects = [] }) {
    const featuredProjects = [...projects]
        .filter((project) => project.featured)
        .sort(
            (a, b) =>
                (a.display_order || 0) -
                (b.display_order || 0)
        )

    return (
        <section
            id="projects"
            className="border-t border-slate-900 bg-slate-950"
        >
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">

                {/* Section Header */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
                            My Work
                        </p>

                        <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                            Featured Projects
                        </h2>

                        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
                            A selection of projects I've built
                            using modern frontend and
                            full-stack technologies.
                        </p>
                    </div>

                    {featuredProjects.length > 0 && (
                        <span className="w-fit shrink-0 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
                            {featuredProjects.length}{' '}
                            {featuredProjects.length === 1
                                ? 'Featured Project'
                                : 'Featured Projects'}
                        </span>
                    )}
                </div>

                {/* Projects */}
                {featuredProjects.length === 0 ? (
                    <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center sm:mt-12 sm:p-10">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-500">
                            <FolderKanban size={24} />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-white">
                            No Featured Projects Yet
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Featured projects will appear
                            here.
                        </p>
                    </div>
                ) : (
                    <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 md:grid-cols-2 lg:grid-cols-3">
                        {featuredProjects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                            />
                        ))}
                    </div>
                )}

                {/* View All Projects */}
                {featuredProjects.length > 0 && (
                    <div className="mt-10 flex justify-center sm:mt-12">
                        <Link
                            to="/projects"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white sm:w-auto"
                        >
                            View All Projects
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    )
}

export default ProjectsSection