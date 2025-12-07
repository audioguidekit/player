import React from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    className?: string;
    animated?: boolean;
}

/**
 * SVG circular progress ring component.
 * Used in MiniPlayer to show audio playback progress.
 */
export const ProgressRing: React.FC<ProgressRingProps> = ({
    progress,
    size = 64,
    strokeWidth = 3,
    color = '#22BD53',
    backgroundColor = '#dddddd',
    className = '',
    animated = true
}) => {
    const radius = (size - strokeWidth) / 2 - 1; // -1 for padding
    const circumference = 2 * Math.PI * radius;
    const visualProgress = Math.max(0, Math.min(100, progress));
    const strokeDashoffset = circumference * (1 - visualProgress / 100);

    return (
        <motion.svg
            initial={animated ? { opacity: 0 } : false}
            animate={animated ? { opacity: 1 } : false}
            exit={animated ? { opacity: 0 } : false}
            transition={{ duration: 0.3 }}
            style={{ rotate: -90 }}
            className={`absolute inset-0 pointer-events-none ${className}`}
            width={size}
            height={size}
        >
            {/* Background circle */}
            <circle
                stroke={backgroundColor}
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
            />
            {/* Progress circle */}
            <motion.circle
                stroke={color}
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.1, ease: 'linear' }}
                strokeLinecap="round"
            />
        </motion.svg>
    );
};
