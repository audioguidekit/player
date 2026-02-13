import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, animate as animateValue, PanInfo } from 'framer-motion';
import { XIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { RichText } from './RichText';

export interface GalleryItem {
  src: string;
  alt?: string;
  caption?: string;
  credit?: string;
}

interface ImageLightboxProps {
  isOpen: boolean;
  src?: string;
  alt?: string;
  caption?: string;
  credit?: string;
  images?: GalleryItem[];
  initialIndex?: number;
  onClose: () => void;
  sourceRect?: { top: number; left: number; width: number; height: number };
}

const DISMISS_DISTANCE = 150;
const DISMISS_VELOCITY = 500;
const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY = 300;
const PINCH_SCALE_MIN = 1;
const PINCH_SCALE_MAX = 4;
const PINCH_SNAP_BACK_THRESHOLD = 1.15;

const backdropSpring = { type: 'spring' as const, damping: 30, stiffness: 300, mass: 0.8 };
const imageSpring = { type: 'spring' as const, damping: 25, stiffness: 200 };
// iOS-like ease curve for hero zoom in/out
const heroTransition = { duration: 0.35, ease: [0.32, 0.72, 0, 1] };

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, y: 0, scale: 1, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
};

/** Compute transform to position the lightbox image at the source element's rect (used for entry) */
const computeHeroEntry = (rect: { top: number; left: number; width: number; height: number }) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    x: (rect.left + rect.width / 2) - vw / 2,
    y: (rect.top + rect.height / 2) - vh / 2,
    scale: Math.min(Math.max(rect.width / (vw * 0.9), rect.height / (vh * 0.75)), 1),
  };
};

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  src,
  alt,
  caption,
  credit,
  images,
  initialIndex = 0,
  onClose,
  sourceRect,
}) => {
  const slides = useMemo(() => {
    if (images && images.length > 0) {
      return images.map((img) => ({
        src: img.src,
        alt: img.alt,
        caption: img.caption,
        credit: img.credit,
      }));
    }
    if (src) {
      return [{ src, alt, caption, credit }];
    }
    return [];
  }, [images, src, alt, caption, credit]);

  const [navIndex, setNavIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const isGallery = slides.length > 1;

  // Track drag to distinguish taps from drags
  const wasDraggingRef = React.useRef(false);
  // Ref on the image element for measuring actual rendered size on exit
  const imageRef = React.useRef<HTMLImageElement>(null);

  // Hero zoom transform — computed once when lightbox opens with a sourceRect
  let entryTransform: { x: number; y: number; scale: number } | null = null;

  // Store sourceRect for exit animation (persists across renders while open)
  const exitRectRef = React.useRef<{ top: number; left: number; width: number; height: number } | null>(null);

  // Reset state when opening
  const prevOpenRef = React.useRef(false);
  let justOpened = false;
  if (isOpen && !prevOpenRef.current) {
    justOpened = true;
    if (navIndex !== initialIndex) {
      setNavIndex(initialIndex);
    }
    setShowControls(false);
    if (sourceRect) {
      entryTransform = computeHeroEntry(sourceRect);
      exitRectRef.current = sourceRect;
    } else {
      exitRectRef.current = null;
    }
  }
  prevOpenRef.current = isOpen;

  /** Compute exit transform using measured image size for accurate scale */
  const getExitProps = () => {
    const rect = exitRectRef.current;
    if (!rect) return { scale: 0.9, opacity: 0 };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Use actual rendered width for accurate scale (falls back to approximation)
    const imgEl = imageRef.current;
    const renderedWidth = imgEl ? imgEl.clientWidth : vw * 0.9;
    return {
      x: (rect.left + rect.width / 2) - vw / 2,
      y: (rect.top + rect.height / 2) - vh / 2,
      scale: rect.width / renderedWidth,
      opacity: 1, // Stay opaque — backdrop handles the visual fade
    };
  };

  const isHeroExit = !!exitRectRef.current;

  // Hide controls immediately when lightbox starts closing so they don't
  // linger over the app UI after the backdrop/image have faded.
  useEffect(() => {
    if (!isOpen) setShowControls(false);
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (isGallery && e.key === 'ArrowRight') {
        if (navIndex < slides.length - 1) {
          setDirection(1);
          setNavIndex((i) => i + 1);
        }
      } else if (isGallery && e.key === 'ArrowLeft') {
        if (navIndex > 0) {
          setDirection(-1);
          setNavIndex((i) => i - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isGallery, navIndex, slides.length, onClose]);

  const goNext = useCallback(() => {
    if (navIndex < slides.length - 1) {
      setDirection(1);
      setNavIndex((i) => i + 1);
    }
  }, [navIndex, slides.length]);

  const goPrev = useCallback(() => {
    if (navIndex > 0) {
      setDirection(-1);
      setNavIndex((i) => i - 1);
    }
  }, [navIndex]);

  // --- Single-image drag (free drag, any direction dismisses) ---
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const dragDistance = useTransform([dragX, dragY], ([x, y]: number[]) =>
    Math.sqrt(x * x + y * y)
  );
  const singleBackdropOpacity = useTransform(dragDistance, [0, 300], [0.92, 0.3]);
  const singleImageScale = useTransform(dragDistance, [0, 300], [1, 0.85]);

  // Pinch-to-zoom (touch only)
  const pinchScale = useMotionValue(1);
  const pinchPanX = useMotionValue(0);
  const pinchPanY = useMotionValue(0);
  const pinchInitialRef = React.useRef<{
    distance: number;
    centerX: number;
    centerY: number;
    scale: number;
    panX: number;
    panY: number;
  } | null>(null);

  const handleDragStart = useCallback(() => {
    wasDraggingRef.current = true;
  }, []);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const distance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
    const velocity = Math.sqrt(info.velocity.x ** 2 + info.velocity.y ** 2);
    if (distance > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) {
      onClose();
    }
  }, [onClose]);

  // Toggle controls on tap (not drag)
  const handleImageClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    setShowControls((v) => !v);
  }, []);

  // Pinch-to-zoom touch handlers (2 fingers)
  const getPinchState = useCallback((touches: TouchList) => {
    const a = touches[0];
    const b = touches[1];
    return {
      centerX: (a.clientX + b.clientX) / 2,
      centerY: (a.clientY + b.clientY) / 2,
      distance: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY),
    };
  }, []);

  const handlePinchTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
        const { centerX, centerY, distance } = getPinchState(e.touches);
        pinchInitialRef.current = {
          distance,
          centerX,
          centerY,
          scale: pinchScale.get(),
          panX: pinchPanX.get(),
          panY: pinchPanY.get(),
        };
      }
    },
    [getPinchState, pinchScale, pinchPanX, pinchPanY]
  );

  const handlePinchTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length >= 2 && pinchInitialRef.current) {
        e.preventDefault();
        const initial = pinchInitialRef.current;
        const { centerX, centerY, distance } = getPinchState(e.touches);
        const scaleDelta = distance / initial.distance;
        let newScale = initial.scale * scaleDelta;
        newScale = Math.max(PINCH_SCALE_MIN, Math.min(PINCH_SCALE_MAX, newScale));
        const imagePointX = (initial.centerX - initial.panX) / initial.scale;
        const imagePointY = (initial.centerY - initial.panY) / initial.scale;
        const newPanX = centerX - imagePointX * newScale;
        const newPanY = centerY - imagePointY * newScale;
        pinchScale.set(newScale);
        pinchPanX.set(newPanX);
        pinchPanY.set(newPanY);
      }
    },
    [getPinchState, pinchScale, pinchPanX, pinchPanY]
  );

  const handlePinchTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length < 2) {
        pinchInitialRef.current = null;
        const scale = pinchScale.get();
        if (scale < PINCH_SNAP_BACK_THRESHOLD) {
          animateValue(pinchScale, 1, imageSpring);
          animateValue(pinchPanX, 0, imageSpring);
          animateValue(pinchPanY, 0, imageSpring);
        }
      }
    },
    [pinchScale, pinchPanX, pinchPanY]
  );

  // --- Gallery drag (direction-locked: vertical=dismiss, horizontal=navigate) ---
  const dismissProgress = useMotionValue(0);
  const galleryBackdropOpacity = useTransform(dismissProgress, [0, 300], [0.92, 0.3]);
  const galleryImageScale = useTransform(dismissProgress, [0, 300], [1, 0.85]);

  // Reset drag and pinch motion values when lightbox reopens (clears stale position from previous dismiss)
  if (justOpened) {
    dragX.set(0);
    dragY.set(0);
    dismissProgress.set(0);
    pinchScale.set(1);
    pinchPanX.set(0);
    pinchPanY.set(0);
    pinchInitialRef.current = null;
  }

  // Reset dismiss progress and pinch zoom on slide change
  useEffect(() => {
    dismissProgress.set(0);
    pinchScale.set(1);
    pinchPanX.set(0);
    pinchPanY.set(0);
    pinchInitialRef.current = null;
  }, [navIndex, dismissProgress, pinchScale, pinchPanX, pinchPanY]);

  const handleGalleryDrag = useCallback((_: any, info: PanInfo) => {
    dismissProgress.set(Math.abs(info.offset.y));
  }, [dismissProgress]);

  const handleGalleryDragEnd = useCallback((_: any, info: PanInfo) => {
    const absX = Math.abs(info.offset.x);
    const absY = Math.abs(info.offset.y);

    // Vertical dismiss
    if (absY > absX) {
      const velocity = Math.abs(info.velocity.y);
      if (absY > DISMISS_DISTANCE || velocity > DISMISS_VELOCITY) {
        onClose();
        return;
      }
    }

    // Horizontal navigation
    if (absX > absY) {
      if ((info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -SWIPE_VELOCITY) && navIndex < slides.length - 1) {
        setDirection(1);
        setNavIndex((i) => i + 1);
        return;
      } else if ((info.offset.x > SWIPE_THRESHOLD || info.velocity.x > SWIPE_VELOCITY) && navIndex > 0) {
        setDirection(-1);
        setNavIndex((i) => i - 1);
        return;
      }
    }

    // No navigation/dismiss — animate backdrop back smoothly
    animateValue(dismissProgress, 0, { type: 'spring', damping: 25, stiffness: 200 });
  }, [navIndex, slides.length, onClose, dismissProgress]);

  if (slides.length === 0) return null;

  const currentSlide = slides[navIndex] || slides[0];

  // Outer container transition: hero exit matches image animation duration
  // so everything fades together while the image zooms back to thumbnail
  const outerTransition = entryTransform
    ? { duration: 0.3, ease: [0.32, 0.72, 0, 1] }       // hero entry: normal fade-in
    : isHeroExit
      ? { duration: 0.35 }                                 // hero exit: match heroTransition duration
      : { duration: 0.2 };                                  // non-hero: simple fade

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={outerTransition}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'none',
          }}
          onClick={() => {
            if (showControls) {
              onClose();
            } else {
              setShowControls(true);
            }
          }}
        >
          {/* Backdrop — outer div handles entry/exit fade, inner div handles drag-based opacity.
              Separated to avoid MotionValue in style conflicting with AnimatePresence animate/exit. */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <motion.div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
                opacity: isGallery ? galleryBackdropOpacity : singleBackdropOpacity,
              }}
            />
          </motion.div>

          {/* Controls — hidden by default, toggle on image tap */}
          <AnimatePresence>
            {showControls && (
              <>
                {/* Close button */}
                <motion.button
                  key="close-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.4)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    padding: 0,
                  }}
                  aria-label="Close"
                >
                  <XIcon size={22} weight="bold" />
                </motion.button>

                {/* Gallery counter */}
                {isGallery && (
                  <motion.div
                    key="counter"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: 20,
                      left: 20,
                      zIndex: 10,
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.875rem',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {navIndex + 1} / {slides.length}
                  </motion.div>
                )}

                {/* Gallery arrows */}
                {isGallery && navIndex > 0 && (
                  <motion.button
                    key="prev-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                      background: 'rgba(0,0,0,0.4)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'white',
                      padding: 0,
                    }}
                    aria-label="Previous"
                  >
                    <CaretLeftIcon size={22} weight="bold" />
                  </motion.button>
                )}
                {isGallery && navIndex < slides.length - 1 && (
                  <motion.button
                    key="next-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                      background: 'rgba(0,0,0,0.4)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'white',
                      padding: 0,
                    }}
                    aria-label="Next"
                  >
                    <CaretRightIcon size={22} weight="bold" />
                  </motion.button>
                )}
              </>
            )}
          </AnimatePresence>

          {/* Image */}
          {isGallery ? (
            <div
              style={{ display: 'inline-flex', touchAction: 'none' }}
              onTouchStart={handlePinchTouchStart}
              onTouchMove={handlePinchTouchMove}
              onTouchEnd={handlePinchTouchEnd}
            >
              <motion.div
                style={{
                  scale: pinchScale,
                  x: pinchPanX,
                  y: pinchPanY,
                  transformOrigin: 'center center',
                }}
              >
                <AnimatePresence mode="popLayout" initial={!!entryTransform} custom={direction}>
                  <motion.img
                    key={navIndex}
                    ref={imageRef}
                    custom={direction}
                    variants={slideVariants}
                    initial={entryTransform ? { ...entryTransform, opacity: 1 } : "enter"}
                    animate="center"
                    exit="exit"
                    transition={entryTransform ? heroTransition : imageSpring}
                    src={currentSlide.src}
                    alt={currentSlide.alt || ''}
                    drag
                    dragDirectionLock
                    dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                    dragElastic={0.9}
                    onDragStart={handleDragStart}
                    onDrag={handleGalleryDrag}
                    onDragEnd={handleGalleryDragEnd}
                    onClick={handleImageClick}
                    style={{
                      maxWidth: '90vw',
                      maxHeight: '75vh',
                      objectFit: 'contain',
                      borderRadius: 8,
                      cursor: 'grab',
                      userSelect: 'none',
                      zIndex: 1,
                      scale: galleryImageScale,
                    }}
                    draggable={false}
                  />
                </AnimatePresence>
              </motion.div>
            </div>
          ) : (
            <div
              style={{ display: 'inline-flex', touchAction: 'none' }}
              onTouchStart={handlePinchTouchStart}
              onTouchMove={handlePinchTouchMove}
              onTouchEnd={handlePinchTouchEnd}
            >
              <motion.div
                style={{
                  scale: pinchScale,
                  x: pinchPanX,
                  y: pinchPanY,
                  transformOrigin: 'center center',
                }}
              >
                <motion.img
                  key="single-image"
                  ref={imageRef}
                  initial={entryTransform ? { ...entryTransform, opacity: 1 } : { scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                  exit={getExitProps()}
                  transition={isHeroExit || entryTransform ? heroTransition : backdropSpring}
                  src={currentSlide.src}
                  alt={currentSlide.alt || ''}
                  drag
                  dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
                  dragElastic={0.9}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onClick={handleImageClick}
                  style={{
                    maxWidth: '90vw',
                    maxHeight: '75vh',
                    objectFit: 'contain',
                    borderRadius: 8,
                    cursor: 'grab',
                    userSelect: 'none',
                    zIndex: 1,
                    scale: singleImageScale,
                    x: dragX,
                    y: dragY,
                  }}
                  draggable={false}
                />
              </motion.div>
            </div>
          )}

          {/* Caption/Credit footer */}
          {(currentSlide.caption || currentSlide.credit) && (
            <motion.div
              key={`footer-${navIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '12px 24px',
                paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
                textAlign: 'center',
                zIndex: 2,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {currentSlide.caption && (
                <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                  <RichText content={currentSlide.caption} />
                </p>
              )}
              {currentSlide.credit && (
                <p style={{ fontSize: '0.75rem', fontStyle: 'italic', marginTop: 4, color: 'rgba(255,255,255,0.5)', margin: currentSlide.caption ? '4px 0 0' : 0 }}>
                  <RichText content={currentSlide.credit} />
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
