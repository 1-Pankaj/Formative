/**
 * Formative Design System - Card Component
 * 
 * A flexible card component for displaying content with consistent styling.
 */

import * as React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: 'light' | 'dark';
  variant?: 'default' | 'bordered' | 'elevated' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      theme = 'dark',
      variant = 'default',
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const isDark = theme === 'dark';
    
    const baseStyles = `
      rounded-xl
      transition-all duration-200
    `;
    
    const variantStyles = {
      default: isDark 
        ? 'bg-surface border border-border-subtle' 
        : 'bg-white border border-zinc-200',
      bordered: isDark 
        ? 'bg-surface border border-border' 
        : 'bg-white border border-zinc-300',
      elevated: isDark 
        ? 'bg-surface border border-border-subtle shadow-lg' 
        : 'bg-white border border-zinc-200 shadow-lg',
      interactive: isDark 
        ? 'bg-surface border border-border-subtle hover:border-border hover:shadow-md' 
        : 'bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md',
    };
    
    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };
    
    return (
      <div
        className={cn(
          baseStyles,
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: 'light' | 'dark';
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, theme = 'dark', ...props }, ref) => {
    const isDark = theme === 'dark';
    
    return (
      <div
        className={cn(
          'flex flex-col space-y-1.5 pb-4',
          isDark ? 'text-text-primary' : 'text-zinc-900',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Title
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  theme?: 'light' | 'dark';
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, theme = 'dark', ...props }, ref) => {
    const isDark = theme === 'dark';
    
    return (
      <h3
        className={cn(
          'text-lg font-semibold leading-none tracking-tight',
          isDark ? 'text-text-primary' : 'text-zinc-900',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Description
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  theme?: 'light' | 'dark';
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, theme = 'dark', ...props }, ref) => {
    const isDark = theme === 'dark';
    
    return (
      <p
        className={cn(
          'text-sm',
          isDark ? 'text-text-tertiary' : 'text-zinc-600',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

CardDescription.displayName = 'CardDescription';

// Card Content
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: 'light' | 'dark';
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, theme = 'dark', ...props }, ref) => {
    const isDark = theme === 'dark';
    
    return (
      <div
        className={cn(
          isDark ? 'text-text-secondary' : 'text-zinc-700',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: 'light' | 'dark';
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, theme = 'dark', ...props }, ref) => {
    const isDark = theme === 'dark';
    
    return (
      <div
        className={cn(
          'flex items-center pt-4',
          isDark ? 'text-text-tertiary' : 'text-zinc-600',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
