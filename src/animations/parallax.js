/**
 * @typedef {Object} ParallaxOptions
 * @property {number} [speed=0.5] - Parallax speed factor (0-1)
 * @property {string} [direction='y'] - Parallax direction ('x' or 'y')
 * @property {boolean} [smooth=true] - Whether to smooth the animation
 * @property {number} [smoothAmount=0.1] - Amount of smoothing (0-1)
 */

import { animate } from 'motion'

/**
 * Creates a parallax scrolling effect on an element
 * @param {HTMLElement} element - The element to animate
 * @param {ParallaxOptions} options - Animation options
 */
export function parallax(element, options = {}) {
    if (!element) throw new Error('Element is required for parallax animation')

    const {
        speed = 0.5,
        direction = 'y',
        smooth = true,
        smoothAmount = 0.1
    } = options

    let currentOffset = 0
    let targetOffset = 0
    let animationFrame
    let initialY = 0

    // Store initial position
    const updateInitialPosition = () => {
        const rect = element.getBoundingClientRect()
        initialY = rect.top + window.scrollY
    }

    const calculateOffset = () => {
        const rect = element.getBoundingClientRect()
        const scrolled = window.scrollY
        const windowHeight = window.innerHeight

        // Calculate how far the element is from the top of the viewport
        const elementMiddle = rect.top + (rect.height / 2)
        const distanceFromCenter = elementMiddle - (windowHeight / 2)

        // Calculate parallax offset based on element's position relative to viewport center
        return -(distanceFromCenter * speed)
    }

    const update = () => {
        targetOffset = calculateOffset()

        if (smooth) {
            currentOffset += (targetOffset - currentOffset) * smoothAmount
        } else {
            currentOffset = targetOffset
        }

        // Apply transform with translate3d for better performance
        const transform = direction === 'x'
            ? `translate3d(${currentOffset}px, 0, 0)`
            : `translate3d(0, ${currentOffset}px, 0)`

        element.style.transform = transform
        element.style.willChange = 'transform'

        if (smooth) {
            animationFrame = requestAnimationFrame(update)
        }
    }

    const handleScroll = () => {
        if (!smooth) {
            update()
        }
    }

    const handleResize = () => {
        updateInitialPosition()
        update()
    }

    // Initialize
    updateInitialPosition()

    // Start animation loop if smoothing is enabled
    if (smooth) {
        update()
    }

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })

    // Cleanup function
    return () => {
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleResize)
        if (animationFrame) {
            cancelAnimationFrame(animationFrame)
        }
    }
}
