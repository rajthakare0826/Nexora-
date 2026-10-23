import Markdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const MarkdownComponents = {
    h1: ({ children, ...props }: any) => (
      <h1 className="text-lg font-bold text-white mt-4 mb-2 tracking-tight border-b border-white/5 pb-1" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-base font-bold text-slate-100 mt-3 mb-1.5 tracking-tight" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-sm font-semibold text-slate-200 mt-2.5 mb-1" {...props}>
        {children}
      </h3>
    ),
    p: ({ children, ...props }: any) => (
      <p className="text-sm text-slate-300 leading-relaxed mb-2.5" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc pl-5 mb-3 space-y-1.5 text-slate-300" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-slate-300" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="text-sm text-slate-300 pl-0.5" {...props}>
        {children}
      </li>
    ),
    strong: ({ children, ...props }: any) => (
      <strong className="font-bold text-blue-300" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }: any) => (
      <em className="italic text-slate-200" {...props}>
        {children}
      </em>
    ),
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      const isInline = !match && !String(children).includes("\n");
      return isInline ? (
        <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[11px]" {...props}>
          {children}
        </code>
      ) : (
        <pre className="bg-slate-950/60 border border-white/5 p-4 rounded-xl overflow-x-auto font-mono text-[11px] text-slate-300 my-3 block shadow-inner scrollbar-thin">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      );
    },
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto my-4 rounded-xl border border-white/5 bg-slate-950/20 shadow-md">
        <table className="min-w-full divide-y divide-white/5 text-xs text-left" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead className="bg-white/[0.02]" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }: any) => (
      <tbody className="divide-y divide-white/5" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }: any) => (
      <tr className="hover:bg-white/[0.01] transition-colors" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }: any) => (
      <th className="px-4 py-2.5 font-semibold text-slate-200 font-mono uppercase tracking-wider text-[10px]" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="px-4 py-2.5 text-slate-300 whitespace-pre-wrap" {...props}>
        {children}
      </td>
    ),
    a: ({ children, ...props }: any) => (
      <a 
        className="text-blue-400 hover:text-blue-300 underline font-medium transition-colors" 
        target="_blank" 
        rel="noreferrer" 
        {...props}
      >
        {children}
      </a>
    ),
  };

  return (
    <div className="markdown-body">
      <Markdown components={MarkdownComponents}>{content}</Markdown>
    </div>
  );
}
