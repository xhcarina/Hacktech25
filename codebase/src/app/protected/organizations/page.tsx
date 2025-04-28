"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Search, Plus, Building2, MapPin, Mail, Globe, CheckCircle, XCircle, Users, Home, Package, Droplet, Truck, DollarSign, Stethoscope } from "lucide-react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { motion } from "framer-motion"
import { Doc } from "@/convex/_generated/dataModel"

export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("browse")
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactEmail: "",
    website: "",
    selectedRegions: [] as string[],
    volunteersAvailable: "0",
    shelterCapacity: "0",
    foodStockTons: "0",
    waterStockLiters: "0",
    medicalSupplyUnits: "0",
    transportVehicles: "0",
    emergencyFundUSD: "0",
    fieldHospitalsSetup: "0"
  })
  
  const organizations = useQuery(api.organizations.listOrganizations, {
    verifiedOnly: showVerifiedOnly,
    searchQuery: searchQuery.length > 0 ? searchQuery : undefined
  })
  
  const regions = useQuery(api.regions.listRegions)
  
  const createOrganization = useMutation(api.organizations.createOrganization)
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (value === "" || /^\d+$/.test(value)) {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }
  
  const handleRegionToggle = (regionId: string) => {
    setFormData(prev => {
      const selectedRegions = [...prev.selectedRegions]
      
      if (selectedRegions.includes(regionId)) {
        return { 
          ...prev, 
          selectedRegions: selectedRegions.filter(id => id !== regionId) 
        }
      } else {
        return { 
          ...prev, 
          selectedRegions: [...selectedRegions, regionId] 
        }
      }
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.name.trim() === "") {
      toast.error("Organization name is required")
      return
    }
    
    if (formData.description.trim() === "") {
      toast.error("Description is required")
      return
    }
    
    if (formData.contactEmail.trim() === "") {
      toast.error("Contact email is required")
      return
    }
    
    if (formData.selectedRegions.length === 0) {
      toast.error("Please select at least one region")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await createOrganization({
        NGO_Name: formData.name,
        Mission_Statement: formData.description,
        Regions: formData.selectedRegions as any[],
        Email: formData.contactEmail,
        Emergency_Fund_USD: parseInt(formData.emergencyFundUSD) || 0,
        Field_Hospitals_Setup: parseInt(formData.fieldHospitalsSetup) || 0,
        Food_Stock_Tons: parseInt(formData.foodStockTons) || 0,
        Medical_Supply_Units: parseInt(formData.medicalSupplyUnits) || 0,
        Shelter_Capacity: parseInt(formData.shelterCapacity) || 0,
        Transport_Vehicles: parseInt(formData.transportVehicles) || 0,
        Volunteers_Available: parseInt(formData.volunteersAvailable) || 0,
        Water_Stock_Liters: parseInt(formData.waterStockLiters) || 0,
      })
      
      toast.success("Organization registered successfully", {
        description: "Your submission will be reviewed by our team."
      })
      
      setFormData({
        name: "",
        description: "",
        contactEmail: "",
        website: "",
        selectedRegions: [],
        volunteersAvailable: "0",
        shelterCapacity: "0",
        foodStockTons: "0",
        waterStockLiters: "0",
        medicalSupplyUnits: "0",
        transportVehicles: "0",
        emergencyFundUSD: "0",
        fieldHospitalsSetup: "0"
      })
      
      setActiveTab("browse")
    } catch (error) {
      toast.error("Failed to register organization", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (!organizations || !regions) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  const renderOrganizationCard = (org: Doc<"organizations">) => {
    const orgRegions = regions.filter(region => 
      org.Regions && org.Regions.includes(region._id)
    )
    
    return (
      <motion.div
        key={org._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{org.NGO_Name}</CardTitle>
              {org.verified ? (
                <Badge className="bg-[hsl(var(--chart-3))] hover:bg-[hsl(var(--chart-3))/90]">
                  <CheckCircle className="h-3 w-3 mr-1" /> Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <XCircle className="h-3 w-3 mr-1" /> Pending
                </Badge>
              )}
            </div>
            <CardDescription>{org.Mission_Statement}</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {orgRegions.length > 0 
                    ? `Active in ${orgRegions.length} region${orgRegions.length > 1 ? 's' : ''}: ${orgRegions.map(r => r.name).join(', ')}`
                    : "No regions specified"}
                </span>
              </div>
              
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{org.Email || "No email provided"}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">View Details</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {org.NGO_Name}
                    {org.verified && (
                      <Badge className="ml-2 bg-[hsl(var(--chart-3))] hover:bg-[hsl(var(--chart-3))/90]">
                        <CheckCircle className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription>{org.Mission_Statement}</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Regions Served</h4>
                    <div className="flex flex-wrap gap-2">
                      {orgRegions.map(region => (
                        <Badge key={region._id} variant="secondary">
                          {region.name} (Severity: {region.severityLevel}/10)
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Organization Capacity</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-2 border rounded-md">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" /> Volunteers
                        </div>
                        <p className="font-medium">{org.Volunteers_Available || 0}</p>
                      </div>
                      <div className="p-2 border rounded-md">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Home className="h-3 w-3" /> Shelter Capacity
                        </div>
                        <p className="font-medium">{org.Shelter_Capacity || 0}</p>
                      </div>
                      <div className="p-2 border rounded-md">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Package className="h-3 w-3" /> Food (tons)
                        </div>
                        <p className="font-medium">{org.Food_Stock_Tons || 0}</p>
                      </div>
                      <div className="p-2 border rounded-md">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Droplet className="h-3 w-3" /> Water (liters)
                        </div>
                        <p className="font-medium">{org.Water_Stock_Liters || 0}</p>
                      </div>
                      <div className="p-2 border rounded-md">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Stethoscope className="h-3 w-3" /> Medical Supplies
                        </div>
                        <p className="font-medium">{org.Medical_Supply_Units || 0}</p>
                      </div>
                      <div className="p-2 border rounded-md">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Truck className="h-3 w-3" /> Vehicles
                        </div>
                        <p className="font-medium">{org.Transport_Vehicles || 0}</p>
                      </div>
                      <div className="p-2 border rounded-md">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="h-3 w-3" /> Emergency Fund
                        </div>
                        <p className="font-medium">${org.Emergency_Fund_USD?.toLocaleString() || 0}</p>
                      </div>
                      <div className="p-2 border rounded-md">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Stethoscope className="h-3 w-3" /> Field Hospitals
                        </div>
                        <p className="font-medium">{org.Field_Hospitals_Setup || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Contact Email</h4>
                      <p className="text-sm">{org.Email || "No email provided"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Registration Date</h4>
                    <p className="text-sm">
                      {new Date(org._creationTime).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => window.open(`mailto:${org.Email || "info@example.org"}`, '_blank')}>
                    Contact Organization
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </motion.div>
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
        <h2 className="text-xl font-bold mb-6 tracking-tight">Aid Organizations</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="browse">Browse Organizations</TabsTrigger>
            <TabsTrigger value="register">Register Organization</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse">
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-9 w-full sm:w-[300px]"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verifiedOnly"
                  checked={showVerifiedOnly}
                  onCheckedChange={(checked) => setShowVerifiedOnly(!!checked)}
                />
                <Label htmlFor="verifiedOnly" className="text-sm cursor-pointer">
                  Show verified organizations only
                </Label>
              </div>
            </div>
            
            {organizations.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No organizations found</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? `No results found for "${searchQuery}". Try a different search term.` 
                    : "There are no organizations registered yet."}
                </p>
                <Button onClick={() => setActiveTab("register")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Register Organization
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map(renderOrganizationCard)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Register Organization</CardTitle>
                <CardDescription>
                  Register your organization to help coordinate aid efforts in conflict regions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">NGO Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter organization name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Mission Statement <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your organization's mission and activities"
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Contact Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        placeholder="contact@organization.org"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="www.organization.org"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Regions Assigned <span className="text-red-500">*</span></Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Select the regions where your organization operates
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {regions.map(region => (
                        <div key={region._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`region-${region._id}`}
                            checked={formData.selectedRegions.includes(region._id)}
                            onCheckedChange={() => handleRegionToggle(region._id)}
                          />
                          <Label 
                            htmlFor={`region-${region._id}`} 
                            className="text-sm cursor-pointer"
                          >
                            {region.name} (Severity: {region.severityLevel}/10)
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-base font-medium mb-3">Organization Capacity</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="volunteersAvailable">Volunteers Available</Label>
                        <Input
                          id="volunteersAvailable"
                          name="volunteersAvailable"
                          type="number"
                          min="0"
                          value={formData.volunteersAvailable}
                          onChange={handleNumericInputChange}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="shelterCapacity">Shelter Capacity</Label>
                        <Input
                          id="shelterCapacity"
                          name="shelterCapacity"
                          type="number"
                          min="0"
                          value={formData.shelterCapacity}
                          onChange={handleNumericInputChange}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="foodStockTons">Food Stock (Tons)</Label>
                        <Input
                          id="foodStockTons"
                          name="foodStockTons"
                          type="number"
                          min="0"
                          value={formData.foodStockTons}
                          onChange={handleNumericInputChange}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="waterStockLiters">Water Stock (Liters)</Label>
                        <Input
                          id="waterStockLiters"
                          name="waterStockLiters"
                          type="number"
                          min="0"
                          value={formData.waterStockLiters}
                          onChange={handleNumericInputChange}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="medicalSupplyUnits">Medical Supply Units</Label>
                        <Input
                          id="medicalSupplyUnits"
                          name="medicalSupplyUnits"
                          type="number"
                          min="0"
                          value={formData.medicalSupplyUnits}
                          onChange={handleNumericInputChange}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="transportVehicles">Transport Vehicles</Label>
                        <Input
                          id="transportVehicles"
                          name="transportVehicles"
                          type="number"
                          min="0"
                          value={formData.transportVehicles}
                          onChange={handleNumericInputChange}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="emergencyFundUSD">Emergency Fund (USD)</Label>
                        <Input
                          id="emergencyFundUSD"
                          name="emergencyFundUSD"
                          type="number"
                          min="0"
                          value={formData.emergencyFundUSD}
                          onChange={handleNumericInputChange}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fieldHospitalsSetup">Field Hospitals Setup</Label>
                        <Input
                          id="fieldHospitalsSetup"
                          name="fieldHospitalsSetup"
                          type="number"
                          min="0"
                          value={formData.fieldHospitalsSetup}
                          onChange={handleNumericInputChange}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Building2 className="mr-2 h-4 w-4" />
                          Register Organization
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Organizations will be verified by our team before being publicly listed
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}