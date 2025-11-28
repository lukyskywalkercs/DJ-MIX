
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Download, Share2, X, Check } from 'lucide-react';
import { engine } from '../services/audioEngine';

interface RecorderProps {
  isDarkMode: boolean;
}

const Recorder: React.FC<RecorderProps> = ({ isDarkMode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = () => {
    // Resume context if needed
    engine.resume();
    
    const stream = engine.getAudioStream();
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioBlob(blob);
      setShowSaveModal(true);
    };

    mediaRecorder.start();
    setIsRecording(true);
    
    // Start Timer
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const downloadRecording = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `NexusDJ-Set-${new Date().toISOString().slice(0,10)}.webm`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    setShowSaveModal(false);
  };

  const shareToTwitter = () => {
      const text = encodeURIComponent("I just recorded a killer mix on NexusDJ! 🎧🔥 #NexusDJ #GeminiAI #WebAudio");
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
      // FB share usually requires a real URL, so we share the app URL
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <div className="flex items-center">
      {!isRecording ? (
        <button 
          onClick={startRecording}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
            isDarkMode 
              ? 'bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20' 
              : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          }`}
          title="Start Recording"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          <span className="text-xs font-bold tracking-wider">REC</span>
        </button>
      ) : (
        <button 
          onClick={stopRecording}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all animate-pulse ${
            isDarkMode 
              ? 'bg-red-500 text-white border-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
              : 'bg-red-600 text-white border-red-700 shadow-md'
          }`}
          title="Stop Recording"
        >
          <Square className="w-3 h-3 fill-current" />
          <span className="text-xs font-mono font-bold w-[40px] text-center">{formatTime(recordingTime)}</span>
        </button>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
           <div className={`w-full max-w-sm rounded-xl border p-6 shadow-2xl relative ${isDarkMode ? 'bg-[#18181b] border-neutral-700' : 'bg-white border-neutral-200'}`}>
                <button 
                    onClick={() => setShowSaveModal(false)}
                    className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-300"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                        <Check className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>Session Recorded!</h3>
                    <p className="text-sm text-neutral-500">Your mix is ready to save.</p>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={downloadRecording}
                        className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
                    >
                        <Download className="w-5 h-5" />
                        Download Audio (.webm)
                    </button>
                    
                    <div className="relative py-2">
                        <div className={`absolute inset-0 flex items-center`}><div className={`w-full border-t ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}`}></div></div>
                        <div className="relative flex justify-center"><span className={`px-2 text-xs font-medium uppercase ${isDarkMode ? 'bg-[#18181b] text-neutral-500' : 'bg-white text-neutral-400'}`}>Share</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={shareToTwitter} className={`py-2 rounded-lg border flex items-center justify-center gap-2 hover:opacity-80 transition-opacity ${isDarkMode ? 'bg-black border-neutral-700 text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-800'}`}>
                            <span className="text-xs font-bold">Twitter / X</span>
                        </button>
                        <button onClick={shareToFacebook} className={`py-2 rounded-lg border flex items-center justify-center gap-2 hover:opacity-80 transition-opacity ${isDarkMode ? 'bg-[#1877F2] border-[#1877F2] text-white' : 'bg-[#1877F2] text-white'}`}>
                            <span className="text-xs font-bold">Facebook</span>
                        </button>
                    </div>
                </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Recorder;
