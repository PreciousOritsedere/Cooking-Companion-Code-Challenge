"use client";

import type { Ingredient } from "@/lib/types";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

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
 * Groups ingredients by category, rendering each group with a heading.
 * Each ingredient is a large tappable row — designed for messy hands
 * ticking off items while prepping.
 */
export function IngredientList({
  ingredients,
  checkedIngredients,
  onToggle,
}: IngredientListProps) {
  const [localChecked, setLocalChecked] = useState<Set<string>>(
    new Set(checkedIngredients)
  );

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
      <h2 className="text-xl font-semibold text-stone-800 mb-4">
        Ingredients
      </h2>

      <div className="space-y-5">
        {grouped.map(({ category, items }) => (
          <div key={category}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              {categoryLabels[category]}
            </h3>

            <ul className="space-y-1" role="list">
              {items.map((ing) => {
                const checked = localChecked.has(ing.name);

                return (
                  <li key={ing.name}>
                    <button
                      type="button"
                      onClick={() => toggle(ing.name)}
                      aria-pressed={checked}
                      aria-label={`${checked ? "Uncheck" : "Check"} ${formatQuantity(ing)}`}
                      className={`
                        w-full flex items-center gap-3 rounded-xl px-4 py-3
                        text-left text-base transition-colors duration-150
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50
                        ${checked
                          ? "bg-emerald-50 text-stone-400 line-through"
                          : "bg-white hover:bg-stone-50 text-stone-700"
                        }
                      `}
                    >
                      <CheckCircleIcon
                        className={`w-6 h-6 shrink-0 transition-colors duration-150 ${
                          checked ? "text-emerald-500" : "text-stone-200"
                        }`}
                        aria-hidden="true"
                      />
                      <span>{formatQuantity(ing)}</span>
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
