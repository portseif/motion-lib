/**
 * @typedef {Object} ScrollTriggerOptions
 * @property {number} [threshold=0.5] - Amount of element that needs to be in view (0.0 - 1.0)
 * @property {number} [duration=0.5] - Animation duration in seconds
 * @property {'fade' | 'slide' | 'scale'} [animation='fade'] - Type of animation to trigger
 * @property {'up' | 'down' | 'left' | 'right'} [direction='up'] - Direction for slide animations
 * @property {number} [distance=100] - Distance for slide animations in pixels
 * @property {'linear' | 'easeIn' | 'easeOut' | 'easeInOut'} [easing='easeOut'] - Animation easing
 */

import { animate, inView } from 'motion'

/**
 * Creates a scroll-triggered animation on an element
 * @param {HTMLElement} element - The element to animate
 * @param {ScrollTriggerOptions} options - Animation options
 */
export function scrollTrigger(element, options = {}) {
  if (!element) throw new Error('Element is required for scroll trigger animation')

  const { threshold = 0.5, duration = 0.5, animation = 'fade', direction = 'up', distance = 100, easing = 'easeOut' } = options

  // Set initial styles based on animation type
  switch (animation) {
    case 'fade':
      element.style.opacity = '0'
      break
    case 'slide':
      element.style.transform = getInitialTransform(direction, distance)
      element.style.opacity = '0'
      break
    case 'scale':
      element.style.transform = 'scale(0.5)'
      element.style.opacity = '0'
      break
  }

  inView(
    element,
    ({ target }) => {
      switch (animation) {
        case 'fade':
          animate(target, { opacity: [0, 1] }, { duration, easing })
          break
        case 'slide':
          animate(
            target,
            {
              transform: [getInitialTransform(direction, distance), 'none'],
              opacity: [0, 1],
            },
            { duration, easing }
          )
          break
        case 'scale':
          animate(
            target,
            {
              transform: ['scale(0.5)', 'scale(1)'],
              opacity: [0, 1],
            },
            { duration, easing }
          )
          break
      }
    },
    { amount: threshold }
  )
}

function getInitialTransform(direction, distance) {
  switch (direction) {
    case 'up':
      return `translateY(${distance}px)`
    case 'down':
      return `translateY(-${distance}px)`
    case 'left':
      return `translateX(${distance}px)`
    case 'right':
      return `translateX(-${distance}px)`
    default:
      return `translateY(${distance}px)`
  }
}
