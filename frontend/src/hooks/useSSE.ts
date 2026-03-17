import { useCallback, useRef, useState } from 'react';
import type { SSEEvent } from '@/types';

export function useSSE() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (
      url: string,
      body: Record<string, unknown>,
      onEvent: (event: SSEEvent) => void,
    ) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error('Stream request failed');
        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const event: SSEEvent = JSON.parse(line.slice(6));
                onEvent(event);
              } catch {
                // skip malformed
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          onEvent({ type: 'error', content: err.message });
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [],
  );

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { isStreaming, startStream, stopStream };
}
