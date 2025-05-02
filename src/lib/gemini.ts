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

export async function getRouteForSchool(origin: string, destination: string): Promise<GeminiRoute | null> {
  if (!GEMINI_API_KEY) throw new Error('Missing Gemini API key');

  // Compose the prompt
  const prompt = `You are a smart public transport route planner for Kerala, India.\n\nGive a public transport route from: ${origin}\nto: ${destination}\n\nRequirements:\n- Only use public transport (bus, train, metro), no taxis or private vehicles\n- Give step-by-step instructions as bullet points\n- Include total estimated time (in minutes), number of mode switches, total walking distance (in km), and a comfort score (1-10, lower=worse)\n- Output JSON only, in this format:\n{\n  \"instructions\": [ ... ],\n  \"total_time\": \"42 mins\",\n  \"switches\": 1,\n  \"walk_km\": 0.8,\n  \"score\": 8\n}`;

  // Call Gemini API (REST, model: gemini-pro)
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

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
