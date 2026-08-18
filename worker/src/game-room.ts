// Durable Object for game room state
import { WerewolfGame } from './game';

export class GameRoom {
  private state: DurableObjectState;
  private game: WerewolfGame | null = null;
  private sessions: Set<WebSocket> = new Set();

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname.endsWith('/ws') && request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair) as [WebSocket, WebSocket];
      
      this.handleSession(server);
      
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    return new Response('Expected WebSocket', { status: 400 });
  }

  handleSession(ws: WebSocket) {
    this.sessions.add(ws);
    
    ws.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data as string);
        this.handleMessage(ws, msg);
      } catch (e) {
        // ignore
      }
    });

    ws.addEventListener('close', () => {
      this.sessions.delete(ws);
    });

    // Send initial state
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to Wolvesville game room',
    }));
  }

  broadcast(msg: any) {
    const data = JSON.stringify(msg);
    for (const ws of this.sessions) {
      try {
        ws.send(data);
      } catch (e) {
        // ignore
      }
    }
  }

  handleMessage(ws: WebSocket, msg: any) {
    switch (msg.type) {
      case 'join':
        if (!this.game) {
          this.game = new WerewolfGame(msg.roomId, msg.playerId);
        }
        this.game.addPlayer(msg.playerId, msg.name, msg.avatar);
        this.broadcast({ type: 'game:state', state: this.game.publicState() });
        break;
      
      case 'start':
        if (this.game) {
          this.game.start(msg.deck);
          this.broadcast({ type: 'game:state', state: this.game.publicState() });
        }
        break;
      
      case 'night':
        if (this.game) {
          this.game.submitNightAction(msg.playerId, msg.targetId, msg.ability);
          this.broadcast({ type: 'game:state', state: this.game.publicState() });
        }
        break;
      
      case 'vote':
        if (this.game) {
          this.game.castVote(msg.playerId, msg.targetId);
          this.broadcast({ type: 'game:state', state: this.game.publicState() });
        }
        break;
    }
  }
}