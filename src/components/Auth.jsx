import React, { useState } from "react";
import { supabase, isSupabaseConfigured, setSupabaseConfig, clearSupabaseConfig, isEnvConfigured } from "../supabaseClient";
import { Dumbbell, Mail, Lock, LogIn, UserPlus, AlertCircle, Play, Settings, Save, RotateCcw, Link } from "lucide-react";

export default function Auth({ onAuthSuccess, onStartDemo }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // Trạng thái mở giao diện cấu hình Supabase
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [inputUrl, setInputUrl] = useState(localStorage.getItem("flexifit-supabase-url") || "");
  const [inputKey, setInputKey] = useState(localStorage.getItem("flexifit-supabase-anon-key") || "");

  const [hasConfig, setHasConfig] = useState(isSupabaseConfigured());
  const hasEnvConfig = isEnvConfigured();

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!hasConfig) {
      setErrorMsg("Supabase chưa được cấu hình. Vui lòng bấm nút 'Cấu hình Supabase' bên dưới để nhập kết nối.");
      return;
    }

    if (!email || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      if (isLogin) {
        // ĐĂNG NHẬP
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        
        setInfoMsg("Đăng nhập thành công!");
        if (onAuthSuccess) onAuthSuccess(data.user);
      } else {
        // ĐĂNG KÝ
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });

        if (error) throw error;

        if (data?.user) {
          // Khởi tạo profile cho user mới
          const { error: profileError } = await supabase
            .from("profiles")
            .insert([
              { 
                id: data.user.id, 
                email: email, 
                height: 170, 
                role: email.toLowerCase().includes("admin@") ? "admin" : "member" 
              }
            ]);

          if (profileError) {
            console.error("Lỗi tạo profile:", profileError.message);
          }

          setInfoMsg("Đăng ký thành công! Hãy đăng nhập ngay.");
          setIsLogin(true);
        }
      }
    } catch (error) {
      setErrorMsg(error.message || "Có lỗi xảy ra trong quá trình xác thực.");
    } finally {
      setLoading(false);
    }
  };

  // Lưu cấu hình Supabase nhập từ UI
  const handleSaveConfig = (e) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");

    if (!inputUrl || !inputKey) {
      setErrorMsg("Vui lòng điền đủ URL và Anon Key.");
      return;
    }

    if (!inputUrl.startsWith("http")) {
      setErrorMsg("Supabase URL phải bắt đầu bằng http:// hoặc https://");
      return;
    }

    try {
      setSupabaseConfig(inputUrl, inputKey);
      const isOk = isSupabaseConfigured();
      setHasConfig(isOk);

      if (isOk) {
        setInfoMsg("Kết nối Supabase thành công và đã lưu cấu hình!");
        setShowConfigForm(false);
      } else {
        setErrorMsg("Thông tin cấu hình không hợp lệ.");
      }
    } catch (err) {
      setErrorMsg("Lỗi khi kết nối: " + err.message);
    }
  };

  // Khôi phục mặc định (xóa cấu hình localStorage)
  const handleResetConfig = () => {
    clearSupabaseConfig();
    setInputUrl("");
    setInputKey("");
    setHasConfig(isSupabaseConfigured());
    setInfoMsg("Đã xóa cấu hình thủ công, khôi phục mặc định.");
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4 py-8 text-zinc-100 select-none max-w-md mx-auto w-full">
      {/* LOGO */}
      <div className="flex flex-col items-center mb-8">
        <div className="p-4 bg-lime-500 text-zinc-950 rounded-3xl shadow-xl shadow-lime-500/10 mb-4 animate-bounce">
          <Dumbbell size={36} className="fill-zinc-950" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">FlexiFit</h1>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">Kỷ luật • Sức mạnh • Tăng tiến</p>
      </div>

      {/* CARD FORM CHÍNH */}
      <div className="bg-zinc-900 border border-zinc-900 rounded-3xl p-6 shadow-2xl w-full relative overflow-hidden">
        
        {/* THÔNG BÁO LỖI/INFO */}
        {errorMsg && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-3.5 flex gap-2.5 items-start">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-red-400 font-medium leading-normal">{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="mb-4 bg-lime-400/10 border border-lime-400/20 rounded-2xl p-3.5 flex gap-2.5 items-start">
            <CheckCircle2 size={16} className="text-lime-400 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-lime-400 font-medium leading-normal">{infoMsg}</span>
          </div>
        )}

        {!showConfigForm ? (
          /* ================= GIAO DIỆN AUTH ĐĂNG NHẬP / ĐĂNG KÝ ================= */
          <div className="flex flex-col">
            {/* Thanh chuyển chế độ */}
            <div className="flex bg-zinc-950/80 rounded-2xl p-1 mb-6 border border-zinc-800/40">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setErrorMsg("");
                  setInfoMsg("");
                }}
                className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all ${
                  isLogin ? "bg-lime-500 text-zinc-950" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setErrorMsg("");
                  setInfoMsg("");
                }}
                className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all ${
                  !isLogin ? "bg-lime-500 text-zinc-950" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Đăng ký
              </button>
            </div>

            {/* CẢNH BÁO CHƯA KẾT NỐI SUPABASE */}
            {!hasConfig && (
              <div className="mb-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start">
                <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-[10px] text-zinc-400 leading-relaxed">
                  <span className="text-amber-500 font-black uppercase block mb-1">Chưa kết nối dữ liệu</span>
                  Chưa thiết lập liên kết dự án Supabase. Bạn cần cấu hình kết nối để có thể Đăng nhập/Đăng ký tài khoản và lưu lịch sử.
                </div>
              </div>
            )}

            {/* FORM ĐĂNG NHẬP/ĐĂNG KÝ */}
            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1 px-1">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="ten-cua-ban@vi-du.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-bold focus:border-lime-400 focus:outline-none placeholder-zinc-700"
                  />
                  <Mail className="absolute left-3.5 top-4 text-zinc-600" size={14} />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1 px-1">Mật khẩu</label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-bold focus:border-lime-400 focus:outline-none placeholder-zinc-700"
                  />
                  <Lock className="absolute left-3.5 top-4 text-zinc-600" size={14} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-lime-500 hover:bg-lime-400 disabled:opacity-50 text-zinc-950 font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-lime-500/10 transition-all text-xs active:scale-98"
              >
                {loading ? (
                  <span className="text-xs uppercase animate-pulse">Đang xử lý...</span>
                ) : isLogin ? (
                  <>
                    <LogIn size={14} /> ĐĂNG NHẬP
                  </>
                ) : (
                  <>
                    <UserPlus size={14} /> ĐĂNG KÝ
                  </>
                )}
              </button>
            </form>

            {/* BUTTON MỞ CONFIG & DEMO */}
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex flex-col gap-2.5">
              {!hasEnvConfig && (
                <button
                  onClick={() => {
                    setShowConfigForm(true);
                    setErrorMsg("");
                    setInfoMsg("");
                  }}
                  className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-zinc-300 font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs active:scale-98"
                >
                  <Settings size={12} className="text-lime-400" /> CẤU HÌNH LIÊN KẾT SUPABASE
                </button>
              )}

              <button
                onClick={onStartDemo}
                className="w-full border border-dashed border-zinc-800 hover:border-lime-500/40 text-zinc-400 hover:text-lime-400 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all text-xs active:scale-98"
              >
                <Play size={10} fill="currentColor" /> DÙNG THỬ CHẾ ĐỘ DEMO OFFLINE
              </button>
            </div>
          </div>
        ) : (
          /* ================= GIAO DIỆN CẤU HÌNH SUPABASE DÀNH CHO USER ================= */
          <form onSubmit={handleSaveConfig} className="flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-3">
              <h2 className="text-xs font-black text-white uppercase flex items-center gap-1.5">
                <Link size={14} className="text-lime-400" /> Cấu hình Supabase
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowConfigForm(false);
                  setErrorMsg("");
                  setInfoMsg("");
                }}
                className="text-zinc-500 hover:text-zinc-300 text-xs font-bold"
              >
                Hủy
              </button>
            </div>

            <p className="text-[10px] text-zinc-500 leading-normal mb-5 font-semibold">
              Nhập các khóa API của dự án Supabase để kích hoạt tính năng lưu tiến trình đám mây thời gian thực.
            </p>

            {/* Supabase URL Input */}
            <div className="flex flex-col mb-4">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Supabase Project URL *</label>
              <input
                type="url"
                placeholder="https://xxx.supabase.co"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl py-3 px-4 text-xs font-bold focus:border-lime-400 focus:outline-none"
                required
              />
            </div>

            {/* Supabase Anon Key Input */}
            <div className="flex flex-col mb-5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Supabase Anon Key *</label>
              <textarea
                placeholder="eyJhbGciOi..."
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl py-3 px-4 text-xs font-bold focus:border-lime-400 focus:outline-none h-20 leading-relaxed"
                required
              />
            </div>

            {/* Buttons lưu/reset */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleResetConfig}
                className="flex-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-zinc-200 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
              >
                <RotateCcw size={12} /> XÓA CẤU HÌNH
              </button>
              
              <button
                type="submit"
                className="flex-1 bg-lime-500 hover:bg-lime-400 text-zinc-950 py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1 active:scale-95 shadow-lg shadow-lime-500/10"
              >
                <Save size={12} /> LƯU KẾT NỐI
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Subcomponent CheckCircle2
function CheckCircle2({ size = 16, className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
