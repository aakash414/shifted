"use client";

import { SchoolSearchForm } from "@/components/SchoolSearchForm";
import { SchoolCard } from "@/components/SchoolCard";
import { getFilteredSchools, School } from "@/lib/supabase";
import { getRouteForSchool, GeminiRoute } from "@/lib/gemini";
import { SortingDropdown, SortOption } from "@/components/SortingDropdown";
import { KERALA_DISTRICTS } from "@/constants/districts";
import { useState } from "react";

export default function Home() {
  const districts = KERALA_DISTRICTS;
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<(School & { route?: GeminiRoute | null, routeLoading?: boolean })[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [error, setError] = useState<string | null>(null);

  // Cache for Gemini routes
  const geminiRouteCache: Record<string, GeminiRoute | null> = {};
  // Load cache from localStorage if available
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const cached = window.localStorage.getItem('geminiRouteCache');
      if (cached) Object.assign(geminiRouteCache, JSON.parse(cached));
    } catch { }
  }

  // Helper to save cache to localStorage
  function saveCache() {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('geminiRouteCache', JSON.stringify(geminiRouteCache));
    }
  }

  // Concurrency-limited pool
  async function promisePool<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
    const results: T[] = [];
    let i = 0;
    async function worker() {
      while (i < tasks.length) {
        const cur = i++;
        results[cur] = await tasks[cur]();
      }
    }
    await Promise.all(Array(Math.min(limit, tasks.length)).fill(0).map(worker));
    return results;
  }

  async function handleSearch(selectedDistricts: string[], post: string, userLocation: string) {
    setLoading(true);
    setError(null);
    try {
      console.log(selectedDistricts, post, userLocation, 'data for handling search')
      const schools = await getFilteredSchools(selectedDistricts, post);
      // Set loading state for each card
      setResults(schools.map(s => ({ ...s, routeLoading: true })));

      // Prepare tasks for Gemini API (with cache)
      const tasks = schools.map((school) => {
        const key = `${userLocation}|${school.school}, ${school.district}, Kerala`;
        return async () => {
          if (key in geminiRouteCache) {
            return geminiRouteCache[key];
          }
          const route = await getRouteForSchool(userLocation, `${school.school}, ${school.district}, Kerala`);
          geminiRouteCache[key] = route;
          saveCache();
          return route;
        };
      });
      // Limit concurrency to 5
      const routes = await promisePool(tasks, 5);
      // Attach routes
      let schoolsWithRoutes = schools.map((school, idx) => ({
        ...school,
        route: routes[idx],
        routeLoading: false
      }));
      console.log(schoolsWithRoutes, 'schoolsWithRoutes')
      // Sort dynamically
      schoolsWithRoutes = sortSchools(schoolsWithRoutes, sortBy);
      setResults(schoolsWithRoutes);
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch schools/routes");
    }
    setLoading(false);
  }
  // Sorting logic
  function sortSchools(
    schools: (School & { route?: GeminiRoute | null, routeLoading?: boolean })[],
    sortBy: SortOption
  ) {
    return [...schools].sort((a, b) => {
      if (!a.route || !b.route) return 0;
      const parseTime = (t: string) => parseInt(t.split(" ")[0]) || 9999;
      switch (sortBy) {
        case "score":
          return a.route.score - b.route.score;
        case "time":
          return parseTime(a.route.total_time) - parseTime(b.route.total_time);
        case "switches":
          return a.route.switches - b.route.switches;
        case "walk":
          return a.route.walk_km - b.route.walk_km;
        default:
          return 0;
      }
    }).map(s => ({
      ...s,
      route: s.route ?? null,
      routeLoading: typeof s.routeLoading === 'boolean' ? s.routeLoading : false,
    }));
  }
  // Handle sort change
  function handleSortChange(opt: SortOption) {
    setSortBy(opt);
    setResults(results => sortSchools(results, opt));
  }

  // Reset filters
  function handleReset() {
    setResults([]);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Find Schools</h1>
      <div className="flex items-center gap-4 mb-4">
        <SortingDropdown value={sortBy} onChange={handleSortChange} />
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm font-medium"
          onClick={handleReset}
          disabled={loading}
        >
          Reset Filters
        </button>
      </div>
      <SchoolSearchForm
        allDistricts={districts}
        onSearch={handleSearch}
        loading={loading}
      />
      {error && <div className="text-red-500 mt-4">{error}</div>}
      <div className="mt-10 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full max-w-6xl">
        {results.map((school, idx) => (
          <SchoolCard
            key={school.school + idx}
            school={school}
            route={school.route}
            routeLoading={school.routeLoading}
            onSeeRoute={() => { }}
          />
        ))}
      </div>
    </div>
  );
}

