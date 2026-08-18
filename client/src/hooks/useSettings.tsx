import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/sound';

export function useSettings() {
  const [muted, setMuted] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('wv_muted') === 'true';
  });
  
  useEffect(() => {
    sound.setMuted(muted);
    if (typeof window !== 'undefined') {
      localStorage.setItem('wv_muted', String(muted));
    }
  }, [muted]);

  return { muted, toggleMute: () => setMuted(m => !m) };
}

export function MuteButton() {
  const { muted, toggleMute } = useSettings();
  
  return (
    <motion.button
      className="fixed top-4 left-4 z-30 wv-btn-ghost p-2 rounded-full bg-wv-bg-card/80 backdrop-blur"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleMute}
      title={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
    </motion.button>
  );
}