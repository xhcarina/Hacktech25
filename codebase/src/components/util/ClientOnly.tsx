"use client"

import { useEffect, useState, ReactNode } from "react"

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * ClientOnly component renders its children only on the client side, not during server-side rendering.
 * This prevents hydration errors for components that use browser-specific APIs or have rendering differences
 * between server and client.
 * 
 * @param children The components to render only on the client
 * @param fallback Optional content to show during server-side rendering or before hydration
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return fallback
  }

  return <>{children}</>
}