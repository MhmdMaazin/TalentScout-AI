import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult, JobConfig, CandidateFile, ChatMessage, ComparisonResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { generateInterviewQuestions, generateOutreachEmail, chatWithCandidate, compareCandidates } from '../services/geminiService';

interface ResultsProps {
  results: AnalysisResult[];
  candidates: CandidateFile[]; // Needed for Chat context
  jobConfig: JobConfig;
  onReset: () => void;
  onEditConfig: () => void;
}

const Results: React.FC<ResultsProps> = ({ results, candidates, jobConfig, onReset, onEditConfig }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [blindMode, setBlindMode] = useState(false);
  
  // Selection & Comparison State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  
  // State for AI Actions
  const [activeTab, setActiveTab] = useState<'analysis' | 'actions' | 'chat'>('analysis');
  const [generatedQuestions, setGeneratedQuestions] = useState<Record<string, string>>({});
  const [generatedEmails, setGeneratedEmails] = useState<Record<string, string>>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // State for Chat
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    const loadedNotes: Record<string, string> = {};
    results.forEach(r => {
        const stored = localStorage.getItem(`ts-notes-${r.candidateId}`);
        if (stored) loadedNotes[r.candidateId] = stored;
    });
    setNotes(loadedNotes);
  }, [results]);

  const handleNoteChange = (id: string, value: string) => {
    setNotes(prev => ({ ...prev, [id]: value }));
    localStorage.setItem(`ts-notes-${id}`, value);
  };

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
        setSelectedIds(prev => prev.filter(sid => sid !== id));
    } else {
        if (selectedIds.length >= 3) {
            alert("You can compare up to 3 candidates.");
            return;
        }
        setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleRunComparison = async () => {
    if (selectedIds.length < 2) return;
    setIsComparing(true);
    setComparisonResult(null);
    
    // Filter candidate files
    const selectedCandidates = candidates.filter(c => selectedIds.includes(c.id));
    
    try {
        const result = await compareCandidates(jobConfig, selectedCandidates);
        setComparisonResult(result);
    } catch (e) {
        console.error(e);
        alert("Comparison failed. Please try again.");
        setIsComparing(false); // Close modal on error or handle gracefully
    }
  };

  const handleExportCSV = () => {
    const headers = ['Candidate Name', 'Score', 'Summary', 'Pros', 'Cons', 'Skills'];
    const rows = results.map(r => [
      r.candidateName,
      r.score.toString(),
      `"${r.matchSummary.replace(/"/g, '""')}"`,
      `"${r.pros.join('; ')}"`,
      `"${r.cons.join('; ')}"`,
      `"${r.skillsFound.join('; ')}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `candidates_ranking_${jobConfig.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateQuestions = async (result: AnalysisResult) => {
    setLoadingAction('questions');
    try {
        const questions = await generateInterviewQuestions(result.candidateName, result.cons, jobConfig.title);
        setGeneratedQuestions(prev => ({ ...prev, [result.candidateId]: questions }));
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingAction(null);
    }
  };

  const handleGenerateEmail = async (result: AnalysisResult, type: 'invite' | 'reject') => {
    setLoadingAction('email');
    try {
        const email = await generateOutreachEmail(result.candidateName, jobConfig.title, type);
        setGeneratedEmails(prev => ({ ...prev, [result.candidateId]: email }));
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingAction(null);
    }
  };

  const handleChatSubmit = async (result: AnalysisResult) => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    
    // Add user message
    const currentHistory = chatHistories[result.candidateId] || [];
    const updatedHistory: ChatMessage[] = [...currentHistory, { role: 'user', text: msg }];
    setChatHistories(prev => ({ ...prev, [result.candidateId]: updatedHistory }));
    
    // Get AI response
    // Find original candidate file to pass to service
    const candidateFile = candidates.find(c => c.id === result.candidateId);
    if (!candidateFile) return;

    setLoadingAction('chat');
    try {
        const response = await chatWithCandidate(candidateFile, jobConfig, updatedHistory, msg);
        setChatHistories(prev => ({ 
            ...prev, 
            [result.candidateId]: [...updatedHistory, { role: 'model', text: response }] 
        }));
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingAction(null);
    }
  };

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistories, expandedId, loadingAction]);

  // Sort by score descending
  const sortedResults = [...results].sort((a, b) => b.score - a.score);
  const bestCandidate = sortedResults[0];

  const getCandidateName = (name: string, index: number) => {
    return blindMode ? `Candidate #${index + 1}` : name;
  };
  
  // Helper to find result by ID
  const getResultById = (id: string) => results.find(r => r.candidateId === id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
        {/* Header & Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-4">
          <div className="w-full md:w-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Analysis Results</h2>
            <p className="mt-1 text-xs md:text-sm text-slate-400 truncate">
              Role: <span className="font-medium text-orange-400">{jobConfig.title}</span>
            </p>
          </div>
        <div className="flex flex-wrap gap-2 md:gap-3 items-center w-full md:w-auto">
            {/* Blind Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-800/50 px-2 md:px-3 py-1.5 rounded-full border border-slate-600 shadow-sm backdrop-blur-xl">
                <span className="text-xs md:text-sm text-slate-300 font-medium hidden sm:inline">Blind</span>
                <button 
                    onClick={() => setBlindMode(!blindMode)}
                    className={`relative inline-flex h-5 md:h-6 w-9 md:w-11 items-center rounded-full transition-colors focus:outline-none ${blindMode ? 'bg-orange-600' : 'bg-slate-600'}`}
                >
                    <span className={`inline-block h-3 md:h-4 w-3 md:w-4 transform rounded-full bg-white transition-transform ${blindMode ? 'translate-x-5 md:translate-x-6' : 'translate-x-0.5 md:translate-x-1'}`} />
                </button>
            </div>

             <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 md:gap-2 rounded-md bg-slate-800/50 px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-slate-300 shadow-sm ring-1 ring-inset ring-slate-600 hover:bg-slate-700/50 transition-colors backdrop-blur-xl"
            >
                <svg className="w-3 md:w-4 h-3 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span className="hidden sm:inline">Export</span>
            </button>
             <button
                onClick={onEditConfig}
                className="rounded-md bg-slate-800/50 px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-orange-400 shadow-sm ring-1 ring-inset ring-orange-500/30 hover:bg-slate-700/50 transition-colors backdrop-blur-xl"
            >
                <span className="hidden sm:inline">Adjust</span><span className="sm:hidden">Edit</span>
            </button>
            <button
                onClick={onReset}
                className="rounded-md bg-slate-800/50 px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-slate-300 shadow-sm ring-1 ring-inset ring-slate-600 hover:bg-slate-700/50 transition-colors backdrop-blur-xl"
            >
                Reset
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Main Chart Section */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Top Candidate Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl md:rounded-2xl p-4 md:p-8 text-white shadow-xl relative overflow-hidden"
          >
             {/* Decorative blob */}
             <div className="absolute top-0 right-0 w-40 md:w-64 h-40 md:h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 relative z-10">
              <div className="flex-1">
                <div className="text-orange-100 font-medium mb-1 text-xs md:text-sm">Top Match</div>
                <h1 className={`text-2xl md:text-4xl font-bold ${blindMode ? 'blur-sm select-none' : ''}`}>
                    {getCandidateName(bestCandidate.candidateName, 0)}
                </h1>
                <p className="mt-2 md:mt-4 text-orange-50 text-sm md:text-lg leading-relaxed opacity-90">
                  {bestCandidate.matchSummary}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col items-center min-w-[80px] md:min-w-[100px] flex-shrink-0">
                <span className="text-xs md:text-sm font-medium opacity-80">Score</span>
                <span className="text-3xl md:text-5xl font-bold mt-1">{bestCandidate.score}</span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 relative z-10">
              <div className="bg-white/10 rounded-lg md:rounded-xl p-3 md:p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-xs md:text-sm">
                  <span className="bg-green-300 w-2 h-2 rounded-full"></span> Strengths
                </h4>
                <ul className="list-none space-y-1 text-xs md:text-sm opacity-90">
                  {bestCandidate.pros.slice(0, 3).map((pro, i) => (
                    <li key={i}>• {pro}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 rounded-lg md:rounded-xl p-3 md:p-4">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-xs md:text-sm">
                   <span className="bg-yellow-300 w-2 h-2 rounded-full"></span> Considerations
                </h4>
                <ul className="list-none space-y-1 text-xs md:text-sm opacity-90">
                  {bestCandidate.cons.slice(0, 3).map((con, i) => (
                    <li key={i}>• {con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Ranking Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-slate-700"
          >
            <h3 className="text-base md:text-lg font-semibold text-white mb-4 md:mb-6">Candidate Comparison</h3>
            <div className="h-[250px] md:h-[300px] w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedResults} layout="vertical" margin={{ left: 80, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    type="category" 
                    dataKey="candidateName" 
                    width={70} 
                    tickFormatter={(val, index) => blindMode ? `Candidate #${sortedResults.length - index}` : val} 
                    tick={{ fontSize: 11, fill: '#cbd5e1' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', backgroundColor: '#1e293b', color: '#fff' }}
                    formatter={(value: any) => [value, 'Score']}
                    labelFormatter={(label) => blindMode ? 'Candidate' : label}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                    {sortedResults.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#f97316' : '#64748b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* List of all candidates */}
        <div className="space-y-3 md:space-y-4">
          <h3 className="text-base md:text-lg font-semibold text-white">Detailed Breakdown</h3>
          <p className="text-xs text-slate-400 -mt-2 md:-mt-3 mb-2">Check box to compare. Click card to expand.</p>
          <div className="space-y-3 md:space-y-4">
            {sortedResults.map((result, idx) => (
              <motion.div
                key={result.candidateId}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                onClick={() => {
                    setExpandedId(expandedId === result.candidateId ? null : result.candidateId);
                    setActiveTab('analysis'); // Reset tab on open
                }}
                className={`rounded-xl border transition-all cursor-pointer overflow-hidden relative ${
                  selectedIds.includes(result.candidateId) ? 'ring-2 ring-orange-500 border-orange-500 bg-slate-800/50' : 
                  idx === 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-slate-800/30 border-slate-700 hover:border-slate-600 hover:shadow-md'
                }`}
              >
                 {/* Selection Checkbox */}
                 <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                    <div 
                        onClick={(e) => toggleSelection(result.candidateId, e)}
                        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedIds.includes(result.candidateId) ? 'bg-orange-600 border-orange-600' : 'bg-slate-700 border-slate-600 hover:border-orange-500'}`}
                    >
                        {selectedIds.includes(result.candidateId) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                 </div>

                <div className="p-3 md:p-5">
                    <div className="flex justify-between items-start mb-2 pr-8 gap-2">
                        <h4 className={`font-bold text-white text-sm md:text-base truncate ${blindMode ? 'blur-sm' : ''}`}>
                            {getCandidateName(result.candidateName, idx)}
                        </h4>
                        <span className={`inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                            result.score > 80 ? 'bg-green-500/20 text-green-300' : 
                            result.score > 50 ? 'bg-yellow-500/20 text-yellow-300' : 
                            'bg-red-500/20 text-red-300'
                        }`}>
                            {result.score}%
                        </span>
                    </div>
                    
                    <p className="text-xs text-slate-300 mb-2 md:mb-3 line-clamp-2">{result.matchSummary}</p>
                    
                    <div className="flex flex-wrap gap-1">
                        {result.skillsFound.slice(0, 3).map(skill => (
                            <span key={skill} className="px-2 py-0.5 bg-slate-700/50 text-slate-300 text-[9px] md:text-[10px] rounded-md uppercase tracking-wider">
                            {skill}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Expanded Content with Tabs */}
                <AnimatePresence>
                    {expandedId === result.candidateId && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="bg-gray-50 border-t border-gray-100"
                            onClick={(e) => e.stopPropagation()} 
                        >
                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 overflow-x-auto">
                                <button 
                                    onClick={() => setActiveTab('analysis')}
                                    className={`flex-1 py-2 md:py-3 text-xs font-semibold text-center whitespace-nowrap ${activeTab === 'analysis' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    Analysis
                                </button>
                                <button 
                                    onClick={() => setActiveTab('actions')}
                                    className={`flex-1 py-2 md:py-3 text-xs font-semibold text-center whitespace-nowrap ${activeTab === 'actions' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    Actions
                                </button>
                                <button 
                                    onClick={() => setActiveTab('chat')}
                                    className={`flex-1 py-2 md:py-3 text-xs font-semibold text-center whitespace-nowrap ${activeTab === 'chat' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    Ask AI
                                </button>
                            </div>

                            <div className="p-3 md:p-5 bg-gray-50 max-h-[400px] md:max-h-[500px] overflow-y-auto">
                                {activeTab === 'analysis' && (
                                    <div className="space-y-3 md:space-y-4">
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-700 uppercase mb-2">Strengths</h5>
                                            <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                                                {result.pros.map((p, i) => <li key={i}>{p}</li>)}
                                            </ul>
                                        </div>
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-700 uppercase mb-2">Weaknesses / Gaps</h5>
                                            <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                                                {result.cons.map((c, i) => <li key={i}>{c}</li>)}
                                            </ul>
                                        </div>
                                        
                                        <div>
                                            <h5 className="text-xs font-bold text-gray-700 uppercase mb-2">Personal Notes</h5>
                                            <textarea 
                                                className="w-full text-xs p-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                rows={2}
                                                placeholder="Add your notes..."
                                                value={notes[result.candidateId] || ''}
                                                onChange={(e) => handleNoteChange(result.candidateId, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'actions' && (
                                    <div className="space-y-6">
                                        {/* Interview Generator */}
                                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex justify-between items-center mb-3">
                                                <h5 className="text-sm font-bold text-indigo-900">Smart Interview Questions</h5>
                                                <button 
                                                    onClick={() => handleGenerateQuestions(result)}
                                                    disabled={loadingAction === 'questions'}
                                                    className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors border border-indigo-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                    {loadingAction === 'questions' && <span className="animate-spin h-3 w-3 border-2 border-indigo-700 border-t-transparent rounded-full"></span>}
                                                    {loadingAction === 'questions' ? 'Generating...' : 'Generate New'}
                                                </button>
                                            </div>
                                            {loadingAction === 'questions' ? (
                                                <div className="space-y-2 animate-pulse p-3 bg-gray-50 rounded border border-gray-100">
                                                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                                                </div>
                                            ) : generatedQuestions[result.candidateId] ? (
                                                <div className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-100 leading-relaxed">
                                                    {generatedQuestions[result.candidateId]}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-500 italic">Generate questions based on candidate weaknesses to use in your interview.</p>
                                            )}
                                        </div>

                                        {/* Email Generator */}
                                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex justify-between items-center mb-3">
                                                <h5 className="text-sm font-bold text-indigo-900">Outreach Emails</h5>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleGenerateEmail(result, 'invite')}
                                                        disabled={loadingAction === 'email'}
                                                        className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-md hover:bg-green-100 transition-colors border border-green-200 flex items-center gap-1 disabled:opacity-70"
                                                    >
                                                        {loadingAction === 'email' && <span className="animate-spin h-2 w-2 border-2 border-green-700 border-t-transparent rounded-full"></span>} Invite
                                                    </button>
                                                    <button 
                                                        onClick={() => handleGenerateEmail(result, 'reject')}
                                                        disabled={loadingAction === 'email'}
                                                        className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-100 transition-colors border border-red-200 flex items-center gap-1 disabled:opacity-70"
                                                    >
                                                        {loadingAction === 'email' && <span className="animate-spin h-2 w-2 border-2 border-red-700 border-t-transparent rounded-full"></span>} Reject
                                                    </button>
                                                </div>
                                            </div>
                                            {loadingAction === 'email' ? (
                                                <div className="space-y-2 animate-pulse p-3 bg-gray-50 rounded border border-gray-100">
                                                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                                                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                                                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                                                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            ) : generatedEmails[result.candidateId] ? (
                                                <textarea 
                                                    readOnly 
                                                    className="w-full text-xs text-gray-700 bg-gray-50 p-3 rounded border border-gray-100 leading-relaxed h-32 focus:outline-none resize-none"
                                                    value={generatedEmails[result.candidateId]}
                                                />
                                            ) : (
                                                <p className="text-xs text-gray-500 italic">Generate a personalized invite or rejection email instantly.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'chat' && (
                                    <div className="h-[300px] flex flex-col">
                                        <div className="flex-1 overflow-y-auto bg-white border border-gray-200 rounded-lg p-3 space-y-3 mb-3 custom-scrollbar">
                                            {(chatHistories[result.candidateId] || []).length === 0 && (
                                                <div className="text-center text-xs text-gray-400 mt-10">
                                                    Ask anything about this candidate's experience.<br/>
                                                    e.g. "Does he have experience with AWS?"
                                                </div>
                                            )}
                                            {(chatHistories[result.candidateId] || []).map((msg, i) => (
                                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                                                        msg.role === 'user' 
                                                        ? 'bg-indigo-600 text-white rounded-br-none shadow-sm' 
                                                        : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'
                                                    }`}>
                                                        {msg.text}
                                                    </div>
                                                </div>
                                            ))}
                                            {loadingAction === 'chat' && (
                                                 <div className="flex justify-start">
                                                    <div className="bg-gray-100 text-gray-500 p-3 rounded-2xl rounded-bl-none border border-gray-200 text-xs flex items-center gap-1">
                                                        <span>Typing</span>
                                                        <span className="flex gap-1 ml-1">
                                                            <span className="animate-bounce h-1 w-1 bg-gray-400 rounded-full"></span>
                                                            <span className="animate-bounce delay-100 h-1 w-1 bg-gray-400 rounded-full"></span>
                                                            <span className="animate-bounce delay-200 h-1 w-1 bg-gray-400 rounded-full"></span>
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            <div ref={chatEndRef} />
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                className="flex-1 text-xs border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow focus:ring-2 focus:ring-offset-0"
                                                placeholder="Ask a question..."
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit(result)}
                                            />
                                            <button 
                                                onClick={() => handleChatSubmit(result)}
                                                disabled={loadingAction === 'chat' || !chatInput.trim()}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-indigo-700 disabled:bg-gray-300 transition-colors shadow-sm"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-full shadow-2xl z-40 flex items-center gap-6"
            >
                <div className="text-xs md:text-sm font-medium">
                    <span className="text-indigo-400 font-bold">{selectedIds.length}</span> selected
                </div>
                <div className="h-6 w-px bg-gray-700"></div>
                <button 
                    onClick={handleRunComparison}
                    disabled={selectedIds.length < 2}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 md:px-5 py-2 rounded-full text-xs md:text-sm font-bold shadow-lg transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center gap-1 md:gap-2"
                >
                    <span className="text-base md:text-lg">⚔️</span> <span className="hidden sm:inline">Compare</span>
                </button>
                <button 
                    onClick={() => setSelectedIds([])}
                    className="text-gray-400 hover:text-white text-xs md:text-sm"
                >
                    Clear
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      {isComparing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 md:p-4" onClick={() => setIsComparing(false)}>
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800 rounded-lg md:rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col border border-slate-700"
            >
                <div className="p-3 md:p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <h3 className="text-lg md:text-xl font-bold text-slate-200 flex items-center gap-2">
                        <span>⚔️</span> <span className="hidden sm:inline">Candidate</span> Showdown
                    </h3>
                    <button onClick={() => setIsComparing(false)} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200">✕</button>
                </div>
                
                <div className="flex-1 overflow-auto p-3 md:p-8">
                    {!comparisonResult ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                             <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                             <p className="text-gray-500 font-medium text-sm md:text-base">AI is analyzing differences...</p>
                        </div>
                    ) : (
                        <div className="space-y-4 md:space-y-8">
                           {/* Winner Banner */}
                            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-amber-100 rounded-lg md:rounded-xl p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 items-center">
                                <div className="text-4xl md:text-6xl flex-shrink-0">🏆</div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="text-amber-800 font-bold uppercase tracking-wider text-xs mb-1">Recommended Winner</div>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                        {candidates.find(c => c.id === comparisonResult.winnerId)?.name || 'Unknown Candidate'}
                                    </h2>
                                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">{comparisonResult.summary}</p>
                                </div>
                            </div>

                            {/* Comparison Matrix */}
                            <div className="overflow-x-auto rounded-lg md:rounded-xl border border-gray-200">
                                <table className="w-full text-xs md:text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                        <tr>
                                            <th className="px-2 md:px-6 py-3 md:py-4 font-bold border-b border-gray-200 bg-gray-50 sticky left-0 z-10 min-w-[100px] md:w-48">Dimension</th>
                                            {selectedIds.map(id => {
                                                const cand = candidates.find(c => c.id === id);
                                                return (
                                                    <th key={id} className="px-2 md:px-6 py-3 md:py-4 font-bold border-b border-gray-200 min-w-[120px] md:min-w-[250px]">
                                                        <div className="truncate md:truncate-none">
                                                            {cand?.name}
                                                            {id === comparisonResult.winnerId && <span className="ml-1 text-amber-500">★</span>}
                                                        </div>
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {/* Added optional chaining here to prevent crashes if dimensions is undefined */}
                                        {comparisonResult?.dimensions?.map((dim, idx) => (
                                            <tr key={idx} className="bg-white hover:bg-gray-50 transition-colors">
                                                <td className="px-2 md:px-6 py-3 md:py-4 font-semibold text-gray-900 bg-gray-50 sticky left-0 z-10 border-r border-gray-100 min-w-[100px] md:w-48">
                                                    <div className="truncate md:truncate-none text-xs md:text-sm">{dim.name}</div>
                                                </td>
                                                {selectedIds.map(id => (
                                                    <td key={id} className="px-2 md:px-6 py-3 md:py-4 text-gray-600 leading-relaxed align-top min-w-[120px] md:min-w-[250px]">
                                                        <div className="text-xs md:text-sm line-clamp-3 md:line-clamp-none">
                                                            {dim.evaluations[id] || (dim.evaluations as any)[Object.keys(dim.evaluations).find((k: string) => k.includes(id) || k === id) || ''] || '-'}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Results;