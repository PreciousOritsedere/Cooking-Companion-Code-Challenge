"use client";

import type { Recipe } from "@/lib/types";
import {
  ClockIcon,
  UserGroupIcon,
  FireIcon,
  GlobeAltIcon,
  MinusIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

interface RecipeHeaderProps {
  recipe: Recipe;
  onScale?: (newServings: number) => void;
  onStartCooking?: () => void;
  cookingStarted?: boolean;
}

const difficultyConfig = {
  easy: { label: "Easy", colour: "bg-emerald-100 text-emerald-700" },
  medium: { label: "Medium", colour: "bg-brand-light text-brand" },
  hard: { label: "Hard", colour: "bg-brand-pink/10 text-brand-pink" },
} as const;

export function RecipeHeader({ recipe, onScale, onStartCooking, cookingStarted }: RecipeHeaderProps) {
  const difficulty = difficultyConfig[recipe.difficulty];
  const totalTime =
    (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  const prevServingsRef = useRef<number | null>(null);
  const [servingsChanged, setServingsChanged] = useState(false);

  // Local servings counter for instant UI feedback
  const [localServings, setLocalServings] = useState(recipe.servings);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when backend updates servings
  useEffect(() => {
    setLocalServings(recipe.servings);
  }, [recipe.servings]);

  const adjustServings = (newVal: number) => {
    if (newVal < 1) return;
    setLocalServings(newVal);

    // Debounce the AI call — wait 600ms after last tap
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (newVal !== recipe.servings) {
        onScale?.(newVal);
      }
    }, 600);
  };

  useEffect(() => {
    if (prevServingsRef.current === null) {
      prevServingsRef.current = recipe.servings;
      return;
    }
    if (prevServingsRef.current !== recipe.servings) {
      setServingsChanged(true);
      prevServingsRef.current = recipe.servings;
      const timer = setTimeout(() => setServingsChanged(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [recipe.servings]);

  return (
    <header aria-label={`${recipe.title} — recipe overview`} data-tour="recipe-header">
      {/* Title + difficulty badge + start cooking */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-brand sm:text-3xl lg:text-4xl">
          {recipe.title}
        </h1>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${difficulty.colour}`}
          role="status"
          aria-label={`Difficulty: ${difficulty.label}`}
        >
          {difficulty.label}
        </span>

        {onStartCooking && !cookingStarted && (
          <button
            type="button"
            onClick={onStartCooking}
            data-tour="start-cooking"
            className="hidden lg:flex ml-auto items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-white font-semibold shadow-md hover:bg-brand hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50"
          >
            <PlayIcon className="w-5 h-5" aria-hidden="true" />
            Start Cooking
          </button>
        )}
      </div>

      {recipe.description && (
        <p className="hidden sm:block text-lg text-slate-600 max-w-2xl mb-4">
          {recipe.description}
        </p>
      )}

      <dl className="flex flex-wrap gap-2 sm:gap-4 text-sm sm:text-base text-slate-600" aria-label="Recipe details">
        <div
          data-tour="servings"
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 transition-all duration-500 ${
            servingsChanged
              ? "bg-brand-light ring-2 ring-brand-cyan scale-105"
              : "bg-transparent"
          }`}
        >
          <UserGroupIcon className="w-5 h-5 text-slate-400" aria-hidden="true" />
          <dt className="sr-only">Servings</dt>
          <dd className="flex items-center gap-1.5">
            {onScale && (
              <button
                type="button"
                onClick={() => adjustServings(localServings - 1)}
                disabled={localServings <= 1}
                aria-label="Decrease servings"
                className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-brand-light hover:text-brand-blue disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50"
              >
                <MinusIcon className="w-3.5 h-3.5" />
              </button>
            )}
            {onScale ? (
              <input
                type="number"
                min={1}
                max={99}
                value={localServings}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) adjustServings(val);
                }}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === "Enter") {
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                aria-label="Set servings"
                className="w-10 text-center font-bold bg-transparent border-b-2 border-dashed border-slate-300 focus:border-brand-blue outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            ) : (
              <strong className="min-w-6 text-center">{recipe.servings}</strong>
            )}
            <span>servings</span>
            {onScale && (
              <button
                type="button"
                onClick={() => adjustServings(localServings + 1)}
                aria-label="Increase servings"
                className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 text-slate-600 hover:bg-brand-light hover:text-brand-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50"
              >
                <PlusIcon className="w-3.5 h-3.5" />
              </button>
            )}
            {recipe.original_servings &&
              recipe.original_servings !== recipe.servings && (
                <span className="ml-1 text-sm text-slate-400">
                  (was {recipe.original_servings})
                </span>
              )}
          </dd>
        </div>

        {totalTime > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5">
            <ClockIcon className="w-5 h-5 text-slate-400" aria-hidden="true" />
            <dt className="sr-only">Time</dt>
            <dd>
              {recipe.prep_time_minutes != null && (
                <>
                  <strong>{recipe.prep_time_minutes}</strong>m prep
                </>
              )}
              {recipe.prep_time_minutes != null &&
                recipe.cook_time_minutes != null && (
                  <span className="mx-1 text-slate-300" aria-hidden="true">·</span>
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
          <div className="flex items-center gap-2 px-3 py-1.5">
            <GlobeAltIcon className="w-5 h-5 text-slate-400" aria-hidden="true" />
            <dt className="sr-only">Cuisine</dt>
            <dd>{recipe.cuisine}</dd>
          </div>
        )}

        {recipe.dietary_tags.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5">
            <FireIcon className="w-5 h-5 text-slate-400" aria-hidden="true" />
            <dt className="sr-only">Dietary</dt>
            <dd>{recipe.dietary_tags.join(", ")}</dd>
          </div>
        )}
      </dl>

      {onStartCooking && !cookingStarted && (
        <button
          type="button"
          onClick={onStartCooking}
          data-tour="start-cooking"
          className="lg:hidden mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-white font-semibold shadow-md hover:bg-brand hover:shadow-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50"
        >
          <PlayIcon className="w-5 h-5" aria-hidden="true" />
          Start Cooking
        </button>
      )}
    </header>
  );
}
