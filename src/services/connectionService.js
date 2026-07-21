import { pingSupabase, supabase, isSupabaseConfigured } from "../supabaseClient";

const QUEUE_STORAGE_KEY = "flexifit_pending_sync_queue";

// Lấy danh sách tác vụ đang chờ đồng bộ từ LocalStorage
export const getPendingSyncQueue = () => {
  try {
    const data = localStorage.getItem(QUEUE_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Lỗi đọc hàng chờ đồng bộ:", e);
    return [];
  }
};

// Thêm tác vụ vào hàng chờ đồng bộ offline
export const queueOfflineAction = (actionType, payload) => {
  try {
    const queue = getPendingSyncQueue();
    // Tránh trùng lặp tác vụ cũ nếu có cùng key
    const filtered = queue.filter(item => !(item.actionType === actionType && item.payload.id === payload.id && item.payload.date === payload.date));
    filtered.push({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      actionType,
      payload,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Lỗi lưu hàng chờ đồng bộ:", e);
  }
};

// Xóa một tác vụ khỏi hàng chờ
export const removeQueueItem = (itemId) => {
  try {
    const queue = getPendingSyncQueue();
    const updated = queue.filter(item => item.id !== itemId);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Lỗi xóa tác vụ hàng chờ:", e);
  }
};

// Xóa toàn bộ hàng chờ
export const clearSyncQueue = () => {
  localStorage.removeItem(QUEUE_STORAGE_KEY);
};

// Xả và xử lý toàn bộ hàng chờ đồng bộ đẩy lên Supabase
export const flushSyncQueue = async (userId) => {
  if (!userId || !isSupabaseConfigured()) return { success: true, processed: 0 };

  const queue = getPendingSyncQueue();
  if (queue.length === 0) return { success: true, processed: 0 };

  let processedCount = 0;

  for (const item of queue) {
    try {
      if (item.actionType === "SAVE_SETS") {
        const { date, exerciseId, setsArray, completed } = item.payload;
        await supabase
          .from("user_logs")
          .delete()
          .eq("user_id", userId)
          .eq("date", date)
          .eq("exercise_id", exerciseId);

        await supabase
          .from("user_logs")
          .insert({
            user_id: userId,
            date,
            exercise_id: exerciseId,
            sets_data: setsArray,
            completed
          });
        processedCount++;
      } else if (item.actionType === "SAVE_SPLIT") {
        const { splitData } = item.payload;
        await supabase
          .from("custom_workout_splits")
          .upsert({ user_id: userId, split_data: splitData }, { onConflict: "user_id" });
        processedCount++;
      } else if (item.actionType === "SAVE_WEIGHT") {
        const { date, weight } = item.payload;
        await supabase
          .from("weight_history")
          .delete()
          .eq("user_id", userId)
          .eq("date", date);

        if (weight !== null && weight !== undefined) {
          await supabase
            .from("weight_history")
            .insert({ user_id: userId, date, weight });
        }
        processedCount++;
      } else if (item.actionType === "SAVE_HEIGHT") {
        const { height } = item.payload;
        await supabase
          .from("profiles")
          .update({ height })
          .eq("id", userId);
        processedCount++;
      }
      removeQueueItem(item.id);
    } catch (e) {
      console.warn("Lỗi khi xử lý tác vụ hàng chờ đồng bộ:", item.actionType, e.message);
    }
  }

  return { success: true, processed: processedCount };
};

// Kiểm tra toàn diện kết nối tới server Supabase
export const checkServerHealth = async () => {
  if (!navigator.onLine) {
    return { status: "offline", latency: null, message: "Trình duyệt đang ở chế độ Mất mạng (Offline)" };
  }

  if (!isSupabaseConfigured()) {
    return { status: "unconfigured", latency: null, message: "Chưa thiết lập URL và Anon Key kết nối Supabase" };
  }

  const pingRes = await pingSupabase();
  if (pingRes.ok) {
    return { status: "online", latency: pingRes.latency, message: `Kết nối hoạt động tốt (${pingRes.latency}ms)` };
  } else {
    return { status: "unreachable", latency: pingRes.latency, message: pingRes.error || "Không thể kết nối với server Supabase" };
  }
};
