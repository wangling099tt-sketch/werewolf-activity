import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Copy, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface RoomBrowserProps {
  onClose: () => void;
  onJoinRoom: (roomId: string) => void;
}

interface Room {
  id: string;
  hostName: string;
  players: number;
  maxPlayers: number;
}

export function RoomBrowser({ onClose, onJoinRoom }: RoomBrowserProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rooms')
      .then(r => r.json())
      .then(data => {
        setRooms(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-wv-bg-deep/95 backdrop-blur-md p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-wv-display text-gradient-wv flex items-center gap-2">
            <Users className="w-8 h-8" />
            Open Rooms
          </h2>
          <motion.button
            className="wv-btn-ghost p-2 rounded-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </motion.button>
        </div>

        {loading && (
          <div className="text-center py-12 text-wv-text-dim">
            <div className="animate-spin w-8 h-8 border-2 border-wv-primary border-t-transparent rounded-full mx-auto mb-4" />
            Loading rooms...
          </div>
        )}

        {!loading && rooms.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">🏚️</div>
            <h3 className="text-xl text-wv-text mb-2">No rooms available</h3>
            <p className="text-wv-text-dim mb-6">Create one and invite your friends!</p>
            <button
              className="wv-btn-primary"
              onClick={onClose}
            >
              Create Room
            </button>
          </motion.div>
        )}

        <div className="space-y-3">
          {rooms.map((room, i) => (
            <motion.div
              key={room.id}
              className="wv-card flex items-center gap-4 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ x: 4, boxShadow: '0 8px 32px rgba(108, 92, 231, 0.3)' }}
              onClick={() => { onJoinRoom(room.id); onClose(); }}
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-wv-primary/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-wv-primary" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-wv-text">{room.id}</h3>
                <p className="text-xs text-wv-text-dim">Host: {room.hostName}</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 wv-timer-bar max-w-[120px]">
                    <div 
                      className="wv-timer-fill"
                      style={{ width: `${(room.players / room.maxPlayers) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-wv-text-dim">
                    {room.players}/{room.maxPlayers}
                  </span>
                </div>
              </div>

              <motion.div
                className="flex items-center gap-1 text-wv-primary"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Join <ArrowRight className="w-4 h-4" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}