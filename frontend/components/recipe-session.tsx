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
import { RecipeSkeleton } from "./recipe-skeleton";
import { ErrorBoundary } from "./error-boundary";
import { VoiceButton } from "./voice-button";
import { useToolRenderers } from "./tool-renders";
import type { RecipeContext, UploadResponse } from "@/lib/types";

interface RecipeSessionProps {
  uploadData: UploadResponse;
  onReset: () => void;
}

export function RecipeSession({ uploadData, onReset }: RecipeSessionProps) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit" agent="recipe_agent">
      <ErrorBoundary fallbackMessage="The cooking session encountered an error. Try uploading the recipe again.">
        <RecipeSessionInner uploadData={uploadData} onReset={onReset} />
      </ErrorBoundary>
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

  // Registering tool renderers so that agent actions appear as visual cards in chat
  useToolRenderers();

  const isLoading = !state || !state.recipe;

  return (
    <CopilotSidebar
      defaultOpen={true}
      clickOutsideToClose={false}
      labels={{
        title: "Cooking Assistant",
        initial:
          "Hi! I can help you scale the recipe, swap ingredients, or guide you through the steps. What would you like to do?",
        placeholder: "Ask me anything about the recipe...",
      }}
    >
      <div className="flex h-screen flex-col overflow-hidden animate-fade-in">
        {/* Top bar with recipe name and reset */}
        <nav
          className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-sm px-5 py-3"
          aria-label="Session controls"
        >
          <h1 className="text-lg font-semibold text-brand truncate">
            {state?.recipe?.title ?? "Cooking Companion"}
          </h1>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-brand hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50"
            aria-label="Upload a new recipe"
          >
            New recipe
          </button>
        </nav>

        {/* Recipe content — fills available space */}
        <main id="main-content" className="flex-1 overflow-hidden" aria-live="polite">
          {isLoading ? <RecipeSkeleton /> : <RecipeView state={state} />}
        </main>

        {/* Voice input — floating mic button for hands-free use */}
        <VoiceButton />
      </div>
    </CopilotSidebar>
  );
}
