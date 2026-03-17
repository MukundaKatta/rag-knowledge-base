import MarkdownRenderer from './MarkdownRenderer';

interface Props {
  content: string;
}

export default function StreamingText({ content }: Props) {
  if (!content) return null;

  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      </div>
      <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-white border border-gray-200 text-gray-800">
        <div className="text-sm prose prose-sm max-w-none">
          <MarkdownRenderer content={content} />
        </div>
        <span className="inline-block w-1.5 h-4 bg-blue-500 animate-pulse ml-0.5" />
      </div>
    </div>
  );
}
