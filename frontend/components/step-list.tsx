"use client";

import type { RecipeStep } from "@/lib/types";
import {
  ClockIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon } from "@heroicons/react/24/solid";

interface StepListProps {
  steps: RecipeStep[];
  currentStep: number;
  cookingStarted: boolean;
}

/**
 * Vertical step list with active-step highlighting.
 * Steps show timing, attention warnings, and tips.
 * Current step is visually prominent — glanceable from arm's length.
 */
export function StepList({ steps, currentStep, cookingStarted }: StepListProps) {
  return (
    <section aria-label="Cooking steps">
      <h2 className="text-xl font-semibold text-stone-800 mb-4">
        Steps
      </h2>

      <ol className="space-y-3">
        {steps.map((step, index) => {
          const isActive = cookingStarted && index === currentStep;
          const isDone = cookingStarted && index < currentStep;

          const statusLabel = isDone
            ? "Completed"
            : isActive
              ? "Current step"
              : "Upcoming";

          return (
            <li
              key={step.step_number}
              className={`
                relative rounded-2xl px-5 py-4 transition-all duration-300
                ${isActive
                  ? "bg-amber-50 ring-2 ring-amber-400 shadow-sm"
                  : isDone
                    ? "bg-emerald-50/50 opacity-60"
                    : "bg-white"
                }
              `}
              aria-current={isActive ? "step" : undefined}
              aria-label={`Step ${step.step_number}: ${statusLabel}`}
            >
              {/* Step number + instruction */}
              <div className="flex gap-4">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    text-sm font-bold
                    ${isActive
                      ? "bg-amber-500 text-white"
                      : isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-stone-200 text-stone-500"
                    }
                  `}
                  aria-hidden="true"
                >
                  {isDone ? "✓" : step.step_number}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-base leading-relaxed ${
                      isActive ? "text-stone-900 font-medium" : "text-stone-700"
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
                      <span
                        className="inline-flex items-center gap-1 text-sm text-orange-600"
                        role="alert"
                      >
                        <ExclamationTriangleIcon
                          className="w-4 h-4"
                          aria-hidden="true"
                        />
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
