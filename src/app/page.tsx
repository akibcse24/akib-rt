"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LoginScreen } from "@/components/LoginScreen";
import { Header } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { DayNavigation } from "@/components/DayNavigation";
import { TimeBlock } from "@/components/TimeBlock";
import { TaskModal } from "@/components/TaskModal";
import { TimeBlock as TimeBlockType, Task, useTask } from "@/context/TaskContext";

const TIME_BLOCKS: TimeBlockType[] = ["Dawn", "Morning", "Noon", "Afternoon", "Evening", "Night"];

export default function Home() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { loading: isTasksLoading } = useTask();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);

  if (isAuthLoading || isTasksLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">Syncing your routines...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
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
