"use client";

import { useState } from "react";
import { UploadZone } from "@/components/upload-zone";
import type { UploadResponse } from "@/lib/types";

export default function Home() {
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);

  if (uploadData) {
    // TODO: Step 3 — render the recipe view + chat
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-lg text-stone-600">
          Recipe loaded: <strong>{uploadData.state.recipe?.title}</strong>
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      {/* Branding */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-stone-800 sm:text-5xl">
          Cooking Companion
        </h1>
        <p className="mt-3 text-lg text-stone-500 max-w-md mx-auto">
          Upload a recipe and let your AI assistant guide you through every step.
        </p>
      </div>

      {/* Upload area */}
      <UploadZone onUploadComplete={setUploadData} />

      {/* Sample recipe hint */}
      <p className="text-xs text-stone-400 max-w-sm text-center">
        Try the sample recipe in{" "}
        <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-500">
          data/test-recipe.txt
        </code>
      </p>
    </main>
  );
}
