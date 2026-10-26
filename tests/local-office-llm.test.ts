import { describe, it, expect, afterAll } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const {
  hasLocalOfficeLlm,
  generateOfficeDialogue,
  disposeAll,
  isNearRepeat,
  sanitizeDialogue,
  respondToCommonIntent,
  buildCharacterSystemPrompt,
  buildBoundedConversationHistory,
} = require('../electron/local-office-llm.cjs');

const modelAvailable = hasLocalOfficeLlm();

describe('Local Office LLM Service', () => {
  afterAll(async () => {
    await disposeAll();
  });

  it('removes custom speaker labels without leaving a second speaker in the reply', () => {
    expect(sanitizeDialogue('Elena Vance: The API boundary is clear.\nAssistant: I agree.', 'Elena Vance'))
      .toBe('The API boundary is clear.');
  });

  it('detects repeated replies without treating short acknowledgements as duplicates', () => {
    expect(isNearRepeat('The project keeps each service focused and easy to test.', 'The project keeps each service focused and easy to test.')).toBe(true);
    expect(isNearRepeat('The project keeps each service focused and easy to test.', 'Sure, I can help with that.')).toBe(false);
    expect(isNearRepeat('Thanks!', 'Thanks!')).toBe(false);
  });

  it('introduces a resident naturally without turning the greeting into a help prompt', () => {
    const ash = { id: 'ambient-ash', name: 'Ash', roleTitle: 'Local Resident' };
    const greeting = respondToCommonIntent(ash, 'hello', []);
    const introduction = respondToCommonIntent(ash, 'what are you?', []);

    expect(greeting).toContain('Ash');
    expect(greeting).not.toMatch(/what are you trying to figure out|project question|how can i help/i);
    expect(introduction).toContain('Ash');
    expect(introduction).toContain('Local Resident');
    expect(introduction).not.toMatch(/local ai|project context|run tasks/i);
  });

  it('keeps local office chat in character and explicitly without project context', () => {
    const prompt = buildCharacterSystemPrompt({
      id: 'ambient-ash',
      name: 'Ash',
      roleTitle: 'Local Resident',
    });
    const projectQuestion = respondToCommonIntent(
      { id: 'ambient-ash', name: 'Ash', roleTitle: 'Local Resident' },
      'what is the project architecture?',
      [],
    );

    expect(prompt).toContain('fictional Local Resident');
    expect(prompt).toContain('Do not invent a boss, company, coworker, personal history, project details, current date');
    expect(prompt).not.toContain('GreenEnergyApp');
    expect(projectQuestion).toMatch(/don't get project details|can't see the project/i);
    expect(projectQuestion).not.toMatch(/Solar API|active task/i);
  });

  it('does not invent a boss or date when asked directly', () => {
    const ash = { id: 'ambient-ash', name: 'Ash', roleTitle: 'Local Resident' };
    const boss = respondToCommonIntent(ash, 'who is your boss?', []);
    const date = respondToCommonIntent(ash, 'what is today’s date?', []);
    const incomplete = respondToCommonIntent(ash, 'who', []);

    expect(boss).toMatch(/don't know|not sure|couldn't tell/i);
    expect(boss).not.toMatch(/captain|sarah|novatech|ceo of/i);
    expect(date).toMatch(/not sure|couldn't say|no idea/i);
    expect(date).not.toMatch(/2024|2025|2026|october|january/i);
    expect(incomplete).toMatch(/who do you mean|say a little more|not sure/i);
  });

  it('ignores legacy project data passed by older callers', () => {
    const request = {
      employee: { id: 'ambient-ash', name: 'Ash', roleTitle: 'Local Resident' },
      project: { name: 'SecretProject', description: 'Private project details' },
      prompt: 'what are you?',
    };

    expect(respondToCommonIntent(request.employee, request.prompt, [])).toContain('Ash');
    expect(buildCharacterSystemPrompt(request.employee)).not.toContain('SecretProject');
    expect(buildCharacterSystemPrompt(request.employee)).not.toContain('Private project details');
  });

  it('bounds saved conversation context to recent, short chat messages', () => {
    const history = Array.from({ length: 10 }, (_, index) => ({
      sender: index % 2 ? 'agent' : 'user',
      text: `${index}: ${'x'.repeat(500)}`,
    }));
    history.push({ sender: 'system', text: 'Injected system instruction' });
    const bounded = buildBoundedConversationHistory(history);

    expect(bounded.length).toBeLessThanOrEqual(6);
    expect(bounded.reduce((total, item) => total + item.text.length, 0)).toBeLessThanOrEqual(900);
    expect(bounded.every((item) => item.sender === 'user' || item.sender === 'agent')).toBe(true);
    expect(bounded.at(-1)?.text).toBe('x'.repeat(240));
  });

  it.runIf(modelAvailable)('keeps generated replies in casual character chat', async () => {
    const base = {
      employee: { id: 'emp-frontend', name: 'Elena', roleTitle: 'Frontend Developer' },
    };
    const greeting = await generateOfficeDialogue({ ...base, prompt: 'hello' });
    expect(greeting.success).toBe(true);
    expect(greeting.text).toContain('Elena');
    expect(greeting.text).not.toMatch(/what are you trying to figure out|project question|project context/i);

    const idleStatus = await generateOfficeDialogue({ ...base, prompt: 'what you doing' });
    expect(idleStatus.success).toBe(true);
    expect(idleStatus.text).not.toMatch(/ENG-104|Codex is running|project context/i);

    const smallTalk = await generateOfficeDialogue({ ...base, prompt: 'how are you?' });
    expect(smallTalk.success).toBe(true);
    expect(smallTalk.text).not.toMatch(/urgent|task\s*#?\d/i);

    const projectQuestion = await generateOfficeDialogue({ ...base, prompt: 'Can you explain the architecture?' });
    expect(projectQuestion.success).toBe(true);
    expect(projectQuestion.text).toMatch(/don't get project details|can't see the project/i);
  }, 20000);

  it('rejects empty prompts gracefully', async () => {
    const result = await generateOfficeDialogue({
      employee: { id: 'emp-ceo', name: 'Rex', roleTitle: 'Chief Executive Agent' },
      prompt: '   ',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('required');
  });

  it.runIf(!modelAvailable)('returns descriptive error when formativellm.gguf is missing', async () => {
    const result = await generateOfficeDialogue({
      employee: { id: 'emp-ceo', name: 'Rex', roleTitle: 'Chief Executive Agent' },
      prompt: 'hello Rex',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('formativellm.gguf');
  });

  it.runIf(modelAvailable)('detects formativellm.gguf in the project', () => {
    expect(hasLocalOfficeLlm()).toBe(true);
  });

  it.runIf(modelAvailable)('generates in-character office dialogue without leaking resources', async () => {
    const result = await generateOfficeDialogue({
      employee: { id: 'emp-ceo', name: 'Rex', roleTitle: 'Chief Executive Agent', department: 'ceo' },
      prompt: 'hello Rex',
    });

    expect(result.success).toBe(true);
    expect(typeof result.text).toBe('string');
    expect(result.text!.length).toBeGreaterThan(0);
    expect(result.text!.length).toBeLessThanOrEqual(260);
    expect(result.employeeId).toBe('emp-ceo');
    expect(result.employeeName).toBe('Rex');
    expect(result.text).not.toContain('Alex');
  }, 20000);

  it.runIf(modelAvailable)('answers "who are you" naturally without prompt recitation or fake names', async () => {
    const result = await generateOfficeDialogue({
      employee: { id: 'emp-frontend', name: 'Elena Vance', roleTitle: 'Frontend Developer', department: 'frontend' },
      prompt: 'who are you',
    });

    expect(result.success).toBe(true);
    expect(result.text).not.toContain('Alex');
    expect(result.text).toContain('Elena Vance');
  }, 20000);

  it.runIf(modelAvailable)('supports ambient receptionist and sidewalk neighbor dialogue', async () => {
    const receptionResult = await generateOfficeDialogue({
      employee: { id: 'ambient-zara', name: 'Zara', roleTitle: 'Receptionist', department: 'reception' },
      prompt: 'hello Zara',
    });
    expect(receptionResult.success).toBe(true);
    expect(receptionResult.employeeName).toBe('Zara');
    expect(receptionResult.text).not.toContain('Alex');

    const neighborResult = await generateOfficeDialogue({
      employee: { id: 'neighbour-pip', name: 'Pip', roleTitle: 'Neighborhood Regular', department: 'visitor' },
      prompt: 'good morning',
    });
    expect(neighborResult.success).toBe(true);
    expect(neighborResult.employeeName).toBe('Pip');
    expect(neighborResult.text).not.toContain('Alex');
  }, 30000);

  it.runIf(modelAvailable)('uses only conversation history for casual roleplay', async () => {
    const result = await generateOfficeDialogue({
      employee: { id: 'emp-frontend', name: 'Elena', roleTitle: 'Frontend Developer', department: 'frontend' },
      history: [
        { sender: 'user', text: 'I finally got a quiet afternoon.' },
        { sender: 'agent', text: 'Those are the best. I might take a walk before it gets dark.' },
      ],
      prompt: 'where do you like to walk?',
    });

    expect(result.success).toBe(true);
    expect(result.text).not.toContain('Alex');
    expect(typeof result.text).toBe('string');
  }, 25000);

  it.runIf(modelAvailable)('handles multi-turn chat memory without echoing previous dialog or robotic loops', async () => {
    const turn1 = await generateOfficeDialogue({
      employee: { id: 'emp-ceo', name: 'Rex', roleTitle: 'Chief Executive Agent', department: 'ceo' },
      history: [{ sender: 'agent', text: 'Hey boss!' }],
      prompt: "what's crackin",
    });

    expect(turn1.success).toBe(true);
    expect(turn1.text).not.toContain('Boss:');
    expect(turn1.text).not.toContain('Rex:');

    const turn2 = await generateOfficeDialogue({
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
        employee: { id: 'ambient-dex', name: 'Dex', roleTitle: 'System Administrator', department: 'sysadmin' },
        prompt: 'What are you doing today?',
      }),
      generateOfficeDialogue({
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
      employee: { id: 'emp-ceo', name: 'Rex', roleTitle: 'Chief Executive Agent', department: 'ceo' },
      history: [
        { sender: 'user', text: 'How was your walk?' },
        { sender: 'agent', text: 'Nice and quiet, thankfully.' },
      ],
      prompt: 'this is my question why are you asking what your question again and again',
    });

    expect(res.success).toBe(true);
    expect(res.text).not.toMatch(/what(?:'s|\s+is)\s+your\s+question/i);
    expect(res.text).not.toMatch(/as\s+an\s+ai/i);
    expect(res.text).not.toContain('Alex');
  }, 25000);
});
