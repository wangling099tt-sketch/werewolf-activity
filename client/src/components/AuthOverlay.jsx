import { useState } from 'react';
import { getAvatarUrl } from '../discord.js';

export default function AuthOverlay() {
  const [name, setName] = useState('');
  const [seed, setSeed] = useState(() => Math.random().toString(36).slice(2, 8));

  const handleConfirm = () => {
    const finalName = name.trim() || `Người chơi ${Math.floor(Math.random() * 1000)}`;
    try {
      const user = {
        id: `local-${Date.now()}`,
        name: finalName,
        avatar: seed,
      };
      localStorage.setItem('werewolf_user', JSON.stringify(user));
      window.location.reload(); // simplest: reload to trigger getOrCreateUser
    } catch {}
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <h1>🐺 Werewolf</h1>
        <p>Discord Activity · Ma Sói</p>
        <div className="user-greeting">
          <img src={getAvatarUrl(seed)} alt="avatar" />
          <div className="name">{name || 'Chọn tên của bạn'}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            className="input"
            placeholder="Tên hiển thị (để trống = random)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          />
          <button className="btn btn-primary btn-block" onClick={handleConfirm} style={{ width: '100%', padding: '14px' }}>
            🚀 Bắt đầu chơi
          </button>
          <button
            className="btn btn-ghost btn-block"
            onClick={() => setSeed(Math.random().toString(36).slice(2, 8))}
            style={{ width: '100%' }}
          >
            🎲 Đổi avatar
          </button>
        </div>
      </div>
    </div>
  );
}