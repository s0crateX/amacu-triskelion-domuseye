"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot, DocumentData } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Property } from "@/types/property"
import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { PropertyCard } from "@/components/propertycard"

export default function AgentPropertiesPage() {
  const { loading: authLoading } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchProperties = () => {
    setLoading(true)
    setError(null)

    try {
      // Listen to all properties (avoid ordering by non-existent createdAt field)
      const propertiesRef = collection(db, "properties")

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        propertiesRef,
        (snapshot) => {
          try {
            const propertiesData: Property[] = snapshot.docs.map((doc) => {
              const data = doc.data() as DocumentData
              return {
                id: doc.id,
                area: data.area || 0,
                available: data.available ?? true,
                images: Array.isArray(data.images)
                  ? data.images
                  : data.image
                  ? [data.image]
                  : [],
                title: data.title || "",
                category: data.category || "",
                datePosted: data.datePosted || new Date().toISOString(),
                price: data.price || "",
                location: data.location || "",
                amenities: Array.isArray(data.amenities) ? data.amenities : [],
                beds: data.beds || 0,
                baths: data.baths || 0,
                sqft: data.sqft || 0,
                features: Array.isArray(data.features) ? data.features : [],
                isNew: data.isNew,
                isVerified: data.isVerified,
                type: data.type || "",
                uid: data.uid || "",
                latitude: data.latitude || 0,
                longitude: data.longitude || 0,
                address: data.address || "",
                description: data.description || "",
                landlord: Array.isArray(data.landlord) ? data.landlord : [],
                subtype: data.subtype || "",
                kitchen: data.kitchen || "",
                parking: data.parking || 0,
                landlordId: data.landlordId || "",
                landlordName: data.landlordName || "",
                views: data.views || 0,
                image: data.image,
                inquiries: data.inquiries,
                tenant: data.tenant,
                status: data.status,
                rating: data.rating,
                ...data,
              } as Property
            })

            // Optional: sort by datePosted descending (newest first)
            propertiesData.sort((a, b) => {
              const dateA = new Date(a.datePosted || 0).getTime()
              const dateB = new Date(b.datePosted || 0).getTime()
              return dateB - dateA
            })

            setProperties(propertiesData)
            setLoading(false)
            setError(null)
            setRetryCount(0)
          } catch (mapErr: unknown) {
            console.error("Error mapping properties:", mapErr)
            setError("Failed to parse properties data.")
            setLoading(false)
          }
        },
        (error) => {
          console.error("Error fetching properties:", error)
          setError(`Failed to load properties: ${error.message}`)
          setLoading(false)
        }
      )

      return unsubscribe
    } catch (error) {
      console.error("Error setting up properties listener:", error)
      setError(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setLoading(false)
      return null
    }
  }

  useEffect(() => {
    const unsubscribe = fetchProperties()
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [retryCount])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }



  if (authLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          All Properties
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Browse all available properties in real-time
        </p>
        <Badge variant="secondary" className="mt-2">
          Agent View
        </Badge>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Properties Grid */}
      {!loading && !error && (
        <>
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {properties.length} properties • Real-time updates enabled
          </div>
          
          {properties.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  There are currently no properties available in the database.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}