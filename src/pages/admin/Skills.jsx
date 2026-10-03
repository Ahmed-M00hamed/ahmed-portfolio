import { useEffect, useState } from 'react'
import {
    Code2,
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
    X,
    Save,
} from 'lucide-react'

import SkillIcon from '../../components/SkillIcon'

import {
    getAllSkills,
    createSkill,
    updateSkill,
    deleteSkill,
} from '../../lib/skills'

function Skills() {
    const [skills, setSkills] = useState([])

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)

    const [form, setForm] = useState({
        name: '',
        category: '',
        icon: '',
        display_order: 0,
    })

    async function loadSkills() {
        if (saving) return

        setLoading(true)
        setError('')

        try {
            const data = await getAllSkills()

            const sortedSkills = [...(data || [])].sort(
                (a, b) =>
                    (a.display_order ?? 0) -
                    (b.display_order ?? 0)
            )

            setSkills(sortedSkills)
        } catch (err) {
            console.error(
                'Failed to load skills:',
                err
            )

            setError(
                err?.message ||
                'Failed to load skills.'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSkills()
    }, [])

    function resetForm() {
        setForm({
            name: '',
            category: '',
            icon: '',
            display_order: 0,
        })

        setEditingId(null)
        setShowForm(false)
        setError('')
    }

    function handleChange(event) {
        const {
            name,
            value,
        } = event.target

        setForm((current) => ({
            ...current,
            [name]: value,
        }))
    }

    function handleAdd() {
        setForm({
            name: '',
            category: '',
            icon: '',
            display_order: skills.length,
        })

        setEditingId(null)
        setError('')
        setShowForm(true)
    }

    function handleEdit(skill) {
        setForm({
            name: skill.name || '',
            category: skill.category || '',
            icon: skill.icon || '',
            display_order:
                skill.display_order ?? 0,
        })

        setEditingId(skill.id)
        setError('')
        setShowForm(true)
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (saving) return

        setError('')

        const name = form.name.trim()

        if (!name) {
            setError('Skill name is required.')
            return
        }

        setSaving(true)

        try {
            const skillData = {
                name,
                category:
                    form.category.trim() || null,
                icon:
                    form.icon.trim() || null,
                display_order:
                    Number(
                        form.display_order
                    ) || 0,
            }

            if (editingId) {
                await updateSkill(
                    editingId,
                    skillData
                )
            } else {
                await createSkill(skillData)
            }

            setForm({
                name: '',
                category: '',
                icon: '',
                display_order: 0,
            })

            setEditingId(null)
            setShowForm(false)

            await loadSkills()
        } catch (err) {
            console.error(
                'Failed to save skill:',
                err
            )

            setError(
                err?.message ||
                'Failed to save skill.'
            )
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(skill) {
        if (saving) return

        const confirmed = window.confirm(
            `Are you sure you want to delete "${skill.name}"?`
        )

        if (!confirmed) {
            return
        }

        setError('')
        setSaving(true)

        try {
            await deleteSkill(skill.id)

            setSkills((current) =>
                current.filter(
                    (item) =>
                        item.id !== skill.id
                )
            )
        } catch (err) {
            console.error(
                'Failed to delete skill:',
                err
            )

            setError(
                err?.message ||
                'Failed to delete skill.'
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="mx-auto w-full max-w-6xl">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white sm:text-3xl">
                        Skills
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                        Manage the technologies and
                        skills shown on your portfolio.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex">
                    <button
                        type="button"
                        onClick={loadSkills}
                        disabled={
                            loading || saving
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            size={17}
                            className={
                                loading
                                    ? 'animate-spin'
                                    : ''
                            }
                        />

                        <span>Refresh</span>
                    </button>

                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={saving}
                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus size={18} />

                        <span>Add Skill</span>
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={() =>
                            setError('')
                        }
                        className="shrink-0 text-red-400 transition hover:text-red-200"
                        aria-label="Close error"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            {/* Form */}
            {showForm && (
                <section className="mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5 sm:p-6">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500">
                                    <Code2
                                        size={20}
                                    />
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-white sm:text-xl">
                                        {editingId
                                            ? 'Edit Skill'
                                            : 'Add Skill'}
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                        {editingId
                                            ? 'Update this skill in your portfolio.'
                                            : 'Add a technology or skill to your portfolio.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={resetForm}
                            disabled={saving}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Close form"
                        >
                            <X size={19} />
                        </button>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="p-5 sm:p-6"
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="skill-name"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Skill Name *
                                </label>

                                <input
                                    id="skill-name"
                                    type="text"
                                    name="name"
                                    value={
                                        form.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={saving}
                                    autoFocus
                                    placeholder="React"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label
                                    htmlFor="skill-category"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Category
                                </label>

                                <input
                                    id="skill-category"
                                    type="text"
                                    name="category"
                                    value={
                                        form.category
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={saving}
                                    placeholder="Frontend"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            {/* Icon */}
                            <div>
                                <label
                                    htmlFor="skill-icon"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Icon
                                </label>

                                <input
                                    id="skill-icon"
                                    type="text"
                                    name="icon"
                                    value={
                                        form.icon
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={saving}
                                    placeholder="Leave empty to auto-detect from the skill name"
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />

                                <p className="mt-2 text-xs text-slate-500">
                                    Optional. Leave it empty and the logo is detected from the skill name (React, Node.js, Tailwind CSS...). You can also type a logo name from simpleicons.org, an emoji, or an image URL.
                                </p>
                            </div>

                            {/* Order */}
                            <div>
                                <label
                                    htmlFor="skill-order"
                                    className="mb-2 block text-sm font-medium text-slate-300"
                                >
                                    Display Order
                                </label>

                                <input
                                    id="skill-order"
                                    type="number"
                                    name="display_order"
                                    value={
                                        form.display_order
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min="0"
                                    disabled={saving}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                />

                                <p className="mt-2 text-xs text-slate-500">
                                    Lower numbers
                                    appear first.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={saving}
                                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save size={17} />

                                {saving
                                    ? 'Saving...'
                                    : editingId
                                        ? 'Save Changes'
                                        : 'Add Skill'}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Skills List */}
            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(
                        (item) => (
                            <div
                                key={item}
                                className="h-32 animate-pulse rounded-2xl border border-slate-800 bg-slate-900"
                            />
                        )
                    )}
                </div>
            ) : skills.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-500">
                        <Code2 size={28} />
                    </div>

                    <h2 className="mt-5 text-xl font-semibold text-white">
                        No skills yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Start adding your technologies
                        and skills to display them on
                        your portfolio.
                    </p>

                    <button
                        type="button"
                        onClick={handleAdd}
                        disabled={saving}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Plus size={18} />

                        Add Your First Skill
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {skills.map((skill) => (
                        <div
                            key={skill.id}
                            className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 hover:bg-slate-900/80"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500">
                                        <SkillIcon skill={skill} size={22} />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="truncate font-semibold text-white">
                                            {skill.name}
                                        </h3>

                                        <p className="mt-1 truncate text-xs text-slate-500">
                                            {skill.category ||
                                                'No category'}
                                        </p>
                                    </div>
                                </div>

                                <span className="shrink-0 rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-500">
                                    #
                                    {skill.display_order ??
                                        0}
                                </span>
                            </div>

                            {skill.icon && (
                                <div className="mt-4 rounded-lg bg-slate-950/60 px-3 py-2 text-xs text-slate-500">
                                    Icon:{' '}
                                    <span className="text-slate-400">
                                        {skill.icon}
                                    </span>
                                </div>
                            )}

                            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleEdit(
                                            skill
                                        )
                                    }
                                    disabled={saving}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Pencil
                                        size={15}
                                    />

                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDelete(
                                            skill
                                        )
                                    }
                                    disabled={saving}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Trash2
                                        size={15}
                                    />

                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Skills