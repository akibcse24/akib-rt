"use client";

import React from "react";
import { Check, Bell, Clock, ChevronRight } from "lucide-react";
import { Task, useTask } from "@/context/TaskContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { toggleTaskCompletion } = useTask();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskCompletion(task.id);
  };

  return (
    <div
      onClick={() => onEdit(task)}
      className={cn(
        "group relative flex cursor-pointer items-center rounded-3xl border p-4 transition-all duration-300",
        task.isCompleted
          ? "bg-muted/30 border-border opacity-60 grayscale"
          : "bg-card border-border hover:border-primary/20 hover:shadow-lg active:scale-[0.99]"
      )}
    >
      {/* Background Glow on hover - Subtler */}
      {!task.isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
      )}

      <button
        onClick={handleToggle}
        className={cn(
          "mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 transition-all duration-300 relative z-20",
          task.isCompleted
            ? "bg-gradient-to-br from-purple-500 to-pink-500 border-0 shadow-md shadow-purple-500/20 scale-100"
            : "border-border bg-muted/50 group-hover:border-primary/50 group-hover:bg-background"
        )}
      >
        {task.isCompleted ? (
          <Check className="h-5 w-5 text-white stroke-[3] animate-in zoom-in duration-300" />
        ) : (
          <Check className="h-5 w-5 text-transparent stroke-[3] group-hover:text-primary/20" />
        )}
      </button>

      <div className={cn(
        "mr-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] text-3xl shadow-sm transition-all group-hover:scale-105 group-hover:rotate-2",
        task.isCompleted ? "bg-muted text-muted-foreground" : "bg-muted/50 text-foreground"
      )}>
        <span className="filter drop-shadow-sm">{task.icon || "📝"}</span>
      </div>

      <div className="flex-1 overflow-hidden pointer-events-none relative z-10">
        <h3 className={cn(
          "truncate text-lg font-bold tracking-tight transition-all",
          task.isCompleted ? "text-muted-foreground line-through decoration-border" : "text-foreground"
        )}>
          {task.title}
        </h3>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-1 rounded-md">
            <Clock className="w-3 h-3 text-primary" />
            {task.startTime}
          </div>
          {task.reminder && (
            <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md">
              <Bell className="w-3 h-3" />
              <span>{task.reminder}</span>
            </div>
          )}
        </div>
      </div>

      <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-foreground/50 transition-colors ml-2" />
    </div>
  );
};

export { TaskCard };
