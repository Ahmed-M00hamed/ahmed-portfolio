import { useEffect, useState } from 'react'

import { getProfile } from '../lib/profile'
import { getPublishedProjects } from '../lib/projects'
import { getAllSkills } from '../lib/skills'

import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

import Hero from '../components/home/Hero'
import ProjectsSection from '../components/home/ProjectsSection'
import SkillsSection from '../components/home/SkillsSection'
import ContactSection from '../components/home/ContactSection'

function Home() {
    const [profile, setProfile] = useState(null)
    const [projects, setProjects] = useState([])
    const [skills, setSkills] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let mounted = true

        async function loadPortfolio() {
            try {
                setLoading(true)
                setError('')

                const [
                    profileData,
                    projectsData,
                    skillsData,
                ] = await Promise.all([
                    getProfile(),
                    getPublishedProjects(),
                    getAllSkills(),
                ])

                if (!mounted) return

                setProfile(profileData)
                setProjects(projectsData || [])
                setSkills(skillsData || [])
            } catch (err) {
                console.error(
                    'Failed to load portfolio:',
                    err
                )

                if (!mounted) return

                setError(
                    err.message ||
                    'Failed to load portfolio data'
                )
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        loadPortfolio()

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
                        Loading portfolio...
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

                    <button
                        type="button"
                        onClick={() =>
                            window.location.reload()
                        }
                        className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Navbar />

            <main>
                <Hero profile={profile} />

                <ProjectsSection
                    projects={projects}
                />

                <SkillsSection
                    skills={skills}
                />

                <ContactSection
                    profile={profile}
                />
            </main>

            <Footer
                profile={profile}
            />
        </div>
    )
}

export default Home