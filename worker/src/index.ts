// Minimal Durable Object-based game server for Cloudflare Workers
// Simplified version without Socket.io - uses WebSocket only

export { GameRoom } from './game-room';

export interface Env {
  GAME_ROOM: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // WebSocket upgrade
    if (url.pathname.startsWith('/ws/')) {
      const roomId = url.pathname.split('/')[2];
      const id = env.GAME_ROOM.idFromName(roomId);
      const room = env.GAME_ROOM.get(id);
      return room.fetch(request);
    }

    // API routes
    if (url.pathname === '/api/rooms') {
      return new Response(JSON.stringify([
        { id: 'WV-DEMO1', hostName: 'DemoHost', players: 1, maxPlayers: 16 },
        { id: 'WV-DEMO2', hostName: 'QuickGame', players: 4, maxPlayers: 16 },
      ]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/api/roles') {
      return new Response(JSON.stringify({
        werewolf: { name: 'Werewolf', team: 'wolf', color: '#e74c3c' },
        seer: { name: 'Seer', team: 'town', color: '#3498db' },
        bodyguard: { name: 'Bodyguard', team: 'town', color: '#27ae60' },
        villager: { name: 'Villager', team: 'town', color: '#f39c12' },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/') {
      return new Response('🐺 Wolvesville Cloudflare Worker Ready', { headers: corsHeaders });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};