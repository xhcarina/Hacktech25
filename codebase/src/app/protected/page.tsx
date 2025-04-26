"use client"
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TrendingUp, AlertTriangle, DollarSign, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Label, Pie, PieChart, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import * as React from "react";
import { motion } from "framer-motion";
import { ClientOnly } from "@/components/util/ClientOnly";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Format currency for display
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value)
}

// Chart configs
const economicLossConfig = {
  housing: {
    label: "Housing",
    color: "hsl(var(--chart-1))",
  },
  income: {
    label: "Income",
    color: "hsl(var(--chart-2))",
  },
  assets: {
    label: "Assets",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const severityConfig = {
  severity: {
    label: "Severity",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const donationTypeConfig = {
  money: {
    label: "Money",
    color: "hsl(var(--chart-1))",
  },
  food: {
    label: "Food",
    color: "hsl(var(--chart-2))",
  },
  supplies: {
    label: "Supplies",
    color: "hsl(var(--chart-3))",
  },
  volunteers: {
    label: "Volunteers",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export default function ProtectedPage() {
  const { user, isLoading: authLoading } = useAuth();
  const regions = useQuery(api.regions.listRegions);
  const userDonationsQuery = useQuery(
    api.donations.listUserDonations, 
    user ? { userId: user._id } : "skip"
  );
  const userDonations = user ? userDonationsQuery : undefined;
  
  // Generate economic loss data for chart
  const economicLossData = React.useMemo(() => {
    if (!regions) return [];
    
    return regions.map(region => ({
      name: region.name,
      housing: region.economicLoss.housing / 1000000000, // Convert to billions
      income: region.economicLoss.income / 1000000000,
      assets: region.economicLoss.assets / 1000000000,
      total: region.economicLoss.total / 1000000000,
      severity: region.severityLevel,
    }));
  }, [regions]);
  
  // Generate severity data for chart
  const severityData = React.useMemo(() => {
    if (!regions) return [];
    
    return regions.map(region => ({
      name: region.name,
      severity: region.severityLevel,
      fill: region.severityLevel >= 8 ? "#ef4444" : 
            region.severityLevel >= 6 ? "#f97316" :
            region.severityLevel >= 4 ? "#facc15" :
            region.severityLevel >= 2 ? "#22c55e" : "#3b82f6"
    }));
  }, [regions]);
  
  // Generate donation type data for chart
  const donationTypeData = React.useMemo(() => {
    if (!userDonations || userDonations.length === 0) {
      return [
        { name: "Money", value: 0, fill: "hsl(var(--chart-1))" },
        { name: "Food", value: 0, fill: "hsl(var(--chart-2))" },
        { name: "Supplies", value: 0, fill: "hsl(var(--chart-3))" },
        { name: "Volunteers", value: 0, fill: "hsl(var(--chart-4))" },
      ];
    }
    
    const typeCounts = userDonations.reduce((acc, donation) => {
      acc[donation.type] = (acc[donation.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return [
      { name: "Money", value: typeCounts.money || 0, fill: "hsl(var(--chart-1))" },
      { name: "Food", value: typeCounts.food || 0, fill: "hsl(var(--chart-2))" },
      { name: "Supplies", value: typeCounts.supplies || 0, fill: "hsl(var(--chart-3))" },
      { name: "Volunteers", value: typeCounts.volunteers || 0, fill: "hsl(var(--chart-4))" },
    ];
  }, [userDonations]);
  
  // Calculate total economic loss
  const totalEconomicLoss = React.useMemo(() => {
    if (!regions) return 0;
    return regions.reduce((total, region) => total + region.economicLoss.total, 0);
  }, [regions]);
  
  // Calculate total donations
  const totalDonations = React.useMemo(() => {
    if (!userDonations) return 0;
    return userDonations.reduce((total, donation) => 
      donation.type === "money" ? total + donation.amount : total, 0);
  }, [userDonations]);
  
  // Loading state
  if (authLoading || !regions) {
    return (
      <div className="container flex items-center justify-center min-h-[600px]">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-6 tracking-tight">Dashboard</h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Economic Loss</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalEconomicLoss)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Across {regions.length} regions</p>
                </div>
                <div className="p-2 bg-red-500/10 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Your Donations</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalDonations)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{userDonations?.length || 0} contributions</p>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">People Affected</p>
                  <p className="text-2xl font-bold">{(totalEconomicLoss / 15000).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Estimated impact</p>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-full">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Severity</p>
                  <p className="text-2xl font-bold">
                    {(regions.reduce((sum, r) => sum + r.severityLevel, 0) / regions.length).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Scale of 1-10</p>
                </div>
                <div className="p-2 bg-orange-500/10 rounded-full">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Economic Loss Chart */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Economic Loss by Region</CardTitle>
              <CardDescription>
                Breakdown by category (in billions USD)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ClientOnly fallback={<div className="h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
                <ChartContainer config={economicLossConfig}>
                  <BarChart 
                    accessibilityLayer 
                    data={economicLossData} 
                    margin={{ left: 0, right: 20 }}
                    style={{
                      "--color-housing": "hsl(var(--chart-1))",
                      "--color-income": "hsl(var(--chart-2))",
                      "--color-assets": "hsl(var(--chart-3))",
                    } as React.CSSProperties}
                  >
                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
                      tick={{ fill: "hsl(var(--foreground))" }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value}B`}
                      tick={{ fill: "hsl(var(--foreground))" }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar dataKey="housing" stackId="a" fill="var(--color-housing)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="income" stackId="a" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="assets" stackId="a" fill="var(--color-assets)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </ClientOnly>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-start gap-2 text-sm">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 font-medium leading-none">
                    Total: {formatCurrency(totalEconomicLoss)}
                  </div>
                  <div className="flex items-center gap-2 leading-none text-muted-foreground">
                    Housing, income, and asset losses
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>

          {/* Severity Chart */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Region Severity Levels</CardTitle>
              <CardDescription>Conflict impact severity (1-10 scale)</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ClientOnly fallback={<div className="h-[300px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
                <ChartContainer config={severityConfig}>
                  <BarChart 
                    accessibilityLayer 
                    data={severityData}
                    layout="vertical"
                    margin={{ left: 80, right: 20 }}
                  >
                    <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis
                      type="number"
                      domain={[0, 10]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--foreground))" }}
                    />
                    <YAxis 
                      dataKey="name"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--foreground))" }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar 
                      dataKey="severity" 
                      radius={4}
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </ClientOnly>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 font-medium leading-none">
                {regions.length} regions monitored
              </div>
              <div className="leading-none text-muted-foreground">
                Color indicates severity: red (high) to green (low)
              </div>
            </CardFooter>
          </Card>

          {/* Donation Type Chart */}
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Your Donation Types</CardTitle>
              <CardDescription>Distribution by category</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ClientOnly fallback={<div className="h-[180px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
                <ChartContainer
                  config={donationTypeConfig}
                  className="mx-auto aspect-square max-h-[180px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={donationTypeData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {donationTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-3xl font-bold"
                                >
                                  {userDonations?.length || 0}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground"
                                >
                                  Donations
                                </tspan>
                              </text>
                            )
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </ClientOnly>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 font-medium leading-none">
                Total amount: {formatCurrency(totalDonations)}
              </div>
              <div className="leading-none text-muted-foreground">
                Money, food, supplies, and volunteer contributions
              </div>
            </CardFooter>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}