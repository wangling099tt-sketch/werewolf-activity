import { useEffect, useState } from 'react';

export default function RoomBrowser({ onJoin, myName }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch('http://localhost:3001/api/rooms');
        const data = await r.json();
        if (!cancelled) setRooms(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 3000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <div className="login">
      <div className="login-card" style={{ width: 480 }}>
        <h2 className="login-title">📋 Phòng đang mở</h2>
        <p className="login-sub">Cập nhật mỗi 3 giây</p>
        {loading && <p style={{ color: 'var(--text-muted)' }}>Đang tải...</p>}
        {!loading && rooms.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>Chưa có phòng nào. Hãy tạo phòng!</p>
        )}
        <div className="room-grid" style={{ marginTop: 14 }}>
          {rooms.map((r) => (
            <div key={r.id} className="room-card" onClick={() => onJoin(r.id)}>
              <div className="room-id">Mã phòng</div>
              <div className="room-title">{r.id}</div>
              <div className="room-info">
                <span>👤 {r.hostName}</span>
                <span>{r.players}/{r.maxPlayers}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}