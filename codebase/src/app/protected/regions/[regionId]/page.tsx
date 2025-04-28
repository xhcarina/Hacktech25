"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, AlertTriangle, DollarSign, Users, Home, Tent, TrendingUp, PieChart, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"
import { ClientOnly } from "@/components/util/ClientOnly"
import { 
  LineChart, Line, BarChart, Bar, PieChart as ReChartPie, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts"

type RegionDetailsPageProps = {
  params: {
    regionId: string
  }
}

export default function RegionDetailsPage({ params }: RegionDetailsPageProps) {
  const router = useRouter()
  const region = useQuery(api.regions.getRegion, { 
    regionId: params.regionId as any 
  })
  
  const [activeTab, setActiveTab] = useState("trends")
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value)
  }
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }
  
  const getSeverityText = (level: number) => {
    if (level >= 8) return "Severe"
    if (level >= 6) return "High"
    if (level >= 4) return "Moderate"
    if (level >= 2) return "Low"
    return "Very Low"
  }
  
  const getSeverityColor = (level: number) => {
    if (level >= 8) return "#ef4444" // red
    if (level >= 6) return "#f97316" // orange
    if (level >= 4) return "#facc15" // yellow
    if (level >= 2) return "#22c55e" // green
    return "#3b82f6" // blue
  }

  const generateHistoricalData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseValue = region ? region.economicLoss.total / 6 : 1000000;
    
    return months.map((month, index) => {
      const growthFactor = 1 + (index * 0.15);
      return {
        month,
        loss: Math.round(baseValue * growthFactor)
      };
    });
  };
  
  const generateLossBreakdownData = () => {
    if (!region) return [];
    
    return [
      { name: 'Housing', value: region.economicLoss.housing, color: '#ef4444' }, // red
      { name: 'Income', value: region.economicLoss.income, color: '#f97316' }, // orange
      { name: 'Assets', value: region.economicLoss.assets, color: '#3b82f6' } // blue
    ];
  };
  
  const generatePredictionData = () => {
    if (!region) return [];
    
    return [
      { name: 'Current', loss: region.economicLoss.total },
      { name: 'Predicted', loss: region.predictedLoss }
    ];
  };
  
  const calculatePopulationMetrics = () => {
    if (!region) return { total: 0, displaced: 0, homeless: 0 };
    
    const totalAffected = Math.round(region.economicLoss.total / 15000);
    const displacedPercent = region.severityLevel * 5;
    const homelessPercent = region.severityLevel * 3;
    
    return {
      total: totalAffected,
      displaced: Math.round(totalAffected * (displacedPercent / 100)),
      displacedPercent,
      homeless: Math.round(totalAffected * (homelessPercent / 100)),
      homelessPercent
    };
  };

  const historicalData = generateHistoricalData();
  const lossBreakdownData = generateLossBreakdownData();
  const predictionData = generatePredictionData();
  const populationMetrics = calculatePopulationMetrics();

  if (!region) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading region details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => router.push('/protected/map')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Map
        </Button>
        
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{region.name}</CardTitle>
              <CardDescription>
                Detailed information about economic impact and severity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Severity Level:</span>
                  <span className="font-medium px-3 py-1 rounded-full text-white text-sm" 
                    style={{ backgroundColor: getSeverityColor(region.severityLevel) }}>
                    {region.severityLevel}/10 - {getSeverityText(region.severityLevel)}
                  </span>
                </div>
                
                <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{
                      width: `${region.severityLevel * 10}%`,
                      backgroundColor: getSeverityColor(region.severityLevel)
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg bg-muted/30">
                <h3 className="text-lg font-medium mb-3">Description</h3>
                <p className="text-muted-foreground">{region.description}</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Affected Population</p>
                    <p className="text-2xl font-bold">{formatNumber(populationMetrics.total)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Estimated impact</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Displaced Persons</p>
                    <p className="text-2xl font-bold">{formatNumber(populationMetrics.displaced)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{populationMetrics.displacedPercent}% of affected population</p>
                  </div>
                  <div className="p-2 bg-[#f97316]/10 rounded-full">
                    <Home className="h-5 w-5 text-[#f97316]" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Homeless Population</p>
                    <p className="text-2xl font-bold">{formatNumber(populationMetrics.homeless)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{populationMetrics.homelessPercent}% of affected population</p>
                  </div>
                  <div className="p-2 bg-[#3b82f6]/10 rounded-full">
                    <Tent className="h-5 w-5 text-[#3b82f6]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Impact Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of economic impact data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="trends">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Historical Trends
                  </TabsTrigger>
                  <TabsTrigger value="breakdown">
                    <PieChart className="h-4 w-4 mr-2" />
                    Loss Breakdown
                  </TabsTrigger>
                  <TabsTrigger value="prediction">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Prediction Analysis
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="trends" className="space-y-4">
                  <h3 className="text-lg font-medium">Monthly Economic Losses</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Trend of economic losses over the past 6 months
                  </p>
                  
                  <div className="h-[300px]">
                    <ClientOnly fallback={<div className="h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={historicalData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="month" tick={{ fill: '#374151' }} />
                          <YAxis 
                            tickFormatter={(value) => formatCurrency(value)}
                            tick={{ fill: '#374151' }}
                          />
                          <Tooltip 
                            formatter={(value: number) => [formatCurrency(value), "Economic Loss"]}
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              color: '#374151'
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="loss" 
                            name="Economic Loss" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ClientOnly>
                  </div>
                </TabsContent>
                
                <TabsContent value="breakdown" className="space-y-4">
                  <h3 className="text-lg font-medium">Economic Loss Breakdown</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Distribution of economic losses by category
                  </p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-[300px]">
                      <ClientOnly fallback={<div className="h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ReChartPie>
                            <Pie
                              data={lossBreakdownData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                              label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {lossBreakdownData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: number) => [formatCurrency(value), "Loss"]}
                              contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                color: '#374151'
                              }}
                            />
                            <Legend />
                          </ReChartPie>
                        </ResponsiveContainer>
                      </ClientOnly>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-md border">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-[#3b82f6]" />
                            <div className="text-lg font-medium">Total Economic Loss</div>
                          </div>
                          <div className="text-2xl font-bold">{formatCurrency(region.economicLoss.total)}</div>
                        </div>
                      </div>
                      
                      <h4 className="font-medium">Key Insights</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-[#ef4444] mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Housing:</span> {formatCurrency(region.economicLoss.housing)} 
                            ({Math.round(region.economicLoss.housing / region.economicLoss.total * 100)}% of total)
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-[#f97316] mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Income:</span> {formatCurrency(region.economicLoss.income)}
                            ({Math.round(region.economicLoss.income / region.economicLoss.total * 100)}% of total)
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-[#3b82f6] mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">Assets:</span> {formatCurrency(region.economicLoss.assets)}
                            ({Math.round(region.economicLoss.assets / region.economicLoss.total * 100)}% of total)
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="prediction" className="space-y-4">
                  <h3 className="text-lg font-medium">Predicted Economic Impact</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comparison of current vs. predicted economic losses
                  </p>
                  
                  <div className="h-[300px]">
                    <ClientOnly fallback={<div className="h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={predictionData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fill: '#374151' }} />
                          <YAxis 
                            tickFormatter={(value) => formatCurrency(value)}
                            tick={{ fill: '#374151' }}
                          />
                          <Tooltip 
                            formatter={(value: number) => [formatCurrency(value), "Economic Loss"]}
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '0.5rem',
                              color: '#374151'
                            }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="loss" 
                            name="Economic Loss" 
                            fill="#3b82f6" 
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ClientOnly>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-md border border-primary/20 mt-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-primary">Projected Increase Warning</h4>
                        <p className="text-sm mt-1">
                          Economic losses are projected to increase by 
                          <span className="font-bold"> {Math.round((region.predictedLoss / region.economicLoss.total - 1) * 100)}%</span> if 
                          current conditions persist. This prediction is based on conflict intensity, 
                          displacement patterns, and infrastructure damage assessments.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Location Information</CardTitle>
                <CardDescription>Geographic coordinates and map data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Coordinates</h4>
                  <p className="text-sm">Latitude: {region.coordinates.lat.toFixed(4)}</p>
                  <p className="text-sm">Longitude: {region.coordinates.lng.toFixed(4)}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    className="w-full" 
                    onClick={() => router.push(`/protected/map?regionId=${params.regionId}`)}
                  >
                    View on Map
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => router.push('/protected/donate')}
                  >
                    Make a Donation
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Last Updated</CardTitle>
                <CardDescription>Data freshness information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4">
                  <p className="text-sm text-muted-foreground">This data was last updated on:</p>
                  <p className="text-xl font-semibold mt-2">
                    {new Date(region.lastUpdated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Data is refreshed as new information becomes available from field assessments and partner organizations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  )
}