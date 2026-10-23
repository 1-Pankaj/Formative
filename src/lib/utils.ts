/**
 * Formative Design System - Utility Functions
 * 
 * A collection of utility functions for working with Tailwind CSS,
 * conditional class names, and common UI patterns.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// CLASS NAME UTILITIES
// ============================================================================

/**
 * Combines clsx and tailwind-merge for optimal class name handling.
 * 
 * @example
 * cn('text-red-500', isActive && 'text-blue-500', 'font-bold')
 * // => 'font-bold text-red-500' (if isActive is false)
 * // => 'font-bold text-blue-500' (if isActive is true)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Conditionally joins class names with a separator.
 * 
 * @example
 * conditionalClass(isActive, 'bg-blue-500', 'bg-gray-100')
 * // => 'bg-blue-500' (if isActive is true)
 * // => 'bg-gray-100' (if isActive is false)
 */
export function conditionalClass(
  condition: boolean,
  trueClass: string,
  falseClass: string = ''
): string {
  return condition ? trueClass : falseClass;
}

/**
 * Generates a class name string based on a theme mode.
 * 
 * @example
 * themeClass('dark', 'bg-black text-white', 'bg-white text-black')
 * // => 'bg-black text-white' (if theme is 'dark')
 */
export function themeClass(
  theme: 'light' | 'dark',
  darkClass: string,
  lightClass: string
): string {
  return theme === 'dark' ? darkClass : lightClass;
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Converts a hex color to RGBA format.
 * 
 * @example
 * hexToRgba('#ff0000', 0.5) => 'rgba(255, 0, 0, 0.5)'
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Lightens or darkens a hex color.
 * 
 * @example
 * adjustColor('#ff0000', 20) => '#ff3333' (20% lighter)
 * adjustColor('#ff0000', -20) => '#cc0000' (20% darker)
 */
export function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

/**
 * Checks if a color is light or dark.
 * 
 * @example
 * isLightColor('#ffffff') => true
 * isLightColor('#000000') => false
 */
export function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Capitalizes the first letter of a string.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncates a string to a specified length.
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Generates initials from a name.
 */
export function getInitials(name: string, maxLength: number = 2): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join('');
}

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

/**
 * Formats a number with a suffix (e.g., 1k, 1M).
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

/**
 * Clamps a number between a minimum and maximum value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linearly interpolates between two values.
 */
export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t;
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Returns the last element of an array.
 */
export function last<T>(arr: T[]): T | undefined {
  return arr[arr.length - 1];
}

/**
 * Returns a random element from an array.
 */
export function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Toggles a value in an array.
 */
export function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value)
    ? arr.filter((item) => item !== value)
    : [...arr, value];
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Deep merges two objects.
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };
  
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];
      
      if (
        sourceValue !== null &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue !== null &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        result[key] = sourceValue;
      }
    }
  }
  
  return result;
}

/**
 * Debounces a function.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttles a function.
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastFunc: ReturnType<typeof setTimeout>;
  let lastRan = 0;
  
  return (...args: Parameters<T>) => {
    if (!lastRan) {
      fn(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          fn(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// ============================================================================
// REACT UTILITIES
// ============================================================================

/**
 * Prevents the default behavior of an event.
 */
export function preventDefault<T extends React.SyntheticEvent>(
  e: T
): void {
  e.preventDefault();
}

/**
 * Stops the propagation of an event.
 */
export function stopPropagation<T extends React.SyntheticEvent>(
  e: T
): void {
  e.stopPropagation();
}

/**
 * Prevents default and stops propagation.
 */
export function preventDefaultAndStopPropagation<T extends React.SyntheticEvent>(
  e: T
): void {
  e.preventDefault();
  e.stopPropagation();
}

export default {
  cn,
  conditionalClass,
  themeClass,
  hexToRgba,
  adjustColor,
  isLightColor,
  capitalize,
  truncate,
  getInitials,
  formatNumber,
  clamp,
  lerp,
  last,
  random,
  toggle,
  deepMerge,
  debounce,
  throttle,
  preventDefault,
  stopPropagation,
  preventDefaultAndStopPropagation,
};
