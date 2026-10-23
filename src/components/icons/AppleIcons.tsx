/**
 * Formative Studio - Apple SF Symbols Inspired Icons
 * 
 * Custom SVG icons designed to match Apple's SF Symbols aesthetic
 * - Clean, geometric shapes
 * - Consistent 2px stroke width
 * - Rounded caps and joins
 * - Designed for 20x20, 24x24, 28x28 sizes
 * 
 * These replace Lucide icons to achieve a more native, professional look
 * that doesn't feel "AI-generated" or "vibecoded"
 */

import React from 'react';

// ============================================================================
// ICON PROPS
// ============================================================================

interface IconProps {
  size?: number | string;
  className?: string;
  strokeWidth?: number;
  fill?: string;
  color?: string;
  opacity?: number;
}

// Default icon props
const defaultIconProps = {
  size: 20,
  strokeWidth: 2,
  fill: 'none',
  opacity: 1,
};

// ============================================================================
// BASE ICON COMPONENT
// ============================================================================

/**
 * Base icon component with consistent styling
 * Matches Apple SF Symbols style: geometric, clean, professional
 */
export const Icon: React.FC<IconProps & { children: React.ReactNode }> = ({
  size = 20,
  className = '',
  strokeWidth = 2,
  fill = 'none',
  color = 'currentColor',
  opacity = 1,
  children,
}) => {
  const sizeValue = typeof size === 'number' ? `${size}px` : size;
  
  return (
    <svg
      width={sizeValue}
      height={sizeValue}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ opacity, display: 'inline-block', verticalAlign: 'middle' }}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
};

// ============================================================================
// NAVIGATION & LAYOUT ICONS
// ============================================================================

/** Layers icon - Stacked squares (Architecture/Design) */
export const LayersIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </Icon>
);

/** Grid icon - 2x2 grid (Dashboard/Overview) */
export const GridIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </Icon>
);

/** List icon - Horizontal lines (List view) */
export const ListIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </Icon>
);

/** Plus icon - Add/Create */
export const PlusIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Icon>
);

/** X icon - Close/Remove */
export const XIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);

/** Chevron Down - Expand/Collapse */
export const ChevronDownIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="6,9 12,15 18,9" />
  </Icon>
);

/** Chevron Up - Expand/Collapse */
export const ChevronUpIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="6,15 12,9 18,15" />
  </Icon>
);

/** Chevron Right - Navigation */
export const ChevronRightIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="9,6 15,12 9,18" />
  </Icon>
);

/** Chevron Left - Navigation */
export const ChevronLeftIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="15,6 9,12 15,18" />
  </Icon>
);

/** Search icon - Magnifying glass */
export const SearchIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);

/** Settings icon - Gear */
export const SettingsIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16a1 1 0 0 1-1-1V9a1 1 0 0 1 2 0v1a1 1 0 0 1-1 1c0 .55.45 1 1 1s1-.45 1-1V11a1 1 0 0 1-1-1h-1a1 1 0 0 1-1-1 1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1 1 1 0 0 0-1 1v2a1 1 0 0 1-1 1z" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </Icon>
);

/** Help icon - Question mark in circle */
export const HelpIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </Icon>
);

// ============================================================================
// FILE & FOLDER ICONS
// ============================================================================

/** Folder icon - Open folder */
export const FolderIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </Icon>
);

/** Folder Open icon */
export const FolderOpenIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l3 3h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2z" />
  </Icon>
);

/** File icon - Document */
export const FileIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13,2 13,9 20,9" />
  </Icon>
);

/** File Text icon - Text document */
export const FileTextIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </Icon>
);

/** Code icon - Code/file */
export const CodeIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="16,18 22,12 16,6" />
    <polyline points="8,6 2,12 8,18" />
  </Icon>
);

/** Database icon */
export const DatabaseIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <ellipse cx="12" cy="6" rx="8" ry="3" />
    <ellipse cx="12" cy="18" rx="5" ry="2" />
    <path d="M12 6v6M12 18v-6" />
  </Icon>
);

// ============================================================================
// TECHNOLOGY & AI ICONS
// ============================================================================

/** Bot icon - AI/Robot */
export const BotIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </Icon>
);

