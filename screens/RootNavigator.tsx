import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import App from '../App';
import { TourSelection } from './TourSelection';
import { MobileFrame } from '../components/shared/MobileFrame';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { getAvailableTourIds } from '../src/services/tourDiscovery';

/**
 * iOS-style push/pop navigation between the tour selection list (base layer)
 * and the selected tour (sliding overlay).
 *
 * Both screens stay mounted while a tour is open so the parallax depth effect
 * and the interactive edge-swipe back gesture can move them together. A single
 * `progress` motion value (0 = tour centered/open, 1 = list/tour off-screen)
 * drives everything; only `transform` and `opacity` are animated.
 *
 *   progress   overlay X    base X        meaning
 *   0          0%           -30%          tour fully open
 *   1          100%         0%            list, tour off the right edge
 */

// iOS-like ease-out curve and timing
const EASE = [0.32, 0.72, 0, 1] as const;
const DURATION = 0.34;
const PARALLAX = 0.3; // background moves 30% as far as the foreground
const VELOCITY_THRESHOLD = 800; // px/s to complete the back gesture
const EDGE_WIDTH = 28; // px hit-zone on the left edge for the back gesture

const layerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  willChange: 'transform',
};

export const RootNavigator: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isTour = location.pathname.startsWith('/tour/');
  // Only multi-tour apps have a list to slide to/from; single-tour apps open the
  // (only) tour instantly and have no back gesture.
  const canGoBack = getAvailableTourIds().length > 1;

  const containerRef = useRef<HTMLDivElement>(null);

  // 0 = tour open, 1 = list. Initialised to match the entry location.
  const progress = useMotionValue(isTour ? 0 : 1);
  const overlayX = useTransform(progress, [0, 1], ['0%', '100%']);
  const baseX = useTransform(progress, [0, 1], [`-${PARALLAX * 100}%`, '0%']);
  const dimOpacity = useTransform(progress, [0, 1], [0.08, 0]);
  const shadowOpacity = useTransform(progress, [0, 1], [1, 0]);

  const [overlayMounted, setOverlayMounted] = useState(isTour);

  // Feed the overlay's <Routes> a frozen tour location so the tour keeps
  // rendering during the pop animation, after the URL has already changed to '/'.
  const tourLocationRef = useRef(location);
  if (isTour) tourLocationRef.current = location;

  const firstRef = useRef(true);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  const stopAnim = useCallback(() => {
    animRef.current?.stop();
    animRef.current = null;
  }, []);

  // Orchestrate push / pop on the list <-> tour boundary. Deps are [isTour] only,
  // so same-level navigation (e.g. App's stop-URL replaces) never re-runs this.
  useEffect(() => {
    const first = firstRef.current;
    firstRef.current = false;
    stopAnim();

    if (isTour) {
      if (!overlayMounted) setOverlayMounted(true);
      // Instant (no slide) on the very first paint (deep links) and for
      // single-tour apps, which have no list to push from.
      if (first || !canGoBack) {
        progress.set(0);
      } else {
        progress.set(1);
        animRef.current = animate(progress, 0, { duration: DURATION, ease: EASE });
      }
    } else if (overlayMounted) {
      if (!canGoBack) {
        progress.set(1);
        setOverlayMounted(false);
      } else {
        animRef.current = animate(progress, 1, {
          duration: DURATION,
          ease: EASE,
          onComplete: () => setOverlayMounted(false),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTour]);

  useEffect(() => () => stopAnim(), [stopAnim]);

  // ---- Interactive edge-swipe back gesture --------------------------------
  const gesture = useRef({ active: false, startX: 0, width: 1, lastX: 0, lastT: 0, v: 0 });

  const onPointerMove = useCallback((e: PointerEvent) => {
    const g = gesture.current;
    if (!g.active) return;
    const dx = Math.max(0, e.clientX - g.startX);
    progress.set(Math.min(1, dx / g.width));
    // Sample velocity over a small time window so near-zero dt (coalesced /
    // high-frequency pointer events) can't fabricate a huge spurious velocity.
    const now = performance.now();
    const dt = now - g.lastT;
    if (dt >= 5) {
      g.v = ((e.clientX - g.lastX) / dt) * 1000;
      g.lastX = e.clientX;
      g.lastT = now;
    }
  }, [progress]);

  const onPointerUp = useCallback(() => {
    const g = gesture.current;
    if (!g.active) return;
    g.active = false;
    window.removeEventListener('pointermove', onPointerMove);
    const complete = progress.get() > 0.5 || g.v > VELOCITY_THRESHOLD;
    if (complete) {
      // Hand off to the pop effect, which finishes the slide and unmounts.
      navigate('/');
    } else {
      stopAnim();
      animRef.current = animate(progress, 0, { duration: DURATION, ease: EASE });
    }
  }, [navigate, onPointerMove, progress, stopAnim]);

  const onEdgePointerDown = useCallback((e: React.PointerEvent) => {
    if (!canGoBack) return;
    stopAnim();
    const width = containerRef.current?.clientWidth || window.innerWidth || 1;
    gesture.current = {
      active: true,
      startX: e.clientX,
      width,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
  }, [canGoBack, onPointerMove, onPointerUp, stopAnim]);

  useEffect(() => () => {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  }, [onPointerMove, onPointerUp]);

  return (
    // A single shared device frame so the screens slide inside the masked
    // (overflow-hidden, rounded) phone on desktop — not the whole window.
    <ThemeProvider themeId="default-light">
      <MobileFrame>
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {/* Base layer: the tour selection list */}
          <motion.div style={{ ...layerStyle, x: baseX, zIndex: 1, pointerEvents: overlayMounted ? 'none' : 'auto' }}>
            <TourSelection frameless />
            {/* Subtle dim on the background during the transition for depth */}
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#000',
                opacity: dimOpacity,
                pointerEvents: 'none',
                zIndex: 50,
              }}
            />
          </motion.div>

          {/* Overlay layer: the selected tour */}
          {overlayMounted && (
            <motion.div style={{ ...layerStyle, x: overlayX, zIndex: 2 }}>
              {/* Left-edge drop shadow cast onto the list underneath */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: 24,
                  transform: 'translateX(-100%)',
                  background: 'linear-gradient(to left, rgba(0,0,0,0.18), rgba(0,0,0,0))',
                  opacity: shadowOpacity,
                  pointerEvents: 'none',
                  zIndex: 60,
                }}
              />
              <Routes location={tourLocationRef.current}>
                <Route path="/tour/:tourId/:stopId" element={<App frameless />} />
                <Route path="/tour/:tourId" element={<App frameless />} />
              </Routes>
              {/* Edge hit-zone for the interactive back gesture */}
              {canGoBack && (
                <div
                  onPointerDown={onEdgePointerDown}
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: EDGE_WIDTH,
                    zIndex: 65,
                    touchAction: 'pan-y',
                  }}
                />
              )}
            </motion.div>
          )}
        </div>
      </MobileFrame>
    </ThemeProvider>
  );
};
