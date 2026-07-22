// =========================================================
// components/ImageCropperModal.tsx
// Lets the user pan/zoom an uploaded image before it's saved
// as the profile picture or cover photo.
// =========================================================

import { useState, useRef } from 'react';
import { X, Crop } from 'lucide-react';

interface Props {
  src: string;
  aspect: number;
  onComplete: (dataUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropperModal({ src, aspect, onComplete, onCancel }: Props) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX - pan.x, y: clientY - pan.y });
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPan({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };

  const handleCrop = () => {
    const canvas = document.createElement('canvas');
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    const { width: cWidth, height: cHeight } = container.getBoundingClientRect();
    const baseIWidth = parseFloat(img.style.width);
    const baseIHeight = parseFloat(img.style.height);

    const exportScale = 2;
    canvas.width = cWidth * exportScale;
    canvas.height = cHeight * exportScale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(exportScale, exportScale);

    ctx.fillStyle = '#2a020b';
    ctx.fillRect(0, 0, cWidth, cHeight);

    ctx.translate(cWidth / 2, cHeight / 2);
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    ctx.drawImage(img, -baseIWidth / 2, -baseIHeight / 2, baseIWidth, baseIHeight);
    onComplete(canvas.toDataURL('image/jpeg', 0.95));
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#1a0107]/80 backdrop-blur-md px-4">
      <div className="bg-[#fdfaf5] dark:bg-zinc-900 rounded-sm p-8 md:p-10 w-full max-w-xl shadow-retro border-2 border-[#1a0107] dark:border-white">
        <div className="flex justify-between items-center mb-8 border-b-2 border-dashed border-[#1a0107]/20 pb-4">
          <h3 className="text-4xl font-serif-fraunces tracking-tighter text-[#1a0107] dark:text-white flex items-center gap-3">
            <Crop size={28} className="text-[#1a0107] dark:text-[#fca5a5]" /> Adjust Framing
          </h3>
          <button onClick={onCancel} className="text-[#1a0107] hover:text-[#1a0107]/60 transition-colors p-2 border-2 border-transparent hover:border-[#1a0107] rounded-sm bg-[#ffb6c1] shadow-[2px_2px_0px_#1a0107] hover:shadow-none hover:translate-y-[2px]">
            <X size={24} />
          </button>
        </div>

        <div
          ref={containerRef}
          className="w-full relative overflow-hidden rounded-sm bg-white dark:bg-zinc-800 shadow-inner touch-none border-2 border-[#1a0107] dark:border-zinc-700"
          style={{ aspectRatio: aspect, cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
          onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={(e) => handlePointerDown(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={() => setIsDragging(false)}
        >
          <img
            ref={imgRef}
            src={src}
            alt="Cropping View"
            draggable={false}
            className="pointer-events-none absolute top-1/2 left-1/2"
            style={{
              transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
            }}
            onLoad={(e) => {
              const target = e.target as HTMLImageElement;
              const { naturalWidth, naturalHeight } = target;
              const container = containerRef.current?.getBoundingClientRect();
              if (!container) return;
              const scaleX = container.width / naturalWidth;
              const scaleY = container.height / naturalHeight;
              const minScale = Math.max(scaleX, scaleY);
              target.style.width = `${naturalWidth * minScale}px`;
              target.style.height = `${naturalHeight * minScale}px`;
            }}
          />
        </div>

        <div className="mt-8 px-2">
          <label className="text-xs font-bold text-[#1a0107] uppercase tracking-widest block mb-4 text-center">
            Zoom Level
          </label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#1a0107]/20 dark:bg-zinc-700 rounded-sm appearance-none cursor-pointer accent-[#1a0107] dark:accent-white"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 rounded-sm font-bold text-[#1a0107] dark:text-zinc-300 bg-white dark:bg-zinc-800 border-2 border-[#1a0107] shadow-retro-sm hover:bg-[#ffb6c1] dark:hover:bg-zinc-700 transition-all hover:translate-y-1 hover:shadow-none text-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCrop}
            className="flex-1 py-4 rounded-sm font-bold text-white bg-[#1a0107] dark:bg-white dark:text-[#1a0107] hover:bg-white hover:text-[#1a0107] border-2 border-[#1a0107] shadow-retro-sm hover:translate-y-1 hover:shadow-none transition-all text-lg"
          >
            Confirm & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
