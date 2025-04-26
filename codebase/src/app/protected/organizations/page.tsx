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
import { Loader2, Search, Plus, Building2, MapPin, Mail, Globe, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { motion } from "framer-motion"
import { Doc } from "@/convex/_generated/dataModel"

export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("browse")
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactEmail: "",
    website: "",
    selectedRegions: [] as string[]
  })
  
  // Queries
  const organizations = useQuery(api.organizations.listOrganizations, {
    verifiedOnly: showVerifiedOnly,
    searchQuery: searchQuery.length > 0 ? searchQuery : undefined
  })
  
  const regions = useQuery(api.regions.listRegions)
  
  // Mutations
  const createOrganization = useMutation(api.organizations.createOrganization)
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  // Handle region selection change
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
  
  // Handle form submission
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
        name: formData.name,
        description: formData.description,
        contactEmail: formData.contactEmail,
        website: formData.website || undefined,
        regionIds: formData.selectedRegions as any[]
      })
      
      toast.success("Organization registered successfully", {
        description: "Your submission will be reviewed by our team."
      })
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        contactEmail: "",
        website: "",
        selectedRegions: []
      })
      
      // Switch to browse tab
      setActiveTab("browse")
    } catch (error) {
      toast.error("Failed to register organization", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Loading state
  if (!organizations || !regions) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  // Render organization card
  const renderOrganizationCard = (org: Doc<"organizations">) => {
    // Find regions this organization works in
    const orgRegions = regions.filter(region => 
      org.regionIds.includes(region._id)
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
              <CardTitle className="text-xl">{org.name}</CardTitle>
              {org.verified ? (
                <Badge className="bg-green-500 hover:bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" /> Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  <XCircle className="h-3 w-3 mr-1" /> Pending
                </Badge>
              )}
            </div>
            <CardDescription>{org.description}</CardDescription>
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
                <span>{org.contactEmail}</span>
              </div>
              
              {org.website && (
                <div className="flex items-center text-sm">
                  <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                  <a 
                    href={org.website.startsWith('http') ? org.website : `https://${org.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {org.website}
                  </a>
                </div>
              )}
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
                    {org.name}
                    {org.verified && (
                      <Badge className="ml-2 bg-green-500 hover:bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription>{org.description}</DialogDescription>
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Contact Email</h4>
                      <p className="text-sm">{org.contactEmail}</p>
                    </div>
                    
                    {org.website && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Website</h4>
                        <a 
                          href={org.website.startsWith('http') ? org.website : `https://${org.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline"
                        >
                          {org.website}
                        </a>
                      </div>
                    )}
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
                  <Button variant="outline" onClick={() => window.open(`mailto:${org.contactEmail}`, '_blank')}>
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
          
          {/* Browse Organizations Tab */}
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
          
          {/* Register Organization Tab */}
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
                    <Label htmlFor="name">Organization Name <span className="text-red-500">*</span></Label>
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
                    <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
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
                    <Label>Regions Served <span className="text-red-500">*</span></Label>
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