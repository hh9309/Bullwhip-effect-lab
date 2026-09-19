/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import katex from "katex";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface KatexMathProps {
  math: string;
  block?: boolean;
  className?: string;
}

/**
 * 直接渲染单个 LaTeX 数学公式组件
 */
export const KatexMath: React.FC<KatexMathProps> = ({
  math,
  block = false,
  className = "",
}) => {
  const html = useMemo(() => {
    if (!math) return "";
    let formula = math.trim();
    // 剔除可能自带的前后 $ 或 $$ 符号
    if (formula.startsWith("$$") && formula.endsWith("$$")) {
      formula = formula.slice(2, -2).trim();
    } else if (formula.startsWith("$") && formula.endsWith("$")) {
      formula = formula.slice(1, -1).trim();
    }

    try {
      return katex.renderToString(formula, {
        displayMode: block,
        throwOnError: false,
        strict: false,
      });
    } catch (err) {
      console.warn("KaTeX render error for formula:", formula, err);
      return `<span class="text-red-500 font-mono text-xs">${formula}</span>`;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`my-2 overflow-x-auto py-1 text-stone-900 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block mx-0.5 text-stone-900 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

interface InlineMathTextProps {
  text: string;
  className?: string;
}

/**
 * 快速解析包含 $ ... $ 或 $$ ... $$ 的单段文本或短语并转换为 KaTeX
 */
export const InlineMathText: React.FC<InlineMathTextProps> = ({
  text,
  className = "",
}) => {
  const parts = useMemo(() => {
    if (!text) return [];
    // 匹配 $$...$$ (双美元块级) 或 $...$ (单美元行内，前后不能紧跟空白字符)
    const regex = /(\$\$[\s\S]+?\$\$|\$(?!\s)[^\$\n]+?(?<!\s)\$)/g;
    const tokens: { type: "text" | "math"; value: string; isBlock?: boolean }[] = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({
          type: "text",
          value: text.slice(lastIndex, match.index),
        });
      }

      const matchedStr = match[0];
      const isBlock = matchedStr.startsWith("$$") && matchedStr.endsWith("$$");
      const rawFormula = isBlock
        ? matchedStr.slice(2, -2)
        : matchedStr.slice(1, -1);

      tokens.push({
        type: "math",
        value: rawFormula,
        isBlock,
      });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      tokens.push({
        type: "text",
        value: text.slice(lastIndex),
      });
    }

    return tokens;
  }, [text]);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return <React.Fragment key={index}>{part.value}</React.Fragment>;
        }
        return (
          <KatexMath
            key={index}
            math={part.value}
            block={part.isBlock}
          />
        );
      })}
    </span>
  );
};

interface MarkdownKatexProps {
  content: string;
  className?: string;
}

/**
 * 完整 Markdown 渲染器，支持段落、列表、代码、行内 $...$ 与 块级 $$...$$ 的 KaTeX 公式渲染
 */
export const MarkdownKatex: React.FC<MarkdownKatexProps> = ({
  content,
  className = "",
}) => {
  return (
    <div className={`markdown-katex-wrapper text-stone-800 leading-relaxed text-xs sm:text-sm space-y-2.5 ${className}`}>
      <Markdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-stone-900 border-b border-stone-200 pb-1 mt-3 mb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-stone-900 mt-2.5 mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-900 inline-block" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold text-stone-800 mt-2 mb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc pl-4 space-y-1 mb-2 text-stone-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 space-y-1 mb-2 text-stone-700">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-stone-900">{children}</strong>
          ),
          code: ({ children, className }) => {
            const isInline = !className?.includes("language-");
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-stone-200/80 font-mono text-[11px] text-stone-800">
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-3 rounded-xl bg-stone-900 text-stone-100 font-mono text-xs overflow-x-auto my-2">
                <code>{children}</code>
              </pre>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-stone-400 pl-3 italic text-stone-600 my-2 bg-stone-50/70 py-1 rounded-r">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full divide-y divide-stone-200 border border-stone-200 text-xs text-left">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-1.5 bg-stone-100 font-semibold text-stone-800 border-b border-stone-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-1.5 border-b border-stone-100 text-stone-700">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};
