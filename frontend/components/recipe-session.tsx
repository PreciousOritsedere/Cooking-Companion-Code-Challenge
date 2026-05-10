"use client";

/**
 * RecipeSession — the main app shell after a recipe is uploaded.
 *
 * This component wires CopilotKit into the app:
 * 1. <CopilotKit> provider connects to our Next.js runtime route (/api/copilotkit)
 * 2. useCoAgent syncs RecipeContext state bidirectionally with the Python agent
 * 3. CopilotSidebar provides the chat UI (pre-built, streaming, tool-aware)
 *
 * Layout: recipe on the left, chat sidebar on the right (tablet landscape).
 * On smaller screens the sidebar overlays.
 */

import { CopilotKit } from "@copilotkit/react-core";
import { useCoAgent } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

import { RecipeView } from "./recipe-view";
import type { RecipeContext, UploadResponse } from "@/lib/types";

interface RecipeSessionProps {
  uploadData: UploadResponse;
  onReset: () => void;
}

export function RecipeSession({ uploadData, onReset }: RecipeSessionProps) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="recipe_agent">
      <RecipeSessionInner uploadData={uploadData} onReset={onReset} />
    </CopilotKit>
  );
}

/**
 * Inner component — must be inside <CopilotKit> to use hooks.
 *
 * useCoAgent keeps `state` in sync with the Python recipe_agent.
 * When the agent calls scale_recipe or substitute_ingredient,
 * it emits a STATE_SNAPSHOT → CopilotKit updates `state` here →
 * RecipeView re-renders with the new data.
 */
function RecipeSessionInner({ uploadData, onReset }: RecipeSessionProps) {
  const { state } = useCoAgent<RecipeContext>({
    name: "recipe_agent",
    initialState: uploadData.state,
  });

  return (
    <div className="flex min-h-screen flex-col">
      {/* Recipe content — fills available space */}
      <main id="main-content" className="flex-1" aria-live="polite">
        <RecipeView state={state} />
      </main>

      {/* Chat sidebar — CopilotKit pre-built UI */}
      <CopilotSidebar
        defaultOpen={true}
        clickOutsideToClose={false}
        labels={{
          title: "Cooking Assistant",
          initial: "Hi! I can help you scale the recipe, swap ingredients, or guide you through the steps. What would you like to do?",
          placeholder: "Ask me anything about the recipe...",
        }}
      />
    </div>
  );
}
