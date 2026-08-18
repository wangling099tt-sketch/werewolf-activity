import { useState } from 'react';
import { getAvatarUrl } from '../discord.js';
import RolePicker from './RolePicker.jsx';

export default function LobbyScene({ room, me, socket, onLeave, onStart, meRoleMeta }) {
  const [picking, setPicking] = useState(false);
  const [customRoles, setCustomRoles] = useState([]);
  const players = room?.players || [];
  // Anyone can start — no host restriction
  const canStart = players.length >= 3;

  const addBot = () => {
    socket.emit('game:addBot');
  };

  const removeBot = () => {
    socket.emit('game:removeBot');
  };

  const copyCode = () => {
    const code = room?.roomId || '';
    navigator.clipboard?.writeText(code);
  };

  return (
    <>
      <div className="lobby-header">
        <div className="room-info">
          <h2 style={{ margin: 0 }}>🏠 Lobby</h2>
          <button className="room-code" onClick={copyCode} title="Click để copy">
            {room?.roomId || '...'} 📋
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {players.length}/16 người
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={onLeave}>← Thoát</button>
          {players.some((p) => p.id === room.hostId) && !players.find((p) => p.id === room.hostId)?.isBot && (
            <button className="btn btn-ghost" onClick={() => setPicking(true)}>⚙ Vai trò</button>
          )}
        </div>
      </div>

      <div className="lobby-scene" style={{ justifyContent: 'center', padding: '20px 24px' }}>
        {/* Player cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 14,
          maxWidth: 900,
          width: '100%',
          margin: '0 auto',
        }}>
          {players.map((p) => (
            <div
              key={p.id}
              className={`lobby-player-card ${p.id === room.hostId ? 'is-host' : ''} ${p.id === me.id ? 'is-you' : ''} ${p.isBot ? 'is-bot' : ''}`}
            >
              <div className="avatar-ring">
                <img src={getAvatarUrl(p.avatar || p.id)} alt={p.name} />
                {p.id === room.hostId && <span className="badge">👑</span>}
                {p.id === me.id && <span className="badge you-badge">★</span>}
              </div>
              <div className="lobby-player-name">
                {p.name}
                {p.isBot && <span style={{ opacity: 0.6 }}> 🤖</span>}
              </div>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 8 - players.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="lobby-player-card empty">
              <div className="avatar-ring">
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  display: 'grid', placeItems: 'center', fontSize: 28, opacity: 0.4,
                }}>+</div>
              </div>
              <div className="lobby-player-name" style={{ opacity: 0.4 }}>Trống</div>
            </div>
          ))}
        </div>

        {/* Action bar — always visible at bottom */}
        <div className="lobby-bottom-bar">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <button className="btn btn-ghost" onClick={addBot} disabled={players.length >= 16}>
              🤖 Thêm bot ({players.filter(p => p.isBot).length})
            </button>
            {players.some(p => p.isBot) && (
              <button className="btn btn-ghost" onClick={removeBot}>
                ✕ Bớt bot
              </button>
            )}
            <button
              className="btn btn-primary btn-lg"
              disabled={!canStart}
              onClick={onStart}
              style={{ minWidth: 160 }}
            >
              ▶ Bắt đầu ({players.length})
            </button>
          </div>
          {players.length < 3 && (
            <p style={{ color: 'var(--tanner)', fontSize: 12, margin: '8px 0 0', textAlign: 'center' }}>
              ⚠ Cần ít nhất 3 người (hoặc bấm "Thêm bot")
            </p>
          )}
        </div>
      </div>

      {picking && (
        <RolePicker
          target={players.length}
          selected={customRoles}
          onChange={setCustomRoles}
          onClose={() => setPicking(false)}
        />
      )}
    </>
  );
}