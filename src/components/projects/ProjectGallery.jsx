import { useMemo, useState } from 'react'

import ProjectLightbox from './ProjectLightbox'

function ProjectGallery({
    project,
    mainImage,
    images = [],
}) {
    const [activeImage, setActiveImage] = useState(null)

    /*
     * Create one unified image list for the Lightbox.
     *
     * The cover image comes first, followed by the
     * gallery images.
     *
     * If the cover image already exists inside the gallery,
     * we don't add it twice.
     */
    const lightboxImages = useMemo(() => {
        const galleryImages = images || []

        if (!mainImage) {
            return galleryImages
        }

        const coverAlreadyExists = galleryImages.some(
            (image) => image.image_url === mainImage
        )

        if (coverAlreadyExists) {
            return galleryImages
        }

        return [
            {
                id: 'cover-image',
                image_url: mainImage,
                display_order: -1,
            },
            ...galleryImages,
        ]
    }, [mainImage, images])

    function openMainImage() {
        if (!mainImage) return

        const coverImage = lightboxImages.find(
            (image) => image.image_url === mainImage
        )

        if (coverImage) {
            setActiveImage(coverImage)
        }
    }

    function handleImageError(event, imageUrl) {
        console.error(
            'Project image failed to load:',
            imageUrl
        )

        const image = event.currentTarget

        image.style.display = 'none'

        const parent = image.parentElement

        if (parent) {
            parent.classList.add(
                'flex',
                'items-center',
                'justify-center',
                'bg-slate-900'
            )

            const fallback = document.createElement('span')
            fallback.className =
                'px-4 text-center text-sm text-slate-600'
            fallback.textContent = 'Image unavailable'

            parent.appendChild(fallback)
        }
    }

    return (
        <>
            {/* Main Image */}
            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 sm:mt-12">
                {mainImage ? (
                    <button
                        type="button"
                        onClick={openMainImage}
                        className="group block w-full cursor-zoom-in"
                        aria-label={`Open ${project.title} main image`}
                    >
                        <div className="relative aspect-video w-full overflow-hidden bg-slate-900 sm:aspect-16/8">
                            <img
                                src={mainImage}
                                alt={`${project.title} main preview`}
                                loading="eager"
                                className="h-full w-full object-cover transition duration-500 sm:group-hover:scale-[1.02]"
                                onError={(event) =>
                                    handleImageError(
                                        event,
                                        mainImage
                                    )
                                }
                            />

                            {/* Zoom Hint */}
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden bg-linear-to-t from-black/70 to-transparent px-5 pb-5 pt-10 text-left sm:block">
                                <span className="text-xs font-medium text-white/80">
                                    Click to view full image
                                </span>
                            </div>
                        </div>
                    </button>
                ) : (
                    <div className="flex aspect-video items-center justify-center bg-slate-900 sm:aspect-16/8">
                        <span className="text-6xl font-bold text-slate-800 sm:text-8xl">
                            {project.title?.charAt(0)}
                        </span>
                    </div>
                )}
            </div>

            {/* Gallery */}
            {images.length > 0 && (
                <div className="mt-10 sm:mt-12">

                    {/* Gallery Header */}
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">
                                Screenshots
                            </p>

                            <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                                Project Gallery
                            </h2>
                        </div>

                        <span className="text-sm text-slate-500">
                            {images.length}{' '}
                            {images.length === 1
                                ? 'image'
                                : 'images'}
                        </span>
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                        {images.map((image, index) => (
                            <button
                                key={image.id}
                                type="button"
                                onClick={() =>
                                    setActiveImage(image)
                                }
                                className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 text-left transition sm:hover:border-slate-700"
                                aria-label={`Open ${project.title} screenshot ${index + 1}`}
                            >
                                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                                    <img
                                        src={image.image_url}
                                        alt={`${project.title} screenshot ${index + 1}`}
                                        loading="lazy"
                                        className="h-full w-full object-cover transition duration-500 sm:group-hover:scale-105"
                                        onError={(event) =>
                                            handleImageError(
                                                event,
                                                image.image_url
                                            )
                                        }
                                    />

                                    {/* Image Number */}
                                    <div className="pointer-events-none absolute right-3 top-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                        {index + 1}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Lightbox */}
            {activeImage && (
                <ProjectLightbox
                    project={project}
                    images={lightboxImages}
                    activeImage={activeImage}
                    setActiveImage={setActiveImage}
                />
            )}
        </>
    )
}

export default ProjectGallery