"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Task, TimeBlock as TimeBlockType, useTask } from "@/context/TaskContext";
import { Trash2, Clock, Calendar, Bell, Smile, Copy } from "lucide-react";
import { format } from "date-fns";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task;
  defaultDay?: string; // Pre-select a specific day (e.g., "MON", "TUE", etc.)
  specificDate?: string; // "YYYY-MM-DD" - if set, creates a single-occurrence task
}

const TIME_BLOCKS: TimeBlockType[] = ["Dawn", "Morning", "Noon", "Afternoon", "Evening", "Night"];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const REMINDERS = [
  { label: "None", value: "" },
  { label: "5m before", value: "5m" },
  { label: "10m before", value: "10m" },
  { label: "15m before", value: "15m" },
  { label: "30m before", value: "30m" },
  { label: "1h before", value: "1h" },
];

// Emoji icons for quick selection
const TASK_ICONS = [
  "📝", "💼", "💻", "📚", "🏃", "🧘", "💪", "🍽️", "☕", "🛏️",
  "🎯", "📞", "✉️", "🧹", "🚿", "💊", "🌅", "🌙", "⭐", "❤️",
  "🎨", "🎵", "🎮", "📖", "✍️", "🧠", "💡", "🔥", "🌿", "🙏"
];

// Auto-detect time block based on hour
function getTimeBlockFromTime(time: string): TimeBlockType {
  if (!time) return "Morning";
  const [hours] = time.split(":").map(Number);
  if (hours >= 4 && hours < 6) return "Dawn";
  if (hours >= 6 && hours < 12) return "Morning";
  if (hours >= 12 && hours < 14) return "Noon";
  if (hours >= 14 && hours < 17) return "Afternoon";
  if (hours >= 17 && hours < 20) return "Evening";
  return "Night";
}

