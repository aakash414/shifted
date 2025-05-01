import { School } from "@/lib/supabase";

import type { GeminiRoute } from "@/lib/gemini";

export interface SchoolCardProps {
  school: School;
  route?: GeminiRoute | null;
  routeLoading?: boolean;
  onSeeRoute?: () => void;
}

import { useState } from "react";

export function SchoolCard({ school, route, routeLoading, onSeeRoute }: SchoolCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className="bg-card rounded-xl shadow p-5 border flex flex-col gap-3 min-w-[220px]">
      <div className="font-semibold text-lg">{school.school}</div>
      <div className="text-muted-foreground">District: <span className="font-medium">{school.district}</span></div>
      <div className="text-muted-foreground">Post: <span className="font-medium">{school.post}</span></div>
      {routeLoading ? (
        <div className="h-8 flex items-center justify-center text-xs text-muted-foreground animate-pulse">Loading route...</div>
      ) : route ? (
        <>
          <div className="flex flex-col gap-1 text-xs">
            <div><b>Time:</b> {route.total_time}</div>
            <div><b>Comfort:</b> {route.score}/10</div>
            <div><b>Switches:</b> {route.switches}</div>
            <div><b>Walk:</b> {route.walk_km} km</div>
            <button
              className="mt-1 underline text-blue-600 hover:text-blue-800 text-xs"
              onClick={() => setShowDetails(v => !v)}
              type="button"
            >
              {showDetails ? "Hide Route Details" : "See Route Details"}
            </button>
            {showDetails && (
              <ul className="mt-2 list-disc pl-5 text-xs">
                {route.instructions.map((step, i) => <li key={i}>{step}</li>)}
              </ul>
            )}
          </div>
        </>
      ) : (
        <div className="h-8 flex items-center justify-center text-xs text-muted-foreground">No route found</div>
      )}
      <button
        className="mt-2 bg-secondary text-secondary-foreground rounded px-3 py-1 font-semibold hover:bg-secondary/90 transition"
        onClick={onSeeRoute}
        type="button"
      >
        See Route
      </button>
    </div>
  );
}
