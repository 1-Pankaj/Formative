/**
 * Utility functions for cleaning coordinator and agent prompts for human display.
 * Strips internal system preambles and task context lists from user-facing bubbles and conversation titles.
 */

export function cleanPromptForDisplay(rawPrompt: string): string {
  if (!rawPrompt || typeof rawPrompt !== 'string') return '';
  const trimmed = rawPrompt.trim();

  // Pattern 1: Explicit "User's question: <question>"
  const questionMatch = trimmed.match(/User's question:\s*([\s\S]+)$/i);
  if (questionMatch && questionMatch[1]) {
    return questionMatch[1].trim();
  }

  // Pattern 2: Prompt starts with "You are the project coordinator for"
  if (trimmed.startsWith('You are the project coordinator for ')) {
    const questionIndex = trimmed.indexOf("User's question:");
    if (questionIndex !== -1) {
      return trimmed.slice(questionIndex + "User's question:".length).trim();
    }
  }

  return trimmed;
}

export function getConversationCleanTitle(title: string, maxLength: number = 72): string {
  const clean = cleanPromptForDisplay(title).replace(/\s+/g, ' ');
  if (!clean) return 'New conversation';
  return clean.length > maxLength ? `${clean.slice(0, maxLength - 1)}…` : clean;
}

/**
 * Formats and clamps agent responses to fit inside in-office 3D speech bubbles without clipping.
 * Strips codeblocks, markdown headers, and clamps to 1-2 short sentences (max 120 chars).
 */
export function extractConciseSpeech(text: string, maxChars: number = 120): string {
  if (!text || typeof text !== 'string') return '';
  let clean = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\r?\n+/g, ' ')
    .trim();

  const sentenceMatches = clean.match(/.*?[.!?](?=\s+|$)/g);
  if (sentenceMatches && sentenceMatches.length > 0) {
    clean = sentenceMatches.slice(0, 2).join(' ').trim();
  }

  if (clean.length > maxChars) {
    clean = clean.slice(0, maxChars - 3).trim() + '...';
  }

  return clean || text.slice(0, maxChars);
}
