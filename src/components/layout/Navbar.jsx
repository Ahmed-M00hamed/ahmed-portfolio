import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Navbar() {
    const location = useLocation()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const isHome = location.pathname === '/'

    function sectionLink(section) {
        return isHome
            ? `#${section}`
            : `/#${section}`
    }

    function handleLinkClick() {
        setIsMenuOpen(false)
    }

    return (
        <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
            <div className="mx-auto max-w-6xl px-6">
                <div className="flex items-center justify-between py-5">

                    {/* Logo */}
                    <Link
                        to="/"
                        onClick={handleLinkClick}
                        className="text-xl font-bold tracking-tight"
                    >
                        Ahmed
                        <span className="text-blue-500">.</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
                        <a
                            href={sectionLink('home')}
                            className="transition hover:text-white"
                        >
                            Home
                        </a>

                        <a
                            href={sectionLink('projects')}
                            className="transition hover:text-white"
                        >
                            Projects
                        </a>

                        <a
                            href={sectionLink('skills')}
                            className="transition hover:text-white"
                        >
                            Skills
                        </a>

                        <a
                            href={sectionLink('contact')}
                            className="transition hover:text-white"
                        >
                            Contact
                        </a>
                    </nav>

                    {/* Desktop Contact Button */}
                    <a
                        href={sectionLink('contact')}
                        className="hidden rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-500 md:block"
                    >
                        Contact Me
                    </a>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white md:hidden"
                        aria-label="Toggle menu"
                        aria-expanded={isMenuOpen}
                    >
                        <div className="flex flex-col gap-1.5">
                            <span
                                className={`block h-0.5 w-5 bg-current transition-transform duration-300 ${isMenuOpen
                                        ? 'translate-y-2 rotate-45'
                                        : ''
                                    }`}
                            />

                            <span
                                className={`block h-0.5 w-5 bg-current transition-opacity duration-300 ${isMenuOpen
                                        ? 'opacity-0'
                                        : 'opacity-100'
                                    }`}
                            />

                            <span
                                className={`block h-0.5 w-5 bg-current transition-transform duration-300 ${isMenuOpen
                                        ? '-translate-y-2 -rotate-45'
                                        : ''
                                    }`}
                            />
                        </div>
                    </button>
                </div>

                {/* Mobile Navigation */}
                <div
                    className={`overflow-hidden transition-all duration-300 md:hidden ${isMenuOpen
                            ? 'max-h-96 pb-5 opacity-100'
                            : 'max-h-0 opacity-0'
                        }`}
                >
                    <nav className="flex flex-col gap-2 border-t border-slate-800 pt-4">

                        <a
                            href={sectionLink('home')}
                            onClick={handleLinkClick}
                            className="rounded-lg px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            Home
                        </a>

                        <a
                            href={sectionLink('projects')}
                            onClick={handleLinkClick}
                            className="rounded-lg px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            Projects
                        </a>

                        <a
                            href={sectionLink('skills')}
                            onClick={handleLinkClick}
                            className="rounded-lg px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            Skills
                        </a>

                        <a
                            href={sectionLink('contact')}
                            onClick={handleLinkClick}
                            className="rounded-lg px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            Contact
                        </a>

                        <a
                            href={sectionLink('contact')}
                            onClick={handleLinkClick}
                            className="mt-2 rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-500"
                        >
                            Contact Me
                        </a>
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Navbar