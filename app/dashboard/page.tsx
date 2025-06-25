"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Simple filter example: filter by skill (extend as needed)
const fetchFilters = async () => {
  const { data, error } = await supabase
    .from("resumes")
    .select("linkedin_data->skills")
    .neq("linkedin_data", null);

  const skills = new Set<string>();
  data?.forEach((resume: any) => {
    resume.linkedin_data?.skills?.forEach((skill: string) => skills.add(skill));
  });
  return Array.from(skills);
};

export default function DashboardPage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch resumes and filters on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from("resumes").select("*").neq("linkedin_data", null),
      fetchFilters(),
    ]).then(([{ data }, skillList]) => {
      setResumes(data ?? []);
      setSkills(skillList);
      setLoading(false);
    });
  }, []);

  // Filter logic
  const filteredResumes = resumes.filter((resume) => {
    const matchesSearch =
      search.length === 0 ||
      resume.linkedin_data?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      resume.linkedin_data?.headline?.toLowerCase().includes(search.toLowerCase());
    const matchesSkill =
      selectedSkills.length === 0 ||
      (resume.linkedin_data?.skills ?? []).some((s: string) =>
        selectedSkills.includes(s)
      );
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4">
        <h2 className="font-bold mb-2">Filter by Skill</h2>
        <div className="flex flex-col gap-1">
          {skills.map((skill) => (
            <label key={skill} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedSkills.includes(skill)}
                onChange={() =>
                  setSelectedSkills((prev) =>
                    prev.includes(skill)
                      ? prev.filter((s) => s !== skill)
                      : [...prev, skill]
                  )
                }
              />
              {skill}
            </label>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Search bar */}
        <div className="mb-6">
          <input
            className="w-full border border-gray-300 rounded px-4 py-2"
            placeholder="Search by name or headline..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredResumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white shadow rounded p-4 flex flex-col gap-2"
              >
                <div className="text-lg font-bold">
                  {resume.linkedin_data?.full_name || "Unnamed"}
                </div>
                <div className="text-gray-600">
                  {resume.linkedin_data?.headline}
                </div>
                <div className="text-xs text-gray-400">
                  {resume.linkedin_profile_url && (
                    <a
                      href={resume.linkedin_profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(resume.linkedin_data?.skills ?? []).map((skill: string) => (
                    <span
                      key={skill}
                      className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {filteredResumes.length === 0 && (
              <div className="col-span-full text-gray-500 text-center">
                No resumes found.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
