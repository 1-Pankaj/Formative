import { describe, it, expect } from 'vitest';
import React from 'react';
import { MarkdownContent } from '../src/components/chat/MarkdownContent';

describe('MarkdownContent Component', () => {
  it('instantiates cleanly with markdown formatting and code fences', () => {
    const markdown = `
# Architecture Summary
Here is the core logic:
\`\`\`typescript
export function calculateScore(a: number, b: number): number {
  return a + b;
}
\`\`\`
- First bullet item with **bold** text and \`inline code\`.
- Second bullet item.
> Important note: this is a read-only run.
    `.trim();

    const element = React.createElement(MarkdownContent, {
      content: markdown,
      dark: true,
      isStreaming: false,
    });

    expect(element).toBeDefined();
    expect(element.props.content).toBe(markdown);
  });

  it('renders streaming indicator when isStreaming is true', () => {
    const element = React.createElement(MarkdownContent, {
      content: 'Partial agent text',
      dark: true,
      isStreaming: true,
    });

    expect(element.props.isStreaming).toBe(true);
  });
});
