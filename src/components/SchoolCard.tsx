import { School } from "@/lib/supabase";

export interface SchoolCardProps {
  school: School;
  onSeeRoute?: () => void;
}

export function SchoolCard({ school, onSeeRoute }: SchoolCardProps) {

  return (
    <div className="bg-card rounded-xl shadow p-5 border flex flex-col gap-3 min-w-[220px]">
      <div className="font-semibold text-lg">{school.school}</div>
      <div className="text-muted-foreground">District: <span className="font-medium">{school.district}</span></div>
      <div className="text-muted-foreground">Post: <span className="font-medium">{school.post}</span></div>
      <div className="h-8 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">Route Info (coming soon)</div>
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
