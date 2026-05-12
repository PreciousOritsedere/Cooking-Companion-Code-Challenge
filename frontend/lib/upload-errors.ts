/** Max wait for upload + server-side parsing (LLM can be slow). */
export const UPLOAD_TIMEOUT_MS = 180_000;

export async function readUploadFailureMessage(res: Response): Promise<string> {
  const raw = await res.text();
  try {
    const body = JSON.parse(raw) as { detail?: unknown; message?: string };
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      const msgs = body.detail
        .map((item) => {
          if (typeof item === "object" && item !== null && "msg" in item) {
            return String((item as { msg?: string }).msg ?? "");
          }
          return "";
        })
        .filter(Boolean);
      if (msgs.length) return msgs.join(" ");
    }
    if (typeof body.message === "string") return body.message;
  } catch {
    /* not JSON */
  }
  const trimmed = raw.trim();
  if (trimmed) {
    return trimmed.length > 240 ? `${trimmed.slice(0, 240)}…` : trimmed;
  }

  if (res.status === 413) return "File is too large for the server.";
  if (res.status === 429) return "Too many requests — wait a moment and try again.";
  if (res.status >= 500) return "Server error — try again in a few minutes.";
  return `Upload failed (${res.status}).`;
}

export function mapUploadNetworkError(err: unknown): string {
  if (err instanceof DOMException && err.name === "AbortError") {
    return "That took too long — the server may be busy or unreachable. Check your connection and try again.";
  }
  if (err instanceof TypeError) {
    return "Could not reach the server. Check that the backend is running and your network connection.";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}
