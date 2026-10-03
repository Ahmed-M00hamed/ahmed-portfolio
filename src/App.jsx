import { useEffect, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { supabase } from './lib/supabase'

import Home from './pages/Home'
import PublicProjects from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'

import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import AdminLayout from './layouts/AdminLayout'
import AdminProjects from './pages/admin/Projects'
import AddProject from './pages/admin/AddProject'
import EditProject from './pages/admin/EditProject'
import Skills from './pages/admin/Skills'
import Profile from './pages/admin/Profile'
import Settings from './pages/admin/Settings'


function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    let mounted = true

    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      setAuthenticated(Boolean(session))
      setLoading(false)
    }

    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return

        setAuthenticated(Boolean(session))
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            Public Website
        ========================== */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/projects"
          element={<PublicProjects />}
        />

        <Route
          path="/projects/:slug"
          element={<ProjectDetails />}
        />


        {/* =========================
            Admin Login
        ========================== */}

        <Route
          path="/admin/login"
          element={<Login />}
        />


        {/* =========================
            Admin Panel
        ========================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route
            index
            element={<Dashboard />}
          />

          {/* All Projects */}
          <Route
            path="projects"
            element={<AdminProjects />}
          />

          {/* Add Project */}
          <Route
            path="projects/add"
            element={<AddProject />}
          />

          {/* Edit Project */}
          <Route
            path="projects/edit/:id"
            element={<EditProject />}
          />

          {/* Skills */}
          <Route
            path="skills"
            element={<Skills />}
          />

          {/* Profile */}
          <Route
            path="profile"
            element={<Profile />}
          />

          {/* Settings */}
          <Route
            path="settings"
            element={<Settings />}
          />

        </Route>


        {/* =========================
            Unknown Routes
        ========================== */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App