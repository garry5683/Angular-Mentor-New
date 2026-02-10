
import React from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  onClick: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative p-6 bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-400/10 rounded">
            {question.category || 'General'}
          </span>
          {question.isCustom && (
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded">CUSTOM</span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-slate-100 group-hover:text-white line-clamp-3">
          {question.text}
        </h3>
        <div className="mt-auto pt-6 flex items-center text-sm font-medium text-slate-500 group-hover:text-indigo-400 transition-colors">
          View Detail
          <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
