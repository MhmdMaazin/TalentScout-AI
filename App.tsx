import React, { useState } from 'react';
import { AppState, JobConfig, CandidateFile, AnalysisResult } from './types';
import Hero from './components/Hero';
import JobSetup from './components/JobSetup';
import Results from './components/Results';
import { analyzeCandidates } from './services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: 'landing',
    jobConfig: {
      title: '',
      description: '',
      requiredSkills: [],
      experienceLevel: 3,
      weights: {
        skills: 40,
        experience: 30,
        fit: 30
      }
    },
    candidates: [],
    analysisResults: []
  });

  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    setState(prev => ({ ...prev, view: 'setup' }));
  };

  const handleAnalysis = async (config: JobConfig, candidates: CandidateFile[]) => {
    setState(prev => ({ ...prev, view: 'processing', jobConfig: config, candidates }));
    setError(null);

    try {
      const results = await analyzeCandidates(config, candidates);
      setState(prev => ({ 
        ...prev, 
        view: 'results',
        analysisResults: results
      }));
    } catch (err: any) {
      console.error(err);
      setError("Failed to analyze candidates. Please check your API key and try again.");
      setState(prev => ({ ...prev, view: 'setup' }));
    }
  };

  const handleEditConfig = () => {
    // Go back to setup, keeping current config and candidates
    setState(prev => ({ ...prev, view: 'setup' }));
  };

  const handleReset = () => {
    setState({
      view: 'landing',
      jobConfig: {
        title: '',
        description: '',
        requiredSkills: [],
        experienceLevel: 3,
        weights: {
          skills: 40,
          experience: 30,
          fit: 30
        }
      },
      candidates: [],
      analysisResults: []
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 top-0 left-0 px-6 py-4 flex justify-between items-center border-b transition-all duration-300 ${state.view === 'landing' ? 'bg-white/80 border-transparent backdrop-blur-sm' : 'bg-white border-gray-100 shadow-sm'}`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleReset()}>
          <span className="text-2xl">⚡</span>
          <span className="font-bold text-xl tracking-tight text-indigo-900">TalentScout AI</span>
        </div>
        <div>
           {state.view !== 'landing' && (
             <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
               Artificial Intelligence (AI) Active
             </span>
           )}
           {state.view === 'landing' && (
             <button onClick={handleStart} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
               Get Started
             </button>
           )}
        </div>
      </nav>

      <main className={`${state.view === 'landing' ? '' : 'pt-20'}`}>
        {error && (
          <div className="max-w-4xl mx-auto mt-24 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {state.view === 'landing' && (
            <motion.div 
              key="landing"
              exit={{ opacity: 0 }}
            >
              <Hero onStart={handleStart} />
            </motion.div>
          )}

          {(state.view === 'setup' || state.view === 'processing') && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <JobSetup 
                onAnalyze={handleAnalysis} 
                isProcessing={state.view === 'processing'}
                initialConfig={state.jobConfig}
                initialCandidates={state.candidates}
              />
            </motion.div>
          )}

          {state.view === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Results 
                results={state.analysisResults} 
                candidates={state.candidates}
                jobConfig={state.jobConfig}
                onReset={handleReset}
                onEditConfig={handleEditConfig}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;