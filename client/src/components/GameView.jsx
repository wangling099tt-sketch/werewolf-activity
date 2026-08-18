import { useState } from 'react';
import { ROLE_META } from '../roles.js';

export default function GameView({ room, socket, me, myRole, inspect }) {
  const isHost = room.hostId === me.id;
  const alive = room.players.filter((p) => p.alive);
  const phase = room.phase;

  return (
    <div className="view">
      <PhaseBanner phase={phase} day={room.day} night={room.night} winner={room.winner} />

      {phase === 'night' && (
        <NightView room={room} socket={socket} me={me} myRole={myRole} inspect={inspect} isHost={isHost} />
      )}
      {phase === 'night_intro' && <IntroView phase="night" isHost={isHost} socket={socket} />}
      {phase === 'night_results' && <ResultsView players={room.players} log={room.log} isHost={isHost} socket={socket} />}
      {phase === 'day_discuss' && <IntroView phase="day" isHost={isHost} socket={socket} />}
      {phase === 'day_vote' && (
        <VoteView room={room} socket={socket} me={me} alive={alive} isHost={isHost} />
      )}
      {phase === 'day_results' && <ResultsView players={room.players} log={room.log} isHost={isHost} socket={socket} />}
      {phase === 'ended' && <EndedView room={room} />}

      <LogPanel logs={room.log} />
    </div>
  );
}

function PhaseBanner({ phase, day, night, winner }) {
  const map = {
    night_intro: { text: `🌙 Đêm ${night} bắt đầu`, cls: 'phase-night' },
    night: { text: `🌙 Đêm ${night} — Mọi người nhắm mắt`, cls: 'phase-night' },
    night_results: { text: `☀️ Sáng ngày ${day}`, cls: 'phase-day' },
    day_discuss: { text: `☀️ Ngày ${day} — Thảo luận ai là sói`, cls: 'phase-day' },
    day_vote: { text: `🗳️ Vote treo cổ — Đã vote ${room?.voteCount || 0}/${room?.voteTotal || 0}`, cls: 'phase-vote' },
    day_results: { text: `⚖️ Kết quả vote`, cls: 'phase-day' },
    ended: { text: winner === 'werewolf' ? '🐺 Ma sói thắng!' : winner === 'villager' ? '🌟 Dân làng thắng!' : winner === 'vampire' ? '🧛 Ma cà rồng thắng!' : winner === 'tanner' ? '🎭 Người thuộc da thắng!' : winner === 'lovers' ? '💕 Cặp đôi thắng!' : '🏆 Kết thúc', cls: 'phase-ended' },
  };
  const c = map[phase] || { text: phase, cls: 'phase-day' };
  return <div className={`phase-banner ${c.cls}`}>{c.text}</div>;
}

function IntroView({ phase, isHost, socket }) {
  return (
    <div className="action-panel" style={{ textAlign: 'center' }}>
      <h3 className="action-title">
        {phase === 'night' ? '🌙 Trời tối' : '☀️ Trời sáng'}
      </h3>
      <p className="action-desc">
        {phase === 'night'
          ? 'Tất cả nhắm mắt. Vai đặc biệt sẽ hành động trong im lặng.'
          : 'Bàn luận về ai là ma sói. Sau đó vote để treo cổ.'}
      </p>
      {isHost ? (
        <button className="btn btn-primary btn-lg" onClick={() => socket.emit('phase:next')}>
          Tiếp tục →
        </button>
      ) : (
        <p style={{ color: 'var(--text-muted)' }}>⏳ Chờ host...</p>
      )}
    </div>
  );
}

function ResultsView({ players, log, isHost, socket }) {
  const dead = players.filter((p) => !p.alive);
  return (
    <div className="action-panel">
      <h3 className="action-title">📜 Kết quả</h3>
      {dead.length === 0 ? (
        <p style={{ color: 'var(--villager)' }}>Không ai chết! 🎉</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {dead.map((p) => (
            <li key={p.id} style={{ padding: 8, color: 'var(--werewolf)' }}>
              💀 {p.name} đã chết
            </li>
          ))}
        </ul>
      )}
      {isHost && (
        <button className="btn btn-primary btn-lg" onClick={() => socket.emit('phase:next')} style={{ marginTop: 16 }}>
          Tiếp tục →
        </button>
      )}
    </div>
  );
}

