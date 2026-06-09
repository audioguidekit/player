import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import tw from 'twin.macro';
import styled, { keyframes } from 'styled-components';

/**
 * Full-screen branding splash shown over the tour selection screen.
 *
 * Rendered through a portal to <body> as Backdrop → Mask → Card. On mobile the
 * Mask/Card are absolute inset-0 over the fixed Backdrop, so the image or video
 * bleeds edge-to-edge — including the notch and behind iOS Safari's translucent
 * floating toolbar — instead of being clipped by the device frame's safe-area
 * padding. On desktop the Backdrop flex-centers the Mask into the exact phone
 * mockup (400×844, rounded, overflow:hidden), mirroring MobileFrame — and the
 * Card's slide-left dismiss is clipped to that mask, so it disappears into the
 * frame edge rather than sliding over the desktop background. A "double arrow
 * button" hint (after manelroig's CodePen rJMVRO) nudges that tapping — or
 * swiping — continues to the picker. Configured via app.json `splash`.
 */

// "bounceAlpha" — the staggered pulse from the Double Arrow Button pen. Each
// chevron fades out as it slides forward, snaps back invisibly, then fades in at
// rest; the two arrows run with a delay offset so they chase each other.
const bounceAlpha = keyframes`
  0%   { opacity: 1; transform: translateX(0)     scale(1);   }
  25%  { opacity: 0; transform: translateX(10px)  scale(0.9); }
  26%  { opacity: 0; transform: translateX(-10px) scale(0.9); }
  55%  { opacity: 1; transform: translateX(0)     scale(1);   }
  100% { opacity: 1; transform: translateX(0)     scale(1);   }
`;

// Double-chevron (»), white fill — the inlined SVG from the pen's `.next` class.
const ARROW_SVG =
  'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+PHN0eWxlPi5zdDB7ZmlsbDojZmZmfTwvc3R5bGU+PHBhdGggY2xhc3M9InN0MCIgZD0iTTMxOS4xIDIxN2MyMC4yIDIwLjIgMTkuOSA1My4yLS42IDczLjdzLTUzLjUgMjAuOC03My43LjZsLTE5MC0xOTBjLTIwLjEtMjAuMi0xOS44LTUzLjIuNy03My43UzEwOSA2LjggMTI5LjEgMjdsMTkwIDE5MHoiLz48cGF0aCBjbGFzcz0ic3QwIiBkPSJNMzE5LjEgMjkwLjVjMjAuMi0yMC4yIDE5LjktNTMuMi0uNi03My43cy01My41LTIwLjgtNzMuNy0uNmwtMTkwIDE5MGMtMjAuMiAyMC4yLTE5LjkgNTMuMi42IDczLjdzNTMuNSAyMC44IDczLjcuNmwxOTAtMTkweiIvPjwvc3ZnPg==';

// Fixed full-window layer that positions the mask. Mirrors MobileFrame's
// OuterContainer so the desktop splash lands exactly inside the phone mockup:
// flex-centered with the same padding (NOT margin:auto, which top-pins and
// "escapes" the rounded mask when the window is shorter than the frame).
// Transparent + pointer-events:none on desktop so the chrome around the phone
// stays visible; the mask re-enables pointer events.
const Backdrop = styled.div`
  ${tw`fixed inset-0 flex items-center justify-center`}
  z-index: 50;

  @media (min-width: 768px) {
    padding: 2rem;
    pointer-events: none;
  }
`;

// Phone-frame-shaped clip region. Full-screen on mobile; the 400×844 rounded
// mockup on desktop (mirrors MobileFrame's InnerFrame). overflow:hidden is the
// point: the Card's slide-left drag/exit is clipped to the frame so it
// disappears *into the frame edge* rather than sliding over the desktop
// background unmasked.
const Mask = styled.div`
  ${tw`absolute inset-0 overflow-hidden`}

  @media (min-width: 768px) {
    position: relative;
    inset: auto;
    width: 400px;
    height: 844px;
    border-radius: 2.5rem;
    pointer-events: auto;
  }
`;

// The splash media itself; slides left to dismiss. Absolute inset-0 inside the
// Mask, so on mobile it's full-bleed (over the fixed Backdrop, covering the
// visual viewport incl. behind iOS Safari's toolbar) and on desktop it fills
// the rounded mask.
const Card = styled(motion.div)`
  ${tw`absolute inset-0 flex items-end justify-center cursor-pointer`}
  background-color: #000;
`;

const Media = styled.div`
  ${tw`absolute inset-0 pointer-events-none`}

  img,
  video {
    ${tw`absolute inset-0 w-full h-full`}
    object-fit: cover;
  }
`;

const Hint = styled.div`
  ${tw`relative`}
  /* Sit above the iOS home indicator / floating toolbar. */
  margin-bottom: calc(env(safe-area-inset-bottom, 0px) + 3.5rem);
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.55));
`;

// The circular button outline; the two chevrons animate inside it.
const Round = styled.div`
  ${tw`relative`}
  width: 56px;
  height: 56px;
  border: 2px solid #fff;
  border-radius: 100%;
`;

const Arrow = styled.div`
  ${tw`absolute`}
  top: 50%;
  left: 50%;
  width: 14px;
  height: 14px;
  margin-top: -7px;
  background: url(${ARROW_SVG}) no-repeat center / contain;
  animation: ${bounceAlpha} 1.4s linear infinite;

  &.first {
    margin-left: -10px;
  }
  &.second {
    margin-left: -2px;
    animation-delay: 0.2s;
  }
`;

const isVideo = (src: string) => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src);

interface SplashScreenProps {
  media: string;
  onDismiss: () => void;
  /** theme-color for the iOS status bar while the splash is up; restored on dismiss. */
  statusBarColor?: string;
  /** Slide in from the left (reverse of the dismiss) instead of appearing instantly. */
  slideIn?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  media,
  onDismiss,
  statusBarColor,
  slideIn = false,
}) => {
  // Tint the status bar to match the splash only while it's shown; on dismiss
  // restore whatever the picker set (its theme header color via ThemeColorSync).
  React.useEffect(() => {
    if (!statusBarColor) return;
    const meta = document.querySelector('meta[name="theme-color"]');
    const prev = meta?.getAttribute('content') ?? null;
    meta?.setAttribute('content', statusBarColor);
    return () => {
      if (meta && prev !== null) meta.setAttribute('content', prev);
    };
  }, [statusBarColor]);

  return createPortal(
    <Backdrop>
      <Mask>
        <Card
          onClick={onDismiss}
          role="button"
          aria-label="Swipe or tap to continue"
          drag="x"
          dragSnapToOrigin
          dragConstraints={{ right: 0 }}
          dragElastic={0.6}
          onDragEnd={(_, info) => {
            // Dismiss if dragged far enough left or flicked left; otherwise snap back.
            if (info.offset.x < -80 || info.velocity.x < -500) onDismiss();
          }}
          initial={slideIn ? { x: '-100%' } : { x: 0 }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
        >
          <Media>
            {isVideo(media) ? (
              <video src={media} autoPlay loop muted playsInline />
            ) : (
              <img src={media} alt="" />
            )}
          </Media>
          <Hint>
            <Round>
              <Arrow className="first" />
              <Arrow className="second" />
            </Round>
          </Hint>
        </Card>
      </Mask>
    </Backdrop>,
    document.body
  );
};
