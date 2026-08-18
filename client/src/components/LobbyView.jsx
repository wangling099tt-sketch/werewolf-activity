import { useState } from 'react';
import { ROLE_META, ROLE_DESC } from '../roles.js';

const ALL_ROLES = Object.keys(ROLE_META);

export default function LobbyView({ room, socket, me, onLeave }) {
  const isHost = room.hostId === me.id;
  const [picking, setPicking] = useState(false);
  const [customRoles, setCustomRoles] = useState([]);

  const canStart = room.players.length >= 3 && room.players.length <= 16;

  const handleStart = (useCustom) => {
    const roles = useCustom && customRoles.length === room.players.length ? customRoles : null;
    socket.emit('game:start', { customRoles: roles }, (resp) => {
      if (resp && !resp.ok) alert(resp.error || 'Lỗi');
    });
  };

  const toggleRole = (roleId) => {
    setCustomRoles((prev) => {
      if (prev.includes(roleId)) return prev.filter((r) => r !== roleId);
      if (prev.length >= room.players.length) return prev;
      return [...prev, roleId];
    });
  };

  const playerSlots = Array.from({ length: Math.max(room.players.length, 8) }, (_, i) => room.players[i] || null);

  return (
    <div className="view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>🏠 Lobby · {room.roomId}</h2>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: 13 }}>
            {room.players.length} người chơi · Chia sẻ mã <strong style={{ color: 'var(--accent-2)' }}>{room.roomId}</strong> để mời bạn bè
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={onLeave}>Rời phòng</button>
          {isHost && (
            <>
              <button className="btn btn-ghost" onClick={() => setPicking(!picking)}>
                {picking ? '✕ Đóng' : '⚙️ Chọn vai'}
              </button>
              <button className="btn btn-primary btn-lg" disabled={!canStart} onClick={() => handleStart(picking)}>
                ▶ Bắt đầu
              </button>
            </>
          )}
        </div>
      </div>

      {picking && isHost && (
        <div className="panel">
          <h3 className="panel-title">
            Tùy chọn vai trò ({customRoles.length}/{room.players.length})
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 12px' }}>
            Click để chọn. Bỏ trống = hệ thống tự chọn cân bằng theo số người.
          </p>
          <div className="role-picker">
            {ALL_ROLES.map((roleId) => {
              const role = ROLE_META[roleId];
              const selected = customRoles.includes(roleId);
              return (
                <div
                  key={roleId}
                  className={`role-picker-item ${selected ? 'is-selected' : ''}`}
                  onClick={() => toggleRole(roleId)}
                  title={ROLE_DESC[roleId]}
                >
                  <div className="role-picker-icon">{role.icon}</div>
                  <div className="role-picker-info">
                    <div className="role-picker-name">{role.name}</div>
                    <div className="role-picker-team">{role.emoji}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {customRoles.length > 0 && customRoles.length !== room.players.length && (
            <p style={{ color: 'var(--tanner)', fontSize: 12, marginTop: 10 }}>
              ⚠ Đã chọn {customRoles.length} vai, cần {room.players.length} vai để khớp số người chơi. Số còn lại sẽ được tự động thêm.
            </p>
          )}
        </div>
      )}

      <div className="player-grid">
        {playerSlots.map((p, idx) => {
          if (!p) {
            return <div key={idx} className="player-empty">Trống</div>;
          }
          return (
            <div
              key={p.id}
              className={`player-tile ${room.hostId === p.id ? 'is-host' : ''} ${p.id === me.id ? 'is-you' : ''}`}
            >
              <div className="player-avatar">
                {p.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="player-name">{p.name}{p.id === me.id && ' (bạn)'}</div>
              {room.hostId === p.id && <span className="player-host-badge">HOST</span>}
            </div>
          );
        })}
      </div>

      {!canStart && isHost && (
        <p style={{ color: 'var(--tanner)', textAlign: 'center', fontSize: 13 }}>
          Cần ít nhất 3 người để bắt đầu
        </p>
      )}
    </div>
  );
}