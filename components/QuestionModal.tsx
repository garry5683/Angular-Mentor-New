
import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { generateExpertAnswer, generateTTS, decodeAudioData } from '../gemini';

interface QuestionModalProps {
  question: Question;
  onClose: () => void;
  userId: string;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ question, onClose, userId }) => {
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
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
        } catch (err) {
          setAnswer("Error generating answer.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAnswer();
  }, [question, userId]);

  const toggleAudio = async () => {
    if (isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      setIsPlaying(true);
      const base64 = await generateTTS(answer);
      const buffer = await decodeAudioData(base64, audioContextRef.current);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      sourceRef.current = source;
    } catch (err) {
      console.error("Audio error", err);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      sourceRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white line-clamp-1">{question.text}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
              <p className="text-slate-400">Consulting senior architect...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-end">
                <button 
                  onClick={toggleAudio}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isPlaying ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isPlaying ? (
                    <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg> Stop Podcast</>
                  ) : (
                    <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg> Listen as Podcast</>
                  )}
                </button>
              </div>
              <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
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
