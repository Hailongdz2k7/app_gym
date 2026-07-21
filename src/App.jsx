import React, { useState, useEffect, useRef } from "react";
import { Dumbbell, Scale, LogOut, Settings, WifiOff, Zap, RefreshCw } from "lucide-react";
import { getDefaultWorkoutSplit, exercisesDb } from "./data/exercises";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import Dashboard from "./components/Dashboard";
import WorkoutSession from "./components/WorkoutSession";
import WorkoutMode from "./components/WorkoutMode";
import PersonalStats from "./components/PersonalStats";
import Auth from "./components/Auth";
import AdminPanel from "./components/AdminPanel";
import ConnectionModal from "./components/ConnectionModal";
import Toast from "./components/Toast";
import { ConnectionProvider, useConnection } from "./context/ConnectionContext";
import { queueOfflineAction } from "./services/connectionService";

// --- CÁC HÀM TRUY XUẤT LOCAL STORAGE ĐỘNG THEO USER ID ---
const getLocalStorageData = (key, userId, defaultValue) => {
  try {
    if (!userId) return defaultValue !== undefined ? JSON.parse(JSON.stringify(defaultValue)) : null;
    const userKey = `flexifit-${userId}-${key}`;
    const item = window.localStorage.getItem(userKey);
    return item ? JSON.parse(item) : (defaultValue !== undefined ? JSON.parse(JSON.stringify(defaultValue)) : null);
  } catch (e) {
    console.error(`Error reading localStorage key:`, e);
    return defaultValue !== undefined ? JSON.parse(JSON.stringify(defaultValue)) : null;
  }
};

