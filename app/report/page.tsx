"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Calendar, Download } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"

async function getReportPdf(userId: string) {
  const { data, error } = await supabase.from("reports").select("report_url").eq("id", userId).single()

  if (error) {
    console.error("Error fetching report:", error)
    return null
  }

  return data?.report_url
}

function ReportContent() {
  const { user } = useAuth()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      getReportPdf(user.id).then((url) => {
        setPdfUrl(url)
      })
    }
  }, [user])

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-2rem)] p-4 md:p-8 animate-fade-in">
      <h1 className="text-4xl font-bold mb-6 text-center font-josephine">
        <span className="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">View My</span>{" "}
        <span className="bg-gradient-to-r from-white/80 to-[#0055FE] bg-clip-text text-transparent">Report</span>
      </h1>

      {pdfUrl ? (
        <div className="w-full max-w-4xl mb-8">
          <Button
            size="lg"
            onClick={() => window.open(pdfUrl, "_blank")}
            className="bg-[#0066FF] hover:bg-[#0066FF]/80 text-white mx-auto flex items-center justify-center gap-2 hover-glow px-8 py-6"
          >
            <Download className="h-5 w-5" />
            Open PDF Report
          </Button>
        </div>
      ) : (
        <p className="text-xl mb-8 text-center text-gray-300">
          No report available. Please complete the assessment first.
        </p>
      )}

      <div className="glass-effect p-8 rounded-lg mb-8 max-w-2xl w-full card-hover">
        <h2 className="text-2xl font-semibold mb-4 text-center gradient-text font-space">
          Schedule a Career Counselling Call
        </h2>
        <p className="text-lg mb-8 text-center text-gray-300">
          Book a session with our career coaches to discuss your assessment results and get personalized guidance.
        </p>
        <div className="flex justify-center">
          <Button size="lg" asChild className="bg-[#0066FF] hover:bg-[#0066FF]/80 text-white hover-glow px-8 py-6">
            <a
              href="https://calendly.com/teamclassment/career-counselling-call"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              Schedule Call
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <ReportContent />
      </AuthenticatedLayout>
    </ProtectedRoute>
  )
}

