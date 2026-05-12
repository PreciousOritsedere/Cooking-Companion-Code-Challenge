"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Step, EventData, Status } from "react-joyride";

const Joyride = dynamic(
  () => import("react-joyride").then((mod) => mod.Joyride),
  { ssr: false },
);

const STORAGE_KEY = "cc-tour-dismissed";

const steps: Step[] = [
  {
    target: "[data-tour='recipe-header']",
    title: "Your recipe at a glance",
    content:
      "Title, difficulty, prep time, and cuisine — everything you need before you start cooking.",
    placement: "bottom",
    skipBeacon: true,
  },
  {
    target: "[data-tour='servings']",
    title: "Scale servings instantly",
    content:
      "Tap + or − to adjust servings. The AI recalculates every ingredient quantity for you.",
    placement: "bottom",
  },
  {
    target: "[data-tour='ingredients']",
    title: "Ingredients with swap",
    content:
      "Check off items as you prep. Tap \"Swap\" on any ingredient to ask the AI for a substitute.",
    placement: "right-start",
    before: async () => {
      const ingredientsTab = document.querySelector<HTMLButtonElement>(
        "[data-tour='tabs'] button:first-child",
      );
      ingredientsTab?.click();
      await new Promise((r) => setTimeout(r, 100));
    },
  },
  {
    target: "[data-tour='tabs']",
    title: "Switch between views",
    content:
      "On tablet and mobile, tap these tabs to switch between ingredients and cooking steps.",
    placement: "bottom",
  },
  {
    target: "[data-tour='steps']",
    title: "Cooking steps",
    content:
      "Each step is listed here with timing info. Once you start cooking, the active step highlights and timers appear automatically.",
    placement: "left-start",
    before: async () => {
      const stepsTab = document.querySelector<HTMLButtonElement>(
        "[data-tour='tabs'] button:last-child",
      );
      stepsTab?.click();
      await new Promise((r) => setTimeout(r, 100));
    },
  },
  {
    target: "[data-tour='start-cooking']",
    title: "Start cooking",
    content:
      "Hit this button when you're ready. The AI will guide you through each step one by one.",
    placement: "bottom",
  },
  {
    target: ".copilotKitButton",
    title: "Chat with the AI",
    content:
      "Tap this button to open the chat. Ask the AI to scale servings, substitute ingredients, or walk you through the recipe.",
    placement: "top-end",
  },
  {
    target: "[data-tour='voice-btn']",
    title: "Hands-free voice input",
    content:
      "Messy hands? Tap the mic and speak your request — no typing needed.",
    placement: "top",
  },
];

const FINISHED_STATUSES: Status[] = ["finished", "skipped"];

export function OnboardingTour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEvent = useCallback((data: EventData) => {
    if (FINISHED_STATUSES.includes(data.status)) {
      setRun(false);
      localStorage.setItem(STORAGE_KEY, "true");
    }
  }, []);

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      options={{
        buttons: ["back", "close", "primary", "skip"],
        showProgress: true,
        primaryColor: "#1e3a5f",
        textColor: "#334155",
        zIndex: 200,
        overlayColor: "rgba(15, 23, 42, 0.45)",
        spotlightRadius: 16,
      }}
      locale={{
        back: "Back",
        close: "Got it",
        last: "Done",
        next: "Next",
        skip: "Skip tour",
      }}
      styles={{
        tooltip: {
          borderRadius: 16,
          padding: "20px 24px",
          fontSize: 15,
        },
        tooltipTitle: {
          fontSize: 17,
          fontWeight: 700,
          marginBottom: 4,
        },
        tooltipContent: {
          lineHeight: 1.6,
          padding: "8px 0 0",
        },
        buttonPrimary: {
          borderRadius: 10,
          padding: "8px 20px",
          fontSize: 14,
          fontWeight: 600,
        },
        buttonBack: {
          color: "#64748b",
          fontSize: 14,
          marginRight: 8,
        },
        buttonSkip: {
          color: "#94a3b8",
          fontSize: 13,
        },
      }}
    />
  );
}