const setLocalStorageData = (key, userId, value) => {
  try {
    if (!userId) return;
    const userKey = `flexifit-${userId}-${key}`;
    window.localStorage.setItem(userKey, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing localStorage key:`, e);
  }
};

export default function App() {
  const [sessionUser, setSessionUser] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const currentUserId = sessionUser?.id || (isDemoMode ? "demo" : null);

  return (
    <ConnectionProvider currentUserId={currentUserId}>
      <AppContent 
        sessionUser={sessionUser} 
        setSessionUser={setSessionUser} 
        isDemoMode={isDemoMode} 
        setIsDemoMode={setIsDemoMode} 
        currentUserId={currentUserId}
      />
    </ConnectionProvider>
  );
}

function AppContent({ sessionUser, setSessionUser, isDemoMode, setIsDemoMode, currentUserId }) {
  const { connectionStatus, pingLatency, pendingCount, toasts, removeToast, addToast } = useConnection();

  const [userProfile, setUserProfile] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Modal kiểm tra kết nối
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false);

  // Màn hình đang mở tab Admin
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Danh sách bài tập chung tải từ Supabase (nếu có), fallback là exercisesDb mặc định
  const [exercisesDbFromDb, setExercisesDbFromDb] = useState({});

  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'stats'
  
  // Các state lưu trữ nội bộ hoạt động chính
  const [weightHistory, setWeightHistory] = useState([]);
  const [height, setHeight] = useState(170);
  const [workoutHistory, setWorkoutHistory] = useState({});
  const [customWorkoutSplit, setCustomWorkoutSplit] = useState(() => getDefaultWorkoutSplit());

  // Trạng thái buổi tập đang diễn ra
  const [currentSession, setCurrentSession] = useState(null); 
  const [sessionExercises, setSessionExercises] = useState([]);
  const [sessionSets, setSessionSets] = useState({});
  const [workoutModeActiveIndex, setWorkoutModeActiveIndex] = useState(-1);

  // Kênh Supabase Realtime Channel
  const realtimeChannelRef = useRef(null);

  // Hàm dọn dẹp sạch state về mặc định độc lập khi chuyển đổi tài khoản
  const resetUserState = () => {
    setCustomWorkoutSplit(getDefaultWorkoutSplit());
    setWeightHistory([]);
    setWorkoutHistory({});
    setHeight(170);
    setCurrentSession(null);
    setSessionExercises([]);
    setSessionSets({});
    setWorkoutModeActiveIndex(-1);
    setIsAdminPanelOpen(false);
  };

  // 1. THEO DÕI TRẠNG THÁI AUTH CỦA SUPABASE LÚC KHỞI ĐỘNG
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthChecking(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSessionUser(session.user);
        fetchUserProfile(session.user);
      } else {
        setAuthChecking(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSessionUser(session.user);
        fetchUserProfile(session.user);
      } else {
        setSessionUser(null);
        setUserProfile(null);
        setAuthChecking(false);
        resetUserState();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. TẢI DANH SÁCH BÀI TẬP CHUNG TỪ SUPABASE
  const fetchExercisesFromSupabase = async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data, error } = await supabase.from("exercises_db").select("*");
      if (error) throw error;
      if (data && data.length > 0) {
        const dbObj = {};
        data.forEach(ex => {
          dbObj[ex.id] = {
            id: ex.id,
            name: ex.name,
            primaryMuscle: ex.primary_muscle,
            targetMuscles: ex.target_muscles || [],
            secondaryMuscles: ex.secondary_muscles || [],
            machine: ex.machine,
            instructions: ex.instructions || [],
            swapSuggestions: ex.swap_suggestions || []
          };
        });
        setExercisesDbFromDb(dbObj);
      }
    } catch (e) {
      console.warn("Chưa cấu hình hoặc lỗi kết nối bảng bài tập Supabase, sử dụng bài tập mặc định.", e.message);
    }
  };

  useEffect(() => {
    fetchExercisesFromSupabase();
  }, [sessionUser]);

  // 3. THIẾT LẬP KÊNH ĐỒNG BỘ THỜI GIAN THỰC LIÊN THIẾT BỊ (SUPABASE REALTIME SYNC)
  useEffect(() => {
    if (!sessionUser || isDemoMode || !isSupabaseConfigured()) return;

    const userId = sessionUser.id;
    const channelName = `flexifit-realtime-user-${userId}`;

    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: false }
      }
    });

    realtimeChannelRef.current = channel;

    // A. Lắng nghe Broadcast từ các thiết bị khác đang đăng nhập cùng tài khoản (< 50ms)
    channel.on("broadcast", { event: "DATA_MUTATION" }, (eventPayload) => {
      const { type, payload } = eventPayload.payload || {};
      console.log("⚡ Nhận sự kiện đồng bộ thời gian thực từ thiết bị khác:", type);

      if (type === "SPLIT_UPDATED" && payload) {
        setCustomWorkoutSplit(payload);
        setLocalStorageData("custom-workout-split", userId, payload);
        addToast("Lịch tập đã được đồng bộ từ thiết bị khác!", "success");
      } else if (type === "SETS_UPDATED") {
        loadUserOnlineData(userId);
        addToast("Nhật ký tập vừa được cập nhật từ thiết bị khác!", "success");
      } else if (type === "WEIGHT_UPDATED") {
        loadUserOnlineData(userId);
        addToast("Cân nặng vừa được cập nhật từ thiết bị khác!", "success");
      } else if (type === "HEIGHT_UPDATED" && payload) {
        setHeight(payload);
        setLocalStorageData("height", userId, payload);
        addToast("Chiều cao vừa được cập nhật từ thiết bị khác!", "success");
      }
    });

    // B. Lắng nghe trực tiếp Postgres CDC thay đổi trên CSDL Supabase
    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "custom_workout_splits", filter: `user_id=eq.${userId}` },
        (changePayload) => {
          if (changePayload.new && changePayload.new.split_data) {
            setCustomWorkoutSplit(changePayload.new.split_data);
            setLocalStorageData("custom-workout-split", userId, changePayload.new.split_data);
            addToast("Lịch tập đã được đồng bộ từ server!", "info");
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_logs", filter: `user_id=eq.${userId}` },
        () => {
          loadUserOnlineData(userId);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "weight_history", filter: `user_id=eq.${userId}` },
        () => {
          loadUserOnlineData(userId);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
        (changePayload) => {
          if (changePayload.new && changePayload.new.height) {
            setHeight(changePayload.new.height);
          }
        }
      );

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`🟢 Kênh đồng bộ thời gian thực cho User ${userId} đã sẵn sàng.`);
      }
    });

    return () => {
      supabase.removeChannel(channel);
      realtimeChannelRef.current = null;
    };
  }, [sessionUser, isDemoMode]);

  // Hàm phát tín hiệu Broadcast tới các thiết bị khác khi thiết bị hiện tại có thay đổi
  const broadcastMutationToDevices = (type, payload) => {
    if (!sessionUser || isDemoMode || !realtimeChannelRef.current) return;
    try {
      realtimeChannelRef.current.send({
        type: "broadcast",
        event: "DATA_MUTATION",
        payload: { type, payload }
      });
    } catch (e) {
      console.warn("Không thể phát tín hiệu đồng bộ broadcast:", e);
    }
  };

  // 4. TẢI THÔNG TIN PROFILE VÀ DỮ LIỆU TẬP LUYỆN ONLINE CỦA USER
  const fetchUserProfile = async (user) => {
    setAuthChecking(true);
    resetUserState();

    try {
      let { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code === "PGRST116") {
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([{ id: user.id, email: user.email, height: 170, role: "member" }])
          .select()
          .single();
        if (createError) throw createError;
        profile = newProfile;
      } else if (error) {
        throw error;
      }

      setUserProfile(profile);
      setHeight(profile.height || 170);

      await loadUserOnlineData(user.id);
    } catch (e) {
      console.error("Lỗi đồng bộ dữ liệu với Supabase:", e.message);
      const userSplit = getLocalStorageData("custom-workout-split", user.id, getDefaultWorkoutSplit());
      const userWeight = getLocalStorageData("weight-history", user.id, []);
      const userLogs = getLocalStorageData("workout-history", user.id, {});
      
      setCustomWorkoutSplit(userSplit);
      setWeightHistory(userWeight);
      setWorkoutHistory(userLogs);
    } finally {
      setAuthChecking(false);
    }
  };

  // Tải dữ liệu từ Supabase về ứng dụng
  const loadUserOnlineData = async (userId) => {
    try {
      // A. Tải Cân nặng
      const { data: weights } = await supabase
        .from("weight_history")
        .select("date, weight")
        .eq("user_id", userId)
        .order("date", { ascending: true });
      
      if (weights && weights.length > 0) {
        setWeightHistory(weights);
        setLocalStorageData("weight-history", userId, weights);
      } else {
        const localW = getLocalStorageData("weight-history", userId, []);
        setWeightHistory(localW);
      }

      // B. Tải Lịch tập tùy chỉnh (Splits)
      const { data: split } = await supabase
        .from("custom_workout_splits")
        .select("split_data")
        .eq("user_id", userId)
        .single();
      
      if (split?.split_data) {
        setCustomWorkoutSplit(split.split_data);
        setLocalStorageData("custom-workout-split", userId, split.split_data);
      } else {
        const localSplit = getLocalStorageData("custom-workout-split", userId, null);
        if (localSplit) {
          setCustomWorkoutSplit(localSplit);
          if (connectionStatus === "online") {
            await supabase
              .from("custom_workout_splits")
              .upsert({ user_id: userId, split_data: localSplit }, { onConflict: "user_id" });
          }
        } else {
          const freshSplit = getDefaultWorkoutSplit();
          setCustomWorkoutSplit(freshSplit);
          setLocalStorageData("custom-workout-split", userId, freshSplit);
          if (connectionStatus === "online") {
            await supabase
              .from("custom_workout_splits")
              .upsert({ user_id: userId, split_data: freshSplit }, { onConflict: "user_id" });
          }
        }
      }

      // C. Tải Nhật ký tập (user_logs)
      const { data: logs } = await supabase
        .from("user_logs")
        .select("*")
        .eq("user_id", userId);

      if (logs && logs.length > 0) {
        const formattedHistory = {};
        logs.forEach(row => {
          const dateStr = row.date;
          if (!formattedHistory[dateStr]) {
            const dateObj = new Date(dateStr);
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const dayName = days[dateObj.getDay()];
            const splitOfThisDay = (split?.split_data || getDefaultWorkoutSplit())[dayName];
            
            formattedHistory[dateStr] = {
              dayKey: dayName,
              dayName: splitOfThisDay?.name || "Buổi tập",
              type: splitOfThisDay?.type || "custom",
              exercises: [],
              sets: {}
            };
          }
          
          if (!formattedHistory[dateStr].exercises.includes(row.exercise_id)) {
            formattedHistory[dateStr].exercises.push(row.exercise_id);
          }
          formattedHistory[dateStr].sets[row.exercise_id] = row.sets_data;
        });
        setWorkoutHistory(formattedHistory);
        setLocalStorageData("workout-history", userId, formattedHistory);
      } else {
        const localHist = getLocalStorageData("workout-history", userId, {});
        setWorkoutHistory(localHist);
      }
    } catch (err) {
      console.warn("Mất kết nối server khi tải dữ liệu online, nạp dữ liệu local thay thế.", err);
    }
  };

  // Kích hoạt chế độ Demo Offline
  const handleStartDemo = () => {
    resetUserState();
    setIsDemoMode(true);
    
    const demoSplit = getLocalStorageData("custom-workout-split", "demo", getDefaultWorkoutSplit());
    const demoWeight = getLocalStorageData("weight-history", "demo", [
      { date: "2026-07-15", weight: 71.2 },
      { date: "2026-07-17", weight: 70.8 },
      { date: "2026-07-19", weight: 70.5 },
      { date: "2026-07-21", weight: 70.2 }
    ]);
    const demoLogs = getLocalStorageData("workout-history", "demo", {});
    const demoHeight = getLocalStorageData("height", "demo", 172);

    setCustomWorkoutSplit(demoSplit);
    setWeightHistory(demoWeight);
    setWorkoutHistory(demoLogs);
    setHeight(demoHeight);
    addToast("Đã kích hoạt Chế độ Demo Offline!", "warning");
  };

  // Đăng xuất và dọn dẹp state
  const handleLogout = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      resetUserState();
      return;
    }
    await supabase.auth.signOut();
    setSessionUser(null);
    setUserProfile(null);
    resetUserState();
    addToast("Đã đăng xuất tài khoản.", "info");
  };

  // Mở màn hình tập luyện & tải dữ liệu hoạt động
  const handleSelectDay = (dayKey, dayName, defaultExercises) => {
    setCurrentSession({ dayKey, dayName });
    const targetExercises = customWorkoutSplit[dayKey]?.exercises || defaultExercises;
    setSessionExercises(targetExercises);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const initialSets = {};
    targetExercises.forEach(exId => {
      if (workoutHistory[todayStr] && workoutHistory[todayStr].sets && workoutHistory[todayStr].sets[exId]) {
        initialSets[exId] = workoutHistory[todayStr].sets[exId];
      } else {
        initialSets[exId] = [
          { reps: "", weight: "", completed: false },
          { reps: "", weight: "", completed: false },
          { reps: "", weight: "", completed: false }
        ];
      }
    });
    setSessionSets(initialSets);
  };

  // Lưu và đồng bộ dữ liệu Sets tập luyện lên Supabase hoặc LocalStorage
  const handleSaveSets = async (newSets) => {
    setSessionSets(newSets);
    const todayStr = new Date().toISOString().split('T')[0];
    
    const updatedHistory = JSON.parse(JSON.stringify(workoutHistory));
    if (!updatedHistory[todayStr]) {
      updatedHistory[todayStr] = {
        dayKey: currentSession?.dayKey,
        dayName: currentSession?.dayName,
        exercises: sessionExercises,
        sets: {}
      };
    }
    updatedHistory[todayStr].sets = newSets;
    setWorkoutHistory(updatedHistory);
    
    setLocalStorageData("workout-history", currentUserId, updatedHistory);

    if (sessionUser && !isDemoMode) {
      try {
        for (const exId of sessionExercises) {
          const setsArray = newSets[exId] || [];
          const isCompleted = setsArray.length > 0 && setsArray.every(s => s.completed);

          if (connectionStatus === "online") {
            await supabase
              .from("user_logs")
              .delete()
              .eq("user_id", sessionUser.id)
              .eq("date", todayStr)
              .eq("exercise_id", exId);

            await supabase
              .from("user_logs")
              .insert({
                user_id: sessionUser.id,
                date: todayStr,
                exercise_id: exId,
                sets_data: setsArray,
                completed: isCompleted
              });
          } else {
            queueOfflineAction("SAVE_SETS", {
              date: todayStr,
              exerciseId: exId,
              setsArray,
              completed: isCompleted
            });
            addToast("Đã lưu offline vào thiết bị! Sẽ tự động đồng bộ khi có kết nối.", "warning");
          }
        }
        // Phát tín hiệu Realtime Broadcast cho các thiết bị khác của cùng tài khoản này
        broadcastMutationToDevices("SETS_UPDATED", newSets);
      } catch (e) {
        console.error("Lỗi đồng bộ sets lên Supabase:", e.message);
        for (const exId of sessionExercises) {
          const setsArray = newSets[exId] || [];
          const isCompleted = setsArray.length > 0 && setsArray.every(s => s.completed);
          queueOfflineAction("SAVE_SETS", {
            date: todayStr,
            exerciseId: exId,
            setsArray,
            completed: isCompleted
          });
        }
        addToast("Mất kết nối server, đã lưu offline thành công.", "warning");
      }
    }
  };

  // Lưu và đồng bộ danh sách bài tập
  const handleSaveExercises = async (newExercises) => {
    setSessionExercises(newExercises);
    const todayStr = new Date().toISOString().split('T')[0];

    const updatedHistory = JSON.parse(JSON.stringify(workoutHistory));
    if (!updatedHistory[todayStr]) {
      updatedHistory[todayStr] = {
        dayKey: currentSession?.dayKey,
        dayName: currentSession?.dayName,
        exercises: newExercises,
        sets: sessionSets
      };
    }
    updatedHistory[todayStr].exercises = newExercises;
    setWorkoutHistory(updatedHistory);

    setLocalStorageData("workout-history", currentUserId, updatedHistory);

    if (sessionUser && !isDemoMode) {
      handleSaveSets(sessionSets);
    }
  };

  // --- CẬP NHẬT LỊCH TẬP TUẦN TỰ SẮP XẾP ---
  const handleReorderExercisesInSplit = async (dayKey, index, direction) => {
    const newSplit = JSON.parse(JSON.stringify(customWorkoutSplit));
    if (!newSplit[dayKey] || !newSplit[dayKey].exercises) return;

    const list = [...newSplit[dayKey].exercises];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    newSplit[dayKey].exercises = list;

    setCustomWorkoutSplit(newSplit);
    setLocalStorageData("custom-workout-split", currentUserId, newSplit);

    if (currentSession && currentSession.dayKey === dayKey) {
      setSessionExercises(list);
      handleSaveExercises(list);
    }

    if (sessionUser && !isDemoMode) {
      if (connectionStatus === "online") {
        await supabase
          .from("custom_workout_splits")
          .upsert({ user_id: sessionUser.id, split_data: newSplit }, { onConflict: "user_id" });
        // Đồng bộ thời gian thực liên thiết bị
        broadcastMutationToDevices("SPLIT_UPDATED", newSplit);
      } else {
        queueOfflineAction("SAVE_SPLIT", { splitData: newSplit });
        addToast("Đã lưu lịch tập offline.", "warning");
      }
    }
  };

  const handleAddExerciseToSplit = async (dayKey, exerciseId) => {
    const newSplit = JSON.parse(JSON.stringify(customWorkoutSplit));
    if (!newSplit[dayKey]) return;

    const list = newSplit[dayKey].exercises ? [...newSplit[dayKey].exercises] : [];
    if (list.includes(exerciseId)) return;

    list.push(exerciseId);
    newSplit[dayKey].exercises = list;
    setCustomWorkoutSplit(newSplit);
    setLocalStorageData("custom-workout-split", currentUserId, newSplit);

    if (currentSession && currentSession.dayKey === dayKey) {
      setSessionExercises(list);
      const newSets = { ...sessionSets };
      if (!newSets[exerciseId]) {
        newSets[exerciseId] = [
          { reps: "", weight: "", completed: false },
          { reps: "", weight: "", completed: false },
          { reps: "", weight: "", completed: false }
        ];
      }
      setSessionSets(newSets);
      handleSaveSets(newSets);
    }

    if (sessionUser && !isDemoMode) {
      if (connectionStatus === "online") {
        await supabase
          .from("custom_workout_splits")
          .upsert({ user_id: sessionUser.id, split_data: newSplit }, { onConflict: "user_id" });
        // Đồng bộ thời gian thực liên thiết bị
        broadcastMutationToDevices("SPLIT_UPDATED", newSplit);
      } else {
        queueOfflineAction("SAVE_SPLIT", { splitData: newSplit });
        addToast("Đã thêm bài tập offline.", "warning");
      }
    }
  };

  const handleRemoveExerciseFromSplit = async (dayKey, exerciseId) => {
    const newSplit = JSON.parse(JSON.stringify(customWorkoutSplit));
    if (!newSplit[dayKey] || !newSplit[dayKey].exercises) return;

    const list = newSplit[dayKey].exercises.filter(id => id !== exerciseId);
    newSplit[dayKey].exercises = list;
    setCustomWorkoutSplit(newSplit);
    setLocalStorageData("custom-workout-split", currentUserId, newSplit);

    if (currentSession && currentSession.dayKey === dayKey) {
      setSessionExercises(list);
      const newSets = { ...sessionSets };
      delete newSets[exerciseId];
      setSessionSets(newSets);
      handleSaveSets(newSets);
    }

    if (sessionUser && !isDemoMode) {
      if (connectionStatus === "online") {
        await supabase
          .from("custom_workout_splits")
          .upsert({ user_id: sessionUser.id, split_data: newSplit }, { onConflict: "user_id" });
        // Đồng bộ thời gian thực liên thiết bị
        broadcastMutationToDevices("SPLIT_UPDATED", newSplit);
      } else {
        queueOfflineAction("SAVE_SPLIT", { splitData: newSplit });
      }
    }
  };

  // --- CẬP NHẬT CÂN NẶNG & CHIỀU CAO ---
  const handleUpdateHeight = async (newHeight) => {
    setHeight(newHeight);
    setLocalStorageData("height", currentUserId, newHeight);

    if (sessionUser && !isDemoMode) {
      if (connectionStatus === "online") {
        await supabase
          .from("profiles")
          .update({ height: newHeight })
          .eq("id", sessionUser.id);
        addToast("Đã cập nhật chiều cao lên server!", "success");
        broadcastMutationToDevices("HEIGHT_UPDATED", newHeight);
      } else {
        queueOfflineAction("SAVE_HEIGHT", { height: newHeight });
        addToast("Đã lưu chiều cao offline.", "warning");
      }
    }
  };

  const handleUpdateWeightHistory = async (updater) => {
    let updatedHistory;
    if (typeof updater === "function") {
      updatedHistory = updater(weightHistory);
    } else {
      updatedHistory = updater;
    }
    setWeightHistory(updatedHistory);
    setLocalStorageData("weight-history", currentUserId, updatedHistory);

    if (sessionUser && !isDemoMode) {
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        const weightObj = updatedHistory.find(h => h.date === todayStr);

        if (connectionStatus === "online") {
          await supabase
            .from("weight_history")
            .delete()
            .eq("user_id", sessionUser.id)
            .eq("date", todayStr);

          if (weightObj) {
            await supabase
              .from("weight_history")
              .insert({
                user_id: sessionUser.id,
                date: todayStr,
                weight: weightObj.weight
              });
          }
          addToast("Đã đồng bộ cân nặng lên đám mây!", "success");
          broadcastMutationToDevices("WEIGHT_UPDATED", updatedHistory);
        } else {
          queueOfflineAction("SAVE_WEIGHT", { date: todayStr, weight: weightObj?.weight });
          addToast("Đã lưu cân nặng offline.", "warning");
        }
      } catch (e) {
        console.error("Lỗi đồng bộ cân nặng lên Supabase:", e.message);
      }
    }
  };

  // XỬ LÝ ĐIỀU HƯỚNG HIỂN THỊ MÀN HÌNH CHÍNH
  const renderActiveScreen = () => {
    const activeExercisesDb = Object.keys(exercisesDbFromDb).length > 0 ? exercisesDbFromDb : exercisesDb;

    if (isAdminPanelOpen) {
      return (
        <AdminPanel 
          onBack={async () => {
            setIsAdminPanelOpen(false);
            await fetchExercisesFromSupabase();
          }} 
        />
      );
    }

    if (workoutModeActiveIndex !== -1) {
      return (
        <WorkoutMode
          exercises={sessionExercises}
          todaySets={sessionSets}
          initialIndex={workoutModeActiveIndex}
          onClose={() => setWorkoutModeActiveIndex(-1)}
          setTodaySets={handleSaveSets}
          setSessionExercises={handleSaveExercises}
          setActiveIndex={setWorkoutModeActiveIndex}
          exercisesDb={activeExercisesDb}
        />
      );
    }

    if (currentSession) {
      return (
        <WorkoutSession
          dayKey={currentSession.dayKey}
          dayName={currentSession.dayName}
          sessionExercises={sessionExercises}
          setSessionExercises={handleSaveExercises}
          todaySets={sessionSets}
          setTodaySets={handleSaveSets}
          history={workoutHistory}
          onBack={() => setCurrentSession(null)}
          onStartWorkoutMode={(index) => setWorkoutModeActiveIndex(index)}
          exercisesDb={activeExercisesDb}
        />
      );
    }

    if (activeTab === "stats") {
      return (
        <PersonalStats
          weightHistory={weightHistory}
          setWeightHistory={handleUpdateWeightHistory}
          height={height}
          setHeight={handleUpdateHeight}
          workoutHistory={workoutHistory}
        />
      );
    }

    return (
      <Dashboard
        workoutHistory={workoutHistory}
        customWorkoutSplit={customWorkoutSplit}
        onSelectDay={handleSelectDay}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReorderExercise={handleReorderExercisesInSplit}
        onAddExercise={handleAddExerciseToSplit}
        onRemoveExercise={handleRemoveExerciseFromSplit}
        exercisesDb={activeExercisesDb}
      />
    );
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center font-sans">
        <Dumbbell size={32} className="text-lime-400 animate-spin mb-3" />
        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Đang kết nối FlexiFit...</span>
      </div>
    );
  }

  if (!sessionUser && !isDemoMode) {
    return <Auth onAuthSuccess={(user) => setSessionUser(user)} onStartDemo={handleStartDemo} />;
  }

  const showTabBar = !currentSession && workoutModeActiveIndex === -1 && !isAdminPanelOpen;
  const isAdmin = userProfile?.role === "admin";

  const renderConnectionPill = () => {
    if (isDemoMode) {
      return (
        <button
          onClick={() => setIsConnectionModalOpen(true)}
          className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-amber-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <Zap size={10} /> Demo Mode
        </button>
      );
    }

    switch (connectionStatus) {
      case "online":
        return (
          <button
            onClick={() => setIsConnectionModalOpen(true)}
            className="flex items-center gap-1.5 bg-lime-500/10 border border-lime-400/20 text-lime-400 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-lime-400/20 transition-all active:scale-95 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse"></span>
            Online {pingLatency ? `${pingLatency}ms` : ""}
            {pendingCount > 0 && <span className="ml-0.5 bg-amber-400 text-zinc-950 px-1 rounded-full text-[8px]">{pendingCount}</span>}
          </button>
        );
      case "offline":
        return (
          <button
            onClick={() => setIsConnectionModalOpen(true)}
            className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-red-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <WifiOff size={10} /> Offline
          </button>
        );
      default:
        return (
          <button
            onClick={() => setIsConnectionModalOpen(true)}
            className="flex items-center gap-1.5 bg-zinc-800 text-zinc-400 px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer"
          >
            <RefreshCw size={10} className="animate-spin" /> Connecting
          </button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased overflow-x-hidden w-full max-w-md mx-auto relative">
      
      {/* Toast notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Modal kiểm tra kết nối */}
      <ConnectionModal
        isOpen={isConnectionModalOpen}
        onClose={() => setIsConnectionModalOpen(false)}
        isDemoMode={isDemoMode}
      />

      {/* HEADER TOP BAR CỐ ĐỊNH ON TOP */}
      {showTabBar && (
        <header className="sticky top-0 z-40 px-4 py-3 border-b border-zinc-900/90 flex items-center justify-between bg-zinc-950/95 backdrop-blur-xl shadow-md shadow-black/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black text-xs text-lime-400 shadow-md">
              {isDemoMode ? "D" : sessionUser?.email ? sessionUser.email.substring(0, 2).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 font-black uppercase leading-none">Tài khoản</span>
              <span className="text-[11px] font-bold text-zinc-200 truncate max-w-[110px] mt-0.5">
                {isDemoMode ? "Chế độ Demo" : sessionUser?.email}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Connection Badge Pill */}
            {renderConnectionPill()}

            {/* Nút chuyển đổi Panel Admin */}
            {isAdmin && !isDemoMode && (
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="flex items-center gap-1 bg-lime-500/10 text-lime-400 border border-lime-400/20 px-2.5 py-1.5 rounded-xl text-[10px] font-black hover:bg-lime-400/20 transition-all active:scale-95 cursor-pointer"
              >
                <Settings size={11} /> Admin
              </button>
            )}

            {/* Nút Đăng xuất */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-red-400 active:scale-95 transition-all cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>
      )}

      {/* KHU VỰC HIỂN THỊ MÀN HÌNH CHÍNH (Tăng pb-28 để cuộn qua hết thanh menu dưới) */}
      <main className="flex-1 w-full pb-28">
        {renderActiveScreen()}
      </main>

      {/* BOTTOM NAVIGATION TAB BAR */}
      {showTabBar && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/95 border-t border-zinc-800/80 backdrop-blur-xl py-2 flex items-center justify-around shadow-2xl shadow-black max-w-md mx-auto rounded-t-2xl">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 py-1 px-5 rounded-xl transition-all ${
              activeTab === "dashboard"
                ? "text-lime-400 font-bold scale-105"
                : "text-zinc-500 hover:text-zinc-300 font-medium"
            }`}
          >
            <Dumbbell size={20} className={activeTab === "dashboard" ? "fill-lime-400/10" : ""} />
            <span className="text-[10px] tracking-wide">Tập Luyện</span>
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`flex flex-col items-center gap-1 py-1 px-5 rounded-xl transition-all ${
              activeTab === "stats"
                ? "text-lime-400 font-bold scale-105"
                : "text-zinc-500 hover:text-zinc-300 font-medium"
            }`}
          >
            <Scale size={20} className={activeTab === "stats" ? "fill-lime-400/10" : ""} />
            <span className="text-[10px] tracking-wide">Chỉ Số</span>
          </button>
        </nav>
      )}
    </div>
  );
}
