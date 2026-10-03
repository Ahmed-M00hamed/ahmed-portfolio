import { useState } from 'react'
import {
    NavLink,
    Outlet,
    useNavigate,
} from 'react-router-dom'
import {
    LayoutDashboard,
    FolderKanban,
    Plus,
    Code2,
    User,
    Settings,
    LogOut,
    Menu,
    X,
} from 'lucide-react'

import { logoutAdmin } from '../lib/auth'

function AdminLayout() {
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const navItems = [
        {
            label: 'Dashboard',
            path: '/admin',
            icon: LayoutDashboard,
            end: true,
        },
        {
            label: 'All Projects',
            path: '/admin/projects',
            icon: FolderKanban,
        },
        {
            label: 'Add Project',
            path: '/admin/projects/add',
            icon: Plus,
        },
        {
            label: 'Skills',
            path: '/admin/skills',
            icon: Code2,
        },
        {
            label: 'Profile',
            path: '/admin/profile',
            icon: User,
        },
        {
            label: 'Settings',
            path: '/admin/settings',
            icon: Settings,
        },
    ]

    async function handleLogout() {
        try {
            await logoutAdmin()
            navigate('/admin/login')
        } catch (error) {
            console.error(
                'Logout failed:',
                error
            )
        }
    }

    function closeSidebar() {
        setSidebarOpen(false)
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="flex min-h-screen">

                {/* Mobile Overlay */}
                {sidebarOpen && (
                    <button
                        type="button"
                        aria-label="Close sidebar"
                        onClick={closeSidebar}
                        className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-300 lg:static lg:z-auto lg:w-64 lg:translate-x-0 ${sidebarOpen
                            ? 'translate-x-0'
                            : '-translate-x-full'
                        }`}
                >
                    {/* Logo */}
                    <div className="flex items-center justify-between border-b border-slate-800 px-6 py-6">
                        <div>
                            <h1 className="text-xl font-bold">
                                Ahmed
                                <span className="text-blue-500">
                                    .
                                </span>
                            </h1>

                            <p className="mt-1 text-xs text-slate-500">
                                Portfolio Admin
                            </p>
                        </div>

                        {/* Mobile Close */}
                        <button
                            type="button"
                            onClick={closeSidebar}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
                            aria-label="Close sidebar"
                        >
                            <X size={21} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2 overflow-y-auto p-4">
                        {navItems.map((item) => {
                            const Icon = item.icon

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    onClick={
                                        closeSidebar
                                    }
                                    className={({
                                        isActive,
                                    }) =>
                                        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`
                                    }
                                >
                                    <Icon size={19} />

                                    <span>
                                        {item.label}
                                    </span>
                                </NavLink>
                            )
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="border-t border-slate-800 p-4">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-950/40 hover:text-red-400"
                        >
                            <LogOut size={19} />

                            <span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main */}
                <div className="flex min-w-0 flex-1 flex-col">

                    {/* Header */}
                    <header className="border-b border-slate-800 bg-slate-950">
                        <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">

                            {/* Mobile Menu Button */}
                            <button
                                type="button"
                                onClick={() =>
                                    setSidebarOpen(true)
                                }
                                className="rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-300 transition hover:bg-slate-800 hover:text-white lg:hidden"
                                aria-label="Open sidebar"
                            >
                                <Menu size={21} />
                            </button>

                            <div className="hidden sm:block">
                                <p className="text-sm text-slate-500">
                                    Admin Panel
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                    Manage your portfolio
                                </p>
                            </div>

                            {/* Mobile Title */}
                            <div className="sm:hidden">
                                <p className="text-sm font-semibold">
                                    Admin Panel
                                </p>
                            </div>

                            {/* Avatar */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold">
                                A
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    )
}

export default AdminLayout