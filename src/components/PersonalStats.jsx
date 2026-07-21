import React, { useState } from "react";
import { Scale, Heart, Calendar, Plus, Trash2, Award, Info, Sparkles, TrendingUp } from "lucide-react";

export default function PersonalStats({ 
  weightHistory = [], 
  setWeightHistory, 
  height = 170, 
  setHeight,
  workoutHistory = {}
}) {
  const [newWeight, setNewWeight] = useState("");
  const [tempHeight, setTempHeight] = useState(height);
  const [showHeightForm, setShowHeightForm] = useState(false);

  // Lấy ngày hiện tại
  const getTodayDateString = () => {
    return new Date().toISOString().split("T")[0];
  };

  // Thêm cân nặng mới
  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!newWeight || isNaN(newWeight) || parseFloat(newWeight) <= 0) return;

    const todayStr = getTodayDateString();
    const parsedWeight = parseFloat(parseFloat(newWeight).toFixed(1));

    setWeightHistory(prev => {
      // Nếu hôm nay đã nhập rồi, ta cập nhật đè lên, ngược lại thêm mới
      const filtered = prev.filter(item => item.date !== todayStr);
      const updated = [...filtered, { date: todayStr, weight: parsedWeight }];
      // Sắp xếp tăng dần theo ngày
      return updated.sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    setNewWeight("");
  };

  // Xóa một dòng cân nặng
  const handleRemoveWeight = (date) => {
    setWeightHistory(prev => prev.filter(item => item.date !== date));
  };

  // Cập nhật chiều cao
  const handleSaveHeight = (e) => {
    e.preventDefault();
    const parsedHeight = parseFloat(tempHeight);
    if (parsedHeight > 50 && parsedHeight < 300) {
      setHeight(parsedHeight);
      setShowHeightForm(false);
    }
  };

  // Lấy cân nặng hiện tại (mới nhất)
  const getCurrentWeight = () => {
    if (weightHistory.length === 0) return 0;
    return weightHistory[weightHistory.length - 1].weight;
  };

  const currentWeight = getCurrentWeight();

  // Tính BMI
  const calculateBMI = () => {
    if (!currentWeight || !height) return 0;
    const heightInMeters = height / 100;
    return parseFloat((currentWeight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const bmi = calculateBMI();

  // Lấy phân loại và màu sắc BMI
  const getBMICategory = (bmiValue) => {
    if (bmiValue === 0) return { label: "Chưa có dữ liệu", color: "text-zinc-500", bg: "bg-zinc-900", desc: "Vui lòng nhập cân nặng và chiều cao." };
    if (bmiValue < 18.5) return { label: "Thiếu cân", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", desc: "Bạn cần nạp năng lượng dư thừa calo để tăng cân lành mạnh." };
    if (bmiValue < 24.9) return { label: "Bình thường", color: "text-lime-400", bg: "bg-lime-400/10", border: "border-lime-400/20", desc: "Tuyệt vời! Chỉ số cơ thể của bạn rất cân đối. Hãy tiếp tục duy trì!" };
    if (bmiValue < 29.9) return { label: "Thừa cân", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", desc: "Hơi dư mỡ một chút, tăng cường cardio và tập tạ để cải thiện thành phần cơ thể." };
    return { label: "Béo phì", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", desc: "Hãy điều chỉnh chế độ ăn giảm calo và tập luyện đều đặn để bảo vệ sức khỏe." };
  };

  const bmiInfo = getBMICategory(bmi);

  // Vẽ biểu đồ SVG cân nặng
  const renderWeightChart = () => {
    if (weightHistory.length < 2) {
      return (
        <div className="flex flex-col items-center justify-center h-40 bg-zinc-950/40 rounded-2xl border border-zinc-900/60 p-4 text-center">
          <TrendingUp size={24} className="text-zinc-600 mb-2" />
          <p className="text-xs text-zinc-500">Cần ít nhất 2 ngày dữ liệu cân nặng khác nhau để vẽ biểu đồ tiến độ.</p>
        </div>
      );
    }

    const chartWidth = 320;
    const chartHeight = 130;
    const padding = 15;

    const weights = weightHistory.map(item => item.weight);
    const minWeight = Math.min(...weights) - 1;
    const maxWeight = Math.max(...weights) + 1;
    const weightRange = maxWeight - minWeight;

    // Tính tọa độ cho từng điểm
    const points = weightHistory.map((item, index) => {
      const x = padding + (index / (weightHistory.length - 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - ((item.weight - minWeight) / weightRange) * (chartHeight - padding * 2);
      return { x, y, weight: item.weight, date: item.date };
    });

    // Tạo chuỗi đường dẫn (path d) cho SVG
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Tạo đường cong mượt thay vì vẽ gấp khúc thẳng
      const cpX1 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY1 = points[i - 1].y;
      const cpX2 = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
      const cpY2 = points[i].y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }

    // Đường gradient đổ màu phía dưới
    const fillD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

    return (
      <div className="bg-zinc-900 border border-zinc-900 rounded-3xl p-5 shadow-xl w-full">
        <h3 className="text-xs font-black text-white mb-3 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp size={14} className="text-lime-400" /> Biểu đồ xu hướng cân nặng
        </h3>
        <div className="relative w-full overflow-x-auto no-scrollbar">
          <svg width={chartWidth} height={chartHeight} className="mx-auto overflow-visible">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a3e635" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#a3e635" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Trục nền ngang */}
            <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#27272a" strokeWidth="1" />
            <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

            {/* Vùng Gradient bên dưới đường vẽ */}
            <path d={fillD} fill="url(#chartGradient)" />

            {/* Đường vẽ chính */}
            <path d={pathD} fill="none" stroke="#a3e635" strokeWidth="2.5" strokeLinecap="round" />

            {/* Các điểm nút tròn */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="4" 
                  fill="#09090b" 
                  stroke="#a3e635" 
                  strokeWidth="2" 
                />
                {/* Chỉ hiển thị nhãn cho điểm đầu, cuối và các điểm cực trị để tránh đè chữ */}
                {(idx === 0 || idx === points.length - 1 || idx % 2 === 0) && (
                  <text 
                    x={p.x} 
                    y={p.y - 8} 
                    fill="#a1a1aa" 
                    fontSize="9" 
                    fontWeight="bold"
                    textAnchor="middle" 
                    className="font-mono"
                  >
                    {p.weight}kg
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
        <div className="flex justify-between text-[8px] text-zinc-500 font-bold uppercase mt-2 px-2">
          <span>{weightHistory[0].date.split("-").slice(1).reverse().join("/")}</span>
          <span>Hành trình cân nặng</span>
          <span>{weightHistory[weightHistory.length - 1].date.split("-").slice(1).reverse().join("/")}</span>
        </div>
      </div>
    );
  };

  // Đọc danh sách lịch sử tập luyện gần đây
  const getRecentWorkouts = () => {
    const dates = Object.keys(workoutHistory).sort().reverse().slice(0, 5); // 5 ngày gần nhất
    return dates.map(date => {
      const data = workoutHistory[date];
      let completedSets = 0;
      let totalSets = 0;

      if (data && data.sets) {
        Object.keys(data.sets).forEach(exId => {
          const sets = data.sets[exId] || [];
          totalSets += sets.length;
          completedSets += sets.filter(s => s.completed).length;
        });
      }

      const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

      return {
        date,
        dayName: data.dayName || "Buổi tập luyện",
        type: data.type || "custom",
        progress
      };
    });
  };

  const recentWorkouts = getRecentWorkouts();

  return (
    <div className="flex flex-col gap-5 px-4 pt-4 pb-20 max-w-md mx-auto text-zinc-100 min-h-screen bg-zinc-950">
      
      {/* KHU VỰC THÔNG SỐ TÓM TẮT CHỈ SỐ CƠ THỂ */}
      <div className="bg-zinc-900 border border-zinc-900 rounded-3xl p-5 shadow-xl">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Scale className="text-lime-400" size={20} />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Chỉ số cơ thể</h2>
          </div>
          <button 
            onClick={() => {
              setTempHeight(height);
              setShowHeightForm(!showHeightForm);
            }}
            className="text-xs text-lime-400 font-bold hover:underline"
          >
            Sửa chiều cao
          </button>
        </div>

        {/* Chiều cao hiển thị / form sửa */}
        {showHeightForm ? (
          <form onSubmit={handleSaveHeight} className="mt-3 flex gap-2">
            <input 
              type="number" 
              value={tempHeight}
              onChange={(e) => setTempHeight(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-sm w-28 font-mono focus:border-lime-400 focus:outline-none"
              placeholder="Chiều cao (cm)"
            />
            <button 
              type="submit" 
              className="bg-lime-500 hover:bg-lime-400 text-zinc-950 px-4 py-1.5 rounded-xl text-xs font-bold"
            >
              Lưu
            </button>
          </form>
        ) : (
          <p className="text-xs text-zinc-400 mt-1">
            Chiều cao: <span className="text-zinc-200 font-bold font-mono">{height} cm</span>
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mt-5">
          {/* Cân nặng hiện tại */}
          <div className="bg-zinc-950/60 border border-zinc-950 rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Cân nặng hiện tại</span>
            <span className="text-2xl font-black text-white font-mono mt-1">
              {currentWeight > 0 ? `${currentWeight} kg` : "--"}
            </span>
          </div>

          {/* Chỉ số BMI */}
          <div className="bg-zinc-950/60 border border-zinc-950 rounded-2xl p-4 flex flex-col justify-center">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Chỉ số BMI</span>
            <span className="text-2xl font-black text-white font-mono mt-1">
              {bmi > 0 ? bmi : "--"}
            </span>
          </div>
        </div>

        {/* Khung trạng thái BMI */}
        {bmi > 0 && (
          <div className={`mt-4 rounded-2xl border p-4 ${bmiInfo.bg} ${bmiInfo.border || "border-zinc-800"}`}>
            <div className="flex items-center gap-1.5">
              <Heart size={15} className={bmiInfo.color} />
              <span className={`text-xs font-black uppercase tracking-wider ${bmiInfo.color}`}>
                Trạng thái: {bmiInfo.label}
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1.5 leading-normal font-medium">
              {bmiInfo.desc}
            </p>
          </div>
        )}
      </div>

      {/* FORM NHẬP CÂN NẶNG HÀNG NGÀY */}
      <div className="bg-zinc-900 border border-zinc-900 rounded-3xl p-5 shadow-xl">
        <h3 className="text-xs font-black text-white mb-3 uppercase tracking-wider flex items-center gap-1.5">
          <Plus size={14} className="text-lime-400" /> Nhập cân nặng hôm nay
        </h3>
        <form onSubmit={handleAddWeight} className="flex gap-3">
          <input 
            type="number" 
            step="0.1"
            placeholder="Ví dụ: 68.5"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 text-sm font-bold font-mono focus:border-lime-400 focus:outline-none"
          />
          <button 
            type="submit" 
            className="bg-lime-500 hover:bg-lime-400 text-zinc-950 font-black px-6 py-3 rounded-2xl text-xs flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-lime-500/5"
          >
            LƯU LẠI
          </button>
        </form>
      </div>

      {/* BIỂU ĐỒ CÂN NẶNG */}
      {renderWeightChart()}

      {/* NHẬT KÝ TIẾN ĐỘ TẬP LUYỆN */}
      <div className="bg-zinc-900 border border-zinc-900 rounded-3xl p-5 shadow-xl">
        <h3 className="text-xs font-black text-white mb-4 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar size={14} className="text-lime-400" /> Nhật ký tập luyện gần đây
        </h3>

        <div className="flex flex-col gap-3">
          {recentWorkouts.map((w, idx) => (
            <div 
              key={w.date} 
              className="bg-zinc-950/60 border border-zinc-950 rounded-2xl p-3.5 flex items-center justify-between"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-zinc-500 font-mono font-bold">
                  {w.date.split("-").reverse().join("/")}
                </span>
                <span className="text-xs font-bold text-zinc-200 truncate mt-0.5">{w.dayName}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-black font-mono ${w.progress === 100 ? 'text-lime-400' : 'text-zinc-400'}`}>
                    Hoàn thành {w.progress}%
                  </span>
                  <div className="w-16 bg-zinc-800 rounded-full h-1 mt-1 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${w.progress === 100 ? 'bg-lime-400' : 'bg-zinc-400'}`} 
                      style={{ width: `${w.progress}%` }}
                    ></div>
                  </div>
                </div>
                {w.progress === 100 && (
                  <Award size={18} className="text-lime-400" />
                )}
              </div>
            </div>
          ))}

          {recentWorkouts.length === 0 && (
            <div className="text-center py-6 text-zinc-500 flex flex-col items-center">
              <Calendar size={20} className="text-zinc-700 mb-1.5" />
              <p className="text-xs">Chưa có lịch sử buổi tập nào được ghi lại.</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">Bắt đầu tập luyện để ghi nhận nhật ký của bạn!</p>
            </div>
          )}
        </div>
      </div>

      {/* LỊCH SỬ SỐ LIỆU CÂN NẶNG CH TIẾT */}
      {weightHistory.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-900 rounded-3xl p-5 shadow-xl">
          <h3 className="text-xs font-black text-white mb-3 uppercase tracking-wider">
            Nhật ký chỉ số cân nặng
          </h3>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar">
            {weightHistory.slice().reverse().map(item => (
              <div 
                key={item.date} 
                className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
              >
                <span className="text-xs font-medium text-zinc-400 font-mono">
                  {item.date.split("-").reverse().join("/")}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-200 font-mono">{item.weight} kg</span>
                  <button 
                    onClick={() => handleRemoveWeight(item.date)}
                    className="text-zinc-600 hover:text-red-400 p-1 rounded transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
