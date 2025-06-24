"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { ResumeDisplay } from "@/components/resume-display"
import type { ResumeData } from "@/lib/types"
import { Loader2 } from "lucide-react"

export default function PublicResumePage() {
  const params = useParams()
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchPublicResume(params.id as string)
    }
  }, [params.id])

  const fetchPublicResume = async (resumeId: string) => {
    try {
      const { data, error } = await supabase.from("resumes").select("*").eq("id", resumeId).single()

      if (error) {
        setError("Resume not found")
        return
      }

      setResumeData(data)
    } catch (error) {
      setError("Failed to load resume")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error || !resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume Not Found</h2>
          <p className="text-gray-600">{error || "The requested resume could not be found."}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <ResumeDisplay resumeData={resumeData} isEditing={false} onToggleEdit={() => {}} onSave={() => {}} />
      </div>
    </div>
  )
}
