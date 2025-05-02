// Utility to get a smart public transport route using Gemini API
// Usage: await getRouteForSchool(origin, destination)

export type GeminiInstruction =
  | string
  | { step?: number; instruction: string; mode?: string; [key: string]: unknown };

export type GeminiRoute = {
  instructions: GeminiInstruction[];
  total_time: string;
  switches: number;
  walk_km: number;
  score: number;
};

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

import { geocodePlace } from './geocode';
import { findNearbyStation, Station } from './railwayStations';

// Gemini API rate limit: 15 requests/minute for free tier
// We'll use a simple queue to ensure we never exceed this
const GEMINI_RATE_LIMIT = 15; // per minute
const REQUEST_QUEUE: (() => void)[] = [];
let requestsInCurrentMinute = 0;
let queueTimerStarted = false;

function startGeminiQueueTimer() {
  if (queueTimerStarted) return;
  queueTimerStarted = true;
  setInterval(() => {
    requestsInCurrentMinute = 0;
    // Try to process up to the rate limit
    for (let i = 0; i < GEMINI_RATE_LIMIT && REQUEST_QUEUE.length > 0; i++) {
      const fn = REQUEST_QUEUE.shift();
      if (fn) fn();
    }
  }, 60 * 1000);
}

export async function getRouteForSchool(origin: string, destination: string): Promise<GeminiRoute | null> {
  if (!GEMINI_API_KEY) throw new Error('Missing Gemini API key');

  // Geocode origin and destination to get coordinates
  const [originCoords, destCoords] = await Promise.all([
    geocodePlace(origin),
    geocodePlace(destination)
  ]);

  let stationHint = '';
  let originStation: Station | null = null;
  let destStation: Station | null = null;

  if (originCoords) originStation = findNearbyStation(originCoords.lat, originCoords.lon);
  if (destCoords) destStation = findNearbyStation(destCoords.lat, destCoords.lon);

  console.log('originStation:', originStation);
  console.log('destStation:', destStation);

  if (originStation && destStation) {
    stationHint = `IMPORTANT: There is a railway station near both the origin (${originStation.name} [${originStation.code}], ${originStation.place}) and the destination (${destStation.name} [${destStation.code}], ${destStation.place}). The user MUST use a train for the main segment of the journey between these two locations. Do NOT use a bus for the intercity segment if a train is available.`;
  } else if (originStation) {
    stationHint = `There is a railway station near the origin (${originStation.name} [${originStation.code}], ${originStation.place}). Suggest a bus or auto to the station, then a train for the main segment.`;
  } else if (destStation) {
    stationHint = `There is a railway station near the destination (${destStation.name}). Suggest a train for the main segment, then a bus or auto from the station to the destination.`;
  } else {
    stationHint = `No railway stations are nearby, so use buses or a combination of buses and autos.`;
  }

  const prompt = `You are a smart public transport route planner for Kerala, India.\n\nMy exact starting point is: ${origin}\nMy destination is: ${destination}\n\n${stationHint}\n\nRequirements:\n- Only use public transport (bus, train, metro), no taxis or private vehicles.\n- If both origin and destination are near a railway station, use the train for the main segment.\n- Otherwise, use buses or a combination as appropriate.\n- Minimize walking distance and always choose the closest possible drop-off point to the destination.\n- For each step, estimate walking time, in-vehicle time, and waiting time separately. Assume typical Kerala public transport frequencies (e.g., frequent buses/trains on main routes).\n- Avoid overestimating waiting time if frequent service is available.\n- Be aware that there is major highway construction ongoing throughout Kerala, so prefer routes that avoid highways under construction when possible.\n- Give step-by-step instructions as bullet points.\n- Start the route from the exact starting point provided above (use Google Maps link or address if given).\n- Include the name of the drop-off stop/station for each segment.\n- Include total estimated time (in minutes), number of mode switches, total walking distance (in km), and a comfort score (1-10, lower=worse).\n- Output JSON only, in this format:\n{\n  \"instructions\": [ ... ],\n  \"total_time\": \"42 mins\",\n  \"switches\": 1,\n  \"walk_km\": 0.8,\n  \"score\": 8\n}`;

  // Ensure we don't exceed Gemini API free tier rate limit (15/min)
  async function waitForGeminiSlot(): Promise<void> {
    if (requestsInCurrentMinute < GEMINI_RATE_LIMIT) {
      requestsInCurrentMinute++;
      return;
    }
    // Otherwise, queue this request
    return new Promise<void>(resolve => {
      REQUEST_QUEUE.push(() => {
        requestsInCurrentMinute++;
        resolve();
      });
      startGeminiQueueTimer();
    });
  }

  await waitForGeminiSlot();

  // Call Gemini API (REST, model: gemini-pro)
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  // Note: If you request too many routes at once, requests will be queued and delayed to avoid hitting Gemini's free-tier rate limit.

  const data = await res.json();
  // Gemini's response is in data.candidates[0].content.parts[0].text
  let json = null;
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Remove markdown code block if present
    const cleaned = text.replace(/```json|```/gi, '').trim();
    json = JSON.parse(cleaned);
    console.log(json, 'json before returning');
  } catch (e: unknown) {
    console.log(e, 'e');
    return null;
  }
  console.log(json, 'json')
  return json as GeminiRoute;
}
