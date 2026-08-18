// Universal Socket/WS client - works with both Socket.io (Railway) and raw WebSocket (Cloudflare)

import { io, Socket } from 'socket.io-client';

const STORAGE_KEY = 'wv_server_type';

export type ServerType = 'railway' | 'cloudflare' | 'auto';

export function getServerType(): ServerType {
  if (typeof window === 'undefined') return 'auto';
  return (localStorage.getItem(STORAGE_KEY) as ServerType) || 'auto';
}

export function setServerType(type: ServerType) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, type);
}

export class UniversalSocket {
  private socket: Socket | null = null;
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private type: 'socketio' | 'websocket' = 'socketio';
  private wsUrl: string = '';

  constructor(private url: string = '') {
    const serverType = getServerType();
    if (serverType === 'cloudflare') {
      this.connectWebSocket();
    } else if (serverType === 'railway') {
      this.connectSocketIO();
    } else {
      // Auto-detect
      this.connectSocketIO();
    }
  }

  private connectSocketIO() {
    this.type = 'socketio';
    this.socket = io(this.url || window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    // Forward events
    ['game:state', 'lobby:update', 'role:private', 'private:inspect'].forEach(event => {
      this.socket!.on(event, (data: any) => this.emit(event, data));
    });

    this.socket.on('connect', () => this.emit('connect', {}));
    this.socket.on('disconnect', () => this.emit('disconnect', {}));
  }

  private connectWebSocket() {
    this.type = 'websocket';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.wsUrl = (this.url || `${protocol}//${window.location.host}/ws`) + '/lobby';
    
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => this.emit('connect', {});
      this.ws.onclose = () => {
        this.emit('disconnect', {});
        // Reconnect after 3s
        setTimeout(() => this.connectWebSocket(), 3000);
      };
      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.emit(msg.type || 'message', msg.data || msg);
        } catch (e) {
          // ignore
        }
      };
      this.ws.onerror = () => this.emit('disconnect', {});
    } catch (e) {
      console.error('WebSocket failed, falling back to Socket.io');
      this.connectSocketIO();
    }
  }

  emit_event(event: string, data: any) {
    if (this.type === 'socketio' && this.socket) {
      this.socket.emit(event, data);
    } else if (this.type === 'websocket' && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: event, data }));
    }
  }

  on(event: string, handler: (data: any) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: (data: any) => void) {
    this.listeners.get(event)?.delete(handler);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(h => h(data));
  }

  disconnect() {
    this.socket?.disconnect();
    this.ws?.close();
  }

  get connected(): boolean {
    if (this.type === 'socketio') return this.socket?.connected || false;
    return this.ws?.readyState === WebSocket.OPEN;
  }
}