import { useEffect } from "react";

export function useBlockCopyPaste(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const prevent = (e: Event) => e.preventDefault();

    document.addEventListener("copy", prevent);
    document.addEventListener("cut", prevent);
    document.addEventListener("paste", prevent);

    return () => {
      document.removeEventListener("copy", prevent);
      document.removeEventListener("cut", prevent);
      document.removeEventListener("paste", prevent);
    };
  }, [enabled]);
}


















