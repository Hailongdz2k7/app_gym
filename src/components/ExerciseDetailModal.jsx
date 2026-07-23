import React from "react";
import { X, Dumbbell, Target, Layers, ShieldAlert, CheckCircle2, Plus, Sparkles } from "lucide-react";
import ExerciseImageAnimator from "./ExerciseImageAnimator";

export default function ExerciseDetailModal({ 
  exercise, 
  onClose, 
  onAddExercise, 
  selectedDayKey 
}) {
  if (!exercise) return null;

  const primaryMuscle = exercise.primaryMuscle || exercise.primaryMusclesVi?.[0] || "Khác";
  const secondaryMuscles = exercise.secondaryMusclesVi || [];
  const equipment = exercise.equipment || "Khác";
  const notes = exercise.notesVi || exercise.notes || "Thực hiện động tác kiểm soát, hít thở đều đặn.";
  const instructions = exercise.instructionsVi || exercise.instructions || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 my-auto relative">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* ANIMATED IMAGE BANNER */}
        <div className="relative p-2 bg-zinc-950">
          <ExerciseImageAnimator
            images={exercise.images || [`/exercises/${exercise.id}/0.jpg`, `/exercises/${exercise.id}/1.jpg`]}
            alt={exercise.nameVi || exercise.name}
            className="h-64 w-full"
            autoPlay={true}
          />
        </div>

        {/* CONTENT DETAILS */}
        <div className="p-5 pt-0 space-y-4">
          
          {/* TITLE */}
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">
              {exercise.nameVi || exercise.name}
            </h2>
            {exercise.name !== exercise.nameVi && (
              <p className="text-xs text-zinc-400 font-mono italic mt-0.5">{exercise.name}</p>
            )}
          </div>

          {/* MUSCLE TAGS & EQUIPMENT */}
          <div className="bg-zinc-950/70 p-3.5 rounded-2xl border border-zinc-800/80 space-y-2.5">
            
            {/* Primary Muscle */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider w-28 flex-shrink-0 flex items-center gap-1">
                <Target size={12} className="text-lime-400" /> Nhóm cơ chính:
              </span>
              <span className="text-xs font-black text-lime-400 bg-lime-400/10 border border-lime-400/30 px-2.5 py-1 rounded-xl">
                {primaryMuscle}
              </span>
            </div>

            {/* Secondary Muscles */}
            <div className="flex items-start gap-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider w-28 flex-shrink-0 flex items-center gap-1 pt-1">
                <Layers size={12} className="text-emerald-400" /> Cơ phụ tác động:
              </span>
              <div className="flex flex-wrap gap-1 flex-1">
                {secondaryMuscles.length > 0 ? (
                  secondaryMuscles.map((sec, idx) => (
                    <span key={idx} className="text-[11px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                      {sec}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] font-semibold text-zinc-500">Tập trung cô lập</span>
                )}
              </div>
            </div>

            {/* Equipment */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider w-28 flex-shrink-0 flex items-center gap-1">
                <Dumbbell size={12} className="text-sky-400" /> Dụng cụ:
              </span>
              <span className="text-xs font-bold text-zinc-200 bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded-xl">
                {equipment}
              </span>
            </div>

          </div>

          {/* VIETNAMESE TIPS & SAFETY NOTES */}
          <div className="bg-lime-500/10 border border-lime-400/25 rounded-2xl p-3.5 space-y-1">
            <span className="text-[10px] font-black text-lime-400 uppercase tracking-wide flex items-center gap-1">
              <Sparkles size={12} /> Kỹ thuật & Lưu ý quan trọng:
            </span>
            <p className="text-xs text-zinc-200 font-medium leading-relaxed">
              {notes}
            </p>
          </div>

          {/* STEP BY STEP INSTRUCTIONS */}
          {instructions.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Hướng dẫn các bước thực hiện:
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {instructions.map((step, sIdx) => (
                  <div key={sIdx} className="text-xs text-zinc-300 font-normal leading-relaxed flex gap-2">
                    <span className="font-bold text-lime-400 flex-shrink-0">{sIdx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTION BUTTON */}
          {onAddExercise && selectedDayKey && (
            <button
              onClick={() => {
                onAddExercise(selectedDayKey, exercise.id);
                onClose();
              }}
              className="w-full bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black text-xs py-3 rounded-2xl shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Plus size={16} /> THÊM BÀI TẬP NÀY VÀO LỊCH TẬP
            </button>
          )}

        </div>

      </div>
    </div>
  );
}
