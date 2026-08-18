import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export function useSocket() {
  const ref = useRef(null);
  if (!ref.current) {
    ref.current = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return ref.current;
}

export function useGame(socket) {
  const [room, setRoom] = useState(null);
  const [me, setMe] = useState(null);
  const [myRole, setMyRole] = useState(null);
  const [inspect, setInspect] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onLobby = (state) => {
      setRoom(state);
      setLogs(state.log || []);
    };
    const onGame = (state) => {
      setRoom(state);
      setLogs(state.log || []);
    };
    const onRole = ({ id, role, team }) => {
      setMe((prev) => {
        if (prev && prev.id === id) {
          setMyRole({ role, team });
        }
        return prev;
      });
    };
    const onInspect = (result) => {
      setInspect(result);
    };
    socket.on('lobby:update', onLobby);
    socket.on('game:state', onGame);
    socket.on('role:assigned', onRole);
    socket.on('private:inspect', onInspect);
    return () => {
      socket.off('lobby:update', onLobby);
      socket.off('game:state', onGame);
      socket.off('role:assigned', onRole);
      socket.off('private:inspect', onInspect);
    };
  }, [socket]);

  return { room, me, myRole, inspect, logs, error, setError, setMe, setRoom, setInspect };
}