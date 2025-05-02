"use client";
import { useState } from "react";

// UI: Replace with shadcn/ui Select/Combobox if available in your setup
function MultiSelect({ options, value, onChange, label }: { options: string[]; value: string[]; onChange: (v: string[]) => void; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium mb-1">{label}</label>
      <select
        multiple
        value={value}
        onChange={e => {
          const selected = Array.from(e.target.selectedOptions, o => o.value);
          onChange(selected);
        }}
        className="border rounded px-2 py-1 min-w-[180px]"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function SingleSelect({ options, value, onChange, label }: { options: string[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="border rounded px-2 py-1 min-w-[180px]"
      >
        <option value="">Select...</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export const HSST_POST_OPTIONS = [
  "HSST Jr Arabic",
  "HSST Jr Botany",
  "HSST Botany",
  "HSST Chemistry",
  "HSST Jr Commerce",
  "HSST Commerce",
  "HSST Communicative English",
  "HSST Jr Computer Science",
  "HSST Computer Science",
  "HSST Jr Economics",
  "HSST Economics",
  "HSST Electronics",
  "HSST Jr English",
  "HSST English",
  "HSST Gandhian Studies",
  "HSST Jr Geography",
  "HSST Geography",
  "HSST Geology",
  "HSST Jr German",
  "HSST Jr Hindi",
  "HSST Hindi",
  "HSST Jr History",
  "HSST History",
  "HSST Home Science",
  "HSST Journalism",
  "HSST Jr Malayalam",
  "HSST Malayalam",
  "HSST Jr Mathematics",
  "HSST Mathematics",
  "HSST Jr Physics",
  "HSST Physics",
  "HSST Jr Political Science",
  "HSST Political Science",
  "HSST Psychology",
  "HSST Jr Russian",
  "HSST Jr Sanskrit",
  "HSST Social Work",
  "HSST Sociology",
  "HSST Jr Statistics",
  "HSST Statistics",
  "HSST Jr Tamil",
  "HSST Jr Zoology",
  "HSST Zoology"
];

export interface SchoolSearchFormProps {
  allDistricts: string[];
  onSearch: (districts: string[], post: string, userLocation: string) => void;
  loading: boolean;
}

export function SchoolSearchForm({ allDistricts, onSearch, loading }: SchoolSearchFormProps) {
  const [districts, setDistricts] = useState<string[]>([]);
  const [post, setPost] = useState("");
  const [userLocation, setUserLocation] = useState("");
  console.log(allDistricts, 'all districts')
  return (
    <form
      className="flex flex-col gap-4 w-full max-w-xl bg-card p-6 rounded-xl shadow-lg border"
      onSubmit={e => {
        e.preventDefault();
        onSearch(districts, post, userLocation);
      }}
    >
      <MultiSelect
        options={allDistricts}
        value={districts}
        onChange={setDistricts}
        label="Select District(s)"
      />
      <SingleSelect
        options={HSST_POST_OPTIONS}
        value={post}
        onChange={setPost}
        label="Select Post"
      />
      <div className="flex flex-col gap-1">
        <label className="font-medium mb-1">Your Current Location</label>
        <input
          type="text"
          value={userLocation}
          onChange={e => setUserLocation(e.target.value)}
          placeholder="Google Maps link, place name, or address"
          className="border rounded px-2 py-1"
        />
      </div>
      <button
        type="submit"
        className="bg-primary text-primary-foreground rounded px-4 py-2 font-semibold hover:bg-primary/90 transition disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Finding Schools..." : "Find Schools"}
      </button>
    </form>
  );
}
