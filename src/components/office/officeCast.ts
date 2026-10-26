import { OfficeDepartment, OfficeHairStyle, OfficeMemberProfile, ProjectOfficeConfig, ProjectOfficeTeam, SkillDepartment } from '../../types';
import type { AgentProviderId } from '../../types/agentRuns';

export type RGB = [number, number, number];
export type HairStyle = 'short' | 'curly' | 'bald' | 'buzz' | 'ponytail' | 'messy' | 'long' | 'bun' | 'cap' | string;

export interface CharacterRecipe {
  name: string;
  role: string;
  skin: string;
  hairStyle: HairStyle;
  hairColor: RGB;
  clothColor: RGB;
  tieColor?: RGB;
  pantsColor: RGB;
}

export type EmployeeRole = 
  | 'ceo'            // Chief Executive Agent (Core Orchestrator, Single Agent Hub)
  | 'frontend'       // Frontend & UI/UX Specialist
  | 'backend'        // Systems & Backend Specialist
  | 'qa'             // QA & DevOps Specialist
  | 'database'       // Data & Persistence Specialist
  | 'mobile'         // Mobile App Specialist
  | 'devops'         // Cloud & Infrastructure Specialist
  | 'design'         // Product & Visual Designer
  | 'security'       // Security & Compliance
  | 'ai'             // AI, ML & Prompt Engineer
  | 'docs'           // Technical Documentation
  | 'analytics';     // Telemetry & Performance

export interface OfficeEmployee {
  id: string;
  name: string;
  role: EmployeeRole;
  roleTitle: string;
  deskIndex: number;
  seatSpawnName: string;
  recipe: CharacterRecipe;
  currentAction?: string;
  status: 'idle' | 'working' | 'thinking' | 'break' | 'done';
  speechBubble?: {
    text: string;
    expiresAt: number;
  };
  deskPosition: { x: number; y: number };
  associatedSkills?: string[];
}

/** The CEO is the default single agent present in every office on startup. */
export const CEO_EMPLOYEE: OfficeEmployee = {
  id: 'emp-ceo',
  name: 'Chief Executive Agent',
  role: 'ceo',
  roleTitle: 'Core Single-Agent Orchestrator',
  deskIndex: 0,
  seatSpawnName: 'desk-ceo',
  deskPosition: { x: 64, y: 96 },
  status: 'idle',
  recipe: {
    name: 'Executive',
    role: 'Chief Executive Agent',
    skin: 'light',
    hairStyle: 'short',
    hairColor: [40, 35, 30],
    clothColor: [24, 25, 32],
    tieColor: [224, 68, 24], // Formative ember tie
    pantsColor: [28, 29, 36]
  },
  associatedSkills: ['Task Planning', 'Context Routing', 'Tool Orchestration', 'Code Synthesis']
};

