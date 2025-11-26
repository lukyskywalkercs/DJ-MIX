import React, { useState } from 'react';
import { Sparkles, BrainCircuit, RefreshCw, ListMusic, Music, Zap, Radio, ChevronRight } from 'lucide-react';
import { getMixingAdvice, getTrackSuggestions } from '../services/geminiService';
import { AIAdvice, TrackSuggestion } from '../types';

interface AIAssistantProps {
  trackA: string | null;
  trackB: string | null;
}

type Tab = 'advice' | 'suggestions';

const AIAssistant: React.FC<AIAssistantProps> = ({ trackA, trackB }) => {
  const [activeTab, setActiveTab] = useState<Tab>('advice');
  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [suggestions, setSuggestions] = useState<TrackSuggestion[]>([]);
  const [detectedVibe, setDetectedVibe] = useState<string>("");
  const [loading, setLoading] = useState(false);

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
    <div className="w-full bg-[#121212] border border-neutral-800 rounded-lg shadow-2xl overflow-hidden relative group">
        {/* Rack Mount Screws */}
        <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-neutral-700 shadow-inner"></div>
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-neutral-700 shadow-inner"></div>
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-neutral-700 shadow-inner"></div>
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-neutral-700 shadow-inner"></div>

        {/* Top Control Bar */}
        <div className="bg-[#18181b] p-4 flex flex-col md:flex-row items-center justify-between border-b border-neutral-800 gap-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded border border-indigo-500/20 flex items-center justify-center">
                    <BrainCircuit className="text-indigo-500 w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-neutral-200 tracking-wider">NEXUS AI CO-PILOT</h2>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-neutral-500 font-mono">STANDBY MODE</span>
                    </div>
                </div>
            </div>

            {/* Tab Switcher - Physical Toggle Style */}
            <div className="bg-black p-1 rounded-lg border border-white/5 flex shadow-inner">
                <button
                    onClick={() => setActiveTab('advice')}
                    className={`px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                        activeTab === 'advice' 
                        ? 'bg-neutral-800 text-indigo-400 shadow-[0_2px_4px_rgba(0,0,0,0.5)] border border-white/5' 
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                >
                    Mixing Advice
                </button>
                <div className="w-px bg-neutral-800 my-1 mx-1"></div>
                <button
                    onClick={() => setActiveTab('suggestions')}
                    className={`px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                        activeTab === 'suggestions' 
                        ? 'bg-neutral-800 text-cyan-400 shadow-[0_2px_4px_rgba(0,0,0,0.5)] border border-white/5' 
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                >
                    Track Discovery
                </button>
            </div>
        </div>

        <div className="p-6 bg-[#09090b] min-h-[250px] relative">
            {/* Grid background for technical feel */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

            {/* Content Area */}
            <div className="relative z-10">
                {activeTab === 'advice' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-neutral-500 text-xs font-mono uppercase">Transition Analysis Matrix</h3>
                            <button 
                                onClick={handleGetAdvice}
                                disabled={loading || !trackA || !trackB}
                                className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-all border border-transparent ${
                                    loading || !trackA || !trackB 
                                    ? 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] border-indigo-400/20'
                                }`}
                            >
                                {loading ? 'Computing...' : 'Analyze Decks'}
                            </button>
                        </div>

                        {!advice && !loading && (
                            <div className="flex flex-col items-center justify-center h-40 text-neutral-600 border border-dashed border-neutral-800 rounded bg-neutral-900/50">
                                <Zap className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-xs font-mono">AWAITING INPUT DATA...</p>
                            </div>
                        )}

                        {advice && !loading && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[#121212] p-4 rounded border-l-2 border-l-pink-500 border-y border-r border-neutral-800">
                                    <h3 className="text-pink-500 font-bold mb-3 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                        <ChevronRight className="w-3 h-3" /> Strategy
                                    </h3>
                                    <p className="text-sm text-neutral-400 leading-relaxed font-mono">{advice.transition}</p>
                                </div>
                                <div className="bg-[#121212] p-4 rounded border-l-2 border-l-yellow-500 border-y border-r border-neutral-800">
                                    <h3 className="text-yellow-500 font-bold mb-3 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                        <ChevronRight className="w-3 h-3" /> Energy
                                    </h3>
                                    <p className="text-sm text-neutral-400 leading-relaxed font-mono">{advice.energy}</p>
                                </div>
                                <div className="bg-[#121212] p-4 rounded border-l-2 border-l-cyan-500 border-y border-r border-neutral-800">
                                    <h3 className="text-cyan-500 font-bold mb-3 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                        <ChevronRight className="w-3 h-3" /> Tech Ops
                                    </h3>
                                    <p className="text-sm text-neutral-400 leading-relaxed font-mono">{advice.technical}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'suggestions' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-neutral-500 text-xs font-mono uppercase">Crate Digger Algorithm</h3>
                            <button 
                                onClick={handleGetSuggestions}
                                disabled={loading || (!trackA && !trackB)}
                                className={`flex items-center gap-2 px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition-all border border-transparent ${
                                    loading || (!trackA && !trackB)
                                    ? 'bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed' 
                                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_15px_rgba(8,145,178,0.4)] border-cyan-400/20'
                                }`}
                            >
                                {loading ? 'Scanning...' : 'Find Matches'}
                            </button>
                        </div>

                         {!suggestions.length && !loading && (
                            <div className="flex flex-col items-center justify-center h-40 text-neutral-600 border border-dashed border-neutral-800 rounded bg-neutral-900/50">
                                <ListMusic className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-xs font-mono">DATABASE DISCONNECTED</p>
                            </div>
                        )}

                        {detectedVibe && !loading && (
                            <div className="mb-4 flex items-center gap-3 px-4 py-2 bg-cyan-900/10 border border-cyan-500/20 rounded">
                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                                <p className="text-xs font-mono text-cyan-400 uppercase tracking-wide">
                                    DETECTED VIBE: <span className="text-neutral-300 normal-case">"{detectedVibe}"</span>
                                </p>
                            </div>
                        )}

                        {suggestions.length > 0 && !loading && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {suggestions.map((track, idx) => (
                                    <div key={idx} className="group bg-[#151515] p-4 rounded border border-neutral-800 hover:border-cyan-500/30 transition-all hover:bg-[#1a1a1a]">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-[10px] font-bold text-cyan-600 border border-cyan-900/50 px-1.5 py-0.5 rounded">
                                                {track.bpm} BPM
                                            </div>
                                            <div className="text-[9px] text-neutral-600 font-mono">ID-{idx+1}004</div>
                                        </div>
                                        <h3 className="text-sm font-bold text-white mb-0.5 truncate">{track.title}</h3>
                                        <div className="text-xs text-neutral-400 mb-3 truncate">{track.artist}</div>
                                        
                                        <p className="text-[11px] text-neutral-500 border-t border-neutral-800 pt-2 leading-tight group-hover:text-neutral-400">
                                            {track.reason}
                                        </p>
                                    </div>
                                ))}
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