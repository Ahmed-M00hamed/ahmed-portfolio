import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft,
    Save,
    Upload,
    X,
    Image as ImageIcon,
    Trash2,
    Star,
    ArrowUp,
    ArrowDown,
} from 'lucide-react'

import {
    getProjectById,
    getProjectImages,
    updateProject,
} from '../../lib/projects'

import { supabase } from '../../lib/supabase'

const STORAGE_BUCKET = 'portfolio-project-images'
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

function EditProject() {
    const navigate = useNavigate()
    const { id } = useParams()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [movingImageId, setMovingImageId] = useState(null)

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

    const [existingImages, setExistingImages] = useState([])
    const [selectedImages, setSelectedImages] = useState([])
    const [imagePreviews, setImagePreviews] = useState([])

    /*
     * Create previews for new images.
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

    /*
     * Load project and gallery.
     */
    useEffect(() => {
        let mounted = true

        async function loadProject() {
            setLoading(true)
            setError('')

            try {
                const [project, projectImages] =
                    await Promise.all([
                        getProjectById(id),
                        getProjectImages(id),
                    ])

                if (!mounted) return

                const sortedImages = [...(projectImages || [])].sort(
                    (a, b) =>
                        Number(a.display_order || 0) -
                        Number(b.display_order || 0)
                )

                setForm({
                    title: project.title || '',
                    slug: project.slug || '',
                    short_description:
                        project.short_description || '',
                    description:
                        project.description || '',
                    category: project.category || '',
                    tech_stack:
                        Array.isArray(project.tech_stack)
                            ? project.tech_stack.join(', ')
                            : '',
                    live_url:
                        project.live_url || '',
                    github_url:
                        project.github_url || '',
                    featured: Boolean(project.featured),
                    published: Boolean(project.published),
                    display_order:
                        project.display_order ?? 0,
                })

                setExistingImages(sortedImages)

                /*
                 * Make sure the cover matches
                 * the first gallery image.
                 */
                await syncCoverImage(id, sortedImages)
            } catch (err) {
                if (!mounted) return

                setError(
                    err.message ||
                    'Failed to load project'
                )
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        if (id) {
            loadProject()
        }

        return () => {
            mounted = false
        }
    }, [id])

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

    function handleTitleChange(event) {
        setForm((current) => ({
            ...current,
            title: event.target.value,
        }))
    }

    /*
     * Sync cover_image with the first gallery image.
     */
    async function syncCoverImage(projectId, images) {
        const sortedImages = [...(images || [])].sort(
            (a, b) =>
                Number(a.display_order || 0) -
                Number(b.display_order || 0)
        )

        const coverImage =
            sortedImages[0]?.image_url || null

        const { error: coverError } =
            await supabase
                .from('portfolio_projects')
                .update({
                    cover_image: coverImage,
                    updated_at:
                        new Date().toISOString(),
                })
                .eq('id', projectId)

        if (coverError) {
            throw new Error(
                `Could not update cover image: ${coverError.message}`
            )
        }

        return coverImage
    }

    /*
     * Select new images.
     */
    function handleImageSelect(event) {
        const files = Array.from(
            event.target.files || []
        )

        if (!files.length) {
            return
        }

        const invalidType = files.find(
            (file) =>
                !file.type.startsWith('image/')
        )

        if (invalidType) {
            setError(
                `"${invalidType.name}" is not an image file.`
            )

            event.target.value = ''
            return
        }

        const oversizedFile = files.find(
            (file) =>
                file.size > MAX_IMAGE_SIZE
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

    /*
     * Remove newly selected image.
     */
    function removeSelectedImage(index) {
        setSelectedImages((current) =>
            current.filter(
                (_, imageIndex) =>
                    imageIndex !== index
            )
        )
    }

    /*
     * Extract Storage path from public URL.
     */
    function getStoragePathFromUrl(url) {
        if (!url) {
            return null
        }

        const marker =
            `/storage/v1/object/public/${STORAGE_BUCKET}/`

        const markerIndex =
            url.indexOf(marker)

        if (markerIndex === -1) {
            return null
        }

        return decodeURIComponent(
            url.substring(
                markerIndex + marker.length
            )
        )
    }

    /*
     * Save image order to database.
     */
    async function saveImageOrder(images) {
        const normalizedImages = [...images].map(
            (image, index) => ({
                ...image,
                display_order: index,
            })
        )

        for (const image of normalizedImages) {
            const { error: updateError } =
                await supabase
                    .from(
                        'portfolio_project_images'
                    )
                    .update({
                        display_order:
                            image.display_order,
                    })
                    .eq('id', image.id)

            if (updateError) {
                throw new Error(
                    `Could not update image order: ${updateError.message}`
                )
            }
        }

        return normalizedImages
    }

    /*
     * Move an existing image up or down.
     *
     * The first image is always the Cover.
     */
    async function moveExistingImage(
        imageId,
        direction
    ) {
        if (movingImageId || saving) {
            return
        }

        const currentIndex =
            existingImages.findIndex(
                (image) => image.id === imageId
            )

        if (currentIndex === -1) {
            return
        }

        const targetIndex =
            direction === 'up'
                ? currentIndex - 1
                : currentIndex + 1

        if (
            targetIndex < 0 ||
            targetIndex >= existingImages.length
        ) {
            return
        }

        setMovingImageId(imageId)
        setError('')

        try {
            const reorderedImages = [
                ...existingImages,
            ]

            const currentImage =
                reorderedImages[currentIndex]

            const targetImage =
                reorderedImages[targetIndex]

            reorderedImages[currentIndex] =
                targetImage

            reorderedImages[targetIndex] =
                currentImage

            const normalizedImages =
                await saveImageOrder(
                    reorderedImages
                )

            setExistingImages(
                normalizedImages
            )

            /*
             * First image is now the Cover.
             */
            await syncCoverImage(
                id,
                normalizedImages
            )
        } catch (err) {
            console.error(
                'Failed to reorder image:',
                err
            )

            setError(
                err.message ||
                'Failed to reorder image'
            )
        } finally {
            setMovingImageId(null)
        }
    }

    /*
     * Delete an existing image.
     *
     * After deletion, the next image becomes Cover.
     */
    async function deleteExistingImage(image) {
        const confirmed = window.confirm(
            'Are you sure you want to delete this image?'
        )

        if (!confirmed) {
            return
        }

        setError('')
        setSaving(true)

        try {
            const storagePath =
                getStoragePathFromUrl(
                    image.image_url
                )

            /*
             * Delete database record first.
             */
            const {
                error: databaseError,
            } = await supabase
                .from(
                    'portfolio_project_images'
                )
                .delete()
                .eq('id', image.id)

            if (databaseError) {
                throw new Error(
                    `Could not delete image record: ${databaseError.message}`
                )
            }

            /*
             * Delete actual Storage file.
             */
            if (storagePath) {
                const {
                    error: storageError,
                } = await supabase.storage
                    .from(STORAGE_BUCKET)
                    .remove([storagePath])

                if (storageError) {
                    console.error(
                        'Storage delete error:',
                        storageError
                    )
                }
            }

            /*
             * Remove from UI.
             */
            const remainingImages =
                existingImages.filter(
                    (item) =>
                        item.id !== image.id
                )

            /*
             * Normalize order.
             */
            const normalizedImages =
                await saveImageOrder(
                    remainingImages
                )

            setExistingImages(
                normalizedImages
            )

            /*
             * First remaining image becomes Cover.
             */
            await syncCoverImage(
                id,
                normalizedImages
            )
        } catch (err) {
            console.error(
                'Failed to delete image:',
                err
            )

            setError(
                err.message ||
                'Failed to delete image'
            )
        } finally {
            setSaving(false)
        }
    }

    /*
     * Upload newly selected images.
     *
     * New images are always added after
     * the existing gallery.
     */
    async function uploadNewImages() {
        if (!selectedImages.length) {
            return existingImages
        }

        const uploadedStoragePaths = []
        const uploadedRows = []

        try {
            const maxDisplayOrder =
                existingImages.reduce(
                    (max, image) =>
                        Math.max(
                            max,
                            Number(
                                image.display_order
                            ) || 0
                        ),
                    -1
                )

            let displayOrder =
                maxDisplayOrder + 1

            for (
                let index = 0;
                index < selectedImages.length;
                index++
            ) {
                const file =
                    selectedImages[index]

                const extension =
                    file.name
                        .split('.')
                        .pop()
                        ?.toLowerCase() || 'jpg'

                const filePath =
                    `${form.slug.trim()}/${crypto.randomUUID()}.${extension}`

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
                                file.type ||
                                undefined,
                        }
                    )

                if (uploadError) {
                    throw new Error(
                        `Failed to upload "${file.name}": ${uploadError.message}`
                    )
                }

                uploadedStoragePaths.push(
                    filePath
                )

                const {
                    data: publicUrlData,
                } = supabase.storage
                    .from(STORAGE_BUCKET)
                    .getPublicUrl(
                        filePath
                    )

                if (
                    !publicUrlData?.publicUrl
                ) {
                    throw new Error(
                        `Could not generate public URL for "${file.name}".`
                    )
                }

                uploadedRows.push({
                    project_id: id,
                    image_url:
                        publicUrlData.publicUrl,
                    display_order:
                        displayOrder,
                })

                displayOrder += 1
            }

            /*
             * Insert gallery records.
             */
            const {
                data: insertedImages,
                error: insertError,
            } = await supabase
                .from(
                    'portfolio_project_images'
                )
                .insert(uploadedRows)
                .select()

            if (insertError) {
                throw new Error(
                    `Images uploaded but could not be saved: ${insertError.message}`
                )
            }

            /*
             * Create the latest gallery state.
             */
            const updatedImages = [
                ...existingImages,
                ...(insertedImages || []),
            ].sort(
                (a, b) =>
                    Number(
                        a.display_order || 0
                    ) -
                    Number(
                        b.display_order || 0
                    )
            )

            /*
             * Normalize order just in case.
             */
            const normalizedImages =
                await saveImageOrder(
                    updatedImages
                )

            setExistingImages(
                normalizedImages
            )

            setSelectedImages([])

            return normalizedImages
        } catch (uploadError) {
            /*
             * Remove Storage files if
             * database operation fails.
             */
            if (
                uploadedStoragePaths.length >
                0
            ) {
                const {
                    error: cleanupError,
                } = await supabase.storage
                    .from(STORAGE_BUCKET)
                    .remove(
                        uploadedStoragePaths
                    )

                if (cleanupError) {
                    console.error(
                        'Failed to cleanup uploaded files:',
                        cleanupError
                    )
                }
            }

            throw uploadError
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (saving) {
            return
        }

        setError('')

        if (!form.title.trim()) {
            setError(
                'Project title is required.'
            )
            return
        }

        if (!form.slug.trim()) {
            setError(
                'Project slug is required.'
            )
            return
        }

        setSaving(true)

        try {
            const projectData = {
                title: form.title.trim(),

                slug: form.slug
                    .trim()
                    .toLowerCase(),

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

                featured: form.featured,

                published: form.published,

                display_order:
                    Number(
                        form.display_order
                    ) || 0,
            }

            /*
             * Update project information.
             */
            await updateProject(
                id,
                projectData
            )

            /*
             * Upload new images and get
             * the latest gallery state.
             */
            const finalImages =
                await uploadNewImages()

            /*
             * IMPORTANT:
             * Use finalImages, not the old
             * existingImages state.
             */
            await syncCoverImage(
                id,
                finalImages
            )

            navigate('/admin/projects')
        } catch (err) {
            console.error(
                'Failed to update project:',
                err
            )

            setError(
                err.message ||
                'Failed to update project'
            )
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

                    <p className="mt-4 text-sm text-slate-400">
                        Loading project...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Edit Project
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Update your project information.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            '/admin/projects'
                        )
                    }
                    disabled={saving}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <ArrowLeft size={18} />

                    Back to Projects
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-xl border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                {/* Basic Information */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <h2 className="text-xl font-semibold text-white">
                        Basic Information
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Main information about the project.
                    </p>

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
                                disabled={saving}
                                placeholder="e.g. PoP Shoes"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
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
                                disabled={saving}
                                placeholder="pop-shoes"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            />

                            <p className="mt-2 text-xs text-slate-500">
                                Must be unique.
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
                                disabled={saving}
                                placeholder="E-commerce"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
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
                                disabled={saving}
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
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
                            disabled={saving}
                            placeholder="Short description shown on project cards..."
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </div>

                    {/* Full Description */}
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
                            rows="7"
                            disabled={saving}
                            placeholder="Describe the project..."
                            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </div>
                </section>

                {/* Technologies */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <h2 className="text-xl font-semibold text-white">
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
                            disabled={saving}
                            placeholder="React, Vite, Tailwind CSS, Supabase"
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </div>
                </section>

                {/* Links */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <h2 className="text-xl font-semibold text-white">
                        Project Links
                    </h2>

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
                                disabled={saving}
                                placeholder="https://example.vercel.app"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
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
                                disabled={saving}
                                placeholder="https://github.com/username/project"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>
                    </div>
                </section>

                {/* Project Gallery */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            Project Gallery
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            The first image is automatically
                            used as the project cover.
                        </p>
                    </div>

                    {existingImages.length > 0 ? (
                        <div className="mt-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-white">
                                    Current Images
                                </h3>

                                <span className="text-xs text-slate-500">
                                    {
                                        existingImages.length
                                    }{' '}
                                    {existingImages.length ===
                                        1
                                        ? 'image'
                                        : 'images'}
                                </span>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {existingImages.map(
                                    (
                                        image,
                                        index
                                    ) => {
                                        const isMoving =
                                            movingImageId ===
                                            image.id

                                        return (
                                            <div
                                                key={
                                                    image.id
                                                }
                                                className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
                                            >
                                                <div className="relative">
                                                    <img
                                                        src={
                                                            image.image_url
                                                        }
                                                        alt={`Project image ${index + 1}`}
                                                        className="aspect-video w-full object-cover"
                                                    />

                                                    {/* Cover Badge */}
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

                                                    {/* Delete */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            deleteExistingImage(
                                                                image
                                                            )
                                                        }
                                                        disabled={
                                                            saving ||
                                                            Boolean(
                                                                movingImageId
                                                            )
                                                        }
                                                        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/75 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        aria-label="Delete image"
                                                        title="Delete image"
                                                    >
                                                        <Trash2
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>
                                                </div>

                                                {/* Image Controls */}
                                                <div className="border-t border-slate-800 px-3 py-3">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <ImageIcon
                                                                size={
                                                                    14
                                                                }
                                                                className="shrink-0 text-slate-500"
                                                            />

                                                            <p className="truncate text-xs text-slate-400">
                                                                Image{' '}
                                                                {index +
                                                                    1}
                                                            </p>
                                                        </div>

                                                        <div className="flex shrink-0 items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    moveExistingImage(
                                                                        image.id,
                                                                        'up'
                                                                    )
                                                                }
                                                                disabled={
                                                                    index ===
                                                                    0 ||
                                                                    saving ||
                                                                    Boolean(
                                                                        movingImageId
                                                                    )
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                                                aria-label="Move image up"
                                                                title="Move up"
                                                            >
                                                                <ArrowUp
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    moveExistingImage(
                                                                        image.id,
                                                                        'down'
                                                                    )
                                                                }
                                                                disabled={
                                                                    index ===
                                                                    existingImages.length -
                                                                    1 ||
                                                                    saving ||
                                                                    Boolean(
                                                                        movingImageId
                                                                    )
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                                                                aria-label="Move image down"
                                                                title="Move down"
                                                            >
                                                                <ArrowDown
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {isMoving && (
                                                        <p className="mt-2 text-center text-xs text-blue-400">
                                                            Updating order...
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    }
                                )}
                            </div>

                            <div className="mt-4 rounded-xl border border-blue-900/50 bg-blue-950/20 px-4 py-3">
                                <p className="text-xs leading-5 text-blue-300 sm:text-sm">
                                    <strong>
                                        Cover:
                                    </strong>{' '}
                                    الصورة الأولى هي صورة
                                    المشروع الرئيسية.
                                    استخدم أسهم الترتيب
                                    لتغيير الـ Cover.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-800/40 px-6 py-10 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-500">
                                <ImageIcon
                                    size={22}
                                />
                            </div>

                            <p className="mt-3 text-sm font-medium text-slate-300">
                                No gallery images yet
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Upload project screenshots
                                below.
                            </p>
                        </div>
                    )}

                    {/* Upload New Images */}
                    <div className="mt-8 border-t border-slate-800 pt-8">
                        <h3 className="text-sm font-semibold text-white">
                            Add New Images
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            New images will be added to the
                            end of the gallery.
                        </p>

                        <div className="mt-5">
                            <label
                                htmlFor="project-images"
                                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/50 px-6 py-10 text-center transition hover:border-blue-500 hover:bg-slate-800"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                                    <Upload size={25} />
                                </div>

                                <p className="mt-4 font-medium text-white">
                                    Click to upload images
                                </p>

                                <p className="mt-2 text-sm text-slate-500">
                                    PNG, JPG, JPEG, WEBP
                                    — Maximum 10MB per
                                    image
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
                                disabled={saving}
                                className="hidden"
                            />
                        </div>

                        {/* New Image Previews */}
                        {selectedImages.length >
                            0 && (
                                <div className="mt-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-white">
                                            New Images
                                        </h3>

                                        <span className="text-xs text-slate-500">
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
                                                    className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
                                                >
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

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeSelectedImage(
                                                                index
                                                            )
                                                        }
                                                        disabled={
                                                            saving
                                                        }
                                                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        aria-label="Remove image"
                                                    >
                                                        <X
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>

                                                    <div className="flex items-center gap-2 border-t border-slate-800 px-3 py-2">
                                                        <ImageIcon
                                                            size={
                                                                14
                                                            }
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
                                </div>
                            )}
                    </div>
                </section>

                {/* Publishing */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <h2 className="text-xl font-semibold text-white">
                        Publishing
                    </h2>

                    <div className="mt-6 space-y-4">
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
                                disabled={saving}
                                className="mt-1 h-4 w-4 accent-blue-600"
                            />

                            <div>
                                <p className="font-medium text-white">
                                    Featured Project
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    Show this project in
                                    the featured section.
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
                                disabled={saving}
                                className="mt-1 h-4 w-4 accent-blue-600"
                            />

                            <div>
                                <p className="font-medium text-white">
                                    Published
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
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
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                '/admin/projects'
                            )
                        }
                        disabled={saving}
                        className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Save size={18} />

                        {saving
                            ? 'Saving...'
                            : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditProject