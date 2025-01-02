import { animate, stagger } from "motion";
import { timeline } from "@motionone/dom";

/**
 * Creates a text morph effect that smoothly transitions between characters
 * @param {Object} options - Text morph options
 * @param {HTMLElement} options.element - The element to apply the morph effect to
 * @param {string} options.text - The text to display
 * @param {string} [options.className] - Additional CSS classes
 * @returns {Object} Control object with update method
 */
export function textMorph({ element, text, className = '' }) {
    let currentText = text;
    let isAnimating = false;

    // Spring configuration for pushing effect
    const spring = {
        type: "spring",
        stiffness: 280,
        damping: 18,
        mass: 0.3
    };

    // Initialize the element
    element.style.position = 'relative';
    element.style.display = 'inline-block';
    element.innerHTML = '';
    if (className) {
        element.className = className;
    }

    function createCharacter(char, index, id) {
        const span = document.createElement('span');
        span.style.cssText = `
            display: inline-block;
            position: relative;
            white-space: pre;
            transform-origin: 50% 50%;
            will-change: transform, opacity;
        `;
        const displayChar = char === ' ' ? '\u00A0' : char;
        span.textContent = displayChar;
        span.dataset.id = id;
        return span;
    }

    async function updateText(newText) {
        if (newText === currentText && !isAnimating) return;
        isAnimating = true;

        // Store current elements and their positions
        const currentElements = Array.from(element.children);
        const initialPositions = currentElements.map(el => ({
            el,
            rect: el.getBoundingClientRect()
        }));

        // Prepare new elements
        currentText = newText;
        const charCounts = {};
        const newElements = newText.split('').map((char, index) => {
            // Use the character as is for ID, but lowercase for counting
            const lowerChar = char.toLowerCase();
            charCounts[lowerChar] = (charCounts[lowerChar] || 0) + 1;
            const id = `${char}${charCounts[lowerChar]}`;

            const existing = currentElements.find(el => el.dataset.id === id);

            if (existing) {
                return existing;
            } else {
                const el = createCharacter(char, index, id);
                el.style.opacity = '0';
                el.style.transform = 'translateX(0px)';
                return el;
            }
        });

        // Update DOM but keep removed elements
        const removedElements = currentElements.filter(el => !newElements.includes(el));
        removedElements.forEach(el => {
            el.style.position = 'absolute';
            el.style.left = el.getBoundingClientRect().left + 'px';
            el.style.top = el.getBoundingClientRect().top + 'px';
        });

        element.innerHTML = '';
        newElements.forEach(el => element.appendChild(el));
        removedElements.forEach(el => element.appendChild(el));

        // Get final positions for new arrangement
        const finalPositions = newElements.map(el => ({
            el,
            rect: el.getBoundingClientRect()
        }));

        // Animate all elements simultaneously
        const animations = [];

        // Fade out removed elements in place
        removedElements.forEach(el => {
            animations.push(
                animate(el, {
                    opacity: [1, 0]
                }, {
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1]
                }).finished
            );
        });

        // Animate remaining and new elements
        newElements.forEach((el, i) => {
            const initial = initialPositions.find(pos => pos.el === el);
            const final = finalPositions[i];

            if (initial) {
                // Existing letters animate to new position
                const deltaX = initial.rect.left - final.rect.left;
                animations.push(
                    animate(el, {
                        x: [deltaX, 0]
                    }, {
                        duration: 0.3,
                        ...spring
                    }).finished
                );
            } else {
                // New letters fade in
                animations.push(
                    animate(el, {
                        opacity: [0, 1],
                        x: [0, 0]
                    }, {
                        duration: 0.3,
                        ease: [0.2, 0.6, 0.3, 1]
                    }).finished
                );
            }
        });

        // Run all animations simultaneously
        await Promise.all(animations);

        // Clean up removed elements
        removedElements.forEach(el => el.remove());
        isAnimating = false;
    }

    // Initial render
    const charCounts = {};
    text.split('').forEach((char, index) => {
        const lowerChar = char.toLowerCase();
        charCounts[lowerChar] = (charCounts[lowerChar] || 0) + 1;
        const el = createCharacter(char, index, `${char}${charCounts[lowerChar]}`);
        element.appendChild(el);
    });

    return {
        update: (newText) => {
            updateText(newText || '');
        }
    };
}

export default textMorph;
