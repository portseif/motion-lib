<<<<<<< HEAD
# Motion Lib

A framework-agnostic animation library built on top of Motion.js, providing easy-to-use animations for any web project.

## Installation

```bash
npm install @portseif/motion-lib
```

## Features

- 🎯 Framework agnostic - works with any JavaScript project
- 🚀 Simple, intuitive API
- 🎭 Multiple animation types:
  - Fade animations
  - Slide animations
  - Scroll-triggered animations
  - Scroll-scrub animations
- 🎨 Customizable options for each animation
- 🔄 Smooth transitions
- 📱 Mobile-friendly

## Usage

### Basic Animations

```javascript
import { fade, slide } from '@portseif/motion-lib';

// Fade animation
fade(element, {
    opacity: [0, 1],
    duration: 0.5,
    easing: 'easeOut'
});

// Slide animation
slide(element, {
    direction: 'left',
    duration: 0.5,
    distance: 100
});
```

### Scroll Animations

```javascript
import { scrollTrigger, scrollScrub } from '@portseif/motion-lib';

// Trigger animation when element comes into view
scrollTrigger(element, {
    animation: 'fade',
    duration: 0.8,
    threshold: 0.5
});

// Animation that follows scroll position
scrollScrub(element, {
    start: 0.3,
    end: 0.7,
    properties: {
        transform: ['scale(0.5)', 'scale(1.2)'],
        opacity: [0.3, 1]
    },
    smooth: true
});
```

## API Reference

### Fade Animation
```javascript
fade(element, options)
```
- `element`: HTMLElement to animate
- `options`:
  - `duration`: Animation duration in seconds (default: 0.3)
  - `opacity`: Array of [start, end] opacity values (default: [0, 1])
  - `easing`: Animation easing (default: 'easeOut')
  - `delay`: Delay before animation starts (default: 0)

### Slide Animation
```javascript
slide(element, options)
```
- `element`: HTMLElement to animate
- `options`:
  - `direction`: 'left' | 'right' | 'up' | 'down' (default: 'right')
  - `duration`: Animation duration in seconds (default: 0.3)
  - `distance`: Slide distance in pixels (default: 100)
  - `easing`: Animation easing (default: 'easeOut')

### Scroll Trigger
```javascript
scrollTrigger(element, options)
```
- `element`: HTMLElement to animate
- `options`:
  - `animation`: 'fade' | 'slide' | 'scale' (default: 'fade')
  - `threshold`: Amount of element that needs to be in view (default: 0.5)
  - `duration`: Animation duration in seconds (default: 0.5)
  - `direction`: For slide animations (default: 'up')

### Scroll Scrub
```javascript
scrollScrub(element, options)
```
- `element`: HTMLElement to animate
- `options`:
  - `start`: Start position relative to viewport (default: 0)
  - `end`: End position relative to viewport (default: 1)
  - `properties`: Animation properties with start and end values
  - `smooth`: Enable smooth animation (default: true)
  - `smoothAmount`: Smoothing factor (default: 0.1)

## License

ISC © Chris Seifert
=======
>>>>>>> 8f36d269d46cb68d6c399952765e36fa871d46ae
