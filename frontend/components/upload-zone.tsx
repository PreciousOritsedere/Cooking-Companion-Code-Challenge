"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowPathIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import type { UploadResponse } from "@/lib/types";
import {
  mapUploadNetworkError,
  readUploadFailureMessage,
  UPLOAD_TIMEOUT_MS,
} from "@/lib/upload-errors";

interface UploadZoneProps {
  onUploadComplete: (data: UploadResponse) => void;
}

type UploadState = "idle" | "dragging" | "uploading" | "error";

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [offline, setOffline] = useState(
    () => typeof navigator !== "undefined" && !navigator.onLine,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastFileRef = useRef<File | null>(null);

  useEffect(() => {
    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      const allowed = [
        "application/pdf",
        "text/plain",
      ];
      if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|txt|text)$/i)) {
        setState("error");
        setErrorMessage("Please upload a PDF or text file.");
        return;
      }

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setState("error");
        setErrorMessage(
          "You're offline. Reconnect to the network, then try again.",
        );
        return;
      }

      lastFileRef.current = file;
      setState("uploading");
      setErrorMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        if (!res.ok) {
          const message = await readUploadFailureMessage(res);
          throw new Error(message);
        }

        const data: UploadResponse = await res.json();
        lastFileRef.current = null;
        onUploadComplete(data);
      } catch (err) {
        setState("error");
        setErrorMessage(mapUploadNetworkError(err));
      } finally {
        window.clearTimeout(timeoutId);
      }
    },
    [onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState("idle");

      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setState("dragging");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRetry = () => {
    const file = lastFileRef.current;
    if (file) uploadFile(file);
    else handleClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      {offline && (
        <div
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
          aria-live="polite"
        >
          You appear to be offline. Reconnect, then try uploading again.
        </div>
      )}

      {/* 
        Drop zone — acts as a large, touch-friendly button.
        role="button" + tabIndex + keyboard handler ensure screen readers
        and keyboard users can interact with it.
       */}
      <div
        role="button"
        tabIndex={0}
        onClick={state !== "uploading" ? handleClick : undefined}
        onKeyDown={state !== "uploading" ? handleKeyDown : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-label="Upload a recipe file. Accepts PDF or plain text."
        aria-busy={state === "uploading"}
        aria-disabled={state === "uploading"}
        className={`
          relative w-full rounded-2xl border-2 border-dashed p-12
          transition-all duration-300 ease-out
          focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-blue/50
          ${state === "dragging"
            ? "border-brand-blue bg-brand-light scale-[1.02]"
            : state === "uploading"
              ? "border-slate-300 bg-slate-50 cursor-wait"
              : state === "error"
                ? "border-red-300 bg-red-50 cursor-pointer"
                : "border-slate-300 bg-white hover:border-brand-cyan hover:bg-brand-light/30 cursor-pointer"
          }
        `}
      >
        {state === "uploading" ? (
          <div className="flex flex-col items-center gap-4" role="status">
            <div
              className="w-10 h-10 border-3 border-brand-blue border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            <p className="text-lg font-medium text-slate-600">
              Parsing your recipe...
            </p>
            <span className="sr-only">Uploading and parsing recipe file</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center"
              aria-hidden="true"
            >
              <ArrowUpTrayIcon className="w-8 h-8 text-brand-blue" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-brand">
                Drop your recipe here
              </p>
              <p className="mt-1 text-sm text-slate-500">
                PDF or text file — tap to browse
              </p>
            </div>
          </div>
        )}
      </div>

      {state === "error" && (
        <div
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-4"
          role="alert"
        >
          <p className="text-sm font-medium text-red-800">{errorMessage}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50"
            >
              <ArrowPathIcon className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
            <button
              type="button"
              onClick={() => {
                setState("idle");
                setErrorMessage("");
                lastFileRef.current = null;
                handleClick();
              }}
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50"
            >
              Choose another file
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input — triggered by the drop zone */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.text"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
