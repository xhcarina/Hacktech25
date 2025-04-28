"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function RegionsPage() {
  const router = useRouter()
  
  // Redirect to the map page which now has both map and card views
  useEffect(() => {
    router.push('/protected/map')
  }, [router])

  // Show loading state while redirecting
  return (
    <div className="container flex items-center justify-center min-h-[600px]">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to Regions Map...</p>
      </div>
    </div>
  )
}