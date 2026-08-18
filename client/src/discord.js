// User identity helper — supports both Discord Activity mode and local mode

const STORAGE_KEY = 'ww_user_v1';

export async function getOrCreateUser() {
  // First: try Discord Activity
  try {
    const { initDiscord, getDiscordUser, isDiscordMode } = await import('./discord-activity.js');
    if (typeof window !== 'undefined') {
      const ctx = await initDiscord();
      if (ctx) {
        const discordUser = getDiscordUser();
        if (discordUser) {
          const user = {
            id: `discord-${discordUser.id}`,
            name: discordUser.global_name || discordUser.username,
            avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
            isDiscord: true,
            discordId: discordUser.id,
            channelId: discordUser.channelId,
            guildId: discordUser.guildId,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          return user;
        }
      }
    }
  } catch (e) {
    console.warn('[discord] init failed, falling back to local:', e);
  }

  // Fallback: local user (random name or saved)
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && saved.id) return saved;
  } catch {}
  const user = {
    id: 'u-' + Math.random().toString(36).slice(2, 10),
    name: 'Khách ' + Math.floor(Math.random() * 9999),
    avatar: null,
    isDiscord: false,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function setUserName(name) {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    user.name = name;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {}
}

export function getAvatarUrl(avatarOrId) {
  if (!avatarOrId) return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(avatarOrId || 'guest')}`;
  if (avatarOrId.startsWith('http')) return avatarOrId;
  if (avatarOrId.startsWith('discord-')) return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(avatarOrId)}`;
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(avatarOrId)}`;
}