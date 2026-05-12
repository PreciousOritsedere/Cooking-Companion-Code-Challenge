/**
 * Inject text into the CopilotKit chat textarea.
 * If submit is true, submits the form. If false, just prefills and focuses.
 * Retries if the textarea isn't immediately available (e.g. popup opening).
 */
export function submitToCopilotChat(text: string, submit = true): boolean {
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

    if (submit) {
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
    } else {
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(text.length, text.length);
      }, 100);
    }

    return true;
  };

  setTimeout(() => {
    if (!attempt()) {
      setTimeout(() => attempt(), 400);
    }
  }, 0);

  return true;
}
