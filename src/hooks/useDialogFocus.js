import { useEffect, useRef } from 'react';

// Scope keyboard focus to an open dialog and restore the invoking control on close.
export function useDialogFocus(enabled = true) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !enabled) return;
    const previous = document.activeElement;
    const focusables = () => [...dialog.querySelectorAll('button, a[href], input, select, textarea, summary, iframe, [tabindex="0"]')].filter(el => !el.disabled && el.getClientRects().length);
    dialog.focus({ preventScroll: true });
    const trap = event => {
      if (event.key !== 'Tab') return;
      const elements = focusables();
      const first = elements[0], last = elements.at(-1);
      if (!first) { event.preventDefault(); dialog.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first.focus(); }
    };
    dialog.addEventListener('keydown', trap);
    return () => { dialog.removeEventListener('keydown', trap); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [enabled]);
  return ref;
}
