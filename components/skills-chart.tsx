"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Skill {
  name: string
  level: number
}

interface SkillsChartProps {
  skills: Skill[]
  theme: string
}

export function SkillsChart({ skills, theme }: SkillsChartProps) {
  const chartConfig = {
    level: {
      label: "Skill Level",
      color:
        theme === "modern" ? "#2563eb" : theme === "classic" ? "#374151" : theme === "minimal" ? "#000000" : "#9333ea",
    },
  }

  return (
    <div className="w-full h-64">
      <ChartContainer config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={skills} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
            <YAxis domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="level" fill={chartConfig.level.color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}
