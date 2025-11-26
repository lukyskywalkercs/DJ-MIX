import React, { useState, useEffect, useRef } from 'react';

interface KnobProps {
  value: number;
  min: number;
  max: number;
  onChange: (val: number) => void;
  label: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Knob: React.FC<KnobProps> = ({ value, min, max, onChange, label, color = 'cyan', size = 'md' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startVal, setStartVal] = useState(0);
  const knobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const deltaY = startY - e.clientY;
      const range = max - min;
      const deltaVal = (deltaY / 200) * range;
      let newVal = startVal + deltaVal;
      newVal = Math.max(min, Math.min(max, newVal));
      onChange(newVal);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startVal, min, max, onChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartVal(value);
  };

  const percentage = (value - min) / (max - min);
  const rotation = -135 + percentage * 270;

  const sizePx = size === 'sm' ? 40 : size === 'lg' ? 80 : 56;
  
  // Colors for the LED ring
  let activeColor = '#06b6d4'; // Cyan default
  if(color === 'violet') activeColor = '#ec4899'; // Pink/Magenta for Deck B
  if(color === 'rose') activeColor = '#f43f5e';
  if(color === 'yellow') activeColor = '#eab308';

  return (
    <div className="flex flex-col items-center gap-2 select-none group">
      <div className="relative flex items-center justify-center">
        {/* LED Ring SVG */}
        <svg width={sizePx + 16} height={sizePx + 16} className="absolute pointer-events-none transform rotate-90">
            <circle 
                cx={(sizePx + 16)/2} cy={(sizePx + 16)/2} r={(sizePx/2) + 4} 
                fill="none" 
                stroke="#27272a" 
                strokeWidth="3"
                strokeDasharray={`${(sizePx/2 + 4) * 2 * Math.PI}`}
                strokeDashoffset="0"
            />
             {/* Active Arc - Using dasharray/offset trick for partial circle */}
             <circle 
                cx={(sizePx + 16)/2} cy={(sizePx + 16)/2} r={(sizePx/2) + 4} 
                fill="none" 
                stroke={activeColor} 
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(sizePx/2 + 4) * 2 * Math.PI}`}
                strokeDashoffset={`${((sizePx/2 + 4) * 2 * Math.PI) * (1 - (percentage * 0.75))}`} // 0.75 because 270 degrees is 75% of 360
                className="opacity-80 drop-shadow-[0_0_4px_rgba(255,255,255,0.3)]"
                transform={`rotate(135 ${(sizePx + 16)/2} ${(sizePx + 16)/2})`}
            />
        </svg>

        {/* Knob Body */}
        <div 
            ref={knobRef}
            className="rounded-full metal-knob relative cursor-ns-resize transition-transform active:scale-95 z-10"
            style={{ 
                width: sizePx, 
                height: sizePx, 
                transform: `rotate(${rotation}deg)` 
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Knob Marker */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1/3 bg-white rounded-full shadow-[0_0_5px_white]" />
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <span className="font-sans text-[10px] font-bold text-neutral-500 group-hover:text-neutral-300 transition-colors uppercase tracking-widest">{label}</span>
      </div>
    </div>
  );
};

export default Knob;