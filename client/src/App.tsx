import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Users, Swords, Crown, Play, Settings, User, MessageCircle, Star, Zap, Shield, Eye, Ghost } from 'lucide-react';
import { useDiscordSdk } from './hooks/useDiscordSdk';
import LobbyScreen from './screens/LobbyScreen';
import GameRoomScreen from './screens/GameRoomScreen';
import GameplayScreen from './screens/GameplayScreen';

export type Screen = 'loading' | 'lobby' | 'room' | 'game';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isHost: boolean;
  role?: string;
  isDead?: boolean;
}

export interface GameState {
  phase: 'waiting' | 'role_reveal' | 'night' | 'day' | 'vote' | 'ended';
  dayNumber: number;
  timeRemaining: number;
  players: Player[];
  myRole?: string;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [gameState, setGameState] = useState<GameState>({
    phase: 'waiting',
    dayNumber: 1,
    timeRemaining: 60,
    players: [],
  });
  
  const discord = useDiscordSdk();

  useEffect(() => {
    if (discord.status === 'authenticated') {
      setScreen('lobby');
    }
  }, [discord.status]);

  const navigateTo = (s: Screen) => setScreen(s);

  return (
    <div className="min-h-screen bg-wv-bg overflow-hidden">
      {/* Background Particles */}
      <BackgroundParticles />
      
      <AnimatePresence mode="wait">
        {screen === 'loading' && (
          <LoadingScreen key="loading" discord={discord} />
        )}
        {screen === 'lobby' && (
          <LobbyScreen 
            key="lobby" 
            discord={discord} 
            onNavigate={navigateTo}
            gameState={gameState}
            setGameState={setGameState}
          />
        )}
        {screen === 'room' && (
          <GameRoomScreen 
            key="room" 
            discord={discord} 
            onNavigate={navigateTo}
            gameState={gameState}
            setGameState={setGameState}
          />
        )}
        {screen === 'game' && (
          <GameplayScreen 
            key="game" 
            discord={discord} 
            onNavigate={navigateTo}
            gameState={gameState}
            setGameState={setGameState}
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
      {/* Animated Logo */}
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
          <Moon className="w-12 h-12 text-wv-primary" />
        </div>
        {/* Orbiting Stars */}
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
            <Star className="w-3 h-3 text-wv-gold fill-wv-gold" />
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
        {discord.status === 'loading' ? 'Connecting to Discord...' : 
         discord.status === 'error' ? 'Connection failed. Retrying...' :
         'Authenticated!'}
      </motion.p>

      {/* Loading Bar */}
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