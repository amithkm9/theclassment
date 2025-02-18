"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout"

export default function PaymentsPage() {
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

        if (data.payment_done) {
          router.push("/")
        }
      }
    }

    if (!loading) {
      if (!user) {
        router.push("/login")
      } else {
        checkPaymentStatus()
      }
    }
  }, [user, loading, router])

  if (loading || paymentDone === null) {
    return null
  }

  if (paymentDone) {
    return null // This will be redirected in the useEffect
  }

  return (
    <AuthenticatedLayout>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">Complete Your Payment</h1>
        <p className="text-base md:text-xl mb-6 md:mb-8 text-center max-w-md mx-auto">
          Click the button below to proceed with your payment for the Career Assessment.
        </p>
        <Button
          asChild
          className="bg-[#0066FF] hover:bg-[#0066FF]/80 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg hover-glow w-full max-w-md"
        >
          <a href="https://rzp.io/l/77Odwft" target="_blank" rel="noopener noreferrer">
            Pay ₹999
          </a>
        </Button>
      </div>
    </AuthenticatedLayout>
  )
}

