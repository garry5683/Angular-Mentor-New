
import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { generateExpertAnswer, generateTTS, decodeAudioData } from '../gemini';

interface QuestionModalProps {
  question: Question;
  onClose: () => void;
  onAnswerGenerated: (id: string, answer: string) => void;
  userId: string;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ question, onClose, onAnswerGenerated, userId }) => {
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const fetchAnswer = async () => {
      const cacheKey = `answer_${userId}_${question.id}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        setAnswer(cached);
        setLoading(false);
      } else {
        try {
          const result = await generateExpertAnswer(question.text);
          setAnswer(result);
          localStorage.setItem(cacheKey, result);
          onAnswerGenerated(question.id, result);
        } catch (err) {
          setAnswer("Error generating expert answer. Please check your connection and try again.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAnswer();
  }, [question, userId, onAnswerGenerated]);

  const toggleAudio = async () => {
    if (isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    setIsTtsLoading(true);
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const base64 = await generateTTS(answer);
      const buffer = await decodeAudioData(base64, audioContextRef.current);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      sourceRef.current = source;
      setIsPlaying(true);
    } catch (err) {
      console.error("Audio error", err);
      setIsPlaying(false);
    } finally {
      setIsTtsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      sourceRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-4xl h-[85vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 px-6 py-5 border-b border-slate-800 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white line-clamp-1">{question.text}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-5">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 bg-indigo-500/20"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-800 border-t-indigo-500"></div>
              </div>
              <p className="text-indigo-400 font-bold tracking-widest text-xs uppercase animate-pulse">Consulting Expert Architect</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                <div className="text-slate-400 text-sm">
                  <span className="font-bold text-indigo-400">Expert Level:</span> 9+ Years Senior Architect
                </div>
                <button 
                  onClick={toggleAudio}
                  disabled={isTtsLoading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all min-w-[180px] justify-center shadow-lg ${
                    isPlaying 
                    ? 'bg-red-600 text-white shadow-red-600/20' 
                    : isTtsLoading 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'
                  }`}
                >
                  {isTtsLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-500 border-t-white"></div>
                      Generating Audio...
                    </>
                  ) : isPlaying ? (
                    <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg> Stop Podcast</>
                  ) : (
                    <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg> Play as Podcast</>
                  )}
                </button>
              </div>
              
              <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-800/20 p-6 sm:p-8 rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-700/50">
                   <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                   <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Verified Technical Content</span>
                </div>
                {answer}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
