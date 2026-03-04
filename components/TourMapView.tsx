import React, { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import tw from 'twin.macro';
import styled, { useTheme } from 'styled-components';
import { Stop } from '../types';
import { getTileConfig, MapProvider } from '../src/utils/mapTileProvider';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { ThemeConfig } from '../src/theme/types';
import { MapZoomControls } from './map/MapZoomControls';
import { MapLocateButton, UserLocationLayer, useUserLocation } from './map/MapLocateButton';

interface TourMapViewProps {
  stops: Stop[];
  currentStopId: string | null;
  isPlaying: boolean;
  isStopCompleted: (stopId: string) => boolean;
  onStopClick: (stopId: string) => void;
  mapProvider?: MapProvider;
  mapApiKey?: string;
  onRequestListView?: () => void;
}

// ─── Styled components ────────────────────────────────────────────────────────

const MapWrapper = styled.div`
  ${tw`flex-1 w-full relative overflow-hidden`}
  height: 100%;
`;

const OfflinePlaceholder = styled.div`
  ${tw`flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center`}
  background-color: ${({ theme }) => theme.mainContent.backgroundColor};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: 14px;
  height: 100%;
`;

const OfflineTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ViewListButton = styled.button`
  ${tw`px-4 py-2 rounded-full text-sm font-medium transition-colors`}
  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border.light};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.tertiary};
  }
`;

const NoLocationsPlaceholder = styled.div`
  ${tw`flex-1 flex items-center justify-center`}
  background-color: ${({ theme }) => theme.mainContent.backgroundColor};
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-size: 14px;
  height: 100%;
`;

const ControlsOverlay = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

// ─── Internal sub-components (require MapContainer context) ───────────────────

const MapRefCapture: React.FC<{ mapRef: React.MutableRefObject<L.Map | null> }> = ({ mapRef }) => {
  const map = useMap();
  useEffect(() => { mapRef.current = map; }, [map, mapRef]);
  return null;
};

interface MapBoundsFitterProps {
  locations: Array<{ lat: number; lng: number }>;
}

const MapBoundsFitter: React.FC<MapBoundsFitterProps> = ({ locations }) => {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (hasFitted.current || locations.length === 0) return;
    hasFitted.current = true;

    if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 15);
    } else {
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
      map.fitBounds(bounds, { padding: [48, 48] });
    }
  }, [map, locations]);

  return null;
};

interface MapMarkersProps {
  stops: Stop[];
  currentStopId: string | null;
  isStopCompleted: (stopId: string) => boolean;
  onStopClick: (stopId: string) => void;
  theme: ThemeConfig;
}

