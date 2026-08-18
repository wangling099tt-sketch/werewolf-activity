import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Swords, Eye, Shield, Users, MessageCircle,
  Ghost, Clock, Check, X, Heart, Zap, Crown, Skull, ArrowLeft, Send
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getAvatarUrl } from '../hooks/useDiscordSdk';
import type { Socket } from 'socket.io-client';

interface GameplayScreenProps {
  discord: { user: any; status: string };
  publicState: any;
  privateState: any;
  inspectResult: any;
  socket: Socket | null;
  onLeave: () => void;
}

const PHASE_INFO: Record<string, { label: string; icon: any; bg: string; duration: number }> = {
  ROLE_REVEAL: { label: 'Role Reveal', icon: Crown, bg: 'night', duration: 5 },
  NIGHT: { label: 'Night Phase', icon: Moon, bg: 'night', duration: 25 },
  NIGHT_RESULTS: { label: 'Night Results', icon: Moon, bg: 'night', duration: 3 },
  DAY_DISCUSS: { label: 'Day Discussion', icon: Sun, bg: 'day', duration: 45 },
  DAY_VOTE: { label: 'Voting', icon: Users, bg: 'day', duration: 30 },
  VOTE_RESULTS: { label: 'Vote Results', icon: Users, bg: 'day', duration: 3 },
  ENDED: { label: 'Game Over', icon: Skull, bg: 'night', duration: 0 },
};

const ROLE_INFO: Record<string, { name: string; color: string; team: string; icon: any; emoji: string }> = {
  werewolf: { name: 'Werewolf', color: '#e74c3c', team: 'wolf', icon: Swords, emoji: '🐺' },
  seer: { name: 'Seer', color: '#3498db', team: 'town', icon: Eye, emoji: '🔮' },
  bodyguard: { name: 'Bodyguard', color: '#27ae60', team: 'town', icon: Shield, emoji: '🛡️' },
  medium: { name: 'Medium', color: '#9b59b6', team: 'town', icon: Ghost, emoji: '👻' },
  villager: { name: 'Villager', color: '#f39c12', team: 'town', icon: Users, emoji: '🏘️' },
  fool: { name: 'Fool', color: '#e67e22', team: 'town', icon: Users, emoji: '🤡' },
};

