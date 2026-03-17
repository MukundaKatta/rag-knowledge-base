import { useState, useEffect, useRef } from 'react';
import { Send, Plus, Trash2, StopCircle } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import * as api from '@/lib/api';
import MessageBubble from '@/components/MessageBubble';
import StreamingText from '@/components/StreamingText';
import type { Collection, ConversationListItem } from '@/types';

export default function ChatPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    streamingContent,
    isStreaming,
    sendMessage,
    stopStream,
    loadConversation,
    resetChat,
  } = useChat();

  useEffect(() => {
    api.getCollections().then(setCollections).catch(console.error);
    api.getConversations().then(setConversations).catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || !selectedCollection || isStreaming) return;
    const msg = input;
    setInput('');
    await sendMessage(msg, selectedCollection);
    api.getConversations().then(setConversations).catch(console.error);
  };

  const handleLoadConvo = async (id: string) => {
    try {
      const convo = await api.getConversation(id);
      loadConversation(convo.messages, convo.id);
      if (convo.collection_id) setSelectedCollection(convo.collection_id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConvo = async (id: string) => {
    try {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      resetChat();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-full">
      {/* Conversation sidebar */}
      <div className="w-64 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-3 border-b border-gray-100">
          <button
            onClick={resetChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
              onClick={() => handleLoadConvo(c.id)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{c.title}</p>
                <p className="text-xs text-gray-400">{c.message_count} messages</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConvo(c.id);
                }}
                className="p-1 text-gray-300 hover:text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-200 bg-white flex items-center gap-3">
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
          >
            <option value="">Select a collection...</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.document_count} docs)
              </option>
            ))}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !streamingContent && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              {selectedCollection
                ? 'Send a message to start chatting with your documents'
                : 'Select a collection to begin'}
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {streamingContent && <StreamingText content={streamingContent} />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={selectedCollection ? 'Ask a question...' : 'Select a collection first'}
              disabled={!selectedCollection || isStreaming}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            {isStreaming ? (
              <button
                onClick={stopStream}
                className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <StopCircle size={18} />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() || !selectedCollection}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
