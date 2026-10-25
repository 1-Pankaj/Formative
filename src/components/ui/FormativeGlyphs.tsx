import React from 'react';

type GlyphProps = React.SVGProps<SVGSVGElement>;

const drawing: Record<string, string[]> = {
  activity: ['M2 10h3l2-5 3 10 2-5h6'],
  alert: ['M10 2.5a7.5 7.5 0 1 0 0 15a7.5 7.5 0 0 0 0-15', 'M10 6v4.5', 'M10 13.5h.01'],
  arrowLeft: ['M17 10H3', 'm9 4-6 6 6 6'],
  arrowLeftRight: ['M3 7h14', 'm13 3 4 4-4 4', 'M17 13H3', 'm7 9-4 4 4 4'],
  arrowRight: ['M3 10h14', 'm11 4 6 6-6 6'],
  book: ['M2.5 4.5h5a2.5 2.5 0 0 1 2.5 2.5v9a2.5 2.5 0 0 0-2.5-2.5h-5z', 'M17.5 4.5h-5A2.5 2.5 0 0 0 10 7v9a2.5 2.5 0 0 1 2.5-2.5h5z'],
  bot: ['M4 6h12v10H4z', 'M10 3v3', 'M7 10h.01', 'M13 10h.01', 'M7.5 13h5'],
  brain: ['M10 3a3 3 0 0 0-5 2 3.5 3.5 0 0 0-1 6 3 3 0 0 0 3 5h3z', 'M10 3a3 3 0 0 1 5 2 3.5 3.5 0 0 1 1 6 3 3 0 0 1-3 5h-3z', 'M10 5v10'],
  building: ['M3 17V4h9v13', 'M12 8h5v9', 'M1.5 17h17', 'M6 7h.01', 'M9 7h.01', 'M6 10h.01', 'M9 10h.01', 'M6 13h.01', 'M9 13h.01', 'M14 11h.01', 'M14 14h.01'],
  check: ['m4 10 4 4 8-8'],
  checkBadge: ['M10 2.5a7.5 7.5 0 1 0 0 15a7.5 7.5 0 0 0 0-15', 'm6.5 10 2.3 2.3 4.8-4.8'],
  chevronDown: ['m5 7 5 5 5-5'],
  chevronLeft: ['m12.5 4-6 6 6 6'],
  chevronRight: ['m7.5 4 6 6-6 6'],
  chevronUp: ['m5 12 5-5 5 5'],
  circle: ['M10 2.5a7.5 7.5 0 1 0 0 15a7.5 7.5 0 0 0 0-15'],
  circleDot: ['M10 2.5a7.5 7.5 0 1 0 0 15a7.5 7.5 0 0 0 0-15', 'M10 8.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3'],
  clock: ['M10 2.5a7.5 7.5 0 1 0 0 15a7.5 7.5 0 0 0 0-15', 'M10 5v5l3 2'],
  code: ['m7 5-5 5 5 5', 'm13 5 5 5-5 5', 'm11.5 3-3 14'],
  copy: ['M7 6V3h10v11h-3', 'M3 6h10v11H3z'],
  cpu: ['M5 5h10v10H5z', 'M8 8h4v4H8z', 'M7 2v3', 'M10 2v3', 'M13 2v3', 'M7 15v3', 'M10 15v3', 'M13 15v3', 'M2 7h3', 'M2 10h3', 'M2 13h3', 'M15 7h3', 'M15 10h3', 'M15 13h3'],
  crown: ['m2 7 4 3 4-6 4 6 4-3-2 9H4z', 'M5 13h10'],
  database: ['M3 5c0-1.4 3.1-2.5 7-2.5S17 3.6 17 5s-3.1 2.5-7 2.5S3 6.4 3 5z', 'M3 5v10c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V5', 'M3 10c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5'],
  external: ['M10 4h6v6', 'm16 4-8 8', 'M14 12v4H4V6h4'],
  file: ['M5 2.5h7l4 4V17H5z', 'M12 2.5v4h4', 'M7.5 10h6', 'M7.5 13h6'],
  fileCode: ['M5 2.5h7l4 4V17H5z', 'M12 2.5v4h4', 'm8 9-2 2 2 2', 'm12 9 2 2-2 2'],
  filter: ['M3 4h14l-5.5 6v5l-3 1v-6z'],
  folder: ['M2.5 5h6l1.5 2h7v9h-14z', 'M2.5 8h14'],
  folderTree: ['M3 4h5l1.5 2h7v5H3z', 'M10 11v3', 'M6 14v3', 'M14 14v3', 'M4.5 17h3', 'M12.5 17h3'],
  globe: ['M10 2.5a7.5 7.5 0 1 0 0 15a7.5 7.5 0 0 0 0-15', 'M2.8 10h14.4', 'M10 2.7c2 2 3 4.4 3 7.3s-1 5.3-3 7.3c-2-2-3-4.4-3-7.3s1-5.3 3-7.3'],
  help: ['M10 2.5a7.5 7.5 0 1 0 0 15a7.5 7.5 0 0 0 0-15', 'M7.8 7.5a2.3 2.3 0 1 1 3.8 1.7c-1 .8-1.6 1.2-1.6 2.3', 'M10 14h.01'],
  history: ['M3 5v4h4', 'M3.5 8A6.5 6.5 0 1 1 4 13', 'M10 6v4l2.5 1.5'],
  home: ['M2.5 9 10 3l7.5 6', 'M4.5 8v9h11V8', 'M8 17v-5h4v5'],
  info: ['M10 2.5a7.5 7.5 0 1 0 0 15a7.5 7.5 0 0 0 0-15', 'M10 9v5', 'M10 6h.01'],
  layers: ['m2.5 7 7.5-4 7.5 4-7.5 4z', 'm2.5 10 7.5 4 7.5-4', 'm2.5 13 7.5 4 7.5-4'],
  layout: ['M3 3h14v14H3z', 'M3 8h14', 'M8 8v9'],
  lightbulb: ['M6 8a4 4 0 1 1 8 0c0 1.5-.8 2.6-1.8 3.6-.7.7-1.2 1.3-1.2 2.4h-2c0-1.1-.5-1.7-1.2-2.4C6.8 10.6 6 9.5 6 8z', 'M9 16h2', 'M9 18h2'],
  list: ['M6 5h11', 'M6 10h11', 'M6 15h11', 'M3 5h.01', 'M3 10h.01', 'M3 15h.01'],
  listChecks: ['m2.5 5 1.3 1.3L6 4', 'M8 5h9', 'm2.5 10 1.3 1.3L6 9', 'M8 10h9', 'm2.5 15 1.3 1.3L6 14', 'M8 15h9'],
  loader: ['M10 2.5a7.5 7.5 0 0 1 7.5 7.5'],
  maximize: ['M3 7V3h4', 'M13 3h4v4', 'M17 13v4h-4', 'M7 17H3v-4', 'm3 7 5-5', 'm12 2 5 5', 'm17 13-5 5', 'm8 18-5-5'],
  message: ['M3 3.5h14v10H8l-5 3z', 'M6 7h8', 'M6 10h5'],
  moon: ['M13.5 3A7 7 0 0 0 17 15.5 7.5 7.5 0 1 1 13.5 3z'],
  mouse: ['M10 2.5v15', 'M10 2.5 4 9l6 8.5L16 9z', 'M10 7l3 3'],
  network: ['M3 4h5v4H3z', 'M12 4h5v4h-5z', 'M7.5 12h5v4h-5z', 'M5.5 8v2h7V8', 'M10 10v2'],
  paperclip: ['m7 10 5-5a3 3 0 0 1 4 4l-7 7a4 4 0 0 1-6-6l7-7'],
  plus: ['M10 3v14', 'M3 10h14'],
  refresh: ['M16 7V3l-3 3', 'M16 6a6.5 6.5 0 0 0-11 2', 'M4 13v4l3-3', 'M4 14a6.5 6.5 0 0 0 11-2'],
  save: ['M3 3h12l2 2v12H3z', 'M6 3v5h7V3', 'M6 17v-6h8v6'],
  search: ['M8.5 3a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11', 'm12.5 12.5 5 5'],
  send: ['M2.5 9.5 17 3l-4.5 14-3-5z', 'M9.5 12 17 3'],
  server: ['M3 3h14v5H3z', 'M3 12h14v5H3z', 'M6 5.5h.01', 'M6 14.5h.01', 'M9 5.5h5', 'M9 14.5h5'],
  settings: ['M10 3v2', 'M10 15v2', 'M3 10h2', 'M15 10h2', 'M5.1 5.1l1.4 1.4', 'm13.5 13.5 1.4 1.4', 'm14.9 5.1-1.4 1.4', 'm6.5 13.5-1.4 1.4', 'M10 6.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7'],
  shield: ['M10 2.5 16 5v4.5c0 3.7-2.4 6.4-6 8-3.6-1.6-6-4.3-6-8V5z'],
  smartphone: ['M5 2.5h10v15H5z', 'M8 5h4', 'M9 14.5h2'],
  sparkle: ['m10 2 1.6 5.4L17 9l-5.4 1.6L10 16l-1.6-5.4L3 9l5.4-1.6z', 'm16 13 .8 2.2L19 16l-2.2.8L16 19l-.8-2.2L13 16l2.2-.8z'],
  square: ['M3 3h14v14H3z'],
  tag: ['m3 3 8 0 6 6-8 8-6-6z', 'M7 7h.01'],
  terminal: ['M3 5l4 4-4 4', 'M9 14h7'],
  trash: ['M4 6h12', 'M7 6V4h6v2', 'M5.5 6l.7 11h7.6l.7-11', 'M8 9v5', 'M12 9v5'],
  unlink: ['M7 7 5.5 5.5a3 3 0 0 0-4 4L4 12', 'm13 13 1.5 1.5a3 3 0 0 0 4-4L16 12', 'm7 13 6-6', 'm8 5 2-2a3 3 0 0 1 4 0', 'm12 15-2 2a3 3 0 0 1-4 0'],
  user: ['M10 10a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7', 'M3 17a7 7 0 0 1 14 0'],
  wrench: ['m13 6 3-3a5 5 0 0 1-6 6l-6.5 6.5a2 2 0 0 1-3-3L7 6a5 5 0 0 1 6-6', 'M5 14l2 2'],
  x: ['M4 4l12 12', 'M16 4 4 16'],
  zap: ['m11 2-7 9h5l-1 7 8-10h-5z'],
};

