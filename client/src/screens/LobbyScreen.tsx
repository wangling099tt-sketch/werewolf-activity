import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Users, Settings, Swords, Zap, Trophy, 
  ChevronRight, Star, Crown, Sparkles, LogIn, List
} from 'lucide-react';
import { useState } from 'react';
import { getAvatarUrl } from '../hooks/useDiscordSdk';
import { HowToPlay } from '../components/HowToPlay';
import { RoomBrowser } from '../components/RoomBrowser';
import { SettingsModal } from '../components/SettingsModal';
import { sound } from '../utils/sound';

interface LobbyScreenProps {
  discord: { user: any; status: string };
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  connected: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function LobbyScreen({ discord, onCreateRoom, onJoinRoom, connected }: LobbyScreenProps) {
  const user = discord.user;
  const avatarUrl = user ? getAvatarUrl(user.id, user.avatar) : '';
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showRoomBrowser, setShowRoomBrowser] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
    >
      {/* Connection Status */}
      <motion.div 
        className="absolute top-4 right-4 flex items-center gap-2"
        variants={itemVariants}
      >
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-wv-success animate-pulse' : 'bg-wv-danger'}`} />
        <span className="text-xs text-wv-text-dim">{connected ? 'Connected' : 'Connecting...'}</span>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="mb-12 text-center">
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
          
          <motion.div 
            className="absolute -inset-2 rounded-full border-2 border-wv-primary/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          
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
        {/* Quick Match / Create Room */}
        <motion.button
          className="wv-btn-primary text-lg py-4 px-8 w-full relative overflow-hidden group"
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateRoom}
          disabled={!connected}
        >
          <Play className="w-6 h-6" />
          <span>Create Room</span>
          <Swords className="w-5 h-5 ml-auto opacity-50" />
        </motion.button>

        {/* Join Room */}
        <motion.div variants={itemVariants}>
          {!showJoinInput ? (
            <motion.button
              className="wv-btn-secondary text-lg py-4 px-8 w-full"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowJoinInput(true)}
            >
              <LogIn className="w-6 h-6" />
              <span>Join Room</span>
              <ChevronRight className="w-5 h-5 ml-auto opacity-50" />
            </motion.button>
          ) : (
            <motion.div
              className="wv-card flex gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <input
                type="text"
                placeholder="Room code (e.g. WV-ABC1)"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                className="wv-input flex-1"
                autoFocus
              />
              <motion.button
                className="wv-btn-primary px-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => roomCode.trim() && onJoinRoom(roomCode.trim())}
              >
                Join
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Browse Rooms */}
        <motion.button
          className="wv-btn-secondary text-lg py-4 px-8 w-full"
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { sound.play('click'); setShowRoomBrowser(true); }}
        >
          <List className="w-6 h-6" />
          <span>Browse Rooms</span>
          <Users className="w-5 h-5 ml-auto opacity-50" />
        </motion.button>

        {/* How to Play */}
        <motion.button
          className="wv-btn-ghost text-lg py-4 px-8 w-full"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { sound.play('click'); setShowHowToPlay(true); }}
        >
          <Sparkles className="w-6 h-6" />
          <span>How to Play</span>
        </motion.button>

        {/* Settings */}
        <motion.button
          className="wv-btn-ghost text-lg py-3 px-8 w-full"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { sound.play('click'); setShowSettings(true); }}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
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
          whileHover={{ y: -5 }}
        >
          <Users className="w-8 h-8 text-wv-accent mx-auto mb-2" />
          <p className="text-2xl font-bold text-wv-text">89%</p>
          <p className="text-xs text-wv-text-dim">Win Rate</p>
        </motion.div>
        
        <motion.div 
          className="wv-card text-center p-4"
          variants={itemVariants}
          whileHover={{ y: -5 }}
        >
          <Star className="w-8 h-8 text-wv-accent-cyan mx-auto mb-2" />
          <p className="text-2xl font-bold text-wv-text">15</p>
          <p className="text-xs text-wv-text-dim">Roles</p>
        </motion.div>
      </motion.div>

      {/* How to Play Modal */}
      <AnimatePresence>
        {showHowToPlay && <HowToPlay onClose={() => setShowHowToPlay(false)} />}
      </AnimatePresence>

      {/* Room Browser Modal */}
      <AnimatePresence>
        {showRoomBrowser && (
          <RoomBrowser 
            onClose={() => setShowRoomBrowser(false)} 
            onJoinRoom={(id) => { setShowRoomBrowser(false); onJoinRoom(id); }}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}