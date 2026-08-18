import { ROLE_META } from '../roles.js';

const ALL_ROLES = Object.keys(ROLE_META);

export default function RolePicker({ target, selected, onChange, onClose }) {
  const toggle = (roleId) => {
    if (selected.includes(roleId)) {
      onChange(selected.filter((r) => r !== roleId));
    } else if (selected.length < target) {
      onChange([...selected, roleId]);
    }
  };

  const autoFill = () => {
    // Auto balance using common Wolvesville pattern
    const wolves = Math.max(1, Math.floor(target / 5));
    const list = [];
    for (let i = 0; i < wolves; i++) list.push('werewolf');
    if (target >= 6) list.push('seer');
    if (target >= 7) list.push('witch');
    if (target >= 8) list.push('guard');
    if (target >= 9) list.push('hunter');
    if (target >= 10) list.push('cupid');
    while (list.length < target) list.push('villager');
    onChange(list.slice(0, target));
  };

  const clear = () => onChange([]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>⚙ Chọn vai trò ({selected.length}/{target})</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 14px' }}>
          Click để chọn. Còn lại sẽ tự động thêm dân làng.
        </p>
        <div className="role-grid">
          {ALL_ROLES.map((roleId) => {
            const r = ROLE_META[roleId];
            const sel = selected.includes(roleId);
            return (
              <div
                key={roleId}
                className={`role-card ${sel ? 'is-selected' : ''}`}
                onClick={() => toggle(roleId)}
              >
                <span className="role-emoji">{r.icon}</span>
                <span className="role-name">{r.name}</span>
                <span className="role-team">{r.emoji} {teamName(roleId)}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={clear}>Xóa</button>
          <button className="btn btn-ghost" onClick={autoFill}>🎲 Tự động</button>
          <button className="btn btn-primary" onClick={onClose}>✓ Xong</button>
        </div>
      </div>
    </div>
  );
}

function teamName(roleId) {
  if (['werewolf', 'alpha_wolf', 'wolf_cub', 'lone_wolf'].includes(roleId)) return 'Sói';
  if (roleId === 'vampire') return 'Vampire';
  if (roleId === 'tanner') return 'Tanner';
  if (roleId === 'cultist') return 'Cult';
  return 'Dân làng';
}