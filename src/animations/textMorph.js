import { animate } from "motion";

/**
 * Text morph animation between two strings
 * @param {HTMLElement} element - DOM element containing the text
 * @param {Object} options - Animation options
 * @param {string} options.from - Initial text content
 * @param {string} options.to - Target text content
 * @param {number} [options.duration=1000] - Duration in milliseconds
 * @param {string} [options.easing='ease-in-out'] - CSS easing function
 * @returns {Animation} Motion animation instance
 */
export function textMorph(element, options = {}) {
    const {
        from = '',
        to = '',
        duration = 1000,
        easing = 'ease-in-out'
    } = options;

    // Ensure the element has the correct initial text
    element.textContent = from;

    return animate(
        (progress) => {
            // Calculate intermediate text length
            const fromLength = from.length;
            const toLength = to.length;
            const currentLength = Math.round(fromLength + (toLength - fromLength) * progress);

            // Build intermediate text
            let currentText = '';
            for (let i = 0; i < currentLength; i++) {
                if (i < fromLength && i < toLength) {
                    // Morph characters between from and to
                    const fromChar = from[i];
                    const toChar = to[i];
                    const charProgress = Math.min(progress * 2, 1);
                    currentText += String.fromCharCode(
                        fromChar.charCodeAt(0) + (toChar.charCodeAt(0) - fromChar.charCodeAt(0)) * charProgress
                    );
                } else if (i < toLength) {
                    // Add new characters from 'to'
                    currentText += to[i];
                }
            }
            element.textContent = currentText;
        },
        { duration: duration / 1000, easing }
    );
}

export default textMorph;
