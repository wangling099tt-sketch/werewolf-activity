import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { WerewolfGame, PHASES } from './game.js';
import { ROLES } from './roles.js';
import { BotManager } from './bots.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || process.env.GAME_PORT || 3001;
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Serve production build (for Discord Activity iframe)
app.use(express.static(CLIENT_DIST));

// SPA fallback for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, methods: ['GET', 'POST'] },
});

const games = new Map();        // roomId -> { game, botManager, hostSocketId }
const userRooms = new Map();    // socketId -> roomId
const userInfo = new Map();     // socketId -> { id, name, isBot, discordUser }

// === Debug endpoint ===
app.get('/api/debug', (req, res) => {
  res.json({
    hasClientId: !!process.env.VITE_DISCORD_CLIENT_ID,
    hasClientSecret: !!process.env.DISCORD_CLIENT_SECRET,
    clientId: process.env.VITE_DISCORD_CLIENT_ID || 'MISSING',
    redirectUri: process.env.DISCORD_REDIRECT_URI || 'MISSING',
    publicUrl: process.env.PUBLIC_URL || 'MISSING',
  });
});

// === Discord Activity: OAuth2 token exchange ===
app.post('/api/discord/token', async (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'missing code' });
  const clientId = process.env.VITE_DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || CLIENT_URL;
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'Discord OAuth not configured' });
  }
  try {
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    });
    const r = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await r.json();
    if (!r.ok) return res.status(400).json({ error: data.error || 'token exchange failed' });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Verify Discord-signed requests (for Activity webhook — optional)
app.post('/api/discord/verify', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-signature-ed25519'];
  const timestamp = req.headers['x-signature-timestamp'];
  if (!signature || !timestamp) return res.status(401).send('missing signature');
  // Implement ed25519 verification with DISCORD_PUBLIC_KEY
  // (used for slash commands / webhooks from Discord)
  res.status(200).send('ok');
});

