import { useState, useCallback } from 'react';
import { useSSE } from './useSSE';
import type { Message, Citation, SSEEvent } from '@/types';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [sources, setSources] = useState<Citation[]>([]);
  const { isStreaming, startStream, stopStream } = useSSE();

  const sendMessage = useCallback(
    async (content: string, collectionId: string) => {
      const userMsg: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId || '',
        role: 'user',
        content,
        citations: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setStreamingContent('');
      setSources([]);

      let fullContent = '';
      let finalCitations: Citation[] = [];

      await startStream(
        '/api/chat/send',
        {
          message: content,
          conversation_id: conversationId,
          collection_id: collectionId,
        },
        (event: SSEEvent) => {
          switch (event.type) {
            case 'meta':
              if (event.conversation_id) {
                setConversationId(event.conversation_id);
              }
              break;
            case 'sources':
              if (event.sources) setSources(event.sources);
              break;
            case 'token':
              if (event.content) {
                fullContent += event.content;
                setStreamingContent(fullContent);
              }
              break;
            case 'done':
              if (event.citations) finalCitations = event.citations;
              break;
            case 'error':
              fullContent += `\n\nError: ${event.content}`;
              setStreamingContent(fullContent);
              break;
          }
        },
      );

      const assistantMsg: Message = {
        id: `msg-${Date.now()}`,
        conversation_id: conversationId || '',
        role: 'assistant',
        content: fullContent,
        citations: finalCitations.length > 0 ? finalCitations : null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingContent('');
    },
    [conversationId, startStream],
  );

  const loadConversation = useCallback((msgs: Message[], convId: string) => {
    setMessages(msgs);
    setConversationId(convId);
  }, []);

  const resetChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setStreamingContent('');
    setSources([]);
  }, []);

  return {
    messages,
    conversationId,
    streamingContent,
    sources,
    isStreaming,
    sendMessage,
    stopStream,
    loadConversation,
    resetChat,
  };
}
