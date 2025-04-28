"use client"

import { useEffect, useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapContainer, TileLayer, ZoomControl, Tooltip, CircleMarker } from "react-leaflet"
import { Loader2, Info, Map, Grid3X3, Search, AlertTriangle, DollarSign, ArrowRight, BarChart3, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import "leaflet/dist/leaflet.css"

// Define severity color scale
const getSeverityColor = (level: number) => {
  if (level >= 8) return "#ef4444" // red
  if (level >= 6) return "#f97316" // orange
  if (level >= 4) return "#facc15" // yellow
  if (level >= 2) return "#22c55e" // green
  return "#3b82f6" // blue
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

// Get text for severity level
const getSeverityText = (level: number) => {
  if (level >= 8) return "Severe"
  if (level >= 6) return "High"
  if (level >= 4) return "Moderate"
  if (level >= 2) return "Low"
  return "Very Low"
}

export default function MapPage() {
  const router = useRouter()
  const regions = useQuery(api.regions.listRegions)
  const [selectedRegion, setSelectedRegion] = useState<Doc<"regions"> | null>(null)
  const [viewMode, setViewMode] = useState<"map" | "cards">("map")
  const [searchQuery, setSearchQuery] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  
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

  // Filter regions based on search and severity
  const filteredRegions = regions?.filter(region => {
    // Filter by search query
    if (searchQuery && !region.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    // Filter by severity
    if (severityFilter !== "all") {
      const minSeverity = parseInt(severityFilter)
      if (region.severityLevel < minSeverity) {
        return false
      }
    }
    
    return true
  })

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  
  // Handle severity filter change
  const handleSeverityChange = (value: string) => {
    setSeverityFilter(value)
  }

  // Handle region selection
  const handleRegionSelect = (region: Doc<"regions">) => {
    setSelectedRegion(region)
  }
  
  // Navigate to region details page
  const navigateToRegionDetails = (regionId: string) => {
    router.push(`/protected/regions/${regionId}`)
  }

  // Loading state
  if (!regions) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold tracking-tight">Global Impact Map</h2>
          
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "map" | "cards")} className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="map">
                  <Map className="h-4 w-4 mr-2" />
                  Map
                </TabsTrigger>
                <TabsTrigger value="cards">
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Cards
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search regions..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9 w-full sm:w-[300px]"
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <Select
              value={severityFilter}
              onValueChange={handleSeverityChange}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity Levels</SelectItem>
                <SelectItem value="8">Severe (8-10)</SelectItem>
                <SelectItem value="6">High (6-7)</SelectItem>
                <SelectItem value="4">Moderate (4-5)</SelectItem>
                <SelectItem value="2">Low (2-3)</SelectItem>
                <SelectItem value="0">Very Low (0-1)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredRegions?.length || 0} of {regions.length} regions
        </p>
        
        {viewMode === "map" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Global Impact Map</CardTitle>
                <CardDescription>
                  Color-coded by severity of economic impact. Hover for details, click to select.
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                    
                    {filteredRegions && filteredRegions.map((region) => (
                      <CircleMarker
                        key={region._id}
                        center={[region.coordinates.lat, region.coordinates.lng]}
                        radius={10 + region.severityLevel * 1.5} // Size based on severity
                        pathOptions={{
                          fillColor: getSeverityColor(region.severityLevel),
                          fillOpacity: 0.7,
                          color: "white",
                          weight: 1,
                        }}
                        eventHandlers={{
                          click: () => handleRegionSelect(region),
                          mouseover: (e) => {
                            const layer = e.target;
                            layer.setStyle({
                              fillOpacity: 0.9,
                              weight: 2,
                            });
                          },
                          mouseout: (e) => {
                            const layer = e.target;
                            layer.setStyle({
                              fillOpacity: 0.7,
                              weight: 1,
                            });
                          }
                        }}
                      >
                        <Tooltip permanent={false} direction="top" className="custom-tooltip">
                          <div className="p-2 rounded-md bg-white shadow-md">
                            <h3 className="font-bold">{region.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-medium">Severity:</span>
                              <span className="text-sm px-2 py-0.5 rounded-full" style={{ backgroundColor: getSeverityColor(region.severityLevel), color: 'white' }}>
                                {region.severityLevel}/10
                              </span>
                            </div>
                            <div className="mt-1">
                              <span className="text-sm font-medium">Economic Loss:</span>
                              <span className="text-sm ml-1">{formatCurrency(region.economicLoss.total)}</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">Click for details</div>
                          </div>
                        </Tooltip>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>
                
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
                        <span className="font-medium px-2 py-0.5 rounded-full text-white text-xs" 
                          style={{ backgroundColor: getSeverityColor(selectedRegion.severityLevel) }}>
                          {selectedRegion.severityLevel}/10 - {getSeverityText(selectedRegion.severityLevel)}
                        </span>
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
                        <div className="p-3 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground">Housing Loss</div>
                          <div className="font-medium">{formatCurrency(selectedRegion.economicLoss.housing)}</div>
                        </div>
                        <div className="p-3 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground">Income Loss</div>
                          <div className="font-medium">{formatCurrency(selectedRegion.economicLoss.income)}</div>
                        </div>
                        <div className="p-3 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground">Assets Loss</div>
                          <div className="font-medium">{formatCurrency(selectedRegion.economicLoss.assets)}</div>
                        </div>
                        <div className="p-3 bg-muted rounded-md">
                          <div className="text-xs text-muted-foreground">Predicted Loss</div>
                          <div className="font-medium">{formatCurrency(selectedRegion.predictedLoss)}</div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-muted/50 rounded-md border">
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
                      className="w-full mt-4" 
                      onClick={() => navigateToRegionDetails(selectedRegion._id)}
                    >
                      View Full Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="h-[400px] flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-muted p-6 rounded-full mb-4">
                      <Info className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Region Selected</h3>
                    <p className="text-sm text-muted-foreground">
                      Click on any region on the map to view detailed information about economic impact and severity.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRegions?.length === 0 ? (
              <div className="col-span-full text-center py-12 border rounded-lg bg-muted/20">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No regions found</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? `No results found for "${searchQuery}". Try a different search term or filter.` 
                    : "There are no regions matching your filters."}
                </p>
                <Button onClick={() => {
                  setSearchQuery("")
                  setSeverityFilter("all")
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              filteredRegions?.map(region => (
                <motion.div
                  key={region._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`hover:shadow-md transition-shadow ${selectedRegion?._id === region._id ? "ring-2 ring-primary" : ""}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{region.name}</CardTitle>
                        <Badge 
                          variant={region.severityLevel >= 8 ? "destructive" : 
                                  region.severityLevel >= 6 ? "default" : 
                                  region.severityLevel >= 4 ? "secondary" : 
                                  "outline"}
                        >
                          {getSeverityText(region.severityLevel)} ({region.severityLevel}/10)
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{region.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            Coordinates: {region.coordinates.lat.toFixed(2)}, {region.coordinates.lng.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <AlertTriangle className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Last updated: {new Date(region.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="p-3 bg-muted/50 rounded-md">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Economic Loss</span>
                            </div>
                            <span className="font-bold">{formatCurrency(region.economicLoss.total)}</span>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            Predicted to reach {formatCurrency(region.predictedLoss)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => navigateToRegionDetails(region._id)}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Full Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}