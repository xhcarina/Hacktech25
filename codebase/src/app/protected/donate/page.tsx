"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { Doc } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Heart,
  DollarSign,
  Package,
  Utensils,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ClientOnly } from "@/components/util/ClientOnly";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getDonationTypeIcon = (type: string) => {
  switch (type) {
    case "money":
      return <DollarSign className="h-4 w-4" />;
    case "food":
      return <Utensils className="h-4 w-4" />;
    case "supplies":
      return <Package className="h-4 w-4" />;
    case "volunteers":
      return <Users className="h-4 w-4" />;
    default:
      return <Heart className="h-4 w-4" />;
  }
};

const getDonationTypeColor = (type: string) => {
  switch (type) {
    case "money":
      return "hsl(var(--primary))"; // primary color
    case "food":
      return "hsl(var(--chart-4))"; // orange/coral
    case "supplies":
      return "hsl(var(--chart-5))"; // purple
    case "volunteers":
      return "hsl(var(--chart-3))"; // teal
    default:
      return "hsl(var(--muted-foreground))"; // gray
  }
};

const getUrgencyColor = (level: "high" | "medium" | "low") => {
  switch (level) {
    case "high":
      return "bg-primary";
    case "medium":
      return "bg-[hsl(var(--chart-4))]";
    case "low":
      return "bg-[hsl(var(--chart-3))]";
    default:
      return "bg-[hsl(var(--chart-1))]";
  }
};

