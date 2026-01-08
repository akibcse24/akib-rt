"use client";

import React from "react";
import { useAnalytics } from "@/context/AnalyticsContext";
import { Timer, Flame, Clock, Target, TrendingUp } from "lucide-react";

interface FocusStatsProps {
    todayMinutes: number;
    todaySessions: number;
    weeklyMinutes?: number;
}

export const FocusStats: React.FC<FocusStatsProps> = ({
    todayMinutes,
    todaySessions,
    weeklyMinutes = 0,
}) => {
    // Mock weekly data - in real implementation, this would come from context/storage
    const weeklyData = [
        { day: "Mon", minutes: 45 },
        { day: "Tue", minutes: 60 },
        { day: "Wed", minutes: 30 },
        { day: "Thu", minutes: 90 },
        { day: "Fri", minutes: 75 },
        { day: "Sat", minutes: 20 },
        { day: "Sun", minutes: todayMinutes },
    ];

    const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 90);
    const totalWeeklyMinutes = weeklyData.reduce((sum, d) => sum + d.minutes, 0);
    const avgMinutesPerDay = Math.round(totalWeeklyMinutes / 7);

    const formatTime = (mins: number) => {
        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    return (
        <div className="rounded-3xl bg-card border border-border p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Timer className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-foreground">Focus Statistics</h3>
                    <p className="text-xs text-muted-foreground">Track your deep work</p>
                </div>
            </div>

            {/* Today's Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-purple-400" />
                        <span className="text-xs text-muted-foreground">Today</span>
                    </div>
                    <p className="text-2xl font-black text-foreground">{formatTime(todayMinutes)}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{todaySessions} sessions</p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs text-muted-foreground">Weekly Avg</span>
                    </div>
                    <p className="text-2xl font-black text-foreground">{formatTime(avgMinutesPerDay)}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">per day</p>
                </div>
            </div>

            {/* Weekly Chart */}
            <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                    This Week
                </h4>
                <div className="flex items-end justify-between gap-2 h-24">
                    {weeklyData.map((day, i) => {
                        const height = (day.minutes / maxMinutes) * 100;
                        const isToday = i === weeklyData.length - 1;

                        return (
                            <div key={day.day} className="flex flex-col items-center flex-1 gap-2">
                                <div className="relative w-full flex justify-center">
                                    <div
                                        className={`
                      w-8 rounded-t-lg transition-all duration-500
                      ${isToday
                                                ? "bg-gradient-to-t from-purple-500 to-pink-500"
                                                : "bg-white/10"
                                            }
                    `}
                                        style={{ height: `${Math.max(height, 4)}px` }}
                                    />
                                </div>
                                <span className={`text-[10px] font-medium ${isToday ? "text-purple-400" : "text-muted-foreground"}`}>
                                    {day.day[0]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Total Weekly */}
            <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total this week</span>
                    <span className="text-lg font-bold text-foreground">{formatTime(totalWeeklyMinutes)}</span>
                </div>
            </div>
        </div>
    );
};