/** Modular Specialist Skills. */
export const SPECIALIST_REGISTRY: Record<SkillDepartment, OfficeEmployee> = {
  frontend: {
    id: 'emp-frontend',
    name: 'Elena Vance',
    role: 'frontend',
    roleTitle: 'Frontend & UI/UX Specialist',
    deskIndex: 1,
    seatSpawnName: 'pc-1',
    deskPosition: { x: 48, y: 192 },
    status: 'idle',
    recipe: {
      name: 'Elena',
      role: 'UI/UX Specialist',
      skin: 'tan',
      hairStyle: 'ponytail',
      hairColor: [45, 35, 30],
      clothColor: [40, 75, 120],
      tieColor: [224, 68, 24],
      pantsColor: [40, 42, 50]
    },
    associatedSkills: ['Tailwind CSS', 'React Components', 'Visual Design Polish', 'Animation & Motion', 'Accessibility']
  },
  backend: {
    id: 'emp-backend',
    name: 'Marcus Chen',
    role: 'backend',
    roleTitle: 'Systems & Backend Specialist',
    deskIndex: 2,
    seatSpawnName: 'pc-2',
    deskPosition: { x: 112, y: 192 },
    status: 'idle',
    recipe: {
      name: 'Marcus',
      role: 'Systems Engineer',
      skin: 'light',
      hairStyle: 'messy',
      hairColor: [30, 28, 25],
      clothColor: [35, 110, 85],
      pantsColor: [50, 50, 60]
    },
    associatedSkills: ['API Routes', 'Node/Python Services', 'File I/O', 'WebSockets', 'Network Architecture']
  },
  qa: {
    id: 'emp-qa',
    name: 'Aria Sterling',
    role: 'qa',
    roleTitle: 'QA, Test & DevOps Lead',
    deskIndex: 3,
    seatSpawnName: 'pc-3',
    deskPosition: { x: 176, y: 192 },
    status: 'idle',
    recipe: {
      name: 'Aria',
      role: 'QA & DevOps Lead',
      skin: 'light',
      hairStyle: 'long',
      hairColor: [140, 70, 35],
      clothColor: [90, 50, 110],
      pantsColor: [45, 45, 55]
    },
    associatedSkills: ['Unit Testing', 'E2E Testing', 'Build Verification', 'Terminal Commands', 'Linting & Static Analysis']
  },
  database: {
    id: 'emp-database',
    name: 'Darius Thorne',
    role: 'database',
    roleTitle: 'Data & Schema Architect',
    deskIndex: 4,
    seatSpawnName: 'pc-4',
    deskPosition: { x: 240, y: 192 },
    status: 'idle',
    recipe: {
      name: 'Darius',
      role: 'Data Architect',
      skin: 'dark',
      hairStyle: 'buzz',
      hairColor: [20, 20, 20],
      clothColor: [130, 80, 40],
      tieColor: [40, 40, 45],
      pantsColor: [40, 40, 45]
    },
    associatedSkills: ['SQL & Schema Design', 'ORM Migrations', 'State Persistence', 'Redis Caching', 'Vector Embeddings']
  },
  mobile: {
    id: 'emp-mobile',
    name: 'Devon Vance',
    role: 'mobile',
    roleTitle: 'Mobile App Architect',
    deskIndex: 5,
    seatSpawnName: 'pc-5',
    deskPosition: { x: 304, y: 192 },
    status: 'idle',
    recipe: {
      name: 'Devon',
      role: 'Mobile Architect',
      skin: 'tan',
      hairStyle: 'short',
      hairColor: [35, 30, 28],
      clothColor: [14, 165, 233],
      pantsColor: [30, 41, 59]
    },
    associatedSkills: ['React Native', 'Expo SDK', 'Android Gradle', 'iOS Swift', 'Gesture Animations', 'Native Modules']
  },
  devops: {
    id: 'emp-devops',
    name: 'Nate Sterling',
    role: 'devops',
    roleTitle: 'Cloud & Infrastructure SRE',
    deskIndex: 6,
    seatSpawnName: 'pc-6',
    deskPosition: { x: 48, y: 256 },
    status: 'idle',
    recipe: {
      name: 'Nate',
      role: 'Cloud SRE',
      skin: 'light',
      hairStyle: 'cap',
      hairColor: [50, 40, 30],
      clothColor: [71, 85, 105],
      pantsColor: [30, 41, 59]
    },
    associatedSkills: ['Docker', 'CI/CD Pipelines', 'AWS/Cloudflare', 'Kubernetes', 'Environment Secrets', 'Terraform']
  },
  design: {
    id: 'emp-design',
    name: 'Maya Lin',
    role: 'design',
    roleTitle: 'Product & Visual Designer',
    deskIndex: 7,
    seatSpawnName: 'pc-7',
    deskPosition: { x: 112, y: 256 },
    status: 'idle',
    recipe: {
      name: 'Maya',
      role: 'Product Designer',
      skin: 'light',
      hairStyle: 'bun',
      hairColor: [30, 25, 25],
      clothColor: [225, 29, 72],
      pantsColor: [38, 38, 38]
    },
    associatedSkills: ['Design Systems', 'Figma Tokens', 'Micro-interactions', 'Typography', 'Iconography', 'User Research']
  },
  security: {
    id: 'emp-security',
    name: 'Zane Malik',
    role: 'security',
    roleTitle: 'Security & Cryptography Lead',
    deskIndex: 8,
    seatSpawnName: 'pc-8',
    deskPosition: { x: 176, y: 256 },
    status: 'idle',
    recipe: {
      name: 'Zane',
      role: 'Security Specialist',
      skin: 'dark',
      hairStyle: 'curly',
      hairColor: [20, 20, 25],
      clothColor: [15, 23, 42],
      pantsColor: [15, 23, 42]
    },
    associatedSkills: ['Authentication & RBAC', 'OWASP Hardening', 'Audit Trails', 'Pen-Testing', 'Data Sanitization']
  },
  ai: {
    id: 'emp-ai',
    name: 'Sora Takahashi',
    role: 'ai',
    roleTitle: 'AI & LLM Systems Engineer',
    deskIndex: 9,
    seatSpawnName: 'pc-9',
    deskPosition: { x: 240, y: 256 },
    status: 'idle',
    recipe: {
      name: 'Sora',
      role: 'AI Engineer',
      skin: 'light',
      hairStyle: 'messy',
      hairColor: [147, 51, 234],
      clothColor: [88, 28, 135],
      pantsColor: [24, 24, 27]
    },
    associatedSkills: ['Prompt Engineering', 'LangChain/LlamaIndex', 'RAG Pipelines', 'Vector Databases', 'DSPy Optimization']
  },
  docs: {
    id: 'emp-docs',
    name: 'Kavita Rao',
    role: 'docs',
    roleTitle: 'Technical Writer & Docs Lead',
    deskIndex: 10,
    seatSpawnName: 'pc-10',
    deskPosition: { x: 304, y: 256 },
    status: 'idle',
    recipe: {
      name: 'Kavita',
      role: 'Technical Writer',
      skin: 'tan',
      hairStyle: 'long',
      hairColor: [40, 25, 20],
      clothColor: [79, 70, 229],
      pantsColor: [30, 27, 75]
    },
    associatedSkills: ['API References', 'System Architecture Specs', 'Release Notes', 'Interactive Guides', 'Markdown/MDX']
  },
  analytics: {
    id: 'emp-analytics',
    name: 'Chloe Bennett',
    role: 'analytics',
    roleTitle: 'Performance & Telemetry Specialist',
    deskIndex: 11,
    seatSpawnName: 'pc-11',
    deskPosition: { x: 368, y: 192 },
    status: 'idle',
    recipe: {
      name: 'Chloe',
      role: 'Performance Specialist',
      skin: 'light',
      hairStyle: 'ponytail',
      hairColor: [217, 119, 6],
      clothColor: [180, 83, 9],
      pantsColor: [39, 39, 42]
    },
    associatedSkills: ['V8 Profiling', 'Memory Leak Analysis', 'Network Latency', 'Core Web Vitals', 'Telemetry Streams']
  }
};

