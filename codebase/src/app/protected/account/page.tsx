"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Loader2, User, Settings, Bell, Shield, Heart, Calendar, DollarSign, Package, Utensils, Users } from "lucide-react"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { motion } from "framer-motion"
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

export default function AccountPage() {
  const { user, isLoading: authLoading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<string>("profile")
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [displayName, setDisplayName] = useState<string>(user?.name || "")
  
  // Queries
  const userDonationsQuery = useQuery(
    api.donations.listUserDonations, 
    user ? { userId: user._id } : "skip"
  );
  const userDonations = user ? userDonationsQuery : undefined;
  
  // Calculate donation statistics
  const totalDonations = userDonations?.length || 0
  const totalAmount = userDonations?.reduce((sum, donation) => 
    donation.type === "money" ? sum + donation.amount : sum, 0) || 0
  
  const donationsByType = userDonations?.reduce((acc, donation) => {
    acc[donation.type] = (acc[donation.type] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}
  
  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    
    try {
      // In a real app, we would call a mutation to update the user profile
      // await updateUserProfile({ name: displayName })
      
      toast.success("Profile updated", {
        description: "Your profile information has been updated successfully."
      })
    } catch (error) {
      toast.error("Update failed", {
        description: error instanceof Error ? error.message : "An error occurred while updating your profile."
      })
    } finally {
      setIsUpdating(false)
    }
  }
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully")
    } catch (error) {
      toast.error("Sign out failed", {
        description: "An error occurred while signing out."
      })
    }
  }
  
  // Loading state
  if (authLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="container pb-12">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-6 tracking-tight">Account Settings</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ClientOnly>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-6">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                          <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-medium">{user?.name || "User"}</h3>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Your name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            value={user?.email || ""}
                            disabled
                            className="bg-muted"
                          />
                          <p className="text-xs text-muted-foreground">
                            Your email address is used for authentication and cannot be changed
                          </p>
                        </div>
                      </div>
                      
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Profile"
                        )}
                      </Button>
                    </form>
                  </ClientOnly>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                  <CardDescription>
                    Overview of your account activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ClientOnly>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Account Created</span>
                        <span className="font-medium">
                          {user?._creationTime ? formatDate(user._creationTime) : "N/A"}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Donations</span>
                        <span className="font-medium">{totalDonations}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Amount</span>
                        <span className="font-medium">{formatCurrency(totalAmount)}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Donation Types</h4>
                      
                      <div className="space-y-1">
                        {Object.entries(donationsByType).map(([type, count]) => (
                          <div key={type} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {getDonationTypeIcon(type)}
                              <span className="text-sm capitalize">{type}</span>
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        ))}
                        
                        {Object.keys(donationsByType).length === 0 && (
                          <p className="text-sm text-muted-foreground">No donations yet</p>
                        )}
                      </div>
                    </div>
                  </ClientOnly>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent donations and account activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClientOnly>
                  {userDonations && userDonations.length > 0 ? (
                    <div className="space-y-4">
                      {userDonations.slice(0, 5).map((donation) => (
                        <div 
                          key={donation._id} 
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-full"
                              style={{ 
                                backgroundColor: donation.type === "money" ? "rgba(59, 130, 246, 0.1)" :
                                              donation.type === "food" ? "rgba(249, 115, 22, 0.1)" :
                                              donation.type === "supplies" ? "rgba(139, 92, 246, 0.1)" :
                                              "rgba(236, 72, 153, 0.1)"
                              }}
                            >
                              {getDonationTypeIcon(donation.type)}
                            </div>
                            <div>
                              <div className="font-medium capitalize">{donation.type} Donation</div>
                              <div className="text-sm text-muted-foreground">
                                {donation.description || `${donation.type === "money" ? formatCurrency(donation.amount) : donation.amount} donated`}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(donation.date)}
                          </div>
                        </div>
                      ))}
                      
                      {userDonations.length > 5 && (
                        <Button variant="outline" className="w-full" onClick={() => window.location.href = "/protected/donate"}>
                          View All Donations
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No activity yet</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Make your first contribution to help displaced populations
                      </p>
                      <Button onClick={() => window.location.href = "/protected/donate"}>
                        Make a Donation
                      </Button>
                    </div>
                  )}
                </ClientOnly>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Manage your account preferences and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notifications
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emailNotifications" className="font-normal">Email Notifications</Label>
                          <p className="text-xs text-muted-foreground">Receive email updates about your donations</p>
                        </div>
                        <Switch id="emailNotifications" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="marketingEmails" className="font-normal">Marketing Emails</Label>
                          <p className="text-xs text-muted-foreground">Receive updates about new features and campaigns</p>
                        </div>
                        <Switch id="marketingEmails" />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Privacy & Security
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="twoFactorAuth" className="font-normal">Two-Factor Authentication</Label>
                          <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                        </div>
                        <Switch id="twoFactorAuth" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="dataSharing" className="font-normal">Data Sharing</Label>
                          <p className="text-xs text-muted-foreground">Allow anonymous usage data to improve our services</p>
                        </div>
                        <Switch id="dataSharing" defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                  <CardDescription>
                    Manage your account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => toast.info("Feature coming soon", {
                      description: "This feature is not yet implemented."
                    })}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Change Password
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => toast.info("Feature coming soon", {
                      description: "This feature is not yet implemented."
                    })}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Advanced Settings
                  </Button>
                  
                  <Separator />
                  
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}