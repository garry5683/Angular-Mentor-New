
import React from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
  onEdit?: (e: React.MouseEvent, question: Question) => void;
  onDelete?: (e: React.MouseEvent, id: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick, onEdit, onDelete }) => {
  return (
    <div 
      onClick={onClick}
      className={`group relative p-6 bg-slate-900 border rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
        question.cachedAnswer 
        ? 'border-indigo-500/40 bg-indigo-500/10 shadow-[0_0_20px_rgba(79,70,229,0.1)]' 
        : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-400/10 rounded">
              {question.category || 'General'}
            </span>
            {question.isCustom && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">CUSTOM</span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            {question.cachedAnswer && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded shadow-[0_0_10px_rgba(16,185,129,0.1)] text-emerald-300" title="Answer is cached locally">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest">Saved</span>
              </div>
            )}
            
            {question.isCustom && (
              <div className="flex items-center gap-1">
                {onEdit && (
                  <button 
                    onClick={(e) => onEdit(e, question)}
                    className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition"
                    title="Edit Question"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={(e) => onDelete(e, question.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition"
                    title="Delete Question"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-slate-100 group-hover:text-white line-clamp-3">
          {question.text}
        </h3>
        
        <div className="mt-auto pt-6 flex items-center text-sm font-medium text-slate-500 group-hover:text-indigo-400 transition-colors">
          {question.cachedAnswer ? 'Review Expert Answer' : 'Generate Expert Answer'}
          <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
