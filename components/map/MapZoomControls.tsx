import React from 'react';
import styled from 'styled-components';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus';
import L from 'leaflet';
import { useMobilePress } from '../../src/hooks/useMobilePress';

interface MapZoomControlsProps {
  mapRef: React.RefObject<L.Map | null>;
}

const ZoomGroup = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const ZoomButton = styled.button`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;

  &:first-child {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.border.light};
    outline-offset: -2px;
  }
`;

export const MapZoomControls: React.FC<MapZoomControlsProps> = ({ mapRef }) => {
  const handlePress = useMobilePress();

  return (
    <ZoomGroup>
      <ZoomButton
        aria-label="Zoom in"
        onPointerDown={e => handlePress(e, () => mapRef.current?.zoomIn())}
      >
        <PlusIcon size={18} weight="bold" />
      </ZoomButton>
      <ZoomButton
        aria-label="Zoom out"
        onPointerDown={e => handlePress(e, () => mapRef.current?.zoomOut())}
      >
        <MinusIcon size={18} weight="bold" />
      </ZoomButton>
    </ZoomGroup>
  );
};