/** Get the active office employees for a given project configuration. Only CEO by default! */
export function getProjectEmployees(activeSkills: SkillDepartment[] = []): OfficeEmployee[] {
  const result: OfficeEmployee[] = [CEO_EMPLOYEE];
  for (const skill of activeSkills) {
    if (SPECIALIST_REGISTRY[skill]) {
      result.push(SPECIALIST_REGISTRY[skill]);
    }
  }
  return result;
}

export const DEFAULT_EMPLOYEES: OfficeEmployee[] = [CEO_EMPLOYEE];

export const OFFICE_DEPARTMENTS: OfficeDepartment[] = [
  'general',
  'frontend',
  'backend',
  'mobile',
  'qa',
  'database',
  'devops',
  'design',
  'security',
  'ai',
  'docs',
  'analytics',
];

export const MAX_OFFICE_EMPLOYEES = 23;
export const HAIR_STYLES: HairStyle[] = ['short', 'curly', 'bald', 'buzz', 'ponytail', 'messy', 'long', 'bun', 'cap'];
export const PROVIDERS: AgentProviderId[] = ['codex-cli', 'claude-code', 'opencode', 'antigravity', 'openclaw', 'ollama', 'kiro', 'api', 'mcp'];

export const DEFAULT_CEO_PROFILE: OfficeMemberProfile = {
  id: CEO_EMPLOYEE.id,
  name: 'Rex',
  roleTitle: 'Chief Executive Agent',
  department: 'general',
  enabled: true,
  skills: ['Task planning', 'Project context', 'Work coordination', 'Tool orchestration'],
  preferredProviderId: 'codex-cli',
  appearance: { skin: '#f6d2b8', hair: '#c8c8cf', shirt: '#2a3550', pants: '#23262e', hairStyle: 'curly', glasses: true, suit: true, tie: '#c8483e', cap: '#4b6584' },
};

