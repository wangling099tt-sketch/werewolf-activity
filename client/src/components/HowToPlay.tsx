import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, MessageCircle, Moon, Sun, Skull, ArrowRight } from 'lucide-react';

interface HowToPlayProps {
  onClose: () => void;
}

const STEPS = [
  {
    icon: Users,
    color: '#6c5ce7',
    title: 'Join a Room',
    desc: 'Create or join a room with 4-16 players. Friends join via room code.',
  },
  {
    icon: '🐺',
    color: '#e74c3c',
    title: 'Get Your Role',
    desc: 'Each player secretly receives a role: Werewolf, Seer, Bodyguard, or Villager.',
  },
  {
    icon: Moon,
    color: '#9b59b6',
    title: 'Night Phase',
    desc: 'Werewolves secretly choose a victim. Seer inspects roles. Bodyguard protects.',
  },
  {
    icon: Sun,
    color: '#fdcb6e',
    title: 'Day Discussion',
    desc: 'Survivors discuss who might be the Werewolf. Share clues and suspicions.',
  },
  {
    icon: Skull,
    color: '#fd79a8',
    title: 'Vote & Eliminate',
    desc: 'Vote to lynch a suspected Werewolf. Majority wins.',
  },
  {
    icon: '🏆',
    color: '#00b894',
    title: 'Win the Game',
    desc: 'Town wins by eliminating all Werewolves. Werewolves win by outnumbering the town.',
  },
];

export function HowToPlay({ onClose }: HowToPlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-wv-bg-deep/95 backdrop-blur-md p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-wv-display text-gradient-wv">How to Play</h2>
          <motion.button
            className="wv-btn-ghost p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        <div className="space-y-4">
          {STEPS.map((step, i) => {
            const Icon = typeof step.icon === 'string' ? null : step.icon;
            return (
              <motion.div
                key={i}
                className="wv-card flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${step.color}20` }}
                >
                  {Icon ? <Icon className="w-7 h-7" style={{ color: step.color }} /> : (
                    <span className="text-3xl">{step.icon}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-wv-text mb-1">{step.title}</h3>
                  <p className="text-wv-text-dim text-sm">{step.desc}</p>
                </div>
                <div className="text-3xl font-wv-display text-wv-text-muted">
                  {String(i + 1).padStart(2, '0')}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            className="wv-btn-primary text-lg py-3 px-8"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
          >
            Got it! <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}