const aliases: Record<string, string> = {
  Activity: 'activity',
  AlertCircle: 'alert', CircleAlert: 'alert',
  ArrowLeft: 'arrowLeft', ArrowLeftRight: 'arrowLeftRight', ArrowRight: 'arrowRight',
  BookOpen: 'book',
  Bot: 'bot',
  Brain: 'brain', BrainCircuit: 'brain',
  Building2: 'building',
  Check: 'check', CheckCircle2: 'checkBadge', ShieldCheck: 'checkBadge',
  ChevronDown: 'chevronDown', ChevronLeft: 'chevronLeft', ChevronRight: 'chevronRight', ChevronUp: 'chevronUp',
  Circle: 'circle', CircleDot: 'circleDot',
  Clock: 'clock',
  Code: 'code', Code2: 'code', FileCode: 'fileCode', FileCode2: 'fileCode',
  Copy: 'copy', Cpu: 'cpu', Crown: 'crown', Database: 'database',
  ExternalLink: 'external',
  FileText: 'file', FileSearch: 'file',
  Filter: 'filter', Folder: 'folder', FolderGit2: 'folder', FolderOpen: 'folder', FolderTree: 'folderTree',
  Globe: 'globe', HelpCircle: 'help', Info: 'info', History: 'history', Home: 'home',
  Layers: 'layers', Layout: 'layout', LayoutGrid: 'layout',
  Lightbulb: 'lightbulb', List: 'list', ListChecks: 'listChecks', LoaderCircle: 'loader',
  Maximize2: 'maximize', MessageSquare: 'message', MessageSquareText: 'message', Moon: 'moon',
  MousePointer: 'mouse', Navigation: 'network', Network: 'network', Paperclip: 'paperclip', Plus: 'plus', RefreshCw: 'refresh',
  Save: 'save', Search: 'search', Send: 'send', Server: 'server', Settings: 'settings', Sliders: 'settings',
  Share2: 'external', Shield: 'shield', Smartphone: 'smartphone', Sparkles: 'sparkle', Square: 'square',
  StickyNote: 'file', Sun: 'sparkle', Tag: 'tag', Terminal: 'terminal', Trash2: 'trash', Unlink: 'unlink',
  Unplug: 'unlink', User: 'user', Workflow: 'network', Wrench: 'wrench', X: 'x', Zap: 'zap', Boxes: 'layers',
};

