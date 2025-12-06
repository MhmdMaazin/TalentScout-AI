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
      <nav className={`fixed top-4 md:top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${state.view === 'landing' ? 'w-11/12 md:w-11/12 md:max-w-3xl px-4 md:px-0' : 'w-full px-8'}`}>
        {state.view === 'landing' ? (
          <div className="flex items-center justify-between px-4 md:px-8 h-14 md:h-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl gap-2 md:gap-8">
            <div className="cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0" onClick={() => handleReset()}>
              <img src="/Assets/Talentscout AI logo.png" alt="TalentScout AI" className="h-20 md:h-28 w-auto object-contain" />
            </div>
            {/* <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-white/80 hover:text-white transition-colors">How it works</a>
            </div> */}
            <button onClick={handleStart} className="text-xs md:text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 px-4 md:px-6 py-2 md:py-2.5 rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95 flex-shrink-0">
              Get Started
            </button>
          </div>
        ) : (
          <div className="w-full flex justify-between items-center px-8 h-20">
            <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleReset()}>
              <img src="/Assets/Talentscout AI logo.png" alt="TalentScout AI" className="h-32 w-auto object-contain" />
            </div>
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-4 py-2 rounded-full border border-orange-200 shadow-sm">
              ⚡ Artificial Intelligence (AI) Active
            </span>
          </div>
        )}
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