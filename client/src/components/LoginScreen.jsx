import { useState } from 'react';
import { useSocket } from '../hooks/useGame.js';

export default function LoginScreen({ onJoin }) {
  const socket = useSocket();
  const [name, setName] = useState('');
  const [mode, setMode] = useState('menu'); // menu, create, join
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    if (!name.trim()) {
      setError('Vui lòng nhập tên');
      return;
    }
    if (mode === 'join' && !roomId.trim()) {
      setError('Vui lòng nhập mã phòng');
      return;
    }
    const finalRoomId = mode === 'create'
      ? `R${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      : roomId.trim().toUpperCase();
    onJoin(socket, name.trim(), finalRoomId);
  };

  return (
    <div className="login">
      <div className="login-card">
        <h1 className="login-title">🐺 Werewolf</h1>
        <p className="login-sub">Ma Sói — Phiên bản Discord Activity</p>

        {mode === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="field">
              <label className="field-label">Tên hiển thị</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên của bạn"
                maxLength={20}
                autoFocus
              />
            </div>
            <button className="btn btn-primary btn-block btn-lg" onClick={() => setMode('create')}>
              ➕ Tạo phòng mới
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => setMode('join')}>
              🔍 Tìm phòng bằng mã
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => setMode('browse')}>
              📋 Xem phòng đang mở
            </button>
          </div>
        )}

        {mode === 'create' && (
          <>
            <div className="field">
              <label className="field-label">Tên hiển thị</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 16px' }}>
              Một phòng mới sẽ được tạo tự động. Bạn sẽ là chủ phòng.
            </p>
            <button className="btn btn-primary btn-block btn-lg" onClick={handleJoin}>
              Tạo &amp; vào phòng
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => setMode('menu')} style={{ marginTop: 8 }}>
              ← Quay lại
            </button>
          </>
        )}

        {mode === 'join' && (
          <>
            <div className="field">
              <label className="field-label">Tên hiển thị</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={20} />
            </div>
            <div className="field">
              <label className="field-label">Mã phòng</label>
              <input
                className="input"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="VD: ABC1"
                maxLength={12}
                autoFocus
              />
            </div>
            <button className="btn btn-primary btn-block btn-lg" onClick={handleJoin}>
              Vào phòng
            </button>
            <button className="btn btn-ghost btn-block" onClick={() => setMode('menu')} style={{ marginTop: 8 }}>
              ← Quay lại
            </button>
          </>
        )}

        {mode === 'browse' && (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 16px' }}>
              Xem các phòng đang mở (sẽ hiển thị bên dưới).
            </p>
            <input className="input" placeholder="Tên của bạn" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="btn btn-ghost btn-block" onClick={() => setMode('menu')} style={{ marginTop: 8 }}>
              ← Quay lại
            </button>
          </>
        )}

        {error && <p style={{ color: 'var(--werewolf)', fontSize: 13, marginTop: 10 }}>{error}</p>}
      </div>
    </div>
  );
}