"use client";

import { useCallback, useRef, useState } from "react";
import type { RecipeContext } from "@/lib/types";
import { submitToCopilotChat } from "@/lib/chat-utils";
import { useChatContext } from "@copilotkit/react-ui";
import { useSwipe } from "@/hooks/use-swipe";
import { RecipeHeader } from "./recipe-header";
import { IngredientList } from "./ingredient-list";
import { StepList } from "./step-list";
import { Confetti } from "./confetti";
import { GestureHint } from "./gesture-hint";
import { FireIcon } from "@heroicons/react/24/solid";

interface RecipeViewProps {
  state: RecipeContext;
}

/**
 * Main recipe display — fills available viewport height.
 *
 * Layout:
 * - Header + cooking banner: fixed at top (no scroll)
 * - Two-column body: ingredients and steps scroll independently
 * - On phones: stacks vertically with single scroll
 */
export function RecipeView({ state }: RecipeViewProps) {
  const { recipe, current_step, checked_ingredients, cooking_started } = state;
  const { setOpen } = useChatContext();
  const [activeTab, setActiveTab] = useState<"ingredients" | "steps">(
    cooking_started ? "steps" : "ingredients"
  );

  const handleSwap = useCallback((ingredientName: string) => {
    setOpen(true);
    submitToCopilotChat(`Substitute ${ingredientName} with `, false);
  }, [setOpen]);

  const handleStartCooking = useCallback(() => {
    setOpen(true);
    submitToCopilotChat("Start cooking — guide me through the steps");
  }, [setOpen]);

  const handleScale = useCallback((newServings: number) => {
    setOpen(true);
    submitToCopilotChat(`Scale this recipe to ${newServings} servings`);
  }, [setOpen]);

  const handleSwipeLeft = useCallback(() => {
    if (!cooking_started) return;
    setOpen(true);
    submitToCopilotChat("Move to the next step");
  }, [cooking_started, setOpen]);

  const handleSwipeRight = useCallback(() => {
    if (!cooking_started || current_step === 0) return;
    setOpen(true);
    submitToCopilotChat("Go back to the previous step");
  }, [cooking_started, current_step, setOpen]);

  const swipeRef = useRef<HTMLDivElement>(null);
  useSwipe(swipeRef, {
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  if (!recipe) {
    return (
      <div
        className="flex items-center justify-center h-full p-8"
        role="status"
        aria-label="No recipe loaded"
      >
        <p className="text-slate-400 text-lg">No recipe loaded yet.</p>
      </div>
    );
  }

  const isComplete = cooking_started && current_step >= recipe.steps.length - 1;

  return (
    <article
      className="h-full flex flex-col overflow-hidden"
      aria-label={`Recipe: ${recipe.title}`}
    >
      <Confetti active={isComplete} />
      {/* Fixed header area — doesn't scroll */}
      <div className="shrink-0 px-4 py-3 sm:p-6 lg:px-8 lg:pt-6 lg:pb-4 space-y-3 sm:space-y-4">
        {cooking_started && (
          <div
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${
              current_step >= recipe.steps.length - 1
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-brand-light border-brand-cyan/30 text-brand"
            }`}
            role="status"
            aria-live="polite"
          >
            <FireIcon
              className={`w-5 h-5 ${
                current_step >= recipe.steps.length - 1
                  ? "text-emerald-500"
                  : "text-brand-blue animate-pulse"
              }`}
              aria-hidden="true"
            />
            {current_step >= recipe.steps.length - 1 ? (
              <span className="font-medium">
                All done! Enjoy your meal.
              </span>
            ) : (
              <>
                <span className="font-medium">
                  Cooking mode — step {current_step + 1} of {recipe.steps.length}
                </span>
                <span className="text-brand-blue ml-1 hidden sm:inline">
                  Ask the assistant to move to the next step when you're ready.
                </span>
              </>
            )}
          </div>
        )}

        <RecipeHeader
          recipe={recipe}
          onScale={handleScale}
          onStartCooking={handleStartCooking}
          cookingStarted={cooking_started}
        />
      </div>

      {/* Tabs for mobile/tablet, two-column grid on desktop */}
      <div ref={swipeRef} className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-[minmax(280px,1fr)_2fr] lg:gap-6 px-4 sm:px-6 lg:px-8 pb-6">
        {/* Tab bar — visible on mobile/tablet only */}
        <div data-tour="tabs" className="lg:hidden flex border-b border-slate-200 mb-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("ingredients")}
            className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors ${
              activeTab === "ingredients"
                ? "text-brand-blue border-b-2 border-brand-blue"
                : "text-slate-400"
            }`}
          >
            Ingredients
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("steps")}
            className={`flex-1 py-2.5 text-sm font-semibold text-center transition-colors ${
              activeTab === "steps"
                ? "text-brand-blue border-b-2 border-brand-blue"
                : "text-slate-400"
            }`}
          >
            Steps
          </button>
        </div>

        {/* Ingredients panel */}
        <div data-tour="ingredients" className={`overflow-y-auto px-1 pr-2 pb-4 lg:border-r lg:border-slate-100 ${activeTab === "ingredients" ? "block" : "hidden"} lg:block`}>
          <IngredientList
            ingredients={recipe.ingredients}
            checkedIngredients={checked_ingredients}
            onSwap={handleSwap}
          />
        </div>

        {/* Steps panel */}
        <div data-tour="steps" className={`overflow-y-auto px-1 lg:pl-2 pb-4 ${activeTab === "steps" ? "block" : "hidden"} lg:block`}>
          <StepList
            steps={recipe.steps}
            currentStep={current_step}
            cookingStarted={cooking_started}
          />
        </div>
      </div>

      {cooking_started && <GestureHint />}
    </article>
  );
}
