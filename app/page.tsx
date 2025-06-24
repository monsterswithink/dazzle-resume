import { AuthButton } from "@/components/auth-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Linkedin, FileText, Share2, Edit3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">LinkedIn Resume Builder</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create beautiful, professional resumes automatically synced with your LinkedIn profile. No manual data entry
            required.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Get Started</CardTitle>
              <CardDescription className="text-center">
                Connect your LinkedIn account to create your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuthButton />
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Linkedin className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">LinkedIn Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Automatically import your profile data from LinkedIn with OAuth2.0 authentication.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Multiple Themes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Choose from modern, classic, minimal, and creative resume layouts.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Edit3 className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Manual Editing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Toggle edit mode to manually customize any part of your resume.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Share2 className="w-8 h-8 text-orange-600 mb-2" />
              <CardTitle className="text-lg">Easy Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Generate shareable URLs and export your resume as PDF.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
