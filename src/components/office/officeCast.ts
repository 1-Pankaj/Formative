import { OfficeDepartment, OfficeHairStyle, OfficeMemberProfile, ProjectOfficeConfig, ProjectOfficeTeam, SkillDepartment } from '../../types';
import type { AgentProviderId } from '../../types/agentRuns';

export type RGB = [number, number, number];
export type HairStyle = 'short' | 'curly' | 'bald' | 'buzz' | 'ponytail' | 'messy' | 'long' | string;

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
  | 'database';      // Data & Persistence Specialist

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

/** Modular Specialist Skills. These spawn at their desks only when enabled for the project. */
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

const OFFICE_DEPARTMENTS: OfficeDepartment[] = ['general', 'frontend', 'backend', 'qa', 'database'];
export const MAX_OFFICE_EMPLOYEES = 23;
const HAIR_STYLES: HairStyle[] = ['short', 'curly', 'bald', 'buzz', 'ponytail', 'messy', 'long', 'bun', 'cap'];
const PROVIDERS: AgentProviderId[] = ['codex-cli', 'claude-code', 'opencode', 'antigravity', 'openclaw', 'ollama', 'kiro', 'api', 'mcp'];

export const DEFAULT_CEO_PROFILE: OfficeMemberProfile = {
  id: CEO_EMPLOYEE.id,
  name: 'Rex',
  roleTitle: 'Chief Executive Agent',
  department: 'general',
  enabled: true,
  skills: ['Task planning', 'Project context', 'Work coordination'],
  preferredProviderId: 'codex-cli',
  appearance: { skin: '#f6d2b8', hair: '#c8c8cf', shirt: '#2a3550', pants: '#23262e', hairStyle: 'curly', glasses: true, suit: true, tie: '#c8483e', cap: '#4b6584' },
};

const SPECIALIST_PROFILES: Record<SkillDepartment, Omit<OfficeMemberProfile, 'enabled'>> = {
  frontend: {
    id: 'emp-frontend', name: 'Elena Vance', roleTitle: 'Frontend developer', department: 'frontend',
    skills: ['React', 'CSS', 'Design systems', 'Accessibility'], preferredProviderId: 'claude-code',
    appearance: { skin: '#eab792', hair: '#2b1d16', shirt: '#2860a0', pants: '#282a32', hairStyle: 'ponytail', cap: '#4b6584' },
  },
  backend: {
    id: 'emp-backend', name: 'Marcus Chen', roleTitle: 'Backend developer', department: 'backend',
    skills: ['APIs', 'Node.js', 'Python', 'Services'], preferredProviderId: 'codex-cli',
    appearance: { skin: '#f6d2b8', hair: '#2b1d16', shirt: '#236e55', pants: '#32323c', hairStyle: 'messy', cap: '#4b6584' },
  },
  qa: {
    id: 'emp-qa', name: 'Aria Sterling', roleTitle: 'Testing and release', department: 'qa',
    skills: ['Tests', 'Builds', 'Linting', 'Release checks'], preferredProviderId: 'codex-cli',
    appearance: { skin: '#f6d2b8', hair: '#a8432c', shirt: '#683a80', pants: '#2d2d37', hairStyle: 'long', cap: '#4b6584' },
  },
  database: {
    id: 'emp-database', name: 'Darius Thorne', roleTitle: 'Data and storage', department: 'database',
    skills: ['SQL', 'Schemas', 'Migrations', 'Caching'], preferredProviderId: 'codex-cli',
    appearance: { skin: '#a86b48', hair: '#1f1f1f', shirt: '#825028', pants: '#28282d', hairStyle: 'buzz', cap: '#4b6584' },
  },
};

const GENERAL_PROFILE: Omit<OfficeMemberProfile, 'enabled'> = {
  id: 'emp-general', name: 'New teammate', roleTitle: 'Project specialist', department: 'general',
  skills: [], preferredProviderId: 'codex-cli',
  appearance: { skin: '#eab792', hair: '#5a3825', shirt: '#49658c', pants: '#3b4a6b', hairStyle: 'short', cap: '#4b6584' },
};

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

export function createOfficeMemberProfile(department: OfficeDepartment = 'general', id?: string): OfficeMemberProfile {
  const source = department === 'general' ? GENERAL_PROFILE : SPECIALIST_PROFILES[department];
  return {
    ...source,
    id: id || `office-member-${globalThis.crypto.randomUUID()}`,
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
      if (usedIds.has(normalized.id) || normalized.id === ceo.id) normalized.id = `office-member-${index + 1}-${globalThis.crypto.randomUUID()}`;
      usedIds.add(normalized.id);
      return normalized;
    });
  } else {
    const legacySkills: SkillDepartment[] = Array.isArray(source.activeSkills)
      ? source.activeSkills.filter((skill): skill is SkillDepartment => ['frontend', 'backend', 'qa', 'database'].includes(skill))
      : [];
    employees = [...new Set(legacySkills)].map((department) => {
      const template = SPECIALIST_PROFILES[department];
      return normalizeMember({ ...template, enabled: true }, { ...template, enabled: true });
    });
  }

  return { ceo, employees };
}
