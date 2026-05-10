"use client";

import type { RecipeContext } from "@/lib/types";
import { RecipeHeader } from "./recipe-header";
import { IngredientList } from "./ingredient-list";
import { StepList } from "./step-list";

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
