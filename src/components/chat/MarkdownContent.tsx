import React, { useState } from 'react';
import { Check, Copy } from '../ui/FormativeGlyphs';

interface MarkdownContentProps {
  content: string;
  dark: boolean;
  isStreaming?: boolean;
}

interface CodeBlockProps {
  language: string;
  code: string;
  dark: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, dark }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback or ignore
    }
  };

  return (
    <div className={`my-3 overflow-hidden rounded-lg border text-xs ${
      dark ? 'border-[#303036] bg-[#0d0d10]' : 'border-zinc-200 bg-zinc-900 text-zinc-100'
    }`}>
      <div className={`flex items-center justify-between px-3 py-1.5 border-b font-mono text-[11px] select-none ${
        dark ? 'border-[#27272e] bg-[#141418] text-zinc-400' : 'border-zinc-800 bg-zinc-950 text-zinc-400'
      }`}>
        <span className="uppercase tracking-wider font-semibold">{language || 'text'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors ${
            copied
              ? 'text-emerald-400'
              : dark
              ? 'hover:text-white hover:bg-zinc-800'
              : 'hover:text-white hover:bg-zinc-800'
          }`}
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto font-mono text-[13px] leading-relaxed select-text">
        <code>{code}</code>
      </pre>
    </div>
  );
};

function renderInlineText(text: string, dark: boolean): React.ReactNode[] {
  // Regex to match inline code (`code`), bold (**bold**), and italic (*italic*)
  const tokens: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      const code = token.slice(1, -1);
      tokens.push(
        <code
          key={match.index}
          className={`px-1.5 py-0.5 mx-0.5 rounded font-mono text-[12px] ${
            dark ? 'bg-[#222228] text-amber-300 border border-[#33333c]' : 'bg-zinc-100 text-amber-800 border border-zinc-200'
          }`}
        >
          {code}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      tokens.push(
        <strong key={match.index} className="font-semibold text-inherit">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      tokens.push(
        <em key={match.index} className="italic text-inherit">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const labelMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (labelMatch) {
        tokens.push(
          <a
            key={match.index}
            href={labelMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {labelMatch[1]}
          </a>
        );
      } else {
        tokens.push(token);
      }
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  dark,
  isStreaming = false,
}) => {
  if (!content) {
    return isStreaming ? <span className="inline-block w-2 h-4 bg-brand animate-pulse ml-0.5" /> : null;
  }

  // Parse lines into blocks (paragraphs, headers, code blocks, lists)
  const lines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockBuffer: string[] = [];
  let listBuffer: string[] = [];
  let isNumberedList = false;

  const flushList = () => {
    if (listBuffer.length === 0) return;
    const ListTag = isNumberedList ? 'ol' : 'ul';
    elements.push(
      <ListTag
        key={`list-${elements.length}`}
        className={`my-2 pl-5 space-y-1 ${isNumberedList ? 'list-decimal' : 'list-disc'} text-[14px] leading-relaxed`}
      >
        {listBuffer.map((item, idx) => (
          <li key={idx}>{renderInlineText(item, dark)}</li>
        ))}
      </ListTag>
    );
    listBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check code fence
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <CodeBlock
            key={`code-${elements.length}`}
            language={codeBlockLang}
            code={codeBlockBuffer.join('\n')}
            dark={dark}
          />
        );
        inCodeBlock = false;
        codeBlockLang = '';
        codeBlockBuffer = [];
      } else {
        flushList();
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3).trim();
        codeBlockBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      continue;
    }

    // Check list item
    const bulletMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
    const numberMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);

    if (bulletMatch) {
      if (isNumberedList) flushList();
      isNumberedList = false;
      listBuffer.push(bulletMatch[2]);
      continue;
    } else if (numberMatch) {
      if (!isNumberedList && listBuffer.length > 0) flushList();
      isNumberedList = true;
      listBuffer.push(numberMatch[2]);
      continue;
    } else {
      flushList();
    }

    // Check headers
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm font-bold mt-4 mb-1.5 tracking-tight text-inherit">
          {renderInlineText(line.slice(4), dark)}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-base font-bold mt-4 mb-2 tracking-tight text-inherit">
          {renderInlineText(line.slice(3), dark)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-lg font-bold mt-5 mb-2 tracking-tight text-inherit">
          {renderInlineText(line.slice(2), dark)}
        </h1>
      );
      continue;
    }

    // Check blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className={`my-2 pl-3.5 border-l-2 py-0.5 text-xs italic ${
            dark ? 'border-brand text-zinc-400' : 'border-brand text-zinc-600'
          }`}
        >
          {renderInlineText(line.slice(2), dark)}
        </blockquote>
      );
      continue;
    }

    // Regular paragraph
    if (line.trim().length > 0) {
      elements.push(
        <p key={`p-${i}`} className="my-1.5 text-[14px] leading-relaxed break-words">
          {renderInlineText(line, dark)}
        </p>
      );
    }
  }

  // If still in code block (e.g. streaming mid-block)
  if (inCodeBlock && codeBlockBuffer.length > 0) {
    elements.push(
      <CodeBlock
        key={`code-partial-${elements.length}`}
        language={codeBlockLang}
        code={codeBlockBuffer.join('\n')}
        dark={dark}
      />
    );
  }

  flushList();

  return (
    <div className="markdown-body space-y-1">
      {elements}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-brand animate-pulse ml-0.5 align-middle rounded-xs" />
      )}
    </div>
  );
};
