/**
 * Formative Design System - Button Component
 * 
 * A flexible, accessible button component built on Radix UI primitives.
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// ============================================================================
// BUTTON VARIANTS
// ============================================================================

const buttonVariants = cva(
  `
    inline-flex items-center justify-center whitespace-nowrap
    rounded-lg text-sm font-medium
    transition-colors duration-200
    focus-visible:outline-none focus-visible:ring-2
    focus-visible:ring-brand-primary focus-visible:ring-offset-2
    disabled:pointer-events-none disabled:opacity-50
    select-none
  `,
  {
    variants: {
      variant: {
        // Primary button - Brand color
        primary: `
          bg-brand-primary text-white
          hover:bg-brand-primary-hover
          active:bg-brand-primary-active
          shadow-sm hover:shadow-md
        `,
        
        // Secondary button - Subtle
        secondary: `
          bg-surface-hover text-text-primary
          hover:bg-surface-active
          border border-border
        `,
        
        // Outline button
        outline: `
          bg-transparent text-text-primary
          border border-border
          hover:bg-surface-hover
          hover:text-text-primary
        `,
        
        // Ghost button - Minimal
        ghost: `
          bg-transparent text-text-secondary
          hover:bg-surface-hover
          hover:text-text-primary
        `,
        
        // Brand outline
        brandOutline: `
          bg-transparent text-brand-primary
          border border-brand-primary
          hover:bg-brand-primary hover:text-white
        `,
        
        // Danger button
        danger: `
          bg-red-500 text-white
          hover:bg-red-600
          active:bg-red-700
        `,
        
        // Link-style button
        link: `
          bg-transparent text-text-primary underline-offset-4
          hover:underline
          p-0
        `,
        
        // Icon button
        icon: `
          bg-surface-hover text-text-secondary
          hover:bg-surface-active
          hover:text-text-primary
          p-2
        `,
      },
      
      size: {
        xs: 'h-6 px-2 text-xs',
        sm: 'h-8 px-3 text-sm',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-5 text-base',
        xl: 'h-12 px-6 text-base',
        
        // Special sizes for canvas
        canvas: 'h-8 px-3 text-xs',
        nav: 'h-8 w-8 p-0',
        icon: 'h-8 w-8 p-0',
      },
      
      // Light mode overrides
      light: {
        primary: `
          bg-brand-primary text-white
          hover:bg-brand-primary-hover
          active:bg-brand-primary-active
        `,
        secondary: `
          bg-zinc-100 text-zinc-900
          hover:bg-zinc-200
          border border-zinc-200
        `,
        outline: `
          bg-transparent text-zinc-900
          border border-zinc-300
          hover:bg-zinc-100
        `,
        ghost: `
          bg-transparent text-zinc-600
          hover:bg-zinc-100
          hover:text-zinc-900
        `,
      },
    },
    
    compoundVariants: [
      // Primary + size combinations
      {
        variant: 'primary',
        size: ['sm', 'md', 'lg', 'xl'],
        class: 'shadow-sm',
      },
      // Icon button with brand color
      {
        variant: 'icon',
        class: 'rounded-md',
      },
    ],
    
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  theme?: 'light' | 'dark';
}

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

const LoadingSpinner = ({ className }: { className?: string }) => (
  <svg
    className={cn('animate-spin h-4 w-4', className)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      leftIcon,
      rightIcon,
      isLoading = false,
      theme,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDark = theme === 'dark';
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          // Dark mode specific classes
          isDark && variant === 'secondary' && `
            bg-dark-surface-hover text-dark-text-primary
            hover:bg-dark-surface-active
            border border-dark-border
          `,
          isDark && variant === 'outline' && `
            bg-transparent text-dark-text-primary
            border border-dark-border
            hover:bg-dark-surface-hover
          `,
          isDark && variant === 'ghost' && `
            bg-transparent text-dark-text-secondary
            hover:bg-dark-surface-hover
            hover:text-dark-text-primary
          `,
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            {children && <span className="ml-2">{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

// ============================================================================
// EXPORTS
// ============================================================================

export { Button, buttonVariants, LoadingSpinner };
