import { useEffect, useRef, useState } from 'react';

export default function GameChat({ logs, socket, me, phase }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sync logs from parent to local messages
  useEffect(() => {
    if (logs && logs.length > messages.length) {
      setMessages(logs);
    }
  }, [logs]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    socket.emit('chat:send', { text });
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isSystem = (text) => {
    return /^[🌙☀️🗳⚰💀🛡🧪🔮☠💕🎵👤🐺🌟⚖🔍🏆]/.test(text);
  };

  const getAvatarColor = (name) => {
    const colors = ['#9b59b6', '#3498db', '#27ae60', '#e74c3c', '#f39c12', '#1abc9c', '#e91e63', '#00bcd4'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatTime = (date) => {
    return new Date(date || Date.now()).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`chat-container ${collapsed ? 'collapsed' : ''}`}>
      <div className="chat-header">
        <span className="chat-title">
          <svg viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
          Chat
        </span>
        <button className="chat-toggle" onClick={() => setCollapsed(!collapsed)}>
          <svg
            className="chat-toggle-icon"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}
            width="20" height="20" viewBox="0 0 24 24" fill="currentColor"
          >
            <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
          </svg>
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-message system">
            <div className="chat-message-text">
              💬 Chào mừng đến với Werewolf! Thảo luận và tìm Sói nào!
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMsgSystem = isSystem(msg.text) || msg.type === 'system';
          const avatarColor = getAvatarColor(msg.author || 'System');

          return (
            <div key={i} className={`chat-message ${isMsgSystem ? 'system' : ''}`}>
              {!isMsgSystem && (
                <div
                  className="chat-message-avatar"
                  style={{ background: avatarColor }}
                >
                  {msg.author ? msg.author.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <div className="chat-message-content">
                {!isMsgSystem && (
                  <div className="chat-message-header">
                    <span className="chat-message-author">{msg.author || 'Unknown'}</span>
                    <span className="chat-message-time">{formatTime(msg.time)}</span>
                  </div>
                )}
                <div className="chat-message-text">{msg.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Nhắn tin..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            maxLength={500}
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <svg viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
