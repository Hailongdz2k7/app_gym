import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export default function Toast({ toasts = [], removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, toast.duration || 3500);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 size={16} className="text-lime-400 flex-shrink-0" />;
      case "error":
        return <AlertCircle size={16} className="text-red-400 flex-shrink-0" />;
      case "warning":
        return <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />;
      default:
        return <Info size={16} className="text-sky-400 flex-shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case "success":
        return "border-lime-400/30 bg-zinc-900/95 text-lime-300";
      case "error":
        return "border-red-500/30 bg-zinc-900/95 text-red-300";
      case "warning":
        return "border-amber-400/30 bg-zinc-900/95 text-amber-300";
      default:
        return "border-sky-400/30 bg-zinc-900/95 text-sky-300";
    }
  };

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${getBorderColor()}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {getIcon()}
        <span className="text-xs font-bold text-zinc-100 truncate">{toast.message}</span>
      </div>
      <button
        onClick={onRemove}
        className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
