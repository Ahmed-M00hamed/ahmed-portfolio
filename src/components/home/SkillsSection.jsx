import SkillIcon from '../SkillIcon'

function SkillsSection({ skills = [] }) {
    const sortedSkills = [...skills].sort(
        (a, b) =>
            (a.display_order || 0) -
            (b.display_order || 0)
    )

    return (
        <section
            id="skills"
            className="border-t border-slate-900 bg-slate-900/30"
        >
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 md:py-24">

                {/* Section Header */}
                <div className="mb-10 sm:mb-12">
                    <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
                        Technologies
                    </p>

                    <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                        Skills & Tools
                    </h2>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
                        Technologies and tools I use to build
                        modern, responsive and scalable web
                        applications.
                    </p>
                </div>

                {/* Skills */}
                {sortedSkills.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center sm:p-10">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-2xl">
                            ⚡
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-white">
                            No Skills Added Yet
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Skills and technologies will
                            appear here.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                        {sortedSkills.map((skill) => (
                            <div
                                key={skill.id}
                                tabIndex={0}
                                className="group rounded-2xl border border-slate-800 bg-slate-900 p-4 outline-none transition duration-300 hover:-translate-y-0.5 hover:border-slate-700 hover:bg-slate-800/80 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 sm:p-5"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    {/* Icon */}
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-lg text-blue-500 transition group-hover:bg-blue-500/15">
                                        <SkillIcon skill={skill} size={22} />
                                    </div>

                                    {/* Content */}
                                    <div className="min-w-0">
                                        <h3 className="wrap-break-word font-semibold text-white">
                                            {skill.name}
                                        </h3>

                                        {skill.category && (
                                            <p className="mt-1 wrap-break-word text-xs text-slate-500">
                                                {skill.category}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default SkillsSection