/** Sparkles icon - Magic/AI */
export const SparklesIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="m12 3-2.25 6.75L12 15l2.25-6.75z" />
    <path d="M12 9l2.25 6.75L12 21l-2.25-6.75z" />
    <path d="M12 15l2.25-6.75L12 3l-2.25 6.75z" />
    <path d="M12 21l2.25-6.75L12 9l-2.25 6.75z" />
    <path d="M3 12h1.5l6.75-2.25L12 12l6.75 2.25L21 12h-1.5l-6.75 2.25L12 12l-6.75-2.25z" />
  </Icon>
);

/** Network icon - Server/Backend */
export const NetworkIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="2" y="10" width="8" height="8" rx="1" />
    <rect x="14" y="10" width="8" height="8" rx="1" />
    <circle cx="6" cy="6" r="2" />
    <circle cx="18" cy="6" r="2" />
    <line x1="6" y1="8" x2="6" y2="10" />
    <line x1="18" y1="8" x2="18" y2="10" />
    <line x1="10" y1="14" x2="14" y2="14" />
  </Icon>
);

/** Server icon - Backend */
export const ServerIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="2" y="2" width="20" height="8" rx="1" />
    <rect x="2" y="14" width="20" height="8" rx="1" />
    <circle cx="6" cy="6" r="1" />
    <circle cx="6" cy="18" r="1" />
    <circle cx="18" cy="6" r="1" />
    <circle cx="18" cy="18" r="1" />
  </Icon>
);

/** Terminal icon - Command line */
export const TerminalIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="8" y1="9" x2="16" y2="9" />
    <line x1="8" y1="13" x2="14" y2="13" />
    <line x1="8" y1="17" x2="12" y2="17" />
  </Icon>
);

/** Zap icon - Lightning/Energy */
export const ZapIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
  </Icon>
);

// ============================================================================
// NODE TYPE ICONS (Formative-specific)
// ============================================================================

/** Architecture icon - Building/Structure */
export const ArchitectureIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="2" y="10" width="4" height="10" rx="1" />
    <rect x="8" y="6" width="4" height="14" rx="1" />
    <rect x="14" y="10" width="4" height="10" rx="1" />
    <path d="M6 10h2M12 6h2M18 10h2" />
    <path d="M12 2v4" />
  </Icon>
);

/** AI Step icon - Processing node */
export const AIStepIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8M8 12h8" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

/** Data icon - Database/Storage */
export const DataIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 2v20M2 12h20" />
    <path d="M4.5 4.5c2.5-2.5 7.5-2.5 10 0s7.5 2.5 10 0" />
    <path d="M4.5 19.5c2.5 2.5 7.5 2.5 10 0s7.5-2.5 10 0" />
  </Icon>
);

/** Note icon - Documentation */
export const NoteIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="8" y1="7" x2="16" y2="7" />
    <line x1="8" y1="11" x2="14" y2="11" />
    <line x1="8" y1="15" x2="12" y2="15" />
  </Icon>
);

/** External Link icon */
export const ExternalLinkIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15,3 21,3 21,9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </Icon>
);

/** Crown icon - Premium/Pro */
export const CrownIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M18 8h1a4 4 0 0 1 0 8h-1M6 8h1a4 4 0 0 0 0 8h-1M9 12l-2 2-2-2 2-2 2 2zM15 12l2 2 2-2-2-2-2 2z" />
  </Icon>
);

/** Book Open icon - Templates */
export const BookOpenIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 2v18l-4-4 4-4" />
    <path d="M20 2v18L4 18l16-16z" />
  </Icon>
);

/** Trash icon - Delete */
export const TrashIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icon>
);

/** Arrow Right icon */
export const ArrowRightIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12,5 19,12 12,19" />
  </Icon>
);

/** Book icon - Library */
export const BookIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2h11A2.5 2.5 0 0 1 20 4.5v15" />
    <path d="M4 12h16" />
  </Icon>
);

/** Edit icon - Pencil */
export const EditIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Icon>
);

/** Edit2 icon - Alternative pencil */
export const Edit2Icon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </Icon>
);

/** Eye icon - Visibility */
export const EyeIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

/** Eye Off icon - Hidden */
export const EyeOffIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </Icon>
);

