import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import crypto from "crypto"

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("Razorpay webhook secret is not configured")
    return NextResponse.json({ error: "Webhook configuration error" }, { status: 500 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get("x-razorpay-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature found" }, { status: 400 })
  }

  const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex")

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const event = JSON.parse(rawBody)

  if (event.event === "payment.captured") {
    const { payload } = event
    const { payment } = payload.payment.entity

    const supabase = createRouteHandlerClient({ cookies })

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          payment_done: true,
          payment_id: payment.id,
        })
        .eq("id", payment.notes.user_id)

      if (error) throw error

      return NextResponse.json({ status: "success" })
    } catch (error) {
      console.error("Error updating payment status:", error)
      return NextResponse.json({ error: "Failed to update payment status" }, { status: 500 })
    }
  }

  return NextResponse.json({ status: "ignored" })
}

