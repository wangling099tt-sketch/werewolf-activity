// Complete Role Library - Wolvesville-style
// Each role: id, name, team, emoji, icon, color, nightOrder, description, ability

export const TEAMS = {
  VILLAGER: { id: 'villager', name: 'Dân làng', color: '#22c55e', gradient: 'linear-gradient(135deg, #16a34a, #4ade80)' },
  WEREWOLF: { id: 'werewolf', name: 'Ma sói', color: '#ef4444', gradient: 'linear-gradient(135deg, #b91c1c, #f87171)' },
  VAMPIRE: { id: 'vampire', name: 'Ma cà rồng', color: '#7c2d12', gradient: 'linear-gradient(135deg, #581c87, #a78bfa)' },
  TANNER: { id: 'tanner', name: 'Người thuộc da', color: '#f59e0b', gradient: 'linear-gradient(135deg, #d97706, #fcd34d)' },
  CULTIST: { id: 'cultist', name: 'Tà giáo', color: '#9333ea', gradient: 'linear-gradient(135deg, #6b21a8, #c084fc)' },
  ARSONIST: { id: 'arsonist', name: 'Kẻ phóng hỏa', color: '#ea580c', gradient: 'linear-gradient(135deg, #c2410c, #fb923c)' },
};

export const ROLES = {
  // === DÂN LÀNG ===
  villager: {
    id: 'villager', name: 'Dân làng', team: 'villager', emoji: '👨‍🌾',
    icon: '🌾', color: '#22c55e',
    nightOrder: 0, hasNightAction: false,
    description: 'Không có khả năng đặc biệt. Tìm và loại trừ ma sói qua bỏ phiếu ban ngày.',
    ability: 'Không có',
  },
  seer: {
    id: 'seer', name: 'Tiên tri', team: 'villager', emoji: '🔮',
    icon: '🌙', color: '#a855f7',
    nightOrder: 50, hasNightAction: true,
    description: 'Mỗi đêm, được điều tra một người để biết họ là phe Dân hay Ma sói.',
    ability: 'Điều tra 1 người mỗi đêm',
  },
  witch: {
    id: 'witch', name: 'Phù thủy', team: 'villager', emoji: '🧙‍♀️',
    icon: '⚗️', color: '#7c3aed',
    nightOrder: 80, hasNightAction: true,
    description: 'Có 1 bình cứu (cứu người bị giết) và 1 bình độc (giết 1 người). Mỗi bình dùng được 1 lần.',
    ability: 'Cứu/Độc 1 lần',
  },
  guard: {
    id: 'guard', name: 'Bảo vệ', team: 'villager', emoji: '🛡️',
    icon: '✨', color: '#3b82f6',
    nightOrder: 30, hasNightAction: true,
    description: 'Mỗi đêm bảo vệ 1 người. Không thể bảo vệ cùng 1 người 2 đêm liên tiếp.',
    ability: 'Bảo vệ 1 người mỗi đêm',
  },
  hunter: {
    id: 'hunter', name: 'Thợ săn', team: 'villager', emoji: '🏹',
    icon: '🎯', color: '#dc2626',
    nightOrder: 0, hasNightAction: false,
    description: 'Khi bị giết (cả đêm lẫn ngày), được bắn chết 1 người cùng lúc.',
    ability: 'Bắn 1 người khi chết',
  },
  cupid: {
    id: 'cupid', name: 'Thần tình yêu', team: 'villager', emoji: '💘',
    icon: '❤️', color: '#ec4899',
    nightOrder: 10, hasNightAction: true,
    description: 'Đêm đầu, ghép 2 người thành cặp tình nhân. Nếu 1 chết, 2 kia cũng chết theo.',
    ability: 'Ghép đôi đêm đầu',
  },
  priest: {
    id: 'priest', name: 'Linh mục', team: 'villager', emoji: '⛪',
    icon: '✨', color: '#fbbf24',
    nightOrder: 40, hasNightAction: true,
    description: 'Mỗi đêm có thể phong ấm 1 người để chống lại sự chuyển hóa (Cult, Vampire).',
    ability: 'Phong ấm 1 người',
  },
  mason: {
    id: 'mason', name: 'Người xây', team: 'villager', emoji: '🔨',
    icon: '🏛️', color: '#a16207',
    nightOrder: 5, hasNightAction: false,
    description: 'Biết ai là Mason khác. Nếu chỉ có 1 Mason thì không có khả năng đặc biệt.',
    ability: 'Biết Mason khác (đêm đầu)',
  },
  detective: {
    id: 'detective', name: 'Thám tử', team: 'villager', emoji: '🕵️',
    icon: '🔍', color: '#0891b2',
    nightOrder: 55, hasNightAction: true,
    description: 'Mỗi đêm, điều tra 1 người. Nếu điều tra sói, được phép điều tra thêm 1 người cùng đêm.',
    ability: 'Điều tra, có thể điều tra 2 nếu trúng sói',
  },
  troubadour: {
    id: 'troubadour', name: 'Nhạc sĩ', team: 'villager', emoji: '🎭',
    icon: '🎵', color: '#10b981',
    nightOrder: 0, hasNightAction: false,
    description: 'Nếu chỉ có 1 Troubadour hoặc là Troubadour duy nhất còn sống, thắng.',
    ability: 'Thắng nếu còn 1 mình',
  },
  spellcaster: {
    id: 'spellcaster', name: 'Pháp sư', team: 'villager', emoji: '✨',
    icon: '🌟', color: '#8b5cf6',
    nightOrder: 45, hasNightAction: true,
    description: 'Mỗi đêm, có thể phong ấm 1 người (như Linh mục) hoặc xóa phong ấm của 1 người.',
    ability: 'Phong ấm hoặc xóa phong ấm',
  },

  // === MA SÓI ===
  werewolf: {
    id: 'werewolf', name: 'Ma sói', team: 'werewolf', emoji: '🐺',
    icon: '🌕', color: '#dc2626',
    nightOrder: 70, hasNightAction: true,
    description: 'Mỗi đêm, cùng đồng đội chọn 1 người để giết. Thắng khi số lượng sói ≥ phe dân.',
    ability: 'Giết 1 người mỗi đêm (cùng đội)',
  },
  alpha_wolf: {
    id: 'alpha_wolf', name: 'Sói đầu đàn', team: 'werewolf', emoji: '🐺',
    icon: '👑', color: '#991b1b',
    nightOrder: 65, hasNightAction: true,
    description: 'Sói đặc biệt. Mỗi đêm có thể cắn 1 người (giết hoặc chuyển thành sói con nếu dân).',
    ability: 'Cắn 1 người mỗi đêm',
  },
  wolf_cub: {
    id: 'wolf_cub', name: 'Sói con', team: 'werewolf', emoji: '🐺',
    icon: '🐶', color: '#b91c1c',
    nightOrder: 60, hasNightAction: false,
    description: 'Khi chết, đêm tiếp theo sói được giết 2 người thay vì 1.',
    ability: 'Sói giết gấp đôi đêm sau khi chết',
  },
  lone_wolf: {
    id: 'lone_wolf', name: 'Sói cô độc', team: 'werewolf', emoji: '🐺',
    icon: '🌑', color: '#7f1d1d',
    nightOrder: 75, hasNightAction: true,
    description: 'Khi là sói duy nhất còn sống, giết được 2 người mỗi đêm. Khi có sói khác, chỉ giết 1.',
    ability: 'Giết 2 khi một mình',
  },

  // === MA CÀ RỒNG ===
  vampire: {
    id: 'vampire', name: 'Ma cà rồng', team: 'vampire', emoji: '🧛',
    icon: '🦇', color: '#7c2d12',
    nightOrder: 70, hasNightAction: true,
    description: 'Giống Ma sói nhưng thuộc phe riêng. Ăn 1 người mỗi đêm (cùng đội).',
    ability: 'Ăn 1 người mỗi đêm (cùng đội)',
  },

  // === TRUNG LẬP ===
  tanner: {
    id: 'tanner', name: 'Người thuộc da', team: 'tanner', emoji: '🎭',
    icon: '🪓', color: '#f59e0b',
    nightOrder: 0, hasNightAction: false,
    description: 'Thắng nếu bị dân làng treo cổ vào ban ngày.',
    ability: 'Thắng khi bị vote chết',
  },
  cultist: {
    id: 'cultist', name: 'Tà giáo', team: 'cultist', emoji: '👤',
    icon: '🌚', color: '#9333ea',
    nightOrder: 25, hasNightAction: true,
    description: 'Mỗi đêm có thể chuyển hóa 1 người thành Cultist (thành viên tà giáo).',
    ability: 'Chuyển hóa 1 người/đêm',
  },
  arsonist: {
    id: 'arsonist', name: 'Kẻ phóng hỏa', team: 'arsonist', emoji: '🔥',
    icon: '🕯️', color: '#ea580c',
    nightOrder: 35, hasNightAction: true,
    description: 'Mỗi đêm tẩm dầu 1 người. Nhấn nút đốt sẽ đốt tất cả người đã tẩm dầu.',
    ability: 'Tẩm dầu hoặc đốt',
  },
};

// Roles for randomization (excludes special variants like alpha_wolf, wolf_cub)
export const DEFAULT_ROLES_POOL = [
  'werewolf', 'werewolf', 'villager', 'villager', 'villager', 'villager',
  'seer', 'witch', 'guard', 'hunter',
];

// Recommended role count by player count
export const ROLE_PRESETS = {
  3: ['werewolf', 'seer', 'villager'],
  4: ['werewolf', 'seer', 'guard', 'villager'],
  5: ['werewolf', 'seer', 'witch', 'guard', 'villager'],
  6: ['werewolf', 'werewolf', 'seer', 'witch', 'guard', 'villager'],
  7: ['werewolf', 'werewolf', 'seer', 'witch', 'guard', 'hunter', 'villager'],
  8: ['werewolf', 'werewolf', 'seer', 'witch', 'guard', 'hunter', 'cupid', 'villager'],
  9: ['werewolf', 'werewolf', 'alpha_wolf', 'seer', 'witch', 'guard', 'hunter', 'cupid', 'villager'],
  10: ['werewolf', 'werewolf', 'alpha_wolf', 'wolf_cub', 'seer', 'witch', 'guard', 'hunter', 'cupid', 'villager'],
  12: ['werewolf', 'werewolf', 'alpha_wolf', 'wolf_cub', 'seer', 'witch', 'guard', 'hunter', 'cupid', 'detective', 'priest', 'villager'],
  15: ['werewolf', 'werewolf', 'werewolf', 'alpha_wolf', 'wolf_cub', 'lone_wolf', 'seer', 'witch', 'guard', 'hunter', 'cupid', 'detective', 'priest', 'troubadour', 'tanner'],
};

export function rolesForPlayerCount(n) {
  if (ROLE_PRESETS[n]) return ROLE_PRESETS[n];
  // Fallback: scale wolves, add special roles, fill villagers
  const wolves = Math.max(1, Math.floor(n / 5));
  const special = n >= 6 ? ['seer'] : [];
  if (n >= 7) special.push('witch');
  if (n >= 8) special.push('guard');
  if (n >= 9) special.push('hunter');
  if (n >= 10) special.push('cupid');
  const result = [];
  for (let i = 0; i < wolves; i++) result.push(i === 0 ? 'werewolf' : (n >= 9 ? 'werewolf' : 'werewolf'));
  if (n >= 9 && wolves > 1) result.push('alpha_wolf');
  result.push(...special);
  while (result.length < n) result.push('villager');
  return result.slice(0, n);
}