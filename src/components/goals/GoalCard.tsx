"use client";

import React from "react";
import { Button, cn } from "@/components/ui/Button";
import { Target, Calendar, Trash2, Edit2, CheckCircle } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";

export interface Goal {
    id: string;
    title: string;
    description: string;
    icon: string;
    targetDate: string; // ISO date string
    createdAt: string;
    milestones: Milestone[];
    linkedTaskIds: string[];
    isCompleted: boolean;
}

export interface Milestone {
    id: string;
    title: string;
    isCompleted: boolean;
}

interface GoalCardProps {
    goal: Goal;
    onEdit: (goal: Goal) => void;
    onDelete: (id: string) => void;
    onToggleComplete: (id: string) => void;
    onToggleMilestone: (goalId: string, milestoneId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
    goal,
    onEdit,
    onDelete,
    onToggleComplete,
    onToggleMilestone,
}) => {
    const targetDate = new Date(goal.targetDate);
    const daysRemaining = differenceInDays(targetDate, new Date());
    const isOverdue = isPast(targetDate) && !goal.isCompleted;

    // Safety check for milestones
    const rawMilestones = goal.milestones;
    const milestones = Array.isArray(rawMilestones) ? rawMilestones : [];

    const completedMilestones = milestones.filter(m => m.isCompleted).length;
    const totalMilestones = milestones.length;
    const progress = totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : goal.isCompleted ? 100 : 0;

    return (
        <div
            className={cn(
                "group relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:shadow-xl",
                goal.isCompleted
                    ? "border-green-500/30 bg-green-500/5"
                    : isOverdue
                        ? "border-red-500/30 bg-red-500/5"
                        : "border-white/10 bg-white/[0.03] hover:border-purple-500/30 hover:bg-white/[0.05]"
            )}
        >
            {/* Background Glow */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-3xl shadow-inner">
                            {goal.icon}
                        </div>
                        <div>
                            <h3 className={cn(
                                "text-lg font-bold tracking-tight",
                                goal.isCompleted ? "text-green-400" : "text-white"
                            )}>
                                {goal.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className={cn(
                                    "text-xs font-medium",
                                    isOverdue ? "text-red-400" : "text-muted-foreground"
                                )}>
                                    {isOverdue
                                        ? `Overdue by ${Math.abs(daysRemaining)} days`
                                        : daysRemaining === 0
                                            ? "Due today"
                                            : `${daysRemaining} days remaining`
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onToggleComplete(goal.id)}
                            className={cn(
                                "h-10 w-10 rounded-xl transition-all",
                                goal.isCompleted
                                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                    : "hover:bg-white/10 text-muted-foreground hover:text-white"
                            )}
                        >
                            <CheckCircle className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(goal)}
                            className="h-10 w-10 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(goal.id)}
                            className="h-10 w-10 rounded-xl hover:bg-red-500/20 text-muted-foreground hover:text-red-400"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Description */}
                {goal.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {goal.description}
                    </p>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Progress</span>
                        <span className="text-xs font-bold text-purple-400">{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-500",
                                goal.isCompleted
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                    : "bg-gradient-to-r from-purple-500 to-pink-500"
                            )}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Milestones */}
                {milestones.length > 0 && (
                    <div className="space-y-2">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Milestones ({completedMilestones}/{totalMilestones})
                        </span>
                        <div className="space-y-1.5">
                            {milestones.slice(0, 3).map((milestone) => (
                                <button
                                    key={milestone.id}
                                    onClick={() => onToggleMilestone(goal.id, milestone.id)}
                                    className={cn(
                                        "flex items-center gap-3 w-full p-2 rounded-xl text-left transition-all",
                                        milestone.isCompleted
                                            ? "bg-green-500/10 text-green-400"
                                            : "bg-white/[0.03] text-muted-foreground hover:bg-white/[0.05]"
                                    )}
                                >
                                    <div className={cn(
                                        "h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all",
                                        milestone.isCompleted
                                            ? "border-green-500 bg-green-500"
                                            : "border-muted-foreground"
                                    )}>
                                        {milestone.isCompleted && (
                                            <CheckCircle className="h-3 w-3 text-white" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-sm font-medium",
                                        milestone.isCompleted && "line-through opacity-60"
                                    )}>
                                        {milestone.title}
                                    </span>
                                </button>
                            ))}
                            {milestones.length > 3 && (
                                <p className="text-xs text-muted-foreground pl-2">
                                    +{milestones.length - 3} more milestones
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Target Date */}
                <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Target Date</span>
                        <span className="font-medium text-white">
                            {format(targetDate, "MMM d, yyyy")}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
