import { z } from "zod"

// Date schema for LinkedIn date objects
const LinkedInDateSchema = z.object({
  day: z.string().optional(),
  month: z.string().optional(),
  year: z.string().optional(),
})

// Comprehensive LinkedIn Profile Schema based on requirements
export const LinkedInProfileSchema = z.object({
  // Personal Information
  first_name: z.string(),
  last_name: z.string(),
  full_name: z.string(),
  headline: z.string(),
  occupation: z.string(),
  summary: z.string(),
  profile_pic_url: z.string().optional(),
  background_cover_image_url: z.string().optional(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  country_full_name: z.string(),
  connections: z.string(),
  follower_count: z.string(),
  public_identifier: z.string(),

  // Education
  education: z.array(
    z.object({
      activities_and_societies: z.string(),
      degree_name: z.string(),
      description: z.string(),
      ends_at: LinkedInDateSchema.optional(),
      field_of_study: z.string(),
      grade: z.string(),
      logo_url: z.string(),
      school: z.string(),
      school_linkedin_profile_url: z.string(),
      starts_at: LinkedInDateSchema.optional(),
    }),
  ),

  // Experience
  experiences: z.array(
    z.object({
      company: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      location: z.string().optional(),
      starts_at: LinkedInDateSchema.optional(),
      ends_at: LinkedInDateSchema.optional(),
      logo_url: z.string().optional(),
    }),
  ),

  // Accomplishments
  accomplishment_courses: z.string(),
  accomplishment_honors_awards: z.string(),
  accomplishment_organisations: z.string(),
  accomplishment_patents: z.string(),
  accomplishment_projects: z.array(
    z.object({
      description: z.string(),
      ends_at: LinkedInDateSchema.optional(),
      starts_at: LinkedInDateSchema.optional(),
      title: z.string(),
      url: z.string(),
    }),
  ),
  accomplishment_publications: z.string(),
  accomplishment_test_scores: z.string(),

  // Certifications
  certifications: z.array(
    z.object({
      authority: z.string(),
      display_source: z.string(),
      ends_at: z.string(),
      license_number: z.string(),
      name: z.string(),
      starts_at: z.string(),
      url: z.string(),
    }),
  ),

  // Activities and Additional Info
  activities: z.array(
    z.object({
      activity_status: z.string(),
      link: z.string(),
      title: z.string(),
    }),
  ),
  articles: z.string(),
  groups: z.string(),
  languages: z.string(),
  recommendations: z.string(),
  volunteer_work: z.string(),

  // Related Profiles
  similarly_named_profiles: z.array(
    z.object({
      link: z.string(),
      location: z.string(),
      name: z.string(),
      summary: z.string(),
    }),
  ),
  people_also_viewed: z.string(),
})

// Resume Data Schema for the application
export const ResumeDataSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  linkedin_data: LinkedInProfileSchema,
  custom_sections: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["personal", "experience", "education", "skills", "projects", "certifications", "custom"]),
      title: z.string(),
      content: z.any(),
      order: z.number(),
      visible: z.boolean(),
    }),
  ),
  ai_suggestions: z.array(
    z.object({
      section: z.string(),
      suggestion: z.string(),
      applied: z.boolean(),
    }),
  ),
  theme: z.enum(["modern", "classic", "minimal", "creative"]),
  linkedin_connected: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type LinkedInProfile = z.infer<typeof LinkedInProfileSchema>
export type ResumeData = z.infer<typeof ResumeDataSchema>

export const themes = {
  modern: {
    name: "Modern",
    colors: {
      primary: "bg-blue-600",
      secondary: "bg-gray-100",
      text: "text-gray-900",
      accent: "text-blue-600",
    },
  },
  classic: {
    name: "Classic",
    colors: {
      primary: "bg-gray-800",
      secondary: "bg-gray-50",
      text: "text-gray-900",
      accent: "text-gray-700",
    },
  },
  minimal: {
    name: "Minimal",
    colors: {
      primary: "bg-black",
      secondary: "bg-white",
      text: "text-gray-900",
      accent: "text-black",
    },
  },
  creative: {
    name: "Creative",
    colors: {
      primary: "bg-purple-600",
      secondary: "bg-purple-50",
      text: "text-gray-900",
      accent: "text-purple-600",
    },
  },
}
