"use client";

import { Component, type ReactNode } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React error boundary — catches rendering errors in child components
 * and displays a friendly recovery UI instead of a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8 text-center"
          role="alert"
          aria-live="assertive"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-stone-800">
            Something went wrong
          </h2>
          <p className="text-stone-500 max-w-md">
            {this.props.fallbackMessage ??
              "An unexpected error occurred. Try refreshing the page or uploading a new recipe."}
          </p>
          {this.state.error && (
            <pre className="mt-2 text-xs text-stone-400 bg-stone-100 rounded-lg px-4 py-2 max-w-lg overflow-auto">
              {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
          >
            Refresh page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