// Get current day abbreviation
function getCurrentDayAbbr(): string {
  return format(new Date(), "EEE").toUpperCase();
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit, defaultDay, specificDate }) => {
  const { addTask, updateTask, deleteTask } = useTask();

  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("📝");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timeBlock, setTimeBlock] = useState<TimeBlockType>("Morning");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [reminder, setReminder] = useState("");
  const [showIconPicker, setShowIconPicker] = useState(false);

  const resetForm = () => {
    setTitle("");
    setIcon("📝");
    // Set default start time to current time rounded to nearest 5 minutes
    const now = new Date();
    const minutes = Math.ceil(now.getMinutes() / 5) * 5;
    now.setMinutes(minutes);
    const defaultStartTime = format(now, "HH:mm");
    setStartTime(defaultStartTime);
    setEndTime(""); // Optional - leave empty by default
    setTimeBlock(getTimeBlockFromTime(defaultStartTime));
    setSelectedDays([getCurrentDayAbbr()]); // Default to current day only
    setReminder("");
    setShowIconPicker(false);
  };

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setIcon(taskToEdit.icon);
      setStartTime(taskToEdit.startTime);
      setEndTime(taskToEdit.endTime);
      setTimeBlock(taskToEdit.timeBlock);
      setSelectedDays(taskToEdit.days);
      setReminder(taskToEdit.reminder || "");
    } else {
      // Reset form and use defaultDay if provided
      setTitle("");
      setIcon("📝");
      const now = new Date();
      const minutes = Math.ceil(now.getMinutes() / 5) * 5;
      now.setMinutes(minutes);
      const defaultStartTime = format(now, "HH:mm");
      setStartTime(defaultStartTime);
      setEndTime("");
      setTimeBlock(getTimeBlockFromTime(defaultStartTime));
      setSelectedDays(defaultDay ? [defaultDay] : [getCurrentDayAbbr()]);
      setReminder("");
      setShowIconPicker(false);
    }
  }, [taskToEdit, isOpen, defaultDay]);

  // Auto-detect time block when start time changes
  useEffect(() => {
    if (startTime && !taskToEdit) {
      setTimeBlock(getTimeBlockFromTime(startTime));
    }
  }, [startTime, taskToEdit]);

  const handleSave = () => {
    if (!title || !startTime) return;

    // If end time not provided, default to 1 hour after start
    let finalEndTime = endTime;
    if (!endTime && startTime) {
      const [hours, mins] = startTime.split(":").map(Number);
      const endHour = (hours + 1) % 24;
      finalEndTime = `${endHour.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    }

    const data = {
      title,
      icon,
      startTime,
      endTime: finalEndTime,
      timeBlock,
      days: selectedDays.length > 0 ? selectedDays : [getCurrentDayAbbr()],
      reminder: reminder || undefined,
      specificDate: specificDate || undefined // Save specific date if provided
    };

    if (taskToEdit) {
      updateTask({ ...taskToEdit, ...data });
    } else {
      addTask(data);
    }
    onClose();
  };

  const handleDelete = () => {
    if (taskToEdit) {
      deleteTask(taskToEdit.id);
      onClose();
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const selectIcon = (selectedIcon: string) => {
    setIcon(selectedIcon);
    setShowIconPicker(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? "Edit Task" : "Add Task"}
      className="max-w-2xl"
    >
      <div className="space-y-6 py-2">
        {/* Title & Icon Section */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-28 space-y-2 shrink-0">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-1">Icon</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-2xl hover:bg-white/10 transition-all"
              >
                {icon}
                <Smile className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Icon Picker Dropdown */}
              {showIconPicker && (
                <div className="absolute top-full left-0 mt-2 p-4 rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl z-50 shadow-2xl w-[280px]">
                  <div className="grid grid-cols-5 gap-2">
                    {TASK_ICONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => selectIcon(emoji)}
                        className={cn(
                          "h-12 w-12 rounded-xl text-2xl flex items-center justify-center transition-all hover:bg-purple-500/20 hover:scale-110",
                          "font-emoji",
                          icon === emoji ? "bg-purple-500/30 ring-2 ring-purple-500 scale-110" : "bg-white/5"
                        )}
                        style={{ fontFamily: "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-1">Task Name</label>
            <Input
              placeholder="What are you planning to do?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-14 bg-white/5 text-lg font-medium border-white/10"
            />
          </div>
        </div>

        {/* Time Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 text-purple-400">
              <Clock className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Timing</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="From"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-black/20 border-white/5"
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground pl-1 flex items-center gap-1">
                  Until
                  <span className="text-[10px] text-muted-foreground/50">(optional)</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder="Optional"
                  className="flex h-12 w-full rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-sm ring-offset-background transition-all placeholder:text-muted-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
                />
              </div>
            </div>
            <div className="pt-1">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Time Block <span className="text-purple-400/60">(auto-detected)</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {TIME_BLOCKS.map(block => (
                  <button
                    key={block}
                    type="button"
                    onClick={() => setTimeBlock(block)}
                    className={cn(
                      "py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all",
                      timeBlock === block
                        ? "bg-purple-500/20 border-purple-500 text-purple-400"
                        : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                    )}
                  >
                    {block}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-2 text-purple-400">
              <Bell className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Reminders</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {REMINDERS.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReminder(r.value)}
                  className={cn(
                    "py-2.5 rounded-lg text-xs font-semibold border transition-all",
                    reminder === r.value
                      ? "bg-purple-500/20 border-purple-500 text-purple-400"
                      : "bg-black/20 border-white/5 text-muted-foreground hover:bg-white/5"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Days Selection - HIDDEN if specificDate is set */}
        {!specificDate && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400">
                <Calendar className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Active Days</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                Today: <span className="text-purple-400 font-bold">{getCurrentDayAbbr()}</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    "flex-1 h-11 rounded-xl text-xs font-bold transition-all border min-w-[40px]",
                    selectedDays.includes(day)
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 border-0 text-white shadow-lg shadow-purple-500/20 scale-105"
                      : "bg-white/[0.03] border-white/5 text-muted-foreground hover:bg-white/[0.08]"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Specific Date Indicator */}
        {specificDate && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200">
            <Calendar className="w-5 h-5 text-purple-400" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Specific Date</span>
              <span className="font-medium">{format(new Date(specificDate), "MMMM d, yyyy")}</span>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
          {taskToEdit && (
            <Button
              variant="ghost"
              type="button"
              onClick={handleDelete}
              className="h-12 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border-0 px-5 font-bold gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sm:hidden">Delete</span>
            </Button>
          )}
          {taskToEdit && (
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                // Copy task: clear the taskToEdit reference so it creates a new one
                const copiedData = {
                  title: title + " (Copy)",
                  icon,
                  startTime,
                  endTime,
                  timeBlock,
                  days: selectedDays,
                  reminder: reminder || undefined
                };
                addTask(copiedData);
                onClose();
              }}
              className="h-12 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border-0 px-5 font-bold gap-2"
            >
              <Copy className="h-4 w-4" />
              <span className="sm:hidden">Copy</span>
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="ghost"
            onClick={onClose}
            className="h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold px-6 border-0"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title || !startTime}
            className="h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-10 border-0 shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {taskToEdit ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export { TaskModal };
