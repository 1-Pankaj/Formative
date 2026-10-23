/**
 * Formative Design System - Dropdown Menu Component
 * 
 * A accessible dropdown menu component built on Radix UI.
 */

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronRight, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DropdownMenuProps {
  theme?: 'light' | 'dark';
  children?: React.ReactNode;
}

const DropdownMenu = DropdownMenuPrimitive.Root;

DropdownMenu.displayName = DropdownMenuPrimitive.Root.displayName;

// Dropdown Menu Trigger
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName;

// Dropdown Menu Portal
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

DropdownMenuPortal.displayName = DropdownMenuPrimitive.Portal.displayName;

// Dropdown Menu Content
export interface DropdownMenuContentProps {
  theme?: 'light' | 'dark';
  className?: string;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  DropdownMenuContentProps
>(({ className, theme = 'dark', align = 'start', sideOffset = 4, ...props }, ref) => {
  const isDark = theme === 'dark';
  
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          `
            z-50 min-w-32 rounded-lg border shadow-xl
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
            data-[side=bottom]:slide-in-from-top-2
            data-[side=left]:slide-in-from-right-2
            data-[side=right]:slide-in-from-left-2
            data-[side=top]:slide-in-from-bottom-2
          `,
          isDark 
            ? 'bg-surface border-border text-text-secondary' 
            : 'bg-white border-zinc-200 text-zinc-700',
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

// Dropdown Menu Item
export interface DropdownMenuItemProps {
  theme?: 'light' | 'dark';
  className?: string;
  inset?: boolean;
  destructive?: boolean;
}

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(({ className, theme = 'dark', inset, destructive = false, ...props }, ref) => {
  const isDark = theme === 'dark';
  
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        `
          relative flex cursor-default select-none items-center
          rounded-md px-2 py-1.5 text-sm outline-none
          transition-colors
          focus:bg-surface-hover
          data-[disabled]:pointer-events-none data-[disabled]:opacity-50
        `,
        isDark 
          ? 'text-text-secondary focus:text-text-primary' 
          : 'text-zinc-700 focus:text-zinc-900',
        inset && 'pl-8',
        destructive && 'text-red-500 focus:text-red-600',
        className
      )}
      {...props}
    />
  );
});

DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

// Dropdown Menu Checkbox Item
export interface DropdownMenuCheckboxItemProps {
  theme?: 'light' | 'dark';
  className?: string;
  checked?: boolean;
  children?: React.ReactNode;
}

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  DropdownMenuCheckboxItemProps
>(({ className, theme = 'dark', checked, children, ...props }, ref) => {
  const isDark = theme === 'dark';
  
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      checked={checked}
      className={cn(
        `
          relative flex cursor-default select-none items-center
          rounded-md py-1.5 pl-8 pr-2 text-sm outline-none
          transition-colors
          focus:bg-surface-hover
        `,
        isDark 
          ? 'text-text-secondary focus:text-text-primary' 
          : 'text-zinc-700 focus:text-zinc-900',
        className
      )}
      {...props}
    >
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});

DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

// Dropdown Menu Radio Group
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

DropdownMenuRadioGroup.displayName = DropdownMenuPrimitive.RadioGroup.displayName;

// Dropdown Menu Radio Item
export interface DropdownMenuRadioItemProps {
  theme?: 'light' | 'dark';
  className?: string;
  value?: string;
  children?: React.ReactNode;
}

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  DropdownMenuRadioItemProps
>(({ className, theme = 'dark', value, children, ...props }, ref) => {
  const isDark = theme === 'dark';
  
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      value={value}
      className={cn(
        `
          relative flex cursor-default select-none items-center
          rounded-md py-1.5 pl-8 pr-2 text-sm outline-none
          transition-colors
          focus:bg-surface-hover
        `,
        isDark 
          ? 'text-text-secondary focus:text-text-primary' 
          : 'text-zinc-700 focus:text-zinc-900',
        className
      )}
      {...props}
    >
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
});

DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

// Dropdown Menu Label
export interface DropdownMenuLabelProps {
  theme?: 'light' | 'dark';
  className?: string;
  inset?: boolean;
}

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  DropdownMenuLabelProps
>(({ className, theme = 'dark', inset, ...props }, ref) => {
  const isDark = theme === 'dark';
  
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      className={cn(
        `
          px-2 py-1.5 text-xs font-semibold
        `,
        isDark 
          ? 'text-text-muted' 
          : 'text-zinc-500',
        inset && 'pl-8',
        className
      )}
      {...props}
    />
  );
});

DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

// Dropdown Menu Separator
const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      className={cn(
        '-mx-1 my-1 h-px',
        'bg-border',
        className
      )}
      {...props}
    />
  );
});

DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

// Dropdown Menu Shortcut
export interface DropdownMenuShortcutProps {
  className?: string;
  children?: React.ReactNode;
}

const DropdownMenuShortcut = ({ className, children }: DropdownMenuShortcutProps) => {
  return (
    <span
      className={cn(
        'ml-auto text-xs tracking-widest',
        'text-muted',
        className
      )}
    >
      {children}
    </span>
  );
};

DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

// Dropdown Menu Group
const DropdownMenuGroup = DropdownMenuPrimitive.Group;

DropdownMenuGroup.displayName = DropdownMenuPrimitive.Group.displayName;

// Dropdown Menu Sub
const DropdownMenuSub = DropdownMenuPrimitive.Sub;

DropdownMenuSub.displayName = DropdownMenuPrimitive.Sub.displayName;

// Dropdown Menu Sub Content
const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        `
          z-50 min-w-32 rounded-lg border shadow-xl
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          data-[side=bottom]:slide-in-from-top-2
          data-[side=left]:slide-in-from-right-2
          data-[side=right]:slide-in-from-left-2
          data-[side=top]:slide-in-from-bottom-2
        `,
        'bg-surface border-border',
        className
      )}
      {...props}
    />
  );
});

DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

// Dropdown Menu Sub Trigger
export interface DropdownMenuSubTriggerProps {
  theme?: 'light' | 'dark';
  className?: string;
  inset?: boolean;
  children?: React.ReactNode;
}

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  DropdownMenuSubTriggerProps
>(({ className, theme = 'dark', inset, children, ...props }, ref) => {
  const isDark = theme === 'dark';
  
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        `
          flex cursor-default select-none items-center
          rounded-md px-2 py-1.5 text-sm outline-none
          transition-colors
          focus:bg-surface-hover
          data-[state=open]:bg-surface-hover
        `,
        isDark 
          ? 'text-text-secondary focus:text-text-primary' 
          : 'text-zinc-700 focus:text-zinc-900',
        inset && 'pl-8',
        className
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto h-4 w-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
});

DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
};
