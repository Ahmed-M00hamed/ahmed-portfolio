import {
    ArrowRight,
    Download,
    GitBranch,
    Mail,
} from 'lucide-react'

function Hero({ profile }) {
    return (
        <section
            id="home"
            className="relative overflow-hidden"
        >
            {/* Background Glow */}
            <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl sm:h-125 sm:w-125" />

            <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16 lg:py-32">
                {/* Content */}
                <div className="min-w-0">
                    {/* Availability */}
                    <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300 sm:px-4 sm:text-sm">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                        Available for opportunities
                    </div>

                    {/* Greeting */}
                    <p className="text-base font-medium text-blue-500 sm:text-lg">
                        Hello, I'm
                    </p>

                    {/* Name */}
                    <h1 className="mt-3 wrap-break-word text-4xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                        {profile?.name ||
                            'Ahmed Mohamed'}
                    </h1>

                    {/* Title */}
                    <h2 className="mt-5 max-w-2xl text-xl font-semibold leading-snug text-slate-300 sm:text-3xl">
                        {profile?.title ||
                            'Junior React / Frontend Developer'}
                    </h2>

                    {/* Bio */}
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:mt-6 sm:text-lg sm:leading-8">
                        {profile?.bio ||
                            'I build modern, responsive and user-friendly web applications using React and modern frontend technologies.'}
                    </p>

                    {/* Main Actions */}
                    <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
                        <a
                            href="#projects"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 sm:w-auto"
                        >
                            View My Work
                            <ArrowRight size={18} />
                        </a>

                        {profile?.cv_url && (
                            <a
                                href={profile.cv_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-slate-950 sm:w-auto"
                            >
                                Download CV
                                <Download size={18} />
                            </a>
                        )}
                    </div>

                    {/* Social Links */}
                    <div className="mt-7 flex items-center gap-3 sm:mt-8">
                        {profile?.github_url && (
                            <a
                                href={profile.github_url}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="GitHub"
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <GitBranch size={20} />
                            </a>
                        )}

                        {profile?.linkedin_url && (
                            <a
                                href={profile.linkedin_url}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="LinkedIn"
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-sm font-bold text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                in
                            </a>
                        )}

                        {profile?.email && (
                            <a
                                href={`mailto:${profile.email}`}
                                aria-label="Email"
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <Mail size={20} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Avatar */}
                <div className="flex justify-center lg:justify-end">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-blue-600/20 blur-3xl" />

                        <div className="relative flex h-60 w-60 items-center justify-center overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 sm:h-80 sm:w-80">
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={
                                        profile.name ||
                                        'Ahmed Mohamed'
                                    }
                                    loading="eager"
                                    decoding="async"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-7xl font-bold text-blue-500 sm:text-8xl">
                                    {profile?.name?.charAt(
                                        0
                                    ) || 'A'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero