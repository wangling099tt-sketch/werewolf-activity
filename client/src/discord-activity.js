// Discord Activity (Embedded App SDK) helper
// Detects if running inside Discord iframe; falls back to local mode if not

import { DiscordSDK } from '@discord/embedded-app-sdk';

const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID || '';

let sdk = null;
let auth = null;
let channelId = null;
let guildId = null;
let initPromise = null;

function detectDiscordIframe() {
  if (typeof window === 'undefined') return false;
  // Discord embeds the activity with frame_id in URL
  return !!(
    window.location.search.includes('frame_id') ||
    (window.parent !== window) ||
    window.discord
  );
}

export function initDiscord() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (!CLIENT_ID) {
      console.warn('[discord] No VITE_DISCORD_CLIENT_ID — running in local mode');
      return null;
    }
    if (!detectDiscordIframe()) {
      console.log('[discord] Not in Discord iframe — local mode');
      return null;
    }

    try {
      sdk = new DiscordSDK(CLIENT_ID);
      await sdk.ready();

      const { code } = await sdk.authorize({
        client_id: CLIENT_ID,
        response_type: 'code',
        scope: ['identify', 'guilds'],
        prompt: 'none',
      });

      const resp = await fetch('/api/discord/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        console.error('[discord] token exchange failed:', data);
        return null;
      }

      const authResult = await sdk.authenticate(data.access_token);
      auth = authResult;

      try {
        const channel = await sdk.channel.get();
        channelId = channel.id;
        guildId = channel.guild_id;
      } catch {}

      console.log('[discord] Authenticated as', auth.user?.username, 'in channel', channelId);
      return { auth, channelId, guildId, sdk };
    } catch (e) {
      console.error('[discord] init failed:', e);
      return null;
    }
  })();
  return initPromise;
}

export function getDiscordUser() {
  if (!auth) return null;
  return {
    id: auth.user?.id,
    username: auth.user?.username,
    avatar: auth.user?.avatar,
    global_name: auth.user?.global_name,
    channelId,
    guildId,
  };
}

export function isDiscordMode() {
  return !!auth;
}

export function openExternalLink(url) {
  if (sdk?.openExternalLink) {
    sdk.openExternalLink({ url });
  } else {
    window.open(url, '_blank');
  }
}