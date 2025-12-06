"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"

// Initialize Supabase client once to avoid multiple instances
const supabaseUrl = "https://njejfdmqtnplfnomjyvd.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZWpmZG1xdG5wbGZub21qeXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODczNDIsImV4cCI6MjA3MTI2MzM0Mn0.N2jjDp86bTCnzr8zP-pQlipYzCNpCPrIDndMLGLlBmw"
const supabase = createClient(supabaseUrl, supabaseKey)

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
  }
}

interface OrderData {
  user_id: string
  user_email: string
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  shipping_address: {
    full_name: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  payment_method?: string
  status?: string
}

// Declare Razorpay types
declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState<string>("")
  const [sendEmailReceipt, setSendEmailReceipt] = useState<boolean>(true)

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error || !user) {
          router.push("/login?redirect=checkout")
          return
        }
        setUser(user)

        const storedCart = localStorage.getItem("cart")
        if (storedCart) {
          try {
            const cartItems = JSON.parse(storedCart)
            if (cartItems.length === 0) {
              router.push("/cart")
              return
            }
            setCart(cartItems)
          } catch (error) {
            console.error("Error parsing cart:", error)
            router.push("/cart")
            return
          }
        } else {
          router.push("/cart")
          return
        }

        if (user.email) {
          setFormData((prev) => ({
            ...prev,
            email: user.email || "",
            fullName: user.user_metadata?.full_name || "",
          }))
        }

        setLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login?redirect=checkout")
      }
    }

    checkAuth()
  }, [router])

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.18 // 18% GST
  }

  const calculateShipping = () => {
    return calculateSubtotal() > 1000 ? 0 : 99 // Free shipping over ₹1000
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping()
  }

  const validateForm = () => {
    const requiredFields = ["fullName", "email", "phone", "address", "city", "state", "zipCode"]

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        alert(`Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`)
        return false
      }
    }

    if (formData.phone.length < 10) {
      alert("Please enter a valid phone number")
      return false
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address")
      return false
    }

    return true
  }

  const generateReceipt = (orderData: any) => {
    const receiptWindow = window.open("", "_blank")
    if (!receiptWindow) {
      alert("Please allow popups to view receipt")
      return
    }

    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Receipt - ${orderData.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .receipt-title { font-size: 20px; margin-bottom: 10px; }
          .order-id { font-size: 16px; color: #666; }
          .section { margin-bottom: 25px; }
          .section-title { font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
          .item-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .total-row { border-top: 2px solid #333; padding-top: 10px; font-weight: bold; }
          .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Your Store Name</div>
          <div class="receipt-title">ORDER RECEIPT</div>
          <div class="order-id">Order ID: ${orderData.id}</div>
          <div>Date: ${new Date().toLocaleDateString()}</div>
        </div>

        <div class="section">
          <div class="section-title">Shipping Information</div>
          <div>${orderData.shipping_address.full_name}</div>
          <div>${orderData.shipping_address.email}</div>
          <div>${orderData.shipping_address.phone}</div>
          <div>${orderData.shipping_address.address}</div>
          <div>${orderData.shipping_address.city}, ${orderData.shipping_address.state} ${orderData.shipping_address.zip_code}</div>
          <div>${orderData.shipping_address.country}</div>
        </div>

        <div class="section">
          <div class="section-title">Order Items</div>
          ${orderData.items
            .map(
              (item: any) => `
            <div class="item-row">
              <span>${item.name} (Qty: ${item.quantity})</span>
              <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `,
            )
            .join("")}
        </div>

        <div class="section">
          <div class="section-title">Payment Summary</div>
          <div class="item-row">
            <span>Subtotal:</span>
            <span>₹${orderData.subtotal.toFixed(2)}</span>
          </div>
          <div class="item-row">
            <span>Tax (18%):</span>
            <span>₹${orderData.tax.toFixed(2)}</span>
          </div>
          <div class="item-row">
            <span>Shipping:</span>
            <span>${orderData.shipping === 0 ? "Free" : `₹${orderData.shipping.toFixed(2)}`}</span>
          </div>
          <div class="item-row total-row">
            <span>Total:</span>
            <span>₹${orderData.total.toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <div>Thank you for your purchase!</div>
          <div>For any queries, contact support@yourstore.com</div>
        </div>
      </body>
      </html>
    `

    receiptWindow.document.write(receiptContent)
    receiptWindow.document.close()
  }

  const initializeRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => {
        resolve(true)
      }
      script.onerror = () => {
        resolve(false)
      }
      document.body.appendChild(script)
    })
  }

  const createOrderInSupabase = async (orderData: OrderData): Promise<string> => {
    try {
      console.log("Creating order in Supabase with data:", {
        ...orderData,
        items: orderData.items,
        shipping_address: orderData.shipping_address,
      })

      const { data: order, error } = await supabase.from("orders").insert([orderData]).select("id").single()

      if (error) {
        console.error("Supabase order creation error details:", error)
        throw new Error(`Failed to create order: ${error.message}`)
      }

      if (!order) {
        throw new Error("No order data returned from Supabase")
      }

      console.log("Order created successfully with ID:", order.id)
      return order.id
    } catch (error) {
      console.error("Order creation failed:", error)
      throw error
    }
  }

  const createRazorpayOrder = async (amount: number, receipt: string) => {
    try {
      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to paise
          currency: "INR",
          receipt: receipt,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const orderData = await response.json()
      console.log("Razorpay order created:", orderData)
      return orderData
    } catch (error: any) {
      console.error("Razorpay order creation failed:", error)
      throw new Error(error.message || "Failed to create payment order")
    }
  }

  const processRazorpayPayment = async () => {
    if (!validateForm() || !user) return

    setProcessing(true)

    try {
      // Create order data
      const orderData: OrderData = {
        user_id: user.id,
        user_email: formData.email || user.email || "",
        items: cart,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        shipping: calculateShipping(),
        total: calculateTotal(),
        shipping_address: {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          country: formData.country,
        },
        status: "pending",
        payment_method: "Razorpay",
      }

      // Create order in Supabase first
      const orderId = await createOrderInSupabase(orderData)
      console.log("Order created with ID:", orderId)

      // Initialize Razorpay
      const razorpayLoaded = await initializeRazorpay()
      if (!razorpayLoaded) {
        throw new Error("Razorpay SDK failed to load")
      }

      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder(calculateTotal(), orderId)

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_YourTestKey", // Use test key
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Your Store",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          await handlePaymentSuccess(response, orderId)
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: formData.address,
          order_id: orderId,
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed")
            setProcessing(false)
          }
        }
      }

      const paymentObject = new window.Razorpay(options)

      // Add error handling for payment failures
      paymentObject.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error)
        alert(`Payment failed: ${response.error.description}`)
        setProcessing(false)

        // Update order status to failed
        supabase
          .from("orders")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId)
      })

      paymentObject.open()
    } catch (error: any) {
      console.error("Payment initialization error:", error)
      alert(
        `Error: ${error.message || "There was an error processing your payment. Please try the demo payment instead."}`,
      )
      setProcessing(false)
    }
  }

  const handlePaymentSuccess = async (paymentResponse: any, orderId: string) => {
    try {
      console.log("Payment successful, updating order:", orderId)

      // Update order status in Supabase
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "confirmed",
          payment_id: paymentResponse.razorpay_payment_id,
          payment_method: "Razorpay",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (updateError) {
        console.error("Order update error:", updateError)
        throw new Error("Failed to update order status")
      }

      // Send confirmation email
      if (sendEmailReceipt) {
        await sendOrderConfirmationEmail(orderId, user?.email || formData.email)
      }

      // Clear cart
      localStorage.removeItem("cart")
      setCart([])

      // Set success state
      setOrderId(orderId)
      setOrderSuccess(true)

      // Get the complete order data for receipt
      const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single()

      if (order) {
        setTimeout(() => {
          generateReceipt(order)
        }, 1000)
      }
    } catch (error: any) {
      console.error("Payment success handling error:", error)
      alert("Payment successful but there was an error updating your order. Please contact support.")
    } finally {
      setProcessing(false)
    }
  }

  const sendOrderConfirmationEmail = async (orderId: string, userEmail: string) => {
    try {
      // This would call your email API
      console.log("Sending email confirmation for order:", orderId)
    } catch (error) {
      console.error("Email send error:", error)
    }
  }

  // Demo payment function for testing without Razorpay
  const processDemoPayment = async () => {
    if (!validateForm() || !user) return

    setProcessing(true)

    try {
      const orderData: OrderData = {
        user_id: user.id,
        user_email: formData.email || user.email || "",
        items: cart,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        shipping: calculateShipping(),
        total: calculateTotal(),
        shipping_address: {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          country: formData.country,
        },
        status: "confirmed",
        payment_method: "Demo",
      }

      const orderId = await createOrderInSupabase(orderData)

      // Clear cart
      localStorage.removeItem("cart")
      setCart([])

      // Set success state
      setOrderId(orderId)
      setOrderSuccess(true)

      // Generate receipt
      setTimeout(() => {
        generateReceipt({ ...orderData, id: orderId })
      }, 1000)
    } catch (error: any) {
      console.error("Demo payment error:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order! {sendEmailReceipt && "We've sent a confirmation email to"}{" "}
            <strong>{user?.email}</strong>
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono text-lg font-semibold text-gray-900">{orderId}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                const orderData = {
                  id: orderId,
                  items: cart,
                  subtotal: calculateSubtotal(),
                  tax: calculateTax(),
                  shipping: calculateShipping(),
                  total: calculateTotal(),
                  shipping_address: formData,
                }
                generateReceipt(orderData)
              }}
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              View Receipt
            </button>
            <Link
              href="/"
              className="block w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-black">Checkout</h1>
          <p className="text-black mt-2">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-8">
            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-black mb-6 flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Shipping Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateFormData("fullName", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="john@example.com"
                  />
                  <label className="mt-3 inline-flex items-center gap-2 text-sm text-black">
                    <input
                      type="checkbox"
                      checked={sendEmailReceipt}
                      onChange={(e) => setSendEmailReceipt(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Email me the receipt
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => updateFormData("country", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="123 Main Street, Apartment 4B"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData("city", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateFormData("state", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData("zipCode", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="400001"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-black mb-6 flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Payment Method
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border-2 border-blue-500 rounded-xl bg-blue-50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-black">Credit/Debit Card</p>
                      <p className="text-sm text-gray-600">Pay securely with Razorpay</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-sm text-black">
                      <p className="font-medium">Secure Payment</p>
                      <p>
                        Your payment information is encrypted and secure. This is a demo checkout using Razorpay test
                        mode.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-black mb-6 flex items-center">
                <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-black truncate">{item.name}</h3>
                      <p className="text-sm text-black">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-black">₹{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-sm text-black">
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-black">
                  <span>Tax (18%)</span>
                  <span>₹{calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-black">
                  <span>Shipping</span>
                  <span>{calculateShipping() === 0 ? "Free" : `₹${calculateShipping().toFixed(2)}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-black">
                    <span>Total</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Buttons */}
              <div className="space-y-3 mt-6">
                <button
                  onClick={processRazorpayPayment}
                  disabled={processing}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {processing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    `Pay with Razorpay - ₹${calculateTotal().toFixed(2)}`
                  )}
                </button>

                {/* Demo payment button for testing without Razorpay */}
                <button
                  onClick={processDemoPayment}
                  disabled={processing}
                  className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Demo Payment (Test Without Razorpay)
                </button>
              </div>

              {/* Security Badges */}
              <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-black">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Secure
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
