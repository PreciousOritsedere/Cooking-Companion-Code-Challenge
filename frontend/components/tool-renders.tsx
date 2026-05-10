"use client";

/**
 * Custom tool-call renderers for the CopilotKit chat.
 *
 * When the agent calls a tool (e.g. scale_recipe), CopilotKit renders
 * these components inline in the chat instead of raw JSON. This gives
 * the user clear visual feedback about what the agent is doing.
 */

import { useCopilotAction } from "@copilotkit/react-core";
import {
  ScaleIcon,
  ArrowsRightLeftIcon,
  ForwardIcon,
} from "@heroicons/react/24/outline";

function ToolCard({
  icon: Icon,
  title,
  description,
  status,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  status: string;
}) {
  const isComplete = status === "complete";

  return (
    <div
      className={`
        flex items-start gap-3 rounded-xl p-3 text-sm transition-all duration-300
        ${isComplete ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}
      `}
      role="status"
      aria-label={`${title}: ${isComplete ? "done" : "in progress"}`}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs opacity-75">{description}</p>
      </div>
    </div>
  );
}

/**
 * Registers all three tool renderers with CopilotKit.
 * Must be called inside a component that's within <CopilotKit>.
 */
export function useToolRenderers() {
  useCopilotAction({
    name: "scale_recipe",
    render: ({ status, args }) => (
      <ToolCard
        icon={ScaleIcon}
        title="Scaling recipe"
        description={
          args?.target_servings
            ? `Adjusting to ${args.target_servings} servings...`
            : "Adjusting servings..."
        }
        status={status}
      />
    ),
  });

  useCopilotAction({
    name: "substitute_ingredient",
    render: ({ status, args }) => (
      <ToolCard
        icon={ArrowsRightLeftIcon}
        title="Swapping ingredient"
        description={
          args?.original_ingredient && args?.substitute_name
            ? `Replacing ${args.original_ingredient} with ${args.substitute_name}...`
            : "Finding a substitute..."
        }
        status={status}
      />
    ),
  });

  useCopilotAction({
    name: "update_cooking_progress",
    render: ({ status, args }) => (
      <ToolCard
        icon={ForwardIcon}
        title="Updating progress"
        description={
          args?.current_step != null
            ? `Moving to step ${Number(args.current_step) + 1}...`
            : args?.cooking_started
              ? "Starting cooking..."
              : "Updating progress..."
        }
        status={status}
      />
    ),
  });
}
