import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { exercisesDb } from "../data/exercises";
import { Dumbbell, Plus, Edit, Trash2, Save, X, RotateCcw, AlertCircle, CheckCircle2, Search, Info } from "lucide-react";

export default function AdminPanel({ onBack }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Trạng thái Form (Thêm / Sửa)
  const [editingEx, setEditingEx] = useState(null); // null nghĩa là đang xem list, {} nghĩa là thêm mới, {data} nghĩa là sửa
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    primaryMuscle: "",
    targetMuscles: "", // Nhập dạng chuỗi cách nhau bằng dấu phẩy
    secondaryMuscles: "",
    machine: "",
    instructions: "", // Nhập dạng mỗi dòng là một bước
    swapSuggestions: ""
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Nạp danh sách bài tập từ Supabase
  const fetchExercises = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase
        .from("exercises_db")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setExercises(data || []);
    } catch (e) {
      setErrorMsg("Không thể tải danh sách bài tập: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  // Hàm khởi tạo dữ liệu bài tập mẫu (Seed Data)
  const handleSeedData = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn khởi tạo bộ dữ liệu 30 bài tập mặc định lên Supabase không? Thao tác này sẽ ghi đè các bài trùng ID.")) return;
    
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const seedArray = Object.values(exercisesDb).map(ex => ({
        id: ex.id,
        name: ex.name,
        primary_muscle: ex.primaryMuscle,
        target_muscles: ex.targetMuscles,
        secondary_muscles: ex.secondaryMuscles,
        machine: ex.machine,
        instructions: ex.instructions,
        swap_suggestions: ex.swapSuggestions
      }));

      const { error } = await supabase
        .from("exercises_db")
        .upsert(seedArray, { onConflict: "id" });

      if (error) throw error;

      setSuccessMsg("Khởi tạo thành công hơn 30 bài tập mẫu lên Supabase!");
      await fetchExercises();
    } catch (e) {
      setErrorMsg("Lỗi khởi tạo dữ liệu mẫu: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Mở Form để Thêm mới
  const handleOpenAddForm = () => {
    setEditingEx({});
    setFormData({
      id: "",
      name: "",
      primaryMuscle: "Ngực (Chest)",
      targetMuscles: "chest",
      secondaryMuscles: "triceps, front_delts",
      machine: "",
      instructions: "Nằm phẳng trên ghế...\nHạ tạ xuống ngực...\nĐẩy tạ thẳng lên...",
      swapSuggestions: ""
    });
    setErrorMsg("");
    setSuccessMsg("");
  };

  // Mở Form để Chỉnh sửa
  const handleOpenEditForm = (ex) => {
    setEditingEx(ex);
    setFormData({
      id: ex.id,
      name: ex.name,
      primaryMuscle: ex.primary_muscle,
      targetMuscles: Array.isArray(ex.target_muscles) ? ex.target_muscles.join(", ") : "",
      secondaryMuscles: Array.isArray(ex.secondary_muscles) ? ex.secondary_muscles.join(", ") : "",
      machine: ex.machine,
      instructions: Array.isArray(ex.instructions) ? ex.instructions.join("\n") : "",
      swapSuggestions: Array.isArray(ex.swap_suggestions) ? ex.swap_suggestions.join(", ") : ""
    });
    setErrorMsg("");
    setSuccessMsg("");
  };

  // Xử lý lưu Form (Thêm hoặc Sửa)
  const handleSaveExercise = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.id || !formData.name || !formData.primaryMuscle || !formData.machine) {
      setErrorMsg("Vui lòng điền đầy đủ các thông tin bắt buộc (ID, Tên, Cơ chính, Máy tập).");
      return;
    }

    // Định dạng dữ liệu chuỗi thành mảng JSON
    const parsedTargetMuscles = formData.targetMuscles.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    const parsedSecondaryMuscles = formData.secondaryMuscles.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    const parsedInstructions = formData.instructions.split("\n").map(s => s.trim()).filter(Boolean);
    const parsedSwapSuggestions = formData.swapSuggestions.split(",").map(s => s.trim()).filter(Boolean);

    setLoading(true);

    try {
      const payload = {
        id: formData.id.trim().toLowerCase(),
        name: formData.name.trim(),
        primary_muscle: formData.primaryMuscle.trim(),
        target_muscles: parsedTargetMuscles,
        secondary_muscles: parsedSecondaryMuscles,
        machine: formData.machine.trim(),
        instructions: parsedInstructions,
        swap_suggestions: parsedSwapSuggestions
      };

      const { error } = await supabase
        .from("exercises_db")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;

      setSuccessMsg("Lưu bài tập thành công!");
      setEditingEx(null);
      await fetchExercises();
    } catch (err) {
      setErrorMsg("Không thể lưu bài tập: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Xóa bài tập
  const handleDeleteExercise = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn XÓA bài tập "${name}" khỏi cơ sở dữ liệu chung không?`)) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { error } = await supabase
        .from("exercises_db")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setSuccessMsg(`Đã xóa bài tập "${name}" thành công.`);
      await fetchExercises();
    } catch (err) {
      setErrorMsg("Lỗi khi xóa bài tập: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Lọc bài tập theo từ khóa tìm kiếm
  const getFilteredExercises = () => {
    return exercises.filter(ex => 
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primary_muscle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredExercises = getFilteredExercises();

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 pb-20 text-zinc-100 px-4 pt-4 max-w-md mx-auto w-full">
      {/* HEADER */}
      <header className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
        <div>
          <span className="text-[10px] text-lime-400 font-bold uppercase tracking-widest">Quyền Quản Trị</span>
          <h1 className="text-lg font-black text-white mt-0.5">Quản lý bài tập chung</h1>
        </div>
        <button 
          onClick={onBack}
          className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
        >
          Quay lại
        </button>
      </header>

      {/* THÔNG BÁO LỖI/THÀNH CÔNG */}
      {errorMsg && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-3.5 flex gap-2.5 items-start">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-red-400 font-medium leading-normal">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 bg-lime-400/10 border border-lime-400/20 rounded-2xl p-3.5 flex gap-2.5 items-start">
          <CheckCircle2 size={16} className="text-lime-400 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-lime-400 font-medium leading-normal">{successMsg}</span>
        </div>
      )}

      {editingEx === null ? (
        /* ================= MÀN HÌNH DANH SÁCH BÀI TẬP ================= */
        <div className="flex flex-col gap-4">
          
          {/* Cụm nút Hành động đầu bảng */}
          <div className="flex gap-2">
            <button
              onClick={handleOpenAddForm}
              className="flex-1 bg-lime-500 hover:bg-lime-400 text-zinc-950 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Plus size={14} /> THÊM BÀI TẬP MỚI
            </button>
            
            <button
              onClick={handleSeedData}
              disabled={loading}
              className="px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-zinc-200 text-xs font-bold transition-all disabled:opacity-40"
              title="Khởi tạo danh sách bài tập mẫu mặc định lên Supabase"
            >
              Nạp dữ liệu mẫu
            </button>
          </div>

          {/* Ô Tìm Kiếm */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Tìm bài tập cần sửa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold focus:border-lime-400 focus:outline-none"
            />
            <Search className="absolute left-3.5 top-3 text-zinc-500" size={14} />
          </div>

          {/* Loader */}
          {loading && (
            <p className="text-center text-xs text-zinc-500 py-6 animate-pulse">Đang kết nối database...</p>
          )}

          {/* Bảng danh sách bài tập */}
          <div className="flex flex-col gap-2 max-h-[55vh] overflow-y-auto no-scrollbar">
            {filteredExercises.map(ex => (
              <div 
                key={ex.id} 
                className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900 border border-zinc-900 hover:border-zinc-800 transition-all"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-xs font-bold text-zinc-200 truncate">{ex.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                    ID: <span className="font-mono text-zinc-400 font-bold">{ex.id}</span> • Thiết bị: <span className="text-zinc-400 font-bold">{ex.machine}</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditForm(ex)}
                    className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-850 hover:border-lime-400/40 text-lime-400 transition-all active:scale-90"
                    title="Chỉnh sửa"
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteExercise(ex.id, ex.name)}
                    className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-850 hover:border-red-500/40 text-red-400 transition-all active:scale-90"
                    title="Xóa"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}

            {filteredExercises.length === 0 && !loading && (
              <div className="text-center py-10 text-zinc-500 flex flex-col items-center">
                <Dumbbell size={24} className="text-zinc-700 mb-2" />
                <p className="text-xs">Không tìm thấy bài tập nào.</p>
                <p className="text-[10px] text-zinc-600 mt-0.5">Hãy bấm "Thêm bài tập" hoặc "Nạp dữ liệu mẫu" để bắt đầu.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= MÀN HÌNH FORM EDIT / ADD BÀI TẬP ================= */
        <form onSubmit={handleSaveExercise} className="flex flex-col gap-4 bg-zinc-900 border border-zinc-900 rounded-3xl p-5 shadow-2xl">
          <h2 className="text-sm font-black text-white border-b border-zinc-800 pb-3 flex items-center justify-between">
            <span>{formData.id ? "Chỉnh sửa bài tập" : "Thêm bài tập chung mới"}</span>
            <button 
              type="button"
              onClick={() => setEditingEx(null)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X size={16} />
            </button>
          </h2>

          <div className="flex flex-col gap-3.5 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
            {/* ID bài tập */}
            <div className="flex flex-col">
              <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">ID Bài tập (Duy nhất, không dấu, ví dụ: lat_pulldown) *</label>
              <input
                type="text"
                disabled={!!editingEx.id} // Không cho phép sửa ID đối với bài tập đã có
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:border-lime-400 focus:outline-none disabled:opacity-50"
                placeholder="bench_press"
                required
              />
            </div>

            {/* Tên bài tập */}
            <div className="flex flex-col">
              <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Tên bài tập hiển thị *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:border-lime-400 focus:outline-none"
                placeholder="Barbell Bench Press (Đẩy ngực ngang)"
                required
              />
            </div>

            {/* Cơ chính */}
            <div className="flex flex-col">
              <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Nhóm cơ tác động chính hiển thị *</label>
              <input
                type="text"
                value={formData.primaryMuscle}
                onChange={(e) => setFormData({ ...formData, primaryMuscle: e.target.value })}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:border-lime-400 focus:outline-none"
                placeholder="Ngực (Chest)"
                required
              />
            </div>

            {/* Cơ target map Anatomy */}
            <div className="flex flex-col">
              <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Nhóm cơ Highlight Target trên Anatomy (cách nhau bằng dấu phẩy)</label>
              <input
                type="text"
                value={formData.targetMuscles}
                onChange={(e) => setFormData({ ...formData, targetMuscles: e.target.value })}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:border-lime-400 focus:outline-none font-mono"
                placeholder="chest, upper_chest"
              />
              <span className="text-[8px] text-zinc-500 mt-1 font-semibold">
                Các vùng hợp lệ: chest, upper_chest, front_delts, lateral_delts, rear_delts, traps, triceps, biceps, forearms, lats, upper_back, lower_back, abs, quads, hamstrings, glutes, calves.
              </span>
            </div>

            {/* Cơ phụ map Anatomy */}
            <div className="flex flex-col">
              <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Nhóm cơ Highlight phụ trên Anatomy (cách nhau bằng dấu phẩy)</label>
              <input
                type="text"
                value={formData.secondaryMuscles}
                onChange={(e) => setFormData({ ...formData, secondaryMuscles: e.target.value })}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:border-lime-400 focus:outline-none font-mono"
                placeholder="triceps, front_delts"
              />
            </div>

            {/* Thiết bị/Máy */}
            <div className="flex flex-col">
              <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Thiết bị / Máy tập cần sử dụng *</label>
              <input
                type="text"
                value={formData.machine}
                onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:border-lime-400 focus:outline-none"
                placeholder="Tạ đòn (Barbell)"
                required
              />
            </div>

            {/* Hướng dẫn tập */}
            <div className="flex flex-col">
              <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Các bước hướng dẫn thực hiện (mỗi bước viết 1 dòng)</label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold focus:border-lime-400 focus:outline-none h-24 font-sans leading-relaxed"
                placeholder="Bước 1: Nằm phẳng trên ghế...&#10;Bước 2: Đẩy thanh đòn..."
              />
            </div>

            {/* Gợi ý Swap bài tập */}
            <div className="flex flex-col">
              <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">ID các bài tập thay thế tương đương gợi ý (cách nhau bằng dấu phẩy)</label>
              <input
                type="text"
                value={formData.swapSuggestions}
                onChange={(e) => setFormData({ ...formData, swapSuggestions: e.target.value })}
                className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold focus:border-lime-400 focus:outline-none font-mono"
                placeholder="incline_dumbbell_press, dumbbell_chest_press"
              />
            </div>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="flex gap-3 border-t border-zinc-800/80 pt-3 mt-1">
            <button
              type="button"
              onClick={() => setEditingEx(null)}
              className="flex-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold py-3 rounded-2xl text-xs transition-all text-center"
            >
              HỦY BỎ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-zinc-950 font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <Save size={14} /> LƯU BÀI TẬP
            </button>
          </div>
        </form>
      )}
    </div>
  );
}


