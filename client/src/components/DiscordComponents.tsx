import { motion } from 'framer-motion';
import { Hash, Users, Globe, Check, X, Mic, MicOff, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDiscordSdk } from '../hooks/useDiscordSdk';

interface DiscordActivityBadgeProps {
  activity?: any;
  className?: string;
}

export function DiscordActivityBadge({ activity, className = '' }: DiscordActivityBadgeProps) {
  if (!activity || (!activity.channelId && !activity.guildId)) return null;
  
  return (
    <motion.div
      className={`fixed bottom-4 right-4 z-30 wv-card flex items-center gap-2 px-3 py-2 ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      <div className="w-2 h-2 rounded-full bg-wv-success animate-pulse" />
      <span className="text-xs text-wv-text">
        {activity.guildId && activity.channelId ? (
          <>Running in Discord</>
        ) : (
          <>Discord SDK Active</>
        )}
      </span>
    </motion.div>
  );
}

interface VoicePanelProps {
  onClose?: () => void;
}

export function VoicePanel({ onClose }: VoicePanelProps) {
  const discord = useDiscordSdk();
  const [voiceMembers, setVoiceMembers] = useState<any[]>([]);
  const [inVoice, setInVoice] = useState(false);

  useEffect(() => {
    // Listen to voice state changes when in Discord Activity
    if (!discord.activity?.channelId) return;
    
    const interval = setInterval(async () => {
      try {
        const sdk = (window as any).__discordSdk;
        if (!sdk) return;
        
        // Get current voice channel members
        // This is a simplified version - real Discord SDK would use events
      } catch (e) {
        // ignore
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [discord.activity]);

  const toggleVoice = async () => {
    const sdk = (window as any).__discordSdk;
    if (!sdk) {
      console.log('Voice not available outside Discord');
      return;
    }
    
    try {
      if (inVoice) {
        await sdk.commands.leaveVoice();
        setInVoice(false);
      } else {
        await sdk.commands.joinVoice({
          channelId: discord.activity?.channelId || '',
          guildId: discord.activity?.guildId || '',
          selfMute: false,
          selfDeaf: false,
        });
        setInVoice(true);
      }
    } catch (err) {
      console.error('Voice toggle failed:', err);
    }
  };

  return (
    <motion.div
      className="wv-card"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-5 h-5 text-wv-accent-cyan" />
        <h3 className="font-bold text-wv-text">Voice Channel</h3>
        {onClose && (
          <button onClick={onClose} className="ml-auto opacity-50 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {discord.activity?.channelId ? (
        <div className="space-y-2">
          <div className="text-xs text-wv-text-dim">
            <Hash className="w-3 h-3 inline mr-1" />
            Active in voice channel
          </div>
          
          <motion.button
            className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${
              inVoice 
                ? 'bg-wv-danger text-white' 
                : 'bg-wv-success text-white'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleVoice}
          >
            {inVoice ? (
              <><MicOff className="w-4 h-4" /> Leave Voice</>
            ) : (
              <><Mic className="w-4 h-4" /> Join Voice</>
            )}
          </motion.button>
          
          {voiceMembers.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-wv-text-dim mb-2">In channel:</p>
              {voiceMembers.map(m => (
                <div key={m.id} className="flex items-center gap-2 py-1">
                  <div className="w-6 h-6 rounded-full bg-wv-primary/30 flex items-center justify-center text-xs">
                    {m.username?.charAt(0) || '?'}
                  </div>
                  <span className="text-sm">{m.username}</span>
                  {m.muted && <MicOff className="w-3 h-3 text-wv-text-muted" />}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <Globe className="w-8 h-8 text-wv-text-muted mx-auto mb-2" />
          <p className="text-xs text-wv-text-dim">
            Open this app in a Discord voice channel to use voice
          </p>
        </div>
      )}
    </motion.div>
  );
}

interface ServerBadgeProps {
  guildId?: string | null;
}

export function ServerBadge({ guildId }: ServerBadgeProps) {
  if (!guildId) return null;
  
  return (
    <motion.div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1 rounded-full bg-wv-bg-card/80 backdrop-blur border border-wv-primary/30"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-2 h-2 rounded-full bg-wv-success" />
      <span className="text-xs text-wv-text">
        Playing in Discord server
      </span>
    </motion.div>
  );
}