/**
 * @typedef {Object} DragOptions
 * @property {boolean} [lockX=false] - Lock horizontal movement
 * @property {boolean} [lockY=false] - Lock vertical movement
 * @property {number} [bounds=Infinity] - Maximum distance from origin
 * @property {boolean} [elastic=true] - Enable elastic bounds
 * @property {number} [elasticity=0.5] - Elasticity factor when dragging beyond bounds
 */

import { animate } from 'motion'

/**
 * Makes an element draggable with optional constraints
 * @param {HTMLElement} element - The element to make draggable
 * @param {DragOptions} options - Drag options
 */
export function drag(element, options = {}) {
    if (!element) throw new Error('Element is required for drag animation')

    const {
        lockX = false,
        lockY = false,
        bounds = Infinity,
        elastic = true,
        elasticity = 0.5
    } = options

    let isDragging = false
    let startX = 0
    let startY = 0
    let currentTransformX = 0
    let currentTransformY = 0
    let lastValidX = 0
    let lastValidY = 0
    let velocity = { x: 0, y: 0 }
    let lastTime = 0
    let lastX = 0
    let lastY = 0

    // Get current transform values
    const getTransformValues = () => {
        const style = window.getComputedStyle(element)
        const transform = style.transform
        if (transform === 'none') return { x: 0, y: 0 }

        const matrix = new DOMMatrix(transform)
        return {
            x: matrix.m41,
            y: matrix.m42
        }
    }

    const constrainValue = (value, min, max, isElastic = true) => {
        if (!isElastic) {
            return Math.max(min, Math.min(max, value))
        }

        if (value < min) {
            const overflow = min - value
            return min - (overflow * elasticity)
        }
        if (value > max) {
            const overflow = value - max
            return max + (overflow * elasticity)
        }
        return value
    }

    const handlePointerDown = (e) => {
        isDragging = true
        element.style.cursor = 'grabbing'

        // Get current transform values
        const transform = getTransformValues()
        currentTransformX = transform.x
        currentTransformY = transform.y
        lastValidX = currentTransformX
        lastValidY = currentTransformY

        // Store initial pointer position
        startX = e.clientX - currentTransformX
        startY = e.clientY - currentTransformY

        // Reset velocity tracking
        lastTime = performance.now()
        lastX = e.clientX
        lastY = e.clientY
        velocity = { x: 0, y: 0 }

        // Add event listeners for drag and release
        window.addEventListener('pointermove', handlePointerMove, { passive: true })
        window.addEventListener('pointerup', handlePointerUp)
        window.addEventListener('pointercancel', handlePointerUp)
    }

    const handlePointerMove = (e) => {
        if (!isDragging) return

        // Calculate velocity
        const now = performance.now()
        const dt = now - lastTime
        if (dt > 0) {
            velocity = {
                x: (e.clientX - lastX) / dt,
                y: (e.clientY - lastY) / dt
            }
        }
        lastTime = now
        lastX = e.clientX
        lastY = e.clientY

        // Calculate new position
        const newX = lockX ? currentTransformX : e.clientX - startX
        const newY = lockY ? currentTransformY : e.clientY - startY

        // Store last valid position before constraints
        if (Math.abs(newX) <= bounds) lastValidX = newX
        if (Math.abs(newY) <= bounds) lastValidY = newY

        // Apply constraints with elastic behavior
        const constrainedX = constrainValue(newX, -bounds, bounds, elastic)
        const constrainedY = constrainValue(newY, -bounds, bounds, elastic)

        // Apply transform with translate3d for better performance
        element.style.transform = `translate3d(${constrainedX}px, ${constrainedY}px, 0)`
    }

    const handlePointerUp = () => {
        if (!isDragging) return
        isDragging = false
        element.style.cursor = 'grab'

        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
        window.removeEventListener('pointercancel', handlePointerUp)

        // Get final position
        const finalTransform = getTransformValues()

        // If beyond bounds, animate back with spring physics
        if (Math.abs(finalTransform.x) > bounds || Math.abs(finalTransform.y) > bounds) {
            const targetX = constrainValue(finalTransform.x, -bounds, bounds, false)
            const targetY = constrainValue(finalTransform.y, -bounds, bounds, false)

            // Calculate spring parameters based on velocity and distance
            const distance = Math.hypot(targetX - finalTransform.x, targetY - finalTransform.y)
            const springStiffness = Math.max(50, 200 - distance * 0.5)
            const springDamping = Math.max(10, 20 - Math.hypot(velocity.x, velocity.y) * 2)

            animate(
                element,
                { transform: `translate3d(${targetX}px, ${targetY}px, 0)` },
                {
                    duration: 0.8,
                    easing: `spring(${springStiffness}, ${springDamping}, 0)`
                }
            )
        }
    }

    // Set initial styles
    element.style.touchAction = 'none'
    element.style.userSelect = 'none'
    element.style.cursor = 'grab'
    element.style.willChange = 'transform'

    // Add initial event listener
    element.addEventListener('pointerdown', handlePointerDown)

    // Return cleanup function
    return () => {
        element.removeEventListener('pointerdown', handlePointerDown)
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
        window.removeEventListener('pointercancel', handlePointerUp)
    }
}
