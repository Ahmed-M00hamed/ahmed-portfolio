import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft,
    Save,
    Upload,
    X,
    Image as ImageIcon,
    Star,
} from 'lucide-react'

import { createProject } from '../../lib/projects'
import { supabase } from '../../lib/supabase'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const STORAGE_BUCKET = 'portfolio-project-images'

function AddProject() {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        title: '',
        slug: '',
        short_description: '',
        description: '',
        category: '',
        tech_stack: '',
        live_url: '',
        github_url: '',
        featured: false,
        published: true,
        display_order: 0,
    })

    const [selectedImages, setSelectedImages] = useState([])
    const [imagePreviews, setImagePreviews] = useState([])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    /*
     * Create temporary preview URLs.
     */
    useEffect(() => {
        const previews = selectedImages.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }))

        setImagePreviews(previews)

        return () => {
            previews.forEach((preview) => {
                URL.revokeObjectURL(preview.url)
            })
        }
    }, [selectedImages])

    function handleChange(event) {
        const {
            name,
            value,
            type,
            checked,
        } = event.target

        setForm((current) => ({
            ...current,
            [name]:
                type === 'checkbox'
                    ? checked
                    : value,
        }))
    }

    function generateSlug(value) {
        return value
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
    }

    function handleTitleChange(event) {
        const value = event.target.value

        setForm((current) => ({
            ...current,
            title: value,
            slug: generateSlug(value),
        }))
    }

    function handleImageSelect(event) {
        const files = Array.from(
            event.target.files || []
        )

        if (!files.length) {
            return
        }

        const invalidType = files.find(
            (file) => !file.type.startsWith('image/')
        )

        if (invalidType) {
            setError(
                `"${invalidType.name}" is not an image file.`
            )

            event.target.value = ''
            return
        }

        const oversizedFile = files.find(
            (file) => file.size > MAX_IMAGE_SIZE
        )

        if (oversizedFile) {
            setError(
                `"${oversizedFile.name}" is larger than 10MB.`
            )

            event.target.value = ''
            return
        }

        setError('')

        setSelectedImages((current) => [
            ...current,
            ...files,
        ])

        event.target.value = ''
    }

    function removeSelectedImage(index) {
        setSelectedImages((current) =>
            current.filter(
                (_, imageIndex) =>
                    imageIndex !== index
            )
        )
    }

    async function checkSlugExists(slug) {
        const normalizedSlug = slug
            .trim()
            .toLowerCase()

        const {
            data,
            error: slugError,
        } = await supabase
            .from('portfolio_projects')
            .select('id, title')
            .eq('slug', normalizedSlug)
            .maybeSingle()

        if (slugError) {
            throw new Error(
                `Could not check project slug: ${slugError.message}`
            )
        }

        return data
    }

    /*
     * Upload project images.
     *
     * IMPORTANT:
     * The FIRST image automatically becomes
     * the project cover.
     *
     * All remaining images become gallery images.
     */
    async function uploadProjectImages(
        projectId,
        projectSlug
    ) {
        if (!selectedImages.length) {
            return {
                coverImageUrl: null,
                uploadedStoragePaths: [],
            }
        }

        const uploadedStoragePaths = []
        const uploadedImages = []

        try {
            for (
                let index = 0;
                index < selectedImages.length;
                index++
            ) {
                const file = selectedImages[index]

                const extension =
                    file.name
                        .split('.')
                        .pop()
                        ?.toLowerCase() || 'jpg'

                const filePath =
                    `${projectSlug}/${crypto.randomUUID()}.${extension}`

                const {
                    error: uploadError,
                } = await supabase.storage
                    .from(STORAGE_BUCKET)
                    .upload(
                        filePath,
                        file,
                        {
                            cacheControl: '3600',
                            upsert: false,
                            contentType:
                                file.type || undefined,
                        }
                    )

                if (uploadError) {
                    throw new Error(
                        `Failed to upload image "${file.name}": ${uploadError.message}`
                    )
                }

                uploadedStoragePaths.push(
                    filePath
                )

                const {
                    data: publicUrlData,
                } = supabase.storage
                    .from(STORAGE_BUCKET)
                    .getPublicUrl(filePath)

                if (!publicUrlData?.publicUrl) {
                    throw new Error(
                        `Could not generate public URL for "${file.name}".`
                    )
                }

                uploadedImages.push({
                    project_id: projectId,
                    image_url:
                        publicUrlData.publicUrl,
                    display_order: index,
                })
            }

            /*
             * Save all images to gallery.
             */
            const {
                error: imagesError,
            } = await supabase
                .from('portfolio_project_images')
                .insert(uploadedImages)

            if (imagesError) {
                throw new Error(
                    `Images uploaded but could not be saved: ${imagesError.message}`
                )
            }

            /*
             * First image = Cover.
             */
            const coverImageUrl =
                uploadedImages[0]?.image_url || null

            return {
                coverImageUrl,
                uploadedStoragePaths,
            }
        } catch (uploadError) {
            /*
             * Remove uploaded Storage files
             * if anything fails.
             */
            if (
                uploadedStoragePaths.length > 0
            ) {
                await supabase.storage
                    .from(STORAGE_BUCKET)
                    .remove(
                        uploadedStoragePaths
                    )
            }

            throw uploadError
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (loading) {
            return
        }

        setError('')

        const title = form.title.trim()

        const slug = form.slug
            .trim()
            .toLowerCase()

        if (!title) {
            setError(
                'Project title is required.'
            )
            return
        }

        if (!slug) {
            setError(
                'Project slug is required.'
            )
            return
        }

        if (!selectedImages.length) {
            setError(
                'Please select at least one project image.'
            )
            return
        }

        setLoading(true)

        let createdProjectId = null

        try {
            /*
             * Check duplicate slug.
             */
            const existingProject =
                await checkSlugExists(slug)

            if (existingProject) {
                setError(
                    `The slug "${slug}" is already used by "${existingProject.title}". Please choose a different slug.`
                )

                return
            }

            /*
             * Create project first.
             * Cover will be assigned after
             * uploading the first image.
             */
            const projectData = {
                title,
                slug,

                short_description:
                    form.short_description.trim() ||
                    null,

                description:
                    form.description.trim() ||
                    null,

                category:
                    form.category.trim() ||
                    null,

                tech_stack:
                    form.tech_stack
                        .split(',')
                        .map((item) =>
                            item.trim()
                        )
                        .filter(Boolean),

                live_url:
                    form.live_url.trim() ||
                    null,

                github_url:
                    form.github_url.trim() ||
                    null,

                cover_image: null,

                featured: form.featured,

                published: form.published,

                display_order:
                    Number(
                        form.display_order
                    ) || 0,
            }

            const project =
                await createProject(
                    projectData
                )

            createdProjectId = project.id

            /*
             * Upload images.
             */
            const {
                coverImageUrl,
            } =
                await uploadProjectImages(
                    project.id,
                    project.slug
                )

            /*
             * First uploaded image becomes Cover.
             */
            if (coverImageUrl) {
                const {
                    error: coverUpdateError,
                } = await supabase
                    .from('portfolio_projects')
                    .update({
                        cover_image:
                            coverImageUrl,
                        updated_at:
                            new Date().toISOString(),
                    })
                    .eq(
                        'id',
                        project.id
                    )

                if (coverUpdateError) {
                    throw new Error(
                        `Images were uploaded, but the cover image could not be saved: ${coverUpdateError.message}`
                    )
                }
            }

            /*
             * Everything succeeded.
             */
            navigate('/admin/projects')
        } catch (err) {
            console.error(
                'Failed to create project:',
                err
            )

            /*
             * Remove project if something
             * failed after creation.
             *
             * Gallery records are deleted
             * automatically through ON DELETE CASCADE.
             */
            if (createdProjectId) {
                await supabase
                    .from(
                        'portfolio_projects'
                    )
                    .delete()
                    .eq(
                        'id',
                        createdProjectId
                    )
            }

            setError(
                err?.message ||
                'Failed to create project.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto w-full max-w-4xl">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4">
                <div>
                    <p className="text-sm font-medium text-blue-500">
                        Portfolio Admin
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                        Add Project
                    </h1>

                    <p className="mt-2 text-sm text-slate-400 sm:text-base">
                        Add a new project to your portfolio.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/admin/projects'
                        )
                    }
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-fit"
                >
                    <ArrowLeft size={18} />
                    Back to Projects
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-xl border border-red-900/80 bg-red-950/40 px-4 py-4">
                    <p className="text-sm font-medium text-red-300">
                        Something went wrong
                    </p>

                    <p className="mt-1 wrap-break-word text-sm leading-6 text-red-400">
                        {error}
                    </p>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-5 sm:space-y-6"
            >
                {/* Basic Information */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                    <div>
                        <h2 className="text-lg font-semibold text-white sm:text-xl">
                            Basic Information
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Main information about the project.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                        {/* Title */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Project Title *
                            </label>

                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={
                                    handleTitleChange
                                }
                                required
                                disabled={loading}
                                placeholder="e.g. PoP Shoes"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        {/* Slug */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Slug *
                            </label>

                            <input
                                type="text"
                                name="slug"
                                value={form.slug}
                                onChange={
                                    handleChange
                                }
                                required
                                disabled={loading}
                                placeholder="pop-shoes"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                Used for the project URL.
                            </p>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Category
                            </label>

                            <input
                                type="text"
                                name="category"
                                value={form.category}
                                onChange={
                                    handleChange
                                }
                                disabled={loading}
                                placeholder="E-commerce"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        {/* Display Order */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Display Order
                            </label>

                            <input
                                type="number"
                                name="display_order"
                                value={
                                    form.display_order
                                }
                                onChange={
                                    handleChange
                                }
                                min="0"
                                disabled={loading}
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>
                    </div>

                    {/* Short Description */}
                    <div className="mt-5">
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Short Description
                        </label>

                        <input
                            type="text"
                            name="short_description"
                            value={
                                form.short_description
                            }
                            onChange={
                                handleChange
                            }
                            disabled={loading}
                            placeholder="Short description shown on project cards..."
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </div>

                    {/* Description */}
                    <div className="mt-5">
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                            Full Description
                        </label>

                        <textarea
                            name="description"
                            value={
                                form.description
                            }
                            onChange={
                                handleChange
                            }
                            rows={7}
                            disabled={loading}
                            placeholder="Describe the project, features, technologies, challenges..."
                            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </div>
                </section>

                {/* Technologies */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                    <h2 className="text-lg font-semibold text-white sm:text-xl">
                        Technologies
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Separate technologies with commas.
                    </p>

                    <div className="mt-5">
                        <input
                            type="text"
                            name="tech_stack"
                            value={
                                form.tech_stack
                            }
                            onChange={
                                handleChange
                            }
                            disabled={loading}
                            placeholder="React, Vite, Tailwind CSS, Supabase"
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                            Example: React, JavaScript,
                            Supabase, PostgreSQL
                        </p>
                    </div>
                </section>

                {/* Links */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                    <h2 className="text-lg font-semibold text-white sm:text-xl">
                        Project Links
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Links to the live project and source
                        code.
                    </p>

                    <div className="mt-6 space-y-5">
                        {/* Live URL */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Live Website URL
                            </label>

                            <input
                                type="url"
                                name="live_url"
                                value={
                                    form.live_url
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={loading}
                                placeholder="https://example.vercel.app"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        {/* GitHub */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                GitHub URL
                            </label>

                            <input
                                type="url"
                                name="github_url"
                                value={
                                    form.github_url
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={loading}
                                placeholder="https://github.com/username/project"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>
                    </div>
                </section>

                {/* Project Images */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                    <div>
                        <h2 className="text-lg font-semibold text-white sm:text-xl">
                            Project Images
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                            The first image you select becomes
                            the cover automatically. The rest
                            are added to the gallery.
                        </p>
                    </div>

                    {/* Upload */}
                    <div className="mt-6">
                        <label
                            htmlFor="project-images"
                            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/50 px-5 py-10 text-center transition hover:border-blue-500 hover:bg-slate-800 sm:px-6"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                                <Upload size={25} />
                            </div>

                            <p className="mt-4 font-medium text-white">
                                Click to upload images
                            </p>

                            <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500 sm:text-sm">
                                PNG, JPG, JPEG, WEBP —
                                Maximum 10MB per image
                            </p>
                        </label>

                        <input
                            id="project-images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={
                                handleImageSelect
                            }
                            disabled={loading}
                            className="hidden"
                        />
                    </div>

                    {/* Selected Images */}
                    {selectedImages.length > 0 && (
                        <div className="mt-6">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h3 className="text-sm font-semibold text-white">
                                    Selected Images
                                </h3>

                                <span className="shrink-0 text-xs text-slate-500">
                                    {
                                        selectedImages.length
                                    }{' '}
                                    {selectedImages.length ===
                                        1
                                        ? 'image'
                                        : 'images'}
                                </span>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {imagePreviews.map(
                                    (
                                        preview,
                                        index
                                    ) => (
                                        <div
                                            key={`${preview.file.name}-${preview.file.lastModified}-${index}`}
                                            className="group overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
                                        >
                                            <div className="relative">
                                                <img
                                                    src={
                                                        preview.url
                                                    }
                                                    alt={
                                                        preview
                                                            .file
                                                            .name
                                                    }
                                                    className="aspect-video w-full object-cover"
                                                />

                                                {/* Cover */}
                                                {index ===
                                                    0 && (
                                                        <div className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg">
                                                            <Star
                                                                size={
                                                                    13
                                                                }
                                                                fill="currentColor"
                                                            />

                                                            Cover
                                                        </div>
                                                    )}

                                                {/* Remove */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeSelectedImage(
                                                            index
                                                        )
                                                    }
                                                    disabled={
                                                        loading
                                                    }
                                                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                    aria-label={`Remove ${preview.file.name}`}
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-2 border-t border-slate-800 px-3 py-2.5">
                                                <ImageIcon
                                                    size={14}
                                                    className="shrink-0 text-slate-500"
                                                />

                                                <p className="truncate text-xs text-slate-400">
                                                    {
                                                        preview
                                                            .file
                                                            .name
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="mt-4 rounded-xl border border-blue-900/50 bg-blue-950/20 px-4 py-3">
                                <p className="text-xs leading-5 text-blue-300 sm:text-sm">
                                    <strong>
                                        Cover:
                                    </strong>{' '}
                                    أول صورة هنا هتكون
                                    تلقائيًا صورة المشروع
                                    الرئيسية.
                                </p>
                            </div>
                        </div>
                    )}
                </section>

                {/* Publishing */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                    <h2 className="text-lg font-semibold text-white sm:text-xl">
                        Publishing
                    </h2>

                    <div className="mt-6 space-y-3">
                        {/* Featured */}
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-800/50 p-4 transition hover:bg-slate-800">
                            <input
                                type="checkbox"
                                name="featured"
                                checked={
                                    form.featured
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={loading}
                                className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                            />

                            <div className="min-w-0">
                                <p className="font-medium text-white">
                                    Featured Project
                                </p>

                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                    Show this project in
                                    the featured projects
                                    section.
                                </p>
                            </div>
                        </label>

                        {/* Published */}
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-800/50 p-4 transition hover:bg-slate-800">
                            <input
                                type="checkbox"
                                name="published"
                                checked={
                                    form.published
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={loading}
                                className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                            />

                            <div className="min-w-0">
                                <p className="font-medium text-white">
                                    Published
                                </p>

                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                    Published projects
                                    are visible on
                                    your public
                                    portfolio.
                                </p>
                            </div>
                        </label>
                    </div>
                </section>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 pb-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/admin/projects'
                            )
                        }
                        disabled={loading}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        <Save size={18} />

                        {loading
                            ? 'Saving...'
                            : 'Save Project'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default AddProject