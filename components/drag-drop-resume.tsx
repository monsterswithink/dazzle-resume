"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Eye, EyeOff, Plus, Sparkles } from "lucide-react"
import type { ResumeData } from "@/lib/types"

interface DragDropResumeProps {
  resumeData: ResumeData
  onSectionReorder: (sections: any[]) => void
  onSectionToggle: (sectionId: string) => void
  onAISuggestion: (sectionId: string) => void
}

export function DragDropResume({ resumeData, onSectionReorder, onSectionToggle, onAISuggestion }: DragDropResumeProps) {
  const [sections, setSections] = useState(resumeData.custom_sections)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const newSections = Array.from(sections)
    const [reorderedSection] = newSections.splice(result.source.index, 1)
    newSections.splice(result.destination.index, 0, reorderedSection)

    // Update order numbers
    const updatedSections = newSections.map((section, index) => ({
      ...section,
      order: index,
    }))

    setSections(updatedSections)
    onSectionReorder(updatedSections)
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h2 className="text-2xl font-bold">Customize Your Resume</h2>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </motion.div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="resume-sections">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-4 transition-colors duration-200 ${
                snapshot.isDraggingOver ? "bg-blue-50 rounded-lg p-4" : ""
              }`}
            >
              <AnimatePresence>
                {sections
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          variants={sectionVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className={`transition-all duration-200 ${snapshot.isDragging ? "rotate-2 scale-105" : ""}`}
                        >
                          <Card
                            className={`${
                              !section.visible ? "opacity-50" : ""
                            } ${snapshot.isDragging ? "shadow-lg" : ""}`}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
                                  >
                                    <GripVertical className="w-4 h-4 text-gray-400" />
                                  </div>
                                  <CardTitle className="text-lg">{section.title}</CardTitle>
                                  <Badge variant="secondary" className="text-xs">
                                    {section.type}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => onAISuggestion(section.id)}>
                                    <Sparkles className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => onSectionToggle(section.id)}>
                                    {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                transition={{ duration: 0.3 }}
                              >
                                {section.type === "personal" && (
                                  <div className="space-y-2">
                                    <p className="font-medium">{resumeData.linkedin_data.full_name}</p>
                                    <p className="text-sm text-gray-600">{resumeData.linkedin_data.headline}</p>
                                    <p className="text-sm">
                                      {resumeData.linkedin_data.city}, {resumeData.linkedin_data.state}
                                    </p>
                                  </div>
                                )}
                                {section.type === "experience" && (
                                  <div className="space-y-3">
                                    {resumeData.linkedin_data.experiences.slice(0, 2).map((exp, idx) => (
                                      <div key={idx} className="border-l-2 border-blue-200 pl-3">
                                        <p className="font-medium">{exp.title || "Position"}</p>
                                        <p className="text-sm text-gray-600">{exp.company}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {section.type === "education" && (
                                  <div className="space-y-3">
                                    {resumeData.linkedin_data.education.slice(0, 2).map((edu, idx) => (
                                      <div key={idx}>
                                        <p className="font-medium">{edu.degree_name}</p>
                                        <p className="text-sm text-gray-600">{edu.school}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </motion.div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
              </AnimatePresence>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
