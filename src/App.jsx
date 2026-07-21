import React, { useState, useEffect } from "react";
import { Dumbbell, Scale, LogOut, Settings } from "lucide-react";
import { workoutSplit, exercisesDb } from "./data/exercises";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import Dashboard from "./components/Dashboard";
import WorkoutSession from "./components/WorkoutSession";
import WorkoutMode from "./components/WorkoutMode";
import PersonalStats from "./components/PersonalStats";
import Auth from "./components/Auth";
import AdminPanel from "./components/AdminPanel";

// --- CÁC HÀM TRUY XUẤT LOCAL STORAGE ĐỘNG THEO USER ID ---
const getLocalStorageData = (key, userId, defaultValue) => {
  try {
    const userKey = `flexifit-${userId || "demo"}-${key}`;
    const item = window.localStorage.getItem(userKey);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading localStorage key:`, e);
    return defaultValue;
  }
};

const setLocalStorageData = (key, userId, value) => {
  try {
    const userKey = `flexifit-${userId || "demo"}-${key}`;
    window.localStorage.setItem(userKey, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing localStorage key:`, e);
  }
};

export default function App() {
  // Trạng thái Xác thực (Auth)
  const [sessionUser, setSessionUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  // Màn hình đang mở tab Admin
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Danh sách bài tập chung tải từ Supabase (nếu có), fallback là exercisesDb mặc định
  const [exercisesDbFromDb, setExercisesDbFromDb] = useState({});

  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'stats'
  
  // Các state lưu trữ nội bộ hoạt động chính
  const [weightHistory, setWeightHistory] = useState([]);
  const [height, setHeight] = useState(170);
  const [workoutHistory, setWorkoutHistory] = useState({});
  const [customWorkoutSplit, setCustomWorkoutSplit] = useState(workoutSplit);

  // Trạng thái buổi tập đang diễn ra
  const [currentSession, setCurrentSession] = useState(null); 
  const [sessionExercises, setSessionExercises] = useState([]);
  const [sessionSets, setSessionSets] = useState({});
  const [workoutModeActiveIndex, setWorkoutModeActiveIndex] = useState(-1);

  // Lấy ID hiện tại (để phân tách key LocalStorage)
  const currentUserId = sessionUser?.id || (isDemoMode ? "demo" : null);

  // 1. THEO DÕI TRẠNG THÁI AUTH CỦA SUPABASE LÚC KHỞI ĐỘNG
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthChecking(false);
      return;
    }

    // Lấy thông tin session hiện tại
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSessionUser(session.user);
        fetchUserProfile(session.user);
      } else {
        setAuthChecking(false);
      }
    });

    // Lắng nghe thay đổi trạng thái Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSessionUser(session.user);
        fetchUserProfile(session.user);
      } else {
        setSessionUser(null);
        setUserProfile(null);
        setAuthChecking(false);
        // Reset dữ liệu về mặc định khi mất session/đăng xuất
        setWeightHistory([]);
        setWorkoutHistory({});
        setCustomWorkoutSplit(workoutSplit);
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

  // 3. TẢI THÔNG TIN PROFILE VÀ DỮ LIỆU TẬP LUYỆN ONLINE CỦA USER
  const fetchUserProfile = async (user) => {
    setAuthChecking(true);
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

      // Tải dữ liệu online
      await loadUserOnlineData(user.id);
    } catch (e) {
      console.error("Lỗi đồng bộ dữ liệu với Supabase:", e.message);
      // Fallback: Nạp dữ liệu Local của riêng user này
      const userSplit = getLocalStorageData("custom-workout-split", user.id, workoutSplit);
      const userWeight = getLocalStorageData("weight-history", user.id, []);
      const userLogs = getLocalStorageData("workout-history", user.id, {});
      
      setCustomWorkoutSplit(userSplit);
      setWeightHistory(userWeight);
      setWorkoutHistory(userLogs);
    } finally {
      setAuthChecking(false);
    }
  };

  // Tải dữ liệu từ Supabase về ứng dụng (Có cơ chế đồng bộ 2 chiều dự phòng Local theo ID)
  const loadUserOnlineData = async (userId) => {
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
      // Nếu online trống, lấy dữ liệu offline của riêng user này làm khởi điểm
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
      // Nếu online trống, lấy lịch tùy chỉnh offline của riêng user này làm khởi điểm
      const localSplit = getLocalStorageData("custom-workout-split", userId, workoutSplit);
      setCustomWorkoutSplit(localSplit);
      // Đẩy ngược cấu hình lịch hiện tại lên Supabase
      await supabase
        .from("custom_workout_splits")
        .upsert({ user_id: userId, split_data: localSplit }, { onConflict: "user_id" });
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
          const splitOfThisDay = (split?.split_data || workoutSplit)[dayName];
          
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
  };

  // Kích hoạt chế độ Demo Offline (đọc từ LocalStorage key flexifit-demo-...)
  const handleStartDemo = () => {
    setIsDemoMode(true);
    
    const demoSplit = getLocalStorageData("custom-workout-split", "demo", workoutSplit);
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
  };

  // Đăng xuất và dọn dẹp state
  const handleLogout = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      // Reset state về mặc định
      setWeightHistory([]);
      setWorkoutHistory({});
      setCustomWorkoutSplit(workoutSplit);
      return;
    }
    await supabase.auth.signOut();
    setSessionUser(null);
    setUserProfile(null);
    setWeightHistory([]);
    setWorkoutHistory({});
    setCustomWorkoutSplit(workoutSplit);
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
    
    // Cập nhật state workoutHistory trước
    const updatedHistory = { ...workoutHistory };
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
    
    // Luôn luôn lưu dự phòng vào LocalStorage của riêng user_id này
    setLocalStorageData("workout-history", currentUserId, updatedHistory);

    // LƯU TRỮ ONLINE (Supabase)
    if (sessionUser && !isDemoMode) {
      try {
        for (const exId of sessionExercises) {
          const setsArray = newSets[exId] || [];
          const isCompleted = setsArray.length > 0 && setsArray.every(s => s.completed);

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
        }
      } catch (e) {
        console.error("Lỗi đồng bộ sets lên Supabase:", e.message);
      }
    }
  };

  // Lưu và đồng bộ danh sách bài tập (ví dụ khi Swap bài tập)
  const handleSaveExercises = async (newExercises) => {
    setSessionExercises(newExercises);
    const todayStr = new Date().toISOString().split('T')[0];

    const updatedHistory = { ...workoutHistory };
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

    // Lưu dự phòng vào Local
    setLocalStorageData("workout-history", currentUserId, updatedHistory);

    if (sessionUser && !isDemoMode) {
      try {
        handleSaveSets(sessionSets);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // --- CẬP NHẬT LỊCH TẬP TUẦN TỰ SẮP XẾP ---
  const handleReorderExercisesInSplit = async (dayKey, index, direction) => {
    const newSplit = { ...customWorkoutSplit };
    if (!newSplit[dayKey] || !newSplit[dayKey].exercises) return;

    const list = [...newSplit[dayKey].exercises];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    newSplit[dayKey].exercises = list;

    setCustomWorkoutSplit(newSplit);
    
    // Luôn luôn lưu dự phòng vào LocalStorage theo userId
    setLocalStorageData("custom-workout-split", currentUserId, newSplit);

    // Đồng bộ tức thì với buổi tập hôm nay
    const todayStr = new Date().toISOString().split('T')[0];
    if (currentSession && currentSession.dayKey === dayKey) {
      setSessionExercises(list);
      handleSaveExercises(list);
    }

    // Lưu online lên Supabase
    if (sessionUser && !isDemoMode) {
      await supabase
        .from("custom_workout_splits")
        .upsert({ user_id: sessionUser.id, split_data: newSplit }, { onConflict: "user_id" });
    }
  };

  const handleAddExerciseToSplit = async (dayKey, exerciseId) => {
    const newSplit = { ...customWorkoutSplit };
    if (!newSplit[dayKey]) return;

    const list = newSplit[dayKey].exercises ? [...newSplit[dayKey].exercises] : [];
    if (list.includes(exerciseId)) return;

    list.push(exerciseId);
    newSplit[dayKey].exercises = list;
    setCustomWorkoutSplit(newSplit);
    
    // Luôn luôn lưu dự phòng vào LocalStorage theo userId
    setLocalStorageData("custom-workout-split", currentUserId, newSplit);

    // Đồng bộ với buổi tập
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
      await supabase
        .from("custom_workout_splits")
        .upsert({ user_id: sessionUser.id, split_data: newSplit }, { onConflict: "user_id" });
    }
  };

  const handleRemoveExerciseFromSplit = async (dayKey, exerciseId) => {
    const newSplit = { ...customWorkoutSplit };
    if (!newSplit[dayKey] || !newSplit[dayKey].exercises) return;

    const list = newSplit[dayKey].exercises.filter(id => id !== exerciseId);
    newSplit[dayKey].exercises = list;
    setCustomWorkoutSplit(newSplit);
    
    // Luôn luôn lưu dự phòng vào LocalStorage theo userId
    setLocalStorageData("custom-workout-split", currentUserId, newSplit);

    if (currentSession && currentSession.dayKey === dayKey) {
      setSessionExercises(list);
      const newSets = { ...sessionSets };
      delete newSets[exerciseId];
      setSessionSets(newSets);
      handleSaveSets(newSets);
    }

    if (sessionUser && !isDemoMode) {
      await supabase
        .from("custom_workout_splits")
        .upsert({ user_id: sessionUser.id, split_data: newSplit }, { onConflict: "user_id" });
    }
  };

  // --- CẬP NHẬT CÂN NẶNG & CHIỀU CAO ---
  const handleUpdateHeight = async (newHeight) => {
    setHeight(newHeight);
    setLocalStorageData("height", currentUserId, newHeight);

    if (sessionUser && !isDemoMode) {
      await supabase
        .from("profiles")
        .update({ height: newHeight })
        .eq("id", sessionUser.id);
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
      } catch (e) {
        console.error("Lỗi đồng bộ cân nặng lên Supabase:", e.message);
      }
    }
  };

  // XỬ LÝ ĐIỀU HƯỚNG HIỂN THỊ MÀN HÌNH CHÍNH
  const renderActiveScreen = () => {
    const activeExercisesDb = Object.keys(exercisesDbFromDb).length > 0 ? exercisesDbFromDb : exercisesDb;

    // Chế độ Admin Panel chỉnh bài tập
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

    // 1. Chế độ tập nhanh (Workout Mode)
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

    // 2. Màn hình chi tiết buổi tập (Workout Session)
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

    // 3. Tab Chỉ số (Personal Stats)
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

    // 4. Màn hình chính (Dashboard)
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

  // Hiển thị màn hình chờ khi đang check auth
  if (authChecking) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center font-sans">
        <Dumbbell size={32} className="text-lime-400 animate-spin mb-3" />
        <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Đang kết nối FlexiFit...</span>
      </div>
    );
  }

  // Nếu chưa đăng nhập & không phải chế độ Demo, hiển thị màn hình Auth
  if (!sessionUser && !isDemoMode) {
    return <Auth onAuthSuccess={(user) => setSessionUser(user)} onStartDemo={handleStartDemo} />;
  }

  const showTabBar = !currentSession && workoutModeActiveIndex === -1 && !isAdminPanelOpen;
  const isAdmin = userProfile?.role === "admin";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased overflow-x-hidden w-full max-w-md mx-auto">
      {/* THÔNG TIN USER / ĐĂNG XUẤT / ADMIN PANEL */}
      {showTabBar && (
        <div className="px-4 pt-4 pb-1 border-b border-zinc-900/60 flex items-center justify-between bg-zinc-900/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-black text-xs text-lime-400">
              {isDemoMode ? "D" : sessionUser?.email ? sessionUser.email.substring(0, 2).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 font-black uppercase leading-none">Tài khoản</span>
              <span className="text-[11px] font-bold text-zinc-300 truncate max-w-[120px] mt-0.5">
                {isDemoMode ? "Chế độ Demo" : sessionUser?.email}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Nút chuyển đổi Panel Admin */}
            {isAdmin && !isDemoMode && (
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="flex items-center gap-1 bg-lime-500/10 text-lime-400 border border-lime-400/20 px-3 py-1.5 rounded-xl text-xs font-black hover:bg-lime-400/20 transition-all active:scale-95"
              >
                <Settings size={12} /> BẢNG ADMIN
              </button>
            )}

            {/* Nút Đăng xuất */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      )}

      {/* KHU VỰC HIỂN THỊ MÀN HÌNH CHÍNH */}
      <main className="flex-1 w-full pb-6">
        {renderActiveScreen()}
      </main>

      {/* BOTTOM NAVIGATION TAB BAR */}
      {showTabBar && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900/90 border-t border-zinc-800/60 backdrop-blur-lg py-2 flex items-center justify-around shadow-lg shadow-black/40 max-w-md mx-auto rounded-t-2xl">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
              activeTab === "dashboard"
                ? "text-lime-400 font-bold"
                : "text-zinc-500 hover:text-zinc-300 font-medium"
            }`}
          >
            <Dumbbell size={20} className={activeTab === "dashboard" ? "fill-lime-400/10" : ""} />
            <span className="text-[10px] tracking-wide">Tập Luyện</span>
          </button>

          <button
            onClick={() => setActiveTab("stats")}
            className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
              activeTab === "stats"
                ? "text-lime-400 font-bold"
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
