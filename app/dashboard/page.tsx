"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase/client"
import { DragDropResume } from "@/components/drag-drop-resume"
import { AISuggestionsPanel } from "@/components/ai-suggestions-panel"
import { ResumeControls } from "@/components/resume-controls"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ResumeData } from "@/lib/types"
import { Loader2, Layout, Sparkles, Eye } from "lucide-react"
import { ResumePreview } from "@/components/resume-preview"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("builder")
  const router = useRouter()

  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [syncLoading, setSyncLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.push("/")
        return
      }

      setUser(user)
      await fetchResumeData(user.id)
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const fetchResumeData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching resume:", error)
        return
      }

      if (data) {
        setResumeData(data)
      }
    } catch (error) {
      console.error("Error fetching resume data:", error)
    }
  }

  const handleLinkedInSync = async () => {
    setSyncLoading(true)
    setToastMessage("Connecting to LinkedIn...")

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        setToastMessage("Please log in again")
        router.push("/")
        return
      }

      const response = await fetch("/api/linkedin/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          linkedin_profile_url: linkedinUrl,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setResumeData(result.data)
        setToastMessage(result.message || "LinkedIn data synced successfully!")
        setTimeout(() => setToastMessage(""), 3000)
      } else {
        setToastMessage(result.error || "Failed to sync LinkedIn data")
        setTimeout(() => setToastMessage(""), 3000)
      }
    } catch (error) {
      console.error("Error syncing LinkedIn data:", error)
      setToastMessage("Error connecting to LinkedIn")
      setTimeout(() => setToastMessage(""), 3000)
    } finally {
      setSyncLoading(false)
    }
  }

  const handleSectionReorder = async (sections: any[]) => {
    if (!resumeData) return

    try {
      const response = await fetch("/api/resume/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resumeData.id,
          custom_sections: sections,
        }),
      })

      if (response.ok) {
        const { data } = await response.json()
        setResumeData(data)
      }
    } catch (error) {
      console.error("Error updating sections:", error)
    }
  }

  const handleSectionToggle = async (sectionId: string) => {
    if (!resumeData) return

    const updatedSections = resumeData.custom_sections.map((section) =>
      section.id === sectionId ? { ...section, visible: !section.visible } : section,
    )

    try {
      const response = await fetch("/api/resume/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resumeData.id,
          custom_sections: updatedSections,
        }),
      })

      if (response.ok) {
        const { data } = await response.json()
        setResumeData(data)
      }
    } catch (error) {
      console.error("Error toggling section:", error)
    }
  }

  const handleAISuggestion = async (sectionId: string) => {
    console.log("Generating AI suggestion for section:", sectionId)
  }

  const handleApplySuggestion = async (suggestion: any) => {
    if (!resumeData) return

    const updatedSuggestions = resumeData.ai_suggestions.map((s) =>
      s.id === suggestion.id ? { ...s, applied: true } : s,
    )

    try {
      const response = await fetch("/api/resume/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resumeData.id,
          ai_suggestions: updatedSuggestions,
        }),
      })

      if (response.ok) {
        const { data } = await response.json()
        setResumeData(data)
      }
    } catch (error) {
      console.error("Error applying suggestion:", error)
    }
  }

  const handleDismissSuggestion = async (suggestionId: string) => {
    if (!resumeData) return

    const updatedSuggestions = resumeData.ai_suggestions.filter((s) => s.id !== suggestionId)

    try {
      const response = await fetch("/api/resume/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resumeData.id,
          ai_suggestions: updatedSuggestions,
        }),
      })

      if (response.ok) {
        const { data } = await response.json()
        setResumeData(data)
      }
    } catch (error) {
      console.error("Error dismissing suggestion:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <Loader2 className="w-8 h-8 animate-spin" />
        </motion.div>
      </div>
    )
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Welcome to Resume Builder</h2>
          <p className="text-gray-600">Connect your LinkedIn account to create your resume.</p>
          <div className="max-w-md mx-auto">
            <Input
              placeholder="Paste your LinkedIn profile URL"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              disabled={syncLoading}
              className="mb-4"
            />
            <Button onClick={handleLinkedInSync} disabled={syncLoading || !linkedinUrl.trim()} size="lg" className="w-full">
              {syncLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching LinkedIn Data...
                </>
              ) : (
                "Fetch LinkedIn Data"
              )}
            </Button>
            {toastMessage && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">{toastMessage}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          {toastMessage}
        </motion.div>
      )}
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Resume Builder</h1>
          <p className="text-gray-600">Create and customize your professional resume with AI assistance</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <ResumeControls
                resumeData={resumeData}
                isEditing={false}
                onToggleEdit={() => {}}
                onThemeChange={async (theme) => {
                  const response = await fetch("/api/resume/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: resumeData.id, theme }),
                  })
                  if (response.ok) {
                    const { data } = await response.json()
                    setResumeData(data)
                  }
                }}
                onLinkedInSync={handleLinkedInSync}
                onUnlinkLinkedIn={async () => {
                  const response = await fetch("/api/resume/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: resumeData.id, linkedin_connected: false }),
                  })
                  if (response.ok) {
                    const { data } = await response.json()
                    setResumeData(data)
                  }
                }}
              />
            </div>

            <div className="lg:col-span-3">
              <TabsContent value="builder" className="mt-0">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                  <DragDropResume
                    resumeData={resumeData}
                    onSectionReorder={handleSectionReorder}
                    onSectionToggle={handleSectionToggle}
                    onAISuggestion={handleAISuggestion}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="ai" className="mt-0">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                  <AISuggestionsPanel
                    resumeData={resumeData}
                    onApplySuggestion={handleApplySuggestion}
                    onDismissSuggestion={handleDismissSuggestion}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                  <ResumePreview resumeData={resumeData} />
                </motion.div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
