"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, AlertTriangle, Users, SortAsc, SortDesc } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"
import { motion } from "framer-motion"

const sampleIndividuals = [
  {
    "Name": "Christina Ward",
    "Origin": "Mexico",
    "Location_Type": "Urban",
    "Event_Severity": 66.38669849037136,
    "Economic_Loss_USD": 2231.75,
    "Shelter_Status": "None",
    "Food_Water_Access": "Partial",
    "Health_Risk": "No Risk",
    "Health_Severity_Score": 0.0,
    "Family_Size": 5,
    "Time_Since_Displacement_Days": 190,
    "Displacement_Start_Date": "2024-10-18",
    "Displacement_End_Date": "2025-12-06",
    "Age": 6,
    "Age_Group": "Child (0-17)",
    "Shelter_Status_Num": 1.0,
    "Food_Water_Access_Num": 0.5,
    "Location_Type_Num": 0.3,
    "Age_Group_Num": 1.0,
    "Urgency_Score": 57.14660565942685
  },
  {
    "Name": "Bradley Jackson",
    "Origin": "Bhutan",
    "Location_Type": "Urban",
    "Event_Severity": 71.14382328837071,
    "Economic_Loss_USD": 2183.45,
    "Shelter_Status": "Partial",
    "Food_Water_Access": "Partial",
    "Health_Risk": "No Risk",
    "Health_Severity_Score": 0.0,
    "Family_Size": 8,
    "Time_Since_Displacement_Days": 438,
    "Displacement_Start_Date": "2024-02-13",
    "Displacement_End_Date": "2025-05-01",
    "Age": 36,
    "Age_Group": "Adult (18-59)",
    "Shelter_Status_Num": 0.5,
    "Food_Water_Access_Num": 0.5,
    "Location_Type_Num": 0.3,
    "Age_Group_Num": 0.0,
    "Urgency_Score": 47.87598281916372
  },
  {
    "Name": "Charles Simmons",
    "Origin": "Botswana",
    "Location_Type": "Rural",
    "Event_Severity": 76.79023024504636,
    "Economic_Loss_USD": 2481.9,
    "Shelter_Status": "Partial",
    "Food_Water_Access": "Partial",
    "Health_Risk": "No Risk",
    "Health_Severity_Score": 0.0,
    "Family_Size": 7,
    "Time_Since_Displacement_Days": 32,
    "Displacement_Start_Date": "2025-03-25",
    "Displacement_End_Date": "2026-03-18",
    "Age": 10,
    "Age_Group": "Child (0-17)",
    "Shelter_Status_Num": 0.5,
    "Food_Water_Access_Num": 0.5,
    "Location_Type_Num": 0.7,
    "Age_Group_Num": 1.0,
    "Urgency_Score": 55.21483648625792
  },
  {
    "Name": "Zachary Holmes",
    "Origin": "South Sudan",
    "Location_Type": "Urban",
    "Event_Severity": 51.10686749016529,
    "Economic_Loss_USD": 4435.45,
    "Shelter_Status": "Partial",
    "Food_Water_Access": "Partial",
    "Health_Risk": "No Risk",
    "Health_Severity_Score": 0.0,
    "Family_Size": 2,
    "Time_Since_Displacement_Days": 411,
    "Displacement_Start_Date": "2024-03-11",
    "Displacement_End_Date": "2024-05-04",
    "Age": 77,
    "Age_Group": "Elder (60+)",
    "Shelter_Status_Num": 0.5,
    "Food_Water_Access_Num": 0.5,
    "Location_Type_Num": 0.3,
    "Age_Group_Num": 0.7,
    "Urgency_Score": 45.00337271497708
  },
  {
    "Name": "Tanya Jones",
    "Origin": "Côte d'Ivoire",
    "Location_Type": "Rural",
    "Event_Severity": 79.90731916930041,
    "Economic_Loss_USD": 2081.95,
    "Shelter_Status": "Full",
    "Food_Water_Access": "None",
    "Health_Risk": "No Risk",
    "Health_Severity_Score": 0.0,
    "Family_Size": 2,
    "Time_Since_Displacement_Days": 220,
    "Displacement_Start_Date": "2024-09-18",
    "Displacement_End_Date": "2025-03-10",
    "Age": 53,
    "Age_Group": "Adult (18-59)",
    "Shelter_Status_Num": 0.0,
    "Food_Water_Access_Num": 1.0,
    "Location_Type_Num": 0.7,
    "Age_Group_Num": 0.0,
    "Urgency_Score": 47.68773210520853
  },
  {
    "Name": "Nicole Gray",
    "Origin": "Monaco",
    "Location_Type": "Rural",
    "Event_Severity": 73.80531775104038,
    "Economic_Loss_USD": 4343.94,
    "Shelter_Status": "Partial",
    "Food_Water_Access": "Full",
    "Health_Risk": "No Risk",
    "Health_Severity_Score": 0.0,
    "Family_Size": 5,
    "Time_Since_Displacement_Days": 486,
    "Displacement_Start_Date": "2023-12-27",
    "Displacement_End_Date": "2024-03-30",
    "Age": 41,
    "Age_Group": "Adult (18-59)",
    "Shelter_Status_Num": 0.5,
    "Food_Water_Access_Num": 0.0,
    "Location_Type_Num": 0.7,
    "Age_Group_Num": 0.0,
    "Urgency_Score": 48.24937746924165
  },
  {
    "Name": "Caleb Powell",
    "Origin": "Cook Islands",
    "Location_Type": "Urban",
    "Event_Severity": 68.12125363487631,
    "Economic_Loss_USD": 2975.67,
    "Shelter_Status": "Partial",
    "Food_Water_Access": "Partial",
    "Health_Risk": "No Risk",
    "Health_Severity_Score": 0.0,
    "Family_Size": 5,
    "Time_Since_Displacement_Days": 390,
    "Displacement_Start_Date": "2024-04-01",
    "Displacement_End_Date": "2024-07-27",
    "Age": 38,
    "Age_Group": "Adult (18-59)",
    "Shelter_Status_Num": 0.5,
    "Food_Water_Access_Num": 0.5,
    "Location_Type_Num": 0.3,
    "Age_Group_Num": 0.0,
    "Urgency_Score": 46.24371624519159
  },
  {
    "Name": "Katelyn Cox",
    "Origin": "Martinique",
    "Location_Type": "Urban",
    "Event_Severity": 45.272909963730655,
    "Economic_Loss_USD": 3698.18,
    "Shelter_Status": "Partial",
    "Food_Water_Access": "None",
    "Health_Risk": "No Risk",
    "Health_Severity_Score": 0.0,
    "Family_Size": 5,
    "Time_Since_Displacement_Days": 179,
    "Displacement_Start_Date": "2024-10-29",
    "Displacement_End_Date": "2025-05-13",
    "Age": 54,
    "Age_Group": "Adult (18-59)",
    "Shelter_Status_Num": 0.5,
    "Food_Water_Access_Num": 1.0,
    "Location_Type_Num": 0.3,
    "Age_Group_Num": 0.0,
    "Urgency_Score": 45.82863846931695
  },
  {
    "Name": "Danielle Mcdonald",
    "Origin": "Martinique",
    "Location_Type": "Rural",
    "Event_Severity": 50.329952182164746,
    "Economic_Loss_USD": 3806.44,
    "Shelter_Status": "Partial",
    "Food_Water_Access": "Full",
    "Health_Risk": "No Risk",
    "Health_Severity_Score": 0.0,
    "Family_Size": 3,
    "Time_Since_Displacement_Days": 335,
    "Displacement_Start_Date": "2024-05-26",
    "Displacement_End_Date": "2024-09-23",
    "Age": 27,
    "Age_Group": "Adult (18-59)",
    "Shelter_Status_Num": 0.5,
    "Food_Water_Access_Num": 0.0,
    "Location_Type_Num": 0.7,
    "Age_Group_Num": 0.0,
    "Urgency_Score": 38.023419069792105
  },
  {
    "Name": "Jeffery Ellis",
    "Origin": "United Kingdom",
    "Location_Type": "Urban",
    "Event_Severity": 69.00072877814766,
    "Economic_Loss_USD": 2781.82,
    "Shelter_Status": "Partial",
    "Food_Water_Access": "Full",
    "Health_Risk": "Serious Injuries",
    "Health_Severity_Score": 0.7,
    "Family_Size": 3,
    "Time_Since_Displacement_Days": 224,
    "Displacement_Start_Date": "2024-09-14",
    "Displacement_End_Date": "2025-08-07",
    "Age": 61,
    "Age_Group": "Elder (60+)",
    "Shelter_Status_Num": 0.5,
    "Food_Water_Access_Num": 0.0,
    "Location_Type_Num": 0.3,
    "Age_Group_Num": 0.7,
    "Urgency_Score": 46.276684948816005
  },
  {
    "Name": "Robert Davis",
    "Origin": "Timor-Leste",
    "Location_Type": "Urban",
    "Event_Severity": 77.84491937274049,
    "Economic_Loss_USD": 1824.91,
    "Shelter_Status": "None",
    "Food_Water_Access": "Full",
    "Health_Risk": "Serious Injuries",
    "Health_Severity_Score": 0.7,
    "Family_Size": 6,
    "Time_Since_Displacement_Days": 406,
    "Displacement_Start_Date": "2024-03-16",
    "Displacement_End_Date": "2024-05-04",
    "Age": 27,
    "Age_Group": "Adult (18-59)",
    "Shelter_Status_Num": 1.0,
    "Food_Water_Access_Num": 0.0,
    "Location_Type_Num": 0.3,
    "Age_Group_Num": 0.0,
    "Urgency_Score": 57.28124751455286
  },
  {
    "Name": "Chase Fox",
    "Origin": "Bulgaria",
    "Location_Type": "Rural",
    "Event_Severity": 75.50597656424917,
    "Economic_Loss_USD": 1613.96,
    "Shelter_Status": "Partial",
    "Food_Water_Access": "None",
    "Health_Risk": "No Risk",
    "Health_Severity_Score": 0.0,
    "Family_Size": 3,
    "Time_Since_Displacement_Days": 401,
    "Displacement_Start_Date": "2024-03-21",
    "Displacement_End_Date": "2024-08-03",
    "Age": 37,
    "Age_Group": "Adult (18-59)",
    "Shelter_Status_Num": 0.5,
    "Food_Water_Access_Num": 1.0,
    "Location_Type_Num": 0.7,
    "Age_Group_Num": 0.0,
    "Urgency_Score": 57.46762947324181
  },
  {
    "Name": "Christopher Ruiz",
    "Origin": "Hungary",
    "Location_Type": "Urban",
    "Event_Severity": 80.72104559383517,
    "Economic_Loss_USD": 2218.45,
    "Shelter_Status": "None",
    "Food_Water_Access": "Partial",
    "Health_Risk": "Minor Injuries",
    "Health_Severity_Score": 0.3,
    "Family_Size": 1,
    "Time_Since_Displacement_Days": 368,
    "Displacement_Start_Date": "2024-04-23",
    "Displacement_End_Date": "2025-08-05",
    "Age": 20,
    "Age_Group": "Adult (18-59)",
    "Shelter_Status_Num": 1.0,
    "Food_Water_Access_Num": 0.5,
    "Location_Type_Num": 0.3,
    "Age_Group_Num": 0.0,
    "Urgency_Score": 59.42278918776844
  },
  {
    "Name": "Anna Sanders",
    "Origin": "Niger",
    "Location_Type": "Urban",
    "Event_Severity": 89.17128141116564,
    "Economic_Loss_USD": 2009.39,
    "Shelter_Status": "Full",
    "Food_Water_Access": "None",
    "Health_Risk": "No Risk",
    "Health_Severity_Score": 0.0,
    "Family_Size": 9,
    "Time_Since_Displacement_Days": 2,
    "Displacement_Start_Date": "2025-04-24",
    "Displacement_End_Date": "2026-01-24",
    "Age": 35,
    "Age_Group": "Adult (18-59)",
    "Shelter_Status_Num": 0.0,
    "Food_Water_Access_Num": 1.0,
    "Location_Type_Num": 0.3,
    "Age_Group_Num": 0.0,
    "Urgency_Score": 47.38330038215083
  },
  {
    "Name": "Kathryn White",
    "Origin": "Libya",
    "Location_Type": "Urban",
    "Event_Severity": 60.56441728977295,
    "Economic_Loss_USD": 2684.5,
    "Shelter_Status": "Partial",
    "Food_Water_Access": "None",
    "Health_Risk": "Minor Injuries",
    "Health_Severity_Score": 0.3,
    "Family_Size": 5,
    "Time_Since_Displacement_Days": 427,
    "Displacement_Start_Date": "2024-02-24",
    "Displacement_End_Date": "2024-10-26",
    "Age": 7,
    "Age_Group": "Child (0-17)",
    "Shelter_Status_Num": 0.5,
    "Food_Water_Access_Num": 1.0,
    "Location_Type_Num": 0.3,
    "Age_Group_Num": 1.0,
    "Urgency_Score": 58.28314321872153
  },
  {
    "Name": "Heather Coleman",
    "Origin": "Netherlands",
    "Location_Type": "Rural",
    "Event_Severity": 88.54525535986829,
    "Economic_Loss_USD": 3055.65,
    "Shelter_Status": "None",
    "Food_Water_Access": "None",
    "Health_Risk": "No Risk",
    "Health_Severity_Score": 0.0,
    "Family_Size": 3,
    "Time_Since_Displacement_Days": 22,
    "Displacement_Start_Date": "2025-04-04",
    "Displacement_End_Date": "2026-01-10",
    "Age": 15,
    "Age_Group": "Child (0-17)",
    "Shelter_Status_Num": 1.0,
    "Food_Water_Access_Num": 1.0,
    "Location_Type_Num": 0.7,
    "Age_Group_Num": 1.0,
    "Urgency_Score": 74.63178312290124
  },
  {
    "Name": "Wesley Murray",
    "Origin": "Luxembourg",
    "Location_Type": "Rural",
    "Event_Severity": 81.33087456944524,
    "Economic_Loss_USD": 2048.28,
    "Shelter_Status": "None",
    "Food_Water_Access": "None",
    "Health_Risk": "Minor Injuries",
    "Health_Severity_Score": 0.3,
    "Family_Size": 4,
    "Time_Since_Displacement_Days": 275,
    "Displacement_Start_Date": "2024-07-25",
    "Displacement_End_Date": "2025-11-16",
    "Age": 2,
    "Age_Group": "Child (0-17)",
    "Shelter_Status_Num": 1.0,
    "Food_Water_Access_Num": 1.0,
    "Location_Type_Num": 0.7,
    "Age_Group_Num": 1.0,
    "Urgency_Score": 76.37007357662435
  },
  {
    "Name": "Mrs. Sandra Ferguson",
    "Origin": "Tuvalu",
    "Location_Type": "Rural",
    "Event_Severity": 62.96807204029023,
    "Economic_Loss_USD": 1901.54,
    "Shelter_Status": "Partial",
    "Food_Water_Access": "Full",
    "Health_Risk": "No Risk",
    "Health_Severity_Score": 0.0,
    "Family_Size": 1,
    "Time_Since_Displacement_Days": 2,
    "Displacement_Start_Date": "2025-04-24",
    "Displacement_End_Date": "2025-10-17",
    "Age": 47,
    "Age_Group": "Adult (18-59)",
    "Shelter_Status_Num": 0.5,
    "Food_Water_Access_Num": 0.0,
    "Location_Type_Num": 0.7,
    "Age_Group_Num": 0.0,
    "Urgency_Score": 35.258521482344285
  },
  {
    "Name": "Krystal Paul",
    "Origin": "Gibraltar",
    "Location_Type": "Urban",
    "Event_Severity": 62.774320763794975,
    "Economic_Loss_USD": 2382.13,
    "Shelter_Status": "None",
    "Food_Water_Access": "None",
    "Health_Risk": "Minor Injuries",
    "Health_Severity_Score": 0.3,
    "Family_Size": 3,
    "Time_Since_Displacement_Days": 234,
    "Displacement_Start_Date": "2024-09-04",
    "Displacement_End_Date": "2025-01-26",
    "Age": 61,
    "Age_Group": "Elder (60+)",
    "Shelter_Status_Num": 1.0,
    "Food_Water_Access_Num": 1.0,
    "Location_Type_Num": 0.3,
    "Age_Group_Num": 0.7,
    "Urgency_Score": 64.37688505285976
  },
  {
    "Name": "Kelly Dixon",
    "Origin": "France",
    "Location_Type": "Urban",
    "Event_Severity": 90.44740768225265,
    "Economic_Loss_USD": 5003.73,
    "Shelter_Status": "Partial",
    "Food_Water_Access": "None",
    "Health_Risk": "No Risk",
    "Health_Severity_Score": 0.0,
    "Family_Size": 3,
    "Time_Since_Displacement_Days": 14,
    "Displacement_Start_Date": "2025-04-12",
    "Displacement_End_Date": "2025-11-22",
    "Age": 83,
    "Age_Group": "Elder (60+)",
    "Shelter_Status_Num": 0.5,
    "Food_Water_Access_Num": 1.0,
    "Location_Type_Num": 0.3,
    "Age_Group_Num": 0.7,
    "Urgency_Score": 62.25536433734924
  },
  {
    "Name": "Daniel Rivera",
    "Origin": "American Samoa",
    "Location_Type": "Urban",
    "Event_Severity": 62.70763742422524,
    "Economic_Loss_USD": 2225.73,
    "Shelter_Status": "Full",
    "Food_Water_Access": "Partial",
    "Health_Risk": "No Risk",
    "Health_Severity_Score": 0.0,
    "Family_Size": 2,
    "Time_Since_Displacement_Days": 113,
    "Displacement_Start_Date": "2025-01-03",
    "Displacement_End_Date": "2025-11-24",
    "Age": 57,
    "Age_Group": "Adult (18-59)",
    "Shelter_Status_Num": 0.0,
    "Food_Water_Access_Num": 0.5,
    "Location_Type_Num": 0.3,
    "Age_Group_Num": 0.0,
    "Urgency_Score": 29.94370922043449
  }
];

