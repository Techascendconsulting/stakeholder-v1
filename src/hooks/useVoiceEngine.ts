// Lightweight voice engine using the Web Speech API (SpeechRecognition)
// Behavior: click Speak once -> app listens; on pause/end of utterance, we fire onTranscribed()
// After the AI speaks, call resumeListening() to continue.
//
// NOTE: Chrome/Edge support this natively. For Safari/Firefox, you can later swap to
// MediaRecorder + server STT without changing VoiceMeetingV2.tsx.

import { useEffect, useRef, useState } from "react";

type VoiceState = "idle" | "listening" | "processing" | "speaking" | "ended";

interface UseVoiceEngineProps {
  onTranscribed?: (transcript: string) => void;
  onStateChange?: (state: VoiceState) => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export function useVoiceEngine({ onTranscribed, onStateChange }: UseVoiceEngineProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const recognitionRef = useRef<any>(null);
  const autoResumeRef = useRef(false); // controls if we resume after AI finishes
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  // init recognition (Chrome/Edge/Android). iOS will use MediaRecorder + server STT.
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || isIOS) {
      console.warn("SpeechRecognition API not available in this browser.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "en-GB";
    rec.interimResults = false;
    rec.continuous = false; // one utterance -> end -> we decide when to resume
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      console.log('🎤 Voice engine: Started listening');
      setState("listening");
      onStateChange?.("listening");
    };

    rec.onresult = (evt: SpeechRecognitionEvent) => {
      const transcript = evt.results?.[0]?.[0]?.transcript?.trim();
      console.log('🎤 Voice engine: Received transcript:', transcript);
      if (transcript) {
        // We're done listening for this turn; send it along
        setState("processing");
        onStateChange?.("processing");
        onTranscribed?.(transcript);
      }
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.warn("SpeechRecognition error:", e.error);
      // Gracefully go idle so UI doesn't get stuck
      setState("idle");
      onStateChange?.("idle");
    };

    rec.onend = () => {
      console.log('🎤 Voice engine: Recognition ended');
      // onend fires after each utterance or if user stops speaking.
      // We'll only auto-resume from the parent component after AI finishes speaking.
    };

    recognitionRef.current = rec;
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {}
    };
  }, [onStateChange, onTranscribed]);

  const startListening = async () => {
    // iOS path: record short clip and send to server for transcription
    if (isIOS) {
      try {
        autoResumeRef.current = true;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' } as any);
        chunksRef.current = [];
        mr.onstart = () => {
          setState('listening');
          onStateChange?.('listening');
        };
        mr.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };
        mr.onstop = async () => {
          setState('processing');
          onStateChange?.('processing');
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const base64 = await blobToBase64(blob);
          try {
            const resp = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: base64.split(',')[1], mimeType: blob.type })
            });
            const json = await resp.json();
            if (json?.text) onTranscribed?.(json.text);
          } catch (err) {
            console.warn('Transcription failed', err);
            setState('idle');
            onStateChange?.('idle');
          }
        };
        mediaRecorderRef.current = mr;
        mr.start();
        // Auto-stop after 7s (short turn-taking)
        setTimeout(() => {
          try { mr.state !== 'inactive' && mr.stop(); } catch {}
        }, 7000);
      } catch (e) {
        console.warn('iOS mic start error', e);
      }
      return;
    }

    if (!recognitionRef.current) return;
    console.log('🎤 Voice engine: Starting listening...');
    try {
      autoResumeRef.current = true;
      recognitionRef.current.start();
    } catch (e) {
      console.warn('🎤 Voice engine: Error starting recognition:', e);
      // start can throw if called twice quickly; ignore
    }
  };

  const stopListening = () => {
    console.log('🎤 Voice engine: Stopping listening...');
    autoResumeRef.current = false;
    try {
      recognitionRef.current?.abort();
    } catch {}
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    } catch {}
  };

  // Called by parent AFTER AI finishes speaking to re-arm listening
  const resumeListening = () => {
    if (!recognitionRef.current) return;
    console.log('🎤 Voice engine: Resuming listening...', { autoResume: autoResumeRef.current });
    if (autoResumeRef.current) {
      try {
        recognitionRef.current.start();
        setState("listening");
        onStateChange?.("listening");
      } catch (e) {
        console.warn('🎤 Voice engine: Error resuming recognition:', e);
      }
    }
  };

  const endConversation = () => {
    console.log('🎤 Voice engine: Ending conversation');
    autoResumeRef.current = false;
    stopListening();
    setState("ended");
    onStateChange?.("ended");
  };

  return {
    state,
    startListening,   // call once when user clicks Speak
    resumeListening,  // call after AI audio playback ends
    stopListening,    // not shown in UI; safety
    endConversation,  // End Conversation button
  };
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}







