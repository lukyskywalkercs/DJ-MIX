import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Music2, Disc3, FolderOpen, Globe, Radio } from 'lucide-react';
import { engine, DeckEngine } from '../services/audioEngine';
import { DeckState } from '../types';
import { DEMO_TRACKS } from '../constants';
import Knob from './Knob';
import Visualizer from './Visualizer';

interface DeckProps {
  id: 'A' | 'B';
  deckState: DeckState;
  setDeckState: (s: DeckState) => void;
  isDarkMode: boolean;
}

const Deck: React.FC<DeckProps> = ({ id, deckState, setDeckState, isDarkMode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deckEngine = id === 'A' ? engine.deckA : engine.deckB;
  const accentColor = id === 'A' ? '#06b6d4' : '#ec4899'; // Cyan vs Pink
  const ringColorClass = id === 'A' ? 'shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]' : 'shadow-[0_0_30px_-5px_rgba(236,72,153,0.3)]';
  
  const [loadMode, setLoadMode] = useState<'file' | 'url' | 'demo'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync state with engine on changes
  useEffect(() => {
    deckEngine.setVolume(deckState.volume);
    deckEngine.setRate(deckState.rate);
    deckEngine.setEQ('high', deckState.eqHigh);
    deckEngine.setEQ('mid', deckState.eqMid);
    deckEngine.setEQ('low', deckState.eqLow);
    deckEngine.setFilter(deckState.filter);
    // New Pro FX
    deckEngine.setDrive(deckState.drive || 0);
    deckEngine.setSubBass(deckState.subBass || 0);
  }, [deckState, deckEngine]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      const file = e.target.files[0];
      const duration = await deckEngine.loadFile(file);
      setDeckState({ ...deckState, trackName: file.name.replace(/\.[^/.]+$/, ""), duration });
      setLoading(false);
    }
  };

  const handleUrlLoad = async (url: string, name: string) => {
      setLoading(true);
      try {
          const duration = await deckEngine.loadUrl(url);
          setDeckState({ ...deckState, trackName: name, duration });
      } catch (e) {
          alert("Error loading audio. Check CORS or URL.");
      }
      setLoading(false);
  };

  const togglePlay = () => {
    engine.resume();
    if (deckState.isPlaying) {
      deckEngine.pause();
    } else {
      deckEngine.play();
    }
    setDeckState({ ...deckState, isPlaying: !deckState.isPlaying });
  };

  const handleCue = () => {
      deckEngine.pause();
      deckEngine.seek(0);
      setDeckState({ ...deckState, isPlaying: false });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const containerBorder = isDarkMode ? 'border-neutral-800' : 'border-neutral-300';
  const displayBorder = isDarkMode ? 'border-[#3f3f46]' : 'border-neutral-300';
  const textColor = isDarkMode ? 'text-neutral-400' : 'text-neutral-600';

  return (
    <div className={`flex flex-col flex-1 hardware-surface border ${containerBorder} rounded-xl p-6 gap-6 relative shadow-2xl overflow-hidden transition-all duration-300`}>
      <div className="texture-overlay"></div>
      
      {/* Screw Aesthetics */}
      <div className={`absolute top-3 left-3 w-2.5 h-2.5 rounded-full shadow-inner ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-300'}`}>
          <div className="w-full h-px bg-black/20 absolute top-1/2 -translate-y-1/2 rotate-45"></div>
      </div>
      <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full shadow-inner ${isDarkMode ? 'bg-neutral-800' : 'bg-neutral-300'}`}>
          <div className="w-full h-px bg-black/20 absolute top-1/2 -translate-y-1/2 rotate-45"></div>
      </div>
      
      {/* Header & Display Area */}
      <div className={`led-screen rounded-md p-4 flex flex-col gap-2 relative overflow-hidden transition-colors duration-300 ${isDarkMode ? '' : 'bg-[#eef2f6] shadow-inner border-neutral-300'}`}>
        {!isDarkMode && <div className="absolute inset-0 bg-white/40 pointer-events-none"></div>}
        
        {/* Scanline overlay - Only in Dark Mode for retro feel */}
        {isDarkMode && <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>}
        
        <div className="flex justify-between items-start z-20">
            <div className="flex flex-col">
                <span className={`text-[10px] font-bold ${id === 'A' ? 'text-cyan-600' : 'text-pink-600'} tracking-widest`}>DECK {id}</span>
                <span className={`text-xs font-mono mt-1 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                    {loading ? "LOADING DATA..." : (deckState.trackName ? "TRACK LOADED" : "NO DISC")}
                </span>
            </div>
             
             {/* Source Selector */}
             <div className="flex gap-1 bg-black/10 p-0.5 rounded">
                <button 
                    onClick={() => setLoadMode('file')}
                    className={`p-1.5 rounded text-[10px] transition-all ${loadMode === 'file' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                    title="Upload File"
                ><FolderOpen size={12} /></button>
                <button 
                    onClick={() => setLoadMode('url')}
                    className={`p-1.5 rounded text-[10px] transition-all ${loadMode === 'url' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                    title="Direct URL"
                ><Globe size={12} /></button>
                <button 
                    onClick={() => setLoadMode('demo')}
                    className={`p-1.5 rounded text-[10px] transition-all ${loadMode === 'demo' ? 'bg-white text-black shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                    title="Demo Tracks"
                ><Radio size={12} /></button>
             </div>
        </div>
        
        {/* Load Interface */}
        <div className="z-20 mt-1 min-h-[30px] flex items-center">
            {loadMode === 'file' && (
                <>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="audio/*"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`text-[10px] px-2 py-1 border rounded w-full text-center uppercase tracking-wider ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white' : 'bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50'}`}
                    >
                        Select Audio File
                    </button>
                </>
            )}
            {loadMode === 'url' && (
                <div className="flex w-full gap-1">
                    <input 
                        type="text" 
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/song.mp3"
                        className={`flex-1 text-[10px] px-2 py-1 border rounded outline-none ${isDarkMode ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-white border-neutral-300 text-black'}`}
                    />
                    <button 
                         onClick={() => handleUrlLoad(urlInput, "URL Track")}
                         className="px-2 py-1 bg-neutral-700 text-white text-[10px] rounded hover:bg-neutral-600"
                    >GO</button>
                </div>
            )}
            {loadMode === 'demo' && (
                <div className="flex w-full gap-1 justify-between">
                    {DEMO_TRACKS.map((t, i) => (
                        <button 
                            key={i}
                            onClick={() => handleUrlLoad(t.url, t.name)}
                            className={`flex-1 px-1 py-1 border rounded text-[9px] uppercase hover:opacity-80 truncate ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-neutral-300' : 'bg-white border-neutral-300 text-neutral-600'}`}
                        >
                            {t.genre}
                        </button>
                    ))}
                </div>
            )}
        </div>

        <div className="flex justify-between items-end mt-2 z-20">
             <div className={`font-mono text-sm truncate max-w-[180px] ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                {deckState.trackName || "---"}
             </div>
             <div className={`font-mono text-3xl font-bold tracking-tighter ${isDarkMode ? 'text-white shadow-black drop-shadow-md' : 'text-neutral-800'}`}>
                {deckState.duration > 0 ? formatTime(deckState.duration) : '0:00'}
             </div>
        </div>

        {/* Visualizer inside Display */}
        <div className="mt-2 opacity-80 z-20">
             <Visualizer deckEngine={deckEngine} isPlaying={deckState.isPlaying} color={accentColor} isDarkMode={isDarkMode} />
        </div>
    </div>

      {/* Main Jog Wheel Area */}
      <div className="flex justify-center py-4">
            <div className={`relative w-48 h-48 rounded-full flex items-center justify-center border-4 shadow-xl transition-all duration-700 ${deckState.isPlaying ? ringColorClass : ''} ${isDarkMode ? 'bg-[#18181b] border-[#27272a] shadow-[0_10px_30px_rgba(0,0,0,0.5)]' : 'bg-[#e4e4e7] border-white shadow-[0_10px_20px_rgba(0,0,0,0.1)]'}`}>
                {/* Outer Ring Detail */}
                <div className={`absolute inset-0 rounded-full border ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}></div>
                
                {/* Spinning Platter */}
                <div className={`w-40 h-40 rounded-full shadow-inner flex items-center justify-center ${deckState.isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''} ${isDarkMode ? 'bg-[conic-gradient(var(--tw-gradient-stops))] from-neutral-800 via-black to-neutral-800' : 'bg-[conic-gradient(var(--tw-gradient-stops))] from-neutral-200 via-white to-neutral-200'}`}>
                    {/* Inner Label */}
                    <div className={`w-16 h-16 rounded-full border flex items-center justify-center ${isDarkMode ? 'bg-black border-neutral-700' : 'bg-white border-neutral-200'}`}>
                        {deckState.isPlaying ? <Disc3 className={`w-8 h-8 ${id === 'A' ? 'text-cyan-600' : 'text-pink-600'} animate-spin`} /> : <Music2 className={`w-6 h-6 ${id === 'A' ? 'text-cyan-600' : 'text-pink-600'}`} />}
                    </div>
                </div>
            </div>
      </div>

      {/* PRO FX Section */}
      <div className={`relative p-3 rounded-lg border flex justify-between items-center gap-2 ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-white/50 border-black/5'}`}>
          <div className="absolute -top-2 left-2 px-1 text-[9px] font-bold uppercase tracking-wider bg-transparent text-neutral-500">PRO FX CHAIN</div>
          
          <Knob label="Sub Bass" value={deckState.subBass || 0} min={0} max={10} onChange={(v) => setDeckState({...deckState, subBass: v})} color={id === 'A' ? 'cyan' : 'violet'} size="md" isDarkMode={isDarkMode} />
          
          <div className={`h-8 w-px ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>
          
          <Knob label="Drive" value={deckState.drive || 0} min={0} max={10} onChange={(v) => setDeckState({...deckState, drive: v})} color="yellow" size="md" isDarkMode={isDarkMode} />
      </div>

      {/* Controls Grid */}
      <div className="flex flex-col gap-4">
        
        {/* EQs */}
        <div className={`grid grid-cols-4 gap-2 p-3 rounded-lg border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-neutral-100 border-neutral-200'}`}>
             <Knob label="High" value={deckState.eqHigh} min={-12} max={12} onChange={(v) => setDeckState({...deckState, eqHigh: v})} color={id === 'A' ? 'cyan' : 'violet'} size="sm" isDarkMode={isDarkMode} />
             <Knob label="Mid" value={deckState.eqMid} min={-12} max={12} onChange={(v) => setDeckState({...deckState, eqMid: v})} color={id === 'A' ? 'cyan' : 'violet'} size="sm" isDarkMode={isDarkMode} />
             <Knob label="Low" value={deckState.eqLow} min={-12} max={12} onChange={(v) => setDeckState({...deckState, eqLow: v})} color={id === 'A' ? 'cyan' : 'violet'} size="sm" isDarkMode={isDarkMode} />
             <div className={`border-l pl-2 ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}>
                 <Knob label="Filter" value={deckState.filter} min={-100} max={100} onChange={(v) => setDeckState({...deckState, filter: v})} color="yellow" size="sm" isDarkMode={isDarkMode} />
             </div>
        </div>

        {/* Transport & Pitch */}
        <div className="flex items-end justify-between gap-4">
            <div className="flex gap-3">
                 <button 
                    onClick={handleCue}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all flex flex-col items-center justify-center border group ${isDarkMode ? 'bg-gradient-to-b from-neutral-700 to-neutral-800 border-neutral-600 shadow-neutral-900' : 'bg-gradient-to-b from-white to-neutral-100 border-neutral-300'}`}
                >
                    <span className="text-[10px] font-bold text-neutral-400 group-hover:text-orange-400">CUE</span>
                </button>
                <button 
                    onClick={togglePlay}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all flex flex-col items-center justify-center border group ${isDarkMode ? 'bg-gradient-to-b from-neutral-700 to-neutral-800 border-neutral-600 shadow-neutral-900' : 'bg-gradient-to-b from-white to-neutral-100 border-neutral-300'}`}
                >
                    {deckState.isPlaying ? 
                        <Pause className={`w-6 h-6 ${id === 'A' ? 'text-cyan-400' : 'text-pink-400'} drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]`} /> : 
                        <Play className="w-6 h-6 text-green-500 group-hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                    }
                </button>
            </div>

            {/* Pitch Fader */}
            <div className={`flex-1 h-16 md:h-20 rounded border relative flex items-center px-4 ${isDarkMode ? 'bg-[#121212] border-neutral-800' : 'bg-neutral-200 border-neutral-300'}`}>
                 <div className={`absolute top-1/2 left-4 right-4 h-1 rounded-full ${isDarkMode ? 'bg-[#27272a]' : 'bg-neutral-400'}`}></div>
                 {/* Center Detent */}
                 <div className="absolute top-1/2 left-1/2 w-0.5 h-3 bg-neutral-500 -translate-y-1/2 -translate-x-1/2"></div>
                 
                 <input 
                    type="range" 
                    min="0.92" 
                    max="1.08" 
                    step="0.001" 
                    value={deckState.rate}
                    onChange={(e) => setDeckState({...deckState, rate: parseFloat(e.target.value)})}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                 {/* Visual Thumb */}
                <div 
                    className={`absolute w-8 h-12 border rounded shadow-lg pointer-events-none flex items-center justify-center z-10 ${isDarkMode ? 'bg-gradient-to-b from-[#3f3f46] to-[#18181b] border-neutral-900' : 'bg-gradient-to-b from-white to-neutral-100 border-neutral-400'}`}
                    style={{ left: `${((deckState.rate - 0.92) / (1.08 - 0.92)) * (100 - 15)}%` }} // approximate centering
                >
                    <div className={`w-full h-0.5 opacity-50 ${isDarkMode ? 'bg-white' : 'bg-black'}`}></div>
                </div>
                <div className="absolute -bottom-5 right-0 font-mono text-[10px] text-neutral-500">
                    {((deckState.rate - 1) * 100).toFixed(1)}%
                </div>
                <div className="absolute -bottom-5 left-0 font-mono text-[10px] text-neutral-500">
                   TEMPO
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Deck;