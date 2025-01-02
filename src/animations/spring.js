/**
 * @typedef {Object} SpringOptions
 * @property {number} [stiffness=100] - Spring stiffness
 * @property {number} [damping=10] - Spring damping
 * @property {number} [mass=1] - Spring mass
 * @property {Object} [from={}] - Initial values
 * @property {Object} [to={}] - Target values
 */

import { animate } from 'motion'

/**
 * Creates a spring-based animation on an element
 * @param {HTMLElement} element - The element to animate
 * @param {SpringOptions} options - Animation options
 * @returns {Promise} Animation promise
 */
export function spring(element, options = {}) {
    if (!element) throw new Error('Element is required for spring animation')

    const {
        stiffness = 100,
        damping = 10,
        mass = 1,
        from = {},
        to = {}
    } = options

    // Convert from/to objects to animation keyframes
    const keyframes = {}

    // Handle transform properties
    if (from.scale || to.scale) {
        keyframes.transform = [
            `scale(${from.scale || 1})`,
            `scale(${to.scale || 1})`
        ]
    }

    if (from.rotate || to.rotate) {
        const currentTransform = keyframes.transform || ['', '']
        keyframes.transform = [
            `${currentTransform[0]} rotate(${from.rotate || 0}deg)`,
            `${currentTransform[1]} rotate(${to.rotate || 0}deg)`
        ]
    }

    // Handle other properties
    ['opacity', 'x', 'y'].forEach(prop => {
        if (from[prop] !== undefined || to[prop] !== undefined) {
            keyframes[prop] = [
                from[prop] ?? (prop === 'opacity' ? 1 : 0),
                to[prop] ?? (prop === 'opacity' ? 1 : 0)
            ]
        }
    })

    return animate(
        element,
        keyframes,
        {
            easing: `spring(${stiffness}, ${damping}, ${mass})`,
            duration: 1 // Duration is controlled by spring physics
        }
    )
}
