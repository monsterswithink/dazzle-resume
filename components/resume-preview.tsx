"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Mail, Linkedin, MapPin, Building, GraduationCap } from "lucide-react"
import type { ResumeData } from "@/lib/types"

interface ResumePreviewProps {
  resumeData: ResumeData
}

export function ResumePreview({ resumeData }: ResumePreviewProps) {
  const { linkedin_data } = resumeData

  const formatDate = (dateObj: any) => {
    if (!dateObj || (!dateObj.month && !dateObj.year)) return "Present"
    return `${dateObj.month || ""}/${dateObj.year || ""}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-32 h-32 border-4 border-white">
            <AvatarImage src={linkedin_data.profile_pic_url || "/placeholder.svg"} />
            <AvatarFallback className="text-2xl bg-blue-500">
              {linkedin_data.first_name?.[0]}
              {linkedin_data.last_name?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold mb-2">{linkedin_data.full_name}</h1>
            <p className="text-xl mb-3 text-blue-100">{linkedin_data.headline}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {linkedin_data.city}, {linkedin_data.state}
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Contact
              </div>
              <div className="flex items-center gap-1">
                <Linkedin className="w-4 h-4" />
                LinkedIn Profile
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Summary Section */}
        {linkedin_data.summary && (
          <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-blue-600 pb-2">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{linkedin_data.summary}</p>
          </motion.section>
        )}

        {/* Experience Section */}
        {linkedin_data.experiences && linkedin_data.experiences.length > 0 && (
          <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-600 pb-2">Work Experience</h2>
            <div className="space-y-6">
              {linkedin_data.experiences.map((exp, index) => (
                <div key={index} className="relative pl-8 border-l-2 border-gray-200">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">{exp.title || "Position"}</h3>
                      <span className="text-sm text-gray-500">
                        {formatDate(exp.starts_at)} - {exp.ends_at ? formatDate(exp.ends_at) : "Present"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-blue-600">{exp.company}</span>
                      {exp.location && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-600">{exp.location}</span>
                        </>
                      )}
                    </div>
                    {exp.description && <p className="text-gray-700 leading-relaxed">{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Education Section */}
        {linkedin_data.education && linkedin_data.education.length > 0 && (
          <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-600 pb-2">Education</h2>
            <div className="space-y-4">
              {linkedin_data.education.map((edu, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{edu.degree_name}</h3>
                    <span className="text-sm text-gray-500">
                      {formatDate(edu.starts_at)} - {formatDate(edu.ends_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-blue-600">{edu.school}</span>
                  </div>
                  {edu.field_of_study && <p className="text-gray-600 mb-2">Field of Study: {edu.field_of_study}</p>}
                  {edu.grade && <p className="text-gray-600 mb-2">Grade: {edu.grade}</p>}
                  {edu.description && <p className="text-gray-700">{edu.description}</p>}
                  {edu.activities_and_societies && (
                    <p className="text-gray-600 text-sm mt-2">Activities: {edu.activities_and_societies}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Projects Section */}
        {linkedin_data.accomplishment_projects && linkedin_data.accomplishment_projects.length > 0 && (
          <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-600 pb-2">Projects</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {linkedin_data.accomplishment_projects.map((project, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{project.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatDate(project.starts_at)} - {formatDate(project.ends_at)}
                    </p>
                    <p className="text-gray-700 text-sm mb-3">{project.description}</p>
                    {project.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.url} target="_blank" rel="noopener noreferrer">
                          View Project
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.section>
        )}

        {/* Certifications Section */}
        {linkedin_data.certifications && linkedin_data.certifications.length > 0 && (
          <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-blue-600 pb-2">Certifications</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {linkedin_data.certifications.map((cert, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800">{cert.name}</h3>
                  <p className="text-blue-600 font-medium">{cert.authority}</p>
                  <p className="text-sm text-gray-600">
                    {cert.starts_at} - {cert.ends_at || "No Expiration"}
                  </p>
                  {cert.license_number && <p className="text-xs text-gray-500 mt-1">License: {cert.license_number}</p>}
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Additional Info */}
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {linkedin_data.languages && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Languages</h3>
              <p className="text-gray-700">{linkedin_data.languages}</p>
            </div>
          )}

          {linkedin_data.volunteer_work && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Volunteer Work</h3>
              <p className="text-gray-700">{linkedin_data.volunteer_work}</p>
            </div>
          )}
        </motion.section>
      </div>
    </motion.div>
  )
}
