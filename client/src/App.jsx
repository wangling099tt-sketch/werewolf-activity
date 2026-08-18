import { useEffect, useRef, useState } from 'react';
import { useSocket, useGame } from './hooks/useGame.js';
import { getOrCreateUser, setUserName, getAvatarUrl } from './discord.js';
import { ROLE_META } from './roles.js';
import HomeScreen from './components/HomeScreen.jsx';
import LobbyScene from './components/LobbyScene.jsx';
import GameScene from './components/GameScene.jsx';
import AuthOverlay from './components/AuthOverlay.jsx';

export default function App() {
  const socket = useSocket();
  const { room, me, myRole, inspect, logs, setMe, setRoom } = useGame(socket);
  const [view, setView] = useState('home'); // 'home' | 'lobby' | 'game'
  const [showAuth, setShowAuth] = useState(true);
  const [pendingRoom, setPendingRoom] = useState(null);
  const [pendingName, setPendingName] = useState(null);

  // On mount: try to get user from Discord SDK or localStorage
  useEffect(() => {
    (async () => {
      const user = await getOrCreateUser();
      setMe(user);
    })();
  }, []);

  const handleCreate = async () => {
    const code = Math.random().toString(36).slice(2, 6).toUpperCase();
    setPendingRoom(code);
    setView('lobby');
    socket.emit('lobby:join', { roomId: code, name: me.name, id: me.id });
  };

  const handleJoin = (roomId) => {
    setPendingRoom(roomId);
    setView('lobby');
    socket.emit('lobby:join', { roomId, name: me.name, id: me.id });
  };

  const handleLeave = () => {
    socket.emit('lobby:leave');
    setView('home');
    setRoom(null);
  };

  const handleStartGame = () => {
    socket.emit('game:start', { customRoles: null });
    setView('game');
  };

  // Watch room phase changes
  useEffect(() => {
    if (!room) return;
    if (room.phase !== 'lobby' && view === 'lobby') {
      setView('game');
    } else if (room.phase === 'lobby' && view === 'game') {
      // back to lobby
    }
  }, [room?.phase]);

  const meRoleMeta = myRole ? ROLE_META[myRole.role] : null;

  return (
    <div className={`scene ${room && room.phase !== 'lobby' && room.phase !== 'ended' && (room.phase.includes('night')) ? 'is-night' : ''}`}>
      <div className="stars" />
      <div className="ground" />
      <div className="campfire" />

      {showAuth && !me && <AuthOverlay />}
      {!me ? (
        <div style={{ position: 'relative', zIndex: 1, padding: 20, textAlign: 'center', color: 'var(--text)' }}>
          Đang tải...
        </div>
      ) : view === 'home' ? (
        <HomeScreen me={me} onCreate={handleCreate} onJoin={handleJoin} setShowAuth={setShowAuth} />
      ) : view === 'lobby' ? (
        <LobbyScene room={room} me={me} socket={socket} onLeave={handleLeave} onStart={handleStartGame} meRoleMeta={meRoleMeta} />
      ) : (
        <GameScene room={room} me={me} socket={socket} myRole={myRole} inspect={inspect} logs={logs} meRoleMeta={meRoleMeta} />
      )}
    </div>
  );
}