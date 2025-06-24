"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Check, X, Lightbulb, Target } from "lucide-react"
import { AIService } from "@/lib/ai-service"
import type { ResumeData } from "@/lib/types"

interface AISuggestionsPanelProps {
  resumeData: ResumeData
  onApplySuggestion: (suggestion: any) => void
  onDismissSuggestion: (suggestionId: string) => void
}

export function AISuggestionsPanel({ resumeData, onApplySuggestion, onDismissSuggestion }: AISuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState(resumeData.ai_suggestions)
  const [loading, setLoading] = useState(false)
  const [jobDescription, setJobDescription] = useState("")
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const generateSuggestions = async () => {
    setLoading(true)
    try {
      // Generate AI suggestions for different sections
      const summaryImprovement = await AIService.generateSummary(resumeData.linkedin_data)
      const skillSuggestions = await AIService.suggestSkills(resumeData.linkedin_data)

      const newSuggestions = [
        {
          id: "summary-" + Date.now(),
          section: "personal",
          type: "improvement",
          suggestion: `Consider updating your summary: "${summaryImprovement}"`,
          applied: false,
        },
        {
          id: "skills-" + Date.now(),
          section: "skills",
          type: "addition",
          suggestion: `Add these trending skills: ${skillSuggestions.slice(0, 3).join(", ")}`,
          applied: false,
        },
      ]

      setSuggestions([...suggestions, ...newSuggestions])
    } catch (error) {
      console.error("Failed to generate suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeForJob = async () => {
    if (!jobDescription.trim()) return

    setLoading(true)
    try {
      const result = await AIService.analyzeResumeForJob(resumeData, jobDescription)
      setAnalysisResult(result)
    } catch (error) {
      console.error("Failed to analyze resume:", error)
    } finally {
      setLoading(false)
    }
  }

  const suggestionVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Resume Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={generateSuggestions} disabled={loading} className="w-full">
              {loading ? "Generating..." : "Get AI Suggestions"}
            </Button>

            <div className="space-y-3">
              <label className="text-sm font-medium">Optimize for Job Description</label>
              <Textarea
                placeholder="Paste a job description here to get targeted suggestions..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
              />
              <Button
                onClick={analyzeForJob}
                disabled={loading || !jobDescription.trim()}
                variant="outline"
                className="w-full"
              >
                <Target className="w-4 h-4 mr-2" />
                Analyze Match
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {analysisResult && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Job Match Analysis
                <Badge variant={analysisResult.score > 80 ? "default" : "secondary"}>
                  {analysisResult.score}% Match
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Missing Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.missingKeywords.map((keyword: string, idx: number) => (
                    <Badge key={idx} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Suggestions</h4>
                <ul className="space-y-1 text-sm">
                  {analysisResult.suggestions.map((suggestion: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="space-y-3">
        <h3 className="font-medium">Active Suggestions</h3>
        <AnimatePresence>
          {suggestions
            .filter((s) => !s.applied)
            .map((suggestion) => (
              <motion.div
                key={suggestion.id}
                variants={suggestionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {suggestion.section}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.type}
                          </Badge>
                        </div>
                        <p className="text-sm">{suggestion.suggestion}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => onApplySuggestion(suggestion)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onDismissSuggestion(suggestion.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
