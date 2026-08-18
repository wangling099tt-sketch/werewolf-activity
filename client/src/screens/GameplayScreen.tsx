import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, Sun, Swords, Eye, Shield, Users, MessageCircle,
  Ghost, Clock, Check, X, Heart, Zap, Crown, Skull
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAvatarUrl } from '../hooks/useDiscordSdk';

interface GameplayScreenProps {
  discord: { user: any; status: string };
  onNavigate: (screen: 'lobby' | 'room' | 'game') => void;
  gameState: any;
  setGameState: any;
}

const PHASES = ['role_reveal', 'night', 'day', 'vote', 'ended'] as const;
const PHASE_LABELS = {
  role_reveal: 'Role Reveal',
  night: 'Night Phase',
  day: 'Day Discussion',
  vote: 'Voting',
  ended: 'Game Over'
};

const ROLES = {
  werewolf: { name: 'Werewolf', color: '#e74c3c', team: 'wolf', icon: Swords },
  seer: { name: 'Seer', color: '#3498db', team: 'town', icon: Eye },
  bodyguard: { name: 'Bodyguard', color: '#27ae60', team: 'town', icon: Shield },
  villager: { name: 'Villager', color: '#f39c12', team: 'town', icon: Users },
};

export default function GameplayScreen({ discord, onNavigate, gameState, setGameState }: GameplayScreenProps) {
  const [phase, setPhase] = useState<'role_reveal' | 'night' | 'day' | 'vote' | 'ended'>('role_reveal');
  const [dayNumber, setDayNumber] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [myRole, setMyRole] = useState<string>('villager');
  const [roleRevealed, setRoleRevealed] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'System', text: 'Welcome to Day 1! Discuss and vote to eliminate suspects.', time: '00:00' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Timer effect
  useEffect(() => {
    if (phase === 'ended') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          advancePhase();
          return phase === 'night' ? 30 : phase === 'day' ? 60 : 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, dayNumber]);

  const advancePhase = () => {
    const currentIndex = PHASES.indexOf(phase);
    if (currentIndex < PHASES.length - 1) {
      const nextPhase = PHASES[currentIndex + 1];
      setPhase(nextPhase);
      if (nextPhase === 'day') setDayNumber(d => d + 1);
      if (nextPhase === 'night') setTimeLeft(30);
      if (nextPhase === 'day') setTimeLeft(60);
      if (nextPhase === 'vote') setTimeLeft(30);
    }
  };

  const revealRole = () => {
    const roles = Object.keys(ROLES);
    setMyRole(roles[Math.floor(Math.random() * roles.length)]);
    setRoleRevealed(true);
  };

  const submitNightAction = () => {
    if (selectedTarget) {
      // Send action to server
      setSelectedTarget(null);
      advancePhase();
    }
  };

  const submitVote = () => {
    if (selectedTarget) {
      setVotes({ ...votes, [discord.user?.id || '1']: selectedTarget });
      advancePhase();
    }
  };

  const sendChat = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, {
        id: Date.now(),
        user: discord.user?.globalName || 'You',
        text: chatInput,
        time: `${Math.floor((60 - timeLeft) / 60)}:${(60 - timeLeft) % 60}`.replace(/^0/, '')
      }]);
      setChatInput('');
    }
  };

  const players = gameState.players || [];

  return (
    <motion.div 
      className="min-h-screen flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Dynamic Background */}
      <PhaseBackground phase={phase} dayNumber={dayNumber} />

      {/* Header */}
      <motion.header 
        className="relative z-10 p-4 flex items-center justify-between"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center gap-3">
          <PhaseIcon phase={phase} />
          <div>
            <h1 className="font-wv-display text-wv-text">
              {PHASE_LABELS[phase]}
            </h1>
            <p className="text-sm text-wv-text-dim">Day {dayNumber}</p>
          </div>
        </div>

        {/* Timer */}
        <div className="wv-card px-4 py-2 flex items-center gap-2">
          <Clock className="w-5 h-5 text-wv-gold" />
          <span className="font-mono text-xl font-bold text-wv-text">{timeLeft}s</span>
        </div>
      </motion.header>

      {/* Phase Content */}
      <AnimatePresence mode="wait">
        {phase === 'role_reveal' && (
          <RoleRevealPhase 
            key="role-reveal"
            myRole={myRole}
            roleRevealed={roleRevealed}
            onReveal={revealRole}
            onContinue={advancePhase}
          />
        )}

        {phase === 'night' && (
          <NightPhase 
            key="night"
            players={players}
            myRole={myRole}
            selectedTarget={selectedTarget}
            onSelectTarget={setSelectedTarget}
            onSubmit={submitNightAction}
            discord={discord}
          />
        )}

        {phase === 'day' && (
          <DayPhase 
            key="day"
            players={players}
            discord={discord}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSendChat={sendChat}
          />
        )}

        {phase === 'vote' && (
          <VotePhase 
            key="vote"
            players={players}
            selectedTarget={selectedTarget}
            onSelectTarget={setSelectedTarget}
            onSubmitVote={submitVote}
            votes={votes}
            discord={discord}
          />
        )}

        {phase === 'ended' && (
          <EndGamePhase 
            key="ended"
            winner="town"
            onReturn={() => onNavigate('lobby')}
          />
        )}
      </AnimatePresence>

      {/* Bottom Chat (always visible during day) */}
      <AnimatePresence>
        {phase === 'day' && (
          <motion.div 
            className="fixed bottom-0 left-0 right-0 bg-wv-bg-panel/90 backdrop-blur-lg border-t border-white/10 p-4 z-20"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
          >
            <div className="max-w-2xl mx-auto">
              <div className="wv-scrollbar max-h-32 overflow-y-auto mb-2 space-y-2">
                {chatMessages.map(msg => (
                  <div key={msg.id} className="text-sm">
                    <span className="font-bold text-wv-primary">{msg.user}: </span>
                    <span className="text-wv-text">{msg.text}</span>
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
                  <MessageCircle className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PhaseBackground({ phase, dayNumber }: { phase: string; dayNumber: number }) {
  const isNight = phase === 'night' || phase === 'role_reveal';
  
  return (
    <motion.div 
      className="fixed inset-0 -z-10"
      animate={{
        background: isNight 
          ? ['linear-gradient(180deg, #0a0612 0%, #1a0a2e 50%, #2b174f 100%)']
          : ['linear-gradient(180deg, #87ceeb 0%, #a8e6cf 30%, #fd79a8 70%, #2b174f 100%)']
      }}
      transition={{ duration: 2 }}
    >
      {/* Stars for night */}
      {isNight && [...Array(30)].map((_, i) => (
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
      
      {/* Moon for night */}
      {isNight && (
        <motion.div 
          className="absolute top-8 right-8 w-20 h-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 1 }}
        >
          <Moon className="w-full h-full text-wv-gold opacity-80" />
        </motion.div>
      )}
    </motion.div>
  );
}

function PhaseIcon({ phase }: { phase: string }) {
  const icons = {
    role_reveal: Crown,
    night: Moon,
    day: Sun,
    vote: Users,
    ended: Skull
  };
  const Icon = icons[phase as keyof typeof icons] || Moon;
  
  return (
    <motion.div 
      className="wv-card p-3"
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Icon className="w-6 h-6 text-wv-primary" />
    </motion.div>
  );
}

function RoleRevealPhase({ myRole, roleRevealed, onReveal, onContinue }: any) {
  const role = ROLES[myRole as keyof typeof ROLES] || ROLES.villager;
  const Icon = role.icon;
  
  return (
    <motion.div 
      className="flex-1 flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <motion.h2 
        className="text-2xl font-wv-display text-wv-text mb-8"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        Your Role
      </motion.h2>
      
      {!roleRevealed ? (
        <motion.button
          className="wv-btn-primary text-xl py-6 px-12"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReveal}
        >
          Tap to Reveal Your Role
        </motion.button>
      ) : (
        <motion.div
          className="wv-card p-8 text-center"
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 360 }}
          transition={{ duration: 1 }}
        >
          <motion.div 
            className="w-32 h-40 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${role.color}20` }}
            animate={{ boxShadow: [`0 0 0 4px ${role.color}`, `0 0 40px ${role.color}`] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Icon className="w-20 h-20" style={{ color: role.color }} />
          </motion.div>
          <h3 className="text-3xl font-wv-display mb-2" style={{ color: role.color }}>
            {role.name}
          </h3>
          <p className="text-wv-text-dim capitalize">Team: {role.team}</p>
          
          <motion.button
            className="wv-btn-primary mt-8"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
          >
            Ready for Night
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}

function NightPhase({ players, myRole, selectedTarget, onSelectTarget, onSubmit, discord }: any) {
  const canAct = myRole === 'werewolf' || myRole === 'seer' || myRole === 'bodyguard';
  
  return (
    <motion.div 
      className="flex-1 flex flex-col p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {canAct ? (
        <>
          <p className="text-center text-wv-text-dim mb-4">
            {myRole === 'werewolf' && "Choose someone to eliminate tonight..."}
            {myRole === 'seer' && "Choose someone to divine their role..."}
            {myRole === 'bodyguard' && "Choose someone to protect..."}
          </p>
          
          <div className="wv-scrollbar flex-1 overflow-y-auto">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {players.map((player: any) => (
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
            className="wv-btn-accent w-full py-4 mt-4"
            disabled={!selectedTarget}
            whileHover={selectedTarget ? { scale: 1.02 } : {}}
            whileTap={selectedTarget ? { scale: 0.98 } : {}}
            onClick={onSubmit}
          >
            {myRole === 'werewolf' ? 'Kill' : myRole === 'seer' ? 'Divine' : 'Protect'}
          </motion.button>
        </>
      ) : (
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Moon className="w-24 h-24 text-wv-primary mb-4" />
          <p className="text-xl text-wv-text-dim">Sleep tight...</p>
          <p className="text-sm text-wv-text-muted mt-2">Waiting for Werewolves to act</p>
        </motion.div>
      )}
    </motion.div>
  );
}

function DayPhase({ players, discord, chatMessages, chatInput, setChatInput, onSendChat }: any) {
  return (
    <motion.div 
      className="flex-1 flex flex-col p-4 pb-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <p className="text-center text-wv-text mb-4">☀️ Daylight! Discuss and find the Werewolves!</p>
      
      <div className="wv-scrollbar flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {players.map((player: any) => (
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
              <p className="text-sm font-bold text-wv-text truncate">{player.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function VotePhase({ players, selectedTarget, onSelectTarget, onSubmitVote, votes, discord }: any) {
  return (
    <motion.div 
      className="flex-1 flex flex-col p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <p className="text-center text-wv-text mb-4">🗳️ Vote to eliminate a player!</p>
      
      <div className="wv-scrollbar flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {players.map((player: any) => {
            const hasVoted = Object.values(votes).includes(player.id);
            return (
              <motion.div
                key={player.id}
                className={`wv-vote-target text-center relative ${selectedTarget === player.id ? 'wv-vote-target-selected' : ''}`}
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
                
                {hasVoted && (
                  <motion.div 
                    className="absolute -top-2 -right-2 w-6 h-6 bg-wv-gold rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Check className="w-4 h-4 text-wv-bg" />
                  </motion.div>
                )}
                
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
      
      <motion.button
        className="wv-btn-danger w-full py-4 mt-4 bg-gradient-to-r from-red-600 to-red-500"
        disabled={!selectedTarget}
        whileHover={selectedTarget ? { scale: 1.02 } : {}}
        whileTap={selectedTarget ? { scale: 0.98 } : {}}
        onClick={onSubmitVote}
      >
        Vote to Eliminate
      </motion.button>
    </motion.div>
  );
}

function EndGamePhase({ winner, onReturn }: { winner: string; onReturn: () => void }) {
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
        <Trophy className="w-32 h-32 mx-auto mb-4 text-wv-gold" />
        <h1 className="text-4xl font-wv-display text-wv-text mb-2">
          {winner === 'town' ? 'TOWN WINS!' : 'WEREWOLVES WIN!'}
        </h1>
        <p className="text-xl text-wv-text-dim mb-8">
          {winner === 'town' ? 'The village is safe!' : 'The wolves have taken over!'}
        </p>
      </motion.div>
      
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