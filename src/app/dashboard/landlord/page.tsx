"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Home, 
  Plus, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  BarChart3
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth/auth-context"

// Sample data
const dashboardStats = [
  {
    title: "Total Properties",
    value: "12",
    change: "+2 this month",
    icon: Home,
    color: "text-blue-600"
  },
  {
    title: "Active Tenants",
    value: "28",
    change: "+5 this month",
    icon: Users,
    color: "text-green-600"
  },
  {
    title: "Monthly Revenue",
    value: "₱420,000",
    change: "+12% from last month",
    icon: DollarSign,
    color: "text-yellow-600"
  },
  {
    title: "Occupancy Rate",
    value: "87%",
    change: "+3% from last month",
    icon: TrendingUp,
    color: "text-purple-600"
  }
]

const sampleProperties = [
  {
    id: 1,
    title: "Modern 2BR Apartment",
    location: "Makati City",
    rent: "₱35,000",
    tenant: "John Doe",
    status: "occupied",
    occupancy: 100,
    nextPayment: "2024-02-01"
  },
  {
    id: 2,
    title: "Cozy Studio Unit",
    location: "BGC, Taguig",
    rent: "₱28,000",
    tenant: "Jane Smith",
    status: "occupied",
    occupancy: 100,
    nextPayment: "2024-02-05"
  },
  {
    id: 3,
    title: "Family House",
    location: "Quezon City",
    rent: "₱50,000",
    tenant: null,
    status: "vacant",
    occupancy: 0,
    nextPayment: null
  }
]

const recentApplications = [
  {
    id: 1,
    applicant: "Maria Garcia",
    property: "Modern 2BR Apartment",
    date: "2024-01-15",
    status: "pending"
  },
  {
    id: 2,
    applicant: "Robert Chen",
    property: "Family House",
    date: "2024-01-14",
    status: "approved"
  },
  {
    id: 3,
    applicant: "Lisa Wong",
    property: "Cozy Studio Unit",
    date: "2024-01-13",
    status: "rejected"
  }
]

export default function LandlordDashboard() {
  const router = useRouter()
  const { user, userData, loading } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !userData) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {userData.firstName}!
          </h2>
          <p className="text-muted-foreground">
            Manage your properties and tenants efficiently
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {dashboardStats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.change}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>
                    Latest rental applications for your properties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentApplications.map((application) => (
                      <div key={application.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{application.applicant}</p>
                          <p className="text-sm text-muted-foreground">{application.property}</p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={
                              application.status === 'approved' ? 'default' :
                              application.status === 'pending' ? 'secondary' : 'destructive'
                            }
                          >
                            {application.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{application.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Property Performance</CardTitle>
                  <CardDescription>
                    Occupancy rates across your properties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sampleProperties.map((property) => (
                      <div key={property.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{property.title}</span>
                          <span>{property.occupancy}%</span>
                        </div>
                        <Progress value={property.occupancy} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">Your Properties</h3>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sampleProperties.map((property) => (
                <Card key={property.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{property.title}</CardTitle>
                        <CardDescription>{property.location}</CardDescription>
                      </div>
                      <Badge variant={property.status === 'occupied' ? 'default' : 'secondary'}>
                        {property.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Rent</span>
                        <span className="font-semibold">{property.rent}</span>
                      </div>
                      
                      {property.tenant && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Current Tenant</span>
                          <span className="font-medium">{property.tenant}</span>
                        </div>
                      )}
                      
                      {property.nextPayment && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Next Payment</span>
                          <span className="font-medium">{property.nextPayment}</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tenants">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Management</CardTitle>
                <CardDescription>
                  Manage your current tenants and their information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Tenant management features coming soon!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>Rental Applications</CardTitle>
                <CardDescription>
                  Review and manage rental applications for your properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{application.applicant}</h4>
                        <p className="text-sm text-muted-foreground">{application.property}</p>
                        <p className="text-xs text-muted-foreground">Applied on {application.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            application.status === 'approved' ? 'default' :
                            application.status === 'pending' ? 'secondary' : 'destructive'
                          }
                        >
                          {application.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Contact
                        </Button>
                        {application.status === 'pending' && (
                          <>
                            <Button size="sm">Approve</Button>
                            <Button variant="destructive" size="sm">Reject</Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Detailed insights into your property portfolio performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Advanced analytics and reporting features coming soon!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}