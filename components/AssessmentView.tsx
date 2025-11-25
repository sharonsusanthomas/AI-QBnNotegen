import React, { useState } from 'react';
import { Question } from '../types';

interface AssessmentViewProps {
  questions: Question[];
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({ questions }) => {
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (questionId: number, optionIndex: number) => {
    if (showResults) return;
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswerIndex) score++;
    });
    return score;
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setShowResults(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Knowledge Check</h2>
          <p className="text-sm text-slate-500">{questions.length} Questions • Mixed Difficulty</p>
        </div>
        {showResults ? (
           <div className="text-right">
             <span className="block text-2xl font-bold text-brand-600">{calculateScore()} / {questions.length}</span>
             <button onClick={resetQuiz} className="text-sm text-slate-500 underline hover:text-brand-600">Try Again</button>
           </div>
        ) : (
          <button 
            onClick={() => setShowResults(true)}
            disabled={Object.keys(userAnswers).length < questions.length}
            className={`px-6 py-2 rounded-lg font-medium transition-colors 
              ${Object.keys(userAnswers).length < questions.length 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm'}`}
          >
            Submit Quiz
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/50">
        <div className="max-w-3xl mx-auto space-y-6">
          {questions.map((q, idx) => {
            const isAnswered = userAnswers[q.id] !== undefined;
            const isCorrect = userAnswers[q.id] === q.correctAnswerIndex;
            
            return (
              <div key={q.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Question {idx + 1}</span>
                  <span className={`text-xs px-2 py-1 rounded-full border 
                    ${q.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border-green-100' : 
                      q.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 
                      'bg-red-50 text-red-700 border-red-100'}`}>
                    {q.difficulty}
                  </span>
                </div>
                
                <p className="text-lg font-medium text-slate-800 mb-6">{q.question}</p>
                
                <div className="space-y-3">
                  {q.options.map((opt, optIdx) => {
                    let btnClass = "w-full text-left p-4 rounded-lg border-2 transition-all ";
                    
                    if (showResults) {
                      if (optIdx === q.correctAnswerIndex) {
                        btnClass += "border-green-500 bg-green-50 text-green-900";
                      } else if (userAnswers[q.id] === optIdx) {
                         btnClass += "border-red-500 bg-red-50 text-red-900";
                      } else {
                        btnClass += "border-transparent bg-slate-50 text-slate-400";
                      }
                    } else {
                      if (userAnswers[q.id] === optIdx) {
                        btnClass += "border-brand-500 bg-brand-50 text-brand-900";
                      } else {
                        btnClass += "border-slate-100 bg-white hover:border-brand-200 hover:bg-slate-50";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelect(q.id, optIdx)}
                        className={btnClass}
                        disabled={showResults}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>

                {showResults && (
                  <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
