import React, { useEffect, useRef, useState } from 'react';
import { SkipBack, SkipForward, X } from 'lucide-react';
import { motion, AnimatePresence, useAnimationControls, useMotionValue, useTransform, PanInfo, useMotionTemplate } from 'framer-motion';
import { AudioStop } from '../types';
import { ForwardIcon } from './icons/ForwardIcon';
import { BackwardIcon } from './icons/BackwardIcon';
import { SkipButton } from './player/SkipButton';
import { PlayPauseButton } from './player/PlayPauseButton';
import { ProgressRing } from './player/ProgressRing';
import { iconVariants, iconTransition } from '../src/animations/variants';

interface MiniPlayerProps {
  currentStop: AudioStop | undefined;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onForward: () => void;
  onRewind: () => void;
  onClick: () => void;
  progress?: number;
  isExpanded?: boolean;
  onToggleExpanded?: (expanded: boolean) => void;
  isCompleting?: boolean;
  isTransitioning?: boolean;
  // Track navigation (for swipe)
  onNextTrack?: () => void;
  onPrevTrack?: () => void;
  canGoNext?: boolean;
  canGoPrev?: boolean;
}


export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  currentStop,
  isPlaying,
  onTogglePlay,
  onForward,
  onRewind,
  onClick,
  progress = 0,
  isExpanded: externalIsExpanded,
  onToggleExpanded,
  isCompleting = false,
  isTransitioning = false,
  onNextTrack,
  onPrevTrack,
  canGoNext = true,
  canGoPrev = true
}) => {
  // Use external state if provided, otherwise fall back to local state
  const [localIsExpanded, setLocalIsExpanded] = useState(true);
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : localIsExpanded;
  const setIsExpanded = onToggleExpanded || setLocalIsExpanded;

  // Use real progress from audio player
  const visualProgress = Math.max(0, Math.min(100, progress || 0));

  // Marquee animation for title
  const titleRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Advanced content transition variants (Blur + Scale + Fade)
  const contentVariants = {
    initial: { opacity: 0, scale: 0.9, filter: "blur(10px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 0.9, filter: "blur(10px)" }
  };

  // Button variants without scale (so whileTap can control scale)
  const buttonVariants = {
    initial: { opacity: 0, filter: "blur(10px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(10px)" }
  };

  // Swipe logic vars
  const x = useMotionValue(0);
  const xExpanded = useMotionValue(0);

  // Inverse transforms for the handle to keep it static while dragging
  const xHandle = useTransform(x, (value) => -value);
  const xHandleExpanded = useTransform(xExpanded, (value) => -value);

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

      // Add a small threshold (2px) to prevent animation when text fits perfectly but has sub-pixel differences
      if (overflow > 2) {
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

  // Swipe logic for collapsed player
  const opacityNext = useTransform(x, [-75, -25], [1, 0]); // Drag left -> Show Next (Right side)
  const scaleNext = useTransform(x, [-75, -25], [1.2, 0.8]);
  const opacityPrev = useTransform(x, [25, 75], [0, 1]); // Drag right -> Show Prev (Left side)
  const scalePrev = useTransform(x, [25, 75], [0.8, 1.2]);

  // Swipe logic for expanded player (must be before early return to follow hooks rules)
  const opacityNextExpanded = useTransform(xExpanded, [-75, -25], [1, 0]);
  const scaleNextExpanded = useTransform(xExpanded, [-75, -25], [1.2, 0.8]);
  const opacityPrevExpanded = useTransform(xExpanded, [25, 75], [0, 1]);
  const scalePrevExpanded = useTransform(xExpanded, [25, 75], [0.8, 1.2]);

  // Dynamic shadow opacities (only show shadow when dragged horizontally to maintain seamless vertical look)
  const shadowOpacity = useTransform(x, [-20, 0, 20], [0.1, 0, 0.1]);
  const boxShadow = useMotionTemplate`0 0 15px rgba(0,0,0,${shadowOpacity})`;



  const shadowOpacityExpanded = useTransform(xExpanded, [-20, 0, 20], [0.1, 0, 0.1]);
  const boxShadowExpanded = useMotionTemplate`0 0 15px rgba(0,0,0,${shadowOpacityExpanded})`;

  // Ref to track if we've already vibrated for this drag
  const hasVibratedRef = useRef(false);

  const handleDragStart = () => {
    hasVibratedRef.current = false;
  };

  const handleDrag = (_: any, info: PanInfo, isNextEnabled: boolean, isPrevEnabled: boolean) => {
    if (hasVibratedRef.current) return;

    // Threshold for haptic trigger
    const threshold = 50;

    // Check if dragging left (next) when disabled
    if (info.offset.x < -threshold && !isNextEnabled) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20); // Short light tick
        hasVibratedRef.current = true;
      }
    }

    // Check if dragging right (prev) when disabled
    if (info.offset.x > threshold && !isPrevEnabled) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(20); // Short light tick
        hasVibratedRef.current = true;
      }
    }
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipedLeft = info.offset.x < -75;
    const swipedRight = info.offset.x > 75;

    if (swipedLeft && canGoNext && onNextTrack) {
      onNextTrack();
    } else if (swipedRight && canGoPrev && onPrevTrack) {
      onPrevTrack();
    }
    // For disabled states, the dragConstraints will naturally spring back to 0
    // The grayed-out icons provide visual feedback that the action is not available
  };

  const handleDragEndExpanded = (_: any, info: PanInfo) => {
    const swipedLeft = info.offset.x < -75;
    const swipedRight = info.offset.x > 75;

    if (swipedLeft && canGoNext && onNextTrack) {
      onNextTrack();
    } else if (swipedRight && canGoPrev && onPrevTrack) {
      onPrevTrack();
    }
    // For disabled states, the dragConstraints will naturally spring back to 0
    // The grayed-out icons provide visual feedback that the action is not available
  };

  // Handle vertical drag for expand/collapse
  const yDrag = useMotionValue(0);

  // Drag Transforms for Hinting Transitions
  // Expanded: Drag Down (>0) -> Hint Minimize (Blur out, Scale down, Fade out)
  // Expanded: Drag Up (<0) -> Blur Content (Elastic over-drag)
  const expandedDragBlur = useTransform(yDrag, [-50, 0, 200], ["5px", "0px", "10px"]);
  const expandedDragOpacity = useTransform(yDrag, [0, 150], [1, 0.5]);
  const expandedDragScale = useTransform(yDrag, [0, 200], [1, 0.95]);

  // Minimized: Drag Up (<0) -> Hint Expand (Scale up?)
  const minimizedDragScale = useTransform(yDrag, [-100, 0], [1.05, 1]);
  const minimizedDragBlur = useTransform(yDrag, [-100, 0], ["0px", "0px"]);
  // User asked for "hint upcoming transition" for minimized dragging up.
  // Expanding implies content growing. scaling up 1 -> 1.05 hints that.

  // Create blur filter template at top-level (hooks must be called unconditionally)
  const expandedDragBlurFilter = useMotionTemplate`blur(${expandedDragBlur})`;

  const handleVerticalDragEnd = (_: any, info: PanInfo) => {
    if (isExpanded) {
      // If dragged down significantly, collapse
      if (info.offset.y > 50 || info.velocity.y > 300) {
        setIsExpanded(false);
      }
    } else {
      // If dragged up significantly, expand
      if (info.offset.y < -30 || info.velocity.y < -200) {
        setIsExpanded(true);
      }
    }
  };

  // Unified container - always present, morphs between states
  return (
    <motion.div
      layout
      initial={false}
      transition={{
        layout: {
          type: 'spring',
          damping: 30,
          stiffness: 400,
          mass: 0.5
        }
      }}
      drag="y"
      dragDirectionLock
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleVerticalDragEnd}
      className="absolute bottom-0 left-0 right-0 z-[70] bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.15)] rounded-t-[2.5rem] overflow-hidden"
      style={{
        y: yDrag,
        paddingBottom: 'calc(200px + env(safe-area-inset-bottom, 0px))',
        marginBottom: '-200px'
      }}
    >


      {/* Content area with AnimatePresence for cross-fade */}
      <AnimatePresence initial={false}>
        {isExpanded ? (
          // Expanded content
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden w-full h-full"
          >
            <div className="absolute inset-0 bg-gray-100 rounded-t-[2.5rem] flex items-center justify-between px-8">
              {/* Left Icon (Previous) - Visible when dragging Right */}
              <motion.div
                style={{ opacity: opacityPrevExpanded, scale: scalePrevExpanded }}
                className={`flex items-center ${canGoPrev ? 'text-gray-800' : 'text-gray-400'}`}
              >
                {canGoPrev ? (
                  <SkipBack size={28} fill="currentColor" className="opacity-90" />
                ) : (
                  <X size={28} className="opacity-40" />
                )}
              </motion.div>

              {/* Right Icon (Next) - Visible when dragging Left */}
              <motion.div
                style={{ opacity: opacityNextExpanded, scale: scaleNextExpanded }}
                className={`flex items-center ${canGoNext ? 'text-gray-800' : 'text-gray-400'}`}
              >
                {canGoNext ? (
                  <SkipForward size={28} fill="currentColor" className="opacity-90" />
                ) : (
                  <X size={28} className="opacity-40" />
                )}
              </motion.div>
            </div>

            {/* Draggable Foreground Content */}
            <motion.div
              style={{ x: xExpanded, boxShadow: boxShadowExpanded }}
              drag="x"
              dragDirectionLock
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragStart={handleDragStart}
              onDrag={(e, info) => handleDrag(e, info, !!canGoNext, !!canGoPrev)}
              onDragEnd={handleDragEndExpanded}
              className="bg-white relative rounded-t-[2.5rem]"
            >
              <motion.div
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                style={{ x: xHandleExpanded }}
                className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none relative z-20"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </motion.div>

              {/* Drag-Reactive Content Wrapper (Excludes Handle) */}
              <motion.div style={{ filter: expandedDragBlurFilter, opacity: expandedDragOpacity, scale: expandedDragScale }}>
                <div className="pt-4 pb-6">
                  {/* Controls Row */}
                  <div className="flex items-center justify-center gap-4 mb-1">
                    {/* Skip Back Button */}
                    <SkipButton
                      direction="backward"
                      onClick={onRewind}
                      seconds={15}
                      className="w-14 h-14"
                    >
                      <BackwardIcon size={32} className="ml-1 mb-0.5" />
                    </SkipButton>

                    {/* Main Play/Pause Button with Progress Ring */}
                    <div className="relative flex items-center justify-center" style={{ width: 64, height: 64 }}>
                      {/* Progress Ring */}
                      {!isTransitioning && (
                        <ProgressRing
                          progress={visualProgress}
                          size={64}
                          strokeWidth={3}
                          color="#22BD53"
                          backgroundColor="#dddddd"
                        />
                      )}

                      <PlayPauseButton
                        isPlaying={isPlaying}
                        isCompleting={isCompleting}
                        onClick={onTogglePlay}
                        size="expanded"
                        buttonVariants={buttonVariants}
                      />
                    </div>

                    {/* Skip Forward Button */}
                    <SkipButton
                      direction="forward"
                      onClick={onForward}
                      seconds={15}
                      className="w-14 h-14"
                    >
                      <ForwardIcon size={32} className="mr-1 mb-0.5" />
                    </SkipButton>
                  </div>

                  {/* Object Name Label */}
                  <motion.div
                    variants={contentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="text-center cursor-pointer"
                    onClick={onClick}
                  >
                    <div ref={containerRef} className="overflow-hidden leading-tight">
                      <motion.span
                        ref={titleRef}
                        animate={controls}
                        className="font text-md text-gray-600 whitespace-nowrap inline-block leading-none pb-0.5"
                      >
                        {currentStop.title}
                      </motion.span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          // Minimized content
          <motion.div
            key="minimized"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            {/* Background Swipe Actions Layer */}
            <div className="absolute inset-0 bg-gray-100 rounded-t-[2.5rem] flex items-center justify-between px-8">
              {/* Left Icon (Previous) - Visible when dragging Right */}
              <motion.div
                style={{ opacity: opacityPrev, scale: scalePrev }}
                className={`flex items-center ${canGoPrev ? 'text-gray-800' : 'text-gray-400'}`}
              >
                {canGoPrev ? (
                  <SkipBack size={24} fill="currentColor" className="opacity-90" />
                ) : (
                  <X size={24} className="opacity-40" />
                )}
              </motion.div>

              {/* Right Icon (Next) - Visible when dragging Left */}
              <motion.div
                style={{ opacity: opacityNext, scale: scaleNext }}
                className={`flex items-center ${canGoNext ? 'text-gray-800' : 'text-gray-400'}`}
              >
                {canGoNext ? (
                  <SkipForward size={24} fill="currentColor" className="opacity-90" />
                ) : (
                  <X size={24} className="opacity-40" />
                )}
              </motion.div>
            </div>

            {/* Draggable Foreground Card */}
            <motion.div
              style={{ x, boxShadow }}
              drag="x"
              dragDirectionLock
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragStart={handleDragStart}
              onDrag={(e, info) => handleDrag(e, info, !!canGoNext, !!canGoPrev)}
              onDragEnd={handleDragEnd}
              className="bg-white flex items-center justify-between gap-3 relative rounded-t-[2.5rem]"
            >
              {/* Handle bar absolute at top - counter-animated */}
              <motion.div
                style={{ x: xHandle }}
                className="absolute top-0 left-0 right-0 flex justify-center pt-3 cursor-grab active:cursor-grabbing touch-none z-10"
                onClick={() => setIsExpanded(true)}
              >
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </motion.div>

              <div className="flex items-center flex-1 min-w-0 px-8 py-2 pt-4 gap-3">
                {/* Drag-Reactive Content Wrapper (Excludes Handle) - Hints expansion on drag up */}
                <motion.div className="flex items-center flex-1 min-w-0 gap-3" style={{ scale: minimizedDragScale }}>
                  {/* Expandable area - title */}
                  <motion.div
                    variants={contentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    onClick={() => setIsExpanded(true)}
                    className="flex items-center flex-1 min-w-0 cursor-pointer"
                  >
                    <span className="font-normal text-md text-gray-800 truncate">{currentStop.title}</span>
                  </motion.div>

                  {/* Play/Pause button - functional */}
                  <PlayPauseButton
                    isPlaying={isPlaying}
                    onClick={onTogglePlay}
                    size="sm"
                    variant="mini"
                    buttonVariants={buttonVariants}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence >
    </motion.div >
  );
};