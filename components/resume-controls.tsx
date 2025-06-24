"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Linkedin, Share2, Download, RefreshCw, Unlink, Copy, Check } from "lucide-react"
import { type ResumeData, themes } from "@/lib/types"
import { supabase } from "@/lib/supabase/client"

interface ResumeControlsProps {
  resumeData: ResumeData
  isEditing: boolean
  onToggleEdit: () => void
  onThemeChange: (theme: string) => void
  onLinkedInSync: () => void
  onUnlinkLinkedIn: () => void
}

export function ResumeControls({
  resumeData,
  isEditing,
  onToggleEdit,
  onThemeChange,
  onLinkedInSync,
  onUnlinkLinkedIn,
}: ResumeControlsProps) {
  const [syncing, setSyncing] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)

  const handleLinkedInSync = async () => {
    setSyncing(true)
    try {
      await onLinkedInSync()
    } finally {
      setSyncing(false)
    }
  }

  const generateShareUrl = () => {
    const url = `${window.location.origin}/resume/${resumeData.id}`
    setShareUrl(url)
  }

  const copyShareUrl = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      {/* LinkedIn Connection Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Linkedin className="w-4 h-4" />
            LinkedIn Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Status:</span>
            <Badge variant={resumeData.linkedin_connected ? "default" : "secondary"}>
              {resumeData.linkedin_connected ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          {resumeData.linkedin_connected ? (
            <div className="space-y-2">
              <Button onClick={handleLinkedInSync} disabled={syncing} size="sm" className="w-full">
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync from LinkedIn"}
              </Button>
              <Button onClick={onUnlinkLinkedIn} variant="outline" size="sm" className="w-full">
                <Unlink className="w-4 h-4 mr-2" />
                Unlink LinkedIn
              </Button>
            </div>
          ) : (
            <Button onClick={handleLinkedInSync} size="sm" className="w-full">
              <Linkedin className="w-4 h-4 mr-2" />
              Connect LinkedIn
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Theme Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={resumeData.theme} onValueChange={onThemeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(themes).map(([key, theme]) => (
                <SelectItem key={key} value={key}>
                  {theme.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Edit Mode */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Edit Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="edit-mode" className="text-sm">
              Manual Editing
            </Label>
            <Switch id="edit-mode" checked={isEditing} onCheckedChange={onToggleEdit} />
          </div>
          <p className="text-xs text-gray-500 mt-2">Toggle to edit resume content manually</p>
        </CardContent>
      </Card>

      {/* Share Resume */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Share Resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={generateShareUrl} size="sm" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Generate Share URL
          </Button>

          {shareUrl && (
            <div className="space-y-2">
              <Input value={shareUrl} readOnly className="text-xs" />
              <Button onClick={copyShareUrl} variant="outline" size="sm" className="w-full">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Export</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
