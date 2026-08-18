import { useState, useEffect } from 'react';

interface DiscordUser {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string;
  discriminator: string;
}

interface DiscordActivityInfo {
  channelId: string | null;
  guildId: string | null;
  applicationId: string | null;
}

interface DiscordSdkState {
  status: 'loading' | 'error' | 'authenticated';
  user: DiscordUser | null;
  activity?: DiscordActivityInfo;
  error?: string;
}

const CLIENT_ID = (import.meta.env.VITE_DISCORD_CLIENT_ID as string) || '1414397182890606665';

export function useDiscordSdk() {
  const [state, setState] = useState<DiscordSdkState>({
    status: 'loading',
    user: null,
  });

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 2;

    // Check if running in Discord iframe
    const isInDiscord = typeof window !== 'undefined' && (
      // Discord injects __DISCORD__ or has iframe parent
      (window as any).__DISCORD__ !== undefined ||
      (window as any).DiscordSDK !== undefined ||
      // Check parent window origin
      (() => {
        try {
          return window.parent !== window && 
                 new URL(window.parent.location.href).hostname.includes('discord');
        } catch (e) {
          return false;
        }
      })()
    );

    // Auto-fallback timeout - if Discord SDK doesn't initialize in 4s, use mock
    const fallbackTimeout = setTimeout(() => {
      if (!mounted) return;
      console.log('⏱️ Discord SDK timeout, using dev mode');
      setState({
        status: 'authenticated',
        user: {
          id: 'dev_' + Math.random().toString(36).slice(2),
          username: 'DevPlayer',
          globalName: 'Dev Player',
          avatar: '',
          discriminator: '0',
        },
        activity: {
          channelId: null,
          guildId: null,
          applicationId: CLIENT_ID,
        },
      });
    }, isInDiscord ? 10000 : 4000);

    async function initDiscord() {
      try {
        // Dynamic import to handle non-Discord environments
        const { DiscordSDK } = await import('@discord/embedded-app-sdk');
        const discordSdk = new DiscordSDK(CLIENT_ID);
        
        // Expose for debugging
        (window as any).__discordSdk = discordSdk;

        await discordSdk.ready();
        
        if (!mounted) return;

        // Try to authenticate - this only works inside Discord iframe
        const { code } = await discordSdk.commands.authenticate({
          access_token: 'dev_token_' + Date.now(),
        });

        if (!mounted) return;

        clearTimeout(fallbackTimeout);
        
        if (code) {
          // Real Discord auth - we have a code, but we need to exchange it for user info
          // In real Discord Activity, the parent iframe provides user info via discordSdk.user
          const user = (discordSdk as any).user || {
            id: 'discord_' + Math.random().toString(36).slice(2),
            username: 'DiscordUser',
            globalName: 'Discord User',
            avatar: '',
            discriminator: '0',
          };
          
          // Get activity info from URL/iframe
          const channelId = (discordSdk as any).channelId || new URLSearchParams(window.location.search).get('channel_id');
          const guildId = (discordSdk as any).guildId || new URLSearchParams(window.location.search).get('guild_id');
          
          setState({
            status: 'authenticated',
            user: {
              id: user.id,
              username: user.username,
              globalName: user.globalName || user.username,
              avatar: user.avatar,
              discriminator: user.discriminator || '0',
            },
            activity: {
              channelId,
              guildId,
              applicationId: CLIENT_ID,
            },
          });
        } else {
          // Dev mode - create mock user
          setState({
            status: 'authenticated',
            user: {
              id: 'dev_' + Math.random().toString(36).slice(2),
              username: 'DevPlayer',
              globalName: 'Dev Player',
              avatar: '',
              discriminator: '0',
            },
            activity: {
              channelId: null,
              guildId: null,
              applicationId: CLIENT_ID,
            },
          });
        }
      } catch (err) {
        console.error('Discord SDK error:', err);
        if (!mounted) return;
        
        retryCount++;
        if (retryCount < maxRetries) {
          setTimeout(initDiscord, 2000);
        } else {
          clearTimeout(fallbackTimeout);
          // Fallback to mock user for development
          setState({
            status: 'authenticated',
            user: {
              id: 'dev_' + Math.random().toString(36).slice(2),
              username: 'DevPlayer',
              globalName: 'Dev Player',
              avatar: '',
              discriminator: '0',
            },
            activity: {
              channelId: null,
              guildId: null,
              applicationId: CLIENT_ID,
            },
          });
        }
      }
    }

    initDiscord();

    return () => {
      mounted = false;
      clearTimeout(fallbackTimeout);
    };
  }, []);

  return state;
}

export function getAvatarUrl(userId: string, avatar: string, size = 128): string {
  if (!avatar) {
    const defaultIndex = parseInt(userId || '0') % 6;
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=${size}`;
}