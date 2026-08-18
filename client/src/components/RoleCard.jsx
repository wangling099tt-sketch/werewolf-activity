import { ROLE_META, ROLE_DESC } from '../roles.js';

export function RoleCard({ roleId, compact = false }) {
  const role = ROLE_META[roleId];
  if (!role) return null;
  const desc = ROLE_DESC[roleId];
  return (
    <div className="role-card" data-team={getTeam(roleId)}>
      <div className="role-header">
        <div className="role-icon" style={{ background: `linear-gradient(135deg, ${role.color}33, ${role.color}11)` }}>
          {role.icon}
        </div>
        <div>
          <div className="role-name">{role.name}</div>
          <div className="role-team">{role.emoji} {getTeamLabel(roleId)}</div>
        </div>
      </div>
      {!compact && desc && <p className="role-desc">{desc}</p>}
    </div>
  );
}

function getTeam(roleId) {
  if (['werewolf', 'alpha_wolf', 'wolf_cub', 'lone_wolf'].includes(roleId)) return 'werewolf';
  if (['vampire'].includes(roleId)) return 'vampire';
  if (['tanner'].includes(roleId)) return 'tanner';
  if (['cultist'].includes(roleId)) return 'cultist';
  if (['arsonist'].includes(roleId)) return 'arsonist';
  return 'villager';
}

function getTeamLabel(roleId) {
  const t = getTeam(roleId);
  return { villager: 'Dân làng', werewolf: 'Ma sói', vampire: 'Ma cà rồng', tanner: 'Trung lập', cultist: 'Tà giáo', arsonist: 'Kẻ phóng hỏa' }[t];
}

export default RoleCard;