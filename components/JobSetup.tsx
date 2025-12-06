import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobConfig, CandidateFile } from '../types';
import { processFile } from '../services/pdfService';

interface JobSetupProps {
  onAnalyze: (config: JobConfig, candidates: CandidateFile[]) => void;
  isProcessing: boolean;
  initialConfig?: JobConfig;
  initialCandidates?: CandidateFile[];
}

const JobSetup: React.FC<JobSetupProps> = ({ onAnalyze, isProcessing, initialConfig, initialCandidates }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [jobConfig, setJobConfig] = useState<JobConfig>({
    title: '',
    description: '',
    requiredSkills: [],
    experienceLevel: 3,
    weights: {
      skills: 40,
      experience: 30,
      fit: 30
    }
  });
  const [candidates, setCandidates] = useState<CandidateFile[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [previewFile, setPreviewFile] = useState<CandidateFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialConfig) {
      setJobConfig(initialConfig);
    }
    if (initialCandidates) {
      setCandidates(initialCandidates);
    }
  }, [initialConfig, initialCandidates]);

  const handleSkillAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!jobConfig.requiredSkills.includes(skillInput.trim())) {
        setJobConfig(prev => ({ ...prev, requiredSkills: [...prev.requiredSkills, skillInput.trim()] }));
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setJobConfig(prev => ({ ...prev, requiredSkills: prev.requiredSkills.filter(s => s !== skill) }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      if (candidates.length + filesArray.length > 10) {
        alert("You can only upload a maximum of 10 candidates at a time.");
        return;
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'];
      const validFiles = filesArray.filter(f => allowedTypes.includes(f.type));

      if (validFiles.length !== filesArray.length) {
        alert("Some files were skipped. Only PDF, JPEG, PNG, and WEBP files are allowed.");
      }

      const newFiles: CandidateFile[] = validFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        name: file.name,
        status: 'pending',
        type: file.type.includes('pdf') ? 'pdf' : 'image'
      }));

      const processedFiles = await Promise.all(newFiles.map(processFile));
      
      setCandidates(prev => [...prev, ...processedFiles]);
      
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 relative">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1 ? 'Define Role Requirements' : 'Upload Resumes'}
          </h2>
          <div className="flex gap-2">
            <div className={`h-2 w-12 rounded-full transition-colors ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`h-2 w-12 rounded-full transition-colors ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Job Title</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                    placeholder="e.g. Senior React Engineer"
                    value={jobConfig.title}
                    onChange={(e) => setJobConfig({ ...jobConfig, title: e.target.value })}
                  />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Minimum Experience: {jobConfig.experienceLevel} Years</label>
                    <input
                        type="range"
                        min="0"
                        max="15"
                        step="1"
                        className="w-full mt-4 accent-indigo-600"
                        value={jobConfig.experienceLevel}
                        onChange={(e) => setJobConfig({ ...jobConfig, experienceLevel: parseInt(e.target.value) })}
                    />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Job Description</label>
              <textarea
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                placeholder="Paste the full job description here..."
                value={jobConfig.description}
                onChange={(e) => setJobConfig({ ...jobConfig, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Required Skills</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                placeholder="Type a skill and hit Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillAdd}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {jobConfig.requiredSkills.map(skill => (
                  <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="text-indigo-600 hover:text-indigo-800">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Weights Section */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Analysis Weights (Total 100%)</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Skills Match</span>
                            <span className="font-semibold">{jobConfig.weights.skills}%</span>
                        </div>
                        <input type="range" className="w-full accent-indigo-600" min="0" max="100" value={jobConfig.weights.skills} onChange={(e) => setJobConfig({...jobConfig, weights: {...jobConfig.weights, skills: parseInt(e.target.value)}})} />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Experience</span>
                            <span className="font-semibold">{jobConfig.weights.experience}%</span>
                        </div>
                        <input type="range" className="w-full accent-indigo-600" min="0" max="100" value={jobConfig.weights.experience} onChange={(e) => setJobConfig({...jobConfig, weights: {...jobConfig.weights, experience: parseInt(e.target.value)}})} />
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Fit & Reasoning</span>
                            <span className="font-semibold">{jobConfig.weights.fit}%</span>
                        </div>
                        <input type="range" className="w-full accent-indigo-600" min="0" max="100" value={jobConfig.weights.fit} onChange={(e) => setJobConfig({...jobConfig, weights: {...jobConfig.weights, fit: parseInt(e.target.value)}})} />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!jobConfig.title || !jobConfig.description}
                className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next: Upload CVs
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
          >
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-indigo-600 text-4xl mb-3 group-hover:scale-110 transition-transform">📄</div>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Upload Candidates</h3>
              <p className="mt-1 text-sm text-gray-500">
                Click to upload PDFs or Images.<br/>
                <span className="text-xs text-gray-400">Max 10 files. Preview generated automatically.</span>
              </p>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                multiple 
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFileUpload}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {candidates.map(candidate => (
                <div key={candidate.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 relative group">
                  <div 
                    className="h-16 w-12 flex-shrink-0 bg-white border border-gray-200 rounded overflow-hidden cursor-zoom-in"
                    onClick={() => setPreviewFile(candidate)}
                  >
                    {candidate.previewUrl ? (
                        <img src={candidate.previewUrl} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Prev</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{candidate.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {candidate.type.toUpperCase()} • 
                        {candidate.status === 'done' ? <span className="text-green-600 ml-1">Ready</span> : <span className="text-amber-600 ml-1">Processing...</span>}
                    </p>
                  </div>
                  <button onClick={() => removeFile(candidate.id)} className="text-gray-400 hover:text-red-500 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                onClick={() => setStep(1)}
                className="text-sm font-semibold text-gray-600 hover:text-gray-900"
              >
                ← Back to Requirements
              </button>
              <button
                onClick={() => onAnalyze(jobConfig, candidates)}
                disabled={candidates.length === 0 || isProcessing || candidates.some(c => c.status === 'processing')}
                className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                {isProcessing ? 'Analyzing...' : 'Run AI Selection'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF/Image Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setPreviewFile(null)}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-medium">{previewFile.name}</h3>
                    <button onClick={() => setPreviewFile(null)} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-gray-100 flex justify-center">
                    {previewFile.previewUrl ? (
                         <img src={previewFile.previewUrl} alt="Full Preview" className="max-w-full shadow-md" />
                    ) : (
                        <div className="text-gray-500">Preview not available</div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default JobSetup;