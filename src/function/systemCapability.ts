/* eslint-disable consistent-this */
export function debounce(func: any, delay: any) {
  let timer: any;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export const throttle = (func: any, limit: any) => {
  let inThrottle = false;
  return function () {
    const context = this;
    const args = arguments;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
