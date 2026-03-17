import { User, Bot } from 'lucide-react';
import clsx from 'clsx';
import MarkdownRenderer from './MarkdownRenderer';
import CitationCard from './CitationCard';
import type { Message } from '@/types';

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={clsx('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot size={16} className="text-white" />
        </div>
      )}
      <div
        className={clsx(
          'max-w-[75%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white border border-gray-200 text-gray-800',
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-sm prose prose-sm max-w-none">
            <MarkdownRenderer content={message.content} />
          </div>
        )}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-gray-100 pt-2">
            <p className="text-xs font-semibold text-gray-500">Sources:</p>
            {message.citations.map((c, i) => (
              <CitationCard key={i} citation={c} />
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
          <User size={16} className="text-white" />
        </div>
      )}
    </div>
  );
}
