"use client";

import type { Recipe } from "@/lib/types";
import {
  ClockIcon,
  UserGroupIcon,
  FireIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

interface RecipeHeaderProps {
  recipe: Recipe;
}

const difficultyConfig = {
  easy: { label: "Easy", colour: "bg-emerald-100 text-emerald-700" },
  medium: { label: "Medium", colour: "bg-amber-100 text-amber-700" },
  hard: { label: "Hard", colour: "bg-red-100 text-red-700" },
} as const;

export function RecipeHeader({ recipe }: RecipeHeaderProps) {
  const difficulty = difficultyConfig[recipe.difficulty];
  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return (
    <header aria-label={`${recipe.title} — recipe overview`}>
      {/* Title + difficulty badge */}
      <div className="flex flex-wrap items-start gap-3 mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          {recipe.title}
        </h1>
        <span
          className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${difficulty.colour}`}
          role="status"
          aria-label={`Difficulty: ${difficulty.label}`}
        >
          {difficulty.label}
        </span>
      </div>

      {/* Description */}
      {recipe.description && (
        <p className="text-lg text-stone-600 max-w-2xl mb-4">
          {recipe.description}
        </p>
      )}

      {/* Meta — semantic description list for screen readers */}
      <dl
        className="flex flex-wrap gap-4 text-base text-stone-600"
        aria-label="Recipe details"
      >
        <div className="flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5 text-stone-400" aria-hidden="true" />
          <dt className="sr-only">Servings</dt>
          <dd>
            <strong>{recipe.servings}</strong> servings
            {recipe.original_servings &&
              recipe.original_servings !== recipe.servings && (
                <span className="ml-1 text-sm text-stone-400">
                  (was {recipe.original_servings})
                </span>
              )}
          </dd>
        </div>

        {totalTime > 0 && (
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-stone-400" aria-hidden="true" />
            <dt className="sr-only">Time</dt>
            <dd>
              {recipe.prep_time_minutes != null && (
                <>
                  <strong>{recipe.prep_time_minutes}</strong>m prep
                </>
              )}
              {recipe.prep_time_minutes != null &&
                recipe.cook_time_minutes != null && (
                  <span className="mx-1 text-stone-300" aria-hidden="true">·</span>
                )}
              {recipe.cook_time_minutes != null && (
                <>
                  <strong>{recipe.cook_time_minutes}</strong>m cook
                </>
              )}
            </dd>
          </div>
        )}

        {recipe.cuisine && (
          <div className="flex items-center gap-2">
            <GlobeAltIcon className="w-5 h-5 text-stone-400" aria-hidden="true" />
            <dt className="sr-only">Cuisine</dt>
            <dd>{recipe.cuisine}</dd>
          </div>
        )}

        {recipe.dietary_tags.length > 0 && (
          <div className="flex items-center gap-2">
            <FireIcon className="w-5 h-5 text-stone-400" aria-hidden="true" />
            <dt className="sr-only">Dietary</dt>
            <dd>{recipe.dietary_tags.join(", ")}</dd>
          </div>
        )}
      </dl>
    </header>
  );
}
