import { OfficeEmployee, EmployeeRole, CEO_EMPLOYEE } from './officeCast';
import { AgentTranscriptStep } from '../../types';
import { TOOL_QUIPS, pickRandom } from './officeDialogue';

export interface DispatchResult {
  activeEmployeeId: string;
  role: EmployeeRole;
  actionMessage: string;
  thought?: string;
  status: 'working' | 'thinking' | 'done';
}

/**
 * Single-agent dispatcher for Formative Studio.
 * Routes telemetry steps to active specialist skill employees, or back to the CEO.
 */
export function dispatchAgentStep(
  step: AgentTranscriptStep,
  employees: OfficeEmployee[]
): DispatchResult {
  const toolCalls = step.tool_calls || [];
  const primaryTool = toolCalls[0]?.name || '';
  const toolArgs = toolCalls[0]?.args || toolCalls[0]?.parameters || {};
  const toolNameLower = primaryTool.toLowerCase();

  let targetRole: EmployeeRole = 'ceo';
  let actionMessage = '';

  // 1. Determine which specialist skill should handle the step
  if (
    toolNameLower.includes('read') || 
    toolNameLower.includes('search') || 
    toolNameLower.includes('list') ||
    toolNameLower.includes('graph') ||
    toolNameLower.includes('inspect')
  ) {
    const filePath = toolArgs.Path || toolArgs.path || toolArgs.CommandLine || '';
    const fileBase = filePath.split(/[/\\]/).pop() || '';
    targetRole = 'ceo'; // CEO does macro planning and inspection
    actionMessage = fileBase ? `Inspecting ${fileBase}` : pickRandom(TOOL_QUIPS.read);
  } else if (
    toolNameLower.includes('write') || 
    toolNameLower.includes('edit') || 
    toolNameLower.includes('patch')
  ) {
    const filePath = toolArgs.Path || toolArgs.path || '';
    const fileBase = filePath.split(/[/\\]/).pop() || '';
    if (filePath.endsWith('.css') || filePath.endsWith('.tsx') || filePath.endsWith('.jsx') || filePath.endsWith('.html')) {
      targetRole = 'frontend';
      actionMessage = fileBase ? `Crafting UI in ${fileBase}` : pickRandom(TOOL_QUIPS.write);
    } else if (filePath.includes('schema') || filePath.includes('db') || filePath.includes('sql') || filePath.includes('store')) {
      targetRole = 'database';
      actionMessage = fileBase ? `Updating Schema in ${fileBase}` : "Refactoring data model...";
    } else {
      targetRole = 'backend';
      actionMessage = fileBase ? `Engineering ${fileBase}` : pickRandom(TOOL_QUIPS.write);
    }
  } else if (
    toolNameLower.includes('run_command') || 
    toolNameLower.includes('exec') || 
    toolNameLower.includes('terminal') ||
    toolNameLower.includes('test')
  ) {
    const cmd = toolArgs.CommandLine || toolArgs.command || '';
    if (cmd.includes('test') || cmd.includes('jest') || cmd.includes('vitest') || cmd.includes('lint') || cmd.includes('build')) {
      targetRole = 'qa';
      actionMessage = cmd.length > 30 ? `Testing: ${cmd.slice(0, 27)}...` : `Running: ${cmd}`;
    } else if (cmd.includes('migrate') || cmd.includes('prisma') || cmd.includes('drizzle')) {
      targetRole = 'database';
      actionMessage = "Running database migration...";
    } else {
      targetRole = 'qa';
      actionMessage = cmd.length > 30 ? `Exec: ${cmd.slice(0, 27)}...` : `Exec: ${cmd}`;
    }
  } else if (step.thinking) {
    targetRole = 'ceo';
    actionMessage = pickRandom(TOOL_QUIPS.think);
  } else {
    // Generic fallback or user input
    targetRole = 'ceo';
    actionMessage = step.content ? (step.content.slice(0, 45) + '...') : pickRandom(TOOL_QUIPS.idle);
  }

  // 2. Find employee matching targetRole among active employees.
  // If the specialist is not currently spawned, the CEO handles the work!
  const employee = employees.find(e => e.role === targetRole) || employees.find(e => e.role === 'ceo') || employees[0] || CEO_EMPLOYEE;

  return {
    activeEmployeeId: employee.id,
    role: employee.role,
    actionMessage,
    thought: step.thinking,
    status: step.status === 'ERROR' ? 'thinking' : 'working'
  };
}
