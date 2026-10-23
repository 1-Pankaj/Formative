/**
 * Formative Design System - Dialog Component
 * 
 * A accessible modal dialog component built on Radix UI.
 */

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  theme?: 'light' | 'dark';
  children?: React.ReactNode;
}

const Dialog = DialogPrimitive.Root;

Dialog.displayName = DialogPrimitive.Root.displayName;

// Dialog Trigger
const DialogTrigger = DialogPrimitive.Trigger;

DialogTrigger.displayName = DialogPrimitive.Trigger.displayName;

// Dialog Portal
const DialogPortal = DialogPrimitive.Portal;

DialogPortal.displayName = DialogPrimitive.Portal.displayName;

// Dialog Close
const DialogClose = DialogPrimitive.Close;

DialogClose.displayName = DialogPrimitive.Close.displayName;

// Dialog Overlay
export interface DialogOverlayProps {
  theme?: 'light' | 'dark';
  className?: string;
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(({ className, theme = 'dark', ...props }, ref) => {
  const isDark = theme === 'dark';
  
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        isDark ? 'bg-black/80' : 'bg-black/60',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Dialog Content
export interface DialogContentProps {
  theme?: 'light' | 'dark';
  className?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
  onClose?: () => void;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, theme = 'dark', size = 'md', showClose = true, onClose, children, ...props }, ref) => {
  const isDark = theme === 'dark';
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };
  
  return (
    <DialogPortal>
      <DialogOverlay theme={theme} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          `
            fixed left-1/2 top-1/2 z-50
            grid w-full translate-x-[-50%] translate-y-[-50%]
            gap-4 border shadow-xl
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
            data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]
            data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]
          `,
          isDark 
            ? 'bg-surface border-border' 
            : 'bg-white border-zinc-200',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {showClose && (
          <DialogPrimitive.Close
            className={cn(
              `
                absolute right-4 top-4 z-10
                rounded-md p-1
                transition-colors
                hover:bg-surface-hover
                focus:outline-none focus:ring-2 focus:ring-brand-primary
              `,
              isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
            )}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

DialogContent.displayName = DialogPrimitive.Content.displayName;

// Dialog Header
interface DialogHeaderProps {
  theme?: 'light' | 'dark';
  className?: string;
  children?: React.ReactNode;
}

const DialogHeader = ({ className, theme = 'dark', children }: DialogHeaderProps) => {
  const isDark = theme === 'dark';
  
  return (
    <div
      className={cn(
        'flex flex-col space-y-1.5 text-center sm:text-left',
        isDark ? 'text-text-primary' : 'text-zinc-900',
        className
      )}
    >
      {children}
    </div>
  );
};

DialogHeader.displayName = 'DialogHeader';

// Dialog Footer
interface DialogFooterProps {
  theme?: 'light' | 'dark';
  className?: string;
  children?: React.ReactNode;
}

const DialogFooter = ({ className, theme = 'dark', children }: DialogFooterProps) => {
  const isDark = theme === 'dark';
  
  return (
    <div
      className={cn(
        'flex items-center justify-end space-x-2',
        isDark ? 'text-text-secondary' : 'text-zinc-600',
        className
      )}
    >
      {children}
    </div>
  );
};

DialogFooter.displayName = 'DialogFooter';

// Dialog Title
interface DialogTitleProps {
  theme?: 'light' | 'dark';
  className?: string;
  children?: React.ReactNode;
}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(({ className, theme = 'dark', children, ...props }, ref) => {
  const isDark = theme === 'dark';
  
  return (
    <DialogPrimitive.Title
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        isDark ? 'text-text-primary' : 'text-zinc-900',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </DialogPrimitive.Title>
  );
});

DialogTitle.displayName = DialogPrimitive.Title.displayName;

// Dialog Description
interface DialogDescriptionProps {
  theme?: 'light' | 'dark';
  className?: string;
  children?: React.ReactNode;
}

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(({ className, theme = 'dark', children, ...props }, ref) => {
  const isDark = theme === 'dark';
  
  return (
    <DialogPrimitive.Description
      className={cn(
        'text-sm',
        isDark ? 'text-text-tertiary' : 'text-zinc-600',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </DialogPrimitive.Description>
  );
});

DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  DialogOverlay,
};
