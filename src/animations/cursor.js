import { animate } from 'motion'

// Animation configurations
const ANIMATION_CONFIG = {
    spring: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        mass: 0.5,
        restSpeed: 0.1
    },
    easing: [0.32, 0.72, 0, 1],
    durations: {
        expand: 0.6,
        contract: 0.5,
        hover: 0.4,
        click: 0.2
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
        display: block;
        color: white;
        opacity: 0;
        pointer-events: none;
        text-align: center;
        width: auto;
        height: auto;
        white-space: nowrap;
        z-index: 10001;
        mix-blend-mode: ${blend ? 'difference' : 'normal'};
        will-change: transform, opacity;
        transform-origin: center center;
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
            // Cancel any ongoing animations
            elements.inner.getAnimations().forEach(animation => animation.cancel())
            elements.text.getAnimations().forEach(animation => animation.cancel())

            // Set text content and initial state
            elements.text.textContent = text
            elements.text.style.display = 'flex'
            elements.text.style.opacity = '0'
            elements.text.style.transform = 'translate(-50%, -50%)'

            if (morph) {
                // Get text dimensions
                const textRect = elements.text.getBoundingClientRect()
                const padding = 20
                const targetWidth = textRect.width + padding
                const targetHeight = textRect.height + padding

                // Reset inner cursor state
                elements.inner.style.width = `${size}px`
                elements.inner.style.height = `${size}px`
                elements.inner.style.transform = `scale(${scale})`

                // Animate cursor to text size with spring physics
                animate(elements.inner, {
                    width: [size, targetWidth],
                    height: [size, targetHeight],
                    scale: [scale, 1],
                    backgroundColor: shape === 'ring' ? 'transparent' : color,
                    borderColor: color,
                    borderRadius: ['50%', '8px']
                }, {
                    ...ANIMATION_CONFIG.spring,
                    duration: ANIMATION_CONFIG.durations.expand
                }).finished.then(() => {
                    // Animate text in
                    animate(elements.text, {
                        opacity: [0, 1]
                    }, {
                        duration: 0.3,
                        easing: ANIMATION_CONFIG.easing
                    })
                })
            } else {
                // Get text dimensions for scaling
                const textRect = elements.text.getBoundingClientRect()
                const padding = 20
                const targetScale = Math.max(
                    (textRect.width + padding) / size,
                    (textRect.height + padding) / size
                ) * scale

                // Reset inner cursor state
                elements.inner.style.transform = `scale(${scale})`

                // Animate cursor scale with spring physics
                animate(elements.inner, {
                    scale: [scale, targetScale]
                }, {
                    ...ANIMATION_CONFIG.spring,
                    duration: ANIMATION_CONFIG.durations.expand
                }).finished.then(() => {
                    // Animate text in
                    animate(elements.text, {
                        opacity: [0, 1]
                    }, {
                        duration: 0.3,
                        easing: ANIMATION_CONFIG.easing
                    })
                })
            }
        },
        contract: (withText = false) => {
            // Cancel any ongoing animations
            elements.inner.getAnimations().forEach(animation => animation.cancel())
            elements.text.getAnimations().forEach(animation => animation.cancel())

            // Reset inner cursor state
            elements.inner.style.width = `${size}px`
            elements.inner.style.height = `${size}px`
            elements.inner.style.transform = `scale(${scale})`
            elements.inner.style.borderRadius = shape === 'circle' || shape === 'ring' ? '50%' : '0'

            // First animate text out
            return animate(elements.text, {
                opacity: [1, 0],
                transform: ['translate(-50%, -50%)', 'translate(-50%, -50%) scale(0.8)']
            }, {
                duration: 0.3,
                easing: ANIMATION_CONFIG.easing
            }).finished
              .then(() => {
                  // Only clear text content after fade out completes
                  elements.text.textContent = ''
                  elements.text.style.transform = 'translate(-50%, -50%)'
                  elements.text.style.display = 'none'
              })
              .catch(error => {
                  // Fallback to immediate state reset if animation fails
                  console.warn('Cursor contract animation failed:', error)
                  elements.text.style.opacity = '0'
                  elements.text.style.transform = 'translate(-50%, -50%)'
                  elements.text.style.display = 'none'
                  elements.text.textContent = ''
                  elements.inner.style.transform = `scale(${scale})`
              })
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
            line-height: 1;
            padding: 0;
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
            pointer-events: none;
            user-select: none;
            will-change: opacity;
            opacity: 0;
            display: flex;
            align-items: center;
            justify-content: center;
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
            state.currentHoverText = hoverText

            // Set initial text state
            elements.text.textContent = hoverText
            elements.text.style.display = 'block'
            elements.text.style.opacity = '0'
            elements.text.style.transform = 'translate(-50%, -50%)'

            // Force a reflow
            elements.text.offsetHeight

            // Animate text in
            animate(elements.text, {
                opacity: [0, 1]
            }, {
                duration: 0.2,
                easing: ANIMATION_CONFIG.easing
            })

            // Expand cursor
            animations.expand(hoverText)
        } else if (state.currentHoverText) {
            elements.outer.classList.remove('cursor--has-text')
            hideHoverText()
        } else {
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

        // Reset cursor state and animate
        if (state.currentHoverText) {
            const prevText = state.currentHoverText
            state.currentHoverText = ''
            animations.contract(true).then(() => {
                // Only clear if this was the last text shown
                if (prevText === elements.text.textContent) {
                    elements.text.textContent = ''
                }
            })
        } else {
            animations.contract(false)
        }
    }

    function showHoverText(text) {
        if (state.currentHoverText === text) return
        console.log('Showing hover text:', text) // Debug log
        state.currentHoverText = text

        // Set text content and initial state
        elements.text.textContent = text
        elements.text.style.transform = 'translate(-50%, -50%) scale(0.6)'
        elements.text.style.opacity = '0'

        // Force a reflow
        elements.text.offsetHeight

        animations.expand(text)
    }

    function hideHoverText() {
        if (!state.currentHoverText) return

        // Immediately hide text without animation
        elements.text.textContent = ''
        elements.text.style.opacity = '0'
        elements.text.style.display = 'none'
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
