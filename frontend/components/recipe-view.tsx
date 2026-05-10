"use client";

import type { RecipeContext } from "@/lib/types";
import { RecipeHeader } from "./recipe-header";
import { IngredientList } from "./ingredient-list";
import { StepList } from "./step-list";
import { FireIcon } from "@heroicons/react/24/solid";

interface RecipeViewProps {
  state: RecipeContext;
}

/**
 * Main recipe display — the left/top panel in the app layout.
 *
 * Layout strategy:
 * - On tablets/desktop (md+): single scrollable column inside the left panel.
 *   Ingredients and steps sit side by side when there's room (lg+).
 * - On phones: stacked vertically, full width.
 *
 * Shows a "cooking mode" banner once the user starts stepping through.
 */
export function RecipeView({ state }: RecipeViewProps) {
  const { recipe, current_step, checked_ingredients, cooking_started } = state;

  if (!recipe) {
    return (
      <div
        className="flex items-center justify-center h-full p-8"
        role="status"
        aria-label="No recipe loaded"
      >
        <p className="text-stone-400 text-lg">No recipe loaded yet.</p>
      </div>
    );
  }

  return (
    <article
      className="h-full overflow-y-auto p-5 sm:p-6 lg:p-8 space-y-6"
      aria-label={`Recipe: ${recipe.title}`}
    >
      {/* Cooking mode indicator */}
      {cooking_started && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm ${
            current_step >= recipe.steps.length - 1
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
          role="status"
          aria-live="polite"
        >
          <FireIcon
            className={`w-5 h-5 ${
              current_step >= recipe.steps.length - 1
                ? "text-emerald-500"
                : "text-amber-500 animate-pulse"
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
              <span className="text-amber-600 ml-1">
                Ask the assistant to move to the next step when you're ready.
              </span>
            </>
          )}
        </div>
      )}

      <RecipeHeader recipe={recipe} />

      {/*
        Two-column layout on large screens:
        - Ingredients (narrower, fixed-ish) on the left
        - Steps (wider, scrollable) on the right
        Stacks on smaller screens.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,1fr)_2fr] gap-6">
        <IngredientList
          ingredients={recipe.ingredients}
          checkedIngredients={checked_ingredients}
        />
        <StepList
          steps={recipe.steps}
          currentStep={current_step}
          cookingStarted={cooking_started}
        />
      </div>
    </article>
  );
}
