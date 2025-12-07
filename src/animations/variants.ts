/**
 * Shared animation variants for Framer Motion
 * Extracted to avoid duplication across components
 */

import type { Variants, Transition } from 'framer-motion';

// Icon animation variants (used in play/pause buttons)
export const iconVariants: Variants = {
    initial: { scale: 0.5, opacity: 0, filter: 'blur(2px)' },
    animate: { scale: 1, opacity: 1, filter: 'blur(0px)' },
    exit: { scale: 0.5, opacity: 0, filter: 'blur(2px)' }
};

export const iconTransition: Transition = {
    duration: 0.25,
    ease: 'easeOut'
};

// Content fade animation variants
export const contentVariants: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

// Sheet/drawer animation variants
export const sheetVariants: Variants = {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' }
};

// Standard spring transitions
export const springTransition: Transition = {
    type: 'spring',
    damping: 25,
    stiffness: 300
};

export const quickSpringTransition: Transition = {
    type: 'spring',
    damping: 30,
    stiffness: 400
};
