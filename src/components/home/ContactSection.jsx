import {
    GitBranch,
    Mail,
    MapPin,
    Phone,
    ArrowUpRight,
} from 'lucide-react'

function ContactSection({ profile }) {
    return (
        <section
            id="contact"
            className="border-t border-slate-900"
        >
            <div className="mx-auto max-w-6xl px-6 py-24">

                {/* Heading */}
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
                        Get In Touch
                    </p>

                    <h2 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
                        Let's work together
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
                        Have a project, job opportunity, or just want to
                        say hello? Feel free to reach out.
                    </p>
                </div>

                {/* Contact Content */}
                <div className="mt-14 grid gap-6 md:grid-cols-2">

                    {/* Left Card */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">

                        <h3 className="text-xl font-semibold text-white">
                            Contact Information
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            I'm currently open to frontend development
                            opportunities, freelance projects, and
                            interesting collaborations.
                        </p>

                        <div className="mt-8 space-y-4">

                            {/* Email */}
                            {profile?.email && (
                                <a
                                    href={`mailto:${profile.email}`}
                                    className="group flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-blue-500/50 hover:bg-slate-900"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">
                                        <Mail size={20} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-500">
                                            Email
                                        </p>

                                        <p className="truncate text-sm font-medium text-slate-200 group-hover:text-blue-400">
                                            {profile.email}
                                        </p>
                                    </div>
                                </a>
                            )}

                            {/* Phone */}
                            {profile?.phone && (
                                <a
                                    href={`tel:${profile.phone}`}
                                    className="group flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-blue-500/50 hover:bg-slate-900"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">
                                        <Phone size={20} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-500">
                                            Phone
                                        </p>

                                        <p className="text-sm font-medium text-slate-200 group-hover:text-blue-400">
                                            {profile.phone}
                                        </p>
                                    </div>
                                </a>
                            )}

                            {/* Location */}
                            {profile?.location && (
                                <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600/10 text-blue-500">
                                        <MapPin size={20} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs text-slate-500">
                                            Location
                                        </p>

                                        <p className="text-sm font-medium text-slate-200">
                                            {profile.location}
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Right Card */}
                    <div className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-8">

                        <h3 className="text-xl font-semibold text-white">
                            Let's connect
                        </h3>

                        <p className="mt-2 leading-7 text-slate-400">
                            Whether you're looking to build a website,
                            need a frontend developer, or want to discuss
                            an opportunity, I'd be happy to hear from you.
                        </p>

                        {/* Main Button */}
                        {profile?.email && (
                            <a
                                href={`mailto:${profile.email}`}
                                className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-500"
                            >
                                <Mail size={18} />
                                Send Me an Email
                                <ArrowUpRight
                                    size={17}
                                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                />
                            </a>
                        )}

                        {/* Social Links */}
                        <div className="mt-6 grid gap-3 sm:grid-cols-2">

                            {profile?.github_url && (
                                <a
                                    href={profile.github_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                                >
                                    <GitBranch size={18} />
                                    GitHub
                                    <ArrowUpRight
                                        size={15}
                                        className="opacity-0 transition group-hover:opacity-100"
                                    />
                                </a>
                            )}

                            {profile?.linkedin_url && (
                                <a
                                    href={profile.linkedin_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                                >
                                    <span className="flex h-4.5 w-4.5 items-center justify-center rounded bg-slate-400 text-xs font-bold text-slate-950">
                                        in
                                    </span>

                                    LinkedIn

                                    <ArrowUpRight
                                        size={15}
                                        className="opacity-0 transition group-hover:opacity-100"
                                    />
                                </a>
                            )}

                        </div>

                        {/* Availability */}
                        <div className="mt-auto pt-8">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                                Available for opportunities
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    )
}

export default ContactSection