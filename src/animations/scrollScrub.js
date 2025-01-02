/**
 * @typedef {Object} ScrollScrubOptions
 * @property {number} [start=0] - Start position of the animation (0-1, relative to viewport)
 * @property {number} [end=1] - End position of the animation (0-1, relative to viewport)
 * @property {Object} [properties] - Animation properties with start and end values
 * @property {boolean} [smooth=true] - Whether to smooth the animation
 * @property {number} [smoothAmount=0.1] - Amount of smoothing (0-1)
 */

import { animate } from 'motion'

/**
 * Creates a scroll-scrubbed animation that follows scroll position
 * @param {HTMLElement} element - The element to animate
 * @param {ScrollScrubOptions} options - Animation options
 */
export function scrollScrub(element, options = {}) {
  if (!element) throw new Error('Element is required for scroll scrub animation')

  const {
    start = 0,
    end = 1,
    properties = {
      opacity: [0, 1],
      transform: ['translateY(100px)', 'translateY(0px)'],
    },
    smooth = true,
    smoothAmount = 0.1,
  } = options

  // Calculate element's position relative to viewport
  const calculateProgress = () => {
    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const elementCenter = rect.top + rect.height / 2
    const scrollProgress = 1 - elementCenter / viewportHeight

    // Normalize progress between start and end points
    return Math.max(0, Math.min(1, (scrollProgress - start) / (end - start)))
  }

  let currentProgress = 0
  let targetProgress = 0
  let animationFrame

  // Update animation based on scroll position
  const update = () => {
    targetProgress = calculateProgress()

    if (smooth) {
      // Smooth the animation
      currentProgress += (targetProgress - currentProgress) * smoothAmount
    } else {
      currentProgress = targetProgress
    }

    // Apply animation properties
    Object.entries(properties).forEach(([property, [startValue, endValue]]) => {
      if (property === 'transform') {
        element.style.transform = interpolateTransform(startValue, endValue, currentProgress)
      } else {
        element.style[property] = interpolateValue(startValue, endValue, currentProgress)
      }
    })

    if (smooth) {
      // Continue animation loop if smoothing is enabled
      animationFrame = requestAnimationFrame(update)
    }
  }

  // Handle scroll events
  const handleScroll = () => {
    if (!smooth) {
      // If not smoothing, update immediately on scroll
      update()
    }
  }

  // Start the animation loop if smoothing is enabled
  if (smooth) {
    update()
  }

  // Add scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true })

  // Cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll)
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
  }
}

// Helper function to interpolate between values
function interpolateValue(start, end, progress) {
  // Handle numeric values
  if (!isNaN(start) && !isNaN(end)) {
    return start + (end - start) * progress
  }
  // Handle pixel values
  if (typeof start === 'string' && start.includes('px')) {
    const startNum = parseFloat(start)
    const endNum = parseFloat(end)
    return `${startNum + (endNum - startNum) * progress}px`
  }
  // Handle percentage values
  if (typeof start === 'string' && start.includes('%')) {
    const startNum = parseFloat(start)
    const endNum = parseFloat(end)
    return `${startNum + (endNum - startNum) * progress}%`
  }
  return progress > 0.5 ? end : start
}

// Helper function to interpolate transform values
function interpolateTransform(start, end, progress) {
  // Extract transform values (currently supports translate and scale)
  const extractTransform = (transform) => {
    const translate = transform.match(/translate[XY]?\(([-\d.]+)px\)/)
    const scale = transform.match(/scale\(([-\d.]+)\)/)
    return {
      translate: translate ? parseFloat(translate[1]) : null,
      scale: scale ? parseFloat(scale[1]) : null,
    }
  }

  const startTransform = extractTransform(start)
  const endTransform = extractTransform(end)
  const result = []

  if (startTransform.translate !== null && endTransform.translate !== null) {
    const currentTranslate = startTransform.translate + (endTransform.translate - startTransform.translate) * progress
    result.push(`translateY(${currentTranslate}px)`)
  }

  if (startTransform.scale !== null && endTransform.scale !== null) {
    const currentScale = startTransform.scale + (endTransform.scale - startTransform.scale) * progress
    result.push(`scale(${currentScale})`)
  }

  return result.join(' ')
}
