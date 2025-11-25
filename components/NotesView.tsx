import React, { useState } from 'react';
import { StructuredNotes } from '../types';

interface NotesViewProps {
  notes: StructuredNotes;
}

type TabType = 'summary' | 'bullets' | 'detailed' | 'mindmap' | 'definitions';

export const NotesView: React.FC<NotesViewProps> = ({ notes }) => {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'bullets', label: 'Key Points' },
    { id: 'detailed', label: 'Detailed Notes' },
    { id: 'definitions', label: 'Definitions' },
    { id: 'mindmap', label: 'Structure Map' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
        <div className="flex space-x-1 overflow-x-auto custom-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
                ${activeTab === tab.id 
                  ? 'bg-white text-brand-600 shadow-sm border border-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {activeTab === 'summary' && (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Executive Summary</h3>
            <div className="prose prose-slate leading-relaxed text-slate-700 bg-brand-50 p-6 rounded-xl border border-brand-100">
              {notes.summary}
            </div>
          </div>
        )}

        {activeTab === 'bullets' && (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Key Takeaways</h3>
            <ul className="space-y-3">
              {notes.bulletPoints.map((point, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-brand-100 text-brand-600 text-xs font-bold mr-3 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="max-w-3xl mx-auto space-y-8">
            {notes.detailedNotes.map((section, idx) => (
              <div key={idx} className="border-l-4 border-brand-500 pl-4 py-1">
                <h4 className="text-lg font-bold text-slate-800 mb-2">{section.heading}</h4>
                <p className="text-slate-600 whitespace-pre-line">{section.content}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'definitions' && (
          <div className="max-w-3xl mx-auto grid gap-4 sm:grid-cols-2">
            {notes.definitions.map((def, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="block font-bold text-brand-700 mb-1">{def.term}</span>
                <span className="text-sm text-slate-600">{def.definition}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'mindmap' && (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Topic Hierarchy</h3>
            <div className="space-y-6">
              {notes.mindMap.map((node, idx) => (
                <div key={idx} className="relative pl-6">
                  {/* Vertical Line */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                  {/* Topic Node */}
                  <div className="relative mb-3">
                     <span className="absolute -left-[1.65rem] top-2 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-white"></span>
                     <h4 className="text-lg font-semibold text-slate-800">{node.topic}</h4>
                  </div>
                  {/* Subtopics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                    {node.subtopics.map((sub, sIdx) => (
                      <div key={sIdx} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm text-sm text-slate-600 hover:border-brand-300 transition-colors">
                        {sub}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
