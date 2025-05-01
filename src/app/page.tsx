"use client";

import { SchoolSearchForm } from "@/components/SchoolSearchForm";
import { SchoolCard } from "@/components/SchoolCard";
import { getFilteredSchools, supabase, School } from "@/lib/supabase";
import { getRouteForSchool, GeminiRoute } from "@/lib/gemini";
import { useState } from "react";

export default function Home() {
  // We'll fetch distinct districts and posts on the client for simplicity
  const [districts, setDistricts] = useState<string[]>([]);
  const [posts, setPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<(School & { route?: GeminiRoute | null, routeLoading?: boolean })[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch options on mount
  useState(() => {
    async function fetchOptions() {
      const [districtRes, postRes] = await Promise.all([
        supabase.from("schools").select("district").then(({ data }) => data ? Array.from(new Set(data.map((d: any) => d.district))) : []),
        supabase.from("schools").select("post").then(({ data }) => data ? Array.from(new Set(data.map((d: any) => d.post))) : []),
      ]);
      setDistricts(districtRes);
      setPosts(postRes);
    }
    fetchOptions();
  });

  async function handleSearch(selectedDistricts: string[], post: string, userLocation: string) {
    setLoading(true);
    setError(null);
    try {
      const schools = await getFilteredSchools(selectedDistricts, post);
      // Only top 10 for Gemini API
      const topSchools = schools.slice(0, 10);
      // Set loading state for each card
      setResults(topSchools.map(s => ({ ...s, routeLoading: true })));
      // Fetch routes in parallel
      const routes = await Promise.all(
        topSchools.map(school =>
          getRouteForSchool(userLocation, `${school.school}, ${school.district}, Kerala`)
        )
      );
      // Attach routes
      let schoolsWithRoutes = topSchools.map((school, idx) => ({
        ...school,
        route: routes[idx],
        routeLoading: false
      }));
      // Sort by score + time if available
      schoolsWithRoutes = schoolsWithRoutes.sort((a, b) => {
        if (!a.route || !b.route) return 0;
        // Weighted: lower score is worse, lower time is better
        const parseTime = (t: string) => parseInt(t.split(" ")[0]) || 9999;
        const aScore = a.route.score * 10 + parseTime(a.route.total_time);
        const bScore = b.route.score * 10 + parseTime(b.route.total_time);
        return aScore - bScore;
      });
      setResults(schoolsWithRoutes);
    } catch (err: any) {
      setError(err.message || "Failed to fetch schools/routes");
    }
    setLoading(false);
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Find Schools</h1>
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
            onSeeRoute={() => {}}
          />
        ))}
      </div>
    </div>
  );
}

