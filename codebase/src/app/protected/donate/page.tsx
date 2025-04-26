"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/hooks/use-auth"
import { Doc } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Heart, DollarSign, Package, Utensils, Users, Calendar, ArrowRight, CheckCircle2 } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts"
import { ClientOnly } from "@/components/util/ClientOnly"

// Format currency for display
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value)
}

// Format date for display
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Get icon for donation type
const getDonationTypeIcon = (type: string) => {
  switch (type) {
    case "money":
      return <DollarSign className="h-4 w-4" />
    case "food":
      return <Utensils className="h-4 w-4" />
    case "supplies":
      return <Package className="h-4 w-4" />
    case "volunteers":
      return <Users className="h-4 w-4" />
    default:
      return <Heart className="h-4 w-4" />
  }
}

// Get color for donation type
const getDonationTypeColor = (type: string) => {
  switch (type) {
    case "money":
      return "#3b82f6" // blue
    case "food":
      return "#f97316" // orange
    case "supplies":
      return "#8b5cf6" // purple
    case "volunteers":
      return "#ec4899" // pink
    default:
      return "#6b7280" // gray
  }
}

export default function DonatePage() {
  const { user, isLoading: authLoading } = useAuth()
  
  // Form state
  const [donationType, setDonationType] = useState<string>("money")
  const [amount, setAmount] = useState<string>("100")
  const [description, setDescription] = useState<string>("")
  const [selectedRegionId, setSelectedRegionId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("donate")
  
  // Queries
  const regions = useQuery(api.regions.listRegions)
  const userDonations = user ? useQuery(api.donations.listUserDonations, { userId: user._id }) : undefined
  
  // Mutations
  const createDonation = useMutation(api.donations.createDonation)
  
  // Reset form after successful submission
  const resetForm = () => {
    setDonationType("money")
    setAmount("100")
    setDescription("")
    setSelectedRegionId("")
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error("Authentication required", {
        description: "Please sign in to make a donation"
      })
      return
    }
    
    if (!selectedRegionId) {
      toast.error("Region required", {
        description: "Please select a region for your donation"
      })
      return
    }
    
    const amountValue = parseFloat(amount)
    if (isNaN(amountValue) || amountValue <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid donation amount"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await createDonation({
        userId: user._id,
        regionId: selectedRegionId as any,
        type: donationType as "money" | "food" | "supplies" | "volunteers",
        amount: amountValue,
        description: description || undefined
      })
      
      toast.success("Donation successful", {
        description: "Thank you for your contribution!"
      })
      
      resetForm()
      setActiveTab("history")
    } catch (error) {
      toast.error("Donation failed", {
        description: error instanceof Error ? error.message : "An error occurred while processing your donation"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Generate donation summary data for charts
  const generateDonationSummary = () => {
    if (!userDonations || userDonations.length === 0) return []
    
    const summary = userDonations.reduce((acc, donation) => {
      acc[donation.type] = (acc[donation.type] || 0) + donation.amount
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(summary).map(([type, amount]) => ({
      type,
      amount,
      color: getDonationTypeColor(type)
    }))
  }
  
  // Generate monthly donation data for trend chart
  const generateMonthlyData = () => {
    if (!userDonations || userDonations.length === 0) return []
    
    const monthlyData: Record<string, number> = {}
    const now = new Date()
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      monthlyData[monthKey] = 0
    }
    
    // Aggregate donations by month
    userDonations.forEach(donation => {
      const date = new Date(donation.date)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey] += donation.amount
      }
    })
    
    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount
    }))
  }
  
  const donationSummary = generateDonationSummary()
  const monthlyData = generateMonthlyData()
  
  // Calculate total donations
  const totalDonated = userDonations?.reduce((total, donation) => total + donation.amount, 0) || 0
  
  // Loading state
  if (authLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container pb-12">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-6 tracking-tight">Donor Contributions</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="donate">Make a Donation</TabsTrigger>
            <TabsTrigger value="history">Donation History</TabsTrigger>
          </TabsList>
          
          {/* Donation Form */}
          <TabsContent value="donate">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Make a Contribution</CardTitle>
                  <CardDescription>
                    Support displaced populations in conflict regions with your donation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Region Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="region">Select Region</Label>
                      <Select
                        value={selectedRegionId}
                        onValueChange={setSelectedRegionId}
                      >
                        <SelectTrigger id="region">
                          <SelectValue placeholder="Select a region to support" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions?.map(region => (
                            <SelectItem key={region._id} value={region._id}>
                              {region.name} (Severity: {region.severityLevel}/10)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Donation Type */}
                    <div className="space-y-2">
                      <Label htmlFor="donationType">Donation Type</Label>
                      <Select
                        value={donationType}
                        onValueChange={setDonationType}
                      >
                        <SelectTrigger id="donationType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="money">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span>Money</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="food">
                            <div className="flex items-center gap-2">
                              <Utensils className="h-4 w-4" />
                              <span>Food</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="supplies">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              <span>Supplies</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="volunteers">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>Volunteers</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        {donationType === "money" ? "Amount ($)" : 
                         donationType === "volunteers" ? "Number of Volunteers" : 
                         "Quantity"}
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>
                    
                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Add details about your donation..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    {/* Submit Button */}
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Heart className="mr-2 h-4 w-4" />
                          Submit Donation
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              {/* Donation Impact */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Impact</CardTitle>
                  <CardDescription>
                    How your contributions make a difference
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Total Donated */}
                  <div className="p-4 bg-primary/10 rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">Total Contributions</div>
                    <div className="text-3xl font-bold">{formatCurrency(totalDonated)}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Across {userDonations?.length || 0} donations
                    </div>
                  </div>
                  
                  {/* Impact Metrics */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Estimated Impact</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-secondary/50 rounded-md">
                        <div className="flex items-center gap-2 text-sm font-medium mb-1">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>People Helped</span>
                        </div>
                        <div className="text-lg font-semibold">
                          {Math.round(totalDonated / 100)}
                        </div>
                      </div>
                      
                      <div className="p-3 bg-secondary/50 rounded-md">
                        <div className="flex items-center gap-2 text-sm font-medium mb-1">
                          <Package className="h-4 w-4 text-purple-500" />
                          <span>Aid Packages</span>
                        </div>
                        <div className="text-lg font-semibold">
                          {Math.round(totalDonated / 250)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Donation Tips */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Donation Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>Monetary donations provide the most flexibility for aid organizations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>Food and supplies are critical in regions with limited access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>Volunteer time can be as valuable as financial contributions</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Donation History */}
          <TabsContent value="history">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Donation List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Your Donation History</CardTitle>
                  <CardDescription>
                    Record of all your contributions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userDonations?.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No donations yet</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Make your first contribution to help displaced populations
                      </p>
                      <Button onClick={() => setActiveTab("donate")}>
                        Make a Donation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userDonations?.map((donation) => {
                        const region = regions?.find(r => r._id === donation.regionId)
                        
                        return (
                          <div 
                            key={donation._id} 
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="space-y-1 mb-3 sm:mb-0">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="p-1.5 rounded-full" 
                                  style={{ backgroundColor: `${getDonationTypeColor(donation.type)}20` }}
                                >
                                  {getDonationTypeIcon(donation.type)}
                                </div>
                                <h4 className="font-medium">
                                  {donation.type.charAt(0).toUpperCase() + donation.type.slice(1)} Donation
                                </h4>
                              </div>
                              
                              <div className="text-sm text-muted-foreground">
                                To: {region?.name || "Unknown Region"}
                              </div>
                              
                              {donation.description && (
                                <div className="text-sm text-muted-foreground italic">
                                  "{donation.description}"
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                              <div className="font-semibold">
                                {donation.type === "money" ? formatCurrency(donation.amount) : donation.amount}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(donation.date)}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Donation Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Donation Analytics</CardTitle>
                  <CardDescription>
                    Insights into your giving patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {userDonations?.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        Analytics will appear after you make your first donation
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Donation by Type */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Donations by Type</h4>
                        <div className="h-[200px]">
                          <ClientOnly fallback={<div className="h-[200px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={donationSummary}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={80}
                                  paddingAngle={2}
                                  dataKey="amount"
                                  label={({ type }) => type}
                                  labelLine={false}
                                >
                                  {donationSummary.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <RechartsTooltip
                                  formatter={(value: number) => [
                                    donationType === "money" ? formatCurrency(value) : value,
                                    "Amount"
                                  ]}
                                  contentStyle={{ 
                                    backgroundColor: 'var(--background)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '0.5rem',
                                    color: 'var(--foreground)'
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </ClientOnly>
                        </div>
                      </div>
                      
                      {/* Monthly Trend */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Monthly Trend</h4>
                        <div className="h-[200px]">
                          <ClientOnly fallback={<div className="h-[200px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={monthlyData}
                                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis 
                                  dataKey="month" 
                                  tick={{ fontSize: 10, fill: 'var(--foreground)' }}
                                  tickFormatter={(value) => value.split(' ')[0]}
                                />
                                <YAxis 
                                  tickFormatter={(value) => formatCurrency(value)}
                                  tick={{ fontSize: 10, fill: 'var(--foreground)' }}
                                />
                                <RechartsTooltip
                                  formatter={(value: number) => [formatCurrency(value), "Donated"]}
                                  contentStyle={{ 
                                    backgroundColor: 'var(--background)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '0.5rem',
                                    color: 'var(--foreground)'
                                  }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="amount"
                                  stroke="#3b82f6"
                                  strokeWidth={2}
                                  dot={{ fill: '#3b82f6', r: 4 }}
                                  activeDot={{ r: 6, fill: '#3b82f6' }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </ClientOnly>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}