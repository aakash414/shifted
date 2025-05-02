// Utility to get lat/lon for a place name using Nominatim
export async function geocodePlace(place: string): Promise<{lat: number, lon: number} | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data && data[0]) {
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  }
  return null;
}
