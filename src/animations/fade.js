import { animate } from "motion";

/**
 * Fade animation for elements
 * @param {HTMLElement} element - DOM element to animate
 * @param {Object} options - Animation options
 * @param {number} [options.duration=1000] - Duration in milliseconds
 * @param {string} [options.direction='in'] - 'in' or 'out'
 * @param {string} [options.easing='ease-in-out'] - CSS easing function
 * @returns {Animation} Motion animation instance
 */
export function fade(element, options = {}) {
    const {
        duration = 1000,
        direction = 'in',
        easing = 'ease-in-out'
    } = options;

    return animate(
        element,
        { opacity: direction === 'in' ? [0, 1] : [1, 0] },
        { duration: duration / 1000, easing }
    );
}

export default fade;
