import { School } from "@/lib/supabase";

import type { GeminiRoute } from "@/lib/gemini";

type GeminiStep = {
  step?: number;
  description?: string;
  instruction?: string;
  walking_time?: string;
  waiting_time?: string;
  in_vehicle_time?: string;
  details?: string;
  [key: string]: unknown;
};
import { Collapsible } from "@/components/Collapsible";

export interface SchoolCardProps {
  school: School;
  route?: GeminiRoute | null;
  routeLoading?: boolean;
  onSeeRoute?: () => void;
}

export function SchoolCard({ school, route, routeLoading, onSeeRoute }: SchoolCardProps) {
  return (
    <div className="bg-card rounded-xl shadow p-5 border flex flex-col gap-3 min-w-[220px]">
      <div className="font-semibold text-lg">{school.school}</div>
      <div className="text-muted-foreground">District: <span className="font-medium">{school.district}</span></div>
      <div className="text-muted-foreground">Post: <span className="font-medium">{school.post}</span></div>
      {routeLoading ? (
        <div className="h-8 flex items-center justify-center text-xs text-muted-foreground animate-pulse">
          <span className="inline-block h-3 w-2/3 bg-gray-200 rounded shimmer" />
        </div>
      ) : route ? (
        <div className="flex flex-col gap-1 text-xs">
          <div><b>Time:</b> {route.total_time}</div>
          <div><b>Comfort:</b> {route.score}/10</div>
          <div><b>Switches:</b> {route.switches}</div>
          <div><b>Walk:</b> {route.walk_km} km</div>
          <Collapsible
            trigger={"See Route Details"}
            className="mt-1"
          >
            <ul className="mt-2 list-disc pl-5 text-xs">
              {route.instructions.map((step, i) => {
                if (typeof step === 'string') {
                  return <li key={i}>{step}</li>;
                } else if (typeof step === 'object' && step !== null) {
                  // Pretty-print known fields if present
                  const {
                    step: s,
                    description,
                    instruction,
                    walking_time,
                    waiting_time,
                    in_vehicle_time,
                    details,
                    ...rest
                  } = step as GeminiStep;
                  return (
                    <li key={i} className="mb-2">
                      {s !== undefined && <b>Step {s}:</b>} {instruction || description}
                      <ul className="ml-4 mt-1 list-none">
                        {walking_time && <li><b>Walking:</b> {walking_time}</li>}
                        {waiting_time && <li><b>Waiting:</b> {waiting_time}</li>}
                        {in_vehicle_time && <li><b>In Vehicle:</b> {in_vehicle_time}</li>}
                        {details && <li><b>Details:</b> {details}</li>}
                        {/* Show any other fields */}
                        {Object.entries(rest).map(([k, v]) => (
                          <li key={k}><b>{k}:</b> {String(v)}</li>
                        ))}
                      </ul>
                    </li>
                  );
                } else {
                  return <li key={i}>{JSON.stringify(step)}</li>;
                }
              })}
            </ul>
          </Collapsible>
        </div>
      ) : (
        <div className="h-8 flex items-center justify-center text-xs text-muted-foreground">No route found</div>
      )}
      <button
        className="mt-2 bg-secondary text-secondary-foreground rounded px-3 py-1 font-semibold hover:bg-secondary/90 transition disabled:opacity-50"
        onClick={onSeeRoute}
        type="button"
        disabled={routeLoading}
      >
        See Route
      </button>
    </div>
  );
}

// Add shimmer effect styles (can move to global css if preferred)
// .shimmer { background: linear-gradient(90deg, #f3f3f3 25%, #e0e0e0 50%, #f3f3f3 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; }
// @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
