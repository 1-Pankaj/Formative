/**
 * Formative Design System - Input Component
 * 
 * A flexible, accessible input component with consistent styling.
 */

import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  theme?: 'light' | 'dark';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      theme = 'dark',
      leftIcon,
      rightIcon,
      error = false,
      errorMessage,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDark = theme === 'dark';
    
    return (
      <div className="relative">
        {/* Input container with icons */}
        <div
          className={cn(
            'relative flex items-center',
            error && 'ring-2 ring-red-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {/* Left icon */}
          {leftIcon && (
            <div
              className={cn(
                'absolute left-3 pointer-events-none',
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              )}
            >
              {leftIcon}
            </div>
          )}
          
          {/* Input element */}
          <input
            type={type}
            className={cn(
              `
                flex h-9 w-full
                rounded-lg border bg-transparent
                text-sm placeholder:text-muted
                transition-colors duration-200
                focus:outline-none focus:ring-2
                focus:ring-brand-primary focus:ring-offset-0
                disabled:cursor-not-allowed
              `,
              isDark ? `
                border-border bg-surface
                text-text-primary
                placeholder:text-zinc-500
                hover:border-border-strong
                focus:border-border-strong
              ` : `
                border-zinc-300 bg-white
                text-zinc-900
                placeholder:text-zinc-400
                hover:border-zinc-400
                focus:border-zinc-400
              `,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500',
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          
          {/* Right icon */}
          {rightIcon && (
            <div
              className={cn(
                'absolute right-3 pointer-events-none',
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && errorMessage && (
          <p
            className={cn(
              'mt-1 text-xs',
              isDark ? 'text-red-400' : 'text-red-600'
            )}
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
