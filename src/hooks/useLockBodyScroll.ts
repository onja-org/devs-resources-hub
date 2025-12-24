import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a modal or overlay is open
 * @param isLocked - Whether to lock the body scroll
 */
export function useLockBodyScroll(isLocked: boolean) {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLocked]);
}