/** Copy icon - Duplicate */
export const CopyIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
);

/** Check icon - Success/Complete */
export const CheckIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polyline points="20,6 9,17 4,12" />
  </Icon>
);

/** Clock icon - Time/History */
export const ClockIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </Icon>
);

/** Calendar icon - Date */
export const CalendarIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="14" x2="8" y2="18" />
    <line x1="16" y1="14" x2="16" y2="18" />
  </Icon>
);

/** User icon - Profile */
export const UserIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

/** Users icon - Team */
export const UsersIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Icon>
);

/** Bell icon - Notifications */
export const BellIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Icon>
);

/** Moon icon - Dark mode */
export const MoonIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Icon>
);

/** Sun icon - Light mode */
export const SunIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </Icon>
);

/** Star icon - Favorite */
export const StarIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Icon>
);

/** Star Off icon - Not favorited */
export const StarOffIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </Icon>
);

// ============================================================================
// STATUS ICONS
// ============================================================================

/** Play icon - Start/Run */
export const PlayIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <polygon points="5,3 19,12 5,21" />
  </Icon>
);

/** Pause icon - Stop/Pause */
export const PauseIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </Icon>
);

/** Stop icon - Halt */
export const StopIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <rect x="6" y="6" width="12" height="12" />
  </Icon>
);

/** Refresh icon - Reload */
export const RefreshIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </Icon>
);

/** Sync icon - Synchronize */
export const SyncIcon: React.FC<IconProps> = (props) => (
  <Icon {...props}>
    <path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z" />
    <path d="M12 3a9 9 0 0 0 9 9 9 9 0 0 0-9-9z" />
  </Icon>
);

/** Loading spinner */
export const SpinnerIcon: React.FC<IconProps & { spinning?: boolean }> = ({
  spinning = true,
  ...props
}) => (
  <Icon {...props}>
    <circle
      cx="12"
      cy="12"
      r="10"
      strokeDasharray="60 140"
      style={spinning ? { animation: 'spin 1s linear infinite' } : undefined}
    />
  </Icon>
);

// ============================================================================
// EXPORT ALL ICONS
// ============================================================================

export const Icons = {
  // Navigation
  Layers: LayersIcon,
  Grid: GridIcon,
  List: ListIcon,
  Plus: PlusIcon,
  X: XIcon,
  ChevronDown: ChevronDownIcon,
  ChevronUp: ChevronUpIcon,
  ChevronRight: ChevronRightIcon,
  ChevronLeft: ChevronLeftIcon,
  Search: SearchIcon,
  Settings: SettingsIcon,
  Help: HelpIcon,
  
  // File
  Folder: FolderIcon,
  FolderOpen: FolderOpenIcon,
  File: FileIcon,
  FileText: FileTextIcon,
  Code: CodeIcon,
  Database: DatabaseIcon,
  
  // Tech & AI
  Bot: BotIcon,
  Sparkles: SparklesIcon,
  Network: NetworkIcon,
  Server: ServerIcon,
  Terminal: TerminalIcon,
  Zap: ZapIcon,
  
  // Node types
  Architecture: ArchitectureIcon,
  AIStep: AIStepIcon,
  Data: DataIcon,
  Note: NoteIcon,
  
  // Actions
  ExternalLink: ExternalLinkIcon,
  Crown: CrownIcon,
  BookOpen: BookOpenIcon,
  Trash: TrashIcon,
  ArrowRight: ArrowRightIcon,
  Book: BookIcon,
  Edit: EditIcon,
  Edit2: Edit2Icon,
  Eye: EyeIcon,
  EyeOff: EyeOffIcon,
  Copy: CopyIcon,
  Check: CheckIcon,
  Clock: ClockIcon,
  Calendar: CalendarIcon,
  User: UserIcon,
  Users: UsersIcon,
  Bell: BellIcon,
  Moon: MoonIcon,
  Sun: SunIcon,
  Star: StarIcon,
  StarOff: StarOffIcon,
  
  // Status
  Play: PlayIcon,
  Pause: PauseIcon,
  Stop: StopIcon,
  Refresh: RefreshIcon,
  Sync: SyncIcon,
  Spinner: SpinnerIcon,
} as const;

export default Icons;
