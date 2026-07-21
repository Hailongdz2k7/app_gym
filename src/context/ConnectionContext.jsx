import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { checkServerHealth, flushSyncQueue, getPendingSyncQueue } from "../services/connectionService";

const ConnectionContext = createContext(null);

export function ConnectionProvider({ children, currentUserId }) {
  const [connectionStatus, setConnectionStatus] = useState("checking"); // 'online' | 'offline' | 'unreachable' | 'demo' | 'checking'
  const [pingLatency, setPingLatency] = useState(null);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [pendingCount, setPendingCount] = useState(getPendingSyncQueue().length);
  const [isSyncing, setIsSyncing] = useState(false);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Hàm thực hiện kiểm tra kết nối với server
  const checkConnection = useCallback(async (silent = false) => {
    if (!silent) setConnectionStatus("checking");

    const health = await checkServerHealth();
    setConnectionStatus(health.status);
    setPingLatency(health.latency);
    setPendingCount(getPendingSyncQueue().length);

    return health;
  }, []);

  // Hàm ép buộc thực hiện đồng bộ ngay lập tức
  const forceSyncNow = useCallback(async () => {
    if (!currentUserId || currentUserId === "demo") {
      addToast("Đang ở chế độ Demo Offline. Không thể đồng bộ với đám mây.", "warning");
      return;
    }

    setIsSyncing(true);
    addToast("Đang kiểm tra kết nối và đồng bộ dữ liệu...", "info");

    const health = await checkConnection(true);
    if (health.status !== "online") {
      setIsSyncing(false);
      addToast(`Không thể đồng bộ: ${health.message}`, "error");
      return;
    }

    try {
      const res = await flushSyncQueue(currentUserId);
      setLastSyncedAt(new Date().toLocaleTimeString("vi-VN"));
      setPendingCount(getPendingSyncQueue().length);
      addToast(`Đồng bộ thành công! (${res.processed} tác vụ)`, "success");
    } catch (err) {
      addToast("Lỗi khi đồng bộ dữ liệu: " + err.message, "error");
    } finally {
      setIsSyncing(false);
    }
  }, [currentUserId, checkConnection, addToast]);

  // Lắng nghe sự kiện Online/Offline của trình duyệt
  useEffect(() => {
    const handleOnline = async () => {
      addToast("Đã khôi phục kết nối Internet! Đang kiểm tra server...", "info");
      const health = await checkConnection();
      if (health.status === "online" && currentUserId && currentUserId !== "demo") {
        await flushSyncQueue(currentUserId);
        setPendingCount(getPendingSyncQueue().length);
        setLastSyncedAt(new Date().toLocaleTimeString("vi-VN"));
        addToast("Đã tự động đồng bộ dữ liệu offline lên server!", "success");
      }
    };

    const handleOffline = () => {
      setConnectionStatus("offline");
      setPingLatency(null);
      addToast("Mất kết nối Internet! Chuyển sang chế độ Offline tự động.", "warning");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Lần kiểm tra đầu tiên khi app load
    checkConnection();

    // Định kỳ kiểm tra kết nối mỗi 30 giây
    const interval = setInterval(() => {
      checkConnection(true);
    }, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [checkConnection, currentUserId, addToast]);

  const value = {
    connectionStatus,
    pingLatency,
    lastSyncedAt,
    pendingCount,
    isSyncing,
    checkConnection,
    forceSyncNow,
    toasts,
    addToast,
    removeToast
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnection phải được sử dụng bên trong ConnectionProvider");
  }
  return context;
}
