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
