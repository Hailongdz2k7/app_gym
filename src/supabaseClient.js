import { createClient } from '@supabase/supabase-js'

// 1. Đọc cấu hình ưu tiên từ LocalStorage (được nhập động từ UI), sau đó mới tới file .env
const getInitialConfig = () => {
  const localUrl = localStorage.getItem("flexifit-supabase-url");
  const localKey = localStorage.getItem("flexifit-supabase-anon-key");

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return {
    url: localUrl || envUrl || 'https://placeholder.supabase.co',
    key: localKey || envKey || 'placeholder-key'
  };
};

const initialConfig = getInitialConfig();

// Sử dụng 'let' để có thể gán lại instance client động khi người dùng thay đổi cấu hình từ giao diện
export let supabase = createClient(initialConfig.url, initialConfig.key);

// Hàm cập nhật lại Supabase client động và lưu cấu hình vào LocalStorage
export const setSupabaseConfig = (url, key) => {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();

  localStorage.setItem("flexifit-supabase-url", cleanUrl);
  localStorage.setItem("flexifit-supabase-anon-key", cleanKey);
  
  // Khởi tạo lại client với thông tin mới
  supabase = createClient(cleanUrl, cleanKey);
};

// Hàm xóa cấu hình Supabase đã lưu
export const clearSupabaseConfig = () => {
  localStorage.removeItem("flexifit-supabase-url");
  localStorage.removeItem("flexifit-supabase-anon-key");
  
  const envConfig = getInitialConfig();
  supabase = createClient(envConfig.url, envConfig.key);
};

// Kiểm tra xem Supabase đã được cấu hình hợp lệ chưa
export const isSupabaseConfigured = () => {
  const localUrl = localStorage.getItem("flexifit-supabase-url");
  const localKey = localStorage.getItem("flexifit-supabase-anon-key");

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const activeUrl = localUrl || envUrl;
  const activeKey = localKey || envKey;

  return (
    activeUrl && 
    activeUrl !== 'https://your-project-ref.supabase.co' &&
    activeUrl !== 'https://placeholder.supabase.co' &&
    activeKey && 
    activeKey !== 'your-anon-key' &&
    activeKey !== 'placeholder-key'
  );
};

// Kiểm tra xem cấu hình đã có sẵn cố định trong tệp môi trường (.env) của server chưa
export const isEnvConfigured = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    envUrl && 
    envUrl !== 'https://your-project-ref.supabase.co' &&
    envUrl !== 'https://placeholder.supabase.co' &&
    envKey && 
    envKey !== 'your-anon-key' &&
    envKey !== 'placeholder-key'
  );
};

// Hàm kiểm tra trực tiếp khả năng phản hồi thực tế (Ping latency) của Supabase backend
export const pingSupabase = async () => {
  if (!isSupabaseConfigured()) {
    return { ok: false, latency: null, error: 'Chưa cấu hình Supabase URL & Key' };
  }

  const startTime = performance.now();
  try {
    // Thực hiện truy vấn kiểm tra nhẹ tới bảng exercises_db hoặc RPC auth
    const { error } = await supabase.from('exercises_db').select('id', { count: 'exact', head: true });
    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);

    if (error && error.code !== 'PGRST116') {
      // Một số lỗi RLS hoặc bảng chưa tạo vẫn coi là đã kết nối được với server HTTP
      if (error.status >= 200 && error.status < 500) {
        return { ok: true, latency, status: error.status };
      }
      return { ok: false, latency, error: error.message };
    }
    return { ok: true, latency };
  } catch (err) {
    const endTime = performance.now();
    return { ok: false, latency: Math.round(endTime - startTime), error: err.message || 'Mất kết nối mạng' };
  }
};


