"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LandingPage } from "@/components/LandingPage";
import { Header } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { DayNavigation } from "@/components/DayNavigation";
import { TimeBlock } from "@/components/TimeBlock";
import { TaskModal } from "@/components/TaskModal";
import { OnboardingTour } from "@/components/OnboardingTour";
import { TimeBlock as TimeBlockType, Task, useTask } from "@/context/TaskContext";
import { Button } from "@/components/ui/Button";
import { Plus, WifiOff } from "lucide-react";

const TIME_BLOCKS: TimeBlockType[] = ["Dawn", "Morning", "Noon", "Afternoon", "Evening", "Night"];

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { loading: isTasksLoading, totalTasksToday, isOnline } = useTask();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);

  if (isAuthLoading || isTasksLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-purple-500/20 blur-md"></div>
        </div>
        <div className="mt-6 text-center space-y-1">
          <p className="text-base font-semibold text-foreground">Loading your routines</p>
          <p className="text-xs text-muted-foreground">Getting everything ready...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  const handleAddTask = () => {
    setTaskToEdit(undefined);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-purple-500/30">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col gap-2">
          <ProgressBar onAddTask={handleAddTask} />

          <DayNavigation />

          {/* Offline Banner - Show when offline with cached data */}
          {(!isOnline && totalTasksToday > 0) && (
            <div className="my-6 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-amber-500/10 p-6 sm:p-8 border border-blue-500/30 shadow-xl backdrop-blur-sm">
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
                {/* Icon with gradient background */}
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm flex-shrink-0 shadow-lg">
                  <WifiOff className="w-7 h-7 text-blue-400" />
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  {/* Main heading - positive framing */}
                  <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2 justify-center sm:justify-start">
                    ✨ Working Offline
                  </h3>

                  {/* Reassuring message */}
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Your data is safe locally.</span> Continue tracking your routines—everything will sync automatically when you're back online.
                  </p>

                  {/* Optional: Add a small badge showing cached data is available */}
                  <div className="flex items-center gap-2 justify-center sm:justify-start mt-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs font-medium text-green-400">Local data active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced background decoration */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-56 w-56 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-48 w-48 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 blur-[60px] rounded-full pointer-events-none" />
            </div>
          )}

          {/* Empty State Banner - Only show when online with no tasks */}
          {(!isTasksLoading && totalTasksToday === 0 && isOnline) && (
            <div className="my-6 relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-8 border border-purple-500/20 text-center sm:text-left">
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Ready to conquer the day?</h3>
                  <p className="text-muted-foreground max-w-md">Your schedule is clear. Start from scratch or use a proved template to hit the ground running.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleAddTask} className="bg-foreground text-background hover:opacity-90 font-bold rounded-xl h-12 px-6">
                    <Plus className="w-4 h-4 mr-2" /> Create Routine
                  </Button>
                </div>
              </div>
              {/* Background Decor */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
            {TIME_BLOCKS.map((block) => (
              <TimeBlock
                key={block}
                block={block}
                timeRange={getTimeRange(block)}
                onEditTask={handleEditTask}
              />
            ))}
          </div>

          <OnboardingTour />
        </div>
      </main>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
      />

      {/* Footer / Info */}
      <footer className="py-12 text-center text-muted-foreground/20 text-[10px] font-bold uppercase tracking-[0.2em]">
        Designed for Excellence • Powered by RT
      </footer>
    </div>
  );
}

function getTimeRange(block: TimeBlockType): string {
  switch (block) {
    case "Dawn": return "4:00 AM - 6:00 AM";
    case "Morning": return "6:00 AM - 12:00 PM";
    case "Noon": return "12:00 PM - 2:00 PM";
    case "Afternoon": return "2:00 PM - 5:00 PM";
    case "Evening": return "5:00 PM - 8:00 PM";
    case "Night": return "8:00 PM - 4:00 AM";
    default: return "";
  }
}
