"use client";

/**
 * Shimmer skeleton shown while recipe state is loading or initialising.
 * Matches the layout of RecipeView so content doesn't jump.
 */

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-lg bg-stone-200 animate-pulse ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

export function RecipeSkeleton() {
  return (
    <div
      className="p-5 sm:p-6 lg:p-8 space-y-6"
      role="status"
      aria-label="Loading recipe"
    >
      {/* Header skeleton */}
      <div className="space-y-3">
        <Bone className="h-9 w-64" />
        <Bone className="h-5 w-96 max-w-full" />
        <div className="flex gap-4 pt-2">
          <Bone className="h-8 w-28 rounded-full" />
          <Bone className="h-8 w-24 rounded-full" />
          <Bone className="h-8 w-20 rounded-full" />
        </div>
      </div>

      {/* Two-column skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,1fr)_2fr] gap-6">
        {/* Ingredients */}
        <div className="space-y-3">
          <Bone className="h-6 w-28" />
          <Bone className="h-12 w-full rounded-xl" />
          <Bone className="h-12 w-full rounded-xl" />
          <Bone className="h-12 w-full rounded-xl" />
          <Bone className="h-12 w-full rounded-xl" />
          <Bone className="h-12 w-3/4 rounded-xl" />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          <Bone className="h-6 w-20" />
          <Bone className="h-20 w-full rounded-2xl" />
          <Bone className="h-20 w-full rounded-2xl" />
          <Bone className="h-20 w-full rounded-2xl" />
          <Bone className="h-20 w-full rounded-2xl" />
        </div>
      </div>

      <span className="sr-only">Loading recipe content, please wait.</span>
    </div>
  );
}
