import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useAnimationControls } from 'framer-motion';
import { AudioStop } from '../types';
import { ForwardIcon } from './icons/ForwardIcon';
import { BackwardIcon } from './icons/BackwardIcon';

interface MiniPlayerProps {
  currentStop: AudioStop | undefined;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onForward: () => void;
  onRewind: () => void;
  onClick: () => void;
  onEnd?: () => void;
  progress?: number;
}

const iconVariants = {
  initial: { scale: 0.5, opacity: 0, filter: 'blur(2px)' },
  animate: { scale: 1, opacity: 1, filter: 'blur(0px)' },
  exit: { scale: 0.5, opacity: 0, filter: 'blur(2px)' }
};

const iconTransition = { duration: 0.25, ease: 'easeOut' } as const;

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentStop,
  isPlaying,
  onTogglePlay,
  onForward,
  onRewind,
  onClick,
  onEnd,
  progress = 0
}) => {
  // Minimized state - when true, only handle is visible
  const [isMinimized, setIsMinimized] = useState(false);
  const dragY = useMotionValue(0);

  // Use real progress from audio player
  const visualProgress = Math.max(0, Math.min(100, progress || 0));

  // Marquee animation for title
  const titleRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Check if title overflows and setup marquee animation
  useEffect(() => {
    // Reset position to start immediately when track changes
    controls.set({ x: 0 });

    if (!titleRef.current || !containerRef.current) return;

    // Wait for next frame to get accurate measurements
    const timeoutId = setTimeout(() => {
      if (!titleRef.current || !containerRef.current) return;

      const titleWidth = titleRef.current.scrollWidth;
      const containerWidth = containerRef.current.clientWidth;
      const overflow = titleWidth - containerWidth;

      if (overflow > 0) {
        setShouldAnimate(true);

        // Start animation sequence after 2 seconds
        const startAnimation = async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Infinite loop
          while (true) {
            // Scroll left to reveal full text
            await controls.start({
              x: -overflow - 10,
              transition: {
                duration: overflow / 30, // Speed based on overflow
                ease: "linear"
              }
            });

            // Pause at the end
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Scroll back to start
            await controls.start({
              x: 0,
              transition: {
                duration: overflow / 30,
                ease: "linear"
              }
            });

            // Pause at the start
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        };

        startAnimation();
      } else {
        setShouldAnimate(false);
      }
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      controls.stop();
    };
  }, [currentStop?.title, controls]);

  if (!currentStop) return null;

  // Progress ring calculations for the new 64x64 SVG
  const strokeWidth = 2.5;
  const svgSize = 64;
  const radius = 29.25; // (64 - 2.5 - 2.5) / 2 = 29.25
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (visualProgress / 100) * circumference;

  // Height of the content when expanded (approximately)
  const expandedHeight = 180;
  const minimizedOffset = expandedHeight - 48; // Show handle area fully (48px)

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{
        y: isMinimized ? minimizedOffset : 0,
        opacity: 1
      }}
      exit={{ y: 100, opacity: 0 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: minimizedOffset }}
      dragElastic={{ top: 0.05, bottom: 0.15 }}
      dragMomentum={false}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      style={{ y: dragY }}
      onDragEnd={(_, info) => {
        // Reset drag position
        dragY.set(0);

        // Decide state based on position and velocity
        const shouldMinimize = info.offset.y > 50 || (info.offset.y > 30 && info.velocity.y > 200);
        const shouldExpand = info.offset.y < -20 || (info.offset.y < -10 && info.velocity.y < -200);

        if (!isMinimized && shouldMinimize) {
          setIsMinimized(true);
        } else if (isMinimized && shouldExpand) {
          setIsMinimized(false);
        }
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8
      }}
      className="absolute bottom-0 left-0 right-0 z-[60]"
    >
      {/* Bottom Sheet Style Container */}
      <div className="relative bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-gray-100">
        {/* Extended white background below viewport */}
        <div className="absolute top-full left-0 right-0 h-[200px] bg-white" />

        {/* Handle */}
        <div className="w-full flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-2">
          {/* Controls Row */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {/* Skip Back Button */}
            <button
              onClick={(e) => { e.stopPropagation(); onRewind(); }}
              className="w-12 h-12 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-500 transition-colors shadow-md"
            >
              <BackwardIcon size={24} />
            </button>

            {/* Main Play/Pause Button with Progress Ring */}
            <div className="relative flex items-center justify-center" style={{ width: 64, height: 64 }}>
               {/* Progress Ring */}
               <svg className="absolute inset-0 rotate-[-90deg] pointer-events-none" width={64} height={64}>
                 <circle
                   stroke="#d1d5db"
                   strokeWidth={2.5}
                   fill="transparent"
                   r={29.25}
                   cx={32}
                   cy={32}
                 />
                 <circle
                   stroke="#2dd482"
                   strokeWidth={2.5}
                   fill="transparent"
                   r={29.25}
                   cx={32}
                   cy={32}
                   strokeDasharray={radius * 2 * Math.PI}
                   strokeDashoffset={offset}
                   strokeLinecap="round"
                   style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                 />
               </svg>

              <button
                onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
                className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg z-10 overflow-hidden relative"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {isPlaying ? (
                     <motion.div
                       key="pause"
                       variants={iconVariants}
                       initial="initial"
                       animate="animate"
                       exit="exit"
                       transition={iconTransition}
                       className="absolute inset-0 flex items-center justify-center"
                     >
                       <Pause size={24} fill="currentColor" />
                     </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      variants={iconVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={iconTransition}
                      className="absolute inset-0 flex items-center justify-center pl-0.5"
                    >
                      <Play size={24} fill="currentColor" className="" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Skip Forward Button */}
            <button
               onClick={(e) => { e.stopPropagation(); onForward(); }}
               className="w-12 h-12 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-500 transition-colors shadow-md"
            >
              <ForwardIcon size={24} />
            </button>
          </div>

          {/* Object Name Label */}
          <div className="text-center cursor-pointer" onClick={onClick}>
            <div ref={containerRef} className="overflow-hidden leading-tight">
              <motion.span
                ref={titleRef}
                animate={controls}
                className="font-semibold text-base text-gray-900 whitespace-nowrap inline-block"
              >
                {currentStop.title}
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};