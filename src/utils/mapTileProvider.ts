export type MapProvider = 'openstreetmap' | 'mapbox';

interface TileConfig {
  url: string;
  attribution: string;
  maxZoom: number;
}

export function getTileConfig(provider: MapProvider = 'openstreetmap', apiKey?: string): TileConfig {
  if (provider === 'mapbox' && apiKey) {
    return {
      url: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${apiKey}`,
      attribution: '© Mapbox © OpenStreetMap',
      maxZoom: 22,
    };
  }
  return {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  };
}
