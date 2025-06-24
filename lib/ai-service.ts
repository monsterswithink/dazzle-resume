import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export class AIService {
  static async generateSummary(profileData: any): Promise<string> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Based on this LinkedIn profile data, generate a compelling professional summary for a resume:
        
        Name: ${profileData.full_name}
        Headline: ${profileData.headline}
        Experience: ${JSON.stringify(profileData.experiences)}
        Education: ${JSON.stringify(profileData.education)}
        
        Generate a 2-3 sentence professional summary that highlights key strengths and experience.`,
      })
      return text
    } catch (error) {
      console.error("AI Summary generation failed:", error)
      return profileData.summary || "Professional with diverse experience and strong background."
    }
  }

  static async optimizeJobDescription(description: string, jobTitle: string): Promise<string> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Optimize this job description for a resume, making it more impactful and ATS-friendly:
        
        Job Title: ${jobTitle}
        Current Description: ${description}
        
        Rewrite this to be more concise, action-oriented, and include relevant keywords. Use bullet points if appropriate.`,
      })
      return text
    } catch (error) {
      console.error("AI optimization failed:", error)
      return description
    }
  }

  static async suggestSkills(profileData: any): Promise<string[]> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Based on this professional profile, suggest 8-10 relevant technical and soft skills:
        
        Headline: ${profileData.headline}
        Experience: ${JSON.stringify(profileData.experiences)}
        Education: ${JSON.stringify(profileData.education)}
        
        Return only a comma-separated list of skills.`,
      })
      return text.split(",").map((skill) => skill.trim())
    } catch (error) {
      console.error("AI skill suggestion failed:", error)
      return ["Communication", "Leadership", "Problem Solving", "Teamwork"]
    }
  }

  static async analyzeResumeForJob(
    resumeData: any,
    jobDescription: string,
  ): Promise<{
    score: number
    suggestions: string[]
    missingKeywords: string[]
  }> {
    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt: `Analyze this resume against the job description and provide optimization suggestions:
        
        Resume Data: ${JSON.stringify(resumeData)}
        Job Description: ${jobDescription}
        
        Provide a JSON response with:
        - score (0-100)
        - suggestions (array of improvement suggestions)
        - missingKeywords (array of important keywords missing from resume)`,
      })

      return JSON.parse(text)
    } catch (error) {
      console.error("AI resume analysis failed:", error)
      return {
        score: 75,
        suggestions: ["Add more quantifiable achievements", "Include relevant keywords"],
        missingKeywords: ["leadership", "project management"],
      }
    }
  }
}
