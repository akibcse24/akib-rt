"use client";

import React from "react";
import { Header } from "@/components/Header";
import { CompletionChart } from "@/components/analytics/CompletionChart";
import { useTask } from "@/context/TaskContext";
import { BarChart3, TrendingUp, Award, Activity, PieChart } from "lucide-react";

export default function AnalyticsPage() {
  const { getCompletionRate, tasks, calculateStreak } = useTask();
  const weeklyRate = getCompletionRate(7);
  const maxStreak = tasks.length > 0 ? Math.max(...tasks.map(t => calculateStreak(t))) : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container mx-auto max-w-5xl px-6 pt-12 space-y-10">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tighter text-foreground">Bio-Metrics</h2>
          <p className="text-muted-foreground font-medium">Deep analysis of your discipline and consistency architecture.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            icon={TrendingUp}
            label="7-Day Efficiency"
            value={`${weeklyRate}%`}
            sub="Aggregated consistency"
          />
          <MetricCard
            icon={Award}
            label="Peak Momentum"
            value={`${maxStreak} Days`}
            sub="Highest recorded streak"
          />
          <MetricCard
            icon={Activity}
            label="Active Rituals"
            value={tasks.length.toString()}
            sub="Total scheduled tasks"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-primary" />
                Performance Architecture
              </h3>
            </div>
            <div className="p-8 rounded-[3rem] bg-card border border-border shadow-xl">
              <CompletionChart />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-3 px-2">
              <PieChart className="w-6 h-6 text-pink-500" />
              Insight
            </h3>
            <div className="p-8 rounded-[3rem] bg-card border border-border space-y-6">
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Data indicates your peak productivity occurs during <span className="text-foreground font-bold">Morning</span> blocks. Consider shifting high-value tasks to this window.
              </p>
              <div className="space-y-4">
                <InsightItem label="Consistency" value="High" color="text-green-500" />
                <InsightItem label="Risk Factor" value="Low" color="text-blue-500" />
                <InsightItem label="Meta-Level" value="Tier 2" color="text-primary" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-card border border-border space-y-4 group hover:shadow-lg transition-all">
      <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">{label}</p>
        <h4 className="text-4xl font-bold text-foreground tracking-tighter mt-1">{value}</h4>
        <p className="text-xs font-medium text-muted-foreground mt-2">{sub}</p>
      </div>
    </div>
  )
}

function InsightItem({ label, value, color }: any) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  )
}

