import { useEffect, useState, useRef } from 'react';
import { getAvatarUrl } from '../discord.js';
import { ROLE_META } from '../roles.js';
import GameChat from './GameChat.jsx';

export default function GameScene({ room, me, socket, myRole, inspect, logs, meRoleMeta }) {
  const [revealedRole, setRevealedRole] = useState(null);
  const [showAction, setShowAction] = useState(false);
  const [nightTimer, setNightTimer] = useState(30);

  const players = room?.players || [];
  const alive = players.filter((p) => p.alive);
  const phase = room?.phase;
  const voteCounts = room?.voteCounts || [];
  const winners = room?.winners || {};
  const voteCountMap = Object.fromEntries(voteCounts.map((v) => [v.id, v.received]));

  const [selectedTargets, setSelectedTargets] = useState(new Set());

  const handlePlayerClick = (p) => {
    if (!p.alive || p.id === me.id) return;

    if (phase === 'day_vote') {
      socket.emit('action:vote', { targetId: p.id });
      return;
    }

    if (phase === 'night' && meRoleMeta?.hasNightAction && !me.hasActed) {
      setSelectedTargets((prev) => {
        const next = new Set(prev);
        if (next.has(p.id)) next.delete(p.id);
        else next.add(p.id);
        return next;
      });
    }
  };

  const submitNightAction = () => {
    const targets = Array.from(selectedTargets);
    if (targets.length === 0) return;
    const roleId = myRole?.role;
    let ability = 'kill';
    if (['seer'].includes(roleId)) ability = 'inspect';
    if (['detective'].includes(roleId)) ability = 'detective_inspect';
    if (['guard'].includes(roleId)) ability = 'protect';
    if (['priest', 'spellcaster'].includes(roleId)) ability = 'shield';
    if (['cultist'].includes(roleId)) ability = 'convert';
    if (['arsonist'].includes(roleId)) ability = 'ignite';
    socket.emit('action:night', { targetId: targets[0], ability });
    setSelectedTargets(new Set());
  };

  useEffect(() => {
    if (myRole && !revealedRole) {
      setRevealedRole(myRole.role);
      const t = setTimeout(() => setShowAction(true), 2200);
      return () => clearTimeout(t);
    }
  }, [myRole]);

  useEffect(() => {
    if (phase === 'night' || phase === 'night_intro') {
      setNightTimer(30);
      const i = setInterval(() => setNightTimer((t) => Math.max(0, t - 1)), 1000);
      return () => clearInterval(i);
    } else if (phase === 'day_vote') {
      setNightTimer(20);
      const i = setInterval(() => setNightTimer((t) => Math.max(0, t - 1)), 1000);
      return () => clearInterval(i);
    }
  }, [phase]);

  useEffect(() => {
    if (!phase || phase === 'ended') return;
    setShowAction(false);
    const t = setTimeout(() => {
      if (phase === 'night' || phase === 'day_vote') setShowAction(true);
    }, 1500);
    return () => clearTimeout(t);
  }, [phase]);

  if (!room) return null;

  const count = players.length;
  const radius = count <= 4 ? 130 : count <= 8 ? 160 : count <= 12 ? 180 : 200;
  const avatarSize = count <= 8 ? 60 : 50;
  const cx = 50, cy = 48;

  return (
    <div className="game-layout">
      <div className="game-area">
        <div className="lobby-header">
          <div className="room-info">
            <h2 style={{ margin: 0, fontSize: 18 }}>{getPhaseEmoji(phase)} {getPhaseLabel(phase)}</h2>
            {room.day > 0 && (
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {phase?.includes('night') ? `Đêm ${room.night}` : `Ngày ${room.day}`}
              </span>
            )}
          </div>
        </div>

        <div className="lobby-scene">
          <div className="player-circles" style={{ minHeight: 280, padding: '10px 0' }}>
            {players.map((p, i) => {
              const angle = (i / Math.max(count, 6)) * Math.PI * 2 - Math.PI / 2;
              const x = cx + (radius / 4) * Math.cos(angle);
              const y = cy + (radius / 4) * Math.sin(angle);
              const isYou = p.id === me.id;
              const isDead = !p.alive;
              const received = voteCountMap[p.id] || 0;
              const voterIds = winners[p.id] || [];
              return (
                <div
                  key={p.id}
                  className={`player-circle ${p.id === room.hostId ? 'is-host' : ''} ${isYou ? 'is-you' : ''} ${isDead ? 'is-dead' : ''} ${p.isBot ? 'is-bot' : ''} ${received > 0 ? 'is-voted' : ''} ${selectedTargets.has(p.id) ? 'is-selected' : ''}`}
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: (phase === 'day_vote' || (phase === 'night' && meRoleMeta?.hasNightAction && !p.isBot)) ? 'pointer' : 'default',
                  }}
                  onClick={() => handlePlayerClick(p)}
                  title={phase === 'night' && meRoleMeta?.hasNightAction ? `Chọn ${p.name}` : ''}
                >
                  {phase === 'day_vote' && received > 0 && (
                    <div className={`vote-badge-top ${received >= 5 ? 'big' : ''}`}>
                      {received}
                    </div>
                  )}
                  <div className="avatar-ring" style={{ width: avatarSize, height: avatarSize }}>
                    <img src={getAvatarUrl(p.avatar || p.id)} alt={p.name} />
                    {isDead && <div className="dead-overlay">💀</div>}
                    {isYou && <span className="badge">★</span>}
                  </div>
                  <span className="name-pill" style={{ fontSize: 10, padding: '2px 8px' }}>
                    {p.name.length > 12 ? p.name.slice(0, 11) + '…' : p.name}
                  </span>
                  {phase === 'day_vote' && voterIds.length > 0 && (
                    <div className="voter-dots-row">
                      {voterIds.slice(0, 8).map((vid) => {
                        const v = players.find((pp) => pp.id === vid);
                        if (!v) return null;
                        return (
                          <img key={vid} src={getAvatarUrl(v.avatar || v.id)} className="voter-dot" alt={v.name} />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', padding: '0 20px 8px' }}>
            <div className="center-card">
              <div className="phase-h1">{getPhaseLabel(phase)}</div>
              <div className="phase-sub">
                {phase === 'night' && `Vai đặc biệt đang hành động · ${nightTimer}s`}
                {phase === 'night_intro' && 'Đêm bắt đầu'}
                {phase === 'night_results' && '☀️ Đã có người chết'}
                {phase === 'day_discuss' && '💬 Thảo luận ai là sói'}
                {phase === 'day_vote' && `🗳 Đã vote ${room.voteCount}/${room.voteTotal} · ${nightTimer}s`}
                {phase === 'day_results' && '⚖ Kết quả vote'}
                {phase === 'ended' && room.winner && `🏆 ${winnerLabel(room.winner)}`}
              </div>
              {(phase?.includes('night') || phase === 'day_vote') && (
                <div className="timer-bar">
                  <div style={{ width: `${(nightTimer / 30) * 100}%` }} />
                </div>
              )}
            </div>
          </div>

          <div className="game-bottom-area">
            {showAction && phase === 'night' && meRoleMeta && (
              <NightActionOverlay
                players={alive}
                me={me}
                myRole={myRole}
                socket={socket}
                inspect={inspect}
                selectedTargets={selectedTargets}
                submitNightAction={submitNightAction}
              />
            )}

            {showAction && phase === 'day_vote' && (
              <DayVoteOverlay players={alive} me={me} socket={socket} />
            )}
          </div>
        </div>
      </div>

      {/* Integrated Chat Box - Desktop: sidebar, Mobile: bottom */}
      <GameChat logs={logs} socket={socket} me={me} phase={phase} />

      {revealedRole && (
        <RoleReveal role={revealedRole} myRole={myRole} onDismiss={() => setRevealedRole(null)} />
      )}

      {phase === 'ended' && <EndOverlay room={room} />}
    </div>
  );
}

function NightActionOverlay({ players, me, myRole, socket, inspect, selectedTargets, submitNightAction }) {
  const roleId = myRole?.role;
  const role = ROLE_META[roleId];
  const canAct = role && (roleId === 'werewolf' || roleId === 'alpha_wolf' || roleId === 'lone_wolf'
    || roleId === 'vampire' || roleId === 'seer' || roleId === 'guard' || roleId === 'detective'
    || roleId === 'cupid' || roleId === 'priest' || roleId === 'spellcaster'
    || roleId === 'cultist' || roleId === 'arsonist'
    || roleId === 'witch');

  if (!canAct) {
    return (
      <div className="action-bar">
        <span className="role-action-title">😴 {role?.icon} {role?.name} · Đang ngủ · 🐺 Sói đang hoạt động</span>
      </div>
    );
  }

  const handleSkip = () => {
    socket.emit('action:night', { targetId: null });
  };

  const getActionName = () => {
    const map = {
      werewolf: '🐺 Cắn ai?', alpha_wolf: '🐺 Cắn ai?', lone_wolf: '🐺 Cắn ai?',
      vampire: '🧛 Hút máu ai?',
      seer: '🔮 Điều tra ai?',
      guard: '🛡 Bảo vệ ai?',
      detective: '🔍 Điều tra ai?',
      witch: '🧪 Dùng lên ai?',
      cupid: '💘 Ghép cặp (click 2 avatar)',
      priest: '🕯 Phong ấm ai?',
      spellcaster: '🕯 Phong ấm ai?',
      cultist: '👤 Chuyển hóa ai?',
      arsonist: '🔥 Tẩm dầu ai?',
    };
    return map[roleId] || 'Hành động';
  };

  return (
    <div className="action-bar">
      <span className="role-action-title">
        {role?.icon} {role?.name} · {getActionName()}
      </span>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
        {selectedTargets?.size > 0
          ? `Đã chọn ${selectedTargets.size} người`
          : '👆 Click trực tiếp avatar người muốn dùng'}
      </div>
      {roleId !== 'cupid' && (
        <button className="btn btn-success btn-sm" disabled={!selectedTargets?.size} onClick={submitNightAction}>
          ✓ Xác nhận
        </button>
      )}
      {roleId === 'cupid' && selectedTargets?.size === 2 && (
        <button className="btn btn-success btn-sm" onClick={() => {
          socket.emit('action:night', { targetId: Array.from(selectedTargets) });
        }}>
          ✓ Ghép đôi
        </button>
      )}
      <button className="btn btn-ghost btn-sm" onClick={handleSkip}>⏭ Bỏ qua</button>

      {inspect && (
        <div style={{
          marginTop: 8, padding: 8,
          background: inspect.isWolf ? 'rgba(220,38,38,0.2)' : 'rgba(34,197,94,0.2)',
          border: `1px solid ${inspect.isWolf ? 'var(--werewolf)' : 'var(--villager)'}`,
          borderRadius: 10, fontSize: 12, fontWeight: 700, textAlign: 'center',
        }}>
          🔮 {inspect.name} là <strong>{inspect.isWolf ? '🐺 SÓI' : '🌟 DÂN LÀNG'}</strong>
        </div>
      )}
    </div>
  );
}

function DayVoteOverlay({ players, me, socket }) {
  return (
    <div className="action-bar">
      <span className="role-action-title">🗳 Treo cổ ai?</span>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
        👆 Click trực tiếp vào avatar người muốn vote
      </div>
      <button className="btn btn-ghost btn-sm" onClick={() => socket.emit('action:vote', { targetId: null })}>
        ⏭ Bỏ vote
      </button>
    </div>
  );
}

function EndOverlay({ room }) {
  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)',
      padding: 28, borderRadius: 20, zIndex: 50, textAlign: 'center', maxWidth: 480,
      border: '2px solid rgba(255,255,255,0.2)',
      maxHeight: '85vh', overflowY: 'auto',
    }}>
      <h2 style={{ fontSize: 26, margin: '0 0 12px' }}>🏆 Kết thúc</h2>
      <p style={{ fontSize: 16, fontWeight: 800, margin: '0 0 18px' }}>{winnerLabel(room.winner)}</p>
      <div style={{ display: 'grid', gap: 8, textAlign: 'left' }}>
        {room.players.map((p) => {
          const r = ROLE_META[p.role];
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: 8,
              background: 'rgba(255,255,255,0.05)', borderRadius: 10,
            }}>
              <img src={getAvatarUrl(p.avatar || p.id)} style={{ width: 30, height: 30, borderRadius: '50%' }} />
              <span style={{ flex: 1 }}>{p.name}</span>
              <span style={{ fontSize: 11 }}>{r?.icon} {r?.name}</span>
              {!p.alive && <span>💀</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RoleReveal({ role, myRole, onDismiss }) {
  const r = ROLE_META[role];
  const team = myRole?.team;
  return (
    <div className="role-reveal" onClick={onDismiss}>
      <div className={`role-reveal-card is-${team}`} onClick={(e) => e.stopPropagation()}>
        <div className="big-emoji">{r?.icon}</div>
        <div className="big-name" style={{ color: r?.color }}>{r?.name}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>
          Phe: {team?.toUpperCase()}
        </div>
        <p className="desc">{getDesc(role)}</p>
        <button className="btn btn-primary" onClick={onDismiss} style={{ marginTop: 16, padding: '12px 26px' }}>
          Sẵn sàng
        </button>
      </div>
    </div>
  );
}

function getDesc(role) {
  const m = {
    villager: 'Tìm và treo cổ ma sói qua vote ban ngày.',
    seer: 'Mỗi đêm điều tra 1 người để biết họ là phe Dân hay Sói.',
    witch: '1 bình cứu + 1 bình độc, dùng 1 lần mỗi bình.',
    guard: 'Bảo vệ 1 người/đêm, không được chọn cùng người 2 đêm.',
    hunter: 'Khi chết được bắn chết 1 người cùng lúc.',
    cupid: 'Đêm đầu ghép 2 người thành cặp tình nhân.',
    priest: 'Phong ấm 1 người/đêm chống Cult/Vampire.',
    mason: 'Biết các Mason khác.',
    detective: 'Điều tra 1 người/đêm.',
    troubadour: 'Nếu chỉ còn 1 mình thì thắng.',
    spellcaster: 'Phong ấm hoặc xóa phong ấm 1 người/đêm.',
    werewolf: 'Mỗi đêm cùng đồng đội giết 1 người.',
    alpha_wolf: 'Sói đặc biệt với khả năng cắn 1 người/đêm.',
    wolf_cub: 'Khi chết, đêm sau sói được giết gấp đôi.',
    lone_wolf: 'Khi là sói duy nhất, giết được 2 người/đêm.',
    vampire: 'Ma cà rồng, giống sói nhưng thuộc phe riêng.',
    tanner: 'Thắng nếu bị dân làng treo cổ.',
    cultist: 'Mỗi đêm chuyển hóa 1 người sang Tà giáo.',
    arsonist: 'Tẩm dầu 1 người/đêm.',
  };
  return m[role] || 'Vai trò đặc biệt.';
}

function getPhaseEmoji(p) {
  const m = { lobby: '🏠', night: '🌙', night_intro: '🌙', night_results: '☀️', day_discuss: '☀️', day_vote: '🗳', day_results: '⚖', ended: '🏆' };
  return m[p] || '🎮';
}
function getPhaseLabel(p) {
  const m = {
    lobby: 'Lobby',
    night_intro: 'Đêm bắt đầu',
    night: 'Đêm',
    night_results: 'Sáng',
    day_discuss: 'Bàn luận',
    day_vote: 'Vote',
    day_results: 'Kết quả',
    ended: 'Kết thúc',
  };
  return m[p] || p;
}
function winnerLabel(w) {
  return {
    werewolf: '🐺 Ma sói thắng!',
    villager: '🌟 Dân làng thắng!',
    vampire: '🧛 Vampire thắng!',
    tanner: '🎭 Người thuộc da thắng!',
    lovers: '💕 Cặp đôi thắng!',
    cultist: '👤 Tà giáo thắng!',
    troubadour: '🎵 Troubadour thắng!',
  }[w] || 'Kết thúc';
}