export default function GameplayScreen({ discord, publicState, privateState, inspectResult, socket, onLeave }: GameplayScreenProps) {
  const user = discord.user;
  const phase = publicState?.phase || 'ROLE_REVEAL';
  const phaseInfo = PHASE_INFO[phase] || PHASE_INFO.NIGHT;
  const [timeLeft, setTimeLeft] = useState(phaseInfo.duration);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [showRoleReveal, setShowRoleReveal] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Timer countdown
  useEffect(() => {
    setTimeLeft(phaseInfo.duration);
    if (phase === 'ROLE_REVEAL') {
      setShowRoleReveal(true);
    }
  }, [phase]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [publicState?.log]);

  const players = publicState?.players || [];
  const alivePlayers = players.filter((p: any) => p.alive);
  const myPlayer = players.find((p: any) => p.id === user?.id);
  const myRole = privateState?.myRole || 'villager';
  const roleInfo = ROLE_INFO[myRole] || ROLE_INFO.villager;

  const submitNightAction = () => {
    if (!selectedTarget || !socket) return;
    socket.emit('action:night', { 
      targetId: selectedTarget, 
      ability: myRole === 'werewolf' ? 'kill' : myRole === 'seer' ? 'inspect' : 'protect' 
    });
    setSelectedTarget(null);
  };

  const submitVote = () => {
    if (!selectedTarget || !socket) return;
    socket.emit('action:vote', { targetId: selectedTarget });
    setSelectedTarget(null);
  };

  const sendChat = () => {
    if (!chatInput.trim() || !socket) return;
    socket.emit('chat:send', { text: chatInput.trim() });
    setChatInput('');
  };

  const canActNight = ['werewolf', 'seer', 'bodyguard'].includes(myRole);
  const isDay = phaseInfo.bg === 'day';

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <PhaseBackground phase={phase} />

      {/* Header */}
      <motion.header 
        className="relative z-10 p-4 flex items-center justify-between"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center gap-3">
          <motion.button
            className="wv-btn-ghost p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onLeave}
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <div>
            <h1 className="font-wv-display text-wv-text text-lg">{phaseInfo.label}</h1>
            <p className="text-xs text-wv-text-dim">Day {publicState?.dayNumber || 1}</p>
          </div>
        </div>

        {/* Timer */}
        <div className="wv-card px-4 py-2 flex items-center gap-2">
          <Clock className="w-5 h-5 text-wv-gold" />
          <span className="font-mono text-xl font-bold text-wv-text">{timeLeft}s</span>
        </div>
      </motion.header>

      {/* Role Reveal Modal */}
      <AnimatePresence>
        {showRoleReveal && privateState?.myRole && (
          <RoleRevealModal 
            role={myRole} 
            roleInfo={roleInfo}
            teammates={privateState.teammates || []}
            onClose={() => setShowRoleReveal(false)}
          />
        )}
      </AnimatePresence>

      {/* Inspect Result Modal */}
      <AnimatePresence>
        {inspectResult && (
          <InspectModal result={inspectResult} />
        )}
      </AnimatePresence>

      {/* Phase Content */}
      <AnimatePresence mode="wait">
        {phase === 'NIGHT' && (
          <NightPhase 
            key="night"
            players={alivePlayers}
            myRole={myRole}
            roleInfo={roleInfo}
            selectedTarget={selectedTarget}
            onSelectTarget={setSelectedTarget}
            onSubmit={submitNightAction}
            canAct={canActNight && myPlayer?.alive}
            userId={user?.id}
          />
        )}

        {(phase === 'DAY_DISCUSS' || phase === 'NIGHT_RESULTS' || phase === 'VOTE_RESULTS') && (
          <DayPhase 
            key="day"
            players={alivePlayers}
            publicState={publicState}
            discord={discord}
            userId={user?.id}
          />
        )}

        {phase === 'DAY_VOTE' && (
          <VotePhase 
            key="vote"
            players={alivePlayers}
            selectedTarget={selectedTarget}
            onSelectTarget={setSelectedTarget}
            onSubmitVote={submitVote}
            votes={publicState?.votes}
            userId={user?.id}
          />
        )}

        {phase === 'ENDED' && (
          <EndGamePhase 
            key="ended"
            winner={publicState?.winner}
            log={publicState?.log || []}
            onReturn={onLeave}
          />
        )}
      </AnimatePresence>

      {/* Chat (always visible during day/vote) */}
      {(phase === 'DAY_DISCUSS' || phase === 'DAY_VOTE') && (
        <motion.div 
          className="fixed bottom-0 left-0 right-0 bg-wv-bg-panel/90 backdrop-blur-lg border-t border-white/10 p-4 z-20"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
        >
          <div className="max-w-2xl mx-auto">
            <div 
              ref={chatRef}
              className="wv-scrollbar max-h-32 overflow-y-auto mb-2 space-y-1"
            >
              {publicState?.log?.slice(-10).map((line: string, i: number) => (
                <div key={i} className="text-sm text-wv-text-dim">
                  {line}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Say something..."
                className="wv-input flex-1"
              />
              <motion.button
                className="wv-btn-primary px-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendChat}
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function PhaseBackground({ phase }: { phase: string }) {
  const isNight = ['NIGHT', 'NIGHT_RESULTS', 'ROLE_REVEAL', 'ENDED'].includes(phase);
  
  return (
    <motion.div 
      className="fixed inset-0 -z-10"
      animate={{
        background: isNight 
          ? 'linear-gradient(180deg, #0a0612 0%, #1a0a2e 50%, #2b174f 100%)'
          : 'linear-gradient(180deg, #87ceeb 0%, #a8e6cf 30%, #fd79a8 70%, #2b174f 100%)'
      }}
      transition={{ duration: 1.5 }}
    >
      {isNight && [...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white"
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 60}%` 
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ 
            duration: 1 + Math.random(), 
            repeat: Infinity,
            delay: Math.random() * 2 
          }}
        />
      ))}
      
      {isNight && (
        <motion.div 
          className="absolute top-8 right-8"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 2 }}
        >
          <div className="text-6xl">🌙</div>
        </motion.div>
      )}
      
      {!isNight && (
        <motion.div 
          className="absolute top-8 right-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <div className="text-6xl">☀️</div>
        </motion.div>
      )}
    </motion.div>
  );
}

function RoleRevealModal({ role, roleInfo, teammates, onClose }: any) {
  const Icon = roleInfo.icon;
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-wv-bg-deep/95 backdrop-blur-md p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ rotateY: 0, scale: 0.5 }}
        animate={{ rotateY: 360, scale: 1 }}
        transition={{ duration: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-wv-display text-wv-text mb-2">You are...</h2>
        
        <motion.div
          className="wv-card p-8 mb-4"
          animate={{ 
            boxShadow: [
              `0 0 0 4px ${roleInfo.color}`,
              `0 0 60px ${roleInfo.color}`,
              `0 0 0 4px ${roleInfo.color}`
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-7xl mb-4">{roleInfo.emoji}</div>
          <h3 className="text-3xl font-wv-display mb-2" style={{ color: roleInfo.color }}>
            {roleInfo.name}
          </h3>
          <p className="text-wv-text-dim capitalize">Team: {roleInfo.team}</p>
          
          {teammates.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-wv-text-dim mb-2">Your pack:</p>
              <div className="flex justify-center gap-2">
                {teammates.map((t: any) => (
                  <span key={t.id} className="wv-badge-accent">{t.name}</span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
        
        <button
          className="wv-btn-primary text-lg py-3 px-8"
          onClick={onClose}
        >
          Got it!
        </button>
      </motion.div>
    </motion.div>
  );
}

function InspectModal({ result }: { result: any }) {
  const roleInfo = ROLE_INFO[result.role] || ROLE_INFO.villager;
  
  return (
    <motion.div
      className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50"
      initial={{ opacity: 0, y: -50, scale: 0.5 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
    >
      <div className="wv-card text-center p-6">
        <div className="text-5xl mb-2">🔮</div>
        <p className="text-wv-text-dim text-sm mb-1">This player is a...</p>
        <h3 className="text-2xl font-wv-display" style={{ color: roleInfo.color }}>
          {roleInfo.emoji} {roleInfo.name}
        </h3>
        <p className="text-xs text-wv-text-dim mt-1 capitalize">Team: {roleInfo.team}</p>
      </div>
    </motion.div>
  );
}

function NightPhase({ players, myRole, roleInfo, selectedTarget, onSelectTarget, onSubmit, canAct, userId }: any) {
  if (!canAct) {
    return (
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <div className="text-8xl mb-4">😴</div>
        <p className="text-xl text-wv-text-dim">Sleep tight...</p>
        <p className="text-sm text-wv-text-muted mt-2">Waiting for special roles to act</p>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="flex-1 flex flex-col p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <p className="text-center text-wv-text-dim mb-4">
        {myRole === 'werewolf' && "🐺 Choose someone to eliminate..."}
        {myRole === 'seer' && "🔮 Choose someone to divine..."}
        {myRole === 'bodyguard' && "🛡️ Choose someone to protect..."}
      </p>
      
      <div className="wv-scrollbar flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {players.filter((p: any) => p.id !== userId).map((player: any) => (
            <motion.div
              key={player.id}
              className={`wv-vote-target text-center ${selectedTarget === player.id ? 'wv-vote-target-selected' : ''}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectTarget(player.id)}
            >
              <div className="wv-avatar w-16 h-16 mx-auto mb-2">
                <img 
                  src={player.avatar || getAvatarUrl(player.id, '')} 
                  alt={player.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <p className="text-sm font-bold text-wv-text truncate">{player.name}</p>
              {selectedTarget === player.id && (
                <motion.div 
                  className="absolute -top-2 -right-2 w-8 h-8 bg-wv-accent rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      
      <motion.button
        className="wv-btn-accent w-full py-4 mt-4 disabled:opacity-50"
        disabled={!selectedTarget}
        whileHover={selectedTarget ? { scale: 1.02 } : {}}
        whileTap={selectedTarget ? { scale: 0.98 } : {}}
        onClick={onSubmit}
      >
        {myRole === 'werewolf' ? '🐺 Attack' : myRole === 'seer' ? '🔮 Divine' : '🛡️ Protect'}
      </motion.button>
    </motion.div>
  );
}

function DayPhase({ players, publicState, discord, userId }: any) {
  return (
    <motion.div 
      className="flex-1 flex flex-col p-4 pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <p className="text-center text-wv-text mb-4 text-lg">
        {publicState?.phase === 'NIGHT_RESULTS' && '🌙 Night has ended...'}
        {publicState?.phase === 'VOTE_RESULTS' && '🗳️ The town has spoken...'}
        {publicState?.phase === 'DAY_DISCUSS' && '☀️ Discuss with the village!'}
      </p>
      
      <div className="wv-scrollbar flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {players.map((player: any) => {
            const isMe = player.id === userId;
            return (
              <motion.div
                key={player.id}
                className="wv-card text-center p-3"
                whileHover={{ y: -5 }}
              >
                <div className="wv-avatar w-14 h-14 mx-auto mb-2">
                  <img 
                    src={player.avatar || getAvatarUrl(player.id, '')} 
                    alt={player.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <p className="text-sm font-bold text-wv-text truncate">
                  {player.name} {isMe && '(You)'}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function VotePhase({ players, selectedTarget, onSelectTarget, onSubmitVote, votes, userId }: any) {
  const hasVoted = votes && votes[userId];
  
  return (
    <motion.div 
      className="flex-1 flex flex-col p-4 pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <p className="text-center text-wv-text mb-4 text-lg">🗳️ Vote to eliminate!</p>
      
      {hasVoted && (
        <motion.div
          className="text-center mb-4 text-wv-success"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          ✓ You voted! Waiting for others...
        </motion.div>
      )}
      
      <div className="wv-scrollbar flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {players.map((player: any) => {
            const isMe = player.id === userId;
            return (
              <motion.div
                key={player.id}
                className={`wv-vote-target text-center ${selectedTarget === player.id ? 'wv-vote-target-selected' : ''} ${isMe ? 'opacity-50' : ''}`}
                whileHover={!isMe && !hasVoted ? { scale: 1.05 } : {}}
                whileTap={!isMe && !hasVoted ? { scale: 0.95 } : {}}
                onClick={() => !isMe && !hasVoted && onSelectTarget(player.id)}
              >
                <div className="wv-avatar w-16 h-16 mx-auto mb-2">
                  <img 
                    src={player.avatar || getAvatarUrl(player.id, '')} 
                    alt={player.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <p className="text-sm font-bold text-wv-text truncate">
                  {player.name} {isMe && '(You)'}
                </p>
                
                {selectedTarget === player.id && (
                  <motion.div 
                    className="absolute -top-2 -right-2 w-8 h-8 bg-wv-accent rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Check className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {!hasVoted && (
        <motion.button
          className="wv-btn-accent w-full py-4 mt-4 disabled:opacity-50 bg-gradient-to-r from-red-600 to-red-500"
          disabled={!selectedTarget}
          whileHover={selectedTarget ? { scale: 1.02 } : {}}
          whileTap={selectedTarget ? { scale: 0.98 } : {}}
          onClick={onSubmitVote}
        >
          Vote to Eliminate
        </motion.button>
      )}
    </motion.div>
  );
}

function EndGamePhase({ winner, log, onReturn }: { winner: string; log: string[] }) {
  return (
    <motion.div 
      className="flex-1 flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-center"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="text-8xl mb-4">{winner === 'town' ? '🏘️' : '🐺'}</div>
        <h1 className="text-4xl font-wv-display text-wv-text mb-2">
          {winner === 'town' ? 'TOWN WINS!' : 'WEREWOLVES WIN!'}
        </h1>
        <p className="text-xl text-wv-text-dim mb-8">
          {winner === 'town' ? 'The village is safe!' : 'The wolves have taken over!'}
        </p>
      </motion.div>
      
      {/* Game log */}
      <div className="wv-card max-w-md w-full mb-6">
        <h3 className="font-bold text-wv-text mb-2">Game Log</h3>
        <div className="wv-scrollbar max-h-40 overflow-y-auto space-y-1 text-sm">
          {log.map((line, i) => (
            <div key={i} className="text-wv-text-dim">{line}</div>
          ))}
        </div>
      </div>
      
      <motion.button
        className="wv-btn-primary text-xl py-4 px-12"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReturn}
      >
        Return to Lobby
      </motion.button>
    </motion.div>
  );
}