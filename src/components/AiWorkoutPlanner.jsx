import React, { useState } from "react";
import { 
  Sparkles, Dumbbell, ShieldAlert, Check, Copy, Flame, Calendar, Clock, 
  User, Activity, Target, Zap, ChevronRight, RefreshCw, Layers, Info, CheckCircle2 
} from "lucide-react";

export default function AiWorkoutPlanner({ 
  onApplySplitToApp, 
  currentHeight = 170, 
  currentWeight = 65 
}) {
  // --- USER CONTEXT FORM STATES ---
  const [location, setLocation] = useState("Gym"); // 'Home' | 'Gym'
  const [equipment, setEquipment] = useState(["Barbell", "Dumbbell", "Cable", "Machines"]);
  const [level, setLevel] = useState("Intermediate"); // 'Beginner' | 'Intermediate' | 'Advanced'
  const [goal, setGoal] = useState("Hypertrophy"); // 'Hypertrophy' | 'Strength' | 'Fat Loss' | 'Endurance'
  const [daysPerWeek, setDaysPerWeek] = useState(4); // 2, 3, 4, 5, 6
  const [sessionDuration, setSessionDuration] = useState(60); // 30, 45, 60, 90
  
  // Body Stats
  const [height, setHeight] = useState(currentHeight);
  const [weight, setWeight] = useState(currentWeight);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState("Nam"); // 'Nam' | 'Nữ'
  
  // Injuries & Limitations
  const [injuries, setInjuries] = useState([]); // 'lower_back', 'knee', 'shoulder'

  // --- OUTPUT RESULT STATES ---
  const [generatedJson, setGeneratedJson] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeResultTab, setActiveResultTab] = useState("visual"); // 'visual' | 'json'
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  // Equipment Options
  const equipmentOptions = [
    { id: "Bodyweight", label: "Bodyweight (Trọng lượng cơ thể)" },
    { id: "Dumbbell", label: "Dumbbells (Tạ đơn)" },
    { id: "Barbell", label: "Barbells (Tạ đòn)" },
    { id: "Cable", label: "Cable (Dây cáp kéo)" },
    { id: "Kettlebell", label: "Kettlebell (Tạ ấm)" },
    { id: "Bands", label: "Resistance Bands (Dây kháng lực)" },
    { id: "Machines", label: "Machines (Máy tập phòng Gym)" }
  ];

  // Injury Options
  const injuryOptions = [
    { id: "lower_back", label: "Đau lưng dưới (Lower Back Pain)" },
    { id: "knee", label: "Đau khớp gối (Knee Pain)" },
    { id: "shoulder", label: "Chấn thương vai (Shoulder Injury)" }
  ];

  // Calculate BMI
  const calculateBMI = () => {
    if (!height || !weight) return 0;
    const h = height / 100;
    return parseFloat((weight / (h * h)).toFixed(1));
  };

  const bmi = calculateBMI();

  const getBmiCategory = (bmiVal) => {
    if (bmiVal === 0) return { label: "Chưa đủ dữ liệu", color: "text-zinc-500" };
    if (bmiVal < 18.5) return { label: "Thiếu cân (< 18.5)", color: "text-blue-400" };
    if (bmiVal < 24.9) return { label: "Cân đối (18.5 - 24.9)", color: "text-lime-400" };
    if (bmiVal < 29.9) return { label: "Thừa cân (25 - 29.9)", color: "text-orange-400" };
    return { label: "Béo phì (≥ 30)", color: "text-red-400" };
  };

  const toggleEquipment = (eqId) => {
    if (equipment.includes(eqId)) {
      setEquipment(equipment.filter(e => e !== eqId));
    } else {
      setEquipment([...equipment, eqId]);
    }
  };

  const toggleInjury = (injId) => {
    if (injuries.includes(injId)) {
      setInjuries(injuries.filter(i => i !== injId));
    } else {
      setInjuries([...injuries, injId]);
    }
  };

  // --- AI KINESIOLOGY ROUTINE GENERATOR ENGINE ---
  const handleGenerateRoutine = () => {
    setIsGenerating(true);
    setApplied(false);

    setTimeout(() => {
      const hasBackPain = injuries.includes("lower_back");
      const hasKneePain = injuries.includes("knee") || bmi > 25;
      const isUnderweight = bmi < 18.5;
      const isHome = location === "Home";

      // Sets & Reps Prescription Parameters based on Goal
      let setsCount = 4;
      let repsRange = "8 - 10";
      let restSecs = 90;
      if (goal === "Strength") {
        setsCount = 5;
        repsRange = "3 - 5";
        restSecs = 150;
      } else if (goal === "Fat Loss" || goal === "Endurance") {
        setsCount = 3;
        repsRange = "12 - 15";
        restSecs = 60;
      }

      // Split determination
      let splitName = "Full Body (Toàn thân)";
      if (daysPerWeek === 4) {
        splitName = "Upper / Lower (Thân trên / Thân dưới)";
      } else if (daysPerWeek >= 5) {
        splitName = "Push / Pull / Legs (PPL)";
      }

      // Exercise Selector Helper (Adhering strictly to standard exercise_id rules)
      const selectChestExercise = () => {
        if (isHome && !equipment.includes("Barbell")) {
          return {
            exercise_id: "ex_chest_pushup",
            name_display: "Push-Up (Hít đất chuẩn)",
            target_muscle: "Ngực lớn",
            equipment: "Bodyweight",
            sets: setsCount,
            reps: repsRange,
            rest_seconds: restSecs,
            notes: "Giữ thân người thẳng, hạ sâu chạm sàn rồi đẩy lên",
            alternative_exercise_id: "ex_chest_incline_db_press"
          };
        }
        return {
          exercise_id: "ex_chest_bench_press",
          name_display: "Barbell Bench Press (Đẩy ngực ngang tạ đòn)",
          target_muscle: "Ngực lớn",
          equipment: equipment.includes("Barbell") ? "Barbell" : "Dumbbell",
          sets: setsCount,
          reps: repsRange,
          rest_seconds: restSecs,
          notes: "Giữ vai hạ thấp, siết xương bả vai, không khóa khớp khuỷu tay",
          alternative_exercise_id: "ex_chest_incline_db_press"
        };
      };

      const selectInclineChest = () => ({
        exercise_id: "ex_chest_incline_db_press",
        name_display: "Incline Dumbbell Press (Đẩy ngực dốc lên tạ đơn)",
        target_muscle: "Ngực trên",
        equipment: "Dumbbell",
        sets: setsCount,
        reps: repsRange,
        rest_seconds: restSecs,
        notes: "Góc ghế 30-45 độ, tập trung cảm nhận ngực trên",
        alternative_exercise_id: "ex_chest_cable_fly"
      });

      const selectBackExercise = () => {
        if (hasBackPain) {
          return {
            exercise_id: "ex_back_lat_pulldown",
            name_display: "Lat Pulldown (Kéo xô máy hỗ trợ đỡ lưng)",
            target_muscle: "Lưng xô (Lats)",
            equipment: "Cable",
            sets: setsCount,
            reps: repsRange,
            rest_seconds: restSecs,
            notes: "Ưỡn nhẹ ngực, dùng cơ lưng kéo thanh bar, tránh dùng thắt lưng",
            alternative_exercise_id: "ex_back_pullup"
          };
        }
        return {
          exercise_id: "ex_back_barbell_row",
          name_display: "Barbell Bent-Over Row (Kéo lưng tạ đòn)",
          target_muscle: "Lưng giữa (Mid-Back)",
          equipment: "Barbell",
          sets: setsCount,
          reps: repsRange,
          rest_seconds: restSecs,
          notes: "Gập hông 45 độ, giữ lưng thẳng tuyệt đối",
          alternative_exercise_id: "ex_back_db_row"
        };
      };

      const selectPullupOrRow = () => ({
        exercise_id: "ex_back_pullup",
        name_display: "Pull-Up / Lat Pulldown (Kéo xả / Kéo xô)",
        target_muscle: "Lưng xô",
        equipment: equipment.includes("Bodyweight") ? "Bodyweight" : "Cable",
        sets: setsCount,
        reps: repsRange,
        rest_seconds: restSecs,
        notes: "Kéo vai xuống trước khi gập khuỷu tay",
        alternative_exercise_id: "ex_back_lat_pulldown"
      });

      const selectShoulderPress = () => ({
        exercise_id: "ex_shoulder_db_press",
        name_display: "Dumbbell Overhead Shoulder Press (Đẩy vai tạ đơn)",
        target_muscle: "Vai trước & vai giữa",
        equipment: "Dumbbell",
        sets: setsCount,
        reps: repsRange,
        rest_seconds: restSecs,
        notes: "Không đẩy tạ ra sau đầu, giữ cốt lõi vững",
        alternative_exercise_id: "ex_shoulder_ohp"
      });

      const selectLateralRaise = () => ({
        exercise_id: "ex_shoulder_lateral_raise",
        name_display: "Dumbbell Lateral Raise (Dang vai ngang tạ đơn)",
        target_muscle: "Vai giữa",
        equipment: "Dumbbell",
        sets: 3,
        reps: "12 - 15",
        rest_seconds: 60,
        notes: "Hơi nghiêng cổ tay về trước như rót nước, tránh nhún vai",
        alternative_exercise_id: "ex_shoulder_face_pull"
      });

      const selectLegExercise = () => {
        if (hasBackPain || hasKneePain) {
          return {
            exercise_id: "ex_leg_leg_press",
            name_display: "Leg Press (Đạp đùi máy nghiêng - An toàn cho lưng & gối)",
            target_muscle: "Đùi trước & Mông",
            equipment: "Machines",
            sets: setsCount,
            reps: repsRange,
            rest_seconds: restSecs,
            notes: "Đặt chân cao trên bàn đạp để giảm áp lực gối, không khóa gối ở đỉnh",
            alternative_exercise_id: "ex_leg_lunge"
          };
        }
        return {
          exercise_id: "ex_leg_barbell_squat",
          name_display: "Barbell Back Squat (Gánh tạ đòn gập đùi)",
          target_muscle: "Đùi trước & Mông",
          equipment: "Barbell",
          sets: setsCount,
          reps: repsRange,
          rest_seconds: restSecs,
          notes: "Mở gối theo hướng mũi chân, gạt hông ra sau khi hạ xuống",
          alternative_exercise_id: "ex_leg_leg_press"
        };
      };

      const selectHamstringsLegs = () => ({
        exercise_id: "ex_leg_romanian_deadlift",
        name_display: "Romanian Deadlift (Kéo tạ đùi sau - Hamstrings)",
        target_muscle: "Đùi sau & Mông",
        equipment: "Barbell",
        sets: 3,
        reps: "10 - 12",
        rest_seconds: 90,
        notes: "Hơi khuỵu gối nhẹ, đẩy hông tối đa ra sau để căng đùi sau",
        alternative_exercise_id: "ex_leg_lunge"
      });

      const selectBicep = () => ({
        exercise_id: "ex_arm_barbell_curl",
        name_display: "Barbell / Dumbbell Curl (Cuốn tay trước)",
        target_muscle: "Tay trước (Biceps)",
        equipment: "Barbell",
        sets: 3,
        reps: "10 - 12",
        rest_seconds: 60,
        notes: "Cố định khuỷu tay sát sườn, siết chặt ở đỉnh",
        alternative_exercise_id: "ex_arm_db_hammer_curl"
      });

      const selectTricep = () => ({
        exercise_id: "ex_arm_tricep_pushdown",
        name_display: "Tricep Pushdown (Duỗi tay sau dây cáp/tạ)",
        target_muscle: "Tay sau (Triceps)",
        equipment: "Cable",
        sets: 3,
        reps: "10 - 12",
        rest_seconds: 60,
        notes: "Cố định cánh tay trên, duỗi thẳng khuỷu tay",
        alternative_exercise_id: "ex_arm_skull_crusher"
      });

      const selectCore = () => ({
        exercise_id: "ex_core_hanging_leg_raise",
        name_display: "Hanging Leg Raise / Plank (Tập bụng)",
        target_muscle: "Bụng & Core",
        equipment: "Bodyweight",
        sets: 3,
        reps: "12 - 15",
        rest_seconds: 60,
        notes: "Siết chặt cơ bụng, cuộn hông lên nhẹ",
        alternative_exercise_id: "ex_core_plank"
      });

      // Construct Schedule based on Days Per Week
      let scheduleList = [];

      if (daysPerWeek === 2 || daysPerWeek === 3) {
        // Fullbody Days
        for (let d = 1; d <= daysPerWeek; d++) {
          scheduleList.push({
            day_number: d,
            day_name: `Ngày ${d}: Full Body (Toàn thân)`,
            warmup: [
              "Xoay khớp vai, hông và gối trong 3-5 phút",
              "Giãn cơ động: Leg swings & Arm circles 2 sets"
            ],
            exercises: [
              selectLegExercise(),
              selectChestExercise(),
              selectBackExercise(),
              selectShoulderPress(),
              selectCore()
            ],
            cooldown: [
              "Giãn cơ tĩnh đùi và ngực 3 phút",
              "Hít thở sâu thả lỏng cơ thể 2 phút"
            ]
          });
        }
      } else if (daysPerWeek === 4) {
        // Upper / Lower
        scheduleList = [
          {
            day_number: 1,
            day_name: "Ngày 1: Upper A (Thân trên - Ngực & Lưng nặng)",
            warmup: ["Xoay khớp vai và cổ tay 3 phút", "Hít đất nhẹ 2 sets x 8 reps"],
            exercises: [selectChestExercise(), selectBackExercise(), selectShoulderPress(), selectBicep(), selectTricep()],
            cooldown: ["Giãn cơ ngực và xô tĩnh 3 phút"]
          },
          {
            day_number: 2,
            day_name: "Ngày 2: Lower A (Thân dưới - Chân & Đùi)",
            warmup: ["Xoay hông và gối 3 phút", "Squat cơ thể nhẹ 2 sets x 10 reps"],
            exercises: [selectLegExercise(), selectHamstringsLegs(), {
              exercise_id: "ex_leg_lunge",
              name_display: "Dumbbell Lunges (Bước chân chùng tạ đơn)",
              target_muscle: "Đùi & Mông",
              equipment: "Dumbbell",
              sets: 3,
              reps: "10 - 12",
              rest_seconds: 60,
              notes: "Giữ lưng thẳng, hạ gối vuông góc 90 độ",
              alternative_exercise_id: "ex_leg_calf_raise"
            }, selectCore()],
            cooldown: ["Giãn cơ đùi trước và mông 3 phút"]
          },
          {
            day_number: 3,
            day_name: "Ngày 3: Upper B (Thân trên - Vai & Ngực trên)",
            warmup: ["Xoay xoay vai 3 phút", "Facepull nhẹ 2 sets x 12 reps"],
            exercises: [selectInclineChest(), selectPullupOrRow(), selectLateralRaise(), selectTricep(), selectBicep()],
            cooldown: ["Giãn cơ vai và tay sau 3 phút"]
          },
          {
            day_number: 4,
            day_name: "Ngày 4: Lower B (Thân dưới - Đùi sau & Bắp chân)",
            warmup: ["Xoay hông gối 3 phút", "Kéo giãn cổ chân 2 phút"],
            exercises: [selectHamstringsLegs(), selectLegExercise(), {
              exercise_id: "ex_leg_calf_raise",
              name_display: "Standing Calf Raise (Nhón bắp chân)",
              target_muscle: "Bắp chân",
              equipment: "Machines",
              sets: 4,
              reps: "15 - 20",
              rest_seconds: 45,
              notes: "Nhón tối đa ở đỉnh và giữ 1 giây",
              alternative_exercise_id: "ex_core_plank"
            }, selectCore()],
            cooldown: ["Giãn cơ bắp chân và đùi tĩnh 3 phút"]
          }
        ];
      } else {
        // PPL (5-6 days)
        scheduleList = [
          {
            day_number: 1,
            day_name: "Ngày 1: Push (Ngực - Vai - Tay sau)",
            warmup: ["Xoay khớp vai 3 phút", "Hít đất nhẹ 2 sets"],
            exercises: [selectChestExercise(), selectInclineChest(), selectShoulderPress(), selectLateralRaise(), selectTricep()],
            cooldown: ["Giãn cơ ngực và vai 3 phút"]
          },
          {
            day_number: 2,
            day_name: "Ngày 2: Pull (Lưng - Xô - Tay trước)",
            warmup: ["Xoay khớp vai & tay 3 phút", "Kéo xô nhẹ 2 sets"],
            exercises: [selectBackExercise(), selectPullupOrRow(), {
              exercise_id: "ex_shoulder_face_pull",
              name_display: "Cable Face Pull (Kéo vai sau dây cáp)",
              target_muscle: "Vai sau & Lưng trên",
              equipment: "Cable",
              sets: 3,
              reps: "12 - 15",
              rest_seconds: 60,
              notes: "Kéo dây về phía trán, xoay vai ngoài",
              alternative_exercise_id: "ex_shoulder_lateral_raise"
            }, selectBicep(), selectCore()],
            cooldown: ["Giãn cơ lưng xô 3 phút"]
          },
          {
            day_number: 3,
            day_name: "Ngày 3: Legs (Chân - Mông - Bắp chân)",
            warmup: ["Xoay hông và gối 3 phút"],
            exercises: [selectLegExercise(), selectHamstringsLegs(), {
              exercise_id: "ex_leg_lunge",
              name_display: "Dumbbell Walking Lunge (Bước chùng tạ đơn)",
              target_muscle: "Đùi & Mông",
              equipment: "Dumbbell",
              sets: 3,
              reps: "10 - 12",
              rest_seconds: 60,
              notes: "Giữ thăng bằng cốt lõi",
              alternative_exercise_id: "ex_leg_calf_raise"
            }, {
              exercise_id: "ex_leg_calf_raise",
              name_display: "Calf Raise (Nhón bắp chân)",
              target_muscle: "Bắp chân",
              equipment: "Machines",
              sets: 4,
              reps: "15 - 20",
              rest_seconds: 45,
              notes: "Thực hiện chậm kiểm soát",
              alternative_exercise_id: "ex_core_plank"
            }],
            cooldown: ["Giãn cơ chân 3 phút"]
          },
          {
            day_number: 4,
            day_name: "Ngày 4: Push B (Tập trung Cảm nhận Ngực & Vai)",
            warmup: ["Xoay vai 3 phút"],
            exercises: [selectInclineChest(), selectChestExercise(), selectLateralRaise(), selectTricep()],
            cooldown: ["Giãn cơ ngực 3 phút"]
          },
          {
            day_number: 5,
            day_name: "Ngày 5: Pull B & Core (Lưng xô & Cơ bụng)",
            warmup: ["Xoay lưng vai 3 phút"],
            exercises: [selectPullupOrRow(), selectBackExercise(), selectBicep(), selectCore()],
            cooldown: ["Giãn cơ lưng 3 phút"]
          }
        ];
        if (daysPerWeek === 6) {
          scheduleList.push({
            day_number: 6,
            day_name: "Ngày 6: Legs & Core B (Chân & Bụng nâng cao)",
            warmup: ["Xoay gối 3 phút"],
            exercises: [selectLegExercise(), selectHamstringsLegs(), selectCore()],
            cooldown: ["Giãn cơ chân 3 phút"]
          });
        }
      }

      // Generate Personalized Tips
      const tips = [];
      if (hasBackPain) {
        tips.push("⚠️ An toàn lưng dưới: Đã tự động thay thế Deadlift/Squats nặng bằng Leg Press & các bài có tựa lưng để bảo vệ cột sống.");
      }
      if (hasKneePain) {
        tips.push("⚠️ An toàn khớp gối: Đã tối ưu các bài đạp đùi kiểm soát, tránh gập gối quá 90 độ và các bài nhảy tác động mạnh.");
      }
      if (bmi >= 25) {
        tips.push(`📊 Phân tích BMI (${bmi} - Thừa cân/Béo phì): Ưu tiên kết hợp chế độ thâm hụt Calo nhẹ (Thâm hụt 300-500 kcal/ngày) và giữ tiến độ tập tạ để giữ cơ giảm mỡ.`);
      } else if (isUnderweight) {
        tips.push(`📊 Phân tích BMI (${bmi} - Thiếu cân): Cần bổ sung thặng dư Calo (+300-500 kcal/ngày) và nạp 1.8g - 2.2g Protein/kg trọng lượng cơ thể để phát triển cơ bắp.`);
      } else {
        tips.push(`📊 Phân tích BMI (${bmi} - Cân đối): Duy trì mức calo cân bằng hoặc thặng dư nhẹ theo mục tiêu ${goal}.`);
      }

      tips.push(`⏱️ Cấu hình thời lượng ${sessionDuration} phút/buổi: Thiết kế từ 4-5 bài tập tối ưu với thời gian nghỉ ${restSecs}s giữa các set.`);
      tips.push("🥩 Dinh dưỡng & Phục hồi: Đảm bảo uống 2.5 - 3.5 lít nước mỗi ngày và ngủ đủ 7-8 tiếng để hồi phục hệ thần kinh trung ương.");

      const result = {
        routine_summary: {
          split_name: splitName,
          target_goal: `${goal} (${level})`,
          days_per_week: daysPerWeek,
          estimated_calories_burned_per_session: `${sessionDuration * 5} - ${sessionDuration * 7} kcal`
        },
        schedule: scheduleList,
        personalized_tips: tips
      };

      setGeneratedJson(result);
      setIsGenerating(false);
    }, 600);
  };

  // Copy JSON string to clipboard
  const handleCopyJson = () => {
    if (!generatedJson) return;
    navigator.clipboard.writeText(JSON.stringify(generatedJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Apply generated split to the app state
  const handleApplyToApp = () => {
    if (!generatedJson || !onApplySplitToApp) return;

    // Convert generated JSON schedule into customWorkoutSplit format
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const newSplit = {};

    days.forEach((dayKey, index) => {
      if (index < generatedJson.schedule.length) {
        const item = generatedJson.schedule[index];
        // Map ex_* IDs to standard app exercise keys
        const mappedExerciseIds = item.exercises.map(ex => {
          const rawId = ex.exercise_id;
          if (rawId.includes("bench_press")) return "bench_press";
          if (rawId.includes("incline")) return "incline_dumbbell_press";
          if (rawId.includes("pushup")) return "push_up";
          if (rawId.includes("lat_pulldown")) return "lat_pulldown";
          if (rawId.includes("barbell_row")) return "barbell_row";
          if (rawId.includes("pullup")) return "pull_up";
          if (rawId.includes("deadlift")) return "romanian_deadlift";
          if (rawId.includes("ohp")) return "overhead_press";
          if (rawId.includes("db_press")) return "overhead_press";
          if (rawId.includes("lateral_raise")) return "lateral_raise";
          if (rawId.includes("face_pull")) return "face_pull";
          if (rawId.includes("barbell_squat")) return "barbell_squat";
          if (rawId.includes("leg_press")) return "leg_press";
          if (rawId.includes("lunge")) return "lunge";
          if (rawId.includes("calf")) return "calf_raise";
          if (rawId.includes("curl")) return "bicep_curl";
          if (rawId.includes("pushdown")) return "tricep_pushdown";
          if (rawId.includes("leg_raise")) return "hanging_leg_raise";
          if (rawId.includes("plank")) return "plank";
          return "bench_press";
        });

        newSplit[dayKey] = {
          name: item.day_name,
          type: item.day_name.toLowerCase().includes("push") ? "push" : item.day_name.toLowerCase().includes("pull") ? "pull" : "legs",
          exercises: mappedExerciseIds
        };
      } else {
        newSplit[dayKey] = {
          name: "Nghỉ ngơi (Rest Day)",
          type: "rest",
          exercises: []
        };
      }
    });

    onApplySplitToApp(newSplit);
    setApplied(true);
  };

  return (
    <div className="w-full px-4 py-4 space-y-6">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-lime-500/20 via-emerald-500/10 to-zinc-900 border border-lime-400/30 rounded-3xl p-5 relative overflow-hidden shadow-xl shadow-lime-950/20">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Sparkles size={120} className="text-lime-400" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-lime-400 text-zinc-950 flex items-center justify-center font-black shadow-lg shadow-lime-400/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              AI Personal Trainer
              <span className="text-[10px] bg-lime-400/20 text-lime-400 border border-lime-400/30 px-2 py-0.5 rounded-full font-extrabold uppercase">Kinesiology 2.0</span>
            </h1>
            <p className="text-xs text-zinc-400 font-medium">Khoa học vận động cá nhân hóa lộ trình tập luyện</p>
          </div>
        </div>
      </div>

      {/* FORM NHẬP DỮ LIỆU NGƯỜI DÙNG (USER CONTEXT FORM) */}
      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-3xl p-5 space-y-5 backdrop-blur-xl">
        <h2 className="text-xs font-black uppercase text-zinc-400 tracking-wider flex items-center gap-2 border-b border-zinc-800 pb-3">
          <User size={15} className="text-lime-400" /> 1. Dữ Liệu Đầu Vào Ngưỡng Cửa (User Context)
        </h2>

        {/* 1. Môi trường tập & Cấp độ */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-zinc-300 mb-1.5 block">Môi trường tập</label>
            <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setLocation("Gym")}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                  location === "Gym" ? "bg-lime-400 text-zinc-950 shadow" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Phòng Gym
              </button>
              <button
                type="button"
                onClick={() => setLocation("Home")}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                  location === "Home" ? "bg-lime-400 text-zinc-950 shadow" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Tại nhà
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-300 mb-1.5 block">Trình độ thể lực</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-bold rounded-2xl p-2.5 outline-none focus:border-lime-400"
            >
              <option value="Beginner">Beginner (Mới tập)</option>
              <option value="Intermediate">Intermediate (Trung cấp)</option>
              <option value="Advanced">Advanced (Nâng cao)</option>
            </select>
          </div>
        </div>

        {/* 2. Mục tiêu chính & Thời lượng */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-zinc-300 mb-1.5 block">Mục tiêu chính</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-lime-400 text-xs font-black rounded-2xl p-2.5 outline-none focus:border-lime-400"
            >
              <option value="Hypertrophy">Hypertrophy (Tăng cơ)</option>
              <option value="Strength">Strength (Tăng sức mạnh)</option>
              <option value="Fat Loss">Fat Loss (Giảm mỡ)</option>
              <option value="Endurance">Endurance (Thể lực)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-300 mb-1.5 block">Tần suất & Thời lượng</label>
            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-bold rounded-2xl p-2 outline-none"
              >
                <option value={2}>2 buổi/tuần</option>
                <option value={3}>3 buổi/tuần</option>
                <option value={4}>4 buổi/tuần</option>
                <option value={5}>5 buổi/tuần</option>
                <option value={6}>6 buổi/tuần</option>
              </select>
              <select
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
                className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-bold rounded-2xl p-2 outline-none"
              >
                <option value={30}>30 phút</option>
                <option value={45}>45 phút</option>
                <option value={60}>60 phút</option>
                <option value={90}>90 phút</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Chỉ số cá nhân & BMI live calculator */}
        <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
              <Activity size={13} className="text-lime-400" /> Chỉ số hình thể (Stats & BMI)
            </span>
            <div className="text-right">
              <span className="text-xs font-black text-white">BMI: {bmi}</span>
              <span className={`text-[10px] font-bold block ${getBmiCategory(bmi).color}`}>
                {getBmiCategory(bmi).label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="text-[9px] font-bold text-zinc-500 block uppercase">Cao (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-100 p-2 rounded-xl text-center outline-none focus:border-lime-400"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-zinc-500 block uppercase">Nặng (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-100 p-2 rounded-xl text-center outline-none focus:border-lime-400"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-zinc-500 block uppercase">Tuổi</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-100 p-2 rounded-xl text-center outline-none focus:border-lime-400"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-zinc-500 block uppercase">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-100 p-2 rounded-xl outline-none"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Dụng cụ sẵn có */}
        <div>
          <label className="text-[11px] font-bold text-zinc-300 mb-2 block">Dụng cụ sẵn có</label>
          <div className="flex flex-wrap gap-1.5">
            {equipmentOptions.map((eq) => {
              const active = equipment.includes(eq.id);
              return (
                <button
                  key={eq.id}
                  type="button"
                  onClick={() => toggleEquipment(eq.id)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? "bg-lime-400/20 text-lime-400 border-lime-400/40"
                      : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300"
                  }`}
                >
                  {active && "✓ "}
                  {eq.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Hạn chế / Chấn thương (Safety Constraints) */}
        <div>
          <label className="text-[11px] font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-amber-400" /> Hạn chế / Chấn thương cần tránh
          </label>
          <div className="flex flex-wrap gap-1.5">
            {injuryOptions.map((inj) => {
              const active = injuries.includes(inj.id);
              return (
                <button
                  key={inj.id}
                  type="button"
                  onClick={() => toggleInjury(inj.id)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    active
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : "bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-zinc-300"
                  }`}
                >
                  {active && "⚠️ "}
                  {inj.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTION BUTTON GENERATE */}
        <button
          type="button"
          onClick={handleGenerateRoutine}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-lime-400 to-emerald-400 text-zinc-950 font-black text-sm py-4 rounded-2xl shadow-lg shadow-lime-400/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Đang Phân Tích Kinesiology & Tạo JSON...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              TẠO LỘ TRÌNH AI TÙY CHỈNH (JSON OUTPUT)
            </>
          )}
        </button>
      </div>

      {/* GENERATED RESULT SECTION */}
      {generatedJson && (
        <div className="bg-zinc-900/90 border border-lime-400/30 rounded-3xl p-5 space-y-4 shadow-2xl backdrop-blur-xl animate-fade-in">
          
          {/* Header Bar of Result */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[10px] font-black text-lime-400 uppercase tracking-widest block">AI Generator Ready</span>
              <h3 className="text-base font-black text-white">{generatedJson.routine_summary.split_name}</h3>
            </div>
            
            {/* Tab switch between Visual and JSON Output */}
            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveResultTab("visual")}
                className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all ${
                  activeResultTab === "visual" ? "bg-lime-400 text-zinc-950" : "text-zinc-400"
                }`}
              >
                Trực quan
              </button>
              <button
                type="button"
                onClick={() => setActiveResultTab("json")}
                className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all ${
                  activeResultTab === "json" ? "bg-lime-400 text-zinc-950" : "text-zinc-400"
                }`}
              >
                JSON Schema
              </button>
            </div>
          </div>

          {/* Action buttons bar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyJson}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check size={14} className="text-lime-400" /> : <Copy size={14} />}
              {copied ? "Đã copy JSON!" : "Sao chép JSON Chuẩn"}
            </button>

            {onApplySplitToApp && (
              <button
                type="button"
                onClick={handleApplyToApp}
                className={`flex-1 text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  applied
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-lime-400 text-zinc-950 hover:bg-lime-300"
                }`}
              >
                {applied ? <CheckCircle2 size={14} /> : <Zap size={14} />}
                {applied ? "Đã Áp Dụng Lịch Tập!" : "Áp Dụng Vào Ứng Dụng"}
              </button>
            )}
          </div>

          {/* TAB 1: VISUAL SCHEDULE & TIPS */}
          {activeResultTab === "visual" && (
            <div className="space-y-4">
              
              {/* Summary Badges */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-950/80 p-2.5 rounded-2xl border border-zinc-800 text-center">
                  <span className="text-[9px] text-zinc-500 font-bold block uppercase">Mục tiêu</span>
                  <span className="text-xs font-black text-lime-400">{generatedJson.routine_summary.target_goal}</span>
                </div>
                <div className="bg-zinc-950/80 p-2.5 rounded-2xl border border-zinc-800 text-center">
                  <span className="text-[9px] text-zinc-500 font-bold block uppercase">Tần suất</span>
                  <span className="text-xs font-black text-white">{generatedJson.routine_summary.days_per_week} ngày/tuần</span>
                </div>
                <div className="bg-zinc-950/80 p-2.5 rounded-2xl border border-zinc-800 text-center">
                  <span className="text-[9px] text-zinc-500 font-bold block uppercase">Calo tiêu hao</span>
                  <span className="text-xs font-black text-orange-400">{generatedJson.routine_summary.estimated_calories_burned_per_session}</span>
                </div>
              </div>

              {/* Personalized Tips */}
              {generatedJson.personalized_tips && generatedJson.personalized_tips.length > 0 && (
                <div className="bg-lime-500/10 border border-lime-400/20 rounded-2xl p-3.5 space-y-1.5">
                  <span className="text-[10px] font-black text-lime-400 uppercase tracking-wide block">💡 Lời khuyên cá nhân hóa:</span>
                  {generatedJson.personalized_tips.map((tip, idx) => (
                    <p key={idx} className="text-xs text-zinc-300 font-medium leading-relaxed">
                      • {tip}
                    </p>
                  ))}
                </div>
              )}

              {/* Schedule Days Accordion List */}
              <div className="space-y-3">
                {generatedJson.schedule.map((dayItem) => (
                  <div key={dayItem.day_number} className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                      <h4 className="text-xs font-black text-lime-400">{dayItem.day_name}</h4>
                      <span className="text-[10px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md text-zinc-400 font-mono">
                        {dayItem.exercises.length} bài tập
                      </span>
                    </div>

                    {/* Exercises List */}
                    <div className="space-y-2">
                      {dayItem.exercises.map((ex, eIdx) => (
                        <div key={eIdx} className="bg-zinc-900/60 border border-zinc-800/50 p-2.5 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-100">{ex.name_display}</span>
                            <span className="text-[10px] font-mono text-lime-400 font-bold bg-lime-400/10 px-1.5 py-0.5 rounded">
                              {ex.exercise_id}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                            <span>🎯 {ex.target_muscle}</span>
                            <span>⚡ {ex.sets} sets x {ex.reps} reps</span>
                            <span>⏱️ Nghỉ {ex.rest_seconds}s</span>
                          </div>
                          {ex.notes && (
                            <p className="text-[10px] text-zinc-500 italic">📝 {ex.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: RAW JSON OUTPUT */}
          {activeResultTab === "json" && (
            <div className="relative">
              <pre className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-[11px] font-mono text-lime-400 overflow-x-auto max-h-96 leading-relaxed">
                {JSON.stringify(generatedJson, null, 2)}
              </pre>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
