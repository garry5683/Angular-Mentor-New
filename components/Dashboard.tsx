
import React, { useState, useEffect, useCallback } from 'react';
import { signOut, auth, db } from '../firebase';
import { collection, query, getDocs, doc, setDoc } from 'firebase/firestore';
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [syncing, setSyncing] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [audioState, setAudioState] = useState<AudioState>({ isPlaying: false, activeId: null });
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Load initial data from Firestore and LocalStorage
  useEffect(() => {
    const syncData = async () => {
      setSyncing(true);
      try {
        // 1. Fetch custom questions from Firestore
        const customQRef = collection(db, 'users', user.uid, 'customQuestions');
        const customQSnap = await getDocs(customQRef);
        const firestoreCustom: Question[] = [];
        customQSnap.forEach(doc => {
          firestoreCustom.push(doc.data() as Question);
        });

        // 2. Fetch all saved answers from Firestore
        const answersRef = collection(db, 'users', user.uid, 'answers');
        const answersSnap = await getDocs(answersRef);
        const firestoreAnswers: Record<string, string> = {};
        answersSnap.forEach(doc => {
          const data = doc.data();
          firestoreAnswers[data.id] = data.answer;
        });

        // 3. Merge with Static Questions and Local Cache
        const allCustom = [...firestoreCustom];
        const sortedCustom = allCustom.sort((a, b) => Number(b.id) - Number(a.id));
        
        const merged = [...sortedCustom, ...STATIC_QUESTIONS].map(q => {
          // Priority: LocalStorage (Fastest) > Firestore (Sync)
          const localCache = localStorage.getItem(`answer_${user.uid}_${q.id}`);
          const remoteCache = firestoreAnswers[q.id];
          
          const cachedAnswer = localCache || remoteCache;
          
          // Update local cache if missing but exists in firestore
          if (!localCache && remoteCache) {
            localStorage.setItem(`answer_${user.uid}_${q.id}`, remoteCache);
          }
          
          return cachedAnswer ? { ...q, cachedAnswer } : q;
        });

        setQuestions(merged);
      } catch (err) {
        console.error("Error syncing with Firestore:", err);
        // Fallback to local only if firestore fails
        const saved = localStorage.getItem(`custom_questions_${user.uid}`);
        const localCustom = saved ? JSON.parse(saved) : [];
        setQuestions([...localCustom, ...STATIC_QUESTIONS]);
      } finally {
        setSyncing(false);
      }
    };

    syncData();
  }, [user.uid]);

  const categories = ['All', ...Array.from(new Set(questions.map(q => q.category).filter(Boolean)))];

  const handleLogout = () => signOut(auth);

  const handleAddQuestion = async (text: string) => {
    const newQ: Question = { 
      id: Date.now().toString(), 
      text, 
      category: 'Custom', 
      isCustom: true 
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'users', user.uid, 'customQuestions', newQ.id), newQ);
    } catch (err) {
      console.error("Failed to save custom question to Firestore:", err);
    }

    // Save to LocalStorage
    const currentCustom = questions.filter(q => q.isCustom);
    localStorage.setItem(`custom_questions_${user.uid}`, JSON.stringify([newQ, ...currentCustom]));

    setQuestions([newQ, ...questions]);
    setIsAddOpen(false);
  };

  const handleUpdateAnswer = async (id: string, answer: string) => {
    // Save to Firestore
    try {
      await setDoc(doc(db, 'users', user.uid, 'answers', id), { id, answer });
    } catch (err) {
      console.error("Failed to sync answer to Firestore:", err);
    }

    // Save to LocalStorage
    localStorage.setItem(`answer_${user.uid}_${id}`, answer);

    setQuestions(prev => prev.map(q => q.id === id ? { ...q, cachedAnswer: answer } : q));
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-800 pb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Angular Expert Mentor
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-slate-400">Hi {user.displayName || user.email}</p>
              {syncing && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 rounded text-[10px] text-indigo-400 font-bold uppercase tracking-widest animate-pulse border border-indigo-500/20">
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Syncing
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => setIsAddOpen(true)}
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
          onAdd={handleAddQuestion} 
          onClose={() => setIsAddOpen(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
