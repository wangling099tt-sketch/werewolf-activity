import { useState } from 'react';
import { getAvatarUrl } from '../discord.js';
import RolePicker from './RolePicker.jsx';

export default function LobbyScene({ room, me, socket, onLeave, onStart, meRoleMeta }) {
  const [picking, setPicking] = useState(false);
  const [customRoles, setCustomRoles] = useState(null);
  const players = room?.players || [];
  const canStart = players.length >= 3;
  const isHost = me.id === room?.hostId;

  const addBot = () => socket.emit('game:addBot');
  const removeBot = () => socket.emit('game:removeBot');

  const copyCode = () => {
    const code = room?.roomId || '';
    navigator.clipboard?.writeText(code).catch(() => {});
  };

  return (
    <div className="waiting-room">
      {/* Room Header */}
      <div className="room-header">
        <div className="room-info">
          <h2 className="room-name">🏠 {room?.name || 'Phòng chờ'}</h2>
          <button className="room-code" onClick={copyCode} title="Click để copy">
            📋 {room?.roomId || '...'}
          </button>
        </div>
        <span className="room-players-count">{players.length}/16 người</span>
      </div>

      {/* Player Slots with Wooden Blocks */}
      <div className="player-slots">
        {players.map((p, index) => (
          <div
            key={p.id}
            className={`wooden-block filled ${p.id === me.id ? 'is-you' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Discord Avatar */}
            <div className="stickman-container">
              <div className="stickman-avatar discord-avatar" style={{ position: 'relative' }}>
                <img src={getAvatarUrl(p.avatar || p.id)} alt={p.name} />
                {p.id === room.hostId && <span className="host-badge">👑</span>}
              </div>
            </div>

            {/* Wooden Stump */}
            <div className="wooden-stump">
              {p.isBot && (
                <span style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '1.5rem'
                }}>🤖</span>
              )}
            </div>

            {/* Player Name */}
            <span className={`player-name ${p.isBot ? 'is-bot' : ''} ${p.id === me.id ? 'is-you' : ''}`}>
              {p.name.length > 10 ? p.name.slice(0, 9) + '…' : p.name}
            </span>

            {/* Status */}
            <span className="player-status ready">✓ Sẵn sàng</span>
          </div>
        ))}

        {/* Empty Slots */}
        {Array.from({ length: Math.max(0, 10 - players.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="wooden-block empty">
            <div className="stickman-container" style={{ opacity: 0.3 }}>
              <div className="stickman-avatar">
                <svg viewBox="0 0 40 50">
                  <circle cx="20" cy="10" r="8" fill="#888" />
                  <line x1="20" y1="18" x2="20" y2="35" stroke="#888" strokeWidth="3" />
                  <line x1="20" y1="25" x2="8" y2="30" stroke="#888" strokeWidth="3" />
                  <line x1="20" y1="25" x2="32" y2="30" stroke="#888" strokeWidth="3" />
                  <line x1="20" y1="35" x2="12" y2="48" stroke="#888" strokeWidth="3" />
                  <line x1="20" y1="35" x2="28" y2="48" stroke="#888" strokeWidth="3" />
                </svg>
              </div>
            </div>
            <div className="wooden-stump" style={{ opacity: 0.5 }} />
            <span className="player-name" style={{ opacity: 0.4 }}>Trống</span>
            <span className="player-status waiting">Chờ…</span>
          </div>
        ))}
      </div>

      {/* Room Actions */}
      <div className="room-actions">
        <button className="btn btn-ghost" onClick={onLeave}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
          </svg>
          Quay Lại
        </button>

        <button className="btn btn-ghost" onClick={addBot} disabled={players.length >= 16}>
          🤖 Thêm Bot
        </button>

        {players.some(p => p.isBot) && (
          <button className="btn btn-ghost" onClick={removeBot}>
            ✕ Bớt Bot
          </button>
        )}

        {isHost && (
          <button className="btn btn-ghost" onClick={() => setPicking(true)}>
            ⚙ Vai trò
          </button>
        )}

        <button
          className="btn btn-primary btn-lg btn-pulse btn-glow"
          disabled={!canStart}
          onClick={onStart}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Bắt Đầu Chơi
        </button>
      </div>

      {/* Warning */}
      {!canStart && (
        <p style={{
          textAlign: 'center',
          color: '#f39c12',
          marginTop: '1rem',
          fontSize: '0.9rem'
        }}>
          ⚠ Cần ít nhất 3 người để bắt đầu
        </p>
      )}

      {picking && (
        <RolePicker
          target={players.length}
          selected={customRoles}
          onChange={setCustomRoles}
          onClose={() => setPicking(false)}
        />
      )}
    </div>
  );
}
