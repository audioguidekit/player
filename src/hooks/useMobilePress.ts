import { useCallback } from 'react';
import { useTheme } from 'styled-components';

/**
 * Returns an onPointerDown handler that applies a pressed background directly
 * via DOM style mutation, bypassing React's render cycle.
 *
 * iOS Safari delays repaints until the next touch event, so React state-based
 * press feedback visually sticks. Direct DOM mutation is instant.
 */
export function useMobilePress() {
  const theme = useTheme();

  return useCallback((e: React.PointerEvent<HTMLButtonElement>, action: () => void) => {
    const btn = e.currentTarget;
    btn.style.backgroundColor = theme.colors.background.tertiary;

    const release = () => {
      btn.style.backgroundColor = '';
      action();
    };

    btn.addEventListener('pointerup',     release, { once: true });
    btn.addEventListener('pointercancel', release, { once: true });
    btn.addEventListener('pointerleave',  release, { once: true });
  }, [theme]);
}
