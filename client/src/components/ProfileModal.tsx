import { motion } from 'framer-motion';
import { Trophy, Users, Star, Target, Zap, Crown, X, Award } from 'lucide-react';
import { getAvatarUrl } from '../hooks/useDiscordSdk';

interface ProfileModalProps {
  onClose: () => void;
  user: any;
  stats?: {
    gamesWon: number;
    gamesLost: number;
    winRate: number;
    rolesPlayed: number;
    kills: number;
    correctVotes: number;
  };
}

export function ProfileModal({ onClose, user, stats }: ProfileModalProps) {
  const defaultStats = {
    gamesWon: 247,
    gamesLost: 31,
    winRate: 89,
    rolesPlayed: 15,
    kills: 142,
    correctVotes: 198,
  };
  const s = stats || defaultStats;
  const avatarUrl = user ? getAvatarUrl(user.id, user.avatar, 256) : '';
  
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-wv-bg-deep/95 backdrop-blur-md p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-wv-display text-gradient-wv">Profile</h2>
          <motion.button
            className="wv-btn-ghost p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Avatar Header */}
        <motion.div 
          className="text-center mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="relative inline-block mb-3">
            <motion.div
              className="w-32 h-32 rounded-full overflow-hidden border-4 border-wv-primary p-0.5"
              animate={{ 
                boxShadow: [
                  '0 0 0 0 rgba(108, 92, 231, 0.5)',
                  '0 0 30px 10px rgba(108, 92, 231, 0.3)',
                  '0 0 0 0 rgba(108, 92, 231, 0)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <img 
                src={avatarUrl} 
                alt={user?.globalName || user?.username}
                className="w-full h-full rounded-full object-cover bg-wv-bg-card"
              />
            </motion.div>
            
            {/* Level badge */}
            <motion.div 
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-wv-primary to-wv-accent font-bold text-white shadow-lg"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Crown className="w-4 h-4 inline mr-1" />
              LVL 42
            </motion.div>
          </div>
          
          <h3 className="text-2xl font-wv-display text-wv-text mt-4">
            {user?.globalName || user?.username || 'Player'}
          </h3>
          <p className="text-wv-text-dim text-sm">@{user?.username}</p>
          
          {/* XP Bar */}
          <div className="mt-4 max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-wv-text-dim mb-1">
              <span>1500 XP</span>
              <span>2000 XP</span>
            </div>
            <div className="h-2 bg-wv-bg-deep rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-wv-primary to-wv-accent"
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard icon={Trophy} color="#fdcb6e" label="Games Won" value={s.gamesWon} delay={0.1} />
          <StatCard icon={Target} color="#fd79a8" label="Win Rate" value={`${s.winRate}%`} delay={0.15} />
          <StatCard icon={Star} color="#00cec9" label="Roles" value={s.rolesPlayed} delay={0.2} />
          <StatCard icon={Zap} color="#e74c3c" label="Kills" value={s.kills} delay={0.25} />
        </div>

        {/* Achievements */}
        <motion.div 
          className="wv-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-wv-gold" />
            <h4 className="font-bold text-wv-text">Achievements</h4>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {['🏆', '⚔️', '🛡️', '🔮', '👻', '🐺', '💀', '✨'].map((emoji, i) => (
              <motion.div
                key={i}
                className="aspect-square rounded-xl bg-wv-bg-panel/50 flex items-center justify-center text-2xl cursor-pointer"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                title={`Achievement ${i + 1}`}
              >
                {emoji}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, color, label, value, delay }: any) {
  return (
    <motion.div 
      className="wv-card text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ y: -4, boxShadow: `0 8px 30px ${color}30` }}
    >
      <Icon className="w-6 h-6 mx-auto mb-2" style={{ color }} />
      <p className="text-2xl font-bold text-wv-text">{value}</p>
      <p className="text-xs text-wv-text-dim">{label}</p>
    </motion.div>
  );
}