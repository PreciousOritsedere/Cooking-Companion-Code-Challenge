"use client";

/**
 * Chat suggestions for the CopilotKit sidebar.
 *
 * Instead of registering frontend actions (which conflict with the
 * backend's identically-named tools), we provide helpful chat suggestions
 * that guide the user towards the agent's capabilities.
 */

import { useCopilotChatSuggestions } from "@copilotkit/react-ui";

/**
 * Registers contextual chat suggestions.
 * Must be called inside a component within <CopilotKit>.
 */
export function useToolRenderers() {
  useCopilotChatSuggestions({
    instructions:
      "Suggest actions the user can take with their recipe: scaling servings, substituting ingredients, or starting a cooking walkthrough.",
    maxSuggestions: 3,
  });
}
