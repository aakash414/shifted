"use client";
import React, { useState, useRef } from "react";

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

function extractLatLonFromGoogleMapsUrl(url: string): { lat: string; lon: string } | null {
  // Try to extract lat/lon from common Google Maps URL patterns
  // Example: https://maps.google.com/?q=10.12345,76.54321
  const regex = /[?&]q=([\d.-]+),([\d.-]+)/;
  const match = url.match(regex);
  if (match) {
    return { lat: match[1], lon: match[2] };
  }
  // Example: https://www.google.com/maps/place/.../@10.12345,76.54321,17z
  const regex2 = /@([\d.-]+),([\d.-]+),/;
  const match2 = url.match(regex2);
  if (match2) {
    return { lat: match2[1], lon: match2[2] };
  }
  return null;
}

export function LocationInput({ value, onChange, label = "Your Current Location", placeholder = "Google Maps link, place name, or address", disabled }: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  async function fetchSuggestions(query: string) {
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
      const data: LocationSuggestion[] = await res.json();
      setSuggestions(data);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);
    // If it's a Google Maps URL, try to decode immediately
    if (/maps\.google\.com|goo\.gl\/maps/.test(val)) {
      setShowDropdown(false);
      const coords = extractLatLonFromGoogleMapsUrl(val);
      if (coords) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}`)
          .then(res => res.json())
          .then(data => {
            if (data.display_name) {
              onChange(data.display_name);
              setSuggestions([{ display_name: data.display_name, lat: coords.lat, lon: coords.lon }]);
              setShowDropdown(false);
            }
          });
      }
    } else if (val.length > 2) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(val);
        setShowDropdown(true);
      }, 350);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }

  function handleSuggestionClick(s: LocationSuggestion) {
    onChange(s.display_name);
    setSuggestions([]);
    setShowDropdown(false);
  }

  return (
    <div className="flex flex-col gap-1 relative">
      <label className="font-medium mb-1">{label}</label>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="border rounded px-2 py-1"
        autoComplete="off"
        disabled={disabled}
        onFocus={() => value.length > 2 && suggestions.length > 0 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
      />
      {showDropdown && suggestions.length > 0 && (
        <ul
          className="absolute z-20 bg-white border border-gray-300 rounded shadow-lg mt-1 w-full max-h-48 overflow-auto"
          onMouseDown={e => e.preventDefault()} // Prevent input blur on click
        >
          {suggestions.map((s, i) => (
            <li
              key={s.display_name + i}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              onMouseDown={() => handleSuggestionClick(s)}
            >
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
      {loading && <div className="text-xs text-muted-foreground mt-1">Loading suggestions...</div>}
    </div>
  );
}