function NightView({ room, socket, me, myRole, inspect, isHost }) {
  const alive = room.players.filter((p) => p.alive);
  const meAlive = alive.find((p) => p.id === me.id);
  const canAct = myRole && ROLE_META[myRole.role]?.hasNightAction !== false && meAlive;

  const [selected, setSelected] = useState(null);

  const handleAct = () => {
    if (!myRole || !selected) return;
    let ability = 'kill';
    if (myRole.role === 'seer') ability = 'inspect';
    if (myRole.role === 'guard') ability = 'protect';
    if (myRole.role === 'witch') ability = 'kill';
    if (myRole.role === 'priest' || myRole.role === 'spellcaster') ability = 'shield';
    socket.emit('action:night', { targetId: selected, ability }, (resp) => {
      if (resp && !resp.ok) alert(resp.error);
    });
  };

  const handleSkip = () => {
    socket.emit('action:night', { targetId: null });
  };

  return (
    <>
      {myRole && (
        <div className="action-panel" style={{ borderColor: ROLE_META[myRole.role]?.color }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 28 }}>{ROLE_META[myRole.role]?.icon}</span>
            <div>
              <div className="action-title">Bạn là {ROLE_META[myRole.role]?.name}</div>
              <div className="me-role" style={{ background: ROLE_META[myRole.role]?.color, color: 'white' }}>
                {myRole.team}
              </div>
            </div>
          </div>
        </div>
      )}

      {canAct ? (
        <div className="action-panel">
          <h3 className="action-title">⚡ Hành động đêm</h3>
          <p className="action-desc">Chọn một người chơi để hành động.</p>
          <div className="action-buttons">
            {alive.filter((p) => p.id !== me.id).map((p) => (
              <button
                key={p.id}
                className={`btn ${selected === p.id ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSelected(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn btn-primary" disabled={!selected} onClick={handleAct}>
              ✅ Xác nhận
            </button>
            <button className="btn btn-ghost" onClick={handleSkip}>
              ⏭ Bỏ qua
            </button>
          </div>
          {inspect && (
            <div className={`inspect-result ${inspect.isWolf ? 'is-wolf' : 'is-good'}`}>
              {inspect.name} là <strong>{inspect.isWolf ? '🐺 SÓI' : '🌟 DÂN LÀNG'}</strong>
            </div>
          )}
        </div>
      ) : (
        <div className="action-panel" style={{ textAlign: 'center' }}>
          <p className="action-desc">😴 Bạn không có hành động đêm nay. Chờ sáng...</p>
        </div>
      )}

      <PlayerRing players={room.players} me={me} myRole={myRole} />

      {isHost && (
        <button className="btn btn-primary btn-block btn-lg" onClick={() => socket.emit('phase:next')}>
          ☀️ Sáng →
        </button>
      )}
    </>
  );
}

function VoteView({ room, socket, me, alive, isHost }) {
  const myVote = alive.find((p) => p.id === me.id)?.vote;
  const [picked, setPicked] = useState(myVote || null);

  const handleVote = () => {
    if (!picked) return;
    socket.emit('action:vote', { targetId: picked });
  };

  const handleSkipVote = () => {
    socket.emit('action:vote', { targetId: null });
  };

  return (
    <>
      <div className="action-panel">
        <h3 className="action-title">🗳️ Vote treo cổ</h3>
        <p className="action-desc">
          Chọn 1 người để treo cổ. Hòa = không ai chết. Đã vote: {room.voteCount}/{room.voteTotal}
        </p>
        <div className="action-buttons">
          {alive.filter((p) => p.id !== me.id).map((p) => (
            <button
              key={p.id}
              className={`btn ${picked === p.id ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => setPicked(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-danger" disabled={!picked} onClick={handleVote}>
            🗳 Vote
          </button>
          <button className="btn btn-ghost" onClick={handleSkipVote}>
            ⏭ Bỏ vote
          </button>
        </div>
      </div>

      <PlayerRing players={room.players} me={me} votes={alive.reduce((acc, p) => { if (p.vote) acc[p.vote] = (acc[p.vote] || 0) + 1; return acc; }, {})} />

      {isHost && (
        <button className="btn btn-primary btn-block btn-lg" onClick={() => socket.emit('phase:next')}>
          ⚖️ Công bố kết quả →
        </button>
      )}
    </>
  );
}

function PlayerRing({ players, me, myRole, votes }) {
  return (
    <div className="panel">
      <h3 className="panel-title">Người chơi</h3>
      <div className="player-ring">
        {players.map((p) => {
          const isMe = p.id === me.id;
          const isDead = !p.alive;
          const voteCount = votes ? votes[p.id] || 0 : 0;
          return (
            <div
              key={p.id}
              className={`player-slot ${isDead ? 'is-dead' : ''} ${isMe ? 'is-me' : ''} ${voteCount > 0 ? 'is-vote-target' : ''}`}
              title={isDead ? `${p.name} (đã chết)` : p.name}
            >
              <div className="slot-avatar">
                {isDead ? '' : p.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="slot-name">{p.name}</div>
              <div className="slot-status">
                {isDead ? '💀 Chết' : isMe ? `${myRole ? ROLE_META[myRole.role]?.icon : ''} Bạn` : voteCount > 0 ? `🗳 ${voteCount}` : '❤️ Sống'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EndedView({ room }) {
  return (
    <div className="action-panel" style={{ textAlign: 'center' }}>
      <h3 className="action-title">🏆 Game kết thúc</h3>
      <p className="action-desc">Lật bài:</p>
      <div className="player-grid" style={{ marginTop: 16 }}>
        {room.players.map((p) => {
          const role = ROLE_META[p.role];
          return (
            <div key={p.id} className={`role-card ${!p.alive ? 'is-dead' : ''}`} data-team={p.team}>
              <div className="role-header">
                <div className="role-icon">{role?.icon || '❓'}</div>
                <div>
                  <div className="role-name">{p.name}</div>
                  <div className="role-team">{role?.name}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LogPanel({ logs }) {
  return (
    <div className="log-panel">
      <h3 className="panel-title">📜 Nhật ký</h3>
      <ul className="log-list">
        {logs.map((entry, i) => (
          <li key={i}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}