const calculateStatistics = () => {
  const totalIndividuals = sampleIndividuals.length;
  const totalEconomicLoss = sampleIndividuals.reduce((sum, ind) => sum + ind.Economic_Loss_USD, 0);
  const averageHealthSeverity = sampleIndividuals.reduce((sum, ind) => sum + ind.Health_Severity_Score, 0) / totalIndividuals;
  const averageEventSeverity = sampleIndividuals.reduce((sum, ind) => sum + ind.Event_Severity, 0) / totalIndividuals;
  
  return {
    totalIndividuals,
    totalEconomicLoss,
    averageHealthSeverity,
    averageEventSeverity
  };
};

export default function PredictionsTablePage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("Urgency_Score")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filteredData, setFilteredData] = useState(sampleIndividuals)
  
  const pageSize = 5
  const statistics = calculateStatistics()
  
  useEffect(() => {
    let result = [...sampleIndividuals];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.Name.toLowerCase().includes(query) || 
        item.Origin.toLowerCase().includes(query)
      );
    }
    
    result.sort((a, b) => {
      const aValue = a[sortBy as keyof typeof a];
      const bValue = b[sortBy as keyof typeof b];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    
    setFilteredData(result);
    setCurrentPage(0);
  }, [searchQuery, sortBy, sortOrder]);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])
  
  const handleSortChange = (value: string) => {
    setSortBy(value)
  }
  
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc")
  }
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value)
  }
  
  const getUrgencyColor = (level: number) => {
    if (level >= 55) return "bg-primary hover:bg-primary/90"
    if (level >= 50) return "bg-[hsl(var(--chart-4))] hover:bg-[hsl(var(--chart-4))/90]"
    if (level >= 45) return "bg-[hsl(var(--chart-2))] hover:bg-[hsl(var(--chart-2))/90]"
    if (level >= 40) return "bg-[hsl(var(--chart-3))] hover:bg-[hsl(var(--chart-3))/90]"
    return "bg-[hsl(var(--chart-1))] hover:bg-[hsl(var(--chart-1))/90]"
  }
  
  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }
  
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
  }
  
  return (
    <div className="px-4 pb-12 max-w-[calc(100%-20px)]">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-6 tracking-tight">Predictions Table</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="pt-4 px-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Individuals</p>
                  <p className="text-xl font-bold">{statistics.totalIndividuals}</p>
                  <p className="text-xs text-muted-foreground mt-1">In database</p>
                </div>
                <div className="p-2 bg-[hsl(var(--chart-1))]/10 rounded-full">
                  <Users className="h-4 w-4 text-[hsl(var(--chart-1))]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 px-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Economic Loss</p>
                  <p className="text-xl font-bold">{formatCurrency(statistics.totalEconomicLoss)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Across all individuals</p>
                </div>
                <div className="p-2 bg-[hsl(var(--chart-3))]/10 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-[hsl(var(--chart-3))]" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 px-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Health Severity</p>
                  <p className="text-xl font-bold">{statistics.averageHealthSeverity.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Scale of 1-10</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4 px-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Event Severity</p>
                  <p className="text-xl font-bold">{statistics.averageEventSeverity.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Scale of 1-100</p>
                </div>
                <div className="p-2 bg-[hsl(var(--chart-5))]/10 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-[hsl(var(--chart-5))]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 mb-6">
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
            <div className="w-[150px]">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Urgency_Score">Urgency Score</SelectItem>
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
          </div>
        </div>
        
        <Card className="overflow-hidden">
          <CardHeader className="px-3 py-3">
            <CardTitle className="text-base">Predictions Table</CardTitle>
            <CardDescription className="text-xs">
              Detailed information about individuals with urgency score predictions
              {paginatedData.length > 0 && ` (${filteredData.length} records found)`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-md border overflow-x-auto max-w-[calc(100vw-240px)]">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-2 py-2">Name</TableHead>
                    <TableHead className="px-2 py-2">Origin</TableHead>
                    <TableHead className="px-2 py-2">Location</TableHead>
                    <TableHead className="px-2 py-2">Age</TableHead>
                    <TableHead className="px-2 py-2">Age Group</TableHead>
                    <TableHead className="px-2 py-2">Family</TableHead>
                    <TableHead className="px-2 py-2">Shelter</TableHead>
                    <TableHead className="px-2 py-2">Food/Water</TableHead>
                    <TableHead className="px-2 py-2">Health Risk</TableHead>
                    <TableHead className="px-2 py-2">Health Score</TableHead>
                    <TableHead className="px-2 py-2">Economic Loss</TableHead>
                    <TableHead className="px-2 py-2">Days</TableHead>
                    <TableHead className="px-2 py-2">Start Date</TableHead>
                    <TableHead className="px-2 py-2">End Date</TableHead>
                    <TableHead className="px-2 py-2">Event Severity</TableHead>
                    <TableHead className="px-2 py-2">Urgency Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={16} className="h-24 text-center">
                        No individuals found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((individual, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium px-2 py-2">{individual.Name}</TableCell>
                        <TableCell className="px-2 py-2">{individual.Origin}</TableCell>
                        <TableCell className="px-2 py-2">{individual.Location_Type}</TableCell>
                        <TableCell className="px-2 py-2">{individual.Age}</TableCell>
                        <TableCell className="px-2 py-2">{individual.Age_Group}</TableCell>
                        <TableCell className="px-2 py-2">{individual.Family_Size}</TableCell>
                        <TableCell className="px-2 py-2">{individual.Shelter_Status}</TableCell>
                        <TableCell className="px-2 py-2">{individual.Food_Water_Access}</TableCell>
                        <TableCell className="px-2 py-2">{individual.Health_Risk}</TableCell>
                        <TableCell className="px-2 py-2">{individual.Health_Severity_Score}</TableCell>
                        <TableCell className="px-2 py-2">{formatCurrency(individual.Economic_Loss_USD)}</TableCell>
                        <TableCell className="px-2 py-2">{individual.Time_Since_Displacement_Days}</TableCell>
                        <TableCell className="px-2 py-2">{formatDate(individual.Displacement_Start_Date)}</TableCell>
                        <TableCell className="px-2 py-2">{individual.Displacement_End_Date ? formatDate(individual.Displacement_End_Date) : "N/A"}</TableCell>
                        <TableCell className="px-2 py-2">{individual.Event_Severity.toFixed(2)}</TableCell>
                        <TableCell className="px-2 py-2">
                          <Badge className={getUrgencyColor(individual.Urgency_Score)}>
                            {individual.Urgency_Score.toFixed(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-2 px-3 py-2 flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground px-3 py-2">
            <p>
              Showing page {currentPage + 1} of {totalPages} ({filteredData.length} records)
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}