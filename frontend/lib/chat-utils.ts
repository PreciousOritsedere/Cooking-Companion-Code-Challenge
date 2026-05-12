/**
 * Programmatically inject text into the CopilotKit chat textarea and submit.
 * Retries if the textarea isn't immediately available (e.g. sidebar opening).
 */
export function submitToCopilotChat(text: string): boolean {
  const attempt = () => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement | null;

    if (!textarea) return false;

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;

    if (!nativeInputValueSetter) return false;

    nativeInputValueSetter.call(textarea, text);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    setTimeout(() => {
      const form = textarea.closest("form");
      if (form) {
        const submitBtn = form.querySelector(
          'button[type="submit"]'
        ) as HTMLButtonElement | null;
        if (submitBtn) {
          submitBtn.click();
        } else {
          form.requestSubmit();
        }
      }
    }, 150);

    return true;
  };

  setTimeout(() => {
    if (!attempt()) {
      // Sidebar may still be animating open — retry
      setTimeout(() => attempt(), 400);
    }
  }, 0);

  return true;
}
