import { School } from "@/lib/supabase";
import type { GeminiRoute } from "@/lib/gemini";
import { useState, useRef, useEffect } from "react";

type GeminiStep = {
  step?: number;
  description?: string;
  instruction?: string;
  walk_time?: string;
  vehicle_time?: string;
  details?: string;
  from?: string;
  to?: string;
  mode?: string;
  // Add any other expected fields here
  [key: string]: unknown;
};

export interface SchoolCardProps {
  school: School;
  route?: GeminiRoute | null;
  routeLoading?: boolean;
  onSeeRoute?: () => void;
  colorClass?: string; // pastel color block class
}

function RouteModal({ open, onClose, route }: { open: boolean; onClose: () => void; route: GeminiRoute }) {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" style={{backdropFilter: 'blur(2px)'}}>
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative flex flex-col" style={{color: '#222', maxHeight: '80vh'}}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl font-bold text-white bg-[var(--button-bg)] rounded-full w-8 h-8 flex items-center justify-center hover:bg-[var(--button-bg-hover)] focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-2" style={{color: 'var(--header-text)'}}>Route Details</h2>
        <div className="mb-2 text-base font-medium">{route.total_time} • Comfort: {route.score}/10 • Switches: {route.switches} • Walk: {route.walk_km} km</div>
        <div className="overflow-y-auto" style={{maxHeight: 'calc(80vh - 120px)'}}>
          <ol className="space-y-4 mt-4">
            {route.instructions.map((step, i) => {
              const pastel = i % 2 === 0 ? 'var(--pastel-blue)' : 'var(--pastel-yellow)';
              if (typeof step === 'string') {
                return <li key={i} className="rounded-xl p-3 text-sm" style={{background: pastel}}>{step}</li>;
              } else if (typeof step === 'object' && step !== null) {
                const { step: s, description, instruction, walk_time, vehicle_time, details, from, to, mode } = step as GeminiStep;
                return (
                  <li key={i} className="rounded-xl p-3 text-sm" style={{background: pastel}}>
                    <div className="font-semibold mb-1">{instruction || description || `Step ${s}`}</div>
                    <ul className="ml-2 text-xs space-y-1">
                      {details && <li><b>Details:</b> {details}</li>}
                      {from && <li><b>From:</b> {from}</li>}
                      {to && <li><b>To:</b> {to}</li>}
                      {mode && <li><b>Mode:</b> {mode}</li>}
                      {walk_time && <li><b>Walking:</b> {walk_time}</li>}
                      {vehicle_time && <li><b>In Vehicle:</b> {vehicle_time}</li>}
                    </ul>
                  </li>
                );
              } else {
                return <li key={i} className="rounded-xl p-3 text-sm" style={{background: pastel}}>{JSON.stringify(step)}</li>;
              }
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

export function SchoolCard({ school, route, routeLoading }: SchoolCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="card-block bg-white flex flex-col h-full min-h-[320px] rounded-xl shadow-md p-6 ">
      <div className="font-bold text-xl mb-1 break-words" style={{ color: 'var(--header-text)' }}>{school.school}</div>
      <div className="text-sm mb-1 break-words" style={{ color: '#555' }}>
        <b>District:</b> {school.district}
      </div>
      <div className="text-sm mb-2 break-words" style={{ color: '#555' }}>
        <b>Post:</b> {school.post}
      </div>
      {routeLoading ? (
        <div className="h-8 flex items-center justify-center text-xs text-muted-foreground">
          <span className="inline-block h-3 w-2/3 bg-gray-200 rounded" />
        </div>
      ) : route ? (
        <>
          <div className="flex flex-col gap-1 text-xs" style={{ color: '#333' }}>
            <div><b>Time:</b> {route.total_time}</div>
            <div><b>Comfort:</b> {route.score}/10</div>
            <div><b>Switches:</b> {route.switches}</div>
            <div><b>Walk:</b> {route.walk_km} km</div>
          </div>
          <button
            className="mt-6 mb-2 btn-modern"
            onClick={() => setModalOpen(true)}
            type="button"
            disabled={routeLoading}
          >
            See Route
          </button>
          <RouteModal open={modalOpen} onClose={() => setModalOpen(false)} route={route} />
        </>
      ) : (
        <div className="h-8 flex items-center justify-center text-xs text-muted-foreground mt-auto">No route found</div>
      )}
    </div>
  );
}

// Add shimmer effect styles (can move to global css if preferred)
// .shimmer { background: linear-gradient(90deg, #f3f3f3 25%, #e0e0e0 50%, #f3f3f3 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; }
// @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
