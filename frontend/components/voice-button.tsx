"use client";

/**
 * Floating voice input button — designed for messy-hands cooking.
 *
 * Uses the Web Speech API to transcribe voice, then injects the text
 * into the CopilotKit sidebar's input field and submits it.
 * Large, high-contrast, positioned for easy thumb reach.
 * Hidden in browsers that don't support SpeechRecognition.
 */

import { useCallback, useState } from "react";
import { MicrophoneIcon } from "@heroicons/react/24/solid";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { submitToCopilotChat } from "@/lib/chat-utils";

export function VoiceButton() {
  const [error, setError] = useState<string | null>(null);

  const handleResult = useCallback((transcript: string) => {
    setError(null);
    const sent = submitToCopilotChat(transcript);
    if (!sent) {
      setError("Could not find chat input. Open the sidebar first.");
    }
  }, []);

  const handleError = useCallback((err: string) => {
    setError(err);
    setTimeout(() => setError(null), 4000);
  }, []);

  const { isListening, isSupported, toggle } = useVoiceInput({
    onResult: handleResult,
    onError: handleError,
  });

  if (!isSupported) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-center gap-2">
      {/* Error tooltip */}
      {error && (
        <div
          className="rounded-lg bg-red-100 border border-red-200 px-3 py-2 text-xs text-red-700 max-w-[200px] text-center shadow-lg"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Listening indicator */}
      {isListening && (
        <div
          className="rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand shadow-sm"
          role="status"
          aria-live="polite"
        >
          Listening...
        </div>
      )}

      {/* Mic button */}
      <button
        type="button"
        onClick={toggle}
        aria-label={isListening ? "Stop voice input" : "Start voice input"}
        aria-pressed={isListening}
        className={`
          w-14 h-14 rounded-full flex items-center justify-center
          shadow-lg transition-all duration-200
          focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-blue/50
          ${isListening
            ? "bg-brand-pink hover:bg-brand-pink/90 scale-110 animate-pulse"
            : "bg-brand-blue hover:bg-brand"
          }
        `}
      >
        <MicrophoneIcon className="w-7 h-7 text-white" aria-hidden="true" />
      </button>
    </div>
  );
}
