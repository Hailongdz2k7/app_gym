import React, { useState } from "react";
import { X, RefreshCw, Wifi, WifiOff, Server, Database, CheckCircle2, AlertCircle, Clock, Zap, ArrowUpRight } from "lucide-react";
import { useConnection } from "../context/ConnectionContext";
import { isSupabaseConfigured } from "../supabaseClient";

export default function ConnectionModal({ isOpen, onClose, isDemoMode }) {
  const { 
    connectionStatus, 
    pingLatency, 
    lastSyncedAt, 
    pendingCount, 
    isSyncing, 
    checkConnection, 
    forceSyncNow,
    addToast 
  } = useConnection();

  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    const health = await checkConnection();
    setTesting(false);
    if (health.status === "online") {
      addToast(`Kết nối Server thành công! Độ trễ: ${health.latency}ms`, "success");
    } else {
      addToast(`Kết nối thất bại: ${health.message}`, "error");
    }
  };

  const getStatusBadge = () => {
    if (isDemoMode) {
      return (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl text-xs font-black">
          <Zap size={14} /> CHẾ ĐỘ DEMO (OFFLINE)
        </div>
      );
    }
    switch (connectionStatus) {
      case "online":
        return (
          <div className="flex items-center gap-2 bg-lime-400/10 border border-lime-400/20 text-lime-400 px-3 py-1.5 rounded-xl text-xs font-black">
            <Wifi size={14} /> KẾT NỐI TRỰC TUYẾN ({pingLatency ? `${pingLatency}ms` : "OK"})
          </div>
        );
      case "offline":
        return (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-xl text-xs font-black">
            <WifiOff size={14} /> MẤT KẾT NỐI INTERNET
          </div>
        );
      case "unreachable":
        return (
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1.5 rounded-xl text-xs font-black">
            <Server size={14} /> UNREACHABLE (SUPABASE LỖI)
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-xl text-xs font-black animate-pulse">
            <RefreshCw size={14} className="animate-spin" /> ĐANG KIỂM TRA...
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm flex flex-col shadow-2xl relative text-zinc-100">
        
        {/* Nút Đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 p-1.5 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 bg-lime-500/10 text-lime-400 rounded-2xl border border-lime-400/20">
            <Server size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Kết Nối Server & Đồng Bộ</h3>
            <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Trạng thái hạ tầng dữ liệu</p>
          </div>
        </div>

        {/* Trạng thái hiện tại */}
        <div className="bg-zinc-950/80 border border-zinc-850 rounded-2xl p-4 mb-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Trạng thái kết nối</span>
            {getStatusBadge()}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900 text-xs">
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-bold uppercase">Độ trễ Server (Ping)</span>
              <span className="font-mono font-bold text-zinc-200 mt-0.5">
                {pingLatency !== null ? `${pingLatency} ms` : "--"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-bold uppercase">Đã đồng bộ gần nhất</span>
              <span className="font-mono font-bold text-zinc-200 mt-0.5">
                {lastSyncedAt || "Vừa xong"}
              </span>
            </div>
          </div>

          {pendingCount > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 flex items-center justify-between">
              <span className="text-[10px] text-amber-400 font-bold">Đang chờ đồng bộ: {pendingCount} tác vụ</span>
              <span className="text-[9px] bg-amber-400 text-zinc-950 font-black px-2 py-0.5 rounded-lg">OFFLINE QUEUE</span>
            </div>
          )}
        </div>

        {/* Chi tiết cấu hình kết nối */}
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-2xl p-3.5 mb-5 flex flex-col gap-2">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Database size={12} className="text-lime-400" /> Cấu hình CSDL Supabase
          </span>
          <div className="text-[11px] text-zinc-300 font-mono bg-zinc-900/80 p-2 rounded-xl border border-zinc-850 truncate">
            {localStorage.getItem("flexifit-supabase-url") || import.meta.env.VITE_SUPABASE_URL || "Chưa cấu hình URL"}
          </div>
        </div>

        {/* Các nút Thử lại kết nối & Đồng bộ ngay */}
        <div className="flex gap-2">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 font-bold py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-zinc-750"
          >
            <RefreshCw size={14} className={testing ? "animate-spin" : ""} />
            {testing ? "Đang kiểm tra..." : "Kiểm tra kết nối"}
          </button>

          <button
            onClick={forceSyncNow}
            disabled={isSyncing || isDemoMode}
            className="flex-1 bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-zinc-950 font-black py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-lime-500/10"
          >
            <Zap size={14} className={isSyncing ? "animate-bounce" : ""} />
            {isSyncing ? "Đang đồng bộ..." : "Đồng bộ ngay"}
          </button>
        </div>

      </div>
    </div>
  );
}
