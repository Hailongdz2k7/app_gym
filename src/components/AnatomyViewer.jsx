import React from "react";

export default function AnatomyViewer({ targetMuscles = [], secondaryMuscles = [] }) {
  // Chuẩn hóa tên nhóm cơ để so khớp
  const targets = targetMuscles.map(m => m.toLowerCase());
  const secondaries = secondaryMuscles.map(m => m.toLowerCase());

  const getFillColor = (muscleId) => {
    const id = muscleId.toLowerCase();
    if (targets.includes(id)) {
      return "#a3e635"; // lime-400 (Target)
    }
    if (secondaries.includes(id)) {
      return "#f97316"; // orange-500 (Secondary)
    }
    return "#3f3f46"; // zinc-700 (Default inactive)
  };

  // Helper để render các bộ phận cơ bắp
  // Thiết kế vector hình nhân cơ bắp tối giản, hiện đại
  return (
    <div className="flex flex-col items-center bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm w-full max-w-sm mx-auto">
      <div className="flex justify-between w-full mb-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-lime-400 inline-block pulse-lime"></span>
          <span className="text-zinc-300 font-medium">Cơ tác động chính</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>
          <span className="text-zinc-300 font-medium">Cơ tác động phụ</span>
        </div>
      </div>

      <div className="flex justify-center gap-8 w-full py-4">
        {/* MẶT TRƯỚC (ANTERIOR) */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Mặt trước</span>
          <svg width="100" height="220" viewBox="0 0 100 220" className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            {/* Đầu */}
            <circle cx="50" cy="18" r="10" fill="#27272a" stroke="#18181b" strokeWidth="1" />
            
            {/* Cổ */}
            <rect x="47" y="27" width="6" height="8" fill="#27272a" stroke="#18181b" strokeWidth="1" />
            
            {/* Cầu vai (Traps) */}
            <path d="M 38 35 L 50 28 L 62 35 L 58 40 L 42 40 Z" fill={getFillColor("traps")} stroke="#18181b" strokeWidth="1" />

            {/* Ngực Trái & Phải (Chest) */}
            <path d="M 28 40 L 50 40 L 50 58 L 28 55 Z" fill={getFillColor("chest")} stroke="#18181b" strokeWidth="1.5" />
            <path d="M 50 40 L 72 40 L 72 55 L 50 58 Z" fill={getFillColor("chest")} stroke="#18181b" strokeWidth="1.5" />
            <path d="M 32 37 L 50 39 L 50 40 L 28 40 Z" fill={getFillColor("upper_chest")} stroke="#18181b" strokeWidth="1" />
            <path d="M 50 39 L 68 37 L 72 40 L 50 40 Z" fill={getFillColor("upper_chest")} stroke="#18181b" strokeWidth="1" />

            {/* Cơ bụng (Abs) */}
            <rect x="36" y="60" width="28" height="30" rx="2" fill={getFillColor("abs")} stroke="#18181b" strokeWidth="1.5" />
            {/* Rãnh bụng */}
            <line x1="50" y1="60" x2="50" y2="90" stroke="#18181b" strokeWidth="1" opacity="0.4" />
            <line x1="36" y1="70" x2="64" y2="70" stroke="#18181b" strokeWidth="1" opacity="0.4" />
            <line x1="36" y1="80" x2="64" y2="80" stroke="#18181b" strokeWidth="1" opacity="0.4" />

            {/* Vai trước (Front Delts) */}
            <path d="M 20 38 C 18 45, 23 50, 27 48 C 28 43, 25 38, 20 38 Z" fill={getFillColor("front_delts")} stroke="#18181b" strokeWidth="1" />
            <path d="M 80 38 C 82 45, 77 50, 73 48 C 72 43, 75 38, 80 38 Z" fill={getFillColor("front_delts")} stroke="#18181b" strokeWidth="1" />

            {/* Vai giữa (Lateral Delts) */}
            <path d="M 17 40 C 15 46, 19 52, 22 48 C 22 43, 20 39, 17 40 Z" fill={getFillColor("lateral_delts")} stroke="#18181b" strokeWidth="0.5" />
            <path d="M 83 40 C 85 46, 81 52, 78 48 C 78 43, 80 39, 83 40 Z" fill={getFillColor("lateral_delts")} stroke="#18181b" strokeWidth="0.5" />

            {/* Bắp tay trước (Biceps) */}
            <path d="M 23 49 C 20 58, 24 68, 26 68 C 28 64, 28 54, 27 48 Z" fill={getFillColor("biceps")} stroke="#18181b" strokeWidth="1" />
            <path d="M 77 49 C 80 58, 76 68, 74 68 C 72 64, 72 54, 73 48 Z" fill={getFillColor("biceps")} stroke="#18181b" strokeWidth="1" />

            {/* Cẳng tay (Forearms) */}
            <path d="M 26 69 L 20 95 L 25 97 L 28 69 Z" fill={getFillColor("forearms")} stroke="#18181b" strokeWidth="1" />
            <path d="M 74 69 L 80 95 L 75 97 L 72 69 Z" fill={getFillColor("forearms")} stroke="#18181b" strokeWidth="1" />

            {/* Bàn tay */}
            <circle cx="21" cy="101" r="4" fill="#27272a" stroke="#18181b" strokeWidth="0.5" />
            <circle cx="79" cy="101" r="4" fill="#27272a" stroke="#18181b" strokeWidth="0.5" />

            {/* Đùi trước (Quads) */}
            <path d="M 33 93 L 31 140 L 48 140 L 50 93 Z" fill={getFillColor("quads")} stroke="#18181b" strokeWidth="1.5" />
            <path d="M 67 93 L 69 140 L 52 140 L 50 93 Z" fill={getFillColor("quads")} stroke="#18181b" strokeWidth="1.5" />

            {/* Đầu gối */}
            <circle cx="39" cy="146" r="5" fill="#27272a" stroke="#18181b" strokeWidth="1" />
            <circle cx="61" cy="146" r="5" fill="#27272a" stroke="#18181b" strokeWidth="1" />

            {/* Bắp chuối trước (Calves) */}
            <path d="M 34 152 C 32 165, 36 188, 41 195 L 44 195 L 44 152 Z" fill={getFillColor("calves")} stroke="#18181b" strokeWidth="1" />
            <path d="M 66 152 C 68 165, 64 188, 59 195 L 56 195 L 56 152 Z" fill={getFillColor("calves")} stroke="#18181b" strokeWidth="1" />

            {/* Bàn chân */}
            <path d="M 37 196 L 33 210 L 44 210 L 43 196 Z" fill="#27272a" stroke="#18181b" strokeWidth="1" />
            <path d="M 63 196 L 67 210 L 56 210 L 57 196 Z" fill="#27272a" stroke="#18181b" strokeWidth="1" />
          </svg>
        </div>

        {/* MẶT SAU (POSTERIOR) */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Mặt sau</span>
          <svg width="100" height="220" viewBox="0 0 100 220" className="drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            {/* Đầu */}
            <circle cx="50" cy="18" r="10" fill="#27272a" stroke="#18181b" strokeWidth="1" />
            
            {/* Cổ */}
            <rect x="47" y="27" width="6" height="8" fill="#27272a" stroke="#18181b" strokeWidth="1" />

            {/* Cầu vai sau (Traps) */}
            <path d="M 38 35 L 50 28 L 62 35 L 50 48 Z" fill={getFillColor("traps")} stroke="#18181b" strokeWidth="1" />

            {/* Vai sau (Rear Delts) */}
            <path d="M 28 39 C 26 43, 28 47, 33 46 C 34 43, 31 39, 28 39 Z" fill={getFillColor("rear_delts")} stroke="#18181b" strokeWidth="1" />
            <path d="M 72 39 C 74 43, 72 47, 67 46 C 66 43, 69 39, 72 39 Z" fill={getFillColor("rear_delts")} stroke="#18181b" strokeWidth="1" />

            {/* Lưng trên (Upper Back) */}
            <path d="M 33 46 L 67 46 L 65 59 L 35 59 Z" fill={getFillColor("upper_back")} stroke="#18181b" strokeWidth="1.5" />

            {/* Cơ xô (Lats) */}
            <path d="M 32 59 L 45 59 L 45 78 L 36 78 Z" fill={getFillColor("lats")} stroke="#18181b" strokeWidth="1" />
            <path d="M 68 59 L 55 59 L 55 78 L 64 78 Z" fill={getFillColor("lats")} stroke="#18181b" strokeWidth="1" />

            {/* Tay sau (Triceps) */}
            <path d="M 23 48 C 26 53, 26 62, 25 68 C 23 64, 21 54, 22 48 Z" fill={getFillColor("triceps")} stroke="#18181b" strokeWidth="1" />
            <path d="M 77 48 C 74 53, 74 62, 75 68 C 77 64, 79 54, 78 48 Z" fill={getFillColor("triceps")} stroke="#18181b" strokeWidth="1" />

            {/* Cẳng tay sau */}
            <path d="M 25 69 L 20 95 L 24 97 L 27 69 Z" fill={getFillColor("forearms")} stroke="#18181b" strokeWidth="1" />
            <path d="M 75 69 L 80 95 L 76 97 L 73 69 Z" fill={getFillColor("forearms")} stroke="#18181b" strokeWidth="1" />

            {/* Bàn tay */}
            <circle cx="21" cy="101" r="4" fill="#27272a" stroke="#18181b" strokeWidth="0.5" />
            <circle cx="79" cy="101" r="4" fill="#27272a" stroke="#18181b" strokeWidth="0.5" />

            {/* Lưng dưới (Lower Back) */}
            <rect x="44" y="72" width="12" height="15" fill={getFillColor("lower_back")} stroke="#18181b" strokeWidth="1" />

            {/* Mông (Glutes) */}
            <path d="M 33 87 C 33 82, 50 82, 50 87 C 50 96, 33 96, 33 87 Z" fill={getFillColor("glutes")} stroke="#18181b" strokeWidth="1.5" />
            <path d="M 67 87 C 67 82, 50 82, 50 87 C 50 96, 67 96, 67 87 Z" fill={getFillColor("glutes")} stroke="#18181b" strokeWidth="1.5" />

            {/* Đùi sau (Hamstrings) */}
            <path d="M 33 97 L 32 140 L 48 140 L 49 97 Z" fill={getFillColor("hamstrings")} stroke="#18181b" strokeWidth="1.5" />
            <path d="M 67 97 L 68 140 L 52 140 L 51 97 Z" fill={getFillColor("hamstrings")} stroke="#18181b" strokeWidth="1.5" />

            {/* Khớp gối sau */}
            <circle cx="39" cy="146" r="4.5" fill="#27272a" stroke="#18181b" strokeWidth="1" />
            <circle cx="61" cy="146" r="4.5" fill="#27272a" stroke="#18181b" strokeWidth="1" />

            {/* Bắp chuối sau (Calves) */}
            <path d="M 33 151 C 30 165, 35 188, 41 195 L 45 195 L 45 151 Z" fill={getFillColor("calves")} stroke="#18181b" strokeWidth="1.5" />
            <path d="M 67 151 C 70 165, 65 188, 59 195 L 55 195 L 55 151 Z" fill={getFillColor("calves")} stroke="#18181b" strokeWidth="1.5" />

            {/* Bàn chân */}
            <path d="M 37 196 L 34 210 L 44 210 L 43 196 Z" fill="#27272a" stroke="#18181b" strokeWidth="1" />
            <path d="M 63 196 L 66 210 L 56 210 L 57 196 Z" fill="#27272a" stroke="#18181b" strokeWidth="1" />
          </svg>
        </div>
      </div>

      <div className="w-full mt-1 px-2 py-1 bg-zinc-950/60 rounded-lg text-center">
        <span className="text-[10px] text-zinc-400">
          Nhóm cơ chính tác động: <span className="text-lime-400 font-bold capitalize">{targetMuscles.join(', ') || 'Không'}</span>
        </span>
      </div>
    </div>
  );
}
