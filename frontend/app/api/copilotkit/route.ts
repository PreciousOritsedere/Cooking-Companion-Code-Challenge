/**
 * CopilotKit Runtime API Route
 *
 * This endpoint acts as the bridge between the React frontend (CopilotKit provider)
 * and the Python backend's AG-UI agent. The flow is:
 *
 *   Browser (CopilotKit) → POST /api/copilotkit → CopilotRuntime → HttpAgent → Python backend /copilotkit
 *
 * Why not call the backend directly from the browser?
 * - The CopilotKit runtime adds routing, middleware, and auth in a trusted server context.
 * - It keeps the backend URL private (not exposed to the client).
 * - It handles the AG-UI protocol handshake and SSE streaming transparently.
 */

import { NextRequest } from "next/server";
import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// ExperimentalEmptyAdapter: we don't need a built-in LLM on the Node side —
// all inference happens in the Python backend via pydantic-ai.
const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  agents: {
    // "recipe_agent" must match the agent name registered in the Python backend
    // (see backend/src/agents.py → Agent(..., name="recipe_agent"))
    recipe_agent: new HttpAgent({
      url: `${BACKEND_URL}/copilotkit`,
    }),
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
