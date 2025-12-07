import React from 'react';
import { motion } from 'framer-motion';

interface SkipButtonProps {
    direction: 'forward' | 'backward';
    seconds?: number;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
}

export const SkipButton: React.FC<SkipButtonProps> = ({
    direction,
    seconds = 15,
    onClick,
    disabled = false,
    className = '',
    children
}) => {
    return (
        <motion.div layout className="relative z-10 flex items-center justify-center">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) onClick();
                }}
                className={`w-12 h-12 rounded-full text-gray-950 flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-transform duration-100 ease-in-out ${disabled ? 'opacity-40' : ''} ${className}`}
                onPointerDownCapture={(e) => e.stopPropagation()}
                disabled={disabled}
            >
                {children}
            </button>
        </motion.div>
    );
};
