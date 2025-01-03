/**
 * @module motion-lib
 * A framework-agnostic animation library built on top of Motion
 */

export { fade } from './animations/fade';
export { slide } from './animations/slide';
export { scrollTrigger } from './animations/scrollTrigger';
export { scrollScrub } from './animations/scrollScrub';
export { parallax } from './animations/parallax';
export { spring } from './animations/spring';
export { drag } from './animations/drag';
export { preloader } from './animations/preloader';
export { cursor } from './animations/cursor';
export { textMorph } from './animations/textMorph';

// Animation utility functions
export const version = '1.0.0';

/**
 * Initialize the animation library with global options
 * @param {Object} options - Global animation options
 * @param {boolean} [options.reducedMotion=true] - Whether to respect user's reduced motion preferences
 * @param {Object} [options.defaults={}] - Default animation options for all animations
 */
export function init(options = {}) {
    const {
        reducedMotion = true,
        defaults = {}
    } = options;

    // Future: Set up global configuration
    return {
        reducedMotion,
        defaults
    };
}
