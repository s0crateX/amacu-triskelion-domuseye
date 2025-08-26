"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Building, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Mail,
  BarChart3,
  Activity,
  AlertCircle,
  RefreshCw
} from "lucide-react"
import { 
  getAgentAnalytics, 
  getPropertyPerformance, 
  getActiveClients, 
  updatePropertyStatus,
  AgentStats,
  PropertyPerformance,
  ClientActivity
} from "@/lib/database/agent-analytics"
import { toast } from "sonner"

export default function AgentDashboard() {
  const router = useRouter()
  const { userData, loading } = useAuth()
  const [stats, setStats] = useState<AgentStats | null>(null)
  const [propertyPerformance, setPropertyPerformance] = useState<PropertyPerformance[]>([])
  const [activeClients, setActiveClients] = useState<ClientActivity[]>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch analytics data
  const fetchAnalytics = async () => {
    if (!userData?.uid) return
    
    try {
      setError(null)
      const [analyticsData, performanceData, clientsData] = await Promise.all([
        getAgentAnalytics(userData.uid),
        getPropertyPerformance(userData.uid, 5),
        getActiveClients(userData.uid, 5)
      ])
      
      setStats(analyticsData)
      setPropertyPerformance(performanceData)
      setActiveClients(clientsData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError('Failed to load dashboard data')
      toast.error('Failed to load dashboard data')
    } finally {
      setAnalyticsLoading(false)
      setRefreshing(false)
    }
  }

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
  }

  // Handle property status update
  const handlePropertyStatusUpdate = async (propertyId: string, status: 'verified' | 'rejected' | 'handling', reason?: string) => {
    if (!userData?.uid || !userData?.firstName) return
    
    try {
      await updatePropertyStatus(propertyId, userData.uid, `${userData.firstName} ${userData.lastName}`, status, reason)
      toast.success(`Property ${status} successfully`)
      await fetchAnalytics() // Refresh data
    } catch (error) {
      console.error('Error updating property status:', error)
      toast.error('Failed to update property status')
    }
  }

  // Handle message client navigation
  const handleMessageClient = (client: ClientActivity) => {
    // Navigate to messages page with client information
    router.push(`/users/agent/messages?clientId=${client.clientId}&clientName=${encodeURIComponent(client.clientName)}`)
  }

  useEffect(() => {
    if (userData?.uid) {
      fetchAnalytics()
    }
  }, [userData?.uid])

  if (loading || analyticsLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {userData?.firstName || 'Agent'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here&apos;s your agent dashboard overview
          </p>
          <Badge variant="secondary" className="mt-2">
            Agent Account
          </Badge>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.verifiedProperties || 0} verified, {stats?.pendingProperties || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeClients || 0}</div>
            <p className="text-xs text-muted-foreground">
              Current active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unreadMessages || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalMessages || 0} total messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.monthlyViews || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.monthlyInquiries || 0} inquiries, {stats?.conversionRate || 0}% conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Property Performance and Client Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Property Performance
            </CardTitle>
            <CardDescription>
              Top performing properties you&apos;ve verified
            </CardDescription>
          </CardHeader>
          <CardContent>
            {propertyPerformance.length > 0 ? (
              <div className="space-y-4">
                {propertyPerformance.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{property.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {property.views} views
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {property.inquiries} inquiries
                        </span>
                        <Badge variant={property.status === 'verified' ? 'default' : 'secondary'} className="text-xs">
                          {property.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No property performance data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Clients
            </CardTitle>
            <CardDescription>
              Recent client interactions and conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeClients.length > 0 ? (
              <div className="space-y-4">
                {activeClients.map((client) => (
                  <div key={client.clientId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-blue-100 dark:bg-blue-900/40">
                        {client.profilePicture ? (
                          <img 
                            src={client.profilePicture} 
                            alt={client.clientName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-xs font-medium text-blue-600 dark:text-blue-400">${client.clientName.split(' ').map(n => n[0]).join('')}</span>`;
                              }
                            }}
                          />
                        ) : (
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {client.clientName.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{client.clientName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {client.clientType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {client.totalMessages} messages
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleMessageClient(client)}
                        title={`Message ${client.clientName}`}
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No active client conversations
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks for agents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/users/agent/properties">
                <Building className="h-4 w-4 mr-2" />
                View All Properties
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/users/agent/messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                Check Messages
              </a>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/users/agent/eyenalyzer">
                <BarChart3 className="h-4 w-4 mr-2" />
                Property Analytics
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Status Overview</CardTitle>
            <CardDescription>
              Current status of properties in your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Verified Properties</span>
                </div>
                <Badge variant="default">{stats?.verifiedProperties || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Pending Review</span>
                </div>
                <Badge variant="secondary">{stats?.pendingProperties || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Rejected Properties</span>
                </div>
                <Badge variant="destructive">{stats?.rejectedProperties || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}