import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { WerewolfGame, PHASES, ROLES } from './game.js';
import { BotManager } from './bots.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || process.env.GAME_PORT || 3001;
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// CSP headers - allow Discord Activity iframe + Google Fonts + Socket.io
app.use((_req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: ws: wss:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.discord.com https://*.discordapp.com https://*.discord.gg",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com blob:",
      "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.googleapis.com https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://cdn.discordapp.com https://*.discord.com https://*.discordapp.com https://api.dicebear.com https://*.githubusercontent.com",
      "connect-src 'self' ws: wss: http: https: data: blob: https://*.discord.com https://*.discordapp.com https://*.discord.gg https://gateway.discord.gg https://*.discord.media",
      "media-src 'self' blob: https://*.discord.com https://*.discordapp.com",
      "frame-ancestors 'self' https://*.discord.com https://discord.com https://*.discord.gg https://canary.discord.com",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
    ].join('; ')
  );
  res.setHeader('X-Frame-Options', 'ALLOW-FROM https://discord.com https://*.discord.com https://*.discord.gg');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.use(express.static(CLIENT_DIST));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, methods: ['GET', 'POST'] },
});

const games = new Map();
const userRooms = new Map();
const userInfo = new Map();

// === Health Check ===
app.get('/', (_req, res) => res.send('🐺 Wolvesville Server Ready'));
app.get('/api/rooms', (_req, res) => {
  res.json(Array.from(games.entries())
    .filter(([_, r]) => r.game.phase === PHASES.LOBBY)
    .map(([id, r]) => ({
      id,
      hostName: r.game.players.find((p) => p.id === r.game.hostId)?.name || 'Host',
      players: r.game.players.length,
      maxPlayers: 16,
    }))
  );
});

app.get('/api/roles', (_req, res) => res.json(ROLES));

function getRoom(roomId, hostId) {
  if (!games.has(roomId)) {
    const game = new WerewolfGame(roomId, hostId);
    const botManager = new BotManager(game);
    games.set(roomId, {
      game,
      botManager,
      hostSocketId: hostId,
      phaseTimer: null,
      voiceChannelMembers: [],
    });
  }
  return games.get(roomId);
}

function getRoomBySocket(socketId) {
  const roomId = userRooms.get(socketId);
  if (!roomId) return null;
  return games.get(roomId);
}

function broadcastRoom(roomId) {
  const r = games.get(roomId);
  if (!r) return;
  const state = r.game.publicState();
  io.to(roomId).emit('lobby:update', state);
  io.to(roomId).emit('game:state', state);
}

function broadcastPrivateState(roomId) {
  const r = games.get(roomId);
  if (!r) return;
  io.to(roomId).emit('private:roles', {});
  // Send each socket their private state
  for (const [socketId, rmId] of userRooms.entries()) {
    if (rmId !== roomId) continue;
    const info = userInfo.get(socketId);
    if (!info) continue;
    const privateState = r.game.privateState(info.id);
    if (privateState) {
      io.to(socketId).emit('role:private', privateState);
    }
  }
}

// === Phase Timer ===
function schedulePhaseTick(roomId) {
  const r = games.get(roomId);
  if (!r || r.phaseTimer) return;
  r.lastAutoPhase = r.lastAutoPhase || null;
  r.phaseTimer = setInterval(() => {
    const room = games.get(roomId);
    if (!room) return;
    const game = room.game;
    if (game.phase === PHASES.ENDED || game.phase === PHASES.LOBBY) {
      clearInterval(room.phaseTimer);
      room.phaseTimer = null;
      return;
    }
    
    const elapsed = Date.now() - (game.phaseStartTime || Date.now());
    const duration = game.phaseDuration || 30000;
    
    // Bots play
    room.botManager.playAll();
    
    // ROLE_REVEAL → NIGHT after 5s
    if (game.phase === PHASES.ROLE_REVEAL && elapsed >= 5000) {
      game.advancePhase();
      broadcastRoom(roomId);
      return;
    }
    
    // NIGHT → resolve after 25s or all acted
    if (game.phase === PHASES.NIGHT) {
      const allActed = game.players
        .filter(p => p.alive && ['werewolf', 'seer', 'bodyguard'].includes(p.role))
        .every(p => p.hasActed);
      if (allActed || elapsed >= 25000) {
        game.advancePhase();
        broadcastRoom(roomId);
      }
      return;
    }
    
    // NIGHT_RESULTS → DAY after 3s
    if (game.phase === PHASES.NIGHT_RESULTS && elapsed >= 3500) {
      game.advancePhase();
      broadcastRoom(roomId);
      return;
    }
    
    // DAY_DISCUSS → VOTE after 45s (dev fast)
    if (game.phase === PHASES.DAY_DISCUSS && elapsed >= 45000) {
      game.advancePhase();
      broadcastRoom(roomId);
      return;
    }
    
    // DAY_VOTE → resolve when all voted or 30s
    if (game.phase === PHASES.DAY_VOTE) {
      const alive = game.alivePlayers?.() || game.players.filter(p => p.alive);
      const voted = alive.filter(p => p.vote !== null).length;
      const total = alive.length;
      if ((voted >= total && total > 0) || elapsed >= 30000) {
        game.advancePhase();
        broadcastRoom(roomId);
      }
      return;
    }
    
    // VOTE_RESULTS → NIGHT after 3s
    if (game.phase === PHASES.VOTE_RESULTS && elapsed >= 3500) {
      game.advancePhase();
      broadcastRoom(roomId);
      return;
    }
  }, 1000);
}

