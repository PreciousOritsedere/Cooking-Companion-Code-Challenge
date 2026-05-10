"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseVoiceInputOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

/**
 * Hook wrapping the Web Speech API (SpeechRecognition).
 *
 * Provides push-to-talk voice input — tap to start, tap to stop.
 * Falls back gracefully: `isSupported` is false in unsupported browsers.
 * Auto-stops after silence (~3s of no speech by default).
 */
export function useVoiceInput({
  onResult,
  onError,
  language = "en-US",
}: UseVoiceInputOptions): UseVoiceInputReturn {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        onResult(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      if (event.error === "no-speech") return;
      onError?.(event.error === "not-allowed"
        ? "Microphone access denied. Please allow microphone permissions."
        : `Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported, language, onResult, onError]);

  const start = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // Already started — ignore
    }
  }, [isListening]);

  const stop = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, [isListening]);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  return { isListening, isSupported, start, stop, toggle };
}
