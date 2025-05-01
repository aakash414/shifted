"use client";

import { SchoolSearchForm } from "@/components/SchoolSearchForm";
import { SchoolCard } from "@/components/SchoolCard";
import { getFilteredSchools, supabase, School } from "@/lib/supabase";
import { useState } from "react";

export default function Home() {
  // We'll fetch distinct districts and posts on the client for simplicity
  const [districts, setDistricts] = useState<string[]>([]);
  const [posts, setPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<School[]>([]);
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
      setResults(schools);
    } catch (err: any) {
      setError(err.message || "Failed to fetch schools");
    }
    console.log(results, 'resutls')
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
          <SchoolCard key={school.school + idx} school={school} onSeeRoute={() => { }} />
        ))}
      </div>
    </div>
  );
}

