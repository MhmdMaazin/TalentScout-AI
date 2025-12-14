import React, { useState } from 'react';
import { AppState, JobConfig, CandidateFile, AnalysisResult } from './types';
import Hero from './components/Hero';
import JobSetup from './components/JobSetup';
import Results from './components/Results';
import { analyzeCandidates } from './services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { DistortedGlass } from './components/ui/distorted-glass';
import { LiquidButton } from './components/animate-ui/primitives/buttons/liquid';

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white font-sans">
      {/* Navbar */}
      <nav className={`fixed top-4 md:top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${state.view === 'landing' ? 'w-11/12 md:w-11/12 md:max-w-3xl px-4 md:px-0' : 'w-full px-8'}`}>
        {state.view === 'landing' ? (
          <div className="relative rounded-full overflow-hidden">
            <DistortedGlass className="!relative !h-14 md:!h-16 !w-full !block !rounded-full" />
            <div className="absolute inset-0 z-10 flex items-center justify-between px-4 md:px-8 rounded-full gap-2 md:gap-8">
              <div className="cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0" onClick={() => handleReset()}>
                <img src="/Talentscout AI logo.png" alt="TalentScout AI" className="h-20 md:h-28 w-auto object-contain" />
              </div>
              {/* <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm font-medium text-white/80 hover:text-white transition-colors">How it works</a>
              </div> */}
              <LiquidButton 
                onClick={handleStart} 
                delay="0.3s"
                fillHeight="3px"
                hoverScale={1.05}
                tapScale={0.95}
                className="text-xs md:text-sm font-bold text-white px-4 md:px-6 py-2 md:py-2.5 rounded-lg flex-shrink-0 border-2 border-orange-500 [--liquid-button-color:#f97316] [--liquid-button-background-color:transparent] hover:text-black"
              >
                Get Started
              </LiquidButton>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 z-10 flex items-center justify-between px-4 md:px-8 py-2 rounded-full gap-2 md:gap-8">
            <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleReset()}>
              <img src="/Talentscout AI logo.png" alt="TalentScout AI" className="h-20 md:h-28 w-auto object-contain" />
            </div>
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-4 py-2 rounded-full border border-orange-200 shadow-sm hidden md:block">
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