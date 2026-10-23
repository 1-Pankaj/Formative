import { CharacterRecipe } from './characterRenderer';
import { SkillDepartment } from '../../types';

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
