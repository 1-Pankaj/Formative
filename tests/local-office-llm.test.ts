import { describe, it, expect, afterAll } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { hasLocalOfficeLlm, generateOfficeDialogue, disposeAll } = require('../electron/local-office-llm.cjs');

const modelAvailable = hasLocalOfficeLlm();

describe('Local Office LLM Service', () => {
  afterAll(async () => {
    await disposeAll();
  });

  it('rejects empty prompts gracefully', async () => {
    const result = await generateOfficeDialogue({
      project: { name: 'TestApp' },
      employee: { id: 'emp-ceo', name: 'Rex', roleTitle: 'Chief Executive Agent' },
      prompt: '   ',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('required');
  });

  it.runIf(modelAvailable)('detects formativellm.gguf in the project', () => {
    expect(hasLocalOfficeLlm()).toBe(true);
  });

  it.runIf(modelAvailable)('generates in-character office dialogue without leaking resources', async () => {
    const result = await generateOfficeDialogue({
      project: { name: 'GreenEnergyApp', description: 'Renewable energy dashboard' },
      employee: { id: 'emp-ceo', name: 'Rex', roleTitle: 'Chief Executive Agent', department: 'ceo' },
      prompt: 'hello Rex',
    });

    expect(result.success).toBe(true);
    expect(typeof result.text).toBe('string');
    expect(result.text!.length).toBeGreaterThan(0);
    expect(result.text!.length).toBeLessThanOrEqual(160);
    expect(result.employeeId).toBe('emp-ceo');
    expect(result.employeeName).toBe('Rex');
    expect(result.text).not.toContain('Alex');
  }, 20000);

  it.runIf(modelAvailable)('answers "who are you" naturally without prompt recitation or fake names', async () => {
    const result = await generateOfficeDialogue({
      project: { name: 'GreenEnergyApp' },
      employee: { id: 'emp-frontend', name: 'Elena Vance', roleTitle: 'Frontend Developer', department: 'frontend' },
      prompt: 'who are you',
    });

    expect(result.success).toBe(true);
    expect(result.text).not.toContain('Alex');
    expect(result.text).toContain('Elena Vance');
  }, 20000);

  it.runIf(modelAvailable)('supports ambient receptionist and sidewalk neighbor dialogue', async () => {
    const receptionResult = await generateOfficeDialogue({
      project: { name: 'GreenEnergyApp' },
      employee: { id: 'ambient-zara', name: 'Zara', roleTitle: 'Receptionist', department: 'reception' },
      prompt: 'hello Zara',
    });
    expect(receptionResult.success).toBe(true);
    expect(receptionResult.employeeName).toBe('Zara');
    expect(receptionResult.text).not.toContain('Alex');

    const neighborResult = await generateOfficeDialogue({
      project: { name: 'GreenEnergyApp' },
      employee: { id: 'neighbour-pip', name: 'Pip', roleTitle: 'Neighborhood Regular', department: 'visitor' },
      prompt: 'good morning',
    });
    expect(neighborResult.success).toBe(true);
    expect(neighborResult.employeeName).toBe('Pip');
    expect(neighborResult.text).not.toContain('Alex');
  }, 30000);

  it.runIf(modelAvailable)('incorporates conversation history and active project tasks context', async () => {
    const result = await generateOfficeDialogue({
      project: {
        name: 'GreenEnergyApp',
        description: 'Renewable energy dashboard',
        activeTasks: ['ENG-101: Solar panel metrics', 'ENG-102: Battery inverter graph'],
      },
      employee: { id: 'emp-frontend', name: 'Elena', roleTitle: 'Frontend Developer', department: 'frontend' },
      history: [
        { sender: 'user', text: 'Are the solar panel metrics ready?' },
        { sender: 'agent', text: 'Yes, I just connected the live telemetry feed.' },
      ],
      prompt: 'What should we build next?',
    });

    expect(result.success).toBe(true);
    expect(result.text).not.toContain('Alex');
    expect(typeof result.text).toBe('string');
  }, 25000);

  it.runIf(modelAvailable)('handles multi-turn chat memory without echoing previous dialog or robotic loops', async () => {
    const turn1 = await generateOfficeDialogue({
      project: { name: 'GreenEnergyApp' },
      employee: { id: 'emp-ceo', name: 'Rex', roleTitle: 'Chief Executive Agent', department: 'ceo' },
      history: [{ sender: 'agent', text: 'Hey boss!' }],
      prompt: "what's crackin",
    });

    expect(turn1.success).toBe(true);
    expect(turn1.text).not.toContain('Boss:');
    expect(turn1.text).not.toContain('Rex:');

    const turn2 = await generateOfficeDialogue({
      project: { name: 'GreenEnergyApp' },
      employee: { id: 'emp-ceo', name: 'Rex', roleTitle: 'Chief Executive Agent', department: 'ceo' },
      history: [
        { sender: 'agent', text: 'Hey boss!' },
        { sender: 'user', text: "what's crackin" },
        { sender: 'agent', text: turn1.text || 'Reviewing architecture diagrams.' },
      ],
      prompt: 'what you doing',
    });

    expect(turn2.success).toBe(true);
    expect(turn2.text).not.toContain('Boss:');
    expect(turn2.text).not.toContain('Rex:');
    expect(turn2.text).not.toContain("What's crackin");
    expect(typeof turn2.text).toBe('string');
    expect(turn2.text!.length).toBeGreaterThan(0);
  }, 35000);

  it.runIf(modelAvailable)('correctly queues concurrent dialogue requests without collision', async () => {
    const [res1, res2] = await Promise.all([
      generateOfficeDialogue({
        project: { name: 'GreenEnergyApp' },
        employee: { id: 'ambient-dex', name: 'Dex', roleTitle: 'System Administrator', department: 'sysadmin' },
        prompt: 'What are you doing today?',
      }),
      generateOfficeDialogue({
        project: { name: 'GreenEnergyApp' },
        employee: { id: 'ambient-zara', name: 'Zara', roleTitle: 'Receptionist', department: 'reception' },
        prompt: 'How is the lobby?',
      }),
    ]);

    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
    expect(res1.employeeName).toBe('Dex');
    expect(res2.employeeName).toBe('Zara');
    expect(res1.text).not.toContain('Alex');
    expect(res2.text).not.toContain('Alex');
  }, 40000);

  it.runIf(modelAvailable)('never outputs canned bot phrases like "What\'s your question?" or "As an AI"', async () => {
    const res = await generateOfficeDialogue({
      project: {
        name: 'GreenEnergyApp',
        components: ['Solar Telemetry API', 'Grid DB'],
      },
      employee: { id: 'emp-ceo', name: 'Rex', roleTitle: 'Chief Executive Agent', department: 'ceo' },
      history: [
        { sender: 'user', text: 'what are project updates' },
        { sender: 'agent', text: 'Working on the solar telemetry feed.' },
      ],
      prompt: 'this is my question why are you asking what your question again and again',
    });

    expect(res.success).toBe(true);
    expect(res.text).not.toMatch(/what(?:'s|\s+is)\s+your\s+question/i);
    expect(res.text).not.toMatch(/as\s+an\s+ai/i);
    expect(res.text).not.toContain('Alex');
    expect(res.text).toContain('GreenEnergyApp');
  }, 25000);
});