const MapMarkers: React.FC<MapMarkersProps> = ({
  stops, currentStopId, isStopCompleted, onStopClick, theme,
}) => {
  const map = useMap();
  const markersRef = useRef<L.Marker[]>([]);

  const createIcon = useCallback(
    (stop: Stop, index: number): L.DivIcon => {
      const isActive = stop.id === currentStopId;
      const isCompleted = isStopCompleted(stop.id);
      const m = theme.mapMarkers ?? theme.stepIndicators;

      let bg: string, border: string, shadow: string, content: string;

      if (isCompleted) {
        bg = m.completed.backgroundColor;
        border = 'none';
        shadow = theme.mapMarkers?.active.shadow ?? '0 2px 6px rgba(0,0,0,0.25)';
        const c = m.completed.checkmarkColor;
        content = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="11" viewBox="0 0 10 8"><path d="M1 4L3.5 6.5L9 1" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
      } else if (isActive) {
        bg = m.active.backgroundColor;
        border = `3px solid ${m.active.outlineColor}`;
        shadow = theme.mapMarkers?.active.shadow ?? '0 2px 6px rgba(0,0,0,0.25)';
        const fs = theme.mapMarkers?.inactive.numberFontSize ?? '12px';
        const fw = theme.mapMarkers?.inactive.numberFontWeight ?? '700';
        content = `<span style="font-size:${fs};font-weight:${fw};color:${m.active.numberColor}">${index + 1}</span>`;
      } else {
        bg = m.inactive.backgroundColor;
        border = m.inactive.borderColor !== 'transparent' ? `2px solid ${m.inactive.borderColor}` : 'none';
        shadow = '0 2px 6px rgba(0,0,0,0.25)';
        const fs = theme.mapMarkers?.inactive.numberFontSize ?? '12px';
        const fw = theme.mapMarkers?.inactive.numberFontWeight ?? '600';
        content = `<span style="font-size:${fs};font-weight:${fw};color:${m.inactive.numberColor}">${index + 1}</span>`;
      }

      return L.divIcon({
        html: `<div style="width:32px;height:32px;border-radius:50%;background:${bg};border:${border};display:flex;align-items:center;justify-content:center;box-shadow:${shadow};cursor:pointer;box-sizing:border-box">${content}</div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    },
    [currentStopId, isStopCompleted, theme]
  );

  useEffect(() => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    let audioIndex = 0;
    stops.forEach(stop => {
      if (stop.type === 'audio') {
        const idx = audioIndex++;
        if (!stop.location) return;
        const marker = L.marker([stop.location.lat, stop.location.lng], { icon: createIcon(stop, idx) });
        marker.on('click', () => onStopClick(stop.id));
        marker.addTo(map);
        markersRef.current.push(marker);
      }
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
    };
  }, [map, stops, createIcon, onStopClick]);

  return null;
};

// ─── Main component ───────────────────────────────────────────────────────────

export const TourMapView: React.FC<TourMapViewProps> = ({
  stops,
  currentStopId,
  isPlaying,
  isStopCompleted,
  onStopClick,
  mapProvider = 'openstreetmap',
  mapApiKey,
  onRequestListView,
}) => {
  const theme = useTheme() as ThemeConfig;
  const isOnline = useOnlineStatus();
  const tileConfig = getTileConfig(mapProvider, mapApiKey);
  const mapRef = useRef<L.Map | null>(null);

  const {
    locateState,
    userLocation,
    shouldCenter,
    handleLocate,
    handleCentered,
    handleUserMoved,
  } = useUserLocation();

  const locations = stops
    .filter(s => s.type === 'audio' && s.location != null)
    .map(s => s.location!);

  if (!isOnline) {
    return (
      <OfflinePlaceholder>
        <OfflineTitle>Map unavailable offline</OfflineTitle>
        <div>Map tiles require an internet connection.</div>
        {onRequestListView && (
          <ViewListButton onClick={onRequestListView}>View list</ViewListButton>
        )}
      </OfflinePlaceholder>
    );
  }

  if (locations.length === 0) {
    return (
      <NoLocationsPlaceholder>No stops have GPS coordinates</NoLocationsPlaceholder>
    );
  }

  const defaultCenter: [number, number] = [locations[0].lat, locations[0].lng];

  return (
    <MapWrapper>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        style={{ height: '100%', width: '100%', background: theme.mainContent.backgroundColor }}
        zoomControl={false}
      >
        <TileLayer
          url={tileConfig.url}
          attribution={tileConfig.attribution}
          maxZoom={tileConfig.maxZoom}
        />
        <MapRefCapture mapRef={mapRef} />
        <MapBoundsFitter locations={locations} />
        <MapMarkers
          stops={stops}
          currentStopId={currentStopId}
          isStopCompleted={isStopCompleted}
          onStopClick={onStopClick}
          theme={theme}
        />
        <UserLocationLayer
          position={userLocation}
          shouldCenter={shouldCenter}
          onCentered={handleCentered}
          onUserMoved={handleUserMoved}
        />
      </MapContainer>

      <ControlsOverlay>
        <MapZoomControls mapRef={mapRef} />
        <MapLocateButton
          locateState={locateState}
          onLocate={() => handleLocate(locateState, userLocation)}
        />
      </ControlsOverlay>
    </MapWrapper>
  );
};
