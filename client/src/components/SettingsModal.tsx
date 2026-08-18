import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Globe, Moon, Bell, Shield, ChevronRight } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { sound } from '../utils/sound';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { muted, toggleMute } = useSettings();
  const [lang, setLang] = useState<'vi' | 'en'>('en');
  const [notifications, setNotifications] = useState(true);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-wv-bg-deep/95 backdrop-blur-md p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-wv-display text-gradient-wv">Settings</h2>
          <motion.button
            className="wv-btn-ghost p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        <div className="space-y-3">
          {/* Sound */}
          <SettingsRow 
            icon={muted ? VolumeX : Volume2} 
            label="Sound" 
            value={muted ? 'Off' : 'On'} 
            onClick={() => { sound.play('click'); toggleMute(); }}
          />

          {/* Language */}
          <SettingsRow 
            icon={Globe} 
            label="Language" 
            value={lang === 'vi' ? 'Tiếng Việt' : 'English'} 
            onClick={() => { setLang(l => l === 'vi' ? 'en' : 'vi'); sound.play('click'); }}
          />

          {/* Notifications */}
          <SettingsRow 
            icon={Bell} 
            label="Notifications" 
            value={notifications ? 'On' : 'Off'} 
            onClick={() => { setNotifications(n => !n); sound.play('click'); }}
          />

          {/* Theme */}
          <SettingsRow 
            icon={Moon} 
            label="Theme" 
            value="Dark" 
            onClick={() => {}}
            disabled
          />

          {/* Privacy */}
          <SettingsRow 
            icon={Shield} 
            label="Privacy Policy" 
            value="" 
            onClick={() => {}}
          />
        </div>

        <motion.div
          className="mt-8 text-center text-wv-text-muted text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p>Wolvesville v2.0</p>
          <p className="text-xs mt-1">Built with 💜</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SettingsRow({ icon: Icon, label, value, onClick, disabled }: any) {
  return (
    <motion.div
      className={`wv-card flex items-center gap-4 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
      whileHover={!disabled ? { x: 4 } : {}}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="w-10 h-10 rounded-full bg-wv-primary/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-wv-primary" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-wv-text">{label}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-wv-text-dim">{value}</span>
        <ChevronRight className="w-5 h-5 text-wv-text-muted" />
      </div>
    </motion.div>
  );
}