function createGlyph(name: string) {
  const Glyph = React.forwardRef<SVGSVGElement, GlyphProps>((props, ref) => {
    const { className = '', ...rest } = props;
    const paths = drawing[aliases[name]] || drawing.file;
    return (
      <svg
        {...rest}
        ref={ref}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="square"
        strokeLinejoin="miter"
        className={`formative-glyph ${className}`.trim()}
        focusable="false"
      >
        {paths.map((d, index) => <path key={index} d={d} />)}
      </svg>
    );
  });
  Glyph.displayName = `FormativeGlyph${name}`;
  return Glyph;
}

export const Activity = createGlyph('Activity');
export const AlertCircle = createGlyph('AlertCircle');
export const ArrowLeft = createGlyph('ArrowLeft');
export const ArrowLeftRight = createGlyph('ArrowLeftRight');
export const ArrowRight = createGlyph('ArrowRight');
export const BookOpen = createGlyph('BookOpen');
export const Bot = createGlyph('Bot');
export const Boxes = createGlyph('Boxes');
export const Brain = createGlyph('Brain');
export const BrainCircuit = createGlyph('BrainCircuit');
export const Building2 = createGlyph('Building2');
export const Check = createGlyph('Check');
export const CheckCircle2 = createGlyph('CheckCircle2');
export const ChevronDown = createGlyph('ChevronDown');
export const ChevronLeft = createGlyph('ChevronLeft');
export const ChevronRight = createGlyph('ChevronRight');
export const ChevronUp = createGlyph('ChevronUp');
export const Circle = createGlyph('Circle');
export const CircleAlert = createGlyph('CircleAlert');
export const CircleDot = createGlyph('CircleDot');
export const Clock = createGlyph('Clock');
export const Code = createGlyph('Code');
export const Code2 = createGlyph('Code2');
export const Copy = createGlyph('Copy');
export const Cpu = createGlyph('Cpu');
export const Crown = createGlyph('Crown');
export const Database = createGlyph('Database');
export const ExternalLink = createGlyph('ExternalLink');
export const FileCode = createGlyph('FileCode');
export const FileCode2 = createGlyph('FileCode2');
export const FileSearch = createGlyph('FileSearch');
export const FileText = createGlyph('FileText');
export const Filter = createGlyph('Filter');
export const Folder = createGlyph('Folder');
export const FolderGit2 = createGlyph('FolderGit2');
export const FolderOpen = createGlyph('FolderOpen');
export const FolderTree = createGlyph('FolderTree');
export const Globe = createGlyph('Globe');
export const HelpCircle = createGlyph('HelpCircle');
export const History = createGlyph('History');
export const Home = createGlyph('Home');
export const Info = createGlyph('Info');
export const Layers = createGlyph('Layers');
export const Layout = createGlyph('Layout');
export const LayoutGrid = createGlyph('LayoutGrid');
export const Lightbulb = createGlyph('Lightbulb');
export const List = createGlyph('List');
export const ListChecks = createGlyph('ListChecks');
export const LoaderCircle = createGlyph('LoaderCircle');
export const Maximize2 = createGlyph('Maximize2');
export const MessageSquare = createGlyph('MessageSquare');
export const MessageSquareText = createGlyph('MessageSquareText');
export const Moon = createGlyph('Moon');
export const MousePointer = createGlyph('MousePointer');
export const Navigation = createGlyph('Navigation');
export const Network = createGlyph('Network');
export const Paperclip = createGlyph('Paperclip');
export const Plus = createGlyph('Plus');
export const RefreshCw = createGlyph('RefreshCw');
export const Save = createGlyph('Save');
export const Search = createGlyph('Search');
export const Send = createGlyph('Send');
export const Server = createGlyph('Server');
export const Settings = createGlyph('Settings');
export const Share2 = createGlyph('Share2');
export const Shield = createGlyph('Shield');
export const ShieldCheck = createGlyph('ShieldCheck');
export const Sliders = createGlyph('Sliders');
export const Smartphone = createGlyph('Smartphone');
export const Sparkles = createGlyph('Sparkles');
export const Square = createGlyph('Square');
export const StickyNote = createGlyph('StickyNote');
export const Sun = createGlyph('Sun');
export const Tag = createGlyph('Tag');
export const Terminal = createGlyph('Terminal');
export const Trash2 = createGlyph('Trash2');
export const Unlink = createGlyph('Unlink');
export const Unplug = createGlyph('Unplug');
export const User = createGlyph('User');
export const Workflow = createGlyph('Workflow');
export const Wrench = createGlyph('Wrench');
export const X = createGlyph('X');
export const Zap = createGlyph('Zap');
