import { NextResponse } from "next/server"

// Optional: ensure this route isn't statically cached
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { amount, currency, receipt } = await req.json()

    // Validate input
    if (typeof amount !== "number" || amount < 100) {
      return NextResponse.json({ error: "Invalid amount. Must be a number in paise and >= 100." }, { status: 400 })
    }
    if (!currency || typeof currency !== "string") {
      return NextResponse.json(
        { error: "Invalid currency. Provide a 3-letter currency code, e.g. 'INR'." },
        { status: 400 },
      )
    }
    if (!receipt || typeof receipt !== "string") {
      return NextResponse.json(
        { error: "Invalid receipt. Provide your internal order ID as a string." },
        { status: 400 },
      )
    }

    // Check if Razorpay credentials are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables." },
        { status: 500 },
      )
    }

    console.log("Creating Razorpay order:", { amount, currency, receipt })

    // Check if Razorpay credentials are configured
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables." },
        { status: 500 },
      )
    }

    // Create Razorpay order using direct API call (more reliable than SDK)
    const auth = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64")

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify({
        amount: amount, // amount in paise
        currency: currency, // e.g. "INR"
        receipt: receipt, // your internal order id
        payment_capture: 1, // auto capture payment
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Razorpay API error:", response.status, errorText)
      return NextResponse.json(
        { error: `Razorpay API error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    const orderData = await response.json()
    console.log("Razorpay order created successfully:", orderData.id)

    return NextResponse.json({
      id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      status: orderData.status,
      created_at: orderData.created_at,
    })
  } catch (error: any) {
    console.error("Razorpay order creation error:", error)
    
    // Handle specific Razorpay errors
    if (error.error) {
      return NextResponse.json(
        { error: `Razorpay error: ${error.error.description || error.error.message}` },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to create Razorpay order" },
      { status: 500 }
    )
  }
}
