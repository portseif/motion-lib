/**
 * @typedef {Object} SlideOptions
 * @property {number} [duration=0.3] - Animation duration in seconds
 * @property {'left' | 'right' | 'up' | 'down'} [direction='right'] - Slide direction
 * @property {number} [distance=100] - Slide distance in pixels
 * @property {'linear' | 'easeIn' | 'easeOut' | 'easeInOut'} [easing='easeOut'] - Animation easing
 * @property {number} [delay=0] - Delay before animation starts
 */

import { animate } from 'motion'

/**
 * Creates a slide animation on an element
 * @param {HTMLElement} element - The element to animate
 * @param {SlideOptions} options - Animation options
 * @returns {Promise} Animation promise
 */
export function slide(element, options = {}) {
    if (!element) throw new Error('Element is required for slide animation')

    const {
        duration = 0.3,
        direction = 'right',
        distance = 100,
        easing = 'easeOut',
        delay = 0,
        ...restOptions
    } = options

    const getTransform = () => {
        switch (direction) {
            case 'left': return [`translateX(${distance}px)`, 'translateX(0px)']
            case 'right': return [`translateX(-${distance}px)`, 'translateX(0px)']
            case 'up': return [`translateY(${distance}px)`, 'translateY(0px)']
            case 'down': return [`translateY(-${distance}px)`, 'translateY(0px)']
            default: return [`translateX(-${distance}px)`, 'translateX(0px)']
        }
    }

    return animate(
        element,
        { transform: getTransform() },
        {
            duration,
            easing,
            delay,
            ...restOptions
        }
    )
}
