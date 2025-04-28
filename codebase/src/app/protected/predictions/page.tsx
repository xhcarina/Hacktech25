"use client"

import { useState, useEffect, useCallback } from "react"
import { useQuery, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Loader2, Download, Search, AlertTriangle, Users, Home, Package, Droplet, Filter, SortAsc, SortDesc } from "lucide-react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { motion } from "framer-motion"

export default function PredictionsPage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [activeSearchQuery, setActiveSearchQuery] = useState("")
  const [minSeverity, setMinSeverity] = useState<string>("0")
  const [sortBy, setSortBy] = useState<string>("Event_Severity")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isDownloading, setIsDownloading] = useState(false)
  
  const pageSize = 10
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])
  
  useEffect(() => {
    setActiveSearchQuery(debouncedSearchQuery)
    setCurrentPage(0)
  }, [debouncedSearchQuery])
  
  const individualsResult = useQuery(api.predictions.listIndividuals, {
    paginationOpts: {
      numItems: pageSize,
      cursor: currentPage === 0 ? null : currentPage.toString(),
    },
    searchQuery: activeSearchQuery.length > 0 ? activeSearchQuery : undefined,
    minSeverity: minSeverity !== "0" ? parseInt(minSeverity) : undefined,
    sortBy: sortBy as any,
    sortOrder: sortOrder,
  })
  
  const statistics = useQuery(api.predictions.getStatistics, {})
  
  const generateCsvData = useAction(api.predictions.generateCsvData)
  
  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(0)
  }
  
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc")
    setCurrentPage(0)
  }
  
  const handleDownload = async () => {
    setIsDownloading(true)
    
    try {
      const csvData = await generateCsvData({})
      
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `affected_individuals_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("CSV file downloaded successfully")
    } catch (error) {
      toast.error("Failed to download CSV", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    } finally {
      setIsDownloading(false)
    }
  }
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value)
  }
  
  const getSeverityColor = (level: number) => {
    if (level >= 8) return "bg-primary hover:bg-primary/90"
    if (level >= 6) return "bg-[hsl(var(--chart-4))] hover:bg-[hsl(var(--chart-4))/90]"
    if (level >= 4) return "bg-[hsl(var(--chart-2))] hover:bg-[hsl(var(--chart-2))/90]"
    if (level >= 2) return "bg-[hsl(var(--chart-3))] hover:bg-[hsl(var(--chart-3))/90]"
    return "bg-[hsl(var(--chart-1))] hover:bg-[hsl(var(--chart-1))/90]"
  }
  
  if (!individualsResult || !statistics) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  const { continueCursor, page: individuals } = individualsResult
  
  return (
    <div className="container pb-12">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-6 tracking-tight">Displaced Individuals Data</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Affected</p>
                  <p className="text-2xl font-bold">{statistics.totalIndividuals}</p>
                  <p className="text-xs text-muted-foreground mt-1">Individuals</p>
                </div>
                <div className="p-2 bg-[hsl(var(--chart-1))]/10 rounded-full">
                  <Users className="h-5 w-5 text-[hsl(var(--chart-1))]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Economic Loss</p>
                  <p className="text-2xl font-bold">{formatCurrency(statistics.totalEconomicLoss)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Across all individuals</p>
                </div>
                <div className="p-2 bg-[hsl(var(--chart-3))]/10 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-[hsl(var(--chart-3))]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Health Severity</p>
                  <p className="text-2xl font-bold">{statistics.averageHealthSeverity.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Scale of 1-10</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Average Event Severity</p>
                  <p className="text-2xl font-bold">{statistics.averageEventSeverity.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Scale of 1-100</p>
                </div>
                <div className="p-2 bg-[hsl(var(--chart-5))]/10 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-[hsl(var(--chart-5))]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2">
            <div className="w-[180px]">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Event_Severity">Event Severity</SelectItem>
                  <SelectItem value="Health_Severity_Score">Health Severity</SelectItem>
                  <SelectItem value="Economic_Loss_USD">Economic Loss</SelectItem>
                  <SelectItem value="Time_Since_Displacement_Days">Displacement Time</SelectItem>
                  <SelectItem value="Age">Age</SelectItem>
                  <SelectItem value="Family_Size">Family Size</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" size="icon" onClick={toggleSortOrder}>
              {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDownload} 
              disabled={isDownloading}
              className="whitespace-nowrap"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download CSV
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Displaced Individuals</CardTitle>
            <CardDescription>
              Detailed information about individuals affected by displacement events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Location Type</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Age Group</TableHead>
                    <TableHead>Family Size</TableHead>
                    <TableHead>Shelter Status</TableHead>
                    <TableHead>Food/Water Access</TableHead>
                    <TableHead>Health Risk</TableHead>
                    <TableHead>Health Score</TableHead>
                    <TableHead>Economic Loss</TableHead>
                    <TableHead>Displacement Days</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Event Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {individuals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={15} className="h-24 text-center">
                        No individuals found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    individuals.map((individual) => (
                      <TableRow key={individual._id}>
                        <TableCell className="font-medium">{individual.Name}</TableCell>
                        <TableCell>{individual.Origin}</TableCell>
                        <TableCell>{individual.Location_Type}</TableCell>
                        <TableCell>{individual.Age}</TableCell>
                        <TableCell>{individual.Age_Group}</TableCell>
                        <TableCell>{individual.Family_Size}</TableCell>
                        <TableCell>{individual.Shelter_Status}</TableCell>
                        <TableCell>{individual.Food_Water_Access}</TableCell>
                        <TableCell>{individual.Health_Risk}</TableCell>
                        <TableCell>{individual.Health_Severity_Score}</TableCell>
                        <TableCell>{formatCurrency(individual.Economic_Loss_USD)}</TableCell>
                        <TableCell>{individual.Time_Since_Displacement_Days}</TableCell>
                        <TableCell>{formatDate(new Date(individual.Displacement_Start_Date).getTime())}</TableCell>
                        <TableCell>{individual.Displacement_End_Date ? formatDate(new Date(individual.Displacement_End_Date).getTime()) : "N/A"}</TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(individual.Event_Severity / 10)}>
                            {individual.Event_Severity.toFixed(2)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4 flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!continueCursor}
              >
                Next
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            <p>
              Showing page {currentPage + 1} of displaced individuals data.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}