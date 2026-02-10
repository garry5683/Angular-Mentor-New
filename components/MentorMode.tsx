
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

interface MentorModeProps {
  onClose: () => void;
}

const MentorMode: React.FC<MentorModeProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const sessionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const stopAudio = () => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  useEffect(() => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const connect = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        inputCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: "You are a professional Angular Mentor. Conduct a mock interview. Be encouraging, technical, and concise. No transcripts, focus on audio conversation.",
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
            }
          },
          callbacks: {
            onopen: () => {
              setIsActive(true);
              setIsConnecting(false);
              
              const source = inputCtxRef.current!.createMediaStreamSource(stream);
              const processor = inputCtxRef.current!.createScriptProcessor(4096, 1, 1);
              
              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) {
                  int16[i] = inputData[i] * 32768;
                }
                const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
                
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
                });
              };
              
              source.connect(processor);
              processor.connect(inputCtxRef.current!.destination);
            },
            onmessage: async (msg) => {
              const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (audioBase64) {
                const binary = atob(audioBase64);
                const bytes = new Uint8Array(binary.length);
                for(let i=0; i<binary.length; i++) bytes[i] = binary.charCodeAt(i);
                
                const dataInt16 = new Int16Array(bytes.buffer);
                const buffer = audioCtxRef.current!.createBuffer(1, dataInt16.length, 24000);
                const chan = buffer.getChannelData(0);
                for(let i=0; i<dataInt16.length; i++) chan[i] = dataInt16[i] / 32768.0;

                const source = audioCtxRef.current!.createBufferSource();
                source.buffer = buffer;
                source.connect(audioCtxRef.current!.destination);
                
                const playTime = Math.max(nextStartTimeRef.current, audioCtxRef.current!.currentTime);
                source.start(playTime);
                nextStartTimeRef.current = playTime + buffer.duration;
                sourcesRef.current.add(source);
                source.onended = () => sourcesRef.current.delete(source);
              }

              if (msg.serverContent?.interrupted) {
                stopAudio();
              }
            },
            onerror: () => setIsActive(false),
            onclose: () => setIsActive(false)
          }
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error("Live API connection failed", err);
        onClose();
      }
    };

    connect();

    return () => {
      stopAudio();
      sessionRef.current?.close();
      audioCtxRef.current?.close();
      inputCtxRef.current?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-md p-8 rounded-3xl border border-indigo-500/30 shadow-2xl flex flex-col items-center text-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
          <svg className="w-12 h-12 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4z" />
            <path d="M4 10a1 1 0 00-1 1v1a7 7 0 0014 0v-1a1 1 0 00-1-1H4z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Mentor Mode</h2>
        <p className="text-slate-400 mb-8">
          {isConnecting ? 'Connecting to mentor...' : 'Mock interview in progress. Talk freely!'}
        </p>

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/20"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorMode;
