
import React, { useState, useEffect, useCallback } from 'react';
import { signOut, auth } from '../firebase';
import { UserProfile, Question, AudioState } from '../types';
import { STATIC_QUESTIONS } from '../questions';
import QuestionCard from './QuestionCard';
import QuestionModal from './QuestionModal';
import MentorMode from './MentorMode';
import AddQuestion from './AddQuestion';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem(`custom_questions_${user.uid}`);
    const custom = saved ? JSON.parse(saved) : [];
    return [...STATIC_QUESTIONS, ...custom];
  });
  
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>({ isPlaying: false, activeId: null });
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(questions.map(q => q.category).filter(Boolean)))];

  const handleLogout = () => signOut(auth);

  const handleAddQuestion = (text: string) => {
    const newQ: Question = { id: Date.now().toString(), text, category: 'Custom', isCustom: true };
    const updated = [...questions, newQ];
    setQuestions(updated);
    const customOnly = updated.filter(q => q.isCustom);
    localStorage.setItem(`custom_questions_${user.uid}`, JSON.stringify(customOnly));
    setIsAddOpen(false);
  };

  const stopAllAudio = useCallback(() => {
    setAudioState({ isPlaying: false, activeId: null });
  }, []);

  const filteredQuestions = activeCategory === 'All' 
    ? questions 
    : questions.filter(q => q.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Angular Expert Mentor
          </h1>
          <p className="text-slate-400 mt-2">Hi {user.displayName || user.email}, ready to master Angular?</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-slate-800 text-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-700 transition"
          >
            Add Question
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-900/20 text-red-400 text-sm font-semibold rounded-lg border border-red-900/30 hover:bg-red-900/40 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Topic Selector - Improved UI */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat || 'All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredQuestions.map((q) => (
          <QuestionCard 
            key={q.id} 
            question={q} 
            onClick={() => {
              stopAllAudio();
              setSelectedQuestion(q);
            }} 
          />
        ))}
      </div>

      {/* Mentor Mode Trigger (Aligned Right) */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => {
            stopAllAudio();
            setIsMentorOpen(true);
          }}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all animate-pulse"
          title="Mentor Mode"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>

      {/* Modals */}
      {selectedQuestion && (
        <QuestionModal 
          question={selectedQuestion} 
          onClose={() => {
            stopAllAudio();
            setSelectedQuestion(null);
          }}
          userId={user.uid}
        />
      )}

      {isMentorOpen && (
        <MentorMode 
          onClose={() => setIsMentorOpen(false)} 
        />
      )}

      {isAddOpen && (
        <AddQuestion 
          onAdd={handleAddQuestion} 
          onClose={() => setIsAddOpen(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
