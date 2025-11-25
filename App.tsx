import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { NotesView } from './components/NotesView';
import { AssessmentView } from './components/AssessmentView';
import { ChatView } from './components/ChatView';
import { UploadedFile, AppStep, AIResponseData } from './types';
import { GeminiService } from './services/geminiService';

// Fallback API key entry for demo purposes
const API_KEY_STORAGE = 'gemini_api_key';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [data, setData] = useState<AIResponseData | null>(null);
  const [activeView, setActiveView] = useState<'notes' | 'assessment' | 'chat'>('notes');
  const [apiKey, setApiKey] = useState<string>(process.env.API_KEY || localStorage.getItem(API_KEY_STORAGE) || '');
  const [error, setError] = useState<string | null>(null);

  // If no env key, ask user (mocking safe env behavior for a pure frontend demo)
  const needsApiKey = !apiKey;

  const handleApiKeySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const key = formData.get('apiKey') as string;
    if (key) {
      setApiKey(key);
      localStorage.setItem(API_KEY_STORAGE, key);
    }
  };

  const handleFileSelect = async (uploadedFile: UploadedFile) => {
    setFile(uploadedFile);
    setStep(AppStep.PROCESSING);
    setError(null);

    try {
      const service = new GeminiService(apiKey);
      const result = await service.processDocument(uploadedFile);
      setData(result);
      setStep(AppStep.DASHBOARD);
    } catch (err: any) {
      console.error(err);
      setError("Failed to process document. Please try again or check your API Key. Ensure the file is not corrupted and is a supported format.");
      setStep(AppStep.UPLOAD);
      setFile(null);
    }
  };

  if (needsApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">Setup Gemini API</h2>
          <p className="text-slate-600 mb-6 text-center text-sm">
            To run this demo, please provide a Google Gemini API Key. 
            It is stored locally in your browser.
          </p>
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <input 
              name="apiKey" 
              type="password" 
              placeholder="Enter API Key (starts with AIza...)" 
              className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-500 outline-none"
              required
            />
            <button type="submit" className="w-full bg-brand-600 text-white py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors">
              Start App
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline">
              Get an API Key here
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 flex-shrink-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            S
          </div>
          <span className="text-xl font-bold text-slate-800">StudyGenius AI</span>
        </div>
        
        {step === AppStep.DASHBOARD && (
          <div className="flex items-center space-x-4">
             <span className="text-sm text-slate-500 truncate max-w-[200px] hidden sm:block">
               File: {file?.name}
             </span>
             <button 
               onClick={() => { setStep(AppStep.UPLOAD); setFile(null); setData(null); }}
               className="text-sm text-brand-600 hover:text-brand-800 font-medium"
             >
               New Upload
             </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {step === AppStep.UPLOAD && (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <div className="text-center mb-10 max-w-2xl">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Turn your study materials into <span className="text-brand-600">Mastery</span>
              </h1>
              <p className="text-lg text-slate-600">
                Upload your notes, slides, or textbook chapters. Our AI will generate summaries, 
                mind maps, and interactive quizzes instantly.
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} />
            {error && <p className="mt-6 text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm font-medium border border-red-100">{error}</p>}
          </div>
        )}

        {step === AppStep.PROCESSING && (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-slate-800 animate-pulse">Analyzing Document...</h2>
            <p className="text-slate-500 mt-2">Extracting concepts, generating notes, and creating quiz.</p>
          </div>
        )}

        {step === AppStep.DASHBOARD && data && file && (
          <div className="h-full flex flex-col lg:flex-row p-4 gap-4">
            {/* Sidebar Navigation (Mobile: Top bar, Desktop: Sidebar) */}
            <aside className="lg:w-64 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-row lg:flex-col p-2 lg:p-4 gap-2 flex-shrink-0 justify-center lg:justify-start">
              <button
                onClick={() => setActiveView('notes')}
                className={`flex-1 lg:flex-none flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all
                  ${activeView === 'notes' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                <span className="hidden sm:inline lg:inline">Notes & Maps</span>
              </button>
              
              <button
                onClick={() => setActiveView('assessment')}
                className={`flex-1 lg:flex-none flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all
                  ${activeView === 'assessment' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline lg:inline">Assessment</span>
              </button>

              <button
                onClick={() => setActiveView('chat')}
                className={`flex-1 lg:flex-none flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all
                  ${activeView === 'chat' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <span className="hidden sm:inline lg:inline">AI Tutor</span>
              </button>
            </aside>

            {/* Dashboard Content Area */}
            <section className="flex-1 h-[calc(100vh-8rem)] lg:h-auto min-h-0">
              {activeView === 'notes' && <NotesView notes={data.notes} />}
              {activeView === 'assessment' && <AssessmentView questions={data.assessments} />}
              {activeView === 'chat' && <ChatView file={file} apiKey={apiKey} />}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
