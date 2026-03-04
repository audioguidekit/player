import React, { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import tw from 'twin.macro';
import styled, { useTheme } from 'styled-components';
import { Stop } from '../types';
import { getTileConfig, MapProvider } from '../src/utils/mapTileProvider';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { ThemeConfig } from '../src/theme/types';

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

// Sub-component: fits map bounds to markers on mount
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

// Sub-component: renders imperative Leaflet markers
interface MapMarkersProps {
  stops: Stop[];
  currentStopId: string | null;
  isStopCompleted: (stopId: string) => boolean;
  onStopClick: (stopId: string) => void;
  theme: ThemeConfig;
}

const MapMarkers: React.FC<MapMarkersProps> = ({
  stops,
  currentStopId,
  isStopCompleted,
  onStopClick,
  theme,
}) => {
  const map = useMap();
  const markersRef = useRef<L.Marker[]>([]);

  const createIcon = useCallback(
    (stop: Stop, index: number): L.DivIcon => {
      const isActive = stop.id === currentStopId;
      const isCompleted = isStopCompleted(stop.id);

      let bg: string;
      let border: string;
      let textColor: string;
      let content: string;

      if (isCompleted) {
        bg = theme.stepIndicators.completed.backgroundColor;
        border = 'none';
        textColor = theme.stepIndicators.completed.checkmarkColor;
        // Checkmark SVG
        content = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" fill="${textColor}"><path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/></svg>`;
      } else if (isActive) {
        bg = theme.stepIndicators.active.backgroundColor;
        border = `3px solid ${theme.stepIndicators.active.outlineColor}`;
        textColor = theme.stepIndicators.active.numberColor;
        content = `<span style="font-size:12px;font-weight:700;color:${textColor}">${index + 1}</span>`;
      } else {
        bg = theme.stepIndicators.inactive.backgroundColor;
        border = `2px solid ${theme.stepIndicators.inactive.borderColor}`;
        textColor = theme.stepIndicators.inactive.numberColor;
        content = `<span style="font-size:12px;font-weight:600;color:${textColor}">${index + 1}</span>`;
      }

      const html = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${bg};
          border: ${border};
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          cursor: pointer;
          box-sizing: border-box;
        ">${content}</div>
      `;

      return L.divIcon({
        html,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    },
    [currentStopId, isStopCompleted, theme]
  );

  useEffect(() => {
    // Remove existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    let audioIndex = 0;
    stops.forEach(stop => {
      if (stop.type === 'audio') {
        const idx = audioIndex++;
        if (!stop.location) return;

        const marker = L.marker([stop.location.lat, stop.location.lng], {
          icon: createIcon(stop, idx),
        });

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

  const mappableStops = stops.filter(
    s => s.type === 'audio' && s.location != null
  );
  const locations = mappableStops
    .map(s => s.location!)
    .filter(Boolean);

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
      <NoLocationsPlaceholder>
        No stops have GPS coordinates
      </NoLocationsPlaceholder>
    );
  }

  // Default center for initial render — bounds fitter will correct it
  const defaultCenter: [number, number] = [locations[0].lat, locations[0].lng];

  return (
    <MapWrapper>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url={tileConfig.url}
          attribution={tileConfig.attribution}
          maxZoom={tileConfig.maxZoom}
        />
        <MapBoundsFitter locations={locations} />
        <MapMarkers
          stops={stops}
          currentStopId={currentStopId}
          isStopCompleted={isStopCompleted}
          onStopClick={onStopClick}
          theme={theme}
        />
      </MapContainer>
    </MapWrapper>
  );
};
