import ReactMarkdown from 'react-markdown';

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        code: ({ children, className }) => {
          const isBlock = className?.includes('language-');
          if (isBlock) {
            return (
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto my-2 text-xs">
                <code>{children}</code>
              </pre>
            );
          }
          return (
            <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-xs">
              {children}
            </code>
          );
        },
        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-400 pl-3 my-2 text-gray-600 italic">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
