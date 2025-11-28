import React, { useState } from 'react';
import { Sparkles, BrainCircuit, ListMusic, Zap, ChevronRight, Music2, Cpu } from 'lucide-react';
import { getMixingAdvice, getTrackSuggestions } from '../services/geminiService';
import { AIAdvice, TrackSuggestion } from '../types';

interface AIAssistantProps {
  trackA: string | null;
  trackB: string | null;
  isDarkMode: boolean;
}

type Tab = 'advice' | 'suggestions';

const AIAssistant: React.FC<AIAssistantProps> = ({ trackA, trackB, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<Tab>('suggestions');
  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [suggestions, setSuggestions] = useState<TrackSuggestion[]>([]);
  const [detectedVibe, setDetectedVibe] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Theme Helpers
  const borderColor = isDarkMode ? 'border-neutral-800' : 'border-neutral-200';
  const bgColor = isDarkMode ? 'bg-[#121212]' : 'bg-white';
  const textColor = isDarkMode ? 'text-neutral-200' : 'text-neutral-800';
  const mutedText = isDarkMode ? 'text-neutral-500' : 'text-neutral-400';

  const handleGetAdvice = async () => {
    if (!trackA || !trackB) return;
    setLoading(true);
    const result = await getMixingAdvice(trackA, trackB);
    setAdvice(result);
    setLoading(false);
  };

  const handleGetSuggestions = async () => {
    setLoading(true);
    const result = await getTrackSuggestions(trackA, trackB);
    setSuggestions(result.suggestions);
    setDetectedVibe(result.detectedVibe);
    setLoading(false);
  };

  return (
    <div className={`w-full ${bgColor} border ${borderColor} rounded-xl shadow-xl overflow-hidden relative transition-colors duration-300`}>
        {/* Decorative Gemeni Header Line */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        {/* Header Section */}
        <div className={`p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b ${borderColor}`}>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 animate-pulse"></div>
                    <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center border ${isDarkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-indigo-50 border-indigo-100'}`}>
                        <Sparkles className="w-6 h-6 text-indigo-500" />
                    </div>
                </div>
                <div>
                    <h2 className={`text-lg font-bold ${textColor} tracking-tight flex items-center gap-2`}>
                        AI CO-PILOT
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold tracking-wider">GEMINI 2.5</span>
                    </h2>
                    <p className={`text-xs ${mutedText} font-medium`}>Advanced audio analysis & crate digging engine</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className={`flex p-1 rounded-lg ${isDarkMode ? 'bg-neutral-900' : 'bg-neutral-100'}`}>
                 <button
                    onClick={() => setActiveTab('suggestions')}
                    className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${
                        activeTab === 'suggestions' 
                        ? `${isDarkMode ? 'bg-neutral-800 text-cyan-400' : 'bg-white text-cyan-600 shadow-sm'}` 
                        : `${mutedText} hover:text-neutral-500`
                    }`}
                >
                    <ListMusic className="w-3.5 h-3.5" />
                    Track Discovery
                </button>
                <button
                    onClick={() => setActiveTab('advice')}
                    className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 ${
                        activeTab === 'advice' 
                        ? `${isDarkMode ? 'bg-neutral-800 text-indigo-400' : 'bg-white text-indigo-600 shadow-sm'}` 
                        : `${mutedText} hover:text-neutral-500`
                    }`}
                >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    Mix Strategy
                </button>
            </div>
        </div>

        {/* Content Body */}
        <div className={`p-6 min-h-[220px] relative ${isDarkMode ? 'bg-[#09090b]' : 'bg-neutral-50'}`}>
            {/* Background Pattern */}
            <div className={`absolute inset-0 opacity-[0.03] pointer-events-none`} style={{ backgroundImage: `radial-gradient(${isDarkMode ? '#fff' : '#000'} 1px, transparent 1px)`, backgroundSize: '24px 24px' }}></div>

            <div className="relative z-10">
                
                {/* SUGGESTIONS TAB */}
                {activeTab === 'suggestions' && (
                    <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                             <div>
                                <h3 className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Recommended Next Tracks</h3>
                                <p className="text-xs text-neutral-500">Gemini analyzes the vibe of currently loaded tracks to suggest the perfect follow-up.</p>
                             </div>
                            
                            <button 
                                onClick={handleGetSuggestions}
                                disabled={loading}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                                    loading
                                    ? 'opacity-50 cursor-not-allowed bg-neutral-500 text-white' 
                                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/20 active:scale-95'
                                }`}
                            >
                                {loading ? <Cpu className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {loading ? 'Gemini Thinking...' : 'Ask Gemini'}
                            </button>
                        </div>

                        {detectedVibe && !loading && (
                             <div className={`mb-6 p-3 rounded-lg border-l-4 border-cyan-500 flex items-start gap-3 ${isDarkMode ? 'bg-cyan-950/20' : 'bg-cyan-50'}`}>
                                <div className="mt-1"><Music2 className="w-4 h-4 text-cyan-500" /></div>
                                <div>
                                    <span className="text-[10px] font-bold text-cyan-500 uppercase">Current Vibe Analysis</span>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-cyan-100' : 'text-cyan-900'}`}>"{detectedVibe}"</p>
                                </div>
                            </div>
                        )}

                        {suggestions.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                <ListMusic className="w-12 h-12 mb-3" />
                                <p className="text-sm font-bold">Ready to analyze</p>
                                <p className="text-xs">Load tracks and press "Ask Gemini"</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {suggestions.map((track, idx) => (
                                <div key={idx} className={`group relative p-4 rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
                                    isDarkMode 
                                    ? 'bg-[#151515] border-neutral-800 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]' 
                                    : 'bg-white border-neutral-200 hover:border-cyan-400 hover:shadow-lg'
                                }`}>
                                    <div className="absolute top-4 right-4 text-[10px] font-bold bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full border border-cyan-200">
                                        {track.bpm} BPM
                                    </div>
                                    <div className={`text-xs font-mono mb-2 ${isDarkMode ? 'text-neutral-600' : 'text-neutral-400'}`}>0{idx+1} // SUGGESTION</div>
                                    
                                    <h4 className={`text-base font-bold mb-1 truncate pr-12 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{track.title}</h4>
                                    <div className={`text-sm mb-3 font-medium truncate ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>{track.artist}</div>
                                    
                                    <div className={`text-xs p-3 rounded-lg leading-relaxed ${isDarkMode ? 'bg-neutral-900/50 text-neutral-400' : 'bg-neutral-100 text-neutral-600'}`}>
                                        <span className="font-bold text-cyan-600">Why? </span>
                                        {track.reason}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ADVICE TAB */}
                {activeTab === 'advice' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className={`text-sm font-bold uppercase tracking-widest ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>Live Mixing Strategy</h3>
                                <p className="text-xs text-neutral-500">Technical advice on how to transition between the specific loaded tracks.</p>
                            </div>
                            <button 
                                onClick={handleGetAdvice}
                                disabled={loading || !trackA || !trackB}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                                    loading || !trackA || !trackB 
                                    ? 'opacity-50 cursor-not-allowed bg-neutral-500 text-white' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-95'
                                }`}
                            >
                                {loading ? 'Analyzing...' : 'Get Mix Advice'}
                            </button>
                        </div>

                         {!advice && !loading && (
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                <Zap className="w-12 h-12 mb-3" />
                                <p className="text-sm font-bold">Waiting for decks</p>
                                <p className="text-xs">Load two tracks to generate advice</p>
                            </div>
                        )}

                        {advice && !loading && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Transition Card */}
                                <div className={`p-5 rounded-xl border-l-4 border-l-pink-500 ${isDarkMode ? 'bg-[#151515] border-y border-r border-neutral-800' : 'bg-white border border-neutral-200 shadow-sm'}`}>
                                    <h3 className="text-pink-500 font-bold mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
                                        <ChevronRight className="w-4 h-4" /> Transition
                                    </h3>
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>{advice.transition}</p>
                                </div>

                                {/* Energy Card */}
                                <div className={`p-5 rounded-xl border-l-4 border-l-yellow-500 ${isDarkMode ? 'bg-[#151515] border-y border-r border-neutral-800' : 'bg-white border border-neutral-200 shadow-sm'}`}>
                                    <h3 className="text-yellow-500 font-bold mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
                                        <ChevronRight className="w-4 h-4" /> Energy
                                    </h3>
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>{advice.energy}</p>
                                </div>

                                {/* Technical Card */}
                                <div className={`p-5 rounded-xl border-l-4 border-l-cyan-500 ${isDarkMode ? 'bg-[#151515] border-y border-r border-neutral-800' : 'bg-white border border-neutral-200 shadow-sm'}`}>
                                    <h3 className="text-cyan-500 font-bold mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
                                        <ChevronRight className="w-4 h-4" /> Technical
                                    </h3>
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>{advice.technical}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default AIAssistant;