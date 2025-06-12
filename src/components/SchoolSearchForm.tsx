"use client";
import { LocationInput } from "./LocationInput";

// UI: Replace with shadcn/ui Select/Combobox if available in your setup
import React, { useRef, useState, useEffect } from "react";

function MultiSelect({ options, value, onChange, label }: { options: string[]; value: string[]; onChange: (v: string[]) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function toggleOption(opt: string) {
    if (value.includes(opt)) {
      onChange(value.filter(v => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  }
  function removeOption(opt: string) {
    onChange(value.filter(v => v !== opt));
  }
  return (
    <div className="flex flex-col gap-1 relative" ref={containerRef}>
      <label className="font-medium mb-1">{label}</label>
      <div
        className="min-w-[220px] rounded-xl border px-3 py-2 bg-white cursor-pointer flex flex-wrap gap-2 items-center pastel-bg-blue relative"
        tabIndex={0}
        onClick={() => setOpen(v => !v)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setOpen(v => !v); }}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{ boxShadow: '0 2px 8px 0 rgba(60,60,120,0.04)' }}
      >
        {value.length === 0 && <span className="text-gray-400">Select district(s)...</span>}
        {value.map(v => (
          <span key={v} className="selected-tag animate-scale-in">
            {v}
            <button
              type="button"
              className="ml-2 text-lg text-gray-500 hover:text-red-500 focus:outline-none"
              onClick={e => { e.stopPropagation(); removeOption(v); }}
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        <span className="ml-auto text-gray-500 text-xl select-none">▾</span>
      </div>
      {open && (
        <div className="absolute top-full left-0 z-10 mt-2 w-full custom-dropdown animate-fade-in">
          {options.map(opt => (
            <label key={opt} className="flex items-center px-3 py-2 hover:bg-pastel-pink cursor-pointer rounded-xl">
              <input
                type="checkbox"
                checked={value.includes(opt)}
                onChange={() => toggleOption(opt)}
                className="accent-green-600 mr-2"
                tabIndex={-1}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}
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
        className="border rounded px-2 py-1 min-w-[180px] pastel-bg-yellow"
        style={{ boxShadow: '0 2px 8px 0 rgba(60,60,120,0.04)' }}
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
      className="flex flex-col gap-6 w-full max-w-xl bg-card p-8 rounded-3xl shadow-lg border"
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
      <LocationInput
        value={userLocation}
        onChange={setUserLocation}
        label="Your Current Location"
        placeholder="Google Maps link, place name, or address"
        disabled={loading}
      />
      <button
        type="submit"
        className="btn-modern disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Finding Schools..." : "Find Schools"}
      </button>
    </form>
  );
}
