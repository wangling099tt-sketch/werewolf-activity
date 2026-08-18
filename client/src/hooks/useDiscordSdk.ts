import { useState, useEffect } from 'react';

interface DiscordUser {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string;
  discriminator: string;
}

interface DiscordSdkState {
  status: 'loading' | 'error' | 'authenticated';
  user: DiscordUser | null;
  error?: string;
}

const CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID || '1414397182890606665';

export function useDiscordSdk() {
  const [state, setState] = useState<DiscordSdkState>({
    status: 'loading',
    user: null,
  });

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 2;

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
      });
    }, 4000);

    async function initDiscord() {
      try {
        // Dynamic import to handle non-Discord environments
        const { DiscordSDK } = await import('@discord/embedded-app-sdk');
        const discordSdk = new DiscordSDK(CLIENT_ID);

        await discordSdk.ready();
        
        if (!mounted) return;

        // For development without real Discord, use mock user
        const { code } = await discordSdk.commands.authenticate({
          access_token: 'dev_token_' + Date.now(),
        });

        if (!mounted) return;

        if (code) {
          // Real Discord auth
          clearTimeout(fallbackTimeout);
          const user = {
            id: discordSdk.user.id || 'dev_user',
            username: discordSdk.user.username || 'DevPlayer',
            globalName: discordSdk.user.globalName || 'Dev Player',
            avatar: discordSdk.user.avatar || '',
            discriminator: discordSdk.user.discriminator || '0',
          };
          
          setState({ status: 'authenticated', user });
        } else {
          // Dev mode - create mock user
          clearTimeout(fallbackTimeout);
          setState({
            status: 'authenticated',
            user: {
              id: 'dev_' + Math.random().toString(36).slice(2),
              username: 'DevPlayer',
              globalName: 'Dev Player',
              avatar: '',
              discriminator: '0',
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
    // Default avatar based on discriminator
    const defaultIndex = parseInt(userId || '0') % 6;
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
  }
  return `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png?size=${size}`;
}