function clearPhaseTick(roomId) {
  const r = games.get(roomId);
  if (r && r.phaseTimer) {
    clearInterval(r.phaseTimer);
    r.phaseTimer = null;
  }
}

// === Socket Events ===
io.on('connection', (socket) => {
  console.log(`[+] ${socket.id}`);

  socket.on('auth:login', ({ name, id, avatar }, cb) => {
    userInfo.set(socket.id, {
      id: id || socket.id,
      name: name?.slice(0, 24) || 'Player',
      avatar: avatar || '',
      isBot: false
    });
    cb?.({ ok: true });
  });

  socket.on('lobby:create', ({ name, id, avatar }, cb) => {
    const info = userInfo.get(socket.id) || { id: socket.id, name: name || 'Player', avatar: avatar || '' };
    const roomId = 'WV-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const r = getRoom(roomId, socket.id);
    const result = r.game.addPlayer(info.id, info.name, info.avatar);
    if (!result.ok) return cb?.({ ok: false, error: result.error });
    socket.join(roomId);
    userRooms.set(socket.id, roomId);
    cb?.({ ok: true, roomId });
    broadcastRoom(roomId);
  });

  socket.on('lobby:join', ({ roomId, name, id, avatar }, cb) => {
    const info = userInfo.get(socket.id) || { id: socket.id, name: name || 'Player', avatar: avatar || '' };
    const r = getRoom(roomId, socket.id);
    const result = r.game.addPlayer(info.id, info.name, info.avatar);
    if (!result.ok) return cb?.({ ok: false, error: result.error });
    socket.join(roomId);
    userRooms.set(socket.id, roomId);
    cb?.({ ok: true, roomId });
    broadcastRoom(roomId);
    broadcastPrivateState(roomId);
  });

  socket.on('lobby:leave', () => {
    const roomId = userRooms.get(socket.id);
    if (!roomId) return;
    const r = games.get(roomId);
    if (r) {
      r.game.removePlayer(socket.id);
      broadcastRoom(roomId);
    }
    socket.leave(roomId);
    userRooms.delete(socket.id);
  });

  socket.on('lobby:addBot', () => {
    const r = getRoomBySocket(socket.id);
    if (!r) return;
    r.botManager.addBot();
    broadcastRoom(r.game.roomId);
  });

  socket.on('lobby:setRoleDeck', ({ deck }, cb) => {
    const r = getRoomBySocket(socket.id);
    if (!r || r.game.hostId !== socket.id) return cb?.({ ok: false, error: 'Not host' });
    r.game.roleDeck = { ...r.game.roleDeck, ...deck };
    broadcastRoom(r.game.roomId);
    cb?.({ ok: true });
  });

  socket.on('game:start', ({ customRoles }, cb) => {
    const roomId = userRooms.get(socket.id);
    if (!roomId) return cb?.({ ok: false, error: 'Chưa vào phòng' });
    const r = games.get(roomId);
    if (!r) return cb?.({ ok: false });
    const result = r.game.start(customRoles || r.game.roleDeck);
    if (!result.ok) return cb?.(result);
    r.botManager.playAll();
    broadcastRoom(roomId);
    broadcastPrivateState(roomId);
    schedulePhaseTick(roomId);
    cb?.({ ok: true });
  });

  socket.on('action:night', ({ targetId, ability }, cb) => {
    const roomId = userRooms.get(socket.id);
    if (!roomId) return cb?.({ ok: false });
    const r = games.get(roomId);
    if (!r) return;
    const info = userInfo.get(socket.id);
    const result = r.game.submitNightAction(info.id, targetId, ability);
    if (result.ok) {
      const privateState = r.game.privateState(info.id);
      if (privateState?.inspectResult) {
        io.to(socket.id).emit('private:inspect', privateState.inspectResult);
      }
      r.botManager.playAll();
      broadcastRoom(roomId);
    }
    cb?.(result);
  });

  socket.on('action:vote', ({ targetId }, cb) => {
    const roomId = userRooms.get(socket.id);
    if (!roomId) return cb?.({ ok: false });
    const r = games.get(roomId);
    if (!r) return;
    const info = userInfo.get(socket.id);
    const result = r.game.castVote(info.id, targetId);
    if (result.ok) broadcastRoom(roomId);
    cb?.(result);
  });

  socket.on('chat:send', ({ text }) => {
    const roomId = userRooms.get(socket.id);
    if (!roomId) return;
    const r = games.get(roomId);
    if (!r) return;
    const info = userInfo.get(socket.id);
    const msg = (text || '').trim().slice(0, 200);
    if (!msg) return;
    r.game.log.push(`💬 ${info?.name || '?'}: ${msg}`);
    broadcastRoom(roomId);
  });

  // Discord voice channel sync
  socket.on('voice:updateMembers', ({ members }) => {
    const roomId = userRooms.get(socket.id);
    if (!roomId) return;
    const r = games.get(roomId);
    if (r) {
      r.voiceChannelMembers = members || [];
      broadcastRoom(roomId);
    }
  });

  socket.on('disconnect', () => {
    const roomId = userRooms.get(socket.id);
    if (roomId) {
      const r = games.get(roomId);
      if (r) {
        r.game.removePlayer(socket.id);
        broadcastRoom(roomId);
      }
    }
    userRooms.delete(socket.id);
    userInfo.delete(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🐺 Wolvesville server on http://localhost:${PORT}`);
});