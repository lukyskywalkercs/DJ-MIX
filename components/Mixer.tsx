import React from 'react';
import { engine } from '../services/audioEngine';

interface MixerProps {
  crossfader: number;
  setCrossfader: (val: number) => void;
  masterVolume: number;
  setMasterVolume: (val: number) => void;
  deckAVol: number;
  setDeckAVol: (val: number) => void;
  deckBVol: number;
  setDeckBVol: (val: number) => void;
  isDarkMode: boolean;
}

const Mixer: React.FC<MixerProps> = ({ 
    crossfader, setCrossfader, 
    masterVolume, setMasterVolume,
    deckAVol, setDeckAVol,
    deckBVol, setDeckBVol,
    isDarkMode
}) => {
  
  const handleCrossfaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCrossfader(val);
    engine.setCrossfader(val);
  };

  // Helper for VU Meter (Static visual for now)
  const VUMeter = ({ color }: { color: string }) => (
    <div className={`flex flex-col gap-0.5 h-48 w-2 p-0.5 rounded-full border justify-end ${isDarkMode ? 'bg-black border-white/5' : 'bg-neutral-200 border-neutral-300'}`}>
         {[...Array(15)].map((_, i) => {
             let bg = 'bg-green-500';
             if (i > 10) bg = 'bg-yellow-500';
             if (i > 13) bg = 'bg-red-500';
             const isOn = Math.random() > 0.4; // Simulate activity randomly for visual flare
             return (
                 <div key={i} className={`w-full h-1.5 rounded-sm ${isOn ? bg : (isDarkMode ? 'bg-neutral-800' : 'bg-neutral-300')} transition-colors duration-75`}></div>
             )
         })}
    </div>
  );

  return (
    <div className={`w-full md:w-64 rounded-lg border p-6 flex flex-col items-center gap-8 shadow-2xl z-10 relative transition-colors duration-300 ${isDarkMode ? 'bg-[#121212] border-neutral-800' : 'bg-white border-neutral-300'}`}>
       {/* Background texture */}
       <div className={`absolute inset-0 opacity-10 pointer-events-none ${isDarkMode ? 'mix-blend-overlay' : 'mix-blend-multiply'}`} style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, #888 25%, #888 26%, transparent 27%, transparent 74%, #888 75%, #888 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #888 25%, #888 26%, transparent 27%, transparent 74%, #888 75%, #888 76%, transparent 77%, transparent)', backgroundSize: '20px 20px' }}></div>

       <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></div>
            <h3 className="text-neutral-500 font-bold tracking-[0.2em] text-xs">MIXER</h3>
       </div>
       
       {/* Channel Faders Section */}
       <div className="flex gap-6 w-full justify-center z-10">
            
            {/* Channel A */}
            <div className="flex gap-2">
                 <div className="flex flex-col items-center h-full">
                    <VUMeter color="cyan" />
                 </div>
                 <div className={`relative h-48 w-12 rounded-lg border flex justify-center ${isDarkMode ? 'bg-[#09090b] border-neutral-800' : 'bg-neutral-100 border-neutral-300'}`}>
                     <div className={`absolute top-4 bottom-4 w-1 rounded-full ${isDarkMode ? 'bg-[#18181b]' : 'bg-neutral-300'}`}></div>
                     {/* Scale lines */}
                     <div className="absolute top-4 w-3 h-px bg-neutral-500/50"></div>
                     <div className="absolute bottom-4 w-3 h-px bg-neutral-500/50"></div>
                     <div className="absolute top-1/2 w-3 h-px bg-neutral-500/50"></div>

                     <input 
                        type="range"
                        min="0" max="1" step="0.01"
                        value={deckAVol}
                        onChange={(e) => setDeckAVol(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                     />
                     <div 
                        className={`absolute w-10 h-16 border-y shadow-md rounded-sm pointer-events-none z-20 flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-t from-[#27272a] to-[#52525b] border-black' : 'bg-gradient-to-t from-neutral-200 to-white border-neutral-400'}`}
                        style={{ bottom: `${deckAVol * 70}%` }} // Adjusted range for visual fit
                     >
                         <div className="w-full h-0.5 bg-cyan-500 shadow-[0_0_5px_cyan]"></div>
                     </div>
                 </div>
            </div>

            {/* Channel B */}
            <div className="flex gap-2">
                 <div className={`relative h-48 w-12 rounded-lg border flex justify-center ${isDarkMode ? 'bg-[#09090b] border-neutral-800' : 'bg-neutral-100 border-neutral-300'}`}>
                     <div className={`absolute top-4 bottom-4 w-1 rounded-full ${isDarkMode ? 'bg-[#18181b]' : 'bg-neutral-300'}`}></div>
                     
                      {/* Scale lines */}
                     <div className="absolute top-4 w-3 h-px bg-neutral-500/50"></div>
                     <div className="absolute bottom-4 w-3 h-px bg-neutral-500/50"></div>
                     <div className="absolute top-1/2 w-3 h-px bg-neutral-500/50"></div>

                     <input 
                        type="range"
                        min="0" max="1" step="0.01"
                        value={deckBVol}
                        onChange={(e) => setDeckBVol(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                     />
                     <div 
                        className={`absolute w-10 h-16 border-y shadow-md rounded-sm pointer-events-none z-20 flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-t from-[#27272a] to-[#52525b] border-black' : 'bg-gradient-to-t from-neutral-200 to-white border-neutral-400'}`}
                        style={{ bottom: `${deckBVol * 70}%` }}
                     >
                        <div className="w-full h-0.5 bg-pink-500 shadow-[0_0_5px_magenta]"></div>
                     </div>
                 </div>
                 <div className="flex flex-col items-center h-full">
                    <VUMeter color="pink" />
                 </div>
            </div>
       </div>

       {/* Crossfader */}
       <div className="w-full mt-4 z-10">
            <div className={`p-1 rounded border shadow-inner ${isDarkMode ? 'bg-[#09090b] border-neutral-800' : 'bg-neutral-100 border-neutral-300'}`}>
                <div className={`relative h-14 rounded flex items-center px-4 ${isDarkMode ? 'bg-black/50' : 'bg-neutral-200/50'}`}>
                    {/* Track */}
                    <div className={`absolute left-4 right-4 h-1 ${isDarkMode ? 'bg-[#18181b]' : 'bg-neutral-400'}`}></div>
                    
                    <input 
                        type="range"
                        min="0" max="1" step="0.01"
                        value={crossfader}
                        onChange={handleCrossfaderChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                    />
                    
                    {/* Cap */}
                    <div 
                        className={`absolute top-1 bottom-1 w-10 border shadow-xl pointer-events-none transition-all duration-75 z-20 rounded-sm flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-b from-[#52525b] to-[#27272a] border-black' : 'bg-gradient-to-b from-white to-neutral-200 border-neutral-400'}`}
                        style={{ left: `calc(${crossfader * 100}% - 20px)` }}
                    >
                        <div className={`w-0.5 h-full ${isDarkMode ? 'bg-white/20' : 'bg-black/20'}`}></div>
                    </div>
                </div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-neutral-500 mt-2 px-2 tracking-widest uppercase">
                <span>Deck A</span>
                <span>Crossfader</span>
                <span>Deck B</span>
            </div>
       </div>
    </div>
  );
};

export default Mixer;