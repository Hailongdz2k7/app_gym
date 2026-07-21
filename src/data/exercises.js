export const workoutSplit = {
  Monday: {
    name: "Push (Ngực, Vai, Tay sau)",
    type: "push",
    exercises: ["bench_press", "overhead_press", "incline_dumbbell_press", "lateral_raise", "tricep_pushdown"]
  },
  Tuesday: {
    name: "Pull (Lưng, Xô, Tay trước, Bụng)",
    type: "pull",
    exercises: ["lat_pulldown", "barbell_row", "face_pull", "bicep_curl", "hanging_leg_raise"]
  },
  Wednesday: {
    name: "Legs (Chân, Mông, Đùi)",
    type: "legs",
    exercises: ["barbell_squat", "romanian_deadlift", "leg_press", "leg_curl", "calf_raise"]
  },
  Thursday: {
    name: "Push (Ngực, Vai, Tay sau)",
    type: "push",
    exercises: ["dumbbell_chest_press", "arnold_press", "chest_fly", "tricep_overhead_extension", "cable_lateral_raise"]
  },
  Friday: {
    name: "Pull (Lưng, Xô, Tay trước, Bụng)",
    type: "pull",
    exercises: ["pull_up", "cable_row", "hammer_curl", "reverse_fly", "plank"]
  },
  Saturday: {
    name: "Legs (Chân, Mông, Đùi)",
    type: "legs",
    exercises: ["goblet_squat", "lunge", "leg_extension", "lying_leg_curl", "standing_calf_raise"]
  },
  Sunday: {
    name: "Nghỉ ngơi (Rest Day)",
    type: "rest",
    exercises: []
  }
};

export const getDefaultWorkoutSplit = () => JSON.parse(JSON.stringify(workoutSplit));

