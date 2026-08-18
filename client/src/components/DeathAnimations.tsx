import { motion } from 'framer-motion';

export function SlashOverlay() {
  return (
    <motion.div
      className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.5 }}
    >
      <motion.svg
        viewBox="0 0 200 200"
        className="w-96 h-96"
        initial={{ scale: 0.5, rotate: -30 }}
        animate={{ 
          scale: [0.5, 1.2, 1],
          rotate: [-30, 10, 0],
        }}
        transition={{ duration: 0.6 }}
      >
        <defs>
          <linearGradient id="slashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e74c3c" />
            <stop offset="50%" stopColor="#fd79a8" />
            <stop offset="100%" stopColor="#fff" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <motion.path
          d="M 30 30 Q 100 80, 170 170"
          stroke="url(#slashGrad)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          filter="url(#glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4 }}
        />
        <motion.path
          d="M 170 30 Q 100 80, 30 170"
          stroke="url(#slashGrad)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        />
      </motion.svg>
    </motion.div>
  );
}

export function GhostDissolve({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      animate={{ 
        opacity: [1, 0.5, 0],
        scale: [1, 1.1, 1.3],
        filter: ['blur(0px)', 'blur(2px)', 'blur(10px)'],
      }}
      transition={{ duration: 2 }}
    >
      {children}
    </motion.div>
  );
}

export function DeathScreen({ playerName, role }: { playerName: string; role: string }) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/90"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <SlashOverlay />
      <motion.div
        className="text-center"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="text-8xl mb-4"
          animate={{ 
            rotate: [0, 10, -10, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          💀
        </motion.div>
        <h2 className="text-4xl font-wv-display text-wv-danger mb-2">
          {playerName} was eliminated
        </h2>
        <p className="text-xl text-wv-text-dim">
          They were a <span className="font-bold">{role}</span>
        </p>
      </motion.div>
    </motion.div>
  );
}

export function LightningBolt() {
  return (
    <motion.div
      className="fixed inset-0 z-30 pointer-events-none"
      animate={{ 
        backgroundColor: ['rgba(255,255,255,0)', 'rgba(108,92,231,0.3)', 'rgba(255,255,255,0)'],
      }}
      transition={{ duration: 0.5 }}
    />
  );
}