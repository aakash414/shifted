import React from "react";

export type SortOption = "score" | "time" | "switches" | "walk";

export interface SortingDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortingDropdown({ value, onChange }: SortingDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-dropdown" className="font-medium text-sm">Sort by:</label>
      <select
        id="sort-dropdown"
        value={value}
        onChange={e => onChange(e.target.value as SortOption)}
        className="border rounded px-2 py-1 text-sm pastel-bg-yellow animate-scale-in"
        style={{ boxShadow: '0 2px 8px 0 rgba(60,60,120,0.04)' }}
      >
        <option value="score">Best Score</option>
        <option value="time">Shortest Time</option>
        <option value="switches">Least Switches</option>
        <option value="walk">Least Walking</option>
      </select>
    </div>
  );
}
