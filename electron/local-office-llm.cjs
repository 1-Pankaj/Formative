const path = require('path');
const fs = require('fs');

let llamaModule = null;
let llamaInstance = null;
let modelInstance = null;
let contextInstance = null;
let isGenerating = false;
let idleTimer = null;
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes idle cleanup
let pendingGenerationQueue = Promise.resolve();
let userDataPath = null;

function findGgufModelPath() {
  const candidates = [
    ...(userDataPath ? [path.resolve(userDataPath, 'FormativeData/llm/formativellm.gguf')] : []),
    path.resolve(process.cwd(), 'LLM/formativellm.gguf'),
    path.resolve(__dirname, '../LLM/formativellm.gguf'),
    path.resolve(process.cwd(), 'llm/formativellm.gguf'),
    path.resolve(__dirname, '../llm/formativellm.gguf'),
    path.resolve(__dirname, 'llm/formativellm.gguf'),
  ];
  if (process.resourcesPath) {
    candidates.push(
      path.resolve(process.resourcesPath, 'llm/formativellm.gguf'),
      path.resolve(process.resourcesPath, 'app.asar.unpacked/llm/formativellm.gguf')
    );
  }
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function hasLocalOfficeLlm() {
  return Boolean(findGgufModelPath());
}

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    void disposeContextOnly();
  }, IDLE_TIMEOUT_MS);
}

async function disposeContextOnly() {
  if (isGenerating) return;
  if (contextInstance) {
    try {
      await contextInstance.dispose();
    } catch {}
    contextInstance = null;
  }
}

async function disposeAll() {
  if (idleTimer) clearTimeout(idleTimer);
  if (contextInstance) {
    try { await contextInstance.dispose(); } catch {}
    contextInstance = null;
  }
  if (modelInstance) {
    try { await modelInstance.dispose(); } catch {}
    modelInstance = null;
  }
  if (llamaInstance) {
    try { await llamaInstance.dispose(); } catch {}
    llamaInstance = null;
  }
  llamaModule = null;
}

async function initLlm() {
  const modelPath = findGgufModelPath();
  if (!modelPath) return false;

  if (!llamaModule) {
    llamaModule = await import('node-llama-cpp');
  }

  if (!llamaInstance) {
    llamaInstance = await llamaModule.getLlama({ gpu: false });
  }

  if (!modelInstance) {
    modelInstance = await llamaInstance.loadModel({ modelPath });
  }

  if (!contextInstance) {
    contextInstance = await modelInstance.createContext({ contextSize: 2048 });
  }

  resetIdleTimer();
  return true;
}