export const SPECIALIST_PROFILES: Record<SkillDepartment, Omit<OfficeMemberProfile, 'enabled'>> = {
  frontend: {
    id: 'emp-frontend', name: 'Elena Vance', roleTitle: 'Frontend & UI/UX Specialist', department: 'frontend',
    skills: ['React', 'Tailwind CSS', 'Design systems', 'Animation', 'Accessibility'], preferredProviderId: 'claude-code',
    appearance: { skin: '#eab792', hair: '#2b1d16', shirt: '#2860a0', pants: '#282a32', hairStyle: 'ponytail', glasses: false, headset: false, suit: false, tie: '#c8483e', cap: '#4b6584' },
  },
  backend: {
    id: 'emp-backend', name: 'Marcus Chen', roleTitle: 'Systems & Backend Architect', department: 'backend',
    skills: ['Node.js', 'APIs & Microservices', 'Python', 'WebSockets', 'File I/O'], preferredProviderId: 'codex-cli',
    appearance: { skin: '#f6d2b8', hair: '#2b1d16', shirt: '#236e55', pants: '#32323c', hairStyle: 'messy', glasses: false, headset: true, suit: false, tie: '#c8483e', cap: '#4b6584' },
  },
  mobile: {
    id: 'emp-mobile', name: 'Devon Vance', roleTitle: 'Mobile App Architect', department: 'mobile',
    skills: ['React Native', 'Expo SDK', 'Android Gradle', 'iOS Swift', 'Gesture Animations'], preferredProviderId: 'claude-code',
    appearance: { skin: '#eab792', hair: '#3a2418', shirt: '#0284c7', pants: '#1e293b', hairStyle: 'short', glasses: true, headset: false, suit: false, tie: '#c8483e', cap: '#4b6584' },
  },
  qa: {
    id: 'emp-qa', name: 'Aria Sterling', roleTitle: 'QA, Test & DevOps Lead', department: 'qa',
    skills: ['E2E Tests', 'Unit Testing', 'CI/CD Builds', 'Static Analysis', 'Release Gates'], preferredProviderId: 'codex-cli',
    appearance: { skin: '#f6d2b8', hair: '#a8432c', shirt: '#683a80', pants: '#2d2d37', hairStyle: 'long', glasses: true, headset: false, suit: false, tie: '#c8483e', cap: '#4b6584' },
  },
  database: {
    id: 'emp-database', name: 'Darius Thorne', roleTitle: 'Data & Schema Architect', department: 'database',
    skills: ['PostgreSQL', 'Schemas & Migrations', 'Redis Caching', 'Vector Embeddings', 'Prisma ORM'], preferredProviderId: 'codex-cli',
    appearance: { skin: '#a86b48', hair: '#1f1f1f', shirt: '#825028', pants: '#28282d', hairStyle: 'buzz', glasses: false, headset: false, suit: false, tie: '#c8483e', cap: '#4b6584' },
  },
  devops: {
    id: 'emp-devops', name: 'Nate Sterling', roleTitle: 'Cloud & Infrastructure SRE', department: 'devops',
    skills: ['Docker & K8s', 'CI/CD Pipelines', 'AWS & Cloudflare', 'Terraform', 'Secrets Vault'], preferredProviderId: 'codex-cli',
    appearance: { skin: '#f6d2b8', hair: '#504030', shirt: '#475569', pants: '#1e293b', hairStyle: 'cap', glasses: false, headset: true, suit: false, tie: '#c8483e', cap: '#2563eb' },
  },
  design: {
    id: 'emp-design', name: 'Maya Lin', roleTitle: 'Product & Visual Designer', department: 'design',
    skills: ['Design Systems', 'Figma Tokens', 'Micro-interactions', 'Typography', 'Iconography'], preferredProviderId: 'claude-code',
    appearance: { skin: '#fde2cd', hair: '#1f1f1f', shirt: '#e11d48', pants: '#27272a', hairStyle: 'bun', glasses: true, headset: false, suit: false, tie: '#c8483e', cap: '#4b6584' },
  },
  security: {
    id: 'emp-security', name: 'Zane Malik', roleTitle: 'Security & Compliance Lead', department: 'security',
    skills: ['Auth & Zero-Trust', 'OWASP Hardening', 'Audit Logging', 'Pen-Testing', 'Data Privacy'], preferredProviderId: 'codex-cli',
    appearance: { skin: '#8d5534', hair: '#18181b', shirt: '#0f172a', pants: '#0f172a', hairStyle: 'curly', glasses: false, headset: false, suit: true, tie: '#dc2626', cap: '#4b6584' },
  },
  ai: {
    id: 'emp-ai', name: 'Sora Takahashi', roleTitle: 'AI & LLM Systems Engineer', department: 'ai',
    skills: ['Prompt Engineering', 'LangChain', 'RAG Pipelines', 'Vector Indexing', 'DSPy Optimization'], preferredProviderId: 'codex-cli',
    appearance: { skin: '#f6d2b8', hair: '#7c3aed', shirt: '#581c87', pants: '#18181b', hairStyle: 'messy', glasses: true, headset: true, suit: false, tie: '#c8483e', cap: '#4b6584' },
  },
  docs: {
    id: 'emp-docs', name: 'Kavita Rao', roleTitle: 'Technical Writer & Docs Lead', department: 'docs',
    skills: ['API Documentation', 'Architectural Specs', 'User Guides', 'Markdown / MDX', 'Release Notes'], preferredProviderId: 'claude-code',
    appearance: { skin: '#eab792', hair: '#2b1d16', shirt: '#4f46e5', pants: '#1e1b4b', hairStyle: 'long', glasses: false, headset: false, suit: false, tie: '#c8483e', cap: '#4b6584' },
  },
  analytics: {
    id: 'emp-analytics', name: 'Chloe Bennett', roleTitle: 'Performance & Telemetry Specialist', department: 'analytics',
    skills: ['V8 Performance', 'Memory Optimization', 'Core Web Vitals', 'Network Telemetry', 'Latency Profiling'], preferredProviderId: 'codex-cli',
    appearance: { skin: '#f6d2b8', hair: '#d97706', shirt: '#b45309', pants: '#27272a', hairStyle: 'ponytail', glasses: false, headset: true, suit: false, tie: '#c8483e', cap: '#4b6584' },
  },
};

