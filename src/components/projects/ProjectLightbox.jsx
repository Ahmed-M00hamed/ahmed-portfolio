import { useEffect, useCallback } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react'

function ProjectLightbox({
    project,
    images,
    activeImage,
    setActiveImage,
}) {
    const hasMultipleImages = images.length > 1

    const currentIndex = images.findIndex(
        (image) => image.id === activeImage?.id
    )

    const showPreviousImage = useCallback(() => {
        if (!hasMultipleImages || !activeImage) {
            return
        }

        const index =
            currentIndex === -1
                ? 0
                : currentIndex

        const previousIndex =
            index === 0
                ? images.length - 1
                : index - 1

        setActiveImage(images[previousIndex])
    }, [
        activeImage,
        currentIndex,
        hasMultipleImages,
        images,
        setActiveImage,
    ])

    const showNextImage = useCallback(() => {
        if (!hasMultipleImages || !activeImage) {
            return
        }

        const index =
            currentIndex === -1
                ? 0
                : currentIndex

        const nextIndex =
            index === images.length - 1
                ? 0
                : index + 1

        setActiveImage(images[nextIndex])
    }, [
        activeImage,
        currentIndex,
        hasMultipleImages,
        images,
        setActiveImage,
    ])

    const closeLightbox = useCallback(() => {
        setActiveImage(null)
    }, [setActiveImage])

    /* Keyboard Controls */
    useEffect(() => {
        if (!activeImage) {
            return
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                event.preventDefault()
                closeLightbox()
                return
            }

            if (
                event.key === 'ArrowLeft' &&
                hasMultipleImages
            ) {
                event.preventDefault()
                showPreviousImage()
                return
            }

            if (
                event.key === 'ArrowRight' &&
                hasMultipleImages
            ) {
                event.preventDefault()
                showNextImage()
            }
        }

        window.addEventListener(
            'keydown',
            handleKeyDown
        )

        return () => {
            window.removeEventListener(
                'keydown',
                handleKeyDown
            )
        }
    }, [
        activeImage,
        closeLightbox,
        hasMultipleImages,
        showNextImage,
        showPreviousImage,
    ])

    /* Prevent Background Scrolling */
    useEffect(() => {
        if (!activeImage) {
            return
        }

        const originalOverflow =
            document.body.style.overflow

        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow =
                originalOverflow
        }
    }, [activeImage])

    if (!activeImage) {
        return null
    }

    return (
        <div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 p-3 backdrop-blur-sm sm:p-5"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`${project.title} image viewer`}
        >

            {/* Top Bar */}
            <div
                className="absolute left-3 right-3 top-3 z-30 flex items-center justify-between sm:left-5 sm:right-5 sm:top-5"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                {/* Project Name */}
                <div className="max-w-[65%] truncate rounded-full bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-sm">
                    {project.title}
                </div>

                {/* Close */}
                <button
                    type="button"
                    onClick={closeLightbox}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900/90 text-white transition hover:bg-slate-800 sm:h-11 sm:w-11"
                    aria-label="Close image viewer"
                >
                    <X size={21} />
                </button>
            </div>

            {/* Previous */}
            {hasMultipleImages && (
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation()
                        showPreviousImage()
                    }}
                    className="absolute left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/90 text-white shadow-lg transition hover:bg-slate-800 sm:left-5 sm:h-12 sm:w-12"
                    aria-label="Previous image"
                >
                    <ChevronLeft
                        size={22}
                        className="sm:h-6 sm:w-6"
                    />
                </button>
            )}

            {/* Next */}
            {hasMultipleImages && (
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation()
                        showNextImage()
                    }}
                    className="absolute right-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/90 text-white shadow-lg transition hover:bg-slate-800 sm:right-5 sm:h-12 sm:w-12"
                    aria-label="Next image"
                >
                    <ChevronRight
                        size={22}
                        className="sm:h-6 sm:w-6"
                    />
                </button>
            )}

            {/* Active Image */}
            <div
                className="flex h-[calc(100vh-110px)] w-full items-center justify-center sm:h-[calc(100vh-120px)]"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                <img
                    src={activeImage.image_url}
                    alt={`${project.title} preview`}
                    className="max-h-full max-w-full rounded-lg object-contain shadow-2xl sm:rounded-xl"
                />
            </div>

            {/* Image Counter */}
            {hasMultipleImages && (
                <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-2 text-xs font-medium text-slate-300 shadow-lg backdrop-blur-sm sm:bottom-5">
                    {currentIndex === -1
                        ? 1
                        : currentIndex + 1}{' '}
                    / {images.length}
                </div>
            )}
        </div>
    )
}

export default ProjectLightbox