export const exercisesDb = {
  // --- PUSH: NGỰC (CHEST) ---
  bench_press: {
    id: "bench_press",
    name: "Barbell Bench Press (Đẩy tạ đòn ghế phẳng)",
    primaryMuscle: "Ngực (Chest)",
    targetMuscles: ["chest"],
    secondaryMuscles: ["front_delts", "triceps"],
    machine: "Ghế phẳng & Tạ đòn (Barbell)",
    instructions: [
      "Nằm phẳng trên ghế, mắt thẳng dưới thanh đòn.",
      "Nắm thanh đòn rộng hơn vai một chút, nhấc tạ ra khỏi giá.",
      "Hạ thanh đòn xuống giữa ngực một cách kiểm soát khi hít vào.",
      "Đẩy thanh đòn lên mạnh mẽ khi thở ra, khóa khủy tay nhẹ ở đỉnh."
    ],
    swapSuggestions: ["incline_dumbbell_press", "dumbbell_chest_press", "chest_fly", "incline_barbell_press"]
  },
  incline_barbell_press: {
    id: "incline_barbell_press",
    name: "Incline Barbell Press (Đẩy tạ đòn ghế dốc lên)",
    primaryMuscle: "Ngực trên (Upper Chest)",
    targetMuscles: ["upper_chest"],
    secondaryMuscles: ["front_delts", "triceps"],
    machine: "Ghế dốc lên & Tạ đòn (Barbell)",
    instructions: [
      "Nằm trên ghế dốc lên 30-45 độ, nắm đòn tạ rộng hơn vai.",
      "Nhấc thanh đòn khỏi giá đỡ và giữ thẳng trên ngực.",
      "Hạ tạ xuống chạm nhẹ ngực trên khi hít vào.",
      "Đẩy thẳng tạ lên cao khi thở ra."
    ],
    swapSuggestions: ["incline_dumbbell_press", "bench_press", "dumbbell_chest_press"]
  },
  incline_dumbbell_press: {
    id: "incline_dumbbell_press",
    name: "Incline Dumbbell Press (Đẩy tạ đơn ghế dốc lên)",
    primaryMuscle: "Ngực trên (Upper Chest)",
    targetMuscles: ["upper_chest"],
    secondaryMuscles: ["front_delts", "triceps"],
    machine: "Ghế dốc & Tạ đơn (Dumbbells)",
    instructions: [
      "Chỉnh ghế dốc khoảng 30-45 độ, ngồi và đặt hai quả tạ đơn lên đùi.",
      "Nằm xuống ghế đồng thời đưa tạ lên ngang vai.",
      "Đẩy tạ thẳng lên trên ngực khi thở ra, không để tạ chạm nhau.",
      "Hạ tạ xuống sâu ngang ngực khi hít vào."
    ],
    swapSuggestions: ["bench_press", "dumbbell_chest_press", "incline_barbell_press"]
  },
  dumbbell_chest_press: {
    id: "dumbbell_chest_press",
    name: "Dumbbell Bench Press (Đẩy tạ đơn ghế phẳng)",
    primaryMuscle: "Ngực (Chest)",
    targetMuscles: ["chest"],
    secondaryMuscles: ["front_delts", "triceps"],
    machine: "Ghế phẳng & Tạ đơn (Dumbbells)",
    instructions: [
      "Nằm trên ghế phẳng, cầm hai quả tạ đơn sát nách.",
      "Đẩy thẳng tạ lên cao, hướng hai lòng bàn tay vào nhau ở đỉnh.",
      "Hạ tạ xuống hai bên ngực cho đến khi khủy tay vuông góc."
    ],
    swapSuggestions: ["bench_press", "incline_dumbbell_press", "decline_bench_press"]
  },
  decline_bench_press: {
    id: "decline_bench_press",
    name: "Decline Barbell Press (Đẩy tạ đòn ghế dốc xuống)",
    primaryMuscle: "Ngực dưới (Lower Chest)",
    targetMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front_delts"],
    machine: "Ghế dốc xuống & Tạ đòn (Barbell)",
    instructions: [
      "Nằm cố định chân trên ghế dốc xuống, nắm tạ đòn rộng hơn vai.",
      "Nhấc tạ ra và hạ tạ xuống phần ngực dưới một cách kiểm soát.",
      "Đẩy tạ mạnh mẽ lên cao khi thở ra."
    ],
    swapSuggestions: ["bench_press", "dumbbell_chest_press", "cable_crossover"]
  },
  chest_fly: {
    id: "chest_fly",
    name: "Cable / Dumbbell Chest Fly (Ép ngực với cáp/tạ đơn)",
    primaryMuscle: "Ngực (Chest)",
    targetMuscles: ["chest"],
    secondaryMuscles: ["front_delts"],
    machine: "Máy ép ngực hoặc Dây cáp (Cable)",
    instructions: [
      "Đứng giữa hai tay cáp hoặc nằm trên ghế phẳng.",
      "Mở rộng hai tay sang hai bên, hơi cong khủy tay.",
      "Ép hai tay lại gần nhau ở trước ngực, cảm nhận cơ ngực co bóp tối đa.",
      "Mở tay chậm rãi về vị trí ban đầu."
    ],
    swapSuggestions: ["bench_press", "incline_dumbbell_press", "cable_crossover"]
  },
  cable_crossover: {
    id: "cable_crossover",
    name: "Cable Crossover (Kéo cáp chéo từ trên xuống)",
    primaryMuscle: "Ngực dưới (Lower Chest)",
    targetMuscles: ["chest"],
    secondaryMuscles: ["front_delts"],
    machine: "Máy cáp (Cable Machine)",
    instructions: [
      "Chỉnh ròng rọc ở vị trí cao, đứng giữa và cầm hai tay nắm cáp.",
      "Bước một chân lên trước, hơi cúi người nhẹ, mở rộng tay.",
      "Kéo cáp chéo xuống dưới và hướng vào nhau ở trước bụng dưới.",
      "Nhả cáp chậm rãi lên vị trí cũ."
    ],
    swapSuggestions: ["chest_fly", "decline_bench_press"]
  },

  // --- PUSH: VAI (SHOULDERS) ---
  overhead_press: {
    id: "overhead_press",
    name: "Barbell Overhead Press (Đẩy tạ đòn qua đầu)",
    primaryMuscle: "Vai trước (Front Delts)",
    targetMuscles: ["front_delts"],
    secondaryMuscles: ["triceps", "upper_chest"],
    machine: "Tạ đòn (Barbell)",
    instructions: [
      "Đứng thẳng, hai chân rộng bằng vai, giữ tạ đòn ở mức vai trước.",
      "Siết cơ bụng, mông và đẩy tạ thẳng lên trên đầu.",
      "Thở ra khi đẩy lên và đưa đầu hơi hướng về phía trước khi tạ qua đỉnh đầu.",
      "Hạ tạ xuống vai trước một cách kiểm soát khi hít vào."
    ],
    swapSuggestions: ["arnold_press", "dumbbell_shoulder_press"]
  },
  dumbbell_shoulder_press: {
    id: "dumbbell_shoulder_press",
    name: "Dumbbell Shoulder Press (Đẩy vai đứng với tạ đơn)",
    primaryMuscle: "Vai trước (Front Delts)",
    targetMuscles: ["front_delts"],
    secondaryMuscles: ["triceps", "lateral_delts"],
    machine: "Tạ đơn (Dumbbells)",
    instructions: [
      "Đứng thẳng hoặc ngồi ghế thẳng lưng, giữ hai quả tạ đơn ngang vai, lòng bàn tay hướng trước.",
      "Đẩy thẳng tạ lên cao qua đầu cho đến khi tay duỗi thẳng.",
      "Hạ tạ chậm về vị trí ngang tai."
    ],
    swapSuggestions: ["overhead_press", "arnold_press"]
  },
  arnold_press: {
    id: "arnold_press",
    name: "Arnold Shoulder Press (Đẩy vai xoay tạ Arnold)",
    primaryMuscle: "Vai trước (Front Delts)",
    targetMuscles: ["front_delts", "lateral_delts"],
    secondaryMuscles: ["triceps"],
    machine: "Tạ đơn (Dumbbells)",
    instructions: [
      "Ngồi tựa lưng, giữ hai tạ đơn trước ngực với lòng bàn tay hướng vào thân người.",
      "Đẩy tạ lên đồng thời xoay cổ tay sao cho lòng bàn tay hướng ra ngoài ở đỉnh.",
      "Hạ tạ xuống và xoay lòng bàn tay trở lại vị trí ban đầu."
    ],
    swapSuggestions: ["overhead_press", "dumbbell_shoulder_press"]
  },
  lateral_raise: {
    id: "lateral_raise",
    name: "Dumbbell Lateral Raise (Dang tạ đơn sang hai bên)",
    primaryMuscle: "Vai giữa (Lateral Delts)",
    targetMuscles: ["lateral_delts"],
    secondaryMuscles: ["front_delts", "traps"],
    machine: "Tạ đơn (Dumbbells)",
    instructions: [
      "Đứng thẳng, cầm hai tạ đơn đặt dọc bên hông.",
      "Nâng hai cánh tay sang hai bên, giữ khủy tay hơi cong nhẹ.",
      "Nâng tạ lên cho đến khi tay song song với sàn.",
      "Hạ tạ xuống chậm rãi dưới tầm kiểm soát."
    ],
    swapSuggestions: ["cable_lateral_raise"]
  },
  cable_lateral_raise: {
    id: "cable_lateral_raise",
    name: "Cable Lateral Raise (Dang cáp một tay sang bên)",
    primaryMuscle: "Vai giữa (Lateral Delts)",
    targetMuscles: ["lateral_delts"],
    secondaryMuscles: ["traps"],
    machine: "Máy cáp (Cable Machine)",
    instructions: [
      "Đứng cạnh máy cáp, chỉnh ròng rọc ở vị trí thấp nhất.",
      "Tay xa máy nắm tay cầm, kéo cáp chéo qua người lên cao sang bên cạnh.",
      "Giữ khủy tay hơi cong, nâng lên ngang vai rồi hạ xuống chậm."
    ],
    swapSuggestions: ["lateral_raise"]
  },
  front_raise: {
    id: "front_raise",
    name: "Dumbbell Front Raise (Đưa tạ đơn trước mặt)",
    primaryMuscle: "Vai trước (Front Delts)",
    targetMuscles: ["front_delts"],
    secondaryMuscles: ["upper_chest"],
    machine: "Tạ đơn (Dumbbells)",
    instructions: [
      "Đứng thẳng, cầm tạ đơn đặt trước đùi.",
      "Nâng tạ thẳng lên phía trước mặt cho đến khi tay song song sàn.",
      "Hạ tạ xuống chậm rãi."
    ],
    swapSuggestions: ["overhead_press", "arnold_press"]
  },

  // --- PUSH: TAY SAU (TRICEPS) ---
  tricep_pushdown: {
    id: "tricep_pushdown",
    name: "Cable Tricep Pushdown (Kéo cáp tay sau)",
    primaryMuscle: "Tay sau (Triceps)",
    targetMuscles: ["triceps"],
    secondaryMuscles: [],
    machine: "Máy cáp (Cable Machine)",
    instructions: [
      "Đứng đối diện máy cáp, nắm dây thừng hoặc thanh đòn thẳng.",
      "Giữ khủy tay áp sát vào thân người cố định.",
      "Đẩy cáp xuống dưới cho đến khi cánh tay duỗi thẳng hoàn toàn.",
      "Từ từ đưa tay về vị trí ban đầu nhưng giữ khủy tay không di chuyển."
    ],
    swapSuggestions: ["tricep_overhead_extension", "skull_crusher"]
  },
  tricep_overhead_extension: {
    id: "tricep_overhead_extension",
    name: "Overhead Dumbbell Tricep Extension (Cầm tạ đơn đẩy sau đầu)",
    primaryMuscle: "Tay sau (Triceps)",
    targetMuscles: ["triceps"],
    secondaryMuscles: [],
    machine: "Tạ đơn (Dumbbells)",
    instructions: [
      "Ngồi hoặc đứng thẳng, cầm một quả tạ đơn bằng hai tay nâng thẳng trên đầu.",
      "Giữ khủy tay hướng về phía trước, hạ tạ xuống sau đầu.",
      "Đẩy tạ thẳng lên trở lại vị trí ban đầu bằng cách duỗi thẳng tay sau."
    ],
    swapSuggestions: ["tricep_pushdown", "skull_crusher"]
  },
  skull_crusher: {
    id: "skull_crusher",
    name: "EZ-Bar Skull Crusher (Nằm duỗi tay sau tạ đòn EZ)",
    primaryMuscle: "Tay sau (Triceps)",
    targetMuscles: ["triceps"],
    secondaryMuscles: [],
    machine: "Ghế phẳng & Đòn tạ EZ (EZ-Bar)",
    instructions: [
      "Nằm phẳng trên ghế, cầm tạ đòn EZ duỗi thẳng trước mặt vuông góc với trần.",
      "Giữ bắp tay cố định, gập khủy tay đưa thanh tạ hướng về phía trán.",
      "Dùng lực tay sau duỗi tay đẩy tạ lên cao trở lại vị trí ban đầu."
    ],
    swapSuggestions: ["tricep_pushdown", "tricep_overhead_extension", "dips"]
  },
  dips: {
    id: "dips",
    name: "Chest / Tricep Dips (Tập xà kép)",
    primaryMuscle: "Tay sau & Ngực dưới (Triceps / Chest)",
    targetMuscles: ["triceps", "chest"],
    secondaryMuscles: ["front_delts"],
    machine: "Khung xà kép (Dip Station)",
    instructions: [
      "Bám chặt tay vào thanh xà kép, nhấc người lên duỗi thẳng tay.",
      "Hạ người xuống bằng cách gập khủy tay cho đến khi bắp tay song song với sàn.",
      "Đẩy mạnh người lên vị trí ban đầu bằng cách duỗi thẳng cánh tay."
    ],
    swapSuggestions: ["tricep_pushdown", "skull_crusher"]
  },

  // --- PULL: LƯNG / XÔ (BACK / LATS) ---
  lat_pulldown: {
    id: "lat_pulldown",
    name: "Cable Lat Pulldown (Kéo xô với máy cáp dọc)",
    primaryMuscle: "Lưng/Xô (Lats)",
    targetMuscles: ["lats"],
    secondaryMuscles: ["biceps", "upper_back"],
    machine: "Máy kéo cáp dọc (Lat Pulldown Machine)",
    instructions: [
      "Ngồi vào máy, cố định đùi dưới đệm, nắm thanh đòn rộng hơn vai.",
      "Hơi nghiêng người ra sau, kéo thanh đòn xuống chạm phần ngực trên.",
      "Cố gắng ép hai xương bả vai lại với nhau.",
      "Đưa thanh đòn lên từ từ dưới tầm kiểm soát."
    ],
    swapSuggestions: ["pull_up", "cable_row", "one_arm_dumbbell_row"]
  },
  pull_up: {
    id: "pull_up",
    name: "Pull-Up (Hít xà đơn)",
    primaryMuscle: "Lưng/Xô (Lats)",
    targetMuscles: ["lats"],
    secondaryMuscles: ["biceps", "upper_back", "core"],
    machine: "Xà đơn (Pull-up Bar)",
    instructions: [
      "Bám vào thanh xà đơn rộng hơn vai, lòng bàn tay hướng ra ngoài.",
      "Treo người tự do, siết bụng.",
      "Dùng cơ lưng xô kéo người lên cho đến khi cằm vượt qua xà.",
      "Hạ người xuống chậm rãi cho đến khi tay duỗi thẳng."
    ],
    swapSuggestions: ["lat_pulldown", "cable_row", "t_bar_row"]
  },
  barbell_row: {
    id: "barbell_row",
    name: "Barbell Row (Gập người chèo tạ đòn)",
    primaryMuscle: "Lưng giữa (Middle Back)",
    targetMuscles: ["upper_back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    machine: "Tạ đòn (Barbell)",
    instructions: [
      "Đứng cúi người xuống khoảng 45 độ, giữ lưng thẳng, đầu gối hơi khụy.",
      "Nắm tạ đòn rộng bằng vai, để tạ buông thẳng dưới vai.",
      "Kéo tạ đòn sát về phía bụng dưới, khủy tay khép chặt vào thân người.",
      "Hạ tạ xuống từ từ."
    ],
    swapSuggestions: ["cable_row", "one_arm_dumbbell_row", "t_bar_row"]
  },
  cable_row: {
    id: "cable_row",
    name: "Seated Cable Row (Kéo cáp ngồi chèo thuyền)",
    primaryMuscle: "Lưng giữa (Middle Back)",
    targetMuscles: ["upper_back", "lats"],
    secondaryMuscles: ["biceps", "rear_delts"],
    machine: "Máy cáp ngồi (Cable Machine)",
    instructions: [
      "Ngồi vào máy cáp, đặt hai chân lên giá đỡ, hơi khuỵu gối.",
      "Giữ lưng thẳng, kéo tay cầm về phía bụng dưới.",
      "Ưỡn ngực và ép xương bả vai tối đa ở đỉnh động tác.",
      "Nhả cáp ra từ từ đưa người về tư thế ban đầu."
    ],
    swapSuggestions: ["barbell_row", "lat_pulldown", "one_arm_dumbbell_row"]
  },
  one_arm_dumbbell_row: {
    id: "one_arm_dumbbell_row",
    name: "One-Arm Dumbbell Row (Kéo tạ đơn một tay)",
    primaryMuscle: "Lưng giữa (Middle Back)",
    targetMuscles: ["lats", "upper_back"],
    secondaryMuscles: ["biceps", "rear_delts"],
    machine: "Tạ đơn & Ghế phẳng (Dumbbell)",
    instructions: [
      "Đặt một đầu gối và một tay cùng bên lên ghế phẳng, lưng thẳng song song mặt ghế.",
      "Tay còn lại cầm tạ đơn duỗi thẳng xuống sàn.",
      "Kéo tạ thẳng lên hông, ép khủy tay sát hông.",
      "Hạ tạ xuống chậm rãi."
    ],
    swapSuggestions: ["barbell_row", "cable_row", "t_bar_row"]
  },
  t_bar_row: {
    id: "t_bar_row",
    name: "T-Bar Row (Kéo tạ đòn chữ T)",
    primaryMuscle: "Lưng giữa (Middle Back)",
    targetMuscles: ["upper_back", "lats"],
    secondaryMuscles: ["biceps"],
    machine: "Máy chèo chữ T hoặc Thanh đòn chéo (T-Bar)",
    instructions: [
      "Đứng trên bàn đạp, kẹp thanh đòn chữ T giữa hai chân, lưng thẳng cúi 45 độ.",
      "Nắm tay nắm và kéo tạ lên sát ngực dưới.",
      "Ép chặt xương bả vai ở đỉnh và nhả tạ xuống chậm."
    ],
    swapSuggestions: ["barbell_row", "one_arm_dumbbell_row"]
  },

  // --- PULL: VAI SAU (REAR DELTS) ---
  face_pull: {
    id: "face_pull",
    name: "Cable Face Pull (Kéo cáp ngang mặt)",
    primaryMuscle: "Vai sau (Rear Delts)",
    targetMuscles: ["rear_delts"],
    secondaryMuscles: ["traps", "rotator_cuff"],
    machine: "Máy cáp & Dây thừng",
    instructions: [
      "Chỉnh cáp cao ngang mặt, gắn dây thừng.",
      "Nắm dây thừng lòng bàn tay hướng vào nhau, lùi lại tạo lực căng.",
      "Kéo dây thừng về phía trán, tách hai đầu dây sang hai bên tai.",
      "Nhả cáp ra từ từ."
    ],
    swapSuggestions: ["reverse_fly", "bent_over_rear_delt_row"]
  },
  reverse_fly: {
    id: "reverse_fly",
    name: "Dumbbell Rear Delt Fly (Gập người dang tạ vai sau)",
    primaryMuscle: "Vai sau (Rear Delts)",
    targetMuscles: ["rear_delts"],
    secondaryMuscles: ["upper_back"],
    machine: "Tạ đơn (Dumbbells)",
    instructions: [
      "Đứng gập người hoặc nằm sấp trên ghế dốc nhẹ.",
      "Cầm tạ đơn hướng xuống sàn, lòng bàn tay đối nhau.",
      "Mở rộng hai tay nâng tạ sang hai bên song song với sàn nhà.",
      "Hạ tạ xuống chậm."
    ],
    swapSuggestions: ["face_pull", "bent_over_rear_delt_row"]
  },
  bent_over_rear_delt_row: {
    id: "bent_over_rear_delt_row",
    name: "Bent-Over Rear Delt Row (Gập người chèo tạ vai sau)",
    primaryMuscle: "Vai sau (Rear Delts)",
    targetMuscles: ["rear_delts"],
    secondaryMuscles: ["upper_back"],
    machine: "Tạ đơn (Dumbbells)",
    instructions: [
      "Cúi gập người lưng thẳng, đầu gối hơi khụy, cầm hai tạ đơn thả lỏng.",
      "Kéo khủy tay rộng ra hai bên hướng lên trên tạo góc 90 độ.",
      "Cảm nhận cơ vai sau co bóp mạnh, hạ tạ xuống chậm."
    ],
    swapSuggestions: ["face_pull", "reverse_fly"]
  },

  // --- PULL: TAY TRƯỚC (BICEPS / FOREARMS) ---
  bicep_curl: {
    id: "bicep_curl",
    name: "Dumbbell Bicep Curl (Cuộn tạ đơn tay trước)",
    primaryMuscle: "Tay trước (Biceps)",
    targetMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    machine: "Tạ đơn (Dumbbells)",
    instructions: [
      "Đứng hoặc ngồi thẳng, giữ tạ đơn dọc thân người, lòng bàn tay hướng vào nhau.",
      "Cuộn tạ lên đồng thời xoay lòng bàn tay hướng lên trên.",
      "Ép chặt cơ tay trước ở đỉnh rồi hạ tạ xuống từ từ."
    ],
    swapSuggestions: ["hammer_curl", "preacher_curl"]
  },
  hammer_curl: {
    id: "hammer_curl",
    name: "Dumbbell Hammer Curl (Cuộn tạ búa)",
    primaryMuscle: "Tay trước & Cẳng tay",
    targetMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    machine: "Tạ đơn (Dumbbells)",
    instructions: [
      "Đứng thẳng, cầm tạ đơn hai bên với lòng bàn tay hướng vào nhau.",
      "Cuộn tạ lên trên nhưng không xoay cổ tay (giữ tư thế như tay cầm búa).",
      "Hạ tạ xuống chậm rãi."
    ],
    swapSuggestions: ["bicep_curl", "preacher_curl"]
  },
  preacher_curl: {
    id: "preacher_curl",
    name: "EZ-Bar Preacher Curl (Cuộn tay trước trên ghế dốc cô lập)",
    primaryMuscle: "Tay trước (Biceps)",
    targetMuscles: ["biceps"],
    secondaryMuscles: ["forearms"],
    machine: "Ghế dốc đệm khuỷu & Tạ đòn (Preacher Bench)",
    instructions: [
      "Ngồi đặt cùi chỏ tay lên đệm dốc của bàn Preacher, nắm thanh đòn EZ.",
      "Cuộn thanh tạ lên phía mặt bằng cách co bóp cơ tay trước.",
      "Hạ tạ xuống từ từ cho đến khi tay duỗi thẳng."
    ],
    swapSuggestions: ["bicep_curl", "hammer_curl"]
  },

  // --- PULL: CƠ BỤNG (ABS / CORE) ---
  hanging_leg_raise: {
    id: "hanging_leg_raise",
    name: "Hanging Leg Raise (Đu xà nâng chân)",
    primaryMuscle: "Bụng dưới (Lower Abs)",
    targetMuscles: ["abs"],
    secondaryMuscles: ["hip_flexors"],
    machine: "Xà đơn (Pull-up Bar)",
    instructions: [
      "Treo người trên xà đơn, hai chân khép thẳng.",
      "Nâng hai chân lên cho đến khi song song với sàn (hoặc co đầu gối lên sát ngực).",
      "Hạ chân xuống thật chậm và kiểm soát lực vung người."
    ],
    swapSuggestions: ["plank", "cable_crunch"]
  },
  plank: {
    id: "plank",
    name: "Forearm Plank (Đo sàn giữ bụng)",
    primaryMuscle: "Bụng/Lõi (Core)",
    targetMuscles: ["abs"],
    secondaryMuscles: ["shoulders", "lower_back"],
    machine: "Thảm tập (Mat)",
    instructions: [
      "Tựa cẳng tay xuống sàn vuông góc dưới vai.",
      "Nhấc người lên trên các đầu ngón chân, giữ thân người tạo thành đường thẳng.",
      "Siết chặt cơ bụng và giữ tư thế lâu nhất có thể."
    ],
    swapSuggestions: ["hanging_leg_raise", "russian_twist"]
  },
  cable_crunch: {
    id: "cable_crunch",
    name: "Kneeling Cable Crunch (Quỳ gối kéo cáp bụng)",
    primaryMuscle: "Bụng trên (Upper Abs)",
    targetMuscles: ["abs"],
    secondaryMuscles: [],
    machine: "Máy cáp (Cable Machine)",
    instructions: [
      "Quỳ đối diện máy cáp, tay cầm dây thừng đặt sau gáy tai.",
      "Cúi đầu gập người cuộn cột sống hướng về đùi, siết chặt bụng.",
      "Nhả lưng thẳng lên chậm dưới sức căng của cáp."
    ],
    swapSuggestions: ["hanging_leg_raise", "plank"]
  },
  russian_twist: {
    id: "russian_twist",
    name: "Russian Twist (Ngồi vặn mình kiểu Nga)",
    primaryMuscle: "Bụng/Cơ liên sườn (Obliques)",
    targetMuscles: ["abs"],
    secondaryMuscles: ["hip_flexors"],
    machine: "Tạ đơn (Dumbbell) / Quả bóng tập",
    instructions: [
      "Ngồi trên sàn gối hơi co, nâng chân nhấc khỏi đất, ngả lưng sau 45 độ.",
      "Cầm tạ đơn hoặc chắp hai tay xoay toàn bộ vai sang trái, chạm nhẹ tay xuống sàn.",
      "Tiếp tục xoay ngược lại sang bên phải."
    ],
    swapSuggestions: ["plank", "hanging_leg_raise"]
  },

  // --- LEGS: ĐÙI TRƯỚC (QUADS) ---
  barbell_squat: {
    id: "barbell_squat",
    name: "Barbell Back Squat (Gánh tạ đòn đùi sau)",
    primaryMuscle: "Đùi trước (Quads)",
    targetMuscles: ["quads"],
    secondaryMuscles: ["glutes", "hamstrings", "lower_back"],
    machine: "Squat Rack & Tạ đòn (Barbell)",
    instructions: [
      "Đặt thanh đòn trên cơ cầu vai, đứng hai chân rộng bằng vai, mũi chân hơi hướng ra ngoài.",
      "Hạ mông xuống như ngồi ghế, giữ lưng thẳng và ngực mở.",
      "Hạ sâu cho đến khi đùi song song hoặc thấp hơn đầu gối.",
      "Đạp gót đẩy người đứng thẳng dậy."
    ],
    swapSuggestions: ["leg_press", "goblet_squat", "hack_squat"]
  },
  goblet_squat: {
    id: "goblet_squat",
    name: "Dumbbell Goblet Squat (Gánh tạ đơn trước ngực)",
    primaryMuscle: "Đùi trước (Quads)",
    targetMuscles: ["quads"],
    secondaryMuscles: ["glutes", "core"],
    machine: "Tạ đơn (Dumbbell)",
    instructions: [
      "Cầm một quả tạ đơn thẳng đứng trước ngực bằng hai tay.",
      "Thực hiện động tác squat xuống sâu, khủy tay hướng vào trong đầu gối.",
      "Đẩy người lên trở lại vị trí cũ."
    ],
    swapSuggestions: ["barbell_squat", "leg_press"]
  },
  leg_press: {
    id: "leg_press",
    name: "Leg Press (Đạp đùi với máy nghiêng)",
    primaryMuscle: "Đùi trước & Mông (Quads / Glutes)",
    targetMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings"],
    machine: "Máy đạp đùi (Leg Press Machine)",
    instructions: [
      "Ngồi vào máy, đặt hai bàn chân lên bàn đạp rộng bằng vai.",
      "Mở khóa an toàn, hạ bàn đạp xuống chậm rãi cho đến khi đùi tạo góc 90 độ.",
      "Đạp bàn đạp đẩy tạ ra xa, không khóa thẳng khủy chân."
    ],
    swapSuggestions: ["barbell_squat", "goblet_squat", "hack_squat"]
  },
  hack_squat: {
    id: "hack_squat",
    name: "Hack Squat (Gánh đùi xiên với máy)",
    primaryMuscle: "Đùi trước (Quads)",
    targetMuscles: ["quads"],
    secondaryMuscles: ["glutes", "hamstrings"],
    machine: "Máy Hack Squat (Hack Squat Machine)",
    instructions: [
      "Tựa lưng vào đệm máy, đặt vai dưới đệm tỳ vai, chân rộng bằng vai trên giá bàn đạp.",
      "Mở khóa an toàn, hạ thấp thân người xuống sâu.",
      "Đạp bàn chân đẩy tạ đi lên duỗi chân thẳng (không khóa khớp gối)."
    ],
    swapSuggestions: ["barbell_squat", "leg_press"]
  },
  leg_extension: {
    id: "leg_extension",
    name: "Leg Extension (Đá đùi trước ngồi)",
    primaryMuscle: "Đùi trước (Quads)",
    targetMuscles: ["quads"],
    secondaryMuscles: [],
    machine: "Máy đá đùi trước (Leg Extension Machine)",
    instructions: [
      "Ngồi vào máy đá đùi, đặt cổ chân dưới thanh đệm.",
      "Dùng đùi trước đá thẳng chân lên ngang tầm.",
      "Hạ chân xuống từ từ."
    ],
    swapSuggestions: ["barbell_squat", "leg_press"]
  },
  lunge: {
    id: "lunge",
    name: "Dumbbell Walking Lunge (Bước chùng chân với tạ đơn)",
    primaryMuscle: "Đùi trước & Mông (Quads / Glutes)",
    targetMuscles: ["quads", "glutes"],
    secondaryMuscles: ["hamstrings"],
    machine: "Tạ đơn (Dumbbells)",
    instructions: [
      "Đứng cầm hai tạ đơn hai bên hông.",
      "Bước một chân lên trước một bước dài, hạ thấp trọng tâm sao cho hai đầu gối vuông góc.",
      "Đạp chân trước lên thu chân sau và tiếp tục đổi chân bước đi."
    ],
    swapSuggestions: ["barbell_squat", "leg_press"]
  },

  // --- LEGS: ĐÙI SAU & MÔNG (HAMSTRINGS / GLUTES) ---
  romanian_deadlift: {
    id: "romanian_deadlift",
    name: "Romanian Deadlift (Cúi người kéo tạ đùi sau)",
    primaryMuscle: "Đùi sau & Mông (Hamstrings / Glutes)",
    targetMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["lower_back"],
    machine: "Tạ đòn (Barbell)",
    instructions: [
      "Đứng thẳng cầm thanh đạ đòn đằng trước đùi.",
      "Đẩy hông ra sau và hạ tạ dọc theo ống chân, giữ đầu gối hơi khuỵu nhẹ.",
      "Hạ cho đến khi cảm thấy cơ đùi sau căng căng hết cỡ.",
      "Siết cơ mông đẩy hông về phía trước để đứng thẳng lên."
    ],
    swapSuggestions: ["leg_curl", "lying_leg_curl", "hip_thrust"]
  },
  leg_curl: {
    id: "leg_curl",
    name: "Seated Leg Curl (Móc đùi sau ngồi)",
    primaryMuscle: "Đùi sau (Hamstrings)",
    targetMuscles: ["hamstrings"],
    secondaryMuscles: [],
    machine: "Máy móc đùi ngồi (Leg Curl Machine)",
    instructions: [
      "Ngồi vào máy, đặt đệm đùi cố định và chân tựa lên thanh đệm gót.",
      "Dùng lực cơ đùi sau gập chân kéo thanh đệm xuống và ra sau.",
      "Từ từ đưa chân thẳng ra kiểm soát."
    ],
    swapSuggestions: ["romanian_deadlift", "lying_leg_curl"]
  },
  lying_leg_curl: {
    id: "lying_leg_curl",
    name: "Lying Leg Curl (Nằm móc đùi sau)",
    primaryMuscle: "Đùi sau (Hamstrings)",
    targetMuscles: ["hamstrings"],
    secondaryMuscles: [],
    machine: "Máy nằm móc đùi (Lying Leg Curl Machine)",
    instructions: [
      "Nằm sấp trên máy móc đùi sau, đặt gót chân dưới đệm cuộn.",
      "Co gối gập tạ lên sát mông.",
      "Nhả tạ xuống chậm trở lại vị trí ban đầu."
    ],
    swapSuggestions: ["leg_curl", "romanian_deadlift"]
  },
  hip_thrust: {
    id: "hip_thrust",
    name: "Barbell Hip Thrust (Đẩy hông tập cơ mông)",
    primaryMuscle: "Cơ mông (Glutes)",
    targetMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings"],
    machine: "Ghế phẳng & Tạ đòn (Barbell)",
    instructions: [
      "Tựa lưng trên vào cạnh ghế phẳng, đặt thanh đòn tạ lên hông (có đệm lót).",
      "Hai chân mở rộng trên sàn gối gập vuông góc.",
      "Đẩy hông mạnh mẽ hướng lên trần nhà, siết cơ mông tối đa.",
      "Hạ hông xuống chậm gần chạm đất."
    ],
    swapSuggestions: ["romanian_deadlift", "barbell_squat"]
  },

  // --- LEGS: BẮP CHUỐI (CALVES) ---
  calf_raise: {
    id: "calf_raise",
    name: "Calf Raise (Nhón bắp chuối đứng trên bục)",
    primaryMuscle: "Bắp chuối (Calves)",
    targetMuscles: ["calves"],
    secondaryMuscles: [],
    machine: "Bục đứng (Elevation Block)",
    instructions: [
      "Đứng nửa bàn chân trước trên bục cao, gót chân nhô ra ngoài tự do.",
      "Hạ gót chân sâu xuống dưới mặt bục để căng bắp chuối.",
      "Nhón cao gót chân lên tối đa, co cơ bắp chuối.",
      "Nhả ra chậm."
    ],
    swapSuggestions: ["standing_calf_raise"]
  },
  standing_calf_raise: {
    id: "standing_calf_raise",
    name: "Standing Dumbbell Calf Raise (Nhón chân đứng tạ đơn)",
    primaryMuscle: "Bắp chuối (Calves)",
    targetMuscles: ["calves"],
    secondaryMuscles: [],
    machine: "Tạ đơn (Dumbbells)",
    instructions: [
      "Đứng thẳng giữ tạ đơn một bên, tay kia vịn tường thăng bằng.",
      "Nhón một hoặc cả hai chân lên trên cao hết mức và giữ 1 giây.",
      "Từ từ hạ xuống gót chạm nhẹ sàn rồi lặp lại."
    ],
    swapSuggestions: ["calf_raise"]
  }
};
