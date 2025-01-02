/**
 * @typedef {Object} FadeOptions
 * @property {number} [duration=0.3] - Animation duration in seconds
 * @property {[number, number]} [opacity=[0, 1]] - Start and end opacity values
 * @property {'linear' | 'easeIn' | 'easeOut' | 'easeInOut'} [easing='easeOut'] - Animation easing
 * @property {number} [delay=0] - Delay before animation starts
 */

import { animate } from 'motion'

/**
 * Creates a fade animation on an element
 * @param {HTMLElement} element - The element to animate
 * @param {FadeOptions} options - Animation options
 * @returns {Promise} Animation promise
 */
export function fade(element, options = {}) {
    if (!element) throw new Error('Element is required for fade animation')

    const {
        duration = 0.3,
        opacity = [0, 1],
        easing = 'easeOut',
        delay = 0,
        ...restOptions
    } = options

    // Handle fade direction based on classes
    const fadeOpacity = element.classList.contains('fade-out')
        ? [1, 0]
        : opacity

    return animate(
        element,
        { opacity: fadeOpacity },
        {
            duration,
            easing,
            delay,
            ...restOptions
        }
    )
}
