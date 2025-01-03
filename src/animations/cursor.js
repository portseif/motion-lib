/**
 * @typedef {Object} CursorOptions
 * @property {number} [size=20] - Size of the cursor in pixels
 * @property {string} [color='#3b82f6'] - Color of the cursor
 * @property {number} [smoothness=0.15] - Cursor movement smoothness (0-1)
 * @property {string} [shape='circle'] - Cursor shape: 'circle', 'square', 'ring'
 * @property {number} [scale=1] - Base scale of the cursor
 * @property {number} [hoverScale=1.5] - Scale when hovering over interactive elements
 * @property {number} [clickScale=0.9] - Scale when clicking
 * @property {number} [hoverTextSize=14] - Font size of hover text in pixels
 * @property {string[]} [hoverSelectors=['button', 'a', '[data-cursor-hover]', '[data-hover-text]']] - Elements that trigger hover effect
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
        hoverScale = 2.5,
        clickScale = 0.9,
        hoverTextSize = 4,
        hoverSelectors = ['button', 'a', '[data-cursor-hover]', '[data-hover-text]']
    } = options

    // Hide default cursor if custom cursor is enabled
    const isCustomCursorEnabled = Boolean(shape)
    if (isCustomCursorEnabled) {
        // Hide cursor on all elements
        const style = document.createElement('style')
        style.textContent = `
            * {
                cursor: none !important;
            }
        `
        document.head.appendChild(style)
    }

    // Create cursor elements
    const cursorOuter = document.createElement('div')
    const cursorInner = document.createElement('div')
    const hoverText = document.createElement('div')

    // Style outer cursor
    cursorOuter.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
        transition: opacity 0.15s ease-out;
        will-change: transform;
        width: ${size}px;
        height: ${size}px;
        top: 0;
        left: 0;
        opacity: ${isCustomCursorEnabled ? '1' : '0'};
        display: ${isCustomCursorEnabled ? 'block' : 'none'};
    `

    // Style inner cursor
    cursorInner.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        transform: scale(${scale});
        will-change: transform;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease-out;
        border-radius: ${shape === 'circle' || shape === 'ring' ? '50%' : '0'};
        background: ${shape === 'ring' ? 'transparent' : color};
        ${shape === 'ring' ? `border: 2px solid ${color};` : ''}
        opacity: 1;
        pointer-events: none;
    `

    // Style hover text
    hoverText.style.cssText = `
        position: absolute;
        color: white;
        font-size: ${hoverTextSize}px;
        // white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        // transform: scale(0.8);
        text-align: center;
        max-width: ${size * 2}px;
        // line-height: 1.2;
        // font-family: system-ui, -apple-system, sans-serif;
        // mix-blend-mode: difference;
    `

    // Add to DOM
    cursorOuter.appendChild(cursorInner)
    cursorInner.appendChild(hoverText)
    document.body.appendChild(cursorOuter)

    // Animation configurations
    const spring = {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.5
    }

    const easing = [0.23, 1, 0.32, 1]

    // State
    let currentX = -100
    let currentY = -100
    let targetX = -100
    let targetY = -100
    let isVisible = false
    let isHovering = false
    let animationFrame
    let lastHoverElement = null
    let currentHoverText = ''

    const update = () => {
        currentX += (targetX - currentX) * smoothness
        currentY += (targetY - currentY) * smoothness
        cursorOuter.style.transform = `translate3d(${currentX - size/2}px, ${currentY - size/2}px, 0)`
        animationFrame = requestAnimationFrame(update)
    }

    const handleMouseMove = (e) => {
        targetX = e.clientX
        targetY = e.clientY
        if (!isVisible) show()
    }

    const handleMouseLeave = () => {
        hide()
    }

    const handleHoverStart = (element) => {
        if (lastHoverElement === element) return
        lastHoverElement = element
        isHovering = true

        const hoverText = element.getAttribute('data-hover-text')
        if (hoverText) {
            showHoverText(hoverText)
        } else {
            hideHoverText()
            animate(cursorInner, {
                scale: hoverScale,
                backgroundColor: shape === 'ring' ? 'transparent' : color,
                borderColor: color
            }, {
                duration: 0.2,
                easing
            })
        }
    }

    const handleHoverEnd = () => {
        if (!isHovering) return
        isHovering = false
        lastHoverElement = null

        // Always hide text and contract cursor when leaving any element
        if (currentHoverText) {
            hideHoverText()
        }
        animate(cursorInner, {
            scale: scale,
            backgroundColor: shape === 'ring' ? 'transparent' : color,
            borderColor: color
        }, {
            duration: 0.2,
            easing
        })
    }

    const handleMouseDown = () => {
        if (!currentHoverText) {
            animate(cursorInner, {
                scale: isHovering ? hoverScale * clickScale : scale * clickScale,
                backgroundColor: shape === 'ring' ? 'transparent' : color,
                borderColor: color
            }, {
                duration: 0.1,
                easing: 'ease-out'
            })
        }
    }

    const handleMouseUp = () => {
        if (!currentHoverText) {
            animate(cursorInner, {
                scale: isHovering ? hoverScale : scale,
                backgroundColor: shape === 'ring' ? 'transparent' : color,
                borderColor: color
            }, {
                duration: 0.1,
                easing: 'ease-out'
            })
        }
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
        if (isVisible || !isCustomCursorEnabled) return
        isVisible = true
        cursorOuter.style.opacity = '1'
    }

    const hide = () => {
        if (!isVisible || !isCustomCursorEnabled) return
        isVisible = false
        cursorOuter.style.opacity = '0'
        hideHoverText()
    }

    const showHoverText = (text) => {
        if (currentHoverText === text) return
        currentHoverText = text

        // First animate cursor expansion
        animate(cursorInner, {
            scale: [scale, 4],
            backgroundColor: shape === 'ring' ? 'transparent' : color,
            borderColor: color
        }, {
            duration: 0.4,
            easing
        })

        // Then bring in the text
        hoverText.textContent = text
        animate(hoverText, {
            opacity: [0, 1],
            scale: [0.7, 1],
            y: [10, 0]
        }, {
            duration: 0.3,
            delay: 0.1,
            easing
        })
    }

    const hideHoverText = () => {
        if (!currentHoverText) return
        currentHoverText = ''

        // First animate out the text
        animate(hoverText, {
            opacity: [1, 0],
            scale: [1, 0.7],
            y: [0, -10]
        }, {
            duration: 0.2,
            easing
        })

        // Simultaneously shrink the cursor back to regular size
        animate(cursorInner, {
            scale: scale,
            backgroundColor: shape === 'ring' ? 'transparent' : color,
            borderColor: color
        }, {
            duration: 0.3,
            easing
        })
    }

    const cleanup = () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseleave', handleMouseLeave)
        document.removeEventListener('mouseover', handleMouseOver)
        document.removeEventListener('mousedown', handleMouseDown)
        document.removeEventListener('mouseup', handleMouseUp)
        if (animationFrame) {
            cancelAnimationFrame(animationFrame)
        }

        // Remove cursor hiding style and restore original cursor
        if (isCustomCursorEnabled) {
            // Remove all cursor hiding styles we might have added
            const styles = document.querySelectorAll('style')
            styles.forEach(style => {
                if (style.textContent.includes('cursor: none')) {
                    style.remove()
                }
            })

            // Reset cursor styles on all elements
            document.body.style.cursor = 'default'
            const elements = document.querySelectorAll('*')
            elements.forEach(el => {
                if (el.style.cursor === 'none') {
                    el.style.cursor = ''
                }
            })
        }

        // Remove our cursor element
        cursorOuter.remove()
    }

    // Only set up event listeners if custom cursor is enabled
    if (isCustomCursorEnabled) {
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
    }

    return {
        show,
        hide,
        cleanup
    }
}
