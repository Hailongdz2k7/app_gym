import React, { useState, useEffect } from "react";
import { X, CheckCircle2, ChevronLeft, ChevronRight, Play, Award, RefreshCw, Dumbbell, History } from "lucide-react";
import RestTimer from "./RestTimer";
import ExerciseImageAnimator from "./ExerciseImageAnimator";

export default function WorkoutMode({ 
  exercises = [], 
  todaySets = {}, 
  initialIndex = 0, 
  onClose, 
  setTodaySets,
  setSessionExercises,
  setActiveIndex,
  exercisesDb = {}
}) {
  const [activeIdx, setActiveIdx] = useState(initialIndex);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(60);

  const activeId = exercises[activeIdx];
  const activeEx = exercisesDb[activeId];
  const activeSets = todaySets[activeId] || [];

  // Tự động khởi tạo sets nếu chưa có dữ liệu cho bài tập hiện tại
  useEffect(() => {
    if (activeId && (!todaySets[activeId] || todaySets[activeId].length === 0)) {
      const defaultSets = [
        { reps: "", weight: "", completed: false },
        { reps: "", weight: "", completed: false },
        { reps: "", weight: "", completed: false }
      ];
      setTodaySets({
        ...todaySets,
        [activeId]: defaultSets
      });
    }
  }, [activeId, todaySets, setTodaySets]);

  // Đồng bộ chỉ số bài tập hiện tại lên App state khi thay đổi
  const changeActiveIndex = (newIdx) => {
    setActiveIdx(newIdx);
    if (setActiveIndex) {
      setActiveIndex(newIdx);
    }
  };

  // Lấy set tập chưa hoàn thành đầu tiên của bài tập hiện tại
  const getNextUncompletedSetIndex = () => {
    const idx = activeSets.findIndex(s => !s.completed);
    // Nếu không tìm thấy set chưa hoàn thành nào nhưng mảng có phần tử, trả về -1
    return idx;
  };

  const nextSetIdx = getNextUncompletedSetIndex();
  
  // Xác định xem bài tập hiện tại đã thực sự hoàn thành tất cả các hiệp chưa
  const isFinished = activeSets.length > 0 && activeSets.every(s => s.completed);

  // Tìm lịch sử tập luyện gần nhất của một bài tập để làm gợi ý
  const getPrevSuggestedValue = () => {
    if (activeSets.length > 0) {
      const completed = activeSets.filter(s => s.completed);
      if (completed.length > 0) {
        const last = completed[completed.length - 1];
        return `Set trước: ${last.weight}kg x ${last.reps}`;
      }
    }
    return "Hãy nhập số Kg & Reps phía dưới";
  };

  // Hoàn thành hoặc bỏ hoàn thành hiệp tập
  const handleToggleSetComplete = (setIndex) => {
    if (setIndex === -1) return;
    
    const newSets = { ...todaySets };
    if (!newSets[activeId]) return;
    newSets[activeId] = [...newSets[activeId]];
    
    const set = newSets[activeId][setIndex];
    const isCompleted = !set.completed;
    
    let reps = set.reps;
    let weight = set.weight;
    
    if (isCompleted) {
      if (!reps || !weight) {
        if (setIndex > 0) {
          reps = reps || newSets[activeId][setIndex - 1].reps;
          weight = weight || newSets[activeId][setIndex - 1].weight;
        }
        reps = reps || "10";
        weight = weight || "20";
      }
    }

    newSets[activeId][setIndex] = {
      ...set,
      reps,
      weight,
      completed: isCompleted
    };

    setTodaySets(newSets);

    if (isCompleted) {
      setShowRestTimer(true);
    }
  };

  // Cập nhật giá trị ô nhập (reps hoặc weight) cho một set cụ thể
  const handleSetChange = (setIndex, field, value) => {
    const newSets = { ...todaySets };
    if (!newSets[activeId]) return;
    newSets[activeId] = [...newSets[activeId]];
    newSets[activeId][setIndex] = {
      ...newSets[activeId][setIndex],
      [field]: value
    };
    
    setTodaySets(newSets);
  };

  // Đổi bài tập tương đương ngay trong Workout Mode
  const [showSwapModal, setShowSwapModal] = useState(false);
  const handleSwap = (oldId, newId) => {
    const updatedExercises = [...exercises];
    updatedExercises[activeIdx] = newId;

    const newSets = { ...todaySets };
    if (!newSets[newId] || newSets[newId].every(s => !s.completed && !s.reps)) {
      newSets[newId] = newSets[oldId] ? [...newSets[oldId]].map(s => ({ ...s, completed: false })) : [
        { reps: "", weight: "", completed: false },
        { reps: "", weight: "", completed: false },
        { reps: "", weight: "", completed: false }
      ];
    }

    setSessionExercises(updatedExercises);
    setTodaySets(newSets);

    setShowSwapModal(false);
  };

  // Tính phần trăm hoàn thành của cả buổi tập
  const getOverallProgress = () => {
    let total = 0;
    let completed = 0;
    exercises.forEach(id => {
      const sets = todaySets[id] || [];
      total += sets.length;
      completed += sets.filter(s => s.completed).length;
    });
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 flex flex-col text-zinc-100">
      {/* TOP PROGRESS BAR */}
      <div className="w-full bg-zinc-900/60 h-1.5 overflow-hidden">
        <div 
          className="bg-lime-400 h-full transition-all duration-500 rounded-full"
          style={{ width: `${getOverallProgress()}%` }}
        ></div>
      </div>

      {/* HEADER */}
      <header className="px-4 py-4 flex items-center justify-between border-b border-zinc-900 bg-zinc-900/10">
        <div className="flex items-center gap-2">
          <Dumbbell size={18} className="text-lime-400" />
          <span className="text-xs font-bold font-mono text-zinc-400">
            BÀI {activeIdx + 1}/{exercises.length} • TIẾN ĐỘ {getOverallProgress()}%
          </span>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <X size={18} />
        </button>
      </header>

      {/* CORE ACTIVE EXERCISE CARD */}
      <div className="flex-1 flex flex-col justify-center px-6 py-4 max-w-sm mx-auto w-full">
        {activeEx ? (
          <div className="flex flex-col text-center space-y-3">
            
            {/* ANIMATED ACTION IMAGE PREVIEW */}
            <ExerciseImageAnimator
              images={activeEx.images || [`/exercises/${activeEx.id}/0.jpg`, `/exercises/${activeEx.id}/1.jpg`]}
              alt={activeEx.nameVi || activeEx.name}
              className="h-44 w-full"
              autoPlay={true}
            />

            {/* Tên nhóm cơ chính */}
            <span className="text-xs text-lime-400 font-black uppercase tracking-widest bg-lime-400/10 self-center px-3 py-1 rounded-full">
              {activeEx.primaryMuscle}
            </span>

            {/* Tên bài tập */}
            <h1 className="text-xl font-black text-white leading-tight px-2">
              {activeEx.nameVi || activeEx.name}
            </h1>
            
            {/* Tên dụng cụ / máy tập */}
            <p className="text-xs text-zinc-400 font-semibold flex items-center justify-center gap-1.5">
              <span>{activeEx.equipment || activeEx.machine}</span>
              <button 
                onClick={() => setShowSwapModal(true)}
                className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-lime-400 transition-colors cursor-pointer"
                title="Đổi bài tập tương đương"
              >
                <RefreshCw size={14} />
              </button>
            </p>

            {/* Khu vực trạng thái Hiệp Tập Hiện Tại */}
            {activeSets.length > 0 && !isFinished ? (
              <div className="bg-zinc-900 border border-zinc-800/80 rounded-3xl p-6 shadow-2xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-lime-400 text-zinc-950 font-black text-[9px] px-3 py-0.5 rounded-bl-xl uppercase tracking-wider">
                  Hiệp đang tập
                </div>
                
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Mục tiêu hiện tại</span>
                <span className="text-3xl font-black text-white font-mono block mt-1">
                  HIỆP {nextSetIdx !== -1 ? nextSetIdx + 1 : 1}
                </span>

                {/* Form Nhập nhanh Reps & Tạ */}
                <div className="flex gap-4 items-center justify-center mt-5">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Mức tạ (Kg)</span>
                    <input 
                      type="number" 
                      placeholder="--"
                      value={activeSets[nextSetIdx !== -1 ? nextSetIdx : 0]?.weight || ""}
                      onChange={(e) => handleSetChange(nextSetIdx !== -1 ? nextSetIdx : 0, "weight", e.target.value)}
                      className="w-full text-center bg-zinc-950/80 border border-zinc-800 rounded-2xl py-3 text-xl font-bold font-mono focus:border-lime-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col items-center flex-1">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Số Reps</span>
                    <input 
                      type="number" 
                      placeholder="--"
                      value={activeSets[nextSetIdx !== -1 ? nextSetIdx : 0]?.reps || ""}
                      onChange={(e) => handleSetChange(nextSetIdx !== -1 ? nextSetIdx : 0, "reps", e.target.value)}
                      className="w-full text-center bg-zinc-950/80 border border-zinc-800 rounded-2xl py-3 text-xl font-bold font-mono focus:border-lime-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Gợi ý Set trước */}
                <p className="text-[11px] text-zinc-500 font-semibold mt-4 text-center">
                  {getPrevSuggestedValue()}
                </p>

                {/* NÚT HOÀN THÀNH SET TO LỚN */}
                <button
                  onClick={() => handleToggleSetComplete(nextSetIdx !== -1 ? nextSetIdx : 0)}
                  className="w-full mt-5 bg-lime-500 hover:bg-lime-400 active:scale-95 text-zinc-950 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-lime-500/10 transition-all text-base"
                >
                  <CheckCircle2 size={20} fill="currentColor" className="text-lime-500 fill-zinc-950" />
                  Xong Hiệp {nextSetIdx !== -1 ? nextSetIdx + 1 : 1}
                </button>
              </div>
            ) : isFinished ? (
              <div className="bg-lime-400/5 border border-lime-400/20 rounded-3xl p-6 shadow-2xl mb-6 flex flex-col items-center gap-2">
                <Award size={36} className="text-lime-400 animate-bounce" />
                <h3 className="text-base font-black text-white">Hoàn thành bài tập!</h3>
                <p className="text-xs text-zinc-400 px-4">Bạn đã hoàn tất tất cả các hiệp tập của bài này.</p>
                {activeIdx < exercises.length - 1 ? (
                  <button
                    onClick={() => changeActiveIndex(activeIdx + 1)}
                    className="mt-4 bg-zinc-100 hover:bg-white text-zinc-950 font-black text-xs py-3 px-6 rounded-xl transition-all"
                  >
                    Chuyển sang bài tiếp theo
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="mt-4 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-black text-xs py-3 px-6 rounded-xl transition-all"
                  >
                    Hoàn tất buổi tập
                  </button>
                )}
              </div>
            ) : (
              /* Trường hợp đang tải hoặc đang khởi tạo */
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-center mb-6 flex flex-col items-center justify-center min-h-[200px]">
                <span className="text-xs text-zinc-500 font-bold block animate-pulse">Đang khởi tạo các hiệp tập...</span>
              </div>
            )}

            {/* List danh sách các set khác dạng chấm tròn thu nhỏ phía dưới */}
            <div className="flex justify-center gap-2.5 mb-2 overflow-x-auto py-1">
              {activeSets.map((s, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleToggleSetComplete(sIdx)}
                  className={`w-9 h-9 rounded-xl flex flex-col items-center justify-center border font-mono text-[10px] font-black transition-all ${
                    s.completed 
                      ? "bg-lime-400/10 border-lime-400 text-lime-400" 
                      : sIdx === nextSetIdx
                        ? "bg-zinc-800 border-zinc-600 text-white scale-110"
                        : "bg-zinc-900/60 border-zinc-900 text-zinc-500"
                  }`}
                >
                  <span>S{sIdx + 1}</span>
                  {s.weight && <span className="text-[7px] font-medium text-zinc-400">{s.weight}k</span>}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-zinc-500">Không có bài tập khả dụng.</p>
        )}
      </div>

      {/* BOTTOM CONTROLLER BAR */}
      <footer className="px-6 py-6 border-t border-zinc-900 bg-zinc-900/10 flex justify-between items-center gap-4">
        <button
          disabled={activeIdx === 0}
          onClick={() => changeActiveIndex(activeIdx - 1)}
          className="flex items-center gap-1 text-zinc-400 hover:text-white disabled:opacity-30 font-bold text-xs py-3 px-4 rounded-xl hover:bg-zinc-900 transition-colors"
        >
          <ChevronLeft size={16} /> Bài trước
        </button>

        {/* Nút Xem hướng dẫn nhanh */}
        <div className="text-center">
          <span className="text-[10px] text-zinc-500 font-bold block">Nhóm cơ phụ tác động</span>
          <span className="text-xs text-orange-400 font-bold capitalize mt-0.5 inline-block">
            {activeEx?.secondaryMuscles.join(", ") || "Không có"}
          </span>
        </div>

        <button
          disabled={activeIdx === exercises.length - 1}
          onClick={() => changeActiveIndex(activeIdx + 1)}
          className="flex items-center gap-1 text-zinc-400 hover:text-white disabled:opacity-30 font-bold text-xs py-3 px-4 rounded-xl hover:bg-zinc-900 transition-colors"
        >
          Bài sau <ChevronRight size={16} />
        </button>
      </footer>

      {/* SWAP EXERCISE MODAL */}
      {showSwapModal && activeEx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm flex flex-col shadow-2xl relative">
            <button 
              onClick={() => setShowSwapModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="text-sm font-black text-white mb-2 flex items-center gap-1.5">
              <RefreshCw size={16} className="text-lime-400" /> Đổi bài tập tương đương
            </h3>
            <p className="text-xs text-zinc-400 mb-4 leading-normal">
              Đổi bài tập hiện tại sang một bài tập thay thế tác động cùng nhóm cơ chính:
            </p>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto no-scrollbar">
              {activeEx.swapSuggestions.map(swapId => {
                const swapEx = exercisesDb[swapId];
                if (!swapEx) return null;
                return (
                  <button
                    key={swapId}
                    onClick={() => handleSwap(activeId, swapId)}
                    className="flex flex-col p-3 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-lime-400/50 text-left transition-all hover:bg-zinc-900"
                  >
                    <span className="text-xs font-bold text-zinc-200">{swapEx.name}</span>
                    <span className="text-[10px] text-zinc-500 font-semibold mt-1">Máy: {swapEx.machine}</span>
                  </button>
                );
              })}
              {activeEx.swapSuggestions.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-4">Không có bài tập thay thế tương đương phù hợp.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REST TIMER IN WORKOUT MODE */}
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
