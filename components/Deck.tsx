import React, { useRef, useState, useEffect } from 'react';
import { Upload, Play, Pause, Disc, RotateCcw, Activity, Music2 } from 'lucide-react';
import { engine, DeckEngine } from '../services/audioEngine';
import { DeckState } from '../types';
import Knob from './Knob';
import Visualizer from './Visualizer';

interface DeckProps {
  id: 'A' | 'B';
  deckState: DeckState;
  setDeckState: (s: DeckState) => void;
}

const Deck: React.FC<DeckProps> = ({ id, deckState, setDeckState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deckEngine = id === 'A' ? engine.deckA : engine.deckB;
  const accentColor = id === 'A' ? '#06b6d4' : '#ec4899'; // Cyan vs Pink
  const ringColorClass = id === 'A' ? 'shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]' : 'shadow-[0_0_30px_-5px_rgba(236,72,153,0.3)]';

  // Sync state with engine on changes
  useEffect(() => {
    deckEngine.setVolume(deckState.volume);
    deckEngine.setRate(deckState.rate);
    deckEngine.setEQ('high', deckState.eqHigh);
    deckEngine.setEQ('mid', deckState.eqMid);
    deckEngine.setEQ('low', deckState.eqLow);
    deckEngine.setFilter(deckState.filter);
  }, [deckState, deckEngine]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const duration = await deckEngine.loadFile(file);
      setDeckState({ ...deckState, trackName: file.name.replace(/\.[^/.]+$/, ""), duration });
    }
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

  return (
    <div className="flex flex-col flex-1 hardware-surface border border-neutral-800 rounded-lg p-6 gap-6 relative shadow-2xl overflow-hidden">
      {/* Top Screw Aesthetics */}
      <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-neutral-800 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8),1px_1px_0_rgba(255,255,255,0.1)]"></div>
      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-neutral-800 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8),1px_1px_0_rgba(255,255,255,0.1)]"></div>
      
      {/* Header & Display Area */}
      <div className="led-screen rounded-md p-4 flex flex-col gap-2 relative overflow-hidden">
        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>
        
        <div className="flex justify-between items-start z-20">
            <div className="flex flex-col">
                <span className={`text-[10px] font-bold ${id === 'A' ? 'text-cyan-500' : 'text-pink-500'} tracking-widest`}>DECK {id}</span>
                <span className="text-xs text-neutral-500 font-mono mt-1">
                    {deckState.trackName ? "TRACK LOADED" : "NO DISC"}
                </span>
            </div>
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="audio/*"
            />
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] px-2 py-1 bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors uppercase tracking-wider"
            >
                Load
            </button>
        </div>

        <div className="flex justify-between items-end mt-2 z-20">
             <div className="text-neutral-400 font-mono text-sm truncate max-w-[200px]">
                {deckState.trackName || "---"}
             </div>
             <div className="font-mono text-3xl text-white font-bold tracking-tighter shadow-black drop-shadow-md">
                {deckState.duration > 0 ? formatTime(deckState.duration) : '0:00'}
             </div>
        </div>

        {/* Visualizer inside Display */}
        <div className="mt-2 opacity-80 z-20">
             <Visualizer deckEngine={deckEngine} isPlaying={deckState.isPlaying} color={accentColor} />
        </div>
      </div>

      {/* Main Jog Wheel Area */}
      <div className="flex justify-center py-4">
            <div className={`relative w-48 h-48 rounded-full bg-[#18181b] flex items-center justify-center border-4 border-[#27272a] shadow-[0_10px_30px_rgba(0,0,0,0.5)] ${deckState.isPlaying ? ringColorClass : ''} transition-all duration-700`}>
                {/* Outer Ring Detail */}
                <div className="absolute inset-0 rounded-full border border-white/5"></div>
                
                {/* Spinning Platter */}
                <div className={`w-40 h-40 rounded-full bg-[conic-gradient(var(--tw-gradient-stops))] from-neutral-800 via-black to-neutral-800 shadow-inner flex items-center justify-center ${deckState.isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                    {/* Inner Label */}
                    <div className="w-16 h-16 rounded-full bg-black border border-neutral-700 flex items-center justify-center">
                        <Music2 className={`w-6 h-6 ${id === 'A' ? 'text-cyan-600' : 'text-pink-600'}`} />
                    </div>
                </div>
            </div>
      </div>

      {/* Controls Grid */}
      <div className="flex flex-col gap-4">
        
        {/* EQs */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-black/20 rounded-lg border border-white/5">
             <Knob label="High" value={deckState.eqHigh} min={-12} max={12} onChange={(v) => setDeckState({...deckState, eqHigh: v})} color={id === 'A' ? 'cyan' : 'violet'} size="sm" />
             <Knob label="Mid" value={deckState.eqMid} min={-12} max={12} onChange={(v) => setDeckState({...deckState, eqMid: v})} color={id === 'A' ? 'cyan' : 'violet'} size="sm" />
             <Knob label="Low" value={deckState.eqLow} min={-12} max={12} onChange={(v) => setDeckState({...deckState, eqLow: v})} color={id === 'A' ? 'cyan' : 'violet'} size="sm" />
             <div className="border-l border-white/10 pl-2">
                 <Knob label="Filter" value={deckState.filter} min={-100} max={100} onChange={(v) => setDeckState({...deckState, filter: v})} color="yellow" size="sm" />
             </div>
        </div>

        {/* Transport & Pitch */}
        <div className="flex items-end justify-between gap-4">
            <div className="flex gap-3">
                 <button 
                    onClick={handleCue}
                    className="w-16 h-16 rounded-full bg-gradient-to-b from-neutral-700 to-neutral-800 shadow-[0_4px_0_rgb(23,23,23),0_5px_10px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 transition-all flex flex-col items-center justify-center border border-neutral-600 group"
                >
                    <span className="text-[10px] font-bold text-neutral-400 group-hover:text-orange-400">CUE</span>
                </button>
                <button 
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full bg-gradient-to-b from-neutral-700 to-neutral-800 shadow-[0_4px_0_rgb(23,23,23),0_5px_10px_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-1 transition-all flex flex-col items-center justify-center border border-neutral-600 group"
                >
                    {deckState.isPlaying ? 
                        <Pause className={`w-6 h-6 ${id === 'A' ? 'text-cyan-400' : 'text-pink-400'} drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]`} /> : 
                        <Play className="w-6 h-6 text-green-500 group-hover:drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                    }
                </button>
            </div>

            {/* Pitch Fader */}
            <div className="flex-1 h-20 bg-[#121212] rounded border border-neutral-800 relative flex items-center px-4">
                 <div className="absolute top-1/2 left-4 right-4 h-1 bg-[#27272a] rounded-full"></div>
                 {/* Center Detent */}
                 <div className="absolute top-1/2 left-1/2 w-0.5 h-3 bg-neutral-600 -translate-y-1/2 -translate-x-1/2"></div>
                 
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
                    className="absolute w-8 h-12 bg-gradient-to-b from-[#3f3f46] to-[#18181b] border border-neutral-900 rounded shadow-lg pointer-events-none flex items-center justify-center z-10"
                    style={{ left: `${((deckState.rate - 0.92) / (1.08 - 0.92)) * (100 - 15)}%` }} // approximate centering
                >
                    <div className="w-full h-0.5 bg-white opacity-50"></div>
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