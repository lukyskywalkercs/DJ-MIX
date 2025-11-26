import React, { useState } from 'react';
import Deck from './components/Deck';
import Mixer from './components/Mixer';
import AIAssistant from './components/AIAssistant';
import { DeckState } from './types';
import { DEFAULT_DECK_STATE } from './constants';
import { RadioTower, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [deckA, setDeckA] = useState<DeckState>({ ...DEFAULT_DECK_STATE, id: 'A' });
  const [deckB, setDeckB] = useState<DeckState>({ ...DEFAULT_DECK_STATE, id: 'B' });
  const [crossfader, setCrossfader] = useState(0.5);
  const [masterVolume, setMasterVolume] = useState(1);

  const handleDeckAVol = (v: number) => setDeckA(prev => ({ ...prev, volume: v }));
  const handleDeckBVol = (v: number) => setDeckB(prev => ({ ...prev, volume: v }));

  return (
    <div className="min-h-screen text-neutral-200 font-sans selection:bg-cyan-500/30 flex flex-col">
      
      {/* Pro Audio Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#09090b]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <RadioTower className="w-6 h-6 text-cyan-500" />
            <div className="flex flex-col leading-none">
                <h1 className="text-lg font-black tracking-tighter text-white">
                    NEXUS<span className="text-cyan-500 font-normal">.DJ</span>
                </h1>
                <span className="text-[9px] tracking-[0.3em] text-neutral-500 uppercase">Pro Console AI</span>
            </div>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
                 <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">Master Out</span>
                 <div className="flex gap-0.5 mt-1">
                     <div className="w-1 h-3 bg-green-500 rounded-sm opacity-80"></div>
                     <div className="w-1 h-3 bg-green-500 rounded-sm opacity-80"></div>
                     <div className="w-1 h-3 bg-green-500 rounded-sm opacity-60"></div>
                     <div className="w-1 h-3 bg-yellow-500 rounded-sm opacity-40"></div>
                     <div className="w-1 h-3 bg-red-500 rounded-sm opacity-20"></div>
                 </div>
            </div>
            <div className="h-8 w-px bg-white/10 mx-2"></div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-mono font-bold text-neutral-300">ONLINE</span>
            </div>
        </div>
      </header>

      {/* Main Console Area */}
      <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center gap-8 relative">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-[128px] pointer-events-none"></div>

        {/* Booth Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch w-full max-w-7xl z-10">
            {/* Deck A */}
            <Deck 
                id="A"
                deckState={deckA}
                setDeckState={setDeckA}
            />

            {/* Central Mixer */}
            <div className="flex-shrink-0 flex justify-center">
                 <Mixer 
                    crossfader={crossfader}
                    setCrossfader={setCrossfader}
                    masterVolume={masterVolume}
                    setMasterVolume={setMasterVolume}
                    deckAVol={deckA.volume}
                    setDeckAVol={handleDeckAVol}
                    deckBVol={deckB.volume}
                    setDeckBVol={handleDeckBVol}
                />
            </div>

            {/* Deck B */}
            <Deck 
                id="B"
                deckState={deckB}
                setDeckState={setDeckB}
            />
        </div>

        {/* AI Assistant Module */}
        <div className="w-full max-w-7xl mt-4 z-10">
             <AIAssistant trackA={deckA.trackName} trackB={deckB.trackName} />
        </div>

      </main>
    </div>
  );
};

export default App;