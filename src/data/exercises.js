import fullExercisesDb from "./exercisesDbFull.json";

export const workoutSplit = {
  Monday: {
    name: "Push (Ngực, Vai, Tay sau)",
    type: "push",
    exercises: ["Barbell_Bench_Press_-_Medium_Grip", "Barbell_Shoulder_Press", "Incline_Dumbbell_Press", "Dumbbell_Raise", "Triceps_Pushdown"]
  },
  Tuesday: {
    name: "Pull (Lưng, Xô, Tay trước, Bụng)",
    type: "pull",
    exercises: ["Full_Range-Of-Motion_Lat_Pulldown", "Bent_Over_Barbell_Row", "Face_Pull", "Barbell_Curl", "Hanging_Leg_Raise"]
  },
  Wednesday: {
    name: "Legs (Chân, Mông, Đùi)",
    type: "legs",
    exercises: ["Barbell_Squat", "Barbell_Deadlift", "Leg_Press", "Lying_Leg_Curls", "Standing_Calf_Raises"]
  },
  Thursday: {
    name: "Push (Ngực, Vai, Tay sau)",
    type: "push",
    exercises: ["Dumbbell_Bench_Press", "Arnold_Dumbbell_Press", "Dumbbell_Flyes", "Cable_Rope_Overhead_Triceps_Extension", "Cable_Seated_Lateral_Raise"]
  },
  Friday: {
    name: "Pull (Lưng, Xô, Tay trước, Bụng)",
    type: "pull",
    exercises: ["Pull-Up", "Seated_Cable_Rows", "Hammer_Curls", "Cable_Rear_Delt_Fly", "Plank"]
  },
  Saturday: {
    name: "Legs (Chân, Mông, Đùi)",
    type: "legs",
    exercises: ["Goblet_Squat", "Dumbbell_Lunges", "Leg_Extensions", "Lying_Leg_Curls", "Standing_Calf_Raises"]
  },
  Sunday: {
    name: "Nghỉ ngơi (Rest Day)",
    type: "rest",
    exercises: []
  }
};

export const getDefaultWorkoutSplit = () => JSON.parse(JSON.stringify(workoutSplit));

// Legacy key aliases mapping to full database keys
const aliases = {
  bench_press: "Barbell_Bench_Press_-_Medium_Grip",
  incline_barbell_press: "Barbell_Incline_Bench_Press_-_Medium_Grip",
  incline_dumbbell_press: "Incline_Dumbbell_Press",
  dumbbell_chest_press: "Dumbbell_Bench_Press",
  chest_fly: "Dumbbell_Flyes",
  push_up: "Push-Ups",
  overhead_press: "Barbell_Shoulder_Press",
  arnold_press: "Arnold_Dumbbell_Press",
  lateral_raise: "Dumbbell_Raise",
  cable_lateral_raise: "Cable_Seated_Lateral_Raise",
  tricep_pushdown: "Triceps_Pushdown",
  lat_pulldown: "Full_Range-Of-Motion_Lat_Pulldown",
  barbell_row: "Bent_Over_Barbell_Row",
  face_pull: "Face_Pull",
  bicep_curl: "Barbell_Curl",
  hammer_curl: "Hammer_Curls",
  barbell_squat: "Barbell_Squat",
  leg_press: "Leg_Press",
  romanian_deadlift: "Barbell_Deadlift",
  leg_curl: "Lying_Leg_Curls",
  lunge: "Dumbbell_Lunges",
  calf_raise: "Standing_Calf_Raises",
  standing_calf_raise: "Standing_Calf_Raises",
  plank: "Plank",
  hanging_leg_raise: "Hanging_Leg_Raise",
  crunch: "Crunches",
  pull_up: "Pull-Up",
  goblet_squat: "Goblet_Squat",
  leg_extension: "Leg_Extensions",
  lying_leg_curl: "Lying_Leg_Curls",
  tricep_overhead_extension: "Cable_Rope_Overhead_Triceps_Extension",
  cable_row: "Seated_Cable_Rows",
  reverse_fly: "Cable_Rear_Delt_Fly"
};

const mergedDb = { ...fullExercisesDb };

// Create aliases pointing to full DB objects
Object.keys(aliases).forEach(aliasKey => {
  const targetKey = aliases[aliasKey];
  if (fullExercisesDb[targetKey]) {
    mergedDb[aliasKey] = {
      ...fullExercisesDb[targetKey],
      id: aliasKey // keep legacy id compatibility
    };
  }
});

export const exercisesDb = mergedDb;
