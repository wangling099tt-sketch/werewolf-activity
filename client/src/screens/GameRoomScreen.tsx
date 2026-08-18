import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Crown, Play, Plus, Minus, 
  Eye, Shield, Swords, User, Ghost, Zap, Check
} from 'lucide-react';
import { useState } from 'react';
import { getAvatarUrl } from '../hooks/useDiscordSdk';

interface GameRoomScreenProps {
  discord: { user: any; status: string };
  onNavigate: (screen: 'lobby' | 'room' | 'game') => void;
  gameState: any;
  setGameState: any;
}

const ROLES = [
  { id: 'werewolf', name: 'Werewolf', icon: Swords, color: '#e74c3c', min: 1, max: 4 },
  { id: 'seer', name: 'Seer', icon: Eye, color: '#3498db', min: 1, max: 1 },
  { id: 'bodyguard', name: 'Bodyguard', icon: Shield, color: '#27ae60', min: 0, max: 1 },
  { id: 'medium', name: 'Medium', icon: Ghost, color: '#9b59b6', min: 0, max: 1 },
  { id: 'villager', name: 'Villager', icon: User, color: '#f39c12', min: 4, max: 12 },
];

export default function GameRoomScreen({ discord, onNavigate, gameState, setGameState }: GameRoomScreenProps) {
  const user = discord.user;
  const players = gameState.players || [];
  const [roleConfig, setRoleConfig] = useState({
    werewolf: 2,
    seer: 1,
    bodyguard: 1,
    medium: 0,
    villager: 6,
  });
  const [isHost] = useState(true);

  const toggleRole = (roleId: string, delta: number) => {
    const role = ROLES.find(r => r.id === roleId);
    if (!role) return;
    const newCount = (roleConfig[roleId as keyof typeof roleConfig] || 0) + delta;
    if (newCount < role.min || newCount > role.max) return;
    setRoleConfig({ ...roleConfig, [roleId]: newCount });
  };

  const totalPlayers = Object.values(roleConfig).reduce((a, b) => a + b, 0);

  const startGame = () => {
    onNavigate('game');
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col p-4 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <motion.button
          className="wv-btn-ghost p-2 rounded-full"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('lobby')}
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div>
          <h1 className="text-xl font-wv-display text-wv-text">Custom Room</h1>
          <p className="text-sm text-wv-text-dim">Room Code: WER-2847</p>
        </div>
        <div className="ml-auto">
          <motion.button
            className="wv-btn-secondary px-4 py-2 text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Copy Code
          </motion.button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Players List */}
        <div className="lg:w-1/3">
          <div className="wv-card h-full">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-wv-primary" />
              <h2 className="font-bold text-wv-text">Players ({players.length}/{totalPlayers})</h2>
            </div>
            
            <div className="wv-scrollbar flex-1 overflow-y-auto max-h-[400px] space-y-3">
              {players.map((player: any, i: number) => (
                <motion.div
                  key={player.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-wv-bg-panel/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="wv-avatar w-10 h-10">
                    <img 
                      src={player.avatar || getAvatarUrl(player.id, '')} 
                      alt={player.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                    {player.isReady && (
                      <motion.div 
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-wv-success rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-wv-text truncate">
                      {player.name}
                      {player.id === user?.id && <span className="text-wv-text-dim ml-1">(You)</span>}
                    </p>
                    <p className="text-xs text-wv-text-dim">
                      {player.isHost ? 'Host' : 'Player'}
                    </p>
                  </div>
                  {player.isHost && (
                    <Crown className="w-5 h-5 text-wv-gold" />
                  )}
                </motion.div>
              ))}
              
              {/* Empty slots */}
              {[...Array(Math.max(0, totalPlayers - players.length))].map((_, i) => (
                <motion.div
                  key={`empty-${i}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-wv-bg-deep/30 border-2 border-dashed border-wv-primary/20"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="wv-avatar w-10 h-10 bg-wv-bg-card">
                    <Users className="w-5 h-5 text-wv-text-muted m-auto" />
                  </div>
                  <p className="text-wv-text-muted italic">Waiting for player...</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Role Configuration (Host only) */}
        {isHost && (
          <div className="lg:w-2/3">
            <div className="wv-card">
              <div className="flex items-center gap-2 mb-4">
                <Swords className="w-5 h-5 text-wv-accent" />
                <h2 className="font-bold text-wv-text">Role Configuration</h2>
                <span className="ml-auto wv-badge-primary">{totalPlayers} Players</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ROLES.map((role) => {
                  const count = roleConfig[role.id as keyof typeof roleConfig] || 0;
                  const Icon = role.icon;
                  
                  return (
                    <motion.div
                      key={role.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-wv-bg-panel/50 border border-wv-primary/20"
                      whileHover={{ borderColor: role.color }}
                    >
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${role.color}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: role.color }} />
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-bold text-wv-text">{role.name}</p>
                        <p className="text-xs text-wv-text-dim">
                          Min: {role.min} / Max: {role.max}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <motion.button
                          className="wv-btn-ghost p-2 rounded-full disabled:opacity-50"
                          disabled={count <= role.min}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleRole(role.id, -1)}
                        >
                          <Minus className="w-5 h-5" />
                        </motion.button>
                        
                        <motion.span 
                          className="w-10 h-10 rounded-full bg-wv-primary/20 flex items-center justify-center font-bold text-wv-text text-lg"
                          key={count}
                          initial={{ scale: 1.3 }}
                          animate={{ scale: 1 }}
                        >
                          {count}
                        </motion.span>
                        
                        <motion.button
                          className="wv-btn-ghost p-2 rounded-full disabled:opacity-50"
                          disabled={count >= role.max}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleRole(role.id, 1)}
                        >
                          <Plus className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Start Game Button */}
      <motion.div 
        className="fixed bottom-20 left-4 right-4 lg:bottom-4"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          className="wv-btn-accent w-full py-4 text-lg font-bold"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={startGame}
          disabled={players.length < 4}
        >
          <Play className="w-6 h-6" />
          <span>Start Game ({players.length}/{totalPlayers})</span>
          <Zap className="w-5 h-5 ml-auto" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}