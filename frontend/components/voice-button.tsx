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

/**
 * Finds the CopilotKit chat textarea and submits a message by
 * programmatically setting its value and dispatching events.
 */
function submitToCopilotChat(text: string): boolean {
  const textarea = document.querySelector(
    'textarea[placeholder*="Ask me anything"]'
  ) as HTMLTextAreaElement | null;

  if (!textarea) return false;

  // Set the value using the native setter to trigger React's onChange
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  )?.set;

  if (!nativeInputValueSetter) return false;

  nativeInputValueSetter.call(textarea, text);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  // Wait for React to process the input, then submit
  setTimeout(() => {
    const form = textarea.closest("form");
    if (form) {
      form.requestSubmit();
    } else {
      // Fallback: press Enter
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          bubbles: true,
        })
      );
    }
  }, 50);

  return true;
}

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
          className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 shadow-sm"
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
          focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-amber-500/50
          ${isListening
            ? "bg-red-500 hover:bg-red-600 scale-110 animate-pulse"
            : "bg-amber-500 hover:bg-amber-600"
          }
        `}
      >
        <MicrophoneIcon className="w-7 h-7 text-white" aria-hidden="true" />
      </button>
    </div>
  );
}
