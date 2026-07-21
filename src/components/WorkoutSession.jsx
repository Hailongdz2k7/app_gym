import React, { useState } from "react";
import { ArrowLeft, RefreshCw, Eye, CheckCircle2, ChevronRight, Play, Award, Dumbbell, History, Plus, Trash2, X } from "lucide-react";
import AnatomyViewer from "./AnatomyViewer";
import RestTimer from "./RestTimer";

export default function WorkoutSession({ 
  dayKey, 
  dayName, 
  sessionExercises = [], 
  setSessionExercises,
  todaySets = {}, 
  setTodaySets,
  history = {}, 
  onBack, 
  onStartWorkoutMode,
  exercisesDb = {}
}) {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(60);

  const activeExerciseId = sessionExercises[activeExerciseIndex];
  const activeExercise = exercisesDb[activeExerciseId];

  // Tự động khởi tạo sets nếu bài tập hiện tại chưa có dữ liệu sets nào
  React.useEffect(() => {
    if (activeExerciseId && (!todaySets[activeExerciseId] || todaySets[activeExerciseId].length === 0)) {
      const defaultSets = [
        { reps: "", weight: "", completed: false },
        { reps: "", weight: "", completed: false },
        { reps: "", weight: "", completed: false }
      ];
      setTodaySets({
        ...todaySets,
        [activeExerciseId]: defaultSets
      });
    }
  }, [activeExerciseId, todaySets, setTodaySets]);


  // Lấy ngày định dạng YYYY-MM-DD
  function getTodayString() {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }

  // Tìm lịch sử tập luyện gần nhất của một bài tập để làm gợi ý Progressive Overload
  const getPreviousWorkoutValue = (exerciseId) => {
    const dates = Object.keys(history).sort().reverse();
    const todayStr = getTodayString();
    
    for (const date of dates) {
      if (date === todayStr) continue;
      const dayData = history[date];
      if (dayData && dayData.sets && dayData.sets[exerciseId]) {
        const completedSets = dayData.sets[exerciseId].filter(s => s.completed);
        if (completedSets.length > 0) {
          return completedSets.map((s, idx) => `S${idx + 1}: ${s.weight}kg x ${s.reps}`).join(" | ");
        }
      }
    }
    return "Chưa có dữ liệu tập trước";
  };

  // Cập nhật giá trị ô nhập (reps hoặc weight) cho một set cụ thể
  const handleSetChange = (exerciseId, setIndex, field, value) => {
    const newSets = { ...todaySets };
    if (!newSets[exerciseId]) return;
    newSets[exerciseId] = [...newSets[exerciseId]];
    newSets[exerciseId][setIndex] = {
      ...newSets[exerciseId][setIndex],
      [field]: value
    };
    
    setTodaySets(newSets);
  };

  // Đánh dấu hoàn thành/hủy hoàn thành một set
  const handleToggleSetComplete = (exerciseId, setIndex) => {
    const newSets = { ...todaySets };
    if (!newSets[exerciseId]) return;
    newSets[exerciseId] = [...newSets[exerciseId]];
    
    const set = newSets[exerciseId][setIndex];
    const isCompleted = !set.completed;
    
    let reps = set.reps;
    let weight = set.weight;
    
    if (isCompleted) {
      if (!reps || !weight) {
        if (setIndex > 0) {
          reps = reps || newSets[exerciseId][setIndex - 1].reps;
          weight = weight || newSets[exerciseId][setIndex - 1].weight;
        }
        reps = reps || "10";
        weight = weight || "20";
      }
    }

    newSets[exerciseId][setIndex] = {
      ...set,
      reps,
      weight,
      completed: isCompleted
    };

    setTodaySets(newSets);

    if (isCompleted) {
      setRestDuration(60);
      setShowRestTimer(true);
    }
  };

  // Thêm một set tập mới
  const handleAddSet = (exerciseId) => {
    const newSets = { ...todaySets };
    if (!newSets[exerciseId]) newSets[exerciseId] = [];
    
    const lastSet = newSets[exerciseId][newSets[exerciseId].length - 1];
    const newSet = lastSet 
      ? { reps: lastSet.reps, weight: lastSet.weight, completed: false }
      : { reps: "", weight: "", completed: false };

    newSets[exerciseId] = [...newSets[exerciseId], newSet];
    setTodaySets(newSets);
  };

  // Xóa set tập cuối cùng
  const handleRemoveSet = (exerciseId, indexToRemove) => {
    const newSets = { ...todaySets };
    if (!newSets[exerciseId] || newSets[exerciseId].length <= 1) return;
    newSets[exerciseId] = newSets[exerciseId].filter((_, idx) => idx !== indexToRemove);
    setTodaySets(newSets);
  };

  // Đổi sang bài tập tương đương (Swap Exercise)
  const handleSwapExercise = (oldId, newId) => {
    const updatedExercises = [...sessionExercises];
    updatedExercises[activeExerciseIndex] = newId;
    
    const newSets = { ...todaySets };
    if (!newSets[newId] || newSets[newId].every(s => !s.completed && !s.reps)) {
      newSets[newId] = newSets[oldId] ? [...newSets[oldId]].map(s => ({ ...s, completed: false })) : [
        { reps: "", weight: "", completed: false },
        { reps: "", weight: "", completed: false },
        { reps: "", weight: "", completed: false }
      ];
    }
    
    // Đồng bộ danh sách bài tập mới và bộ sets mới lên App state
    setSessionExercises(updatedExercises);
    setTodaySets(newSets);
    
    setShowSwapModal(false);
  };

  // Tính phần trăm hoàn thành của một bài tập cụ thể
  const getExerciseProgress = (exId) => {
    const sets = todaySets[exId] || [];
    if (sets.length === 0) return 0;
    const completed = sets.filter(s => s.completed).length;
    return Math.round((completed / sets.length) * 100);
  };

  // Tính phần trăm hoàn thành tổng thể của buổi tập
  const getOverallProgress = () => {
    let totalSets = 0;
    let completedSets = 0;
    
    sessionExercises.forEach(exId => {
      const sets = todaySets[exId] || [];
      totalSets += sets.length;
      completedSets += sets.filter(s => s.completed).length;
    });

    if (totalSets === 0) return 0;
    return Math.round((completedSets / totalSets) * 100);
  };

  const isSessionFinished = getOverallProgress() === 100;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 pb-24 text-zinc-100">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-4 py-4 flex items-center justify-between">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-zinc-900 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-center flex-1">
          <span className="text-[10px] text-lime-400 font-bold uppercase tracking-widest">Buổi tập hiện tại</span>
          <h1 className="text-base font-black truncate max-w-[200px] mx-auto">{dayName}</h1>
        </div>
        <button 
          onClick={() => onStartWorkoutMode(activeExerciseIndex)}
          className="bg-lime-500 hover:bg-lime-400 text-zinc-950 px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1 shadow-lg shadow-lime-500/10 active:scale-95 transition-all"
        >
          <Play size={12} fill="currentColor" /> TẬP NHANH
        </button>
      </header>

      {/* OVERALL PROGRESS */}
      <div className="bg-zinc-900/40 border-b border-zinc-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell size={16} className="text-lime-400" />
          <span className="text-xs font-medium text-zinc-400">Tiến độ buổi tập:</span>
        </div>
        <div className="flex items-center gap-3 w-1/2">
          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-lime-400 h-full transition-all duration-500 rounded-full" 
              style={{ width: `${getOverallProgress()}%` }}
            ></div>
          </div>
          <span className="text-xs font-black text-lime-400 font-mono w-8 text-right">{getOverallProgress()}%</span>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full px-4 pt-4 flex flex-col md:flex-row gap-6">
        
        {/* CỘT TRÁI: DANH SÁCH BÀI TẬP */}
        <div className="w-full md:w-1/3 flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar md:overflow-visible pb-2 md:pb-0">
          {sessionExercises.map((exId, index) => {
            const ex = exercisesDb[exId];
            if (!ex) return null;
            const isActive = index === activeExerciseIndex;
            const progress = getExerciseProgress(exId);
            
            return (
              <button
                key={exId}
                onClick={() => setActiveExerciseIndex(index)}
                className={`flex-shrink-0 flex items-center justify-between gap-3 p-3 rounded-2xl border text-left transition-all ${
                  isActive 
                    ? "bg-zinc-900 border-lime-400/50 shadow-lg shadow-lime-400/5" 
                    : "bg-zinc-900/40 border-zinc-900 hover:border-zinc-800"
                } w-[220px] md:w-full`}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Bài {index + 1}</span>
                  <span className="text-xs font-bold truncate text-zinc-200 mt-0.5">{ex.name.split(" (")[0]}</span>
                  <span className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> {ex.machine}
                  </span>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  {progress === 100 ? (
                    <CheckCircle2 size={18} className="text-lime-400" />
                  ) : (
                    <span className="text-[10px] font-mono text-zinc-500 font-black">{progress}%</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* CỘT PHẢI / CHI TIẾT BÀI TẬP ĐANG CHỌN */}
        {activeExercise && (
          <div className="flex-1 flex flex-col gap-5">
            {/* THÔNG TIN BÀI TẬP */}
            <div className="bg-zinc-900 border border-zinc-900 rounded-3xl p-5 shadow-xl">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="text-[10px] font-bold text-lime-400 uppercase tracking-widest bg-lime-400/10 px-2.5 py-0.5 rounded-full">
                    {activeExercise.primaryMuscle}
                  </span>
                  <h2 className="text-lg font-black text-white mt-1.5 leading-snug">{activeExercise.name}</h2>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-400"></span> Thiết bị: {activeExercise.machine}
                  </p>
                </div>
                
                {/* Nút Đổi bài tập */}
                <button 
                  onClick={() => setShowSwapModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all border border-zinc-800 hover:border-zinc-700"
                  title="Đổi bài tập tương đương"
                >
                  <RefreshCw size={12} /> Đổi bài
                </button>
              </div>

              {/* Gợi ý Progressive Overload */}
              <div className="bg-zinc-950/60 rounded-xl p-3 border border-zinc-900 flex items-start gap-2.5 mb-5">
                <History size={15} className="text-zinc-500 mt-0.5" />
                <div className="flex-1">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Mức tạ buổi trước (Progressive Overload)</span>
                  <p className="text-xs font-bold text-lime-400/90 mt-0.5">{getPreviousWorkoutValue(activeExerciseId)}</p>
                </div>
              </div>

              {/* BẢNG NHẬP SETS */}
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] text-zinc-500 font-black uppercase tracking-wider px-2 pb-1">
                  <span className="col-span-2 text-center">Set</span>
                  <span className="col-span-4 text-center">Số Reps</span>
                  <span className="col-span-4 text-center">Mức tạ (Kg)</span>
                  <span className="col-span-2 text-center">Lưu</span>
                </div>

                {(todaySets[activeExerciseId] || []).map((set, idx) => (
                  <div 
                    key={idx} 
                    className={`grid grid-cols-12 gap-2 items-center p-1.5 rounded-xl transition-all border ${
                      set.completed 
                        ? "bg-lime-400/5 border-lime-400/10" 
                        : "bg-zinc-950/30 border-zinc-950"
                    }`}
                  >
                    {/* Số Set */}
                    <div className="col-span-2 text-center flex flex-col justify-center items-center">
                      <span className={`text-xs font-mono font-black w-6 h-6 flex items-center justify-center rounded-full ${
                        set.completed ? "bg-lime-400 text-zinc-950" : "bg-zinc-800 text-zinc-400"
                      }`}>
                        {idx + 1}
                      </span>
                    </div>

                    {/* Số Reps */}
                    <div className="col-span-4">
                      <input 
                        type="number" 
                        placeholder="Reps"
                        value={set.reps}
                        onChange={(e) => handleSetChange(activeExerciseId, idx, "reps", e.target.value)}
                        disabled={set.completed}
                        className="w-full text-center bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-1 text-sm font-bold font-mono focus:border-lime-400 focus:outline-none disabled:opacity-50 disabled:bg-zinc-950"
                      />
                    </div>

                    {/* Mức Tạ (Kg) */}
                    <div className="col-span-4">
                      <input 
                        type="number" 
                        placeholder="Kg"
                        value={set.weight}
                        onChange={(e) => handleSetChange(activeExerciseId, idx, "weight", e.target.value)}
                        disabled={set.completed}
                        className="w-full text-center bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-1 text-sm font-bold font-mono focus:border-lime-400 focus:outline-none disabled:opacity-50 disabled:bg-zinc-950"
                      />
                    </div>

                    {/* Checkbox hoàn thành */}
                    <div className="col-span-2 flex justify-center">
                      <button 
                        onClick={() => handleToggleSetComplete(activeExerciseId, idx)}
                        className={`p-2 rounded-xl transition-all ${
                          set.completed 
                            ? "text-lime-400 bg-lime-400/15" 
                            : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800"
                        }`}
                      >
                        <CheckCircle2 size={20} fill={set.completed ? "currentColor" : "none"} className={set.completed ? "text-zinc-950 fill-lime-400" : ""} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* NÚT THÊM / XÓA SET */}
              <div className="flex justify-between mt-4 border-t border-zinc-900 pt-4">
                <button 
                  onClick={() => handleRemoveSet(activeExerciseId, (todaySets[activeExerciseId] || []).length - 1)}
                  disabled={(todaySets[activeExerciseId] || []).length <= 1}
                  className="flex items-center gap-1 text-zinc-500 hover:text-red-400 disabled:opacity-40 disabled:hover:text-zinc-500 text-xs font-bold transition-colors py-1 px-2 rounded-lg hover:bg-zinc-800/40"
                >
                  <Trash2 size={12} /> Bớt Set
                </button>
                <button 
                  onClick={() => handleAddSet(activeExerciseId)}
                  className="flex items-center gap-1 text-lime-400 hover:text-lime-300 text-xs font-bold transition-colors py-1 px-2.5 rounded-lg bg-lime-400/10 hover:bg-lime-400/20"
                >
                  <Plus size={12} /> Thêm Set
                </button>
              </div>
            </div>

            {/* MÔ PHỎNG 3D/VẼ CƠ BẮP & HƯỚNG DẪN */}
            <div className="bg-zinc-900 border border-zinc-900 rounded-3xl p-5 shadow-xl flex flex-col items-center">
              <h3 className="text-sm font-black text-white w-full border-b border-zinc-800 pb-3 flex items-center gap-2 mb-4">
                <Eye size={16} className="text-lime-400" /> Bản đồ cơ & Hướng dẫn
              </h3>

              <AnatomyViewer 
                targetMuscles={activeExercise.targetMuscles} 
                secondaryMuscles={activeExercise.secondaryMuscles} 
              />

              {/* Hướng dẫn tập chi tiết */}
              <div className="w-full mt-4 text-left">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Các bước thực hiện</span>
                <ol className="flex flex-col gap-2.5">
                  {activeExercise.instructions.map((step, sIdx) => (
                    <li key={sIdx} className="flex gap-2.5 text-xs text-zinc-300 leading-relaxed">
                      <span className="w-5 h-5 flex-shrink-0 rounded-full bg-zinc-800 text-zinc-400 font-mono font-bold text-[10px] flex items-center justify-center">
                        {sIdx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* BẤM CHUYỂN BÀI TIẾP THEO */}
            <div className="flex justify-end gap-3 mt-2">
              {activeExerciseIndex < sessionExercises.length - 1 ? (
                <button
                  onClick={() => setActiveExerciseIndex(activeExerciseIndex + 1)}
                  className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-2xl text-sm transition-all"
                >
                  Bài tiếp theo <ChevronRight size={16} />
                </button>
              ) : (
                isSessionFinished && (
                  <div className="bg-lime-400/10 border border-lime-400/20 rounded-2xl p-4 w-full text-center flex flex-col items-center gap-2">
                    <Award size={32} className="text-lime-400 animate-bounce" />
                    <h4 className="text-sm font-black text-white">Buổi tập hoàn thành!</h4>
                    <p className="text-xs text-zinc-400">Bạn đã hoàn thành 100% mục tiêu của ngày hôm nay. Hãy nghỉ ngơi!</p>
                    <button 
                      onClick={onBack}
                      className="mt-2 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-black text-xs py-2 px-5 rounded-xl transition-all"
                    >
                      Về màn hình chính
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL ĐỔI BÀI TẬP (SWAP EXERCISE) */}
      {showSwapModal && activeExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm flex flex-col shadow-2xl relative">
            <button 
              onClick={() => setShowSwapModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="text-sm font-black text-white mb-1.5 flex items-center gap-1.5">
              <RefreshCw size={16} className="text-lime-400" /> Đổi bài tập tương đương
            </h3>
            <p className="text-xs text-zinc-400 mb-4 leading-normal">
              Đổi bài tập <span className="text-zinc-200 font-bold">"{activeExercise.name.split(" (")[0]}"</span> sang bài tập tác động cùng nhóm cơ dưới đây:
            </p>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto no-scrollbar pr-1">
              {activeExercise.swapSuggestions.map(swapId => {
                const swapEx = exercisesDb[swapId];
                if (!swapEx) return null;
                return (
                  <button
                    key={swapId}
                    onClick={() => handleSwapExercise(activeExerciseId, swapId)}
                    className="flex flex-col p-3 rounded-2xl bg-zinc-950/60 border border-zinc-900 hover:border-lime-400/50 text-left transition-all hover:bg-zinc-900"
                  >
                    <span className="text-xs font-bold text-zinc-200">{swapEx.name}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold mt-1">Máy: {swapEx.machine}</span>
                  </button>
                );
              })}
              {activeExercise.swapSuggestions.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-4">Không có bài tập thay thế tương đương phù hợp.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REST TIMER COMPONENT */}
      {showRestTimer && (
        <RestTimer 
          duration={restDuration} 
          onClose={() => setShowRestTimer(false)}
          onFinished={() => setShowRestTimer(false)}
        />
      )}
    </div>
  );
}
