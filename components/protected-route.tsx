"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [paymentDone, setPaymentDone] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkPaymentStatus() {
      if (user) {
        const { data, error } = await supabase.from("profiles").select("payment_done").eq("id", user.id).single()

        if (error) {
          console.error("Error fetching payment status:", error)
          return
        }

        setPaymentDone(data.payment_done)

        // Don't redirect to payments page if we're on the app-to-tap page
        if (!data.payment_done && window.location.pathname !== "/app-to-tap") {
          router.replace("/payments")
        }
      }
    }

    if (!loading) {
      if (!user) {
        router.replace("/login")
      } else {
        checkPaymentStatus()
      }
    }
  }, [user, loading, router])

  if (loading || paymentDone === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin" size={48} />
      </div>
    )
  }

  if (!user || (!paymentDone && window.location.pathname !== "/app-to-tap")) {
    return null
  }

  return children
}

