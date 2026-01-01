"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { useTask } from "@/context/TaskContext";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// Helper to get the date string for a given day of the week in the current week
const getDateForDayOfWeek = (dayName: string): string => {
  const today = new Date();
  const todayDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayNameToIndex: Record<string, number> = {
    "SUN": 0, "MON": 1, "TUE": 2, "WED": 3, "THU": 4, "FRI": 5, "SAT": 6
  };
  const targetDayIndex = dayNameToIndex[dayName] ?? 1;
  const diff = targetDayIndex - todayDayIndex;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + diff);
  return format(targetDate, "yyyy-MM-dd");
};

const DayNavigation: React.FC = () => {
  const { selectedDay, setSelectedDay, tasks } = useTask();
  const actualToday = format(new Date(), "EEE").toUpperCase();

  const getDayProgress = (day: string) => {
    const dayTasks = tasks.filter((t) => t.days.includes(day));
    if (dayTasks.length === 0) return 0;

    // FIX: Compute completion based on completionHistory for this specific day's date
    const dateStrForDay = getDateForDayOfWeek(day);
    const completed = dayTasks.filter((t) => t.completionHistory?.includes(dateStrForDay)).length;
    return Math.round((completed / dayTasks.length) * 100);
  };

  return (
    <div className="w-full overflow-x-auto pb-10 pt-4 scrollbar-hide px-1">
      <div className="flex min-w-max space-x-4">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const isActualToday = actualToday === day;
          const progress = getDayProgress(day);

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "group relative flex flex-col items-center justify-center rounded-[2.5rem] transition-all duration-300",
                "h-32 w-28",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105 z-10 border-0"
                  : "bg-card text-muted-foreground hover:bg-muted hover:scale-102 border border-border"
              )}
            >
              {isActualToday && (
                <div className={cn(
                  "absolute top-4 h-1.5 w-1.5 rounded-full animate-pulse",
                  isSelected ? "bg-primary-foreground" : "bg-primary"
                )} />
              )}
              <span className={cn(
                "text-[10px] font-bold tracking-[0.2em] mb-3 transition-colors uppercase",
                isSelected ? "text-primary-foreground/80" : "text-muted-foreground/60 group-hover:text-foreground/60"
              )}>
                {day}
              </span>

              <div className="flex flex-col items-center">
                <span className={cn(
                  "text-2xl font-bold tracking-tighter",
                  isSelected ? "text-primary-foreground" : "text-foreground"
                )}>
                  {progress}%
                </span>

                <div className={cn(
                  "mt-3 h-1 w-12 rounded-full transition-all overflow-hidden",
                  isSelected ? "bg-primary-foreground/30" : "bg-muted"
                )}>
                  <div
                    className={cn("h-full transition-all duration-1000", isSelected ? "bg-primary-foreground" : "bg-primary")}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { DayNavigation };


