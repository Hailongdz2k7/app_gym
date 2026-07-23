import React, { useState, useEffect } from "react";
import { Play, Pause, RefreshCw } from "lucide-react";

export default function ExerciseImageAnimator({ 
  images = [], 
  alt = "Bài tập",
  className = "h-48 w-full",
  autoPlay = true,
  intervalMs = 1200
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    let timer;
    if (isPlaying && images.length > 1) {
      timer = setInterval(() => {
        setCurrentIndex(prev => (prev === 0 ? 1 : 0));
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, images.length, intervalMs]);

  if (!images || images.length === 0) {
    return (
      <div className={`bg-zinc-900 flex items-center justify-center text-zinc-600 font-bold text-xs rounded-2xl ${className}`}>
        Không có hình ảnh
      </div>
    );
  }

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const img0 = images[0] || "";
  const img1 = images[1] || images[0] || "";

  const isError0 = imageErrors[0];
  const isError1 = imageErrors[1];

  return (
    <div className={`relative overflow-hidden bg-zinc-950 rounded-2xl group border border-zinc-800/80 shadow-md ${className}`}>
      
      {/* IMAGE 0 (START POSITION) */}
      <img
        src={img0}
        alt={`${alt} - Bắt đầu`}
        onError={() => handleImageError(0)}
        className={`absolute inset-0 w-full h-full object-contain p-2 transition-opacity duration-500 ease-in-out ${
          currentIndex === 0 && !isError0 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      />

      {/* IMAGE 1 (ACTION POSITION) */}
      {images.length > 1 && (
        <img
          src={img1}
          alt={`${alt} - Động tác`}
          onError={() => handleImageError(1)}
          className={`absolute inset-0 w-full h-full object-contain p-2 transition-opacity duration-500 ease-in-out ${
            currentIndex === 1 && !isError1 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
          }`}
        />
      )}

      {/* FALLBACK IF IMAGE FAILS TO LOAD */}
      {(isError0 && currentIndex === 0) || (isError1 && currentIndex === 1) ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 p-2 text-center">
          <span className="text-[10px] font-bold text-zinc-400">{alt}</span>
          <span className="text-[9px] text-zinc-600 mt-1">Hình ảnh chuyển động</span>
        </div>
      ) : null}

      {/* ANIMATION STEP BADGE & CONTROLS */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-auto z-10">
          
          {/* Step Pill */}
          <button
            type="button"
            onClick={() => setCurrentIndex(prev => (prev === 0 ? 1 : 0))}
            className="bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-lime-400 text-[9px] font-black px-2 py-1 rounded-lg shadow flex items-center gap-1 active:scale-95 transition-all"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentIndex === 0 ? "bg-lime-400 animate-ping" : "bg-emerald-400"}`}></span>
            {currentIndex === 0 ? "Tư thế 1 (Bắt đầu)" : "Tư thế 2 (Tác động)"}
          </button>

          {/* Toggle Auto-Play Button */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-6 h-6 rounded-lg bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-lime-400 flex items-center justify-center transition-all active:scale-90"
            title={isPlaying ? "Tạm dừng chuyển động" : "Tự động phát chuyển động"}
          >
            {isPlaying ? <Pause size={10} /> : <Play size={10} />}
          </button>

        </div>
      )}

    </div>
  );
}
