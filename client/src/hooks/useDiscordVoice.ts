import { useEffect, useState } from 'react';

interface VoiceMember {
  id: string;
  username: string;
  avatar?: string;
  isMuted?: boolean;
  isSpeaking?: boolean;
}

export function useDiscordVoice() {
  const [members, setMembers] = useState<VoiceMember[]>([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Subscribe to Discord voice channel members
    // This is a mock implementation - real Discord requires RPC SDK
    if (typeof window === 'undefined') return;

    const interval = setInterval(async () => {
      try {
        // Try to get Discord SDK instance
        const { DiscordSDK } = await import('@discord/embedded-app-sdk');
        const discordSdk = (window as any).__discordSdk;
        if (!discordSdk) return;

        // Subscribe to voice state
        const channelId = discordSdk.channelId;
        if (channelId) {
          // Real Discord voice sync would go here
          setEnabled(true);
        }
      } catch (e) {
        // Fallback - mock with empty array
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { members, enabled };
}

export function useLocalMic() {
  const [speaking, setSpeaking] = useState(false);
  
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) return;
    
    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let stream: MediaStream;
    let raf: number;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const check = () => {
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setSpeaking(avg > 30);
          raf = requestAnimationFrame(check);
        };
        check();
      } catch (e) {
        console.log('Mic access denied');
      }
    };

    start();
    
    return () => {
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach(t => t.stop());
      audioContext?.close();
    };
  }, []);

  return { speaking };
}