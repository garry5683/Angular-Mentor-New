
import React, { useState, useEffect } from 'react';

interface AddQuestionProps {
  onAdd: (text: string) => void;
  onClose: () => void;
  initialText?: string;
}

const AddQuestion: React.FC<AddQuestionProps> = ({ onAdd, onClose, initialText }) => {
  const [text, setText] = useState(initialText || '');

  useEffect(() => {
    setText(initialText || '');
  }, [initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-lg p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {initialText ? 'Edit Question' : 'Add Custom Question'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Technical Question
            </label>
            <textarea
              required
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[160px] outline-none placeholder:text-slate-500"
              placeholder="e.g., Explain the difference between ChangeDetectionStrategy.OnPush and Default."
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] transition-all active:scale-95"
          >
            {initialText ? 'Save Changes' : 'Add to Question Pool'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddQuestion;