function normalizeForComparison(value) {
  return String(value || '').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function isNearRepeat(current, previous) {
  const left = normalizeForComparison(current);
  const right = normalizeForComparison(previous);
  if (left.length < 24 || right.length < 24) return false;
  if (left === right) return true;
  const leftTokens = new Set(left.split(' '));
  const rightTokens = new Set(right.split(' '));
  const shared = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return shared / Math.max(leftTokens.size, rightTokens.size) > 0.82;
}

function sanitizeDialogue(raw, employeeName) {
  if (!raw || typeof raw !== 'string') return '';
  let text = raw.trim().replace(/^['"“”]+|['"“”]+$/g, '');
  const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const speakers = [employeeName, 'Teammate', 'Assistant', 'User', 'Human', 'Boss']
    .filter((value) => typeof value === 'string' && value.trim())
    .map(escapeRegex);
  if (speakers.length) {
    const speakerPrefix = new RegExp(`^(?:${speakers.join('|')}):\\s*`, 'i');
    const nextSpeaker = new RegExp(`(?:\\r?\\n|\\s+)(?:${speakers.join('|')}):\\s*`, 'i');
    text = text.replace(speakerPrefix, '').split(nextSpeaker)[0];
  }
  text = text.replace(/```[\s\S]*?```/g, '').replace(/`([^`]+)`/g, '$1');
  text = text.split(/\r?\n\r?\n/)[0].replace(/\s+/g, ' ').trim();
  if (text.length > 260) {
    const end = text.slice(0, 257).lastIndexOf(' ');
    text = `${text.slice(0, end > 100 ? end : 257).trim()}…`;
  }
  return text;
}

function respondToCommonIntent(employee, prompt, history) {
  const question = normalizeForComparison(prompt);
  const previousReply = Array.isArray(history)
    ? [...history].reverse().find((item) => item?.sender !== 'user' && typeof item?.text === 'string')?.text
    : '';
  const name = typeof employee?.name === 'string' && employee.name.trim() ? employee.name.trim().slice(0, 60) : 'I';
  const roleTitle = typeof employee?.roleTitle === 'string' && employee.roleTitle.trim()
    ? employee.roleTitle.trim().slice(0, 80)
    : 'office regular';
  const variants = (items) => items.find((item) => !isNearRepeat(item, previousReply)) || items[items.length - 1];

  if (/^(hi|hello|hey|good morning|good afternoon|good evening)(?: .*)?$/.test(question)) {
    const greetings = [
      `Hi, I'm ${name}. Nice to meet you.`,
      `Oh, hey—I'm ${name}. I don't think we've met yet.`,
      `Hey there! I'm ${name}. It's nice to have some company.`,
      `Hi! I'm ${name}. How's your day going?`,
    ].filter((reply) => !isNearRepeat(reply, previousReply));
    return greetings[Math.floor(Math.random() * greetings.length)] || `Hi, I'm ${name}. Nice to meet you.`;
  }
  if (/^(how are you|how is it going|how are things|how is your day)$/.test(question)) {
    return variants([
      'Pretty good, thanks. It has been a nice, quiet day.',
      "Can't complain. How's your day going?",
      "Doing well—it's nice to take a little break and chat.",
      'A little sleepy, maybe, but otherwise good.',
    ]);
  }
  if (/^(thanks|thank you|thanks a lot|appreciate it)$/.test(question)) {
    return variants(['You’re welcome.', 'Glad that helped.', 'Anytime.']);
  }
  if (/^(who are you|what are you)$/.test(question)) {
    return `I'm ${name}, the ${roleTitle} around here. I'm always glad to have someone to chat with.`;
  }
  if (/^(what is your name|what s your name)$/.test(question)) {
    return `I'm ${name}. Nice to meet you.`;
  }
  if (/\b(who is your boss|who s your boss|who do you report to|who runs this place|who is your ceo)\b/.test(question)) {
    return variants([
      "I don't know their name. No one's told me yet.",
      "I'm not sure, actually. I haven't met a boss around here.",
      "I couldn't tell you. I only know my own little corner of the office.",
    ]);
  }
  if (/\b(current date|today(?: s date)?|what day is it|what is the date|what s the date|what date is it|current year)\b/.test(question)) {
    return variants([
      "I'm not sure what today's date is—I don't have a calendar here.",
      "I couldn't say. I don't have today's date in front of me.",
      "No idea, I'm afraid. I haven't checked a calendar today.",
    ]);
  }
  if (/^(who|what|which|why|where|when|how)$/.test(question)) {
    return variants([
      'Who do you mean? I might be missing a bit of context.',
      'Could you say a little more? I want to make sure I follow.',
      "I'm not sure what you're referring to yet.",
    ]);
  }
  if (/\b(what (?:are )?you (?:working on|doing)|what are you up to)\b/.test(question)) {
    return variants([
      "Just taking a breather and enjoying a quiet moment around here.",
      "Nothing too exciting—just stretching my legs and taking in the day.",
      "Having a slow moment. It's nice to stop and chat for a bit.",
      "Just wandering around the office. How about you?",
    ]);
  }
  if (/\b(this (?:project|app|codebase)|(?:project|codebase|repo|repository|source code|app|application) (?:status|architecture|features?|structure|updates?|details?)|project (?:context|work|progress)|what are we building|what should we build|what (?:tasks|issues) are open|agent runs?|architecture|modules|components|code changes|work in progress|project status|formative)\b/.test(question)) {
    return variants([
      "I don't get project details in this chat, so I'd only be guessing. I'm better company for casual office banter.",
      "I'm just here for a bit of in-character conversation; I can't see the project's files, tasks, or progress.",
      "I don't have a view into project work from here. Ask me something about life around the office instead.",
    ]);
  }
  if (/\b(what can you help with|how can you help)\b/.test(question)) {
    return variants([
      "I'm here for friendly conversation and a little office roleplay. I don't see project files or task updates.",
      "Mostly good company and office banter. I can't inspect your project from this chat, though.",
    ]);
  }
  return null;
}

function buildCharacterSystemPrompt(employee) {
  const employeeName = typeof employee?.name === 'string' ? employee.name.slice(0, 80) : 'Teammate';
  const roleTitle = typeof employee?.roleTitle === 'string' ? employee.roleTitle.slice(0, 100) : 'office regular';
  return [
    `You are ${employeeName}, a fictional ${roleTitle} in a 3D office roleplay chat.`,
    'Reply directly to the latest message in one or two natural sentences. Be friendly and casual without acting like a help desk.',
    'Your only established facts are your name and role above, plus facts the user explicitly shared in this conversation. Do not invent a boss, company, coworker, personal history, project details, current date, or other real-world facts. If you do not know, say so simply.',
    'This model receives no project name, files, tasks, architecture, or agent activity. Do not claim to see those. Do not add a greeting unless the user greeted you.',
  ].join('\n\n');
}

