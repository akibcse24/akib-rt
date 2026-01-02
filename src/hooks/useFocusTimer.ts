// ============================================================================
// USE FOCUS TIMER HOOK (POMODORO)
// ============================================================================
// This custom hook manages the logic for a Pomodoro-style timer.
// It handles:
// - Countdown logic (minutes/seconds)
// - Session types (Focus (25m), Short Break (5m), Long Break (15m))
// - Start/Pause/Reset functionality
// - Browser Notifications when a timer ends

import { useState, useEffect, useRef } from 'react';

export const useFocusTimer = () => {
  // 1. STATE MANAGEMENT
  const [sessionType, setSessionType] = useState<"focus" | "shortBreak" | "longBreak">("focus");
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Stats State
  const [todayStats, setTodayStats] = useState({ minutes: 0, sessions: 0 });

  // 2. REFERENCES
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load stats on mount
  // Load stats on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("rt_focus_stats");
      const today = new Date().toDateString();
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === today) {
          setTodayStats(parsed.data);
        } else {
          // Reset if new day
          try {
            localStorage.setItem("rt_focus_stats", JSON.stringify({ date: today, data: { minutes: 0, sessions: 0 } }));
          } catch (e) { }
        }
      }
    } catch (e) {
      console.warn("FocusTimer storage access denied");
    }
  }, []);

  // Save stats helper
  const updateStats = (addMinutes: number, addSession: number) => {
    setTodayStats(prev => {
      const newData = { minutes: prev.minutes + addMinutes, sessions: prev.sessions + addSession };
      const today = new Date().toDateString();
      try {
        localStorage.setItem("rt_focus_stats", JSON.stringify({ date: today, data: newData }));
      } catch (e) { }
      return newData;
    });
  };

  // 3. TIMER LOGIC (EFFECT)
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // TIMER FINISHED!
            clearInterval(intervalRef.current as NodeJS.Timeout);
            setIsActive(false);

            // Update Stats
            if (sessionType === "focus") {
              updateStats(25, 1); // Assume 25m session roughly, or better: track actual time
              // For simplicity in this version, we increment session count.
              // We'll increment minutes tick-by-tick below instead for accuracy? 
              // Actually, simply adding session duration is easier for "Sessions Completed".
            }

            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("RT - Focus Timer", {
                body: `${sessionType === "focus" ? "Focus session" : "Break"} complete!`
              });
            }
          } else {
            setMinutes(prev => prev - 1);
            setSeconds(59);
            // Track minutes if in focus? 
            // Ideally we track every second, but for "Total Focus Time Today" minutes is fine.
            if (sessionType === "focus") {
              updateStats(1, 0); // Add 1 minute to stats
            }
          }
        } else {
          setSeconds(prev => prev - 1);
        }
      }, 1000); // Speed up slightly for dev or keep 1000
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, minutes, seconds, sessionType]);

  // 4. CONTROL FUNCTIONS
  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    } else {
      setIsPaused(!isPaused);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    const mins = sessionType === "focus" ? 25 : sessionType === "shortBreak" ? 5 : 15;
    setMinutes(mins);
    setSeconds(0);
    setTotalSeconds(mins * 60);
  };

  const setSession = (type: "focus" | "shortBreak" | "longBreak") => {
    setSessionType(type);
    setIsActive(false);
    setIsPaused(false);
    const mins = type === "focus" ? 25 : type === "shortBreak" ? 5 : 15;
    setMinutes(mins);
    setSeconds(0);
    setTotalSeconds(mins * 60);
  }

  return {
    minutes,
    seconds,
    isActive,
    isPaused,
    toggleTimer,
    resetTimer,
    sessionType,
    setSession,
    totalSeconds,
    todayStats // Exposed
  };
};