export default function DonatePage() {
  const { user, isLoading: authLoading } = useAuth();

  const [donationType, setDonationType] = useState<string>("money");
  const [amount, setAmount] = useState<string>("100");
  const [description, setDescription] = useState<string>("");
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("donate");

  const [showRecommendation, setShowRecommendation] = useState(false);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    recommendation: string;
    suggestedAmount: number;
    urgencyLevel: "high" | "medium" | "low";
    donationType: "money" | "food" | "supplies" | "volunteers";
    reasoning: string;
  } | null>(null);

  const regions = useQuery(api.regions.listRegions);
  const userDonations = user
    ? useQuery(api.donations.listUserDonations, { userId: user._id })
    : undefined;

  const createDonation = useMutation(api.donations.createDonation);
  const getRecommendation = useAction(api.recommendations.getRecommendation);

  const resetForm = () => {
    setDonationType("money");
    setAmount("100");
    setDescription("");
    setSelectedRegionId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRegionId) {
      toast.error("Region required", {
        description: "Please select a region to support",
      });
      return;
    }

    if (!amount || parseInt(amount) < 1) {
      toast.error("Valid amount required", {
        description: "Please enter a valid amount",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createDonation({
        userId: user!._id,
        regionId: selectedRegionId as any,
        type: donationType as any,
        amount: parseInt(amount),
        description: description || undefined,
      });

      toast.success("Donation submitted", {
        description: "Thank you for your contribution!",
      });

      resetForm();
    } catch (error) {
      toast.error("Failed to submit donation", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetRecommendation = async () => {
    if (!selectedRegionId) {
      toast.error("Region required", {
        description: "Please select a region to get a recommendation"
      })
      return
    }
    
    setIsLoadingRecommendation(true)
    
    try {
      const result = await getRecommendation({ 
        regionId: selectedRegionId as any
      })
      
      setRecommendation(result)
      setShowRecommendation(true)
      
    } catch (error) {
      toast.error("Failed to get recommendation", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
    } finally {
      setIsLoadingRecommendation(false)
    }
  };

  const applyRecommendation = () => {
    if (recommendation) {
      setDonationType(recommendation.donationType);
      setAmount(recommendation.suggestedAmount.toString());
      setDescription(recommendation.recommendation);
      setShowRecommendation(false);
    }
  };

  const generateDonationSummary = () => {
    if (!userDonations || userDonations.length === 0) return [];

    const summary = userDonations.reduce((acc, donation) => {
      acc[donation.type] = (acc[donation.type] || 0) + donation.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(summary).map(([type, amount]) => ({
      type,
      amount,
      color: getDonationTypeColor(type),
    }));
  };

  const generateMonthlyData = () => {
    if (!userDonations || userDonations.length === 0) return [];

    const monthlyData: Record<string, number> = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      monthlyData[monthKey] = 0;
    }

    userDonations.forEach((donation) => {
      const date = new Date(donation.date);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey] += donation.amount;
      }
    });

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount,
    }));
  };

  const donationSummary = generateDonationSummary();
  const monthlyData = generateMonthlyData();

  const totalDonated =
    userDonations?.reduce((total, donation) => total + donation.amount, 0) || 0;

  if (authLoading) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container pb-12">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-6 tracking-tight">
          Donor Contributions
        </h2>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="donate">Make a Donation</TabsTrigger>
            <TabsTrigger value="history">Donation History</TabsTrigger>
          </TabsList>

          <TabsContent value="donate">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Make a Contribution</CardTitle>
                  <CardDescription>
                    Support displaced populations in conflict regions with your
                    donation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="region">Select Region</Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Select
                            value={selectedRegionId}
                            onValueChange={setSelectedRegionId}
                          >
                            <SelectTrigger id="region">
                              <SelectValue placeholder="Select a region to support" />
                            </SelectTrigger>
                            <SelectContent>
                              {regions?.map((region) => (
                                <SelectItem key={region._id} value={region._id}>
                                  {region.name} (Severity:{" "}
                                  {region.severityLevel}/10)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-shrink-0"
                          onClick={handleGetRecommendation}
                          disabled={
                            !selectedRegionId || isLoadingRecommendation
                          }
                        >
                          {isLoadingRecommendation ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                          )}
                          AI Recommendation
                        </Button>
                      </div>
                    </div>

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

                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        {donationType === "money"
                          ? "Amount ($)"
                          : donationType === "volunteers"
                          ? "Number of Volunteers"
                          : "Quantity"}
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

                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Add details about your donation..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
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

              <Card>
                <CardHeader>
                  <CardTitle>Your Impact</CardTitle>
                  <CardDescription>
                    How your contributions make a difference
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-primary/10 rounded-md">
                    <div className="text-sm text-muted-foreground mb-1">
                      Total Contributions
                    </div>
                    <div className="text-3xl font-bold">
                      {formatCurrency(totalDonated)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Across {userDonations?.length || 0} donations
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Estimated Impact</h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-secondary/50 rounded-md">
                        <div className="flex items-center gap-2 text-sm font-medium mb-1">
                          <Users className="h-4 w-4 text-primary" />
                          <span>People Helped</span>
                        </div>
                        <div className="text-lg font-semibold">
                          {Math.round(totalDonated / 100)}
                        </div>
                      </div>

                      <div className="p-3 bg-secondary/50 rounded-md">
                        <div className="flex items-center gap-2 text-sm font-medium mb-1">
                          <Package className="h-4 w-4 text-[hsl(var(--chart-5))]" />
                          <span>Aid Packages</span>
                        </div>
                        <div className="text-lg font-semibold">
                          {Math.round(totalDonated / 250)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Donation Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[hsl(var(--chart-3))] mt-0.5 shrink-0" />
                        <span>
                          Monetary donations provide the most flexibility for
                          aid organizations
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[hsl(var(--chart-3))] mt-0.5 shrink-0" />
                        <span>
                          Food and supplies are critical in regions with limited
                          access
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[hsl(var(--chart-3))] mt-0.5 shrink-0" />
                        <span>
                          Volunteer time can be as valuable as financial
                          contributions
                        </span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      <h3 className="text-lg font-medium mb-2">
                        No donations yet
                      </h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Make your first contribution to help displaced
                        populations
                      </p>
                      <Button onClick={() => setActiveTab("donate")}>
                        Make a Donation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userDonations?.map((donation) => {
                        const region = regions?.find(
                          (r) => r._id === donation.regionId
                        );

                        return (
                          <div
                            key={donation._id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="space-y-1 mb-3 sm:mb-0">
                              <div className="flex items-center gap-2">
                                <div
                                  className="p-1.5 rounded-full"
                                  style={{
                                    backgroundColor: `${getDonationTypeColor(
                                      donation.type
                                    )}20`,
                                  }}
                                >
                                  {getDonationTypeIcon(donation.type)}
                                </div>
                                <h4 className="font-medium">
                                  {donation.type.charAt(0).toUpperCase() +
                                    donation.type.slice(1)}{" "}
                                  Donation
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
                                {donation.type === "money"
                                  ? formatCurrency(donation.amount)
                                  : donation.amount}
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(donation.date)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

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
                      <div className="space-y-2">
                        <h4 className="font-medium">Donations by Type</h4>
                        <div className="h-[200px]">
                          <ClientOnly
                            fallback={
                              <div className="h-[200px] flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                              </div>
                            }
                          >
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
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  ))}
                                </Pie>
                                <RechartsTooltip
                                  formatter={(value: number) => [
                                    donationType === "money"
                                      ? formatCurrency(value)
                                      : value,
                                    "Amount",
                                  ]}
                                  contentStyle={{
                                    backgroundColor: "var(--background)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "0.5rem",
                                    color: "var(--foreground)",
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </ClientOnly>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Monthly Trend</h4>
                        <div className="h-[200px]">
                          <ClientOnly
                            fallback={
                              <div className="h-[200px] flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                              </div>
                            }
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={monthlyData}
                                margin={{
                                  top: 5,
                                  right: 5,
                                  left: 5,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="var(--border)"
                                />
                                <XAxis
                                  dataKey="month"
                                  tick={{
                                    fontSize: 10,
                                    fill: "var(--foreground)",
                                  }}
                                  tickFormatter={(value) => value.split(" ")[0]}
                                />
                                <YAxis
                                  tickFormatter={(value) =>
                                    formatCurrency(value)
                                  }
                                  tick={{
                                    fontSize: 10,
                                    fill: "var(--foreground)",
                                  }}
                                />
                                <RechartsTooltip
                                  formatter={(value: number) => [
                                    formatCurrency(value),
                                    "Donated",
                                  ]}
                                  contentStyle={{
                                    backgroundColor: "var(--background)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "0.5rem",
                                    color: "var(--foreground)",
                                  }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="amount"
                                  stroke="#3b82f6"
                                  strokeWidth={2}
                                  dot={{ fill: "#3b82f6", r: 4 }}
                                  activeDot={{ r: 6, fill: "#3b82f6" }}
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

      <Dialog open={showRecommendation} onOpenChange={setShowRecommendation}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              AI Donation Recommendation
            </DialogTitle>
            <DialogDescription>
              Based on region severity, urgency, and available resources
            </DialogDescription>
          </DialogHeader>

          {recommendation && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Urgency Level:</h4>
                <Badge className={getUrgencyColor(recommendation.urgencyLevel)}>
                  {recommendation.urgencyLevel.toUpperCase()}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="font-medium">Recommended Type:</h4>
                <div className="flex items-center gap-2">
                  {getDonationTypeIcon(recommendation.donationType)}
                  <span className="capitalize">
                    {recommendation.donationType}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="font-medium">Suggested Amount:</h4>
                <span className="font-bold">
                  {recommendation.donationType === "money"
                    ? formatCurrency(recommendation.suggestedAmount)
                    : recommendation.suggestedAmount}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recommendation:</h4>
                <p className="text-sm">{recommendation.recommendation}</p>
              </div>

              <div className="space-y-2 bg-muted/30 p-4 rounded-md">
                <h4 className="font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Reasoning:
                </h4>
                <p className="text-sm text-muted-foreground">
                  {recommendation.reasoning}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRecommendation(false)}
            >
              Cancel
            </Button>
            <Button onClick={applyRecommendation}>Apply Recommendation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}