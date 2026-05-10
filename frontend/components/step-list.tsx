"use client";

import type { RecipeStep } from "@/lib/types";
import {
  ClockIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef } from "react";

interface StepListProps {
  steps: RecipeStep[];
  currentStep: number;
  cookingStarted: boolean;
}

/**
 * Vertical step list with active-step highlighting and auto-scroll.
 * Steps show timing, attention warnings, and tips.
 * Current step is visually prominent — glanceable from arm's length.
 * Progress bar shows how far through the recipe you are.
 */
export function StepList({ steps, currentStep, cookingStarted }: StepListProps) {
  const activeRef = useRef<HTMLLIElement>(null);

  // Auto-scroll to the active step when it changes
  useEffect(() => {
    if (cookingStarted && activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentStep, cookingStarted]);

  // The backend can't set currentStep beyond steps.length - 1,
  // so "all done" means we're on the last step and the agent confirmed completion.
  // We track this: once the user reaches the last step, we show it as the final active step.
  // When currentStep equals the last index, the progress bar shows full.
  const isOnLastStep = cookingStarted && currentStep === steps.length - 1;
  const allDone = cookingStarted && currentStep >= steps.length;
  const progress = cookingStarted
    ? Math.round(((currentStep + (isOnLastStep ? 1 : 0)) / steps.length) * 100)
    : 0;

  return (
    <section aria-label="Cooking steps">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-stone-800">Steps</h2>

        {/* Progress indicator — visible once cooking starts */}
        {cookingStarted && (
          <div className="flex items-center gap-3" role="status" aria-label={`Cooking progress: ${progress}%`}>
            <span className="text-sm font-medium text-stone-500">
              {isOnLastStep ? steps.length : currentStep}/{steps.length}
            </span>
            <div className="w-24 h-2 rounded-full bg-stone-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {isOnLastStep && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-sm text-emerald-800"
          role="status"
        >
          <CheckIcon className="w-5 h-5 text-emerald-500" aria-hidden="true" />
          <span className="font-medium">All steps complete — enjoy your meal!</span>
        </div>
      )}

      <ol className="space-y-3">
        {steps.map((step, index) => {
          const isActive = cookingStarted && !allDone && !isOnLastStep && index === currentStep;
          const isDone = cookingStarted && (allDone || isOnLastStep || index < currentStep);

          const statusLabel = isDone
            ? "Completed"
            : isActive
              ? "Current step"
              : "Upcoming";

          return (
            <li
              key={step.step_number}
              ref={isActive ? activeRef : undefined}
              className={`
                relative rounded-2xl px-5 py-4 transition-all duration-300
                ${isActive
                  ? "bg-amber-50 ring-2 ring-amber-400 shadow-sm"
                  : isDone
                    ? "bg-emerald-50/50"
                    : "bg-white"
                }
              `}
              aria-current={isActive ? "step" : undefined}
              aria-label={`Step ${step.step_number}: ${statusLabel}`}
            >
              <div className="flex gap-4">
                {/* Step number badge */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    text-sm font-bold transition-colors duration-300
                    ${isActive
                      ? "bg-amber-500 text-white"
                      : isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-stone-200 text-stone-500"
                    }
                  `}
                  aria-hidden="true"
                >
                  {isDone ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    step.step_number
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-base leading-relaxed transition-colors duration-300 ${
                      isDone
                        ? "text-stone-400"
                        : isActive
                          ? "text-stone-900 font-medium"
                          : "text-stone-700"
                    }`}
                  >
                    {step.instruction}
                  </p>

                  {/* Meta row: timing, attention */}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {step.duration_minutes != null && (
                      <span
                        className="inline-flex items-center gap-1 text-sm text-stone-500"
                        aria-label={`Duration: ${step.duration_minutes} minutes`}
                      >
                        <ClockIcon className="w-4 h-4" aria-hidden="true" />
                        {step.duration_minutes} min
                      </span>
                    )}

                    {step.timer_label && isActive && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700"
                        role="status"
                        aria-label={`Timer: ${step.timer_label}`}
                      >
                        <PlayIcon className="w-3.5 h-3.5" aria-hidden="true" />
                        {step.timer_label}
                      </span>
                    )}

                    {step.requires_attention && (
                      <span className="inline-flex items-center gap-1 text-sm text-orange-600" role="alert">
                        <ExclamationTriangleIcon className="w-4 h-4" aria-hidden="true" />
                        <span>Needs attention</span>
                      </span>
                    )}
                  </div>

                  {/* Tips — only shown on active step to reduce clutter */}
                  {isActive && step.tips.length > 0 && (
                    <aside
                      className="mt-3 flex items-start gap-2 rounded-lg bg-amber-100/50 p-3"
                      aria-label="Tips for this step"
                    >
                      <LightBulbIcon
                        className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <ul className="text-sm text-amber-800 space-y-1">
                        {step.tips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </aside>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
