import { useEffect, useCallback, useRef } from "react";


const useWebSocket = (chatId: number | null, onMessage: (message: any) => void) => {
    const ws = useRef<WebSocket | null>(null);
    const onMessageRef = useRef(onMessage);
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (ws.current) {
                ws.current.close(1000, "Component unmounted");
            }
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    const connect = useCallback(() => {
        if (!chatId || !isMountedRef.current) return;

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = "localhost:8000";  // <--- жестко прописываем API-сервер
        const wsUrl = `${protocol}//${host}/ws/chat/${chatId}?token=${token}`;

        if (ws.current) {
            ws.current.close(1000, "Reconnecting");
        }

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('WebSocket connected');
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
        };

        ws.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                onMessageRef.current(message);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.current.onclose = (event) => {
            console.log(`WebSocket disconnected: ${event.code} - ${event.reason}`);
            
            if (event.code !== 1000 && isMountedRef.current && chatId) {
                reconnectTimerRef.current = setTimeout(() => {
                    console.log('Reconnecting WebSocket...');
                    connect();
                }, 3000);
            }
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            if (ws.current?.readyState === WebSocket.OPEN || ws.current?.readyState === WebSocket.CONNECTING) {
            ws.current.close(1000, "Component unmounted");
            }
        };
    }, [chatId]);

    useEffect(() => {
        if (chatId && isMountedRef.current) {
            connect();
        }
    }, [chatId, connect]);

    const sendMessage = useCallback((content: string) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ content }));
            return true;
        }
        return false;
    }, []);

    return { sendMessage };
};

export default useWebSocket;
