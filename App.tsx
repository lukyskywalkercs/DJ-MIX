import React, { useState, useEffect } from 'react';
import Deck from './components/Deck';
import Mixer from './components/Mixer';
import AIAssistant from './components/AIAssistant';
import { DeckState } from './types';
import { DEFAULT_DECK_STATE } from './constants';
import { RadioTower, Zap, Moon, Sun, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [deckA, setDeckA] = useState<DeckState>({ ...DEFAULT_DECK_STATE, id: 'A' });
  const [deckB, setDeckB] = useState<DeckState>({ ...DEFAULT_DECK_STATE, id: 'B' });
  const [crossfader, setCrossfader] = useState(0.5);
  const [masterVolume, setMasterVolume] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Handle Theme Switching
  useEffect(() => {
    document.body.className = isDarkMode ? 'dark' : 'light';
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDarkMode ? '#09090b' : '#f4f4f5');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleDeckAVol = (v: number) => setDeckA(prev => ({ ...prev, volume: v }));
  const handleDeckBVol = (v: number) => setDeckB(prev => ({ ...prev, volume: v }));

  return (
    <div className="min-h-screen font-sans selection:bg-cyan-500/30 flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <header className={`h-16 border-b flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300 ${isDarkMode ? 'bg-[#09090b]/90 border-white/5' : 'bg-white/90 border-black/5'}`}>
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-cyan-900/20' : 'bg-cyan-100'}`}>
                <RadioTower className="w-6 h-6 text-cyan-500" />
            </div>
            <div className="flex flex-col leading-none">
                <h1 className={`text-xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                    NEXUS<span className="text-cyan-500 font-normal">.DJ</span>
                </h1>
                <span className="text-[9px] tracking-[0.3em] text-neutral-500 uppercase font-bold">PWA Console v2.0</span>
            </div>
        </div>
        
        {/* Center - Gemini Badge (Visible on desktop) */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                Powered by Gemini 2.5
            </span>
        </div>

        <div className="flex items-center gap-4">
             {/* Theme Toggle */}
             <button 
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-all ${isDarkMode ? 'bg-neutral-800 text-yellow-400 hover:bg-neutral-700' : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'}`}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
             </button>

            <div className="h-8 w-px bg-neutral-500/20 mx-2 hidden sm:block"></div>
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border bg-opacity-50 border-neutral-500/10">
                <Zap className="w-3 h-3 text-green-500 fill-green-500 animate-pulse" />
                <span className={`text-xs font-mono font-bold ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>ONLINE</span>
            </div>
        </div>
      </header>

      {/* Main Console Area */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col items-center gap-8 relative overflow-x-hidden">
        
        {/* Background Ambient Glows - Theme Aware */}
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[128px] pointer-events-none transition-opacity duration-500 ${isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-500/5'}`}></div>
        <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[128px] pointer-events-none transition-opacity duration-500 ${isDarkMode ? 'bg-pink-500/10' : 'bg-pink-500/5'}`}></div>

        {/* AI Assistant - Moved to TOP for Prominence */}
        <div className="w-full max-w-7xl z-20">
             <AIAssistant trackA={deckA.trackName} trackB={deckB.trackName} isDarkMode={isDarkMode} />
        </div>

        {/* Booth Layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full max-w-7xl z-10">
            {/* Deck A */}
            <Deck 
                id="A"
                deckState={deckA}
                setDeckState={setDeckA}
                isDarkMode={isDarkMode}
            />

            {/* Central Mixer */}
            <div className="flex-shrink-0 flex justify-center lg:pt-12">
                 <Mixer 
                    crossfader={crossfader}
                    setCrossfader={setCrossfader}
                    masterVolume={masterVolume}
                    setMasterVolume={setMasterVolume}
                    deckAVol={deckA.volume}
                    setDeckAVol={handleDeckAVol}
                    deckBVol={deckB.volume}
                    setDeckBVol={handleDeckBVol}
                    isDarkMode={isDarkMode}
                />
            </div>

            {/* Deck B */}
            <Deck 
                id="B"
                deckState={deckB}
                setDeckState={setDeckB}
                isDarkMode={isDarkMode}
            />
        </div>

      </main>
    </div>
  );
};

export default App;