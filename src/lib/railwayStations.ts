import stations from '../data/kerala_railway_stations.json';

export type Station = {
  code: string;
  name: string;
  place: string;
  lat: number;
  lon: number;
};

export function findNearbyStation(lat: number, lon: number, maxDistanceKm = 2): Station | null {
  function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  let closest: Station | null = null;
  let minDist = maxDistanceKm;
  for (const s of stations as Station[]) {
    const dist = haversine(lat, lon, s.lat, s.lon);
    if (dist <= minDist) {
      minDist = dist;
      closest = s;
    }
  }
  return closest;
}
