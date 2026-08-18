import { useEffect, useState } from 'react';
import { getAvatarUrl } from '../discord.js';

export default function HomeScreen({ me, onCreate, onJoin, setShowAuth }) {
  const [joining, setJoining] = useState(false);
  const [code, setCode] = useState('');
  const [rooms, setRooms] = useState([]);
  const [browsing, setBrowsing] = useState(false);

  useEffect(() => {
    if (!browsing) return;
    const load = async () => {
      try {
        const r = await fetch('http://localhost:3001/api/rooms');
        if (!r.ok) return;
        const data = await r.json();
        setRooms(data);
      } catch {}
    };
    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, [browsing]);

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">🐺</div>
          <span>Werewolf</span>
        </div>
        <div className="me-mini" onClick={() => setShowAuth(true)} style={{ cursor: 'pointer' }} title="Đổi tên">
          <img src={getAvatarUrl(me.avatar || me.id)} alt={me.name} />
          <span>{me.name}</span>
        </div>
      </header>

      <div className="home-content">
        {!joining && !browsing && (
          <div className="home-grid">
            <div className="home-card c1" onClick={onCreate}>
              <div className="home-card-icon">➕</div>
              <h3>Tạo phòng</h3>
              <p>Tạo phòng mới và mời bạn bè vào chơi cùng</p>
            </div>
            <div className="home-card c2" onClick={() => setJoining(true)}>
              <div className="home-card-icon">🔍</div>
              <h3>Vào phòng</h3>
              <p>Nhập mã phòng để tham gia</p>
            </div>
            <div className="home-card c3" onClick={() => setBrowsing(true)}>
              <div className="home-card-icon">📋</div>
              <h3>Phòng mở</h3>
              <p>Xem các phòng đang chờ người chơi</p>
            </div>
          </div>
        )}

        {joining && (
          <div style={{ maxWidth: 400, margin: '60px auto', textAlign: 'center' }}>
            <div className="modal" style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <h3 style={{ marginBottom: 16 }}>🔍 Nhập mã phòng</h3>
              <input
                className="input center"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="MÃ PHÒNG"
                maxLength={12}
                autoFocus
                style={{ marginBottom: 16 }}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => setJoining(false)}>← Quay lại</button>
                <button
                  className="btn btn-primary"
                  disabled={!code.trim()}
                  onClick={() => onJoin(code.trim().toUpperCase())}
                >
                  Vào phòng
                </button>
              </div>
            </div>
          </div>
        )}

        {browsing && (
          <div style={{ maxWidth: 900, margin: '20px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>📋 Phòng đang mở</h3>
              <button className="btn btn-ghost" onClick={() => setBrowsing(false)}>← Quay lại</button>
            </div>
            {rooms.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                Chưa có phòng nào. Hãy tạo phòng mới!
              </p>
            ) : (
              <div className="room-list">
                {rooms.map((r) => (
                  <div key={r.id} className="room-card2" onClick={() => onJoin(r.id)}>
                    <div className="room-id">🏠 {r.id}</div>
                    <div className="room-meta">
                      Host: {r.hostName} · {r.players}/{r.maxPlayers} người
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}