export const GENERAL_PROFILE: Omit<OfficeMemberProfile, 'enabled'> = {
  id: 'emp-general', name: 'Lucas Silva', roleTitle: 'Full-Stack Generalist', department: 'general',
  skills: ['Next.js', 'TypeScript', 'REST APIs', 'State Management'], preferredProviderId: 'codex-cli',
  appearance: { skin: '#eab792', hair: '#452618', shirt: '#059669', pants: '#23262e', hairStyle: 'short', glasses: false, headset: false, suit: false, tie: '#c8483e', cap: '#4b6584' },
};

/** Palette collections for 1-click styling in the customizer */
export const PALETTES = {
  skin: [
    { label: 'Fair', hex: '#fde2cd' },
    { label: 'Peach', hex: '#f6d2b8' },
    { label: 'Golden Tan', hex: '#eab792' },
    { label: 'Warm Olive', hex: '#d49b6a' },
    { label: 'Bronze', hex: '#a86b48' },
    { label: 'Chestnut', hex: '#7a4b2c' },
    { label: 'Espresso', hex: '#4a2c1b' },
  ],
  hair: [
    { label: 'Jet Black', hex: '#18181b' },
    { label: 'Espresso', hex: '#2b1d16' },
    { label: 'Chestnut', hex: '#452618' },
    { label: 'Auburn', hex: '#a8432c' },
    { label: 'Golden Blonde', hex: '#d97706' },
    { label: 'Silver Gray', hex: '#c8c8cf' },
    { label: 'Cyber Violet', hex: '#9333ea' },
    { label: 'Neon Teal', hex: '#06b6d4' },
  ],
  shirt: [
    { label: 'Royal Blue', hex: '#2860a0' },
    { label: 'Emerald', hex: '#059669' },
    { label: 'Executive Navy', hex: '#2a3550' },
    { label: 'Deep Violet', hex: '#683a80' },
    { label: 'Warm Rust', hex: '#825028' },
    { label: 'Crimson', hex: '#e11d48' },
    { label: 'Sky Cyan', hex: '#0284c7' },
    { label: 'Slate Charcoal', hex: '#475569' },
    { label: 'Pure Midnight', hex: '#0f172a' },
    { label: 'Crisp White', hex: '#f8fafc' },
  ],
  pants: [
    { label: 'Dark Slate', hex: '#23262e' },
    { label: 'Charcoal', hex: '#282a32' },
    { label: 'Ash Gray', hex: '#32323c' },
    { label: 'Jet Black', hex: '#18181b' },
    { label: 'Navy Denim', hex: '#1e293b' },
    { label: 'Deep Indigo', hex: '#1e1b4b' },
    { label: 'Warm Khaki', hex: '#71717a' },
  ],
  tie: [
    { label: 'Formative Ember', hex: '#c8483e' },
    { label: 'Executive Gold', hex: '#f59e0b' },
    { label: 'Classic Blue', hex: '#2563eb' },
    { label: 'Emerald', hex: '#10b981' },
    { label: 'Royal Purple', hex: '#8b5cf6' },
    { label: 'Midnight Black', hex: '#09090b' },
  ]
};

