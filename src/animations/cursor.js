/**
 * @typedef {Object} CursorOptions
 * @property {number} [size=20] - Size of the cursor in pixels
 * @property {string} [color='#3b82f6'] - Color of the cursor
 * @property {number} [smoothness=0.15] - Cursor movement smoothness (0-1)
 * @property {string} [shape='circle'] - Cursor shape: 'circle', 'square', 'ring'
 * @property {number} [scale=1] - Base scale of the cursor
 * @property {number} [hoverScale=1.5] - Scale when hovering over interactive elements
 * @property {number} [clickScale=0.9] - Scale when clicking
 * @property {string[]} [hoverSelectors=['button', 'a', '[data-cursor-hover]']] - Elements that trigger hover effect
 */

import { animate } from 'motion'

/**
 * Creates a custom cursor with smooth following and hover effects
 * @param {CursorOptions} options - Cursor options
 * @returns {Object} Control object with show, hide, and cleanup methods
 */
export function cursor(options = {}) {
    const {
        size = 20,
        color = '#3b82f6',
        smoothness = 0.15,
        shape = 'circle',
        scale = 1,
        hoverScale = 1.5,
        clickScale = 0.9,
        hoverSelectors = ['button', 'a', '[data-cursor-hover]']
    } = options

    // Create cursor elements
    const cursorOuter = document.createElement('div')
    const cursorInner = document.createElement('div')

    // Style outer cursor
    cursorOuter.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        transition: opacity 0.15s ease-out;
        will-change: transform;
        opacity: 0;
        width: ${size}px;
        height: ${size}px;
        top: 0;
        left: 0;
    `

    // Style inner cursor
    cursorInner.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        transform: scale(${scale});
        will-change: transform;
    `

    // Apply shape styles
    switch (shape) {
        case 'circle':
            cursorInner.style.borderRadius = '50%'
            cursorInner.style.background = color
            break
        case 'ring':
            cursorInner.style.borderRadius = '50%'
            cursorInner.style.border = `2px solid ${color}`
            cursorInner.style.background = 'transparent'
            break
        case 'square':
            cursorInner.style.background = color
            break
    }

    // Add to DOM
    cursorOuter.appendChild(cursorInner)
    document.body.appendChild(cursorOuter)

    // Hide default cursor
    const elements = document.querySelectorAll('*')
    elements.forEach(el => {
        if (window.getComputedStyle(el).cursor !== 'none') {
            el.style.cursor = 'none'
        }
    })

    // State
    let currentX = -100
    let currentY = -100
    let targetX = -100
    let targetY = -100
    let isVisible = false
    let isHovering = false
    let animationFrame
    let lastHoverElement = null

    const update = () => {
        // Smooth follow
        currentX += (targetX - currentX) * smoothness
        currentY += (targetY - currentY) * smoothness

        // Apply position
        cursorOuter.style.transform = `translate3d(${currentX - size/2}px, ${currentY - size/2}px, 0)`

        // Continue animation loop
        animationFrame = requestAnimationFrame(update)
    }

    const handleMouseMove = (e) => {
        // Update target position (now centered)
        targetX = e.clientX
        targetY = e.clientY

        // Show cursor if it was hidden
        if (!isVisible) {
            show()
        }
    }

    const handleMouseLeave = () => {
        hide()
    }

    const handleHoverStart = (element) => {
        if (lastHoverElement === element) return
        lastHoverElement = element

        isHovering = true
        animate(
            cursorInner,
            { scale: hoverScale },
            { duration: 0.2, easing: [0.16, 1, 0.3, 1] }
        )
    }

    const handleHoverEnd = () => {
        if (!isHovering) return
        isHovering = false
        lastHoverElement = null

        animate(
            cursorInner,
            { scale: scale },
            { duration: 0.2, easing: [0.16, 1, 0.3, 1] }
        )
    }

    const handleMouseDown = () => {
        animate(
            cursorInner,
            { scale: isHovering ? hoverScale * clickScale : scale * clickScale },
            { duration: 0.1, easing: 'ease-out' }
        )
    }

    const handleMouseUp = () => {
        animate(
            cursorInner,
            { scale: isHovering ? hoverScale : scale },
            { duration: 0.1, easing: 'ease-out' }
        )
    }

    const handleMouseOver = (e) => {
        const target = e.target
        if (hoverSelectors.some(selector => target.matches(selector))) {
            handleHoverStart(target)
        } else {
            handleHoverEnd()
        }
    }

    // Show/hide methods
    const show = () => {
        if (isVisible) return
        isVisible = true
        cursorOuter.style.opacity = '1'
    }

    const hide = () => {
        if (!isVisible) return
        isVisible = false
        cursorOuter.style.opacity = '0'
    }

    // Start animation loop
    update()

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)

    // Initial position at mouse location (if available)
    if (typeof MouseEvent !== 'undefined') {
        const mousePosition = window.mousePosition || { x: 0, y: 0 }
        targetX = mousePosition.x
        targetY = mousePosition.y
    }

    // Return control object
    return {
        show,
        hide,
        cleanup: () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseleave', handleMouseLeave)
            document.removeEventListener('mouseover', handleMouseOver)
            document.removeEventListener('mousedown', handleMouseDown)
            document.removeEventListener('mouseup', handleMouseUp)
            elements.forEach(el => {
                el.style.cursor = ''
            })
            if (animationFrame) {
                cancelAnimationFrame(animationFrame)
            }
            cursorOuter.remove()
        }
    }
}
