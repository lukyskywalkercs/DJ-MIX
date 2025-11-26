import React, { useEffect, useRef } from 'react';
import { DeckEngine } from '../services/audioEngine';

interface VisualizerProps {
  deckEngine: DeckEngine;
  isPlaying: boolean;
  color: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ deckEngine, isPlaying, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = deckEngine.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      // Clear with transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isPlaying) {
         // Draw a faint center line
         ctx.beginPath();
         ctx.strokeStyle = '#27272a';
         ctx.lineWidth = 1;
         ctx.moveTo(0, canvas.height / 2);
         ctx.lineTo(canvas.width, canvas.height / 2);
         ctx.stroke();
         return;
      }

      animationRef.current = requestAnimationFrame(draw);
      deckEngine.getByteFrequencyData(dataArray);

      const barWidth = (canvas.width / bufferLength) * 2; // Make bars thinner for crisp look
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, '#ffffff');

        ctx.fillStyle = gradient;
        
        // Draw centered bars (waveform style) or bottom up? Let's do bottom up but mirrored slightly for style
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        // Reflection (opacity low)
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(x, canvas.height - barHeight - 2, barWidth - 1, 2); // Cap
        ctx.globalAlpha = 1.0;

        x += barWidth;
      }
    };

    if (isPlaying) {
        draw();
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.strokeStyle = '#333';
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, deckEngine, color]);

  return (
    <canvas 
        ref={canvasRef} 
        width={300} 
        height={48} 
        className="w-full h-12 rounded bg-black/40 border border-white/5"
    />
  );
};

export default Visualizer;