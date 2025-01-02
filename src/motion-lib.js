export const fade = (element, options = {}) => {
  const defaults = {
    duration: 1000,
    direction: 'in'
  };
  const config = { ...defaults, ...options };

  element.style.transition = `opacity ${config.duration}ms`;
  element.style.opacity = config.direction === 'in' ? 1 : 0;

  return {
    destroy() {
      element.style.transition = '';
      element.style.opacity = '';
    }
  };
};

// Add more animation functions as needed
// export const slide = ...
// export const scale = ...
