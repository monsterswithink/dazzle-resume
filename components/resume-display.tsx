"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mail, Linkedin, Save, X } from "lucide-react"
import { SkillsChart } from "./skills-chart"
import { type ResumeData, themes } from "@/lib/types"

interface ResumeDisplayProps {
  resumeData: ResumeData
  isEditing: boolean
  onToggleEdit: () => void
  onSave: (data: Partial<ResumeData>) => void
}

export function ResumeDisplay({ resumeData, isEditing, onToggleEdit, onSave }: ResumeDisplayProps) {
  const [editData, setEditData] = useState(resumeData)
  const theme = themes[resumeData.theme]

  const handleSave = () => {
    onSave(editData)
    onToggleEdit()
  }

  const handleCancel = () => {
    setEditData(resumeData)
    onToggleEdit()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <Card className={`${theme.colors.secondary} border-0`}>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              {isEditing ? (
                <div className="space-y-2">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={editData.profile_photo || "/placeholder.svg"} />
                    <AvatarFallback>
                      {editData.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    placeholder="Profile photo URL"
                    value={editData.profile_photo || ""}
                    onChange={(e) => setEditData({ ...editData, profile_photo: e.target.value })}
                    className="text-xs"
                  />
                </div>
              ) : (
                <Avatar className="w-32 h-32">
                  <AvatarImage src={resumeData.profile_photo || "/placeholder.svg"} />
                  <AvatarFallback>
                    {resumeData.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editData.full_name}
                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                    className="text-2xl font-bold"
                  />
                  <Input
                    value={editData.headline}
                    onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
                    className="text-lg"
                  />
                  <Input
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  />
                </div>
              ) : (
                <div>
                  <h1 className={`text-3xl font-bold ${theme.colors.text}`}>{resumeData.full_name}</h1>
                  <p className={`text-xl ${theme.colors.accent} mt-2`}>{resumeData.headline}</p>
                  <p className={`${theme.colors.text} opacity-70 mt-1`}>{resumeData.location}</p>
                </div>
              )}

              <div className="flex justify-center md:justify-start gap-3">
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${resumeData.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={resumeData.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle className={theme.colors.accent}>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={editData.summary}
              onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
              rows={4}
            />
          ) : (
            <p className={theme.colors.text}>{resumeData.summary}</p>
          )}
        </CardContent>
      </Card>

      {/* Experience Section */}
      <Card>
        <CardHeader>
          <CardTitle className={theme.colors.accent}>Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {resumeData.experience.map((exp, index) => (
            <div key={index} className="border-l-2 border-gray-200 pl-4">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editData.experience[index]?.title || ""}
                    onChange={(e) => {
                      const newExp = [...editData.experience]
                      newExp[index] = { ...newExp[index], title: e.target.value }
                      setEditData({ ...editData, experience: newExp })
                    }}
                    placeholder="Job Title"
                  />
                  <Input
                    value={editData.experience[index]?.company || ""}
                    onChange={(e) => {
                      const newExp = [...editData.experience]
                      newExp[index] = { ...newExp[index], company: e.target.value }
                      setEditData({ ...editData, experience: newExp })
                    }}
                    placeholder="Company"
                  />
                  <Input
                    value={editData.experience[index]?.duration || ""}
                    onChange={(e) => {
                      const newExp = [...editData.experience]
                      newExp[index] = { ...newExp[index], duration: e.target.value }
                      setEditData({ ...editData, experience: newExp })
                    }}
                    placeholder="Duration"
                  />
                  <Textarea
                    value={editData.experience[index]?.description || ""}
                    onChange={(e) => {
                      const newExp = [...editData.experience]
                      newExp[index] = { ...newExp[index], description: e.target.value }
                      setEditData({ ...editData, experience: newExp })
                    }}
                    placeholder="Description"
                    rows={3}
                  />
                </div>
              ) : (
                <div>
                  <h3 className={`font-semibold ${theme.colors.text}`}>{exp.title}</h3>
                  <p className={`${theme.colors.accent} font-medium`}>{exp.company}</p>
                  <p className={`text-sm ${theme.colors.text} opacity-70`}>{exp.duration}</p>
                  <p className={`mt-2 ${theme.colors.text}`}>{exp.description}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education Section */}
      <Card>
        <CardHeader>
          <CardTitle className={theme.colors.accent}>Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {resumeData.education.map((edu, index) => (
            <div key={index}>
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editData.education[index]?.degree || ""}
                    onChange={(e) => {
                      const newEdu = [...editData.education]
                      newEdu[index] = { ...newEdu[index], degree: e.target.value }
                      setEditData({ ...editData, education: newEdu })
                    }}
                    placeholder="Degree"
                  />
                  <Input
                    value={editData.education[index]?.school || ""}
                    onChange={(e) => {
                      const newEdu = [...editData.education]
                      newEdu[index] = { ...newEdu[index], school: e.target.value }
                      setEditData({ ...editData, education: newEdu })
                    }}
                    placeholder="School"
                  />
                  <Input
                    value={editData.education[index]?.year || ""}
                    onChange={(e) => {
                      const newEdu = [...editData.education]
                      newEdu[index] = { ...newEdu[index], year: e.target.value }
                      setEditData({ ...editData, education: newEdu })
                    }}
                    placeholder="Year"
                  />
                </div>
              ) : (
                <div>
                  <h3 className={`font-semibold ${theme.colors.text}`}>{edu.degree}</h3>
                  <p className={`${theme.colors.accent}`}>{edu.school}</p>
                  <p className={`text-sm ${theme.colors.text} opacity-70`}>{edu.year}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle className={theme.colors.accent}>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <SkillsChart skills={resumeData.skills} theme={resumeData.theme} />
          <div className="mt-4 flex flex-wrap gap-2">
            {resumeData.skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill.name} ({skill.level}%)
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Controls */}
      {isEditing && (
        <div className="flex justify-center gap-3">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button onClick={handleCancel} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
}
