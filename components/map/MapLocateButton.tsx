import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import styled from 'styled-components';
import { NavigationArrowIcon } from '@phosphor-icons/react/dist/csr/NavigationArrow';
import { GpsSlashIcon } from '@phosphor-icons/react/dist/csr/GpsSlash';

export type LocateState = 'idle' | 'locating' | 'following' | 'tracking' | 'error';

// ─── Button ───────────────────────────────────────────────────────────────────

const Button = styled.button<{ $following: boolean; $error: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
  background-color: ${({ theme }) => theme.colors.background.primary};
  color: ${({ $following, $error, theme }) =>
    $error     ? theme.status.error :
    $following ? theme.header.progressBar.highlightColor :
                 theme.colors.text.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.secondary};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

interface MapLocateButtonProps {
  locateState: LocateState;
  onLocate: () => void;
}

export const MapLocateButton: React.FC<MapLocateButtonProps> = ({ locateState, onLocate }) => {
  const isFollowing = locateState === 'following';
  const isError     = locateState === 'error';

  return (
    <Button
      onClick={onLocate}
      $following={isFollowing}
      $error={isError}
      aria-label="Show my location"
    >
      {isError
        ? <GpsSlashIcon size={18} weight="regular" />
        : <NavigationArrowIcon size={18} weight={isFollowing ? 'fill' : 'regular'} />
      }
    </Button>
  );
};

// ─── UserLocationLayer (must be inside MapContainer) ─────────────────────────

interface UserLocationLayerProps {
  position: { lat: number; lng: number } | null;
  shouldCenter: boolean;
  onCentered: () => void;
  onUserMoved: () => void;
  dotColor?: string;
  borderColor?: string;
}

export const UserLocationLayer: React.FC<UserLocationLayerProps> = ({
  position,
  shouldCenter,
  onCentered,
  onUserMoved,
  dotColor = '#3B82F6',
  borderColor = '#FFFFFF',
}) => {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);

  // Listen for user-initiated drag to disengage follow mode
  useEffect(() => {
    map.on('dragstart', onUserMoved);
    return () => { map.off('dragstart', onUserMoved); };
  }, [map, onUserMoved]);

  // Update / create the pulsing dot
  useEffect(() => {
    if (!position) {
      markerRef.current?.remove();
      markerRef.current = null;
      return;
    }

    const icon = L.divIcon({
      html: `
        <div style="position:relative;width:20px;height:20px">
          <div class="map-location-pulse" style="position:absolute;inset:0;border-radius:50%;background:${dotColor}"></div>
          <div style="position:absolute;inset:3px;border-radius:50%;background:${dotColor};border:2px solid ${borderColor};box-shadow:0 0 8px ${dotColor}99"></div>
        </div>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([position.lat, position.lng]);
      markerRef.current.setIcon(icon);
    } else {
      markerRef.current = L.marker([position.lat, position.lng], {
        icon,
        zIndexOffset: 500,
      }).addTo(map);
    }
  }, [map, position]);

  // Fly to user position when requested — immediately call onCentered so the
  // icon switches to filled without waiting for the animation to finish
  useEffect(() => {
    if (!shouldCenter || !position) return;
    map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 15), { duration: 0.8 });
    onCentered();
  }, [shouldCenter, position, map, onCentered]);

  useEffect(() => () => { markerRef.current?.remove(); }, []);

  return null;
};

// ─── useUserLocation hook ─────────────────────────────────────────────────────

export function useUserLocation() {
  const [locateState, setLocateState]     = useState<LocateState>('idle');
  const [userLocation, setUserLocation]   = useState<{ lat: number; lng: number } | null>(null);
  const [shouldCenter, setShouldCenter]   = useState(false);
  const watchIdRef     = useRef<number | null>(null);
  const isFirstFixRef  = useRef(true);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => () => stopWatching(), [stopWatching]);

  const handleLocate = useCallback((currentState: LocateState, currentLocation: { lat: number; lng: number } | null) => {
    if (!navigator.geolocation) {
      setLocateState('error');
      return;
    }

    // Already tracking — re-center and go back to following
    if ((currentState === 'following' || currentState === 'tracking') && currentLocation) {
      setShouldCenter(true);
      setLocateState('following');
      return;
    }

    // Retry after error or start fresh
    stopWatching();
    setLocateState('locating');
    isFirstFixRef.current = true;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        if (isFirstFixRef.current) {
          isFirstFixRef.current = false;
          setShouldCenter(true);
          setLocateState('following');
        }
      },
      () => {
        setLocateState('error');
        stopWatching();
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, [stopWatching]);

  // Called when map fly-to initiates (icon switches to filled immediately)
  const handleCentered = useCallback(() => {
    setShouldCenter(false);
    setLocateState('following');
  }, []);

  // Called when the user drags the map — disengage follow mode
  const handleUserMoved = useCallback(() => {
    setLocateState(prev => prev === 'following' ? 'tracking' : prev);
  }, []);

  return {
    locateState,
    userLocation,
    shouldCenter,
    handleLocate,
    handleCentered,
    handleUserMoved,
  };
}
