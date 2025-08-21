import React, { useEffect, useRef, useState, useCallback } from 'react';

interface MeetingAvatarProps {
  name: string;
  role: string;
  avatarUrl: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isThinking?: boolean;
  energy?: number; // 0-1
  audioElement?: HTMLAudioElement;
  onEnergyChange?: (energy: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

type AvatarState = 'idle' | 'speaking' | 'thinking' | 'muted';

export const MeetingAvatar: React.FC<MeetingAvatarProps> = ({
  name,
  role,
  avatarUrl,
  isSpeaking,
  isMuted,
  isThinking = false,
  energy = 0,
  audioElement,
  onEnergyChange,
  size = 'md',
  className = ''
}) => {
  const [currentEnergy, setCurrentEnergy] = useState(energy);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);

  // Size configurations
  const sizeConfig = {
    sm: { avatar: 48, ring: 56, waveform: 24 },
    md: { avatar: 64, ring: 72, waveform: 32 },
    lg: { avatar: 80, ring: 88, waveform: 40 }
  };

  const config = sizeConfig[size];

  // Determine avatar state
  useEffect(() => {
    if (isMuted) {
      setAvatarState('muted');
    } else if (isThinking) {
      setAvatarState('thinking');
    } else if (isSpeaking) {
      setAvatarState('speaking');
    } else {
      setAvatarState('idle');
    }
  }, [isSpeaking, isMuted, isThinking]);

  // Audio analysis setup
  const setupAudioAnalysis = useCallback(() => {
    if (!audioElement || !window.AudioContext) return;

    try {
      // Create audio context
      audioContextRef.current = new AudioContext();
      const audioContext = audioContextRef.current;

      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Create source from audio element
      const source = audioContext.createMediaElementSource(audioElement);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      console.log('🎵 Audio analysis setup complete for', name);
    } catch (error) {
      console.warn('⚠️ Audio analysis setup failed for', name, error);
    }
  }, [audioElement, name]);

  // Cleanup audio analysis
  const cleanupAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
  }, []);

  // RMS calculation
  const calculateRMS = useCallback((audioData: Float32Array): number => {
    let sum = 0;
    const length = audioData.length;
    
    for (let i = 0; i < length; i++) {
      sum += audioData[i] * audioData[i];
    }
    
    return Math.sqrt(sum / length);
  }, []);

  // Audio analysis loop
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !isSpeaking) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      return;
    }

    try {
      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      analyser.getByteTimeDomainData(dataArray);

      // Convert to float values (-1 to 1)
      const floatArray = new Float32Array(bufferLength);
      for (let i = 0; i < bufferLength; i++) {
        floatArray[i] = (dataArray[i] - 128) / 128;
      }

      // Calculate RMS
      const rms = calculateRMS(floatArray);
      
      // Map RMS to energy (0-1)
      const newEnergy = Math.min(rms * 2, 1.0); // Scale factor for better visualization
      
      setCurrentEnergy(newEnergy);
      onEnergyChange?.(newEnergy);

    } catch (error) {
      console.warn('⚠️ Audio analysis error for', name, error);
    }

    // Continue analysis loop
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [isSpeaking, calculateRMS, name, onEnergyChange]);

  // Setup audio analysis when audio element changes
  useEffect(() => {
    if (audioElement && isSpeaking) {
      setupAudioAnalysis();
    }

    return () => {
      cleanupAudioAnalysis();
    };
  }, [audioElement, isSpeaking, setupAudioAnalysis, cleanupAudioAnalysis]);

  // Start/stop audio analysis
  useEffect(() => {
    if (isSpeaking && analyserRef.current) {
      analyzeAudio();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setCurrentEnergy(0);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isSpeaking, analyzeAudio]);

  // Generate waveform bars
  const generateWaveformBars = () => {
    if (!isSpeaking || avatarState === 'muted') return null;

    const bars = 8;
    const barElements = [];

    for (let i = 0; i < bars; i++) {
      // Create energy pattern based on current energy
      const barEnergy = Math.max(0.1, currentEnergy * (0.5 + Math.random() * 0.5));
      const height = `${barEnergy * 100}%`;
      
      barElements.push(
        <div
          key={i}
          className="bg-green-400 rounded-sm transition-all duration-75 ease-out"
          style={{
            height,
            width: '2px',
            minHeight: '2px'
          }}
        />
      );
    }

    return barElements;
  };

  // Get initials for fallback avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Avatar Container */}
      <div className="relative">
        {/* Speaking Ring */}
        {avatarState === 'speaking' && (
          <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-pulse">
            <div className="absolute inset-0 rounded-full border-2 border-green-400 opacity-50 animate-ping"></div>
          </div>
        )}
        
        {/* Muted Ring */}
        {avatarState === 'muted' && (
          <div className="absolute inset-0 rounded-full border-2 border-gray-400"></div>
        )}

        {/* Avatar Image - Keep existing photo system */}
        <div
          className={`rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold ${
            avatarState === 'idle' ? 'animate-pulse' : ''
          }`}
          style={{
            width: `${config.avatar}px`,
            height: `${config.avatar}px`,
            animation: avatarState === 'idle' ? 'breathing 3s ease-in-out infinite' : 'none'
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg">
              {getInitials(name)}
            </div>
          )}
        </div>

        {/* Thinking Spinner */}
        {avatarState === 'thinking' && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-spin">
            <div className="w-full h-full rounded-full border-2 border-blue-300 border-t-transparent"></div>
          </div>
        )}

        {/* Muted Icon */}
        {avatarState === 'muted' && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Waveform */}
      {isSpeaking && avatarState !== 'muted' && (
        <div
          ref={waveformRef}
          className="flex items-end justify-center space-x-1 mt-2"
          style={{ height: `${config.waveform}px` }}
        >
          {generateWaveformBars()}
        </div>
      )}

      {/* Name and Role */}
      <div className="text-center mt-2">
        <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-24">
          {name}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-24">
          {role}
        </div>
      </div>

      {/* Breathing Animation CSS */}
      <style jsx>{`
        @keyframes breathing {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
};
