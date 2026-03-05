import { useEffect, useRef, useCallback, useState } from 'react';

export interface WSEvent {
  type: 'agent:update' | 'activity:new' | 'neural:update' | 'costs:update' | 'connected';
  data?: unknown;
  timestamp?: string;
}

interface UseWebSocketOptions {
  url?: string;
  onMessage?: (event: WSEvent) => void;
  enabled?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket({
  url,
  onMessage,
  enabled = true,
  reconnectInterval = 5000,
}: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const getWsUrl = useCallback(() => {
    if (url) return url;
    // Auto-detect WebSocket URL from current page
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }, [url]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const wsUrl = getWsUrl();
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WS] Connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WSEvent;
          onMessageRef.current?.(data);
        } catch (err) {
          console.warn('[WS] Failed to parse message:', err);
        }
      };

      ws.onclose = () => {
        console.log('[WS] Disconnected');
        setIsConnected(false);
        wsRef.current = null;

        // Auto-reconnect
        if (enabled) {
          reconnectTimer.current = setTimeout(connect, reconnectInterval);
        }
      };

      ws.onerror = (err) => {
        console.warn('[WS] Error:', err);
        ws.close();
      };

      wsRef.current = ws;
    } catch (err) {
      console.warn('[WS] Connection failed:', err);
      // Retry
      reconnectTimer.current = setTimeout(connect, reconnectInterval);
    }
  }, [getWsUrl, enabled, reconnectInterval]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    connect();

    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [enabled, connect]);

  return { send, isConnected, ws: wsRef };
}
