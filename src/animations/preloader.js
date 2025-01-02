/**
 * @typedef {Object} PreloaderOptions
 * @property {'counter' | 'spinner' | 'both'} [type='spinner'] - Type of preloader
 * @property {number} [duration=2] - Animation duration in seconds
 * @property {string} [easing='circOut'] - Animation easing
 * @property {number} [start=0] - Start value for counter
 * @property {number} [end=100] - End value for counter
 * @property {string} [spinnerColor='#3b82f6'] - Color of the spinner
 * @property {number} [spinnerSize=40] - Size of the spinner in pixels
 */

import { animate } from 'motion'

/**
 * Creates a preloader animation
 * @param {HTMLElement} element - The element to animate
 * @param {PreloaderOptions} options - Animation options
 * @returns {Object} Control object with start and stop methods
 */
export function preloader(element, options = {}) {
    if (!element) throw new Error('Element is required for preloader animation')

    const {
        type = 'spinner',
        duration = 2,
        easing = 'circOut',
        start = 0,
        end = 100,
        spinnerColor = '#3b82f6',
        spinnerSize = 40
    } = options

    let counterElement
    let spinnerElement
    let spinnerAnimation

    // Create and style elements based on type
    if (type === 'counter' || type === 'both') {
        counterElement = document.createElement('div')
        counterElement.style.fontSize = '2rem'
        counterElement.style.fontWeight = 'bold'
        counterElement.style.textAlign = 'center'
        counterElement.innerHTML = start
        element.appendChild(counterElement)
    }

    if (type === 'spinner' || type === 'both') {
        spinnerElement = document.createElement('div')
        spinnerElement.style.width = `${spinnerSize}px`
        spinnerElement.style.height = `${spinnerSize}px`
        spinnerElement.style.border = `4px solid ${spinnerColor}40`
        spinnerElement.style.borderTop = `4px solid ${spinnerColor}`
        spinnerElement.style.borderRadius = '50%'
        spinnerElement.style.margin = '1rem auto'
        element.appendChild(spinnerElement)
    }

    const startAnimation = () => {
        // Counter animation
        if (counterElement) {
            animate(start, end, {
                duration,
                easing,
                onUpdate: (latest) => {
                    counterElement.innerHTML = Math.round(latest)
                }
            })
        }

        // Spinner animation
        if (spinnerElement) {
            spinnerAnimation = animate(
                spinnerElement,
                { transform: ['rotate(0deg)', 'rotate(360deg)'] },
                {
                    duration: 1,
                    repeat: Infinity,
                    easing: 'linear'
                }
            )
        }
    }

    const stopAnimation = () => {
        if (spinnerAnimation) {
            spinnerAnimation.stop()
        }

        // Optional: fade out the entire preloader
        return animate(
            element,
            { opacity: [1, 0] },
            { duration: 0.5, easing: 'easeOut' }
        ).then(() => {
            element.style.display = 'none'
        })
    }

    // Style container element
    element.style.display = 'flex'
    element.style.flexDirection = 'column'
    element.style.alignItems = 'center'
    element.style.justifyContent = 'center'
    element.style.minHeight = '200px'

    return {
        start: startAnimation,
        stop: stopAnimation
    }
}
