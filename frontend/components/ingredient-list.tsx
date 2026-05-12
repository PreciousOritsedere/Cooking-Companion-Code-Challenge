"use client";

import type { Ingredient } from "@/lib/types";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

interface IngredientListProps {
  ingredients: Ingredient[];
  checkedIngredients: string[];
  onToggle?: (name: string) => void;
}

const categoryLabels: Record<Ingredient["category"], string> = {
  produce: "Produce",
  protein: "Protein",
  dairy: "Dairy",
  pantry: "Pantry",
  spice: "Spices",
  other: "Other",
};

const categoryOrder: Ingredient["category"][] = [
  "produce",
  "protein",
  "dairy",
  "pantry",
  "spice",
  "other",
];

function formatQuantity(ing: Ingredient): string {
  const parts: string[] = [];
  if (ing.quantity != null) parts.push(String(ing.quantity));
  if (ing.unit) parts.push(ing.unit);
  parts.push(ing.name);
  if (ing.preparation) parts.push(`(${ing.preparation})`);
  return parts.join(" ");
}

/**
 * Ingredient checklist grouped by category.
 * Tap to check off items while prepping. Changed items get a brief highlight.
 */
export function IngredientList({
  ingredients,
  checkedIngredients,
  onToggle,
}: IngredientListProps) {
  const [localChecked, setLocalChecked] = useState<Set<string>>(
    new Set(checkedIngredients)
  );

  // null on first render = skip detection, just record the baseline
  const prevIngredientsRef = useRef<Map<string, string> | null>(null);
  const [changedNames, setChangedNames] = useState<Set<string>>(new Set());

  useEffect(() => {
    const nextMap = new Map<string, string>();
    for (const ing of ingredients) {
      nextMap.set(ing.name, formatQuantity(ing));
    }

    if (prevIngredientsRef.current === null) {
      prevIngredientsRef.current = nextMap;
      return;
    }

    const prev = prevIngredientsRef.current;
    const newChanged = new Set<string>();

    for (const ing of ingredients) {
      const prevStr = prev.get(ing.name);
      const currStr = formatQuantity(ing);
      if (prevStr !== undefined && prevStr !== currStr) {
        newChanged.add(ing.name);
      }
      if (!prev.has(ing.name)) {
        newChanged.add(ing.name);
      }
    }

    prevIngredientsRef.current = nextMap;

    if (newChanged.size > 0) {
      setChangedNames(newChanged);
      const timer = setTimeout(() => setChangedNames(new Set()), 2000);
      return () => clearTimeout(timer);
    }
  }, [ingredients]);

  const toggle = (name: string) => {
    setLocalChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
    onToggle?.(name);
  };

  const grouped = categoryOrder
    .map((cat) => ({
      category: cat,
      items: ingredients.filter((i) => i.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <section aria-label="Ingredients">
      <h2 className="text-xl font-semibold text-brand mb-4">
        Ingredients
      </h2>

      <div className="space-y-5">
        {grouped.map(({ category, items }) => (
          <div key={category}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 pl-1">
              {categoryLabels[category]}
            </h3>

            <ul className="space-y-1.5">
              {items.map((ing) => {
                const checked = localChecked.has(ing.name);
                const justChanged = changedNames.has(ing.name);

                return (
                  <li key={ing.name}>
                    <button
                      type="button"
                      onClick={() => toggle(ing.name)}
                      aria-pressed={checked}
                      aria-label={`${checked ? "Uncheck" : "Check"} ${formatQuantity(ing)}`}
                      className={`
                        w-full flex items-center gap-3 rounded-xl px-4 py-3
                        text-left text-base transition-all duration-300
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50
                        ${justChanged
                          ? "bg-brand-light ring-2 ring-brand-cyan scale-[1.01] shadow-sm"
                          : checked
                            ? "bg-emerald-50 text-slate-400 line-through"
                            : "bg-white border border-slate-100 hover:border-brand-cyan/40 hover:shadow-sm text-slate-700"
                        }
                      `}
                    >
                      <CheckCircleIcon
                        className={`w-5 h-5 shrink-0 transition-colors duration-200 ${
                          checked ? "text-emerald-500" : "text-slate-200"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="flex-1">{formatQuantity(ing)}</span>
                      {justChanged && (
                        <ArrowsRightLeftIcon
                          className="w-4 h-4 text-brand-blue animate-pulse"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
