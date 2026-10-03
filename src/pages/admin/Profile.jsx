import { useEffect, useState } from 'react'
import {
    Save,
    RefreshCw,
    User,
    Upload,
    Trash2,
    Image as ImageIcon,
    X,
} from 'lucide-react'

import {
    getProfile,
    createProfile,
    updateProfile,
} from '../../lib/profile'

import { supabase } from '../../lib/supabase'

const STORAGE_BUCKET = 'portfolio-profile'
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

function Profile() {
    const [profileId, setProfileId] = useState(null)

    const [form, setForm] = useState({
        name: 'Ahmed Mohamed',
        title: 'Junior React / Frontend Developer',
        bio: '',
        email: '',
        phone: '',
        location: '',
        github_url: '',
        linkedin_url: '',
        cv_url: '',
        avatar_url: '',
    })

    const [selectedImage, setSelectedImage] = useState(null)
    const [imagePreview, setImagePreview] = useState('')

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deletingImage, setDeletingImage] = useState(false)

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    async function loadProfile() {
        if (saving || deletingImage) {
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const data = await getProfile()

            if (data) {
                setProfileId(data.id)

                setForm({
                    name: data.name || '',
                    title: data.title || '',
                    bio: data.bio || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    location: data.location || '',
                    github_url:
                        data.github_url || '',
                    linkedin_url:
                        data.linkedin_url || '',
                    cv_url: data.cv_url || '',
                    avatar_url:
                        data.avatar_url || '',
                })

                setImagePreview(
                    data.avatar_url || ''
                )
            } else {
                setProfileId(null)

                setForm({
                    name: 'Ahmed Mohamed',
                    title:
                        'Junior React / Frontend Developer',
                    bio: '',
                    email: '',
                    phone: '',
                    location: '',
                    github_url: '',
                    linkedin_url: '',
                    cv_url: '',
                    avatar_url: '',
                })

                setImagePreview('')
            }
        } catch (err) {
            console.error(
                'Failed to load profile:',
                err
            )

            setError(
                err?.message ||
                    'Failed to load profile.'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadProfile()
    }, [])

    useEffect(() => {
        if (!selectedImage) {
            return
        }

        const previewUrl =
            URL.createObjectURL(selectedImage)

        setImagePreview(previewUrl)

        return () => {
            URL.revokeObjectURL(previewUrl)
        }
    }, [selectedImage])

    function handleChange(event) {
        const {
            name,
            value,
        } = event.target

        setForm((current) => ({
            ...current,
            [name]: value,
        }))

        setSuccess('')
    }

    function handleImageSelect(event) {
        const file = event.target.files?.[0]

        if (!file) {
            return
        }

        setError('')
        setSuccess('')

        if (!file.type.startsWith('image/')) {
            setError(
                'Please select a valid image file.'
            )

            event.target.value = ''
            return
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setError(
                'Image size must be less than 10MB.'
            )

            event.target.value = ''
            return
        }

        setSelectedImage(file)

        event.target.value = ''
    }

    function removeSelectedImage() {
        setSelectedImage(null)
        setImagePreview(form.avatar_url || '')
        setError('')
        setSuccess('')
    }

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

    async function uploadProfileImage() {
        if (!selectedImage) {
            return {
                url: form.avatar_url || null,
                storagePath: null,
            }
        }

        const extension =
            selectedImage.name
                .split('.')
                .pop()
                ?.toLowerCase() || 'jpg'

        const filePath =
            `profile/${crypto.randomUUID()}.${extension}`

        const {
            error: uploadError,
        } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(
                filePath,
                selectedImage,
                {
                    cacheControl: '3600',
                    upsert: false,
                    contentType:
                        selectedImage.type ||
                        'image/jpeg',
                }
            )

        if (uploadError) {
            throw new Error(
                `Storage upload failed: ${uploadError.message}`
            )
        }

        const {
            data: publicUrlData,
        } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(filePath)

        const publicUrl =
            publicUrlData?.publicUrl

        if (!publicUrl) {
            await supabase.storage
                .from(STORAGE_BUCKET)
                .remove([filePath])

            throw new Error(
                'Could not generate profile image URL.'
            )
        }

        return {
            url: publicUrl,
            storagePath: filePath,
        }
    }

    async function deleteStorageFile(
        storagePath
    ) {
        if (!storagePath) {
            return
        }

        const {
            error: storageError,
        } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove([storagePath])

        if (storageError) {
            throw new Error(
                `Failed to delete image: ${storageError.message}`
            )
        }
    }

    async function handleDeleteImage() {
        if (!form.avatar_url || saving) {
            return
        }

        const confirmed = window.confirm(
            'Are you sure you want to delete your profile image?'
        )

        if (!confirmed) {
            return
        }

        setDeletingImage(true)
        setError('')
        setSuccess('')

        try {
            const oldStoragePath =
                getStoragePathFromUrl(
                    form.avatar_url
                )

            /*
             * Update database first.
             * If this succeeds, the public profile
             * no longer points to the old image.
             */
            if (profileId) {
                await updateProfile(
                    profileId,
                    {
                        avatar_url: null,
                    }
                )
            }

            /*
             * Delete old file from Storage.
             */
            if (oldStoragePath) {
                try {
                    await deleteStorageFile(
                        oldStoragePath
                    )
                } catch (storageError) {
                    /*
                     * The database is already correct.
                     * Log the Storage issue instead of
                     * reverting the profile.
                     */
                    console.error(
                        'Failed to delete old profile image from Storage:',
                        storageError
                    )
                }
            }

            setForm((current) => ({
                ...current,
                avatar_url: '',
            }))

            setSelectedImage(null)
            setImagePreview('')

            setSuccess(
                'Profile image deleted successfully.'
            )
        } catch (err) {
            console.error(
                'Failed to delete profile image:',
                err
            )

            setError(
                err?.message ||
                    'Failed to delete profile image.'
            )
        } finally {
            setDeletingImage(false)
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()

        if (saving || deletingImage) {
            return
        }

        setSaving(true)
        setError('')
        setSuccess('')

        let uploadedImage = null

        try {
            /*
             * Upload the new image first.
             * We keep the path so we can clean it up
             * if saving the profile fails.
             */
            if (selectedImage) {
                uploadedImage =
                    await uploadProfileImage()
            }

            const avatarUrl =
                uploadedImage?.url ||
                form.avatar_url ||
                null

            const profileData = {
                name: form.name.trim(),
                title: form.title.trim(),
                bio:
                    form.bio.trim() || null,
                email:
                    form.email.trim() || null,
                phone:
                    form.phone.trim() || null,
                location:
                    form.location.trim() || null,
                github_url:
                    form.github_url.trim() ||
                    null,
                linkedin_url:
                    form.linkedin_url.trim() ||
                    null,
                cv_url:
                    form.cv_url.trim() || null,
                avatar_url: avatarUrl,
            }

            let savedProfile

            if (profileId) {
                savedProfile =
                    await updateProfile(
                        profileId,
                        profileData
                    )
            } else {
                savedProfile =
                    await createProfile(
                        profileData
                    )

                setProfileId(
                    savedProfile.id
                )
            }

            /*
             * If a new image replaced an old one,
             * remove the old file from Storage.
             */
            if (
                uploadedImage?.storagePath &&
                form.avatar_url
            ) {
                const oldStoragePath =
                    getStoragePathFromUrl(
                        form.avatar_url
                    )

                if (
                    oldStoragePath &&
                    oldStoragePath !==
                        uploadedImage.storagePath
                ) {
                    try {
                        await deleteStorageFile(
                            oldStoragePath
                        )
                    } catch (storageError) {
                        /*
                         * The profile was already saved
                         * correctly, so don't show the
                         * entire save as failed.
                         */
                        console.error(
                            'Failed to delete previous profile image:',
                            storageError
                        )
                    }
                }
            }

            setForm((current) => ({
                ...current,
                avatar_url:
                    avatarUrl || '',
            }))

            setSelectedImage(null)
            setImagePreview(
                avatarUrl || ''
            )

            setSuccess(
                'Profile saved successfully.'
            )
        } catch (err) {
            console.error(
                'Failed to save profile:',
                err
            )

            /*
             * If the new image uploaded successfully
             * but the database save failed,
             * remove the new image to avoid orphaned
             * Storage files.
             */
            if (
                uploadedImage?.storagePath
            ) {
                try {
                    await deleteStorageFile(
                        uploadedImage.storagePath
                    )
                } catch (cleanupError) {
                    console.error(
                        'Failed to clean up uploaded profile image:',
                        cleanupError
                    )
                }
            }

            setError(
                err?.message ||
                    'Failed to save profile.'
            )
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-125 items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

                    <p className="mt-4 text-sm text-slate-400">
                        Loading profile...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto w-full max-w-4xl">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-blue-500">
                        Portfolio Admin
                    </p>

                    <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                        Profile
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-slate-400 sm:text-base">
                        Manage the personal information
                        shown on your portfolio.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadProfile}
                    disabled={
                        loading ||
                        saving ||
                        deletingImage
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                    <RefreshCw
                        size={17}
                        className={
                            loading
                                ? 'animate-spin'
                                : ''
                        }
                    />

                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-900/80 bg-red-950/40 px-4 py-4">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-red-300">
                            Something went wrong
                        </p>

                        <p className="mt-1 wrap-break-word text-sm leading-6 text-red-400">
                            {error}
                        </p>
                    </div>

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

            {/* Success */}
            {success && (
                <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-emerald-900/80 bg-emerald-950/40 px-4 py-4">
                    <p className="text-sm leading-6 text-emerald-300">
                        {success}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess('')
                        }
                        className="shrink-0 text-emerald-400 transition hover:text-emerald-200"
                        aria-label="Close success message"
                    >
                        <X size={17} />
                    </button>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-5 sm:space-y-6"
            >
                {/* Basic Information */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500">
                            <User size={20} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-white sm:text-xl">
                                Basic Information
                            </h2>

                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                                Your name and professional
                                information.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                        {/* Name */}
                        <div>
                            <label
                                htmlFor="profile-name"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Name *
                            </label>

                            <input
                                id="profile-name"
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={
                                    handleChange
                                }
                                required
                                disabled={saving}
                                placeholder="Ahmed Mohamed"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        {/* Title */}
                        <div>
                            <label
                                htmlFor="profile-title"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Professional Title *
                            </label>

                            <input
                                id="profile-title"
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={
                                    handleChange
                                }
                                required
                                disabled={saving}
                                placeholder="Junior React / Frontend Developer"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="mt-5">
                        <label
                            htmlFor="profile-bio"
                            className="mb-2 block text-sm font-medium text-slate-300"
                        >
                            Bio
                        </label>

                        <textarea
                            id="profile-bio"
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            rows={6}
                            disabled={saving}
                            placeholder="Tell visitors about yourself, your experience and what you build..."
                            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                    </div>
                </section>

                {/* Contact Information */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                    <h2 className="text-lg font-semibold text-white sm:text-xl">
                        Contact Information
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Information visitors can use to
                        contact you.
                    </p>

                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="profile-email"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Email
                            </label>

                            <input
                                id="profile-email"
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={
                                    handleChange
                                }
                                disabled={saving}
                                placeholder="ahmed@example.com"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label
                                htmlFor="profile-phone"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Phone
                            </label>

                            <input
                                id="profile-phone"
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={
                                    handleChange
                                }
                                disabled={saving}
                                placeholder="+20..."
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        {/* Location */}
                        <div className="md:col-span-2">
                            <label
                                htmlFor="profile-location"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                Location
                            </label>

                            <input
                                id="profile-location"
                                type="text"
                                name="location"
                                value={
                                    form.location
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={saving}
                                placeholder="Egypt"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>
                    </div>
                </section>

                {/* Links */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                    <h2 className="text-lg font-semibold text-white sm:text-xl">
                        Links
                    </h2>

                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                        Add your professional and
                        portfolio links.
                    </p>

                    <div className="mt-6 space-y-5">
                        {/* GitHub */}
                        <div>
                            <label
                                htmlFor="profile-github"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                GitHub URL
                            </label>

                            <input
                                id="profile-github"
                                type="url"
                                name="github_url"
                                value={
                                    form.github_url
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={saving}
                                placeholder="https://github.com/username"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        {/* LinkedIn */}
                        <div>
                            <label
                                htmlFor="profile-linkedin"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                LinkedIn URL
                            </label>

                            <input
                                id="profile-linkedin"
                                type="url"
                                name="linkedin_url"
                                value={
                                    form.linkedin_url
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={saving}
                                placeholder="https://linkedin.com/in/username"
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>

                        {/* CV */}
                        <div>
                            <label
                                htmlFor="profile-cv"
                                className="mb-2 block text-sm font-medium text-slate-300"
                            >
                                CV URL
                            </label>

                            <input
                                id="profile-cv"
                                type="url"
                                name="cv_url"
                                value={form.cv_url}
                                onChange={
                                    handleChange
                                }
                                disabled={saving}
                                placeholder="https://..."
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                        </div>
                    </div>
                </section>

                {/* Profile Image */}
                <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-500">
                            <ImageIcon size={20} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-white sm:text-xl">
                                Profile Image
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                                Upload your profile image
                                directly from your device.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        {/* Preview */}
                        <div className="flex justify-center">
                            <div className="relative">
                                {imagePreview ? (
                                    <img
                                        src={
                                            imagePreview
                                        }
                                        alt="Profile preview"
                                        className="h-40 w-40 rounded-full border-4 border-slate-800 object-cover shadow-xl"
                                        onError={() => {
                                            setImagePreview(
                                                ''
                                            )
                                        }}
                                    />
                                ) : (
                                    <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-slate-800 bg-slate-800 text-slate-600">
                                        <User
                                            size={
                                                55
                                            }
                                        />
                                    </div>
                                )}

                                {/* Delete Saved Image */}
                                {form.avatar_url &&
                                    !selectedImage && (
                                        <button
                                            type="button"
                                            onClick={
                                                handleDeleteImage
                                            }
                                            disabled={
                                                deletingImage ||
                                                saving
                                            }
                                            className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-900 bg-red-600 text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                            title="Delete profile image"
                                            aria-label="Delete profile image"
                                        >
                                            {deletingImage ? (
                                                <RefreshCw
                                                    size={
                                                        16
                                                    }
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Trash2
                                                    size={
                                                        17
                                                    }
                                                />
                                            )}
                                        </button>
                                    )}

                                {/* Remove New Selection */}
                                {selectedImage && (
                                    <button
                                        type="button"
                                        onClick={
                                            removeSelectedImage
                                        }
                                        disabled={
                                            saving
                                        }
                                        className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-900 bg-slate-700 text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                                        title="Remove selected image"
                                        aria-label="Remove selected image"
                                    >
                                        <X size={17} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Upload */}
                        <div className="mt-6">
                            <label
                                htmlFor="profile-image"
                                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-800/50 px-5 py-8 text-center transition hover:border-blue-500 hover:bg-slate-800 sm:px-6"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                                    <Upload size={22} />
                                </div>

                                <p className="mt-3 font-medium text-white">
                                    Click to choose a
                                    profile image
                                </p>

                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    PNG, JPG, JPEG, WEBP —
                                    Maximum 10MB
                                </p>
                            </label>

                            <input
                                id="profile-image"
                                type="file"
                                accept="image/*"
                                onChange={
                                    handleImageSelect
                                }
                                disabled={
                                    saving ||
                                    deletingImage
                                }
                                className="hidden"
                            />
                        </div>

                        {/* Selected Image Info */}
                        {selectedImage && (
                            <div className="mt-4 rounded-xl border border-blue-900/50 bg-blue-950/20 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <ImageIcon
                                        size={17}
                                        className="shrink-0 text-blue-400"
                                    />

                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-blue-300">
                                            New image
                                            selected
                                        </p>

                                        <p className="mt-1 truncate text-xs text-slate-400">
                                            {
                                                selectedImage.name
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Save */}
                <div className="flex flex-col-reverse gap-3 pb-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={loadProfile}
                        disabled={
                            saving ||
                            deletingImage
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        Cancel Changes
                    </button>

                    <button
                        type="submit"
                        disabled={
                            saving ||
                            deletingImage
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        {saving ? (
                            <>
                                <RefreshCw
                                    size={18}
                                    className="animate-spin"
                                />

                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={18} />

                                Save Profile
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Profile