/** Character Archetypes ready for instant addition */
export const CHARACTER_ARCHETYPES = [
  { id: 'frontend', label: 'Frontend & UI Specialist', profile: SPECIALIST_PROFILES.frontend },
  { id: 'backend', label: 'Systems & Backend Architect', profile: SPECIALIST_PROFILES.backend },
  { id: 'mobile', label: 'Mobile App Architect', profile: SPECIALIST_PROFILES.mobile },
  { id: 'qa', label: 'QA, Test & DevOps Lead', profile: SPECIALIST_PROFILES.qa },
  { id: 'database', label: 'Data & Schema Architect', profile: SPECIALIST_PROFILES.database },
  { id: 'ai', label: 'AI & LLM Systems Engineer', profile: SPECIALIST_PROFILES.ai },
  { id: 'devops', label: 'Cloud & Infrastructure SRE', profile: SPECIALIST_PROFILES.devops },
  { id: 'design', label: 'Product & Visual Designer', profile: SPECIALIST_PROFILES.design },
  { id: 'security', label: 'Security & Compliance Lead', profile: SPECIALIST_PROFILES.security },
  { id: 'analytics', label: 'Performance & Telemetry', profile: SPECIALIST_PROFILES.analytics },
  { id: 'docs', label: 'Technical Writer & Docs', profile: SPECIALIST_PROFILES.docs },
  { id: 'general', label: 'Full-Stack Generalist', profile: GENERAL_PROFILE },
];

