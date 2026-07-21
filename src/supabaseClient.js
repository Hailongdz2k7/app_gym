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

