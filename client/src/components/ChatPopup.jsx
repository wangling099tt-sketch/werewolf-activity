import { useEffect, useRef, useState } from 'react';

export default function ChatPopup({ logs, socket, me, phase }) {
  const [open, setOpen] = useState(true);
  const [hasNew, setHasNew] = useState(false);
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);
  const lastCount = useRef(logs?.length || 0);

  // Detect new messages when collapsed
  useEffect(() => {
    if (!open && logs && logs.length > lastCount.current) {
      setHasNew(true);
    }
    lastCount.current = logs?.length || 0;
    if (listRef.current && open) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [logs, open]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    socket.emit('chat:send', { text });
    setDraft('');
  };

  const canChat = phase && phase !== 'night' && phase !== 'night_intro';

  // Auto-open chat at night too so users see system logs
  useEffect(() => {
    if (phase === 'night' || phase === 'night_intro') {
      // keep open
    }
  }, [phase]);

  return (
    <div className={`chat-popup ${open ? 'is-open' : ''}`}>
      {open && (
        <div className="chat-popup-panel">
          <div className="chat-header">
            <span>💬 Game Chat {phase === 'night' ? '· 🌙 Đêm' : ''}</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>Esc</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>−</button>
            </div>
          </div>
          <ul className="chat-list" ref={listRef}>
            {(logs || []).slice(-40).map((entry, i) => (
              <li key={i} className={isSystemLog(entry) ? 'system' : ''}>
                {entry}
              </li>
            ))}
          </ul>
          {canChat ? (
            <div className="chat-input-row">
              <input
                className="input"
                style={{ padding: '8px 10px', fontSize: 13 }}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhắn gì đó..."
                maxLength={200}
                autoFocus
              />
              <button className="btn btn-primary btn-sm" onClick={handleSend}>Gửi</button>
            </div>
          ) : (
            <div style={{
              padding: '10px 14px',
              fontSize: 11, color: 'var(--text-dim)',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
            }}>
              🌙 Đêm — chat bị khóa
            </div>
          )}
        </div>
      )}
      {!open && (
        <button
          className="chat-popup-toggle"
          onClick={() => { setOpen(true); setHasNew(false); }}
        >
          💬
          {hasNew && <span className="chat-popup-dot" />}
        </button>
      )}
    </div>
  );
}

function isSystemLog(text) {
  return /^[🌙☀️🗳⚰💀�🧪🔮☠💕🎵👤🐺🌟⚖�🏆💬]/.test(text);
}