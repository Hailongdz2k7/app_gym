import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, X, Plus, Minus, Volume2, VolumeX, Bell } from "lucide-react";

export default function RestTimer({ duration = 60, onClose, onFinished }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef(null);

  // Tổng thời gian ban đầu để vẽ vòng tròn tiến độ
  const [totalDuration, setTotalDuration] = useState(duration);

  useEffect(() => {
    // Reset timer khi thay đổi duration ban đầu
    setTimeLeft(duration);
    setTotalDuration(duration);
    setIsActive(true);
  }, [duration]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
      playAlert();
      if (onFinished) onFinished();
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  // Hàm tạo tiếng bíp sử dụng Web Audio API
  const playAlert = () => {
    if (!soundEnabled) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      // Tạo một chuỗi tiếng bíp đôi
      const playBeep = (time, frequency, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = frequency;
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.5, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
        
        osc.start(time);
        osc.stop(time + duration);
      };

      const now = ctx.currentTime;
      // 3 tiếng bíp dứt khoát
      playBeep(now, 880, 0.3);
      playBeep(now + 0.4, 880, 0.3);
      playBeep(now + 0.8, 1200, 0.5);

      // Rung thiết bị nếu được hỗ trợ
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200, 100, 400]);
      }
    } catch (e) {
      console.warn("Không thể phát âm thanh: ", e);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setTimeLeft(totalDuration);
    setIsActive(true);
  };

  const adjustTime = (amount) => {
    setTimeLeft((prev) => {
      const newTime = Math.max(0, prev + amount);
      // Cập nhật totalDuration nếu cộng thêm vượt quá ban đầu
      if (newTime > totalDuration) {
        setTotalDuration(newTime);
      }
      return newTime;
    });
  };

  // Định dạng mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Tính toán vòng tròn SVG tiến độ
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = totalDuration > 0 
    ? circumference - (timeLeft / totalDuration) * circumference 
    : circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-[340px] max-w-full flex flex-col items-center shadow-2xl relative">
        {/* Nút đóng */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Nút bật/tắt âm thanh */}
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-4 left-4 text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full hover:bg-zinc-800 transition-colors"
        >
          {soundEnabled ? <Volume2 size={20} className="text-lime-400" /> : <VolumeX size={20} />}
        </button>

        <div className="flex items-center gap-1.5 text-xs text-lime-400 font-bold uppercase tracking-wider mb-6 bg-lime-400/10 px-3 py-1 rounded-full mt-2">
          <Bell size={14} className="animate-bounce" />
          <span>Thời Gian Nghỉ Ngơi</span>
        </div>

        {/* Vòng tròn đếm ngược */}
        <div className="relative w-44 h-44 flex items-center justify-center mb-6">
          <svg className="w-full h-full transform -rotate-90">
            {/* Vòng nền */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              className="stroke-zinc-800"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Vòng tiến trình */}
            <circle
              cx="88"
              cy="88"
              r={radius}
              className="stroke-lime-400 transition-all duration-1000 ease-linear"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Thời gian hiển thị ở tâm */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white tracking-wider font-mono">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-1">
              {isActive ? "Đang nghỉ" : "Tạm dừng"}
            </span>
          </div>
        </div>

        {/* Điều chỉnh thời gian nhanh */}
        <div className="flex justify-between w-full gap-4 mb-6">
          <button 
            onClick={() => adjustTime(-15)}
            className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 text-xs font-bold transition-all flex items-center justify-center gap-1"
          >
            <Minus size={12} /> 15s
          </button>
          <button 
            onClick={() => adjustTime(15)}
            className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 text-xs font-bold transition-all flex items-center justify-center gap-1"
          >
            <Plus size={12} /> 15s
          </button>
        </div>

        {/* Cụm nút điều khiển */}
        <div className="flex items-center gap-4 w-full">
          <button 
            onClick={resetTimer}
            className="p-4 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 active:scale-95 transition-all"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>

          <button 
            onClick={toggleTimer}
            className={`flex-1 py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-98 transition-all ${
              isActive 
                ? "bg-zinc-100 text-zinc-950 hover:bg-white" 
                : "bg-lime-500 text-zinc-950 hover:bg-lime-400"
            }`}
          >
            {isActive ? (
              <>
                <Pause size={18} fill="currentColor" /> Tạm dừng
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" /> Tiếp tục
              </>
            )}
          </button>
        </div>

        {/* Nút Skip */}
        <button 
          onClick={onClose}
          className="mt-6 text-zinc-400 hover:text-zinc-200 text-xs font-medium underline underline-offset-4 transition-colors"
        >
          Bỏ qua thời gian nghỉ
        </button>
      </div>
    </div>
  );
}
