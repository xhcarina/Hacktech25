"use client"

import { useEffect, useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapContainer, TileLayer, CircleMarker, Tooltip, ZoomControl } from "react-leaflet"
import { Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import "leaflet/dist/leaflet.css"

// Define severity color scale
const getSeverityColor = (level: number) => {
  if (level >= 8) return "#ef4444" // Red - Severe
  if (level >= 6) return "#f97316" // Orange - High
  if (level >= 4) return "#facc15" // Yellow - Moderate
  if (level >= 2) return "#22c55e" // Green - Low
  return "#3b82f6" // Blue - Very Low
}

// Format currency for display
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value)
}

export default function MapPage() {
  const regions = useQuery(api.regions.listRegions)
  const [selectedRegion, setSelectedRegion] = useState<Doc<"regions"> | null>(null)
  const router = useRouter()
  
  // Default map center if no regions are available
  const defaultCenter = { lat: 20, lng: 0 }
  
  // Calculate map center based on regions or use default
  const mapCenter = regions && regions.length > 0
    ? regions.reduce(
        (acc, region) => ({
          lat: acc.lat + region.coordinates.lat / regions.length,
          lng: acc.lng + region.coordinates.lng / regions.length
        }),
        { lat: 0, lng: 0 }
      )
    : defaultCenter

  // Handle view details button click
  const handleViewDetails = (regionId: string) => {
    router.push(`/protected/regions/${regionId}`)
  }

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-6 tracking-tight">Global Impact Map</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Conflict Regions</CardTitle>
              <CardDescription>
                Color-coded by severity of economic impact. Click on a region for details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {regions ? (
                <div className="h-[600px] w-full rounded-md overflow-hidden border">
                  <MapContainer
                    center={[mapCenter.lat, mapCenter.lng]}
                    zoom={2}
                    style={{ height: "100%", width: "100%" }}
                    zoomControl={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ZoomControl position="bottomright" />
                    
                    {regions.map((region) => (
                      <CircleMarker
                        key={region._id}
                        center={[region.coordinates.lat, region.coordinates.lng]}
                        radius={Math.min(10 + region.severityLevel * 2, 25)}
                        pathOptions={{
                          fillColor: getSeverityColor(region.severityLevel),
                          fillOpacity: 0.7,
                          color: "white",
                          weight: 1,
                        }}
                        eventHandlers={{
                          click: () => setSelectedRegion(region),
                        }}
                      >
                        <Tooltip>
                          <div>
                            <strong>{region.name}</strong>
                            <div>Severity: {region.severityLevel}/10</div>
                            <div>Economic Loss: {formatCurrency(region.economicLoss.total)}</div>
                          </div>
                        </Tooltip>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>
              ) : (
                <div className="h-[600px] w-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              
              {/* Map Legend */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="text-sm font-medium">Severity Level:</div>
                {[
                  { level: "Very Low", color: "#3b82f6" },
                  { level: "Low", color: "#22c55e" },
                  { level: "Moderate", color: "#facc15" },
                  { level: "High", color: "#f97316" },
                  { level: "Severe", color: "#ef4444" },
                ].map((item) => (
                  <div key={item.level} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm">{item.level}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Region Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Region Details</CardTitle>
              <CardDescription>
                {selectedRegion 
                  ? `Details for ${selectedRegion.name}`
                  : "Select a region on the map to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedRegion ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedRegion.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Last updated: {new Date(selectedRegion.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Severity Level:</span>
                      <span className="font-medium">{selectedRegion.severityLevel}/10</span>
                    </div>
                    
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{
                          width: `${selectedRegion.severityLevel * 10}%`,
                          backgroundColor: getSeverityColor(selectedRegion.severityLevel)
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium">Economic Impact</h4>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-secondary/50 rounded-md">
                        <div className="text-xs text-muted-foreground">Housing Loss</div>
                        <div className="font-medium">{formatCurrency(selectedRegion.economicLoss.housing)}</div>
                      </div>
                      <div className="p-3 bg-secondary/50 rounded-md">
                        <div className="text-xs text-muted-foreground">Income Loss</div>
                        <div className="font-medium">{formatCurrency(selectedRegion.economicLoss.income)}</div>
                      </div>
                      <div className="p-3 bg-secondary/50 rounded-md">
                        <div className="text-xs text-muted-foreground">Assets Loss</div>
                        <div className="font-medium">{formatCurrency(selectedRegion.economicLoss.assets)}</div>
                      </div>
                      <div className="p-3 bg-secondary/50 rounded-md">
                        <div className="text-xs text-muted-foreground">Predicted Loss</div>
                        <div className="font-medium">{formatCurrency(selectedRegion.predictedLoss)}</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-primary/10 rounded-md">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Total Economic Loss</div>
                        <div className="text-lg font-bold">{formatCurrency(selectedRegion.economicLoss.total)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedRegion.description}</p>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleViewDetails(selectedRegion._id)}
                  >
                    <Info className="mr-2 h-4 w-4" />
                    View Full Details
                  </Button>
                </div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-center p-4">
                  <div className="bg-secondary/30 p-6 rounded-full mb-4">
                    <Info className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Region Selected</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on any region marker on the map to view detailed information about economic impact and severity.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}