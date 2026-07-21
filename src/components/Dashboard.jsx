import React, { useState } from "react";
import { Dumbbell, Calendar, ChevronRight, CheckCircle2, Trophy, Clock, Zap, Star, Edit, ArrowUp, ArrowDown, Trash2, Plus, X, Search, Check, Eye } from "lucide-react";
import AnatomyViewer from "./AnatomyViewer";

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

  // Trạng thái tìm kiếm & lọc nhóm cơ trong Thư viện bài tập
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState("all");

  // Trạng thái xem trước chi tiết bài tập trong thư viện
  const [previewExercise, setPreviewExercise] = useState(null);

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

  // Lọc danh sách bài tập của Thư viện
  const getFilteredExercises = () => {
    return Object.values(exercisesDb).filter(ex => {
      // Tìm kiếm theo tên
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            ex.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Lọc theo nhóm cơ
      let matchesMuscle = true;
      if (selectedMuscleFilter !== "all") {
        const filter = selectedMuscleFilter.toLowerCase();
        matchesMuscle = ex.primaryMuscle.toLowerCase().includes(filter) || 
                        ex.targetMuscles.some(m => m.toLowerCase().includes(filter));
      }

      return matchesSearch && matchesMuscle;
    });
  };

  const filteredExercises = getFilteredExercises();

  // Nhóm cơ để hiển thị bộ lọc dạng tab
  const muscleGroups = [
    { key: "all", label: "Tất cả" },
    { key: "ngực", label: "Ngực" },
    { key: "vai", label: "Vai" },
    { key: "lưng", label: "Lưng/Xô" },
    { key: "tay", label: "Tay" },
    { key: "bụng", label: "Bụng" },
    { key: "chân", label: "Chân/Mông" }
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

      {/* CHÂM NGÔN KHÍCH LỆ */}
      {!isEditingSplit && (
        <div className="bg-gradient-to-r from-lime-500/10 to-emerald-500/5 border border-lime-500/10 rounded-2xl p-4 flex gap-3 items-start relative overflow-hidden">
          <div className="p-2 bg-lime-400 text-zinc-950 rounded-xl flex-shrink-0 mt-0.5">
            <Star size={16} className="fill-zinc-950" />
          </div>
          <div>
            <span className="text-[10px] text-lime-400 font-black uppercase tracking-wider">Động lực hôm nay</span>
            <p className="text-xs text-zinc-300 font-semibold leading-relaxed mt-1 italic">
              "{getQuoteOfTheDay()}"
            </p>
          </div>
        </div>
      )}

      {/* LỊCH TRÌNH PHÂN CHIA TUẦN (WEEKLY SPLIT SELECTOR) */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar size={15} className="text-lime-400" />
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">Lịch tập luyện tuần</h2>
        </div>
        
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {daysOfWeek.map((dayKey) => {
            const split = customWorkoutSplit[dayKey] || { name: "Nghỉ ngơi", type: "rest" };
            const isTodayItem = dayKey === todayDayKey;
            const isSelected = dayKey === selectedDayKey;
            
            return (
              <button
                key={dayKey}
                disabled={isEditingSplit} // Khóa chọn ngày khác khi đang chỉnh sửa
                onClick={() => setSelectedDayKey(dayKey)}
                className={`flex-shrink-0 flex flex-col items-center justify-between p-3 rounded-2xl w-[72px] h-[80px] border transition-all ${
                  isSelected 
                    ? "bg-lime-500 border-lime-500 text-zinc-950 shadow-lg shadow-lime-500/15" 
                    : isTodayItem
                      ? "bg-zinc-900 border-lime-400/40 text-zinc-200"
                      : "bg-zinc-900/60 border-zinc-900/60 text-zinc-400 hover:border-zinc-800"
                } ${isEditingSplit ? "opacity-40" : ""}`}
              >
                <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? 'text-zinc-900' : 'text-zinc-500'}`}>
                  {dayKey.substring(0, 3)}
                </span>
                
                <div className={`w-2.5 h-2.5 rounded-full ${
                  isSelected 
                    ? 'bg-zinc-950' 
                    : split.type === 'rest' 
                      ? 'bg-zinc-700' 
                      : 'bg-lime-400'
                }`}></div>

                <span className="text-[10px] font-bold">
                  {split.type === "rest" ? "Nghỉ" : split.type.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CHI TIẾT LỊCH TẬP / GIAO DIỆN CHỈNH SỬA TÙY CHỈNH */}
      <div className="bg-zinc-900 border border-zinc-900 rounded-3xl p-5 shadow-xl flex flex-col">
        
        {/* TIÊU ĐỀ NGÀY TẬP */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-bold text-lime-400 uppercase tracking-widest bg-lime-400/10 px-2.5 py-0.5 rounded-full">
              {dayNamesVi[selectedDayKey]} {isToday && "• Hôm nay"}
            </span>
            <h3 className="text-base font-black text-white mt-1.5">{currentSplit.name}</h3>
          </div>
          
          {/* Nút Chỉnh sửa / Nút Xong */}
          {currentSplit.type !== "rest" && (
            <button
              onClick={() => {
                setIsEditingSplit(!isEditingSplit);
                setPreviewExercise(null); // Đóng preview nếu đang mở
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                isEditingSplit 
                  ? "bg-lime-400 text-zinc-950 hover:bg-lime-300" 
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-800"
              }`}
            >
              {isEditingSplit ? (
                <>
                  <Check size={14} /> Xong
                </>
              ) : (
                <>
                  <Edit size={12} /> Tùy chỉnh
                </>
              )}
            </button>
          )}

          {isToday && currentSplit.type !== "rest" && progress > 0 && !isEditingSplit && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono font-black text-lime-400">{progress}%</span>
              <div className="w-14 bg-zinc-800 rounded-full h-1 mt-1 overflow-hidden">
                <div className="bg-lime-400 h-full" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* NỘI DUNG CHẾ ĐỘ THƯỜNG (XEM LỊCH TẬP) */}
        {!isEditingSplit ? (
          currentSplit.type === "rest" ? (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-zinc-950/40 rounded-2xl border border-zinc-900/60 p-4">
              <Trophy size={36} className="text-zinc-700 mb-3 animate-pulse" />
              <h4 className="text-sm font-black text-zinc-300">Cơ bắp phát triển khi nghỉ ngơi!</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-[240px] leading-relaxed">
                Hôm nay là Rest Day. Hãy để các nhóm cơ được hồi phục, uống đủ nước và ngủ đủ giấc nhé.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                Danh sách {currentSplit.exercises.length} bài tập hôm nay
              </span>
              
              <div className="flex flex-col gap-2">
                {currentSplit.exercises.map((exId, idx) => {
                  const ex = exercisesDb[exId];
                  if (!ex) return null;
                  return (
                    <div 
                      key={exId} 
                      className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950/60 border border-zinc-950 hover:border-zinc-900 transition-all"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-zinc-200 truncate">
                          {idx + 1}. {ex.name.split(" (")[0]}
                        </span>
                        <span className="text-[10px] text-zinc-500 mt-0.5 font-semibold">
                          Thiết bị: {ex.machine}
                        </span>
                      </div>
                      <span className="text-[10px] text-lime-400 font-black uppercase bg-lime-400/10 px-2 py-0.5 rounded-lg flex-shrink-0">
                        {ex.primaryMuscle.split(" (")[0]}
                      </span>
                    </div>
                  );
                })}
                {currentSplit.exercises.length === 0 && (
                  <p className="text-xs text-zinc-500 text-center py-6">Chưa có bài tập nào. Bấm nút Tùy chỉnh để thiết lập!</p>
                )}
              </div>

              {currentSplit.exercises.length > 0 && (
                <button
                  onClick={() => onSelectDay(selectedDayKey, dayNamesVi[selectedDayKey], currentSplit.exercises)}
                  className="w-full mt-5 bg-lime-500 hover:bg-lime-400 active:scale-98 text-zinc-950 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-lime-500/10 transition-all text-sm"
                >
                  <Dumbbell size={16} className="fill-zinc-950" />
                  {progress > 0 ? "TIẾP TỤC BUỔI TẬP" : "BẮT ĐẦU BUỔI TẬP"}
                </button>
              )}
            </div>
          )
        ) : (
          /* NỘI DUNG CHẾ ĐỘ TÙY CHỈNH LỊCH TẬP (EDIT MODE) */
          <div className="flex flex-col gap-3">
            <span className="text-[10px] text-lime-400 font-black uppercase tracking-wider block">
              Sắp xếp & chỉnh sửa lịch tập
            </span>

            {/* List bài tập chỉnh sửa */}
            <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto no-scrollbar">
              {currentSplit.exercises.map((exId, index) => {
                const ex = exercisesDb[exId];
                if (!ex) return null;
                return (
                  <div 
                    key={exId} 
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-900"
                  >
                    <div className="flex flex-col min-w-0 flex-1 pr-2">
                      <span className="text-xs font-bold text-zinc-200 truncate">{ex.name.split(" (")[0]}</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5 font-semibold">Cơ chính: {ex.primaryMuscle.split(" (")[0]}</span>
                    </div>

                    {/* Bộ nút bấm điều khiển */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Nút di chuyển lên */}
                      <button
                        disabled={index === 0}
                        onClick={() => onReorderExercise(selectedDayKey, index, "up")}
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-400"
                        title="Di chuyển lên"
                      >
                        <ArrowUp size={14} />
                      </button>
                      
                      {/* Nút di chuyển xuống */}
                      <button
                        disabled={index === currentSplit.exercises.length - 1}
                        onClick={() => onReorderExercise(selectedDayKey, index, "down")}
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-30 disabled:hover:text-zinc-400"
                        title="Di chuyển xuống"
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Nút xóa bài tập */}
                      <button
                        onClick={() => onRemoveExercise(selectedDayKey, exId)}
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-red-500/70 hover:text-red-400"
                        title="Xóa khỏi lịch tập"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {currentSplit.exercises.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-6">Lịch tập trống. Hãy thêm bài tập bên dưới!</p>
              )}
            </div>

            {/* Nút Mở Thư Viện */}
            <button
              onClick={() => setShowLibraryModal(true)}
              className="w-full mt-2 border border-dashed border-lime-400/30 hover:border-lime-400/50 text-lime-400 hover:text-lime-300 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs active:scale-98"
            >
              <Plus size={16} /> THÊM BÀI TẬP TỪ THƯ VIỆN
            </button>
          </div>
        )}
      </div>

      {/* QUICK STATS WIDGET */}
      {!isEditingSplit && workoutHistory && Object.keys(workoutHistory).length > 0 && (
        <div className="bg-zinc-900 border border-zinc-900 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-950 text-lime-400 rounded-2xl">
              <Trophy size={18} />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Thành tựu tập luyện</span>
              <span className="text-xs font-bold text-zinc-200 mt-0.5 block">
                Đã hoàn thành {Object.keys(workoutHistory).length} buổi tập!
              </span>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab("stats")}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* --- MODAL THƯ VIỆN BÀI TẬP --- */}
      {showLibraryModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col text-zinc-100 p-4 justify-center">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 w-full max-w-sm mx-auto shadow-2xl flex flex-col max-h-[85vh] relative">
            
            {/* Nút Close */}
            <button 
              onClick={() => {
                setShowLibraryModal(false);
                setPreviewExercise(null);
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-sm font-black text-white mb-1 flex items-center gap-2">
              <Dumbbell size={16} className="text-lime-400" /> Thư viện bài tập
            </h3>
            <p className="text-[10px] text-zinc-500 font-semibold mb-4 uppercase">
              Thêm bài tập vào {dayNamesVi[selectedDayKey]}
            </p>

            {/* Thanh Tìm Kiếm */}
            <div className="relative mb-3.5">
              <input 
                type="text" 
                placeholder="Tìm kiếm bài tập..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold focus:border-lime-400 focus:outline-none placeholder-zinc-600"
              />
              <Search className="absolute left-3.5 top-3 text-zinc-600" size={14} />
            </div>

            {/* Bộ Lọc Nhóm Cơ (Tabs) */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-3 mb-3 border-b border-zinc-800/80">
              {muscleGroups.map(grp => (
                <button
                  key={grp.key}
                  onClick={() => setSelectedMuscleFilter(grp.key)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                    selectedMuscleFilter === grp.key
                      ? "bg-lime-400 text-zinc-950"
                      : "bg-zinc-950 text-zinc-500 border border-zinc-950 hover:border-zinc-800"
                  }`}
                >
                  {grp.label}
                </button>
              ))}
            </div>

            {/* DANH SÁCH BÀI TẬP TRONG THƯ VIỆN */}
            <div className="flex-1 overflow-y-auto no-scrollbar pr-1 flex flex-col gap-2">
              {filteredExercises.map(ex => {
                const isAlreadyInSplit = currentSplit.exercises.includes(ex.id);
                const isPreviewing = previewExercise?.id === ex.id;
                
                return (
                  <div key={ex.id} className="flex flex-col gap-3 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-950">
                    <div className="flex items-center justify-between gap-2">
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => setPreviewExercise(isPreviewing ? null : ex)}
                      >
                        <h4 className="text-xs font-bold text-zinc-200 truncate flex items-center gap-1">
                          {ex.name.split(" (")[0]}
                          <Eye size={12} className="text-zinc-600 inline" />
                        </h4>
                        <p className="text-[9px] text-zinc-500 font-semibold mt-0.5 flex items-center gap-1.5">
                          <span>Cơ: <span className="text-zinc-400 font-bold">{ex.primaryMuscle.split(" (")[0]}</span></span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                          <span>Máy: <span className="text-zinc-400 font-bold">{ex.machine}</span></span>
                        </p>
                      </div>

                      {/* Nút hành động */}
                      {isAlreadyInSplit ? (
                        <span className="flex items-center gap-0.5 text-[9px] font-black uppercase text-zinc-600 bg-zinc-900 border border-zinc-850 px-2.5 py-1.5 rounded-xl">
                          <Check size={10} /> Đã thêm
                        </span>
                      ) : (
                        <button
                          onClick={() => onAddExercise(selectedDayKey, ex.id)}
                          className="flex items-center gap-0.5 text-[9px] font-black uppercase text-zinc-950 bg-lime-500 hover:bg-lime-400 px-3 py-1.5 rounded-xl active:scale-95 transition-all"
                        >
                          <Plus size={10} /> Thêm
                        </button>
                      )}
                    </div>

                    {/* PHẦN XEM TRƯỚC HƯỚNG DẪN & ANATOMY */}
                    {isPreviewing && (
                      <div className="border-t border-zinc-900 pt-3 mt-1 flex flex-col gap-3 transition-all duration-300">
                        {/* AnatomViewer thu nhỏ */}
                        <AnatomyViewer targetMuscles={ex.targetMuscles} secondaryMuscles={ex.secondaryMuscles} />
                        
                        {/* Các bước tập */}
                        <div className="text-left bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-900">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">Hướng dẫn tập:</span>
                          <ol className="flex flex-col gap-1.5">
                            {ex.instructions.map((step, sIdx) => (
                              <li key={sIdx} className="flex gap-2 text-[10px] text-zinc-300 leading-normal">
                                <span className="w-4 h-4 flex-shrink-0 rounded-full bg-zinc-800 text-zinc-500 font-mono font-bold text-[8px] flex items-center justify-center">
                                  {sIdx + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredExercises.length === 0 && (
                <p className="text-xs text-zinc-600 text-center py-8">Không tìm thấy bài tập phù hợp.</p>
              )}
            </div>

            {/* FOOTER MODAL THƯ VIỆN */}
            <div className="mt-3 pt-3 border-t border-zinc-800/80 flex justify-end">
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