function getRoom(roomId, hostId) {
  if (!games.has(roomId)) {
    const game = new WerewolfGame(roomId, hostId);
    games.set(roomId, { game, botManager: new BotManager(game), hostSocketId: hostId, phaseTimer: null });
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
  io.to(roomId).emit('lobby:update', r.game.publicState());
  io.to(roomId).emit('game:state', r.game.publicState());
}

function publicRooms() {
  return Array.from(games.entries())
    .filter(([_, r]) => r.game.phase === PHASES.LOBBY)
    .map(([id, r]) => ({
      id,
      hostName: r.game.players.find((p) => p.id === r.game.hostId)?.name || 'Host',
      players: r.game.players.length,
      maxPlayers: 16,
    }));
}

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
    room.botManager.playAll();

    // === PHASE: NIGHT_INTRO → NIGHT (after 3s) ===
    if (game.phase === PHASES.NIGHT_INTRO) {
      if (r.lastAutoPhase !== PHASES.NIGHT_INTRO) {
        r.lastAutoPhase = PHASES.NIGHT_INTRO;
        r.phaseStart = Date.now();
      }
      if (Date.now() - r.phaseStart >= 3000) {
        game.nextPhase();
        room.botManager.playAll();
        broadcastRoom(roomId);
        r.lastAutoPhase = PHASES.NIGHT;
        r.phaseStart = Date.now();
      }
      return;
    }

    // === PHASE: NIGHT → resolve when all acted OR timeout 25s ===
    if (game.phase === PHASES.NIGHT) {
      if (r.lastAutoPhase !== PHASES.NIGHT) {
        r.lastAutoPhase = PHASES.NIGHT;
        r.phaseStart = Date.now();
      }
      const acting = game.nightActingPlayers();
      const elapsed = Date.now() - r.phaseStart;
      // Auto-skip humans who didn't act after 20s
      if (elapsed >= 20000) {
        game.alivePlayers()
          .filter((p) => !p.hasActed && p.role && game.botManager.bots.has(p.id) === false)
          .forEach((p) => {
            p.hasActed = true; // mark them as acted (skip)
          });
        broadcastRoom(roomId);
      }
      // Force resolve after 25s regardless
      if (acting.length === 0 || elapsed >= 25000) {
        game.nextPhase();
        broadcastRoom(roomId);
        r.lastAutoPhase = PHASES.NIGHT_RESULTS;
        r.phaseStart = Date.now();
      }
      return;
    }

    // === PHASE: NIGHT_RESULTS → DAY_DISCUSS (after 3.5s reveal) ===
    if (game.phase === PHASES.NIGHT_RESULTS) {
      if (r.lastAutoPhase !== PHASES.NIGHT_RESULTS) {
        r.lastAutoPhase = PHASES.NIGHT_RESULTS;
        r.phaseStart = Date.now();
      }
      if (Date.now() - r.phaseStart >= 3500) {
        game.nextPhase();
        room.botManager.playAll();
        broadcastRoom(roomId);
        r.lastAutoPhase = PHASES.DAY_DISCUSS;
        r.phaseStart = Date.now();
      }
      return;
    }

    // === PHASE: DAY_DISCUSS → DAY_VOTE (after 25s) ===
    if (game.phase === PHASES.DAY_DISCUSS) {
      if (r.lastAutoPhase !== PHASES.DAY_DISCUSS) {
        r.lastAutoPhase = PHASES.DAY_DISCUSS;
        r.phaseStart = Date.now();
      }
      if (Date.now() - r.phaseStart >= 25000) {
        game.nextPhase();
        room.botManager.playAll();
        broadcastRoom(roomId);
        r.lastAutoPhase = PHASES.DAY_VOTE;
        r.phaseStart = Date.now();
      }
      return;
    }

    // === PHASE: DAY_VOTE → resolve when all voted OR timeout 30s ===
    if (game.phase === PHASES.DAY_VOTE) {
      if (r.lastAutoPhase !== PHASES.DAY_VOTE && r.lastAutoPhase !== PHASES.DAY_VOTE_RESOLVING) {
        r.lastAutoPhase = PHASES.DAY_VOTE;
        r.phaseStart = Date.now();
      }
      const alive = game.alivePlayers();
      const voted = alive.filter((p) => p.vote !== null && p.vote !== undefined).length;
      const totalAlive = alive.length;
      const elapsed = Date.now() - r.phaseStart;

      // Resolve immediately if all voted
      if (voted >= totalAlive && totalAlive > 0 && r.lastAutoPhase !== PHASES.DAY_VOTE_RESOLVING) {
        r.lastAutoPhase = PHASES.DAY_VOTE_RESOLVING;
        r.resolveStart = Date.now();
      }
      if (r.lastAutoPhase === PHASES.DAY_VOTE_RESOLVING) {
        if (Date.now() - r.resolveStart >= 1500) {
          game.nextPhase();
          room.botManager.playAll();
          broadcastRoom(roomId);
          r.lastAutoPhase = PHASES.NIGHT_INTRO;
          r.phaseStart = Date.now();
        }
        return;
      }
      // Force-resolve after 30s timeout
      if (elapsed >= 30000) {
        // Auto-vote abstain for humans who didn't vote
        alive
          .filter((p) => p.vote === null && p.vote === undefined && !game.botManager.bots.has(p.id))
          .forEach((p) => {
            p.vote = null; // abstain (already null but explicit)
            p.hasActed = true;
          });
        broadcastRoom(roomId);
        r.lastAutoPhase = PHASES.DAY_VOTE_RESOLVING;
        r.resolveStart = Date.now();
      }
      return;
    }

    broadcastRoom(roomId);
  }, 1000);
}

function clearPhaseTick(roomId) {
  const r = games.get(roomId);
  if (r && r.phaseTimer) {
    clearInterval(r.phaseTimer);
    r.phaseTimer = null;
  }
}

app.get('/', (_req, res) => res.send('Werewolf Activity Server'));
app.get('/api/rooms', (_req, res) => res.json(publicRooms()));
app.get('/api/roles', (_req, res) => res.json(ROLES));

io.on('connection', (socket) => {
  console.log(`[+] ${socket.id}`);

  socket.on('auth:login', ({ name, id, avatar }, cb) => {
    userInfo.set(socket.id, { id: id || socket.id, name: name?.slice(0, 24) || 'Player', isBot: false });
    cb?.({ ok: true });
  });

  socket.on('lobby:join', ({ roomId, name, id }, cb) => {
    const info = userInfo.get(socket.id) || { id: socket.id, name: name || 'Player', isBot: false };
    const r = getRoom(roomId, socket.id);
    const result = r.game.addPlayer(info.id, info.name);
    if (!result.ok) {
      cb?.({ ok: false, error: result.error });
      return;
    }
    socket.join(roomId);
    userRooms.set(socket.id, roomId);
    cb?.({ ok: true });
    broadcastRoom(roomId);
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

  socket.on('game:addBot', () => {
    const r = getRoomBySocket(socket.id);
    if (!r) return;
    if (r.game.players.length >= 16) return;
    r.botManager.addBot();
    broadcastRoom(r.game.roomId);
  });

  socket.on('game:removeBot', () => {
    const r = getRoomBySocket(socket.id);
    if (!r) return;
    // Find last bot and remove
    const bot = [...r.botManager.bots.keys()].reverse().find((id) =>
      r.game.players.find((p) => p.id === id)
    );
    if (bot) {
      r.botManager.bots.delete(bot);
      r.game.removePlayer(bot);
      broadcastRoom(r.game.roomId);
    }
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

  socket.on('game:start', ({ customRoles }, cb) => {
    const roomId = userRooms.get(socket.id);
    if (!roomId) return cb?.({ ok: false, error: 'Chưa vào phòng' });
    const r = games.get(roomId);
    if (!r) return cb?.({ ok: false });
    // Anyone can start — no host-only restriction
    const result = r.game.start(customRoles);
    if (!result.ok) return cb?.(result);
    // Bots act immediately
    r.botManager.playAll();
    broadcastRoom(roomId);
    result.assignments.forEach(({ id, role, team }) => {
      io.to(roomId).emit('role:assigned', { id, role, team });
    });
    schedulePhaseTick(roomId);
    cb?.({ ok: true });
  });

  socket.on('phase:next', () => {
    const roomId = userRooms.get(socket.id);
    if (!roomId) return;
    const r = games.get(roomId);
    if (!r) return;
    // Anyone can advance phase
    r.game.nextPhase();
    r.botManager.playAll();
    broadcastRoom(roomId);
    // Bots chat during day - more frequently
    if (r.game.phase === PHASES.DAY_DISCUSS) {
      const chatLines = [
        'Tui nghĩ {t} đáng nghi 👀',
        '{t} vote ai? Cho tui biết đi',
        'Đừng tin ai cả 😇',
        'Ai có manh mối gì không?',
        'Vote nhầm còn hơn bỏ sót',
        'Hmm... ai vote {t} vậy 🤔',
        'Tui thấy {t} hôm qua đáng nghi lắm...',
        'Vote {t} đi mọi người!',
        'Đừng vote tui mà 😱',
        'Sói đừng giả danh dân nữa',
        'Ta biết ai là sói rồi...',
        'Tui phải bảo vệ gia đình mình 🛡',
        'Đêm qua nghe rợn người',
        'Mọi người phải tỉnh táo',
        'Tui tin {t} mà',
        'Có ai muốn nói gì không?',
      ];
      // Send multiple chat messages over time
      const sendOne = () => {
        const alive = r.game.alivePlayers();
        if (!alive.length) return;
        const target = alive[Math.floor(Math.random() * alive.length)].name;
        const line = chatLines[Math.floor(Math.random() * chatLines.length)].replace(/{t}/g, target);
        r.botManager.chatOnce([line]);
        broadcastRoom(roomId);
      };
      setTimeout(sendOne, 2000);
      setTimeout(sendOne, 5500);
      setTimeout(sendOne, 10000);
    }
    // Bots sometimes chat at night too (system logs)
    if (r.game.phase === PHASES.NIGHT_INTRO) {
      const nightLines = [
        '🌙 Ai đang thức đêm nay?',
        '🌙 Tui nghe có tiếng bước chân...',
        '🌙 Im lặng... rất im lặng',
      ];
      setTimeout(() => {
        r.botManager.chatOnce([nightLines[Math.floor(Math.random() * nightLines.length)]]);
        broadcastRoom(roomId);
      }, 1500);
    }
  });

  socket.on('action:vote', ({ targetId }, cb) => {
    const roomId = userRooms.get(socket.id);
    if (!roomId) return cb?.({ ok: false });
    const r = games.get(roomId);
    if (!r) return;
    r.game.castVote(socket.id, targetId);
    broadcastRoom(roomId);
    cb?.({ ok: true });
  });

  socket.on('action:night', ({ targetId, ability }, cb) => {
    const roomId = userRooms.get(socket.id);
    if (!roomId) return cb?.({ ok: false });
    const r = games.get(roomId);
    if (!r) return;
    const result = r.game.submitNightAction(socket.id, targetId, ability);
    if (result.ok) {
      const privateState = r.game.privateState(socket.id);
      if (privateState?.inspectResult) {
        io.to(socket.id).emit('private:inspect', privateState.inspectResult);
      }
      // Run bots immediately so humans see updates
      r.botManager.playAll();
      broadcastRoom(roomId);
    }
    cb?.(result);
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
  console.log(`🐺 Werewolf server on http://localhost:${PORT}`);
});