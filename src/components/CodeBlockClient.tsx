"use client";

import { useEffect } from "react";

export function CodeBlockClient() {
  useEffect(() => {
    const handleCopy = async (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest(".code-copy-btn") as HTMLButtonElement | null;
      if (!button) return;

      const wrapper = button.closest(".shiki-wrapper") as HTMLElement | null;
      if (!wrapper) return;

      const rawCodeEncoded = wrapper.getAttribute("data-raw-code");
      if (!rawCodeEncoded) return;

      const rawCode = decodeURIComponent(rawCodeEncoded);

      const markCopied = () => {
        const btnText = button.querySelector(".btn-text");
        const originalText = btnText?.textContent || "Copy";

        if (btnText) {
          btnText.textContent = "Copied!";
        }
        button.classList.add("text-emerald-400", "border-emerald-600");

        setTimeout(() => {
          if (btnText) {
            btnText.textContent = originalText;
          }
          button.classList.remove("text-emerald-400", "border-emerald-600");
        }, 2000);
      };

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(rawCode);
          markCopied();
          return;
        }
        throw new Error("Clipboard API unavailable or non-secure context");
      } catch {
        // Fallback for non-secure HTTP staging contexts and legacy environments
        try {
          const textarea = document.createElement("textarea");
          textarea.value = rawCode;
          textarea.style.position = "fixed";
          textarea.style.left = "-9999px";
          textarea.style.top = "0";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          const successful = document.execCommand("copy");
          document.body.removeChild(textarea);
          if (successful) {
            markCopied();
            return;
          }
        } catch (fallbackErr) {
          console.error("Failed to copy code via fallback:", fallbackErr);
        }
      }
    };

    document.addEventListener("click", handleCopy);
    return () => {
      document.removeEventListener("click", handleCopy);
    };
  }, []);

  return null;
}