/** Randomize character appearance while keeping colors coordinated and high-taste */
export function randomizeCharacterAppearance(): OfficeMemberProfile['appearance'] {
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const hairStyle = pick(HAIR_STYLES) as OfficeHairStyle;
  const isSuit = Math.random() < 0.25;

  return {
    skin: pick(PALETTES.skin).hex,
    hair: pick(PALETTES.hair).hex,
    shirt: pick(PALETTES.shirt).hex,
    pants: pick(PALETTES.pants).hex,
    hairStyle,
    glasses: Math.random() < 0.35,
    headset: Math.random() < 0.3,
    suit: isSuit,
    tie: isSuit ? pick(PALETTES.tie).hex : undefined,
    cap: hairStyle === 'cap' ? pick(PALETTES.shirt).hex : undefined,
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const isHexColor = (value: unknown): value is string => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);

function normalizeMember(value: unknown, fallback: OfficeMemberProfile): OfficeMemberProfile {
  const input = isRecord(value) ? value : {};
  const appearance = isRecord(input.appearance) ? input.appearance : {};
  const department = OFFICE_DEPARTMENTS.includes(input.department as OfficeDepartment)
    ? input.department as OfficeDepartment
    : fallback.department;
  const skills = Array.isArray(input.skills)
    ? input.skills.filter((item): item is string => typeof item === 'string').map((item) => item.trim().slice(0, 80)).filter(Boolean).slice(0, 20)
    : fallback.skills;
  const preferredProviderId = PROVIDERS.includes(input.preferredProviderId as AgentProviderId)
    ? input.preferredProviderId as AgentProviderId
    : fallback.preferredProviderId;
  const candidateStyle = appearance.hairStyle;

  return {
    id: typeof input.id === 'string' && input.id.trim() ? input.id.trim().slice(0, 128) : fallback.id,
    name: typeof input.name === 'string' && input.name.trim() ? input.name.trim().slice(0, 80) : fallback.name,
    roleTitle: typeof input.roleTitle === 'string' && input.roleTitle.trim() ? input.roleTitle.trim().slice(0, 100) : fallback.roleTitle,
    department,
    enabled: input.enabled !== false,
    skills,
    preferredProviderId,
    appearance: {
      skin: isHexColor(appearance.skin) ? appearance.skin : fallback.appearance.skin,
      hair: isHexColor(appearance.hair) ? appearance.hair : fallback.appearance.hair,
      shirt: isHexColor(appearance.shirt) ? appearance.shirt : fallback.appearance.shirt,
      pants: isHexColor(appearance.pants) ? appearance.pants : fallback.appearance.pants,
      hairStyle: HAIR_STYLES.includes(candidateStyle as HairStyle) ? candidateStyle as OfficeHairStyle : fallback.appearance.hairStyle,
      glasses: typeof appearance.glasses === 'boolean' ? appearance.glasses : fallback.appearance.glasses,
      headset: typeof appearance.headset === 'boolean' ? appearance.headset : fallback.appearance.headset,
      suit: typeof appearance.suit === 'boolean' ? appearance.suit : fallback.appearance.suit,
      tie: isHexColor(appearance.tie) ? appearance.tie : fallback.appearance.tie,
      cap: isHexColor(appearance.cap) ? appearance.cap : fallback.appearance.cap,
    },
  };
}

export function safeUUID(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    try {
      return globalThis.crypto.randomUUID();
    } catch {
      // Fallback if randomUUID is restricted
    }
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

export function createOfficeMemberProfile(department: OfficeDepartment = 'general', id?: string): OfficeMemberProfile {
  const source = department === 'general' ? GENERAL_PROFILE : (SPECIALIST_PROFILES[department as SkillDepartment] || GENERAL_PROFILE);
  return {
    ...source,
    id: id || `office-member-${safeUUID()}`,
    enabled: true,
    skills: [...source.skills],
    appearance: { ...source.appearance },
  };
}

/** Normalize stored office settings and migrate the former skill toggles into profiles. */
export function getProjectOfficeTeam(config?: ProjectOfficeConfig | null): ProjectOfficeTeam {
  const source = config || {};
  const ceoFallback = {
    ...DEFAULT_CEO_PROFILE,
    ...(typeof source.ceoName === 'string' && source.ceoName.trim() ? { name: source.ceoName.trim().slice(0, 80) } : {}),
  };
  const ceo = normalizeMember(source.ceo, ceoFallback);
  ceo.id = DEFAULT_CEO_PROFILE.id;
  ceo.department = 'general';
  ceo.enabled = true;

  let employees: OfficeMemberProfile[];
  if (Array.isArray(source.employees) && (source.employees.length > 0 || !Array.isArray(source.activeSkills) || source.activeSkills.length === 0)) {
    const usedIds = new Set<string>();
    employees = source.employees.slice(0, MAX_OFFICE_EMPLOYEES).map((profile, index) => {
      const fallbackDepartment = isRecord(profile) && OFFICE_DEPARTMENTS.includes(profile.department as OfficeDepartment)
        ? profile.department as OfficeDepartment
        : 'general';
      const fallback = createOfficeMemberProfile(fallbackDepartment, `office-member-${index + 1}`);
      const normalized = normalizeMember(profile, fallback);
      if (usedIds.has(normalized.id) || normalized.id === ceo.id) normalized.id = `office-member-${index + 1}-${safeUUID()}`;
      usedIds.add(normalized.id);
      return normalized;
    });
  } else {
    const legacySkills: SkillDepartment[] = Array.isArray(source.activeSkills)
      ? source.activeSkills.filter((skill): skill is SkillDepartment => OFFICE_DEPARTMENTS.includes(skill as OfficeDepartment))
      : [];
    employees = [...new Set(legacySkills)].map((department) => {
      const template = SPECIALIST_PROFILES[department] || GENERAL_PROFILE;
      return normalizeMember({ ...template, enabled: true }, { ...template, enabled: true });
    });
  }

  return { ceo, employees };
}

/** Stable signature for changes that must refresh the office roster and sprites. */
export function getOfficeTeamSignature(team: ProjectOfficeTeam): string {
  return JSON.stringify({
    ceo: team?.ceo || null,
    employees: Array.isArray(team?.employees) ? team.employees : [],
  });
}
