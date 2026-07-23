import React, { useState } from "react";
import { Dumbbell, Calendar, ChevronRight, CheckCircle2, Trophy, Clock, Zap, Star, Edit, ArrowUp, ArrowDown, Trash2, Plus, X, Search, Check, Eye, Sparkles, Filter, Info } from "lucide-react";
import AnatomyViewer from "./AnatomyViewer";
import ExerciseImageAnimator from "./ExerciseImageAnimator";
import ExerciseDetailModal from "./ExerciseDetailModal";

export default function Dashboard({ 
  workoutHistory = {}, 
  customWorkoutSplit = {},
  onSelectDay,
  activeTab,
  setActiveTab,
  onReorderExercise,
  onAddExercise,
  onRemoveExercise,
  exercisesDb = {}
}) {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const dayNamesVi = {
    Monday: "Thứ hai",
    Tuesday: "Thứ ba",
    Wednesday: "Thứ tư",
    Thursday: "Thứ năm",
    Friday: "Thứ sáu",
    Saturday: "Thứ bảy",
    Sunday: "Chủ nhật"
  };

  const getTodayDayOfWeek = () => {
    const dayIndex = new Date().getDay();
    const mapping = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return mapping[dayIndex];
  };

  const todayDayKey = getTodayDayOfWeek();
  const [selectedDayKey, setSelectedDayKey] = useState(todayDayKey);

  // Trạng thái bật/tắt chế độ Chỉnh sửa lịch tập
  const [isEditingSplit, setIsEditingSplit] = useState(false);
  // Trạng thái mở modal Thư viện bài tập
  const [showLibraryModal, setShowLibraryModal] = useState(false);
  // Trạng thái tìm kiếm & lọc trong Thư viện bài tập
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState("all");
  const [selectedEquipFilter, setSelectedEquipFilter] = useState("all");

  // Trạng thái xem trước chi tiết bài tập trong modal riêng
  const [selectedDetailExercise, setSelectedDetailExercise] = useState(null);

  // Định dạng ngày hiển thị ở header
  const getFormattedDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('vi-VN', options);
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  };

  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Tính toán tiến độ của ngày tập dựa trên dữ liệu lịch sử
  const getDayProgress = (dayKey) => {
    const todayStr = getTodayString();
    const isTodaySelected = dayKey === todayDayKey;
    if (isTodaySelected && workoutHistory[todayStr]) {
      const data = workoutHistory[todayStr];
      let totalSets = 0;
      let completedSets = 0;

      if (data && data.sets) {
        Object.keys(data.sets).forEach(exId => {
          const sets = data.sets[exId] || [];
          totalSets += sets.length;
          completedSets += sets.filter(s => s.completed).length;
        });
      }
      return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
    }
    return 0;
  };

  const currentSplit = customWorkoutSplit[selectedDayKey] || { name: "Nghỉ ngơi", type: "rest", exercises: [] };
  const isToday = selectedDayKey === todayDayKey;
  const progress = getDayProgress(selectedDayKey);

  const workoutQuotes = [
    "Sức mạnh không đến từ năng lực thể chất. Nó đến từ ý chí không khuất phục.",
    "Bạn không cần phải giỏi hơn ai cả, bạn chỉ cần giỏi hơn chính mình của ngày hôm qua.",
    "Kỷ luật là cầu nối giữa mục tiêu và thành tựu.",
    "Nỗi đau của kỷ luật nhẹ hơn nhiều so với nỗi đau của sự hối tiếc.",
    "Mồ hôi hôm nay là thành công ngày mai. Đừng bao giờ bỏ cuộc!"
  ];

  const getQuoteOfTheDay = () => {
    const dayIndex = new Date().getDate() % workoutQuotes.length;
    return workoutQuotes[dayIndex];
  };

  // Lọc danh sách bài tập của Thư viện (Hơn 870 bài tập từ database)
  const getFilteredExercises = () => {
    return Object.values(exercisesDb).filter(ex => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (ex.name && ex.name.toLowerCase().includes(q)) || 
        (ex.nameVi && ex.nameVi.toLowerCase().includes(q)) ||
        (ex.primaryMuscle && ex.primaryMuscle.toLowerCase().includes(q)) ||
        (ex.secondaryMusclesVi && ex.secondaryMusclesVi.some(m => m.toLowerCase().includes(q)));
      
      if (!matchesSearch) return false;

      // Lọc nhóm cơ chính / phụ
      if (selectedMuscleFilter !== "all") {
        const filterM = selectedMuscleFilter.toLowerCase();
        const pMatch = ex.primaryMuscle && ex.primaryMuscle.toLowerCase().includes(filterM);
        const sMatch = ex.secondaryMusclesVi && ex.secondaryMusclesVi.some(m => m.toLowerCase().includes(filterM));
        if (!pMatch && !sMatch) return false;
      }

      // Lọc dụng cụ
      if (selectedEquipFilter !== "all") {
        const filterE = selectedEquipFilter.toLowerCase();
        const eMatch = (ex.equipment && ex.equipment.toLowerCase().includes(filterE)) ||
                       (ex.rawEquipment && ex.rawEquipment.toLowerCase().includes(filterE));
        if (!eMatch) return false;
      }

      return true;
    });
  };

  const filteredExercises = getFilteredExercises();

  // Bộ lọc Nhóm Cơ
  const muscleGroups = [
    { key: "all", label: "Tất cả cơ" },
    { key: "ngực", label: "Ngực" },
    { key: "vai", label: "Vai" },
    { key: "lưng", label: "Lưng/Xô" },
    { key: "tay trước", label: "Tay trước" },
    { key: "tay sau", label: "Tay sau" },
    { key: "bụng", label: "Bụng/Core" },
    { key: "đùi trước", label: "Đùi trước" },
    { key: "đùi sau", label: "Đùi sau" },
    { key: "mông", label: "Mông" },
    { key: "bắp chân", label: "Bắp chân" },
    { key: "cầu vai", label: "Cầu vai" },
    { key: "cẳng tay", label: "Cẳng tay" }
  ];

  // Bộ lọc Dụng cụ
  const equipGroups = [
    { key: "all", label: "Tất cả dụng cụ" },
    { key: "tạ đòn", label: "Tạ đòn" },
    { key: "tạ đơn", label: "Tạ đơn" },
    { key: "cáp", label: "Dây cáp" },
    { key: "máy", label: "Máy tập" },
    { key: "bodyweight", label: "Bodyweight" },
    { key: "tạ ấm", label: "Tạ ấm" },
    { key: "dây kháng lực", label: "Dây kháng lực" }
  ];

  return (
    <div className="flex flex-col gap-6 px-4 pt-4 pb-20 max-w-md mx-auto text-zinc-100 min-h-screen bg-zinc-950">
      
      {/* WELCOME HEADER */}
      <header className="flex flex-col mt-2">
        <span className="text-[10px] text-lime-400 font-bold uppercase tracking-widest flex items-center gap-1">
          <Zap size={10} className="fill-lime-400" /> Kỷ luật tạo nên sự khác biệt
        </span>
        <h1 className="text-xl font-black text-white mt-1">Hôm nay của bạn</h1>
        <p className="text-xs text-zinc-500 font-semibold mt-0.5">{getFormattedDate()}</p>
      </header>

      {/* BANNER AI PERSONAL TRAINER */}
      <div 
        onClick={() => setActiveTab && setActiveTab("ai_trainer")}
        className="bg-gradient-to-r from-lime-500/20 via-emerald-500/15 to-zinc-900 border border-lime-400/30 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:border-lime-400/50 active:scale-[0.99] transition-all shadow-lg shadow-lime-950/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-400 text-zinc-950 flex items-center justify-center font-black shadow-md shadow-lime-400/20">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">AI Personal Trainer</span>
              <span className="text-[9px] bg-lime-400 text-zinc-950 font-black px-1.5 py-0.2 rounded-full uppercase">Kinesiology</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">Tự động thiết kế & xuất JSON lộ trình tập luyện</p>
          </div>
        </div>
        <ChevronRight size={18} className="text-lime-400" />
      </div>

      {/* LỊCH TRÌNH PHÂN CHIA TUẦN (WEEKLY SPLIT SELECTOR) */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar size={15} className="text-lime-400" />
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">Lịch tập luyện tuần</h2>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {daysOfWeek.map((dayKey) => {
            const isSelected = selectedDayKey === dayKey;
            const split = customWorkoutSplit[dayKey] || { name: "Nghỉ ngơi", type: "rest" };
            const isRest = split.type === "rest";

            return (
              <button
                key={dayKey}
                onClick={() => setSelectedDayKey(dayKey)}
                className={`flex-shrink-0 flex flex-col p-3 rounded-2xl min-w-[100px] border transition-all text-left cursor-pointer ${
                  isSelected
                    ? "bg-lime-400 text-zinc-950 border-lime-400 shadow-lg shadow-lime-400/20 scale-105"
                    : "bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <span className={`text-[10px] font-black uppercase ${isSelected ? "text-zinc-950" : "text-zinc-500"}`}>
                  {dayNamesVi[dayKey]}
                </span>
                <span className={`text-xs font-bold truncate mt-1 ${isSelected ? "text-zinc-950" : "text-zinc-100"}`}>
                  {split.name.split(" (")[0]}
                </span>
                <span className={`text-[9px] font-medium mt-1 ${
                  isSelected ? "text-zinc-900" : isRest ? "text-zinc-500" : "text-lime-400"
                }`}>
                  {isRest ? "Nghỉ ngơi" : `${split.exercises?.length || 0} bài tập`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CHI TIẾT NGÀY ĐƯỢC CHỌN */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-5 space-y-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-lime-400 block">
              {dayNamesVi[selectedDayKey]} {isToday && "(Hôm nay)"}
            </span>
            <h3 className="text-base font-black text-white">{currentSplit.name}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingSplit(!isEditingSplit)}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isEditingSplit
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200"
              }`}
              title="Chỉnh sửa danh sách bài tập"
            >
              <Edit size={15} />
            </button>

            <button
              onClick={() => setShowLibraryModal(true)}
              className="bg-lime-400 text-zinc-950 text-xs font-black px-3 py-2 rounded-xl shadow hover:bg-lime-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Thêm bài tập
            </button>
          </div>
        </div>

        {/* TIẾN ĐỘ TẬP HÔM NAY */}
        {isToday && currentSplit.type !== "rest" && (
          <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-zinc-400">Tiến độ hôm nay</span>
              <span className="text-lime-400 font-mono">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* DANH SÁCH BÀI TẬP CỦA NGÀY */}
        {currentSplit.exercises && currentSplit.exercises.length > 0 ? (
          <div className="space-y-2">
            {currentSplit.exercises.map((exId, index) => {
              const ex = exercisesDb[exId] || { name: exId, primaryMuscle: "Khác", equipment: "Khác" };
              return (
                <div
                  key={`${exId}-${index}`}
                  className="bg-zinc-950/70 border border-zinc-800/80 p-3 rounded-2xl flex items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                >
                  <div 
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    onClick={() => setSelectedDetailExercise(ex)}
                  >
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-black text-lime-400 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-zinc-100 truncate flex items-center gap-1">
                        {ex.nameVi || ex.name}
                        <Eye size={12} className="text-zinc-600 inline" />
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">
                        {ex.primaryMuscle} • {ex.equipment}
                      </p>
                    </div>
                  </div>

                  {isEditingSplit ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onReorderExercise(selectedDayKey, index, "up")}
                        disabled={index === 0}
                        className="p-1.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => onReorderExercise(selectedDayKey, index, "down")}
                        disabled={index === currentSplit.exercises.length - 1}
                        className="p-1.5 text-zinc-500 hover:text-zinc-200 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => onRemoveExercise(selectedDayKey, exId)}
                        className="p-1.5 text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectDay(selectedDayKey, index)}
                      className="bg-zinc-900 hover:bg-zinc-800 text-lime-400 p-2 rounded-xl border border-zinc-800 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    >
                      Bắt đầu <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-zinc-950/40 rounded-2xl border border-zinc-900 text-zinc-500 space-y-2">
            <Clock size={24} className="mx-auto text-zinc-600" />
            <p className="text-xs font-semibold">Chưa có bài tập nào được thêm vào ngày này.</p>
          </div>
        )}
      </div>

      {/* --- MODAL THƯ VIỆN BÀI TẬP CAO CẤP (870+ BÀI TẬP VỚI ẢNH ANIMATED 0.JPG - 1.JPG & TIẾNG VIỆT) --- */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col text-zinc-100 p-3 sm:p-5 justify-center animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 w-full max-w-lg mx-auto shadow-2xl flex flex-col max-h-[90vh] relative">
            
            {/* Nút Close */}
            <button 
              onClick={() => setShowLibraryModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 p-1.5 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer z-10"
            >
              <X size={18} />
            </button>

            <div className="mb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Dumbbell size={18} className="text-lime-400" /> Thư Viện Bài Tập Khổng Lồ ({filteredExercises.length} Bài)
              </h3>
              <p className="text-[10px] text-zinc-500 font-semibold uppercase mt-0.5">
                Thêm bài tập vào {dayNamesVi[selectedDayKey]} • Nhấp để xem hình chuyển động
              </p>
            </div>

            {/* Thanh Tìm Kiếm */}
            <div className="relative mb-3">
              <input 
                type="text" 
                placeholder="Tìm bài tập (Tên Tiếng Việt / Tiếng Anh / Cơ)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold text-zinc-100 focus:border-lime-400 focus:outline-none placeholder-zinc-600 shadow-inner"
              />
              <Search className="absolute left-3.5 top-3 text-zinc-500" size={14} />
            </div>

            {/* Bộ Lọc Nhóm Cơ (Tabs) */}
            <div className="space-y-2 mb-3">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {muscleGroups.map(grp => (
                  <button
                    key={grp.key}
                    onClick={() => setSelectedMuscleFilter(grp.key)}
                    className={`flex-shrink-0 px-3 py-1 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                      selectedMuscleFilter === grp.key
                        ? "bg-lime-400 text-zinc-950 shadow"
                        : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {grp.label}
                  </button>
                ))}
              </div>

              {/* Bộ Lọc Dụng Cụ */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {equipGroups.map(eq => (
                  <button
                    key={eq.key}
                    onClick={() => setSelectedEquipFilter(eq.key)}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                      selectedEquipFilter === eq.key
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-zinc-950 text-zinc-500 border border-zinc-850 hover:text-zinc-300"
                    }`}
                  >
                    {eq.label}
                  </button>
                ))}
              </div>
            </div>

            {/* DANH SÁCH BÀI TẬP TRONG THƯ VIỆN HỆ THỐNG */}
            <div className="flex-1 overflow-y-auto no-scrollbar pr-1 flex flex-col gap-3">
              {filteredExercises.map(ex => {
                const isAlreadyInSplit = currentSplit.exercises.includes(ex.id);
                
                return (
                  <div key={ex.id} className="bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-2xl flex items-center gap-3 hover:border-lime-400/40 transition-all">
                    
                    {/* ANIMATED IMAGE PREVIEW THUMBNAIL */}
                    <div 
                      className="w-16 h-16 flex-shrink-0 cursor-pointer"
                      onClick={() => setSelectedDetailExercise(ex)}
                    >
                      <ExerciseImageAnimator
                        images={ex.images || [`/exercises/${ex.id}/0.jpg`, `/exercises/${ex.id}/1.jpg`]}
                        alt={ex.nameVi || ex.name}
                        className="w-16 h-16 rounded-xl border border-zinc-800"
                        autoPlay={true}
                        intervalMs={1200}
                      />
                    </div>

                    {/* CONTENT INFO */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setSelectedDetailExercise(ex)}
                    >
                      <h4 className="text-xs font-bold text-zinc-100 truncate flex items-center gap-1.5">
                        {ex.nameVi || ex.name}
                        <Eye size={12} className="text-zinc-500 inline hover:text-lime-400" />
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-medium truncate mt-0.5">
                        🎯 <span className="text-lime-400 font-bold">{ex.primaryMuscle}</span>
                      </p>
                      {ex.secondaryMusclesVi && ex.secondaryMusclesVi.length > 0 && (
                        <p className="text-[9px] text-zinc-500 truncate mt-0.5">
                          ⚡ Cơ phụ: {ex.secondaryMusclesVi.join(", ")}
                        </p>
                      )}
                    </div>

                    {/* ACTION BUTTON */}
                    {isAlreadyInSplit ? (
                      <span className="flex items-center gap-0.5 text-[9px] font-black uppercase text-zinc-600 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-xl">
                        <Check size={10} /> Đã thêm
                      </span>
                    ) : (
                      <button
                        onClick={() => onAddExercise(selectedDayKey, ex.id)}
                        className="flex items-center gap-0.5 text-[10px] font-black uppercase text-zinc-950 bg-lime-400 hover:bg-lime-300 px-3 py-2 rounded-xl active:scale-95 transition-all shadow-md shadow-lime-400/20 cursor-pointer"
                      >
                        <Plus size={12} /> Thêm
                      </button>
                    )}
                  </div>
                );
              })}

              {filteredExercises.length === 0 && (
                <p className="text-xs text-zinc-600 text-center py-10">Không tìm thấy bài tập phù hợp với từ khóa và bộ lọc của bạn.</p>
              )}
            </div>

            {/* FOOTER MODAL THƯ VIỆN */}
            <div className="mt-3 pt-3 border-t border-zinc-800/80 flex justify-between items-center text-[10px] text-zinc-500">
              <span>Đang hiển thị {filteredExercises.length} bài tập</span>
              <button 
                onClick={() => {
                  setShowLibraryModal(false);
                  setPreviewExercise(null);
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold py-2 px-5 rounded-xl transition-all"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
