"use client"

import { useEffect, useMemo, useState } from "react"

function isInAppBrowser(ua: string) {
  const l = ua.toLowerCase()
  // Common in-app/user agents: FBAN/FBAV (Facebook), Instagram, Line, WhatsApp, Twitter
  return (
    l.includes("fbav") ||
    l.includes("fban") ||
    l.includes("instagram") ||
    l.includes("line/") ||
    l.includes("whatsapp") ||
    l.includes("twitter")
  )
}

export default function InAppBrowserWarning() {
  const [show, setShow] = useState(false)

  const userAgent = useMemo(() => {
    if (typeof navigator === "undefined") return ""
    return navigator.userAgent || ""
  }, [])

  useEffect(() => {
    if (!userAgent) return
    if (isInAppBrowser(userAgent)) setShow(true)
  }, [userAgent])

  if (!show) return null

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert("Link copied. Please paste it in your browser (Chrome/Safari).")
    } catch {
      alert("Copy failed. Please manually open this page in your device browser.")
    }
  }

  return (
    <div className="w-full bg-yellow-100 border-b border-yellow-300 text-yellow-900">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-sm">
          Payments may not work inside this app&apos;s browser. Please open this page in your device&apos;s default
          browser (Chrome/Safari).
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(window.location.href, "_blank")}
            className="px-3 py-1.5 rounded-md bg-yellow-200 hover:bg-yellow-300 text-sm"
          >
            Open in browser
          </button>
          <button
            onClick={copyLink}
            className="px-3 py-1.5 rounded-md border border-yellow-400 text-sm hover:bg-yellow-200"
          >
            Copy link
          </button>
        </div>
      </div>
    </div>
  )
}

/*
Usage:
import InAppBrowserWarning from "@/components/in-app-browser-warning"

export default function CheckoutPage() {
  return (
    <>
      <InAppBrowserWarning />
    </>
  )
}
*/
