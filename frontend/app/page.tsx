"use client";

import { useState } from "react";
import { UploadZone } from "@/components/upload-zone";
import { RecipeSession } from "@/components/recipe-session";
import { ErrorBoundary } from "@/components/error-boundary";
import type { UploadResponse } from "@/lib/types";

export default function Home() {
  const [uploadData, setUploadData] = useState<UploadResponse | null>(null);

  if (uploadData) {
    return (
      <RecipeSession
        uploadData={uploadData}
        onReset={() => setUploadData(null)}
      />
    );
  }

  return (
    <ErrorBoundary>
      <main
        id="main-content"
        className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 animate-fade-in"
        aria-live="polite"
      >
        {/* Branding */}
        <div className="text-center animate-slide-up">
          <h1 className="text-4xl font-bold tracking-tight text-brand sm:text-5xl">
            Cooking Companion
          </h1>
          <p className="mt-3 text-lg text-slate-500 max-w-md mx-auto">
            Upload a recipe and let your AI assistant guide you through every
            step.
          </p>
        </div>

        {/* Upload area */}
        <div className="animate-slide-up delay-100">
          <UploadZone onUploadComplete={setUploadData} />
        </div>

        {/* Sample recipe hint */}
        <p className="text-xs text-slate-400 max-w-sm text-center animate-slide-up delay-200">
          Try the sample recipe in{" "}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
            data/test-recipe.txt
          </code>
        </p>
      </main>
    </ErrorBoundary>
  );
}
