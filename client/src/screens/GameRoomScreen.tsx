import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Crown, Play, Plus, Minus, 
  Eye, Shield, Swords, User, Ghost, Zap, Check, Bot, Copy
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAvatarUrl } from '../hooks/useDiscordSdk';
import type { Socket } from 'socket.io-client';

interface GameRoomScreenProps {
  discord: { user: any; status: string };
  roomId: string;
  publicState: any;
  onNavigate: (screen: 'lobby' | 'room' | 'game') => void;
  onLeave: () => void;
  socket: Socket | null;
}

const ROLES = [
  { id: 'werewolf', name: 'Werewolf', icon: Swords, color: '#e74c3c', min: 1, max: 4 },
  { id: 'seer', name: 'Seer', icon: Eye, color: '#3498db', min: 0, max: 2 },
  { id: 'bodyguard', name: 'Bodyguard', icon: Shield, color: '#27ae60', min: 0, max: 2 },
  { id: 'medium', name: 'Medium', icon: Ghost, color: '#9b59b6', min: 0, max: 1 },
  { id: 'fool', name: 'Fool', icon: User, color: '#e67e22', min: 0, max: 1 },
  { id: 'villager', name: 'Villager', icon: User, color: '#f39c12', min: 0, max: 12 },
];

export default function GameRoomScreen({ discord, roomId, publicState, onNavigate, onLeave, socket }: GameRoomScreenProps) {
  const user = discord.user;
  const players = publicState?.players || [];
  const isHost = publicState?.players?.find((p: any) => p.id === user?.id)?.isHost;
  const [roleConfig, setRoleConfig] = useState<any>(publicState?.roleDeck || {
    werewolf: 2, seer: 1, bodyguard: 1, medium: 0, fool: 0, villager: 4,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (publicState?.roleDeck) {
      setRoleConfig(publicState.roleDeck);
    }
  }, [publicState?.roleDeck]);

  const toggleRole = (roleId: string, delta: number) => {
    const role = ROLES.find(r => r.id === roleId);
    if (!role) return;
    const newCount = (roleConfig[roleId] || 0) + delta;
    if (newCount < role.min || newCount > role.max) return;
    const newConfig = { ...roleConfig, [roleId]: newCount };
    setRoleConfig(newConfig);
    socket?.emit('lobby:setRoleDeck', { deck: newConfig });
  };

  const totalRoles = Object.values(roleConfig).reduce((a: number, b: any) => a + (b || 0), 0);
  const canStart = players.length >= 4 && players.length === totalRoles;

  const addBot = () => {
    socket?.emit('lobby:addBot');
  };

  const startGame = () => {
    if (socket) socket.emit('game:start', { customRoles: roleConfig });
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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
          onClick={onLeave}
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>
        <div>
          <h1 className="text-xl font-wv-display text-wv-text">Custom Room</h1>
          <p className="text-sm text-wv-text-dim">Room Code: {roomId}</p>
        </div>
        <div className="ml-auto">
          <motion.button
            className="wv-btn-secondary px-4 py-2 text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyCode}
          >
            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
          </motion.button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Players List */}
        <div className="lg:w-1/3">
          <div className="wv-card h-full">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-wv-primary" />
              <h2 className="font-bold text-wv-text">Players ({players.length}/{totalRoles || '?'})</h2>
              {isHost && (
                <motion.button
                  className="ml-auto wv-btn-ghost p-2 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={addBot}
                  title="Add Bot"
                >
                  <Bot className="w-5 h-5 text-wv-accent-cyan" />
                </motion.button>
              )}
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
                    {player.connected !== false && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-wv-success rounded-full border-2 border-wv-bg-card" />
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
              
              {totalRoles > players.length && [...Array(totalRoles - players.length)].map((_, i) => (
                <motion.div
                  key={`empty-${i}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-wv-bg-deep/30 border-2 border-dashed border-wv-primary/20"
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-10 h-10 rounded-full bg-wv-bg-card flex items-center justify-center">
                    <Users className="w-5 h-5 text-wv-text-muted" />
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
                <span className="ml-auto wv-badge-primary">{totalRoles} Players</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ROLES.map((role) => {
                  const count = roleConfig[role.id] || 0;
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
                          className="wv-btn-ghost p-2 rounded-full disabled:opacity-30"
                          disabled={count <= role.min}
                          whileHover={count > role.min ? { scale: 1.1 } : {}}
                          whileTap={count > role.min ? { scale: 0.9 } : {}}
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
                          className="wv-btn-ghost p-2 rounded-full disabled:opacity-30"
                          disabled={count >= role.max}
                          whileHover={count < role.max ? { scale: 1.1 } : {}}
                          whileTap={count < role.max ? { scale: 0.9 } : {}}
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

        {/* Non-host waiting message */}
        {!isHost && (
          <div className="lg:w-2/3 flex items-center justify-center">
            <motion.div
              className="wv-card text-center p-12"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-wv-display text-wv-text mb-2">Waiting for host...</h2>
              <p className="text-wv-text-dim">The host is configuring the game</p>
            </motion.div>
          </div>
        )}
      </div>

      {/* Start Game Button */}
      {isHost && (
        <motion.div 
          className="fixed bottom-4 left-4 right-4 lg:bottom-4"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            className="wv-btn-accent w-full py-4 text-lg font-bold disabled:opacity-50"
            whileHover={canStart ? { scale: 1.02, y: -2 } : {}}
            whileTap={canStart ? { scale: 0.98 } : {}}
            onClick={startGame}
            disabled={!canStart}
          >
            <Play className="w-6 h-6" />
            <span>
              {canStart 
                ? `Start Game (${players.length}/${totalRoles})` 
                : `Need ${Math.max(0, 4 - players.length)} more players`}
            </span>
            <Zap className="w-5 h-5 ml-auto" />
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}