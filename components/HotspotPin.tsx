import React, { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import tw from 'twin.macro';
import styled, { keyframes } from 'styled-components';
import { RichText } from './RichText';

interface HotspotPinProps {
  x: number;
  y: number;
  title: string;
  description?: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(3.3); opacity: 0; }
`;

const PinContainer = styled.div<{ $x: number; $y: number; $isOpen: boolean }>`
  ${tw`absolute`}
  left: ${({ $x }) => $x}%;
  top: ${({ $y }) => $y}%;
  z-index: ${({ $isOpen }) => $isOpen ? 30 : 10};
`;

const PinDot = styled.button`
  ${tw`w-5 h-5 rounded-full border-2 cursor-pointer relative`}
  transform: translate(-50%, -50%);
  background-color: ${({ theme }) => theme.hotspot.pinColor};
  border-color: rgba(0, 0, 0, 0.3);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);

  &::after {
    content: '';
    ${tw`absolute inset-0 rounded-full`}
    z-index: -1;
    background-color: ${({ theme }) => theme.hotspot.pinPulseColor};
    animation: ${pulse} 2s ease-out infinite;
  }
`;

const Popover = styled.div`
  ${tw`absolute p-3 rounded-lg`}
  width: 200px;
  background-color: ${({ theme }) => theme.tooltip.backgroundColor};
  border: 1px solid ${({ theme }) => theme.tooltip.borderColor};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const PopoverTitle = styled.div`
  ${tw`text-sm font-semibold mb-1`}
  color: ${({ theme }) => theme.tooltip.textColor};
`;

const PopoverDescription = styled.div`
  ${tw`text-xs leading-relaxed`}
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const HotspotPin: React.FC<HotspotPinProps> = ({
  x, y, title, description, isOpen, onToggle, onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({ top: 16, left: -10 });

  // Position popover so it stays within the ImageWrapper (parent with position: relative)
  useLayoutEffect(() => {
    if (!isOpen) return;
    const popover = popoverRef.current;
    const pin = containerRef.current;
    if (!popover || !pin) return;

    const wrapper = pin.parentElement;
    if (!wrapper) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();

    const pinRelX = pinRect.left - wrapperRect.left;
    const pinRelY = pinRect.top - wrapperRect.top;
    const popW = popover.offsetWidth;
    const popH = popover.offsetHeight;
    const gap = 16;

    // Vertical: prefer below, flip above if not enough room
    let top: number | undefined;
    let bottom: number | undefined;
    if (pinRelY + gap + popH <= wrapperRect.height) {
      top = gap;
    } else {
      bottom = gap;
    }

    // Horizontal: prefer right-aligned to pin, shift if overflows
    let left = -10;
    const popRight = pinRelX + left + popW;
    if (popRight > wrapperRect.width) {
      left = wrapperRect.width - pinRelX - popW;
    }
    if (pinRelX + left < 0) {
      left = -pinRelX;
    }

    setPopoverStyle({
      ...(top !== undefined ? { top } : { bottom }),
      left,
    });
  }, [isOpen, x, y]);

  // Click outside to close
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (isOpen && containerRef.current && !containerRef.current.contains(e.target as Node)) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      return () => document.removeEventListener('pointerdown', handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  return (
    <PinContainer ref={containerRef} $x={x} $y={y} $isOpen={isOpen}>
      <PinDot onClick={(e) => { e.stopPropagation(); onToggle(); }} aria-label={title} />
      {isOpen && (
        <Popover ref={popoverRef} style={popoverStyle}>
          <PopoverTitle>{title}</PopoverTitle>
          {description && (
            <PopoverDescription><RichText content={description} /></PopoverDescription>
          )}
        </Popover>
      )}
    </PinContainer>
  );
};
