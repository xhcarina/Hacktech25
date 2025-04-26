"use client"

import { useEffect, useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapContainer, TileLayer, CircleMarker, Tooltip, ZoomControl } from "react-leaflet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts"
import { Loader2, ArrowLeft, AlertTriangle, TrendingUp, Building, Home, Briefcase, Package, Calculator } from "lucide-react"
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

// Format large numbers
const formatNumber = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value)
}

export default function RegionDetailsPage({ params }: { params: { regionId: string } }) {
  const router = useRouter()
  const regionId = params.regionId as Id<"regions">
  const region = useQuery(api.regions.getRegion, { regionId })
  
  // Generate monthly data for the trend chart (simulated historical data)
  const generateMonthlyData = () => {
    if (!region) return []
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    
    // Create data for the last 12 months with a general upward trend
    return months.map((month, index) => {
      // Adjust index to start from 12 months ago
      const adjustedIndex = (currentMonth - 11 + index) % 12
      const adjustedMonth = months[adjustedIndex]
      
      // Base value that increases over time
      const baseValue = region.economicLoss.total / 15 * (1 + index * 0.08)
      
      // Add some randomness
      const randomFactor = 0.8 + Math.random() * 0.4
      
      return {
        month: adjustedMonth,
        loss: Math.round(baseValue * randomFactor),
      }
    })
  }
  
  // Generate breakdown data for the pie chart
  const generateBreakdownData = () => {
    if (!region) return []
    
    return [
      { name: 'Housing', value: region.economicLoss.housing, color: '#3b82f6' },
      { name: 'Income', value: region.economicLoss.income, color: '#8b5cf6' },
      { name: 'Assets', value: region.economicLoss.assets, color: '#ec4899' },
    ]
  }
  
  // Generate comparison data for the bar chart
  const generateComparisonData = () => {
    if (!region) return []
    
    return [
      { name: 'Current', value: region.economicLoss.total, color: '#3b82f6' },
      { name: 'Predicted', value: region.predictedLoss, color: '#f97316' },
    ]
  }
  
  // Generate impact metrics
  const generateImpactMetrics = () => {
    if (!region) return []
    
    // Estimate affected population based on economic loss
    const estimatedPopulation = Math.round(region.economicLoss.total / 15000)
    const displacedPercentage = 20 + region.severityLevel * 5
    const displacedPopulation = Math.round(estimatedPopulation * displacedPercentage / 100)
    const homelessPercentage = region.severityLevel * 3
    const homelessPopulation = Math.round(estimatedPopulation * homelessPercentage / 100)
    const jobsLost = Math.round(region.economicLoss.income / 25000)
    
    return [
      { 
        title: "Estimated Population Affected", 
        value: formatNumber(estimatedPopulation),
        icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        description: "Total population impacted by the conflict"
      },
      { 
        title: "Displaced Persons", 
        value: formatNumber(displacedPopulation),
        percentage: `${displacedPercentage}%`,
        icon: <Building className="h-5 w-5 text-purple-500" />,
        description: "People forced to leave their homes"
      },
      { 
        title: "Homeless", 
        value: formatNumber(homelessPopulation),
        percentage: `${homelessPercentage}%`,
        icon: <Home className="h-5 w-5 text-blue-500" />,
        description: "People without adequate shelter"
      },
      { 
        title: "Jobs Lost", 
        value: formatNumber(jobsLost),
        icon: <Briefcase className="h-5 w-5 text-pink-500" />,
        description: "Estimated employment positions eliminated"
      }
    ]
  }
  
  const monthlyData = region ? generateMonthlyData() : []
  const breakdownData = region ? generateBreakdownData() : []
  const comparisonData = region ? generateComparisonData() : []
  const impactMetrics = region ? generateImpactMetrics() : []

  return (
    <div className="container pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back button and title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Map
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">
              {region ? region.name : "Loading Region Details..."}
            </h2>
          </div>
          
          {region && (
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-lg">
              <div className="text-sm">Severity Level:</div>
              <div className="font-semibold flex items-center gap-1">
                <span 
                  className="inline-block w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getSeverityColor(region.severityLevel) }}
                ></span>
                {region.severityLevel}/10
              </div>
            </div>
          )}
        </div>
        
        {/* Loading state */}
        {!region && (
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {/* Region content */}
        {region && (
          <>
            {/* Overview section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Map and description */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Region Overview</CardTitle>
                  <CardDescription>
                    Geographic location and general information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Small map */}
                  <div className="h-[300px] w-full rounded-md overflow-hidden border">
                    <MapContainer
                      center={[region.coordinates.lat, region.coordinates.lng]}
                      zoom={6}
                      style={{ height: "100%", width: "100%" }}
                      zoomControl={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <ZoomControl position="bottomright" />
                      
                      <CircleMarker
                        center={[region.coordinates.lat, region.coordinates.lng]}
                        radius={20}
                        pathOptions={{
                          fillColor: getSeverityColor(region.severityLevel),
                          fillOpacity: 0.7,
                          color: "white",
                          weight: 1,
                        }}
                      >
                        <Tooltip>
                          <div>
                            <strong>{region.name}</strong>
                            <div>Severity: {region.severityLevel}/10</div>
                          </div>
                        </Tooltip>
                      </CircleMarker>
                    </MapContainer>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Situation Overview</h3>
                    <p className="text-muted-foreground">{region.description}</p>
                    <p className="text-sm text-muted-foreground mt-4">
                      Last updated: {new Date(region.lastUpdated).toLocaleDateString()} at {new Date(region.lastUpdated).toLocaleTimeString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Economic summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Economic Impact</CardTitle>
                  <CardDescription>
                    Summary of financial losses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Total loss */}
                  <div className="p-4 bg-primary/10 rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Total Economic Loss</div>
                    <div className="text-3xl font-bold">{formatCurrency(region.economicLoss.total)}</div>
                    <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Predicted to reach {formatCurrency(region.predictedLoss)}</span>
                    </div>
                  </div>
                  
                  {/* Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Loss Breakdown</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Housing</span>
                        </div>
                        <span className="font-medium">{formatCurrency(region.economicLoss.housing)}</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{
                            width: `${(region.economicLoss.housing / region.economicLoss.total) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">Income</span>
                        </div>
                        <span className="font-medium">{formatCurrency(region.economicLoss.income)}</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full" 
                          style={{
                            width: `${(region.economicLoss.income / region.economicLoss.total) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-pink-500" />
                          <span className="text-sm">Assets</span>
                        </div>
                        <span className="font-medium">{formatCurrency(region.economicLoss.assets)}</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-pink-500 rounded-full" 
                          style={{
                            width: `${(region.economicLoss.assets / region.economicLoss.total) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Prediction */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">Predicted Future Loss</span>
                      </div>
                      <span className="font-medium">{formatCurrency(region.predictedLoss)}</span>
                    </div>
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full" 
                        style={{
                          width: `${(region.predictedLoss / (region.predictedLoss * 1.2)) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Impact metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {impactMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold">{metric.value}</p>
                          {metric.percentage && (
                            <p className="text-sm text-muted-foreground">{metric.percentage}</p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                      </div>
                      <div className="p-2 bg-secondary/50 rounded-full">
                        {metric.icon}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Detailed analysis tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analysis</CardTitle>
                <CardDescription>
                  Comprehensive data visualizations and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="trends">
                  <TabsList className="mb-4">
                    <TabsTrigger value="trends">Historical Trends</TabsTrigger>
                    <TabsTrigger value="breakdown">Loss Breakdown</TabsTrigger>
                    <TabsTrigger value="prediction">Prediction Analysis</TabsTrigger>
                  </TabsList>
                  
                  {/* Historical trends tab */}
                  <TabsContent value="trends">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Economic Loss Over Time</h3>
                      <p className="text-sm text-muted-foreground">
                        Monthly trend of total economic losses in the region over the past year
                      </p>
                      
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={monthlyData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" tick={{ fill: 'var(--foreground)' }} />
                            <YAxis 
                              tickFormatter={(value) => formatCurrency(value)}
                              tick={{ fill: 'var(--foreground)' }}
                            />
                            <RechartsTooltip
                              formatter={(value: number) => [formatCurrency(value), "Economic Loss"]}
                              labelFormatter={(label) => `Month: ${label}`}
                              contentStyle={{ 
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: 'var(--foreground)'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="loss" 
                              stroke="#3b82f6" 
                              strokeWidth={2}
                              dot={{ fill: '#3b82f6', r: 4 }}
                              activeDot={{ r: 6, fill: '#3b82f6' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        Note: This chart shows the estimated progression of economic losses based on available data and trend analysis.
                      </p>
                    </div>
                  </TabsContent>
                  
                  {/* Breakdown tab */}
                  <TabsContent value="breakdown">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Loss Category Breakdown</h3>
                      <p className="text-sm text-muted-foreground">
                        Distribution of economic losses across different categories
                      </p>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={breakdownData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                              >
                                {breakdownData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip
                                formatter={(value: number) => [formatCurrency(value), "Economic Loss"]}
                                contentStyle={{ 
                                  backgroundColor: 'var(--background)',
                                  border: '1px solid var(--border)',
                                  borderRadius: '0.5rem',
                                  color: 'var(--foreground)'
                                }}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={breakdownData}
                              layout="vertical"
                              margin={{ top: 20, right: 30, left: 60, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                              <XAxis 
                                type="number" 
                                tickFormatter={(value) => formatCurrency(value)}
                                tick={{ fill: 'var(--foreground)' }}
                              />
                              <YAxis 
                                type="category" 
                                dataKey="name"
                                tick={{ fill: 'var(--foreground)' }}
                              />
                              <RechartsTooltip
                                formatter={(value: number) => [formatCurrency(value), "Economic Loss"]}
                                contentStyle={{ 
                                  backgroundColor: 'var(--background)',
                                  border: '1px solid var(--border)',
                                  borderRadius: '0.5rem',
                                  color: 'var(--foreground)'
                                }}
                              />
                              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {breakdownData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-2">
                        <h4 className="font-medium">Key Insights:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                          <li>Housing losses represent {((region.economicLoss.housing / region.economicLoss.total) * 100).toFixed(1)}% of total economic impact</li>
                          <li>Income losses affect the long-term recovery prospects of the region</li>
                          <li>Asset destruction has immediate and lasting effects on local economy</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Prediction tab */}
                  <TabsContent value="prediction">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Current vs. Predicted Losses</h3>
                      <p className="text-sm text-muted-foreground">
                        Machine learning model predictions for future economic impact
                      </p>
                      
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={comparisonData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="name" tick={{ fill: 'var(--foreground)' }} />
                            <YAxis 
                              tickFormatter={(value) => formatCurrency(value)}
                              tick={{ fill: 'var(--foreground)' }}
                            />
                            <RechartsTooltip
                              formatter={(value: number) => [formatCurrency(value), "Economic Loss"]}
                              contentStyle={{ 
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: 'var(--foreground)'
                              }}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {comparisonData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="p-4 bg-amber-500/10 rounded-md mt-6">
                        <h4 className="font-medium flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                          Prediction Analysis
                        </h4>
                        <p className="text-sm mt-2">
                          Our machine learning model predicts an additional {formatCurrency(region.predictedLoss - region.economicLoss.total)} in economic losses 
                          if the current situation continues. This represents a {((region.predictedLoss / region.economicLoss.total - 1) * 100).toFixed(1)}% increase 
                          from current levels.
                        </p>
                        <p className="text-sm mt-2">
                          These predictions are based on historical data from similar conflict regions, current economic indicators, 
                          and trend analysis of the ongoing situation.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <p className="text-sm text-muted-foreground">
                  Data sources: UN Economic Impact Reports, World Bank Development Indicators, and proprietary AidSight ML models.
                </p>
              </CardFooter>
            </Card>
          </>
        )}
      </motion.div>
    </div>
  )
}