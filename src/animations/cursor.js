import { animate } from 'motion'

// Animation configurations
const ANIMATION_CONFIG = {
    spring: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        mass: 0.8,
        restSpeed: 0.2
    },
    easing: [0.23, 1, 0.32, 1],
    durations: {
        expand: 0.5,
        contract: 0.4,
        hover: 0.3,
        click: 0.15
    }
}

// Default styles
const getDefaultStyles = (size, color, shape, blend = false) => ({
    outer: `
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        ${blend ? 'mix-blend-mode: difference;' : ''}
        transition: opacity 0.15s ease-out;
        will-change: transform;
        width: ${size}px;
        height: ${size}px;
        top: 0;
        left: 0;
    `,
    inner: `
        position: absolute;
        width: 100%;
        height: 100%;
        transform: scale(1);
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
    `,
    text: `
        position: absolute;
        color: white;
        opacity: 0;
        pointer-events: none;
        text-align: center;
        width: auto;
        height: auto;
        white-space: nowrap;
        z-index: 10001;
        mix-blend-mode: ${blend ? 'difference' : 'normal'};
    `
})

export function cursor(options = {}) {
    const {
        size = 20,
        color = '#3b82f6',
        smoothness = 0.15,
        shape = 'circle',
        scale = 1,
        hoverScale = 1.5,
        clickScale = 0.9,
        hoverTextSize = 1,
        blend = false,
        morph = false,
        hoverSelectors = ['button', 'a', '[data-cursor-hover]', '[data-hover-text]', '[data-text-hover]']
    } = options

    // Get base font size from document
    const getBaseFontSize = () => {
        return parseFloat(getComputedStyle(document.documentElement).fontSize)
    }

    // State management
    const state = {
        currentX: -100,
        currentY: -100,
        targetX: -100,
        targetY: -100,
        isVisible: false,
        isHovering: false,
        animationFrame: null,
        lastHoverElement: null,
        currentHoverText: '',
        isCustomCursorEnabled: Boolean(shape)
    }

    // Create and style elements
    const elements = createElements(size, color, shape, hoverTextSize, state.isCustomCursorEnabled, blend)

    // Setup cursor hiding
    if (state.isCustomCursorEnabled) {
        setupCursorHiding()
    }

    // Animation handlers
    const animations = {
        expand: (text) => {
            // Set text content and make it visible immediately
            elements.text.textContent = text
            elements.text.style.opacity = '1'
            elements.text.style.transform = 'translate(-50%, -50%)'

            if (morph) {
                // Get text dimensions
                const textRect = elements.text.getBoundingClientRect()
                const padding = 20
                const targetWidth = textRect.width + padding
                const targetHeight = textRect.height + padding

                // Animate cursor to text size
                animate(elements.inner, {
                    width: [size, targetWidth],
                    height: [size, targetHeight],
                    scale: [scale, 1],
                    backgroundColor: shape === 'ring' ? 'transparent' : color,
                    borderColor: color,
                    borderRadius: ['50%', '8px']
                }, {
                    duration: ANIMATION_CONFIG.durations.expand,
                    easing: ANIMATION_CONFIG.easing
                })
            } else {
                // Get text dimensions for scaling
                const textRect = elements.text.getBoundingClientRect()
                const padding = 20
                const targetScale = Math.max(
                    (textRect.width + padding) / size,
                    (textRect.height + padding) / size
                ) * scale

                // Scale inner cursor while keeping text at original size
                elements.text.style.transform = 'translate(-50%, -50%) scale(' + (1/targetScale) + ')'

                // Animate cursor scale
                animate(elements.inner, {
                    scale: [scale, targetScale]
                }, {
                    duration: ANIMATION_CONFIG.durations.expand,
                    easing: ANIMATION_CONFIG.easing
                })
            }
        },
        contract: (withText = false) => {
            // Hide text immediately
            elements.text.style.opacity = '0'
            elements.text.textContent = ''
            elements.text.style.transform = 'translate(-50%, -50%)'

            if (withText && morph) {
                animate(elements.inner, {
                    width: [elements.inner.offsetWidth, size],
                    height: [elements.inner.offsetHeight, size],
                    scale: 1,
                    backgroundColor: shape === 'ring' ? 'transparent' : color,
                    borderColor: color,
                    borderRadius: ['8px', '50%']
                }, {
                    duration: ANIMATION_CONFIG.durations.contract,
                    easing: ANIMATION_CONFIG.easing
                })
            } else {
                animate(elements.inner, {
                    scale: scale
                }, {
                    duration: ANIMATION_CONFIG.durations.contract,
                    easing: ANIMATION_CONFIG.easing
                })
            }
        },
        hover: () => {
            animate(elements.inner, {
                scale: hoverScale,
                backgroundColor: shape === 'ring' ? 'transparent' : color,
                borderColor: color
            }, {
                duration: ANIMATION_CONFIG.durations.hover,
                easing: ANIMATION_CONFIG.easing
            })
        },
        click: (isDown) => {
            if (state.currentHoverText) return

            animate(elements.inner, {
                scale: isDown
                    ? (state.isHovering ? hoverScale * clickScale : scale * clickScale)
                    : (state.isHovering ? hoverScale : scale),
                backgroundColor: shape === 'ring' ? 'transparent' : color,
                borderColor: color
            }, {
                duration: ANIMATION_CONFIG.durations.click,
                easing: 'ease-out'
            })
        }
    }

    // Event handlers
    const handlers = {
        mouseMove: (e) => {
            state.targetX = e.clientX
            state.targetY = e.clientY
            if (!state.isVisible) show()
        },
        mouseLeave: hide,
        mouseDown: () => {
            animations.click(true)
            elements.outer.classList.add('cursor--clicking')
        },
        mouseUp: () => {
            animations.click(false)
            elements.outer.classList.remove('cursor--clicking')
        },
        mouseOver: (e) => {
            const target = e.target
            if (hoverSelectors.some(selector => target.matches(selector))) {
                handleHoverStart(target)
            } else {
                handleHoverEnd()
            }
        }
    }

    function createElements(size, color, shape, textSize, enabled, blend) {
        const outer = document.createElement('div')
        const inner = document.createElement('div')
        const text = document.createElement('div')

        // Add BEM classes
        outer.className = `cursor ${shape ? `cursor--${shape}` : ''} ${blend ? 'cursor--blend' : ''} ${morph ? 'cursor--morph' : ''}`
        inner.className = 'cursor__inner'
        text.className = 'cursor__text'

        const styles = getDefaultStyles(size, color, shape, blend)
        const baseFontSize = getBaseFontSize()

        outer.style.cssText = styles.outer + `
            opacity: ${enabled ? '1' : '0'};
            display: ${enabled ? 'block' : 'none'};
        `
        inner.style.cssText = styles.inner
        text.style.cssText = styles.text + `
            font-size: ${textSize * baseFontSize}px;
            line-height: 1.2;
            padding: 4px 8px;
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
            font-weight: 500;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 2;
            min-width: max-content;
            white-space: nowrap;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        `

        outer.appendChild(inner)
        inner.appendChild(text)
        document.body.appendChild(outer)

        return { outer, inner, text }
    }

    function setupCursorHiding() {
        const style = document.createElement('style')
        // Only hide cursor if morph is false
        if (!morph) {
            style.textContent = `* { cursor: none !important; }`
            document.head.appendChild(style)
        }
    }

    function update() {
        state.currentX += (state.targetX - state.currentX) * smoothness
        state.currentY += (state.targetY - state.currentY) * smoothness
        elements.outer.style.transform =
            `translate3d(${state.currentX - size/2}px, ${state.currentY - size/2}px, 0)`
        state.animationFrame = requestAnimationFrame(update)
    }

    function handleHoverStart(element) {
        if (state.lastHoverElement === element) return
        state.lastHoverElement = element
        state.isHovering = true

        // Add hover state class
        elements.outer.classList.add('cursor--hover')

        // Check for either data-hover-text or data-text-hover attribute
        const hoverText = element.getAttribute('data-hover-text') || element.getAttribute('data-text-hover')
        if (hoverText) {
            elements.outer.classList.add('cursor--has-text')
            showHoverText(hoverText)
        } else if (state.currentHoverText) {
            // Only hide text if we were showing text before
            elements.outer.classList.remove('cursor--has-text')
            hideHoverText()
        } else {
            // Just do regular hover if we weren't showing text
            animations.hover()
        }
    }

    function handleHoverEnd() {
        if (!state.isHovering) return
        state.isHovering = false
        state.lastHoverElement = null

        // Remove hover state classes
        elements.outer.classList.remove('cursor--hover')
        elements.outer.classList.remove('cursor--has-text')

        // Immediately hide text without animation
        if (state.currentHoverText) {
            elements.text.textContent = ''
            elements.text.style.opacity = '0'
            state.currentHoverText = ''
        }

        // Contract cursor back to original size
        animate(elements.inner, {
            scale: scale
        }, {
            duration: ANIMATION_CONFIG.durations.contract,
            easing: ANIMATION_CONFIG.easing
        })
    }

    function showHoverText(text) {
        if (state.currentHoverText === text) return
        state.currentHoverText = text
        animations.expand(text)
    }

    function hideHoverText() {
        if (!state.currentHoverText) return

        // Immediately hide text without animation
        elements.text.textContent = ''
        elements.text.style.opacity = '0'
        state.currentHoverText = ''

        // Contract cursor back to original size
        animate(elements.inner, {
            scale: scale
        }, {
            duration: ANIMATION_CONFIG.durations.contract,
            easing: ANIMATION_CONFIG.easing
        })
    }

    function show() {
        if (state.isVisible || !state.isCustomCursorEnabled) return
        state.isVisible = true
        elements.outer.style.opacity = '1'
        elements.outer.classList.add('cursor--visible')
    }

    function hide() {
        if (!state.isVisible || !state.isCustomCursorEnabled) return
        state.isVisible = false
        elements.outer.style.opacity = '0'
        elements.outer.classList.remove('cursor--visible')
        hideHoverText()
    }

    function cleanup() {
        // Remove event listeners
        Object.entries(handlers).forEach(([event, handler]) => {
            document.removeEventListener(
                event.toLowerCase(),
                handler,
                event === 'mouseMove' ? { passive: true } : undefined
            )
        })

        // Cancel animation frame
        if (state.animationFrame) {
            cancelAnimationFrame(state.animationFrame)
        }

        // Restore cursor
        if (state.isCustomCursorEnabled) {
            const styles = document.querySelectorAll('style')
            styles.forEach(style => {
                if (style.textContent.includes('cursor: none')) {
                    style.remove()
                }
            })
            document.body.style.cursor = 'default'
        }

        // Remove elements
        elements.outer.remove()
    }

    // Initialize if enabled
    if (state.isCustomCursorEnabled) {
        update()
        // Add event listeners
        Object.entries(handlers).forEach(([event, handler]) => {
            document.addEventListener(
                event.toLowerCase(),
                handler,
                event === 'mouseMove' ? { passive: true } : undefined
            )
        })
    }

    return { show, hide, cleanup }
}
