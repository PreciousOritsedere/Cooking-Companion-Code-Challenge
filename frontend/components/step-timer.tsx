"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PlayIcon, PauseIcon, ArrowPathIcon } from "@heroicons/react/24/solid";

interface StepTimerProps {
  durationMinutes: number;
  stepNumber: number;
}

type TimerState = "idle" | "running" | "paused" | "done";

/**
 * Countdown timer for active cooking steps.
 * Circular progress ring with start/pause/reset.
 * Pulses and changes colour when time is up.
 */
export function StepTimer({ durationMinutes, stepNumber }: StepTimerProps) {
  const totalSeconds = durationMinutes * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset when step changes
  useEffect(() => {
    setRemaining(durationMinutes * 60);
    setTimerState("idle");
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [stepNumber, durationMinutes]);

  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setTimerState("done");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerState]);

  const toggle = useCallback(() => {
    if (timerState === "idle" || timerState === "paused") {
      setTimerState("running");
    } else if (timerState === "running") {
      setTimerState("paused");
    } else if (timerState === "done") {
      setRemaining(totalSeconds);
      setTimerState("idle");
    }
  }, [timerState, totalSeconds]);

  const reset = useCallback(() => {
    setRemaining(totalSeconds);
    setTimerState("idle");
  }, [totalSeconds]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;

  // SVG circular progress
  const size = 64;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const isDone = timerState === "done";
  const isRunning = timerState === "running";

  return (
    <div
      className={`flex items-center gap-3 mt-3 rounded-xl px-4 py-3 transition-all duration-300 ${
        isDone
          ? "bg-brand-pink/10 animate-pulse"
          : "bg-white/80 border border-slate-100"
      }`}
      role="timer"
      aria-label={`Step ${stepNumber} timer: ${minutes}:${seconds.toString().padStart(2, "0")} remaining`}
      aria-live="polite"
    >
      {/* Circular progress ring */}
      <div className="relative shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isDone ? "#E91E7B20" : "#e2e8f0"}
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isDone ? "#E91E7B" : "#2E6EB5"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        {/* Time display in centre */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`text-xs font-bold tabular-nums ${
              isDone ? "text-brand-pink" : "text-brand"
            }`}
          >
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          aria-label={
            isDone ? "Reset timer" :
            isRunning ? "Pause timer" :
            "Start timer"
          }
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50 ${
            isDone
              ? "bg-brand-pink/20 text-brand-pink hover:bg-brand-pink/30"
              : isRunning
                ? "bg-brand-light text-brand-blue hover:bg-brand-cyan/20"
                : "bg-brand-blue text-white hover:bg-brand"
          }`}
        >
          {isDone ? (
            <ArrowPathIcon className="w-5 h-5" />
          ) : isRunning ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5 ml-0.5" />
          )}
        </button>

        {(isRunning || timerState === "paused") && (
          <button
            type="button"
            onClick={reset}
            aria-label="Reset timer"
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status text */}
      <span
        className={`text-xs font-medium ${
          isDone ? "text-brand-pink" : "text-slate-500"
        }`}
      >
        {isDone ? "Time's up!" : isRunning ? "Running" : timerState === "paused" ? "Paused" : `${durationMinutes} min`}
      </span>
    </div>
  );
}
