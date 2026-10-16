import { useEffect } from 'react';

/**
 * Universal scroll-locking hook for modals, drawers, and overlay menus.
 * Maintains an active lock count on document.body so stacked modals
 * cleanly keep the background frozen until ALL active overlays have closed.
 */
export function useBodyScrollLock(isLocked = true) {
  useEffect(() => {
    if (!isLocked) return;

    const count = Number(document.body.dataset.scrollLocks || 0);
    document.body.dataset.scrollLocks = String(count + 1);

    if (count === 0) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    }

    return () => {
      const remaining = Number(document.body.dataset.scrollLocks || 1) - 1;
      if (remaining <= 0) {
        delete document.body.dataset.scrollLocks;
        document.body.classList.remove('modal-open');
        document.documentElement.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      } else {
        document.body.dataset.scrollLocks = String(remaining);
      }
    };
  }, [isLocked]);
}

export default useBodyScrollLock;
