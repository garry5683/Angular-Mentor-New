
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
    const custom: Question[] = saved ? JSON.parse(saved) : [];
    
    // Sort custom questions newest first (by id which is timestamp)
    const sortedCustom = [...custom].sort((a, b) => Number(b.id) - Number(a.id));
    
    const initialQuestions = [...sortedCustom, ...STATIC_QUESTIONS].map(q => {
      const cached = localStorage.getItem(`answer_${user.uid}_${q.id}`);
      return cached ? { ...q, cachedAnswer: cached } : q;
    });
    
    return initialQuestions;
  });
  
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({ isPlaying: false, activeId: null });
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(questions.map(q => q.category).filter(Boolean)))];

  const handleLogout = () => signOut(auth);

  const saveCustomQuestions = (allQuestions: Question[]) => {
    const customOnly = allQuestions.filter(q => q.isCustom);
    localStorage.setItem(`custom_questions_${user.uid}`, JSON.stringify(customOnly));
  };

  const handleAddOrUpdateQuestion = (text: string) => {
    let updated: Question[];
    if (editingQuestion) {
      updated = questions.map(q => q.id === editingQuestion.id ? { ...q, text } : q);
    } else {
      const newQ: Question = { 
        id: Date.now().toString(), 
        text, 
        category: 'Custom', 
        isCustom: true 
      };
      // Prepend the new question to the custom ones (which are at the start of the array)
      const custom = questions.filter(q => q.isCustom);
      const rest = questions.filter(q => !q.isCustom);
      updated = [newQ, ...custom, ...rest];
    }
    setQuestions(updated);
    saveCustomQuestions(updated);
    setIsAddOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updated = questions.filter(q => q.id !== id);
      setQuestions(updated);
      saveCustomQuestions(updated);
      localStorage.removeItem(`answer_${user.uid}_${id}`);
    }
  };

  const handleUpdateAnswer = (id: string, answer: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, cachedAnswer: answer } : q));
  };

  const stopAllAudio = useCallback(() => {
    setAudioState({ isPlaying: false, activeId: null });
  }, []);

  const handleEditClick = (e: React.MouseEvent, q: Question) => {
    e.stopPropagation();
    setEditingQuestion(q);
    setIsAddOpen(true);
  };

  const filteredQuestions = activeCategory === 'All' 
    ? questions 
    : questions.filter(q => q.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Angular Expert Mentor
          </h1>
          <p className="text-slate-400 mt-2">Hi {user.displayName || user.email}, ready to master Angular?</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => { setEditingQuestion(null); setIsAddOpen(true); }}
            className="px-4 py-2.5 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 text-sm font-semibold rounded-lg hover:bg-indigo-600/20 transition"
          >
            + Add Question
          </button>
          <button 
            onClick={handleLogout}
            className="px-4 py-2.5 bg-red-900/10 text-red-400 text-sm font-semibold rounded-lg border border-red-900/30 hover:bg-red-900/20 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Topic Selector */}
      <div className="mb-10 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat || 'All')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 translate-y-[-2px]' 
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
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
            onEdit={handleEditClick}
            onDelete={handleDeleteQuestion}
          />
        ))}
      </div>

      {/* Mentor Mode Trigger (Floating) */}
      <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-40">
        <button
          onClick={() => {
            stopAllAudio();
            setIsMentorOpen(true);
          }}
          className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:scale-110 active:scale-95 transition-all animate-pulse"
          title="Voice Mentor Mode"
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
          onAnswerGenerated={handleUpdateAnswer}
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
          onAdd={handleAddOrUpdateQuestion} 
          onClose={() => setIsAddOpen(false)} 
          initialText={editingQuestion?.text}
        />
      )}
    </div>
  );
};

export default Dashboard;
