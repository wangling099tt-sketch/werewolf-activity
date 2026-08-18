import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiscordSdk } from './hooks/useDiscordSdk';
import { useSocket, useSocketEvent } from './hooks/useSocket';
import { ToastProvider, useToast } from './components/Toast';
import { MuteButton } from './hooks/useSettings';
import { sound } from './utils/sound';
import LobbyScreen from './screens/LobbyScreen';
import GameRoomScreen from './screens/GameRoomScreen';
import GameplayScreen from './screens/GameplayScreen';

export type Screen = 'loading' | 'lobby' | 'room' | 'game';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  alive: boolean;
  isHost: boolean;
  connected?: boolean;
  hasVoted?: boolean | null;
  voteCount?: number | null;
}

export interface PublicState {
  roomId: string;
  phase: string;
  dayNumber: number;
  players: Player[];
  log: string[];
  votes: Record<string, string> | null;
  winner: string | null;
  timeRemaining: number | null;
  roleDeck?: any;
}

export interface PrivateState {
  myRole: string;
  myTeam: string;
  teammates: { id: string; name: string }[];
}

export default function App() {
  return (
    <ToastProvider>
      <GameApp />
    </ToastProvider>
  );
}

function GameApp() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [roomId, setRoomId] = useState<string>('');
  const [publicState, setPublicState] = useState<PublicState | null>(null);
  const [privateState, setPrivateState] = useState<PrivateState | null>(null);
  const [inspectResult, setInspectResult] = useState<any>(null);
  const { showToast } = useToast();
  
  const discord = useDiscordSdk();
  const { socket, connected } = useSocket();

  // Auto-login on Discord auth
  useEffect(() => {
    if (discord.status === 'authenticated' && socket && connected && discord.user) {
      socket.emit('auth:login', {
        name: discord.user.globalName || discord.user.username,
        id: discord.user.id,
        avatar: discord.user.avatar,
      });
      setScreen('lobby');
    }
  }, [discord.status, socket, connected]);

  // Sound effects on phase changes
  useEffect(() => {
    if (!publicState?.phase) return;
    const phase = publicState.phase;
    sound.play(
      phase === 'NIGHT' || phase === 'NIGHT_RESULTS' ? 'night' :
      phase === 'DAY_DISCUSS' ? 'day' :
      phase === 'DAY_VOTE' ? 'vote' :
      phase === 'ENDED' ? (publicState.winner === 'town' ? 'win' : 'lose') :
      'click'
    );
  }, [publicState?.phase, publicState?.winner]);

  // Listen for game state updates
  useSocketEvent(socket, 'game:state', (state: PublicState) => {
    setPublicState(state);
    if (state.phase !== 'LOBBY' && screen !== 'game') {
      setScreen('game');
      sound.play('reveal');
    } else if (state.phase === 'LOBBY' && screen === 'game') {
      setScreen('room');
    }
  });

  useSocketEvent(socket, 'lobby:update', (state: PublicState) => {
    setPublicState(state);
  });

  useSocketEvent(socket, 'role:private', (state: PrivateState) => {
    setPrivateState(state);
    if (state.myRole === 'werewolf') sound.play('reveal');
  });

  useSocketEvent(socket, 'private:inspect', (result: any) => {
    setInspectResult(result);
    sound.play('reveal');
    setTimeout(() => setInspectResult(null), 5000);
  });

  const navigateTo = (s: Screen) => setScreen(s);

  const createRoom = () => {
    if (!socket || !discord.user) return;
    sound.play('click');
    socket.emit('lobby:create', {
      name: discord.user.globalName || discord.user.username,
      id: discord.user.id,
      avatar: discord.user.avatar,
    }, (response: any) => {
      if (response?.ok) {
        setRoomId(response.roomId);
        setScreen('room');
        showToast('success', `Room ${response.roomId} created!`);
      } else {
        showToast('error', response?.error || 'Failed to create room');
      }
    });
  };

  const joinRoom = (rid: string) => {
    if (!socket || !discord.user) return;
    sound.play('click');
    socket.emit('lobby:join', {
      roomId: rid,
      name: discord.user.globalName || discord.user.username,
      id: discord.user.id,
      avatar: discord.user.avatar,
    }, (response: any) => {
      if (response?.ok) {
        setRoomId(response.roomId);
        setScreen('room');
        showToast('success', `Joined room ${response.roomId}!`);
      } else {
        showToast('error', response?.error || 'Failed to join room');
        sound.play('click');
      }
    });
  };

  const leaveRoom = () => {
    if (socket) socket.emit('lobby:leave');
    sound.play('click');
    setScreen('lobby');
    setPublicState(null);
    setPrivateState(null);
  };

  return (
    <div className="min-h-screen bg-wv-bg overflow-hidden">
      <BackgroundParticles />
      <MuteButton />
      
      <AnimatePresence mode="wait">
        {screen === 'loading' && (
          <LoadingScreen key="loading" discord={discord} />
        )}
        {screen === 'lobby' && (
          <LobbyScreen 
            key="lobby" 
            discord={discord} 
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            connected={connected}
          />
        )}
        {screen === 'room' && (
          <GameRoomScreen 
            key="room" 
            discord={discord} 
            roomId={roomId}
            publicState={publicState}
            onNavigate={navigateTo}
            onLeave={leaveRoom}
            socket={socket}
          />
        )}
        {screen === 'game' && (
          <GameplayScreen 
            key="game" 
            discord={discord} 
            publicState={publicState}
            privateState={privateState}
            inspectResult={inspectResult}
            socket={socket}
            onLeave={leaveRoom}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BackgroundParticles() {
  return (
    <div className="wv-particles">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="wv-star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

function LoadingScreen({ discord }: { discord: ReturnType<typeof useDiscordSdk> }) {
  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-wv-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-32 h-32 mb-8"
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{ 
          rotate: { duration: 10, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-wv-primary to-wv-accent rounded-full opacity-20 blur-xl" />
        <div className="absolute inset-4 bg-wv-bg-card rounded-full flex items-center justify-center border-4 border-wv-primary/50">
          <span className="text-5xl">🐺</span>
        </div>
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3"
            style={{ 
              top: '50%', 
              left: '50%',
              transformOrigin: '0 64px',
              transform: `rotate(${deg}deg) translateX(64px)`,
            }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25 }}
          >
            <span className="text-sm">⭐</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.h1 
        className="text-4xl font-wv-display text-wv-text mb-2 text-gradient-wv"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        WOLVESVILLE
      </motion.h1>

      <motion.p 
        className="text-wv-text-dim mb-8"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {discord.status === 'loading' ? '🐺 Connecting to Discord...' : 
         discord.status === 'error' ? '⚠️ Connection failed. Retrying...' :
         '✅ Authenticated!'}
      </motion.p>

      <div className="w-64 h-2 bg-wv-bg-deep rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-wv-primary to-wv-accent"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
}