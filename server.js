const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: { origin: '*' }
});

let games = {};
let lobbies = {};

// Serve static files from client/dist (built React app)
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// SPA fallback
app.get('(.*)', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// REST API endpoints
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Socket.IO game logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create-lobby', () => {
    const lobbyId = Math.random().toString(36).substring(2, 8).toUpperCase();
    lobbies[lobbyId] = { players: [], settings: {} };
    socket.emit('lobby-created', lobbyId);
  });

  socket.on('join-lobby', (lobbyId) => {
    if (lobbies[lobbyId]) {
      lobbies[lobbyId].players.push(socket.id);
      socket.join(lobbyId);
      socket.emit('joined-lobby', lobbyId);
      io.to(lobbyId).emit('player-joined', socket.id);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
