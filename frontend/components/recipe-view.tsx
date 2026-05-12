"use client";

import { useCallback } from "react";
import type { RecipeContext } from "@/lib/types";
import { submitToCopilotChat } from "@/lib/chat-utils";
import { useChatContext } from "@copilotkit/react-ui";
import { RecipeHeader } from "./recipe-header";
import { IngredientList } from "./ingredient-list";
import { StepList } from "./step-list";
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

  const handleSwap = useCallback((ingredientName: string) => {
    setOpen(true);
    submitToCopilotChat(`Suggest a substitute for ${ingredientName}`);
  }, [setOpen]);

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

  return (
    <article
      className="h-full flex flex-col overflow-hidden"
      aria-label={`Recipe: ${recipe.title}`}
    >
      {/* Fixed header area — doesn't scroll */}
      <div className="shrink-0 p-5 sm:p-6 lg:px-8 lg:pt-6 lg:pb-4 space-y-4">
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

        <RecipeHeader recipe={recipe} />
      </div>

      {/* Scrollable body — two columns on lg, stacked on mobile */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(280px,1fr)_2fr] gap-0 lg:gap-6 px-5 sm:px-6 lg:px-8 pb-6">
        <div className="overflow-y-auto pr-2 pb-4 lg:border-r lg:border-slate-100">
          <IngredientList
            ingredients={recipe.ingredients}
            checkedIngredients={checked_ingredients}
            onSwap={handleSwap}
          />
        </div>
        <div className="overflow-y-auto pl-0 lg:pl-2 pb-4">
          <StepList
            steps={recipe.steps}
            currentStep={current_step}
            cookingStarted={cooking_started}
          />
        </div>
      </div>
    </article>
  );
}