function buildBoundedConversationHistory(history, maxCharacters = 900) {
  if (!Array.isArray(history)) return [];
  let remaining = maxCharacters;
  const selected = [];
  for (const message of history.slice(-6).reverse()) {
    if (remaining <= 0) break;
    if (!message || !['user', 'agent'].includes(message.sender) || typeof message.text !== 'string') continue;
    const text = message.text.trim();
    if (!text) continue;
    const boundedText = text.slice(-Math.min(240, remaining));
    selected.push({ sender: message.sender, text: boundedText });
    remaining -= boundedText.length;
  }
  return selected.reverse();
}
async function executeDialogueGeneration(params) {
  const { employee, prompt, history } = params || {};
  if (!prompt || typeof prompt !== 'string' || !prompt.trim() || prompt.length > 4000) {
    if (typeof prompt === 'string' && prompt.length > 4000) return { success: false, error: 'Keep the message under 4,000 characters.' };
    return { success: false, error: 'A message prompt is required.' };
  }

  const modelPath = findGgufModelPath();
  if (!modelPath) {
    return { success: false, error: 'formativellm.gguf was not found in the llm folder.' };
  }

  const directReply = respondToCommonIntent(employee, prompt.trim(), history);
  if (directReply) {
    return {
      success: true,
      text: sanitizeDialogue(directReply, employee?.name || 'Teammate'),
      employeeId: employee?.id || 'emp-ceo',
      employeeName: employee?.name || 'Teammate',
    };
  }

  isGenerating = true;
  let session = null;
  try {
    const ready = await initLlm();
    if (!ready || !contextInstance || !modelInstance) {
      throw new Error('Could not initialize local office LLM context.');
    }

    const employeeId = employee?.id || 'emp-ceo';
    const employeeName = typeof employee?.name === 'string' ? employee.name.slice(0, 80) : 'Teammate';
    const systemPrompt = buildCharacterSystemPrompt(employee);

    const sequence = contextInstance.getSequence();
    session = new llamaModule.LlamaChatSession({
      contextSequence: sequence,
      systemPrompt,
    });

    // Populate native structured chat history for LlamaChatSession without string script injection
    const chatHistory = [{ type: 'system', text: systemPrompt }];
    let lastAgentMessage = null;
    const recentHistory = buildBoundedConversationHistory(history);
    if (recentHistory.length > 0) {
      for (const msg of recentHistory) {
        if (msg.sender === 'user') {
          chatHistory.push({
            type: 'user',
            text: msg.text,
          });
        } else {
          lastAgentMessage = msg.text;
          chatHistory.push({
            type: 'model',
            response: [msg.text],
          });
        }
      }
    }

    try {
      session.setChatHistory(chatHistory);
    } catch {
      // Graceful fallback if history fails to apply
    }

    const sampling = {
      maxTokens: 64,
      temperature: 0.55,
      repeatPenalty: {
        penalty: 1.08,
        frequencyPenalty: 0.05,
        presencePenalty: 0,
        lastTokens: 64,
      },
    };
    let rawResponse = await session.prompt(prompt.trim(), sampling);
    let cleanResponse = sanitizeDialogue(rawResponse, employeeName);
    if (isNearRepeat(cleanResponse, lastAgentMessage)) {
      rawResponse = await session.prompt('Give a fresh, direct response to my latest message. Do not reuse the previous reply or greet me again.', sampling);
      cleanResponse = sanitizeDialogue(rawResponse, employeeName);
    }
    if (!cleanResponse) cleanResponse = 'I missed that. Could you say a little more?';
    if (isNearRepeat(cleanResponse, lastAgentMessage)) {
      cleanResponse = [
        'Sorry, my mind wandered for a second. What were you saying?',
        'Ah, I lost my train of thought there. Go on?',
        'Sorry about that—I was distracted for a moment.',
      ][Math.floor(Math.random() * 3)];
    }

    resetIdleTimer();

    return {
      success: true,
      text: cleanResponse,
      employeeId,
      employeeName,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error generating office dialogue.',
    };
  } finally {
    if (session) {
      try {
        await session.dispose({ disposeSequence: true });
      } catch {}
      session = null;
    }
    isGenerating = false;
  }
}

function generateOfficeDialogue(params) {
  return new Promise((resolve) => {
    pendingGenerationQueue = pendingGenerationQueue
      .then(async () => {
        const res = await executeDialogueGeneration(params);
        resolve(res);
      })
      .catch((err) => {
        resolve({
          success: false,
          error: err instanceof Error ? err.message : 'Error generating office dialogue.',
        });
      });
  });
}

module.exports = {
  configureLocalOfficeLlm: (options = {}) => { userDataPath = options.userDataPath || null; },
  isNearRepeat,
  sanitizeDialogue,
  respondToCommonIntent,
  buildCharacterSystemPrompt,
  buildBoundedConversationHistory,
  hasLocalOfficeLlm,
  generateOfficeDialogue,
  disposeAll,
};
