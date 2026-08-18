import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || '';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const sock = io(SERVER_URL || window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
    });

    socketRef.current = sock;
    setSocket(sock);

    sock.on('connect', () => {
      console.log('🔌 Connected:', sock.id);
      setConnected(true);
    });

    sock.on('disconnect', () => {
      console.log('🔌 Disconnected');
      setConnected(false);
    });

    return () => {
      sock.disconnect();
    };
  }, []);

  return { socket, connected };
}

export function useSocketEvent<T = any>(
  socket: Socket | null,
  event: string,
  handler: (data: T) => void
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!socket) return;
    const wrappedHandler = (data: T) => handlerRef.current(data);
    socket.on(event, wrappedHandler);
    return () => {
      socket.off(event, wrappedHandler);
    };
  }, [socket, event]);
}