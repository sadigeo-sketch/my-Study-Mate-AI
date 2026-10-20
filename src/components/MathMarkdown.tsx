import React, { useMemo } from "react";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";

interface MathMarkdownProps {
  content: string;
  isLight?: boolean;
  isRtl?: boolean;
  stripCalculatorHeader?: boolean;
  className?: string;
}

/**
 * Preprocesses markdown text to ensure LaTeX math notation is converted
 * into standard formats recognized by remark-math ($ and $$).
 */
export function preprocessLaTeX(rawText: string, stripHeader = true): string {
  if (!rawText) return "";

  let text = rawText;

  if (stripHeader) {
    text = text.replace(/\[CALCULATOR RESULT:[^\]]+\]\s*/gi, "");
  }

  // 1. Convert LaTeX display math \[ ... \] to $$ ... $$
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    return `\n$$\n${math.trim()}\n$$\n`;
  });

  // 2. Convert LaTeX inline math \( ... \) to $ ... $
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    return `$${math.trim()}$`;
  });

  // 3. Wrap bare \begin{matrix/pmatrix/bmatrix/aligned/cases} ... \end{...} if not already in $$
  text = text.replace(
    /(?<!\$)\s*(\\begin\{(?:aligned|matrix|pmatrix|bmatrix|vmatrix|cases|array)\}[\s\S]*?\\end\{(?:aligned|matrix|pmatrix|bmatrix|vmatrix|cases|array)\})\s*(?!\$)/g,
    (_, block) => `\n$$\n${block.trim()}\n$$\n`
  );

  return text;
}

export const MathMarkdown: React.FC<MathMarkdownProps> = ({
  content,
  isLight = false,
  isRtl = false,
  stripCalculatorHeader = false,
  className = "",
}) => {
  const processedContent = useMemo(() => {
    return preprocessLaTeX(content, stripCalculatorHeader);
  }, [content, stripCalculatorHeader]);

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className={`math-markdown-container text-sm md:text-[15px] leading-relaxed break-words ${
        isRtl ? "text-right font-sans" : "text-left"
      } ${className}`}
    >
      <Markdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={{
          p: ({ children }) => (
            <p
              className={`my-2.5 leading-relaxed text-[14.5px] sm:text-[15.5px] ${
                isLight ? "text-stone-800" : "text-stone-200"
              }`}
            >
              {children}
            </p>
          ),
          h1: ({ children }) => (
            <h1
              className={`text-xl sm:text-2xl font-bold mt-4 mb-2 pb-1.5 ${
                isLight
                  ? "text-stone-950 border-b border-stone-200"
                  : "text-white border-b border-stone-800"
              }`}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={`text-lg sm:text-xl font-bold mt-4 mb-2 ${
                isLight ? "text-amber-700" : "text-amber-300"
              }`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`text-base sm:text-lg font-semibold mt-3 mb-1.5 ${
                isLight ? "text-stone-900" : "text-stone-100"
              }`}
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold text-stone-300 mt-2.5 mb-1">
              {children}
            </h4>
          ),
          ul: ({ children }) => (
            <ul
              className={`my-3 space-y-2 list-disc ${
                isRtl ? "pr-6 list-inside" : "pl-6"
              } text-stone-200 text-sm sm:text-[15px]`}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={`my-3 space-y-2 list-decimal ${
                isRtl ? "pr-6 list-inside" : "pl-6"
              } text-stone-200 text-sm sm:text-[15px]`}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote
              className={`my-3 ${
                isRtl ? "pr-3.5 border-r-2" : "pl-3.5 border-l-2"
              } border-amber-500/70 italic text-stone-300 bg-amber-500/5 py-1.5 rounded-lg`}
            >
              {children}
            </blockquote>
          ),
          code: ({ className, children }) => {
            const isInline = !className;
            return isInline ? (
              <code
                dir="ltr"
                className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700/80 font-mono text-xs text-amber-300 inline-block mx-0.5"
              >
                {children}
              </code>
            ) : (
              <code dir="ltr" className="font-mono text-xs text-emerald-300">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre
              dir="ltr"
              className="my-3 p-3.5 rounded-xl bg-stone-950 border border-stone-800 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed text-left"
            >
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-stone-800 bg-stone-950/60">
              <table className="w-full text-left text-xs divide-y divide-stone-800">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 bg-stone-800/70 font-semibold text-stone-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-stone-300 border-t border-stone-800/60">
              {children}
            </td>
          ),
        }}
      >
        {processedContent}
      </Markdown>
    </div>
  );
};
