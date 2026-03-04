import React, { useCallback } from 'react';
import tw from 'twin.macro';
import styled from 'styled-components';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus';
import L from 'leaflet';

interface MapZoomControlsProps {
  mapRef: React.RefObject<L.Map | null>;
}

const ZoomGroup = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const ZoomButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s;
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: none;

  &:first-child {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

export const MapZoomControls: React.FC<MapZoomControlsProps> = ({ mapRef }) => {
  const zoomIn  = useCallback(() => mapRef.current?.zoomIn(),  [mapRef]);
  const zoomOut = useCallback(() => mapRef.current?.zoomOut(), [mapRef]);

  return (
    <ZoomGroup>
      <ZoomButton onClick={zoomIn} aria-label="Zoom in">
        <PlusIcon size={18} weight="bold" />
      </ZoomButton>
      <ZoomButton onClick={zoomOut} aria-label="Zoom out">
        <MinusIcon size={18} weight="bold" />
      </ZoomButton>
    </ZoomGroup>
  );
};
