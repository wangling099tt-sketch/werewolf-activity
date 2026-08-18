import { motion } from 'framer-motion';
import { 
  Play, Users, Settings, Swords, Zap, Trophy, 
  ChevronRight, Star, Crown, Sparkles 
} from 'lucide-react';
import { getAvatarUrl } from '../hooks/useDiscordSdk';

interface LobbyScreenProps {
  discord: { user: any; status: string };
  onNavigate: (screen: 'lobby' | 'room' | 'game') => void;
  gameState: any;
  setGameState: any;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function LobbyScreen({ discord, onNavigate, gameState, setGameState }: LobbyScreenProps) {
  const user = discord.user;
  const avatarUrl = user ? getAvatarUrl(user.id, user.avatar) : '';

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
    >
      {/* Header with User */}
      <motion.div variants={itemVariants} className="mb-12 text-center">
        {/* Animated Avatar */}
        <div className="relative inline-block mb-4">
          <motion.div 
            className="wv-avatar w-24 h-24"
            whileHover={{ scale: 1.1 }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-wv-primary to-wv-accent p-0.5">
              <img 
                src={avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'} 
                alt={user?.username || 'Player'}
                className="w-full h-full rounded-full object-cover bg-wv-bg-card"
              />
            </div>
          </motion.div>
          
          {/* Status Ring Animation */}
          <motion.div 
            className="absolute -inset-2 rounded-full border-2 border-wv-primary/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          
          {/* Online Indicator */}
          <div className="wv-avatar-online" />
        </div>
        
        <motion.h2 
          className="text-2xl font-wv-display text-wv-text mb-1"
          variants={itemVariants}
        >
          {user?.globalName || user?.username || 'Player'}
        </motion.h2>
        
        <motion.p className="text-wv-text-dim text-sm" variants={itemVariants}>
          {user?.username && user.username !== user?.globalName ? `@${user.username}` : ''}
        </motion.p>
        
        {/* XP Badge */}
        <motion.div className="mt-3 inline-flex items-center gap-2" variants={itemVariants}>
          <div className="wv-badge-primary">
            <Zap className="w-4 h-4" />
            <span>Level 42</span>
          </div>
          <div className="wv-badge-gold">
            <Crown className="w-4 h-4" />
            <span>1500 XP</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Main Actions */}
      <motion.div 
        className="flex flex-col gap-4 w-full max-w-md mb-8"
        variants={containerVariants}
      >
        {/* Quick Match */}
        <motion.button
          className="wv-btn-primary text-lg py-4 px-8 w-full relative overflow-hidden group"
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setGameState({ ...gameState, players: [
              { id: user?.id || '1', name: user?.globalName || 'You', avatar: avatarUrl, isReady: true, isHost: true },
              { id: '2', name: 'Bot_Minh', avatar: '', isReady: true, isHost: false },
              { id: '3', name: 'Bot_An', avatar: '', isReady: false, isHost: false },
            ]});
            onNavigate('room');
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6 }}
          />
          <Play className="w-6 h-6" />
          <span>Quick Match</span>
          <Star className="w-5 h-5 ml-auto opacity-50" />
        </motion.button>

        {/* Create Custom Game */}
        <motion.button
          className="wv-btn-secondary text-lg py-4 px-8 w-full"
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('room')}
        >
          <Swords className="w-6 h-6" />
          <span>Create Custom Room</span>
          <ChevronRight className="w-5 h-5 ml-auto opacity-50" />
        </motion.button>

        {/* How to Play */}
        <motion.button
          className="wv-btn-ghost text-lg py-4 px-8 w-full"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles className="w-6 h-6" />
          <span>How to Play</span>
        </motion.button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        className="grid grid-cols-3 gap-4 w-full max-w-md"
        variants={containerVariants}
      >
        <motion.div 
          className="wv-card text-center p-4"
          variants={itemVariants}
          whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(108, 92, 231, 0.3)' }}
        >
          <Trophy className="w-8 h-8 text-wv-gold mx-auto mb-2" />
          <p className="text-2xl font-bold text-wv-text">247</p>
          <p className="text-xs text-wv-text-dim">Games Won</p>
        </motion.div>
        
        <motion.div 
          className="wv-card text-center p-4"
          variants={itemVariants}
          whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(253, 121, 168, 0.3)' }}
        >
          <Users className="w-8 h-8 text-wv-accent mx-auto mb-2" />
          <p className="text-2xl font-bold text-wv-text">89%</p>
          <p className="text-xs text-wv-text-dim">Win Rate</p>
        </motion.div>
        
        <motion.div 
          className="wv-card text-center p-4"
          variants={itemVariants}
          whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(0, 206, 201, 0.3)' }}
        >
          <Star className="w-8 h-8 text-wv-accent-cyan mx-auto mb-2" />
          <p className="text-2xl font-bold text-wv-text">15</p>
          <p className="text-xs text-wv-text-dim">Roles Mastered</p>
        </motion.div>
      </motion.div>

      {/* Bottom Nav */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-glass-wv border-t border-white/10 p-4"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, type: 'spring' }}
      >
        <div className="flex justify-around max-w-lg mx-auto">
          <NavButton icon={<Swords />} label="Play" active />
          <NavButton icon={<Trophy />} label="Stats" />
          <NavButton icon={<Settings />} label="Settings" />
          <NavButton icon={<Users />} label="Friends" />
        </div>
      </motion.div>
    </motion.div>
  );
}

function NavButton({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <motion.button
      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
        active ? 'text-wv-primary' : 'text-wv-text-dim hover:text-wv-text'
      }`}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
      {active && (
        <motion.div 
          className="absolute -top-1 w-8 h-1 bg-wv-primary rounded-full"
          layoutId="activeTab"
        />
      )}
    </motion.button>
  );
}