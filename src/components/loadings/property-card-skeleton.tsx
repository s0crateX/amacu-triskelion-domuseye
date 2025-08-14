import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const PropertyCardSkeleton = () => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group border-0 shadow-sm">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <Skeleton className="w-full h-full" />

        {/* Badges Placeholder */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Skeleton className="h-6 w-12 rounded" />
          <Skeleton className="h-6 w-20 rounded" />
        </div>

        {/* Like Button Placeholder */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* Price Badge Placeholder */}
        <div className="absolute bottom-3 right-3">
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>

      <CardHeader className="p-3 pb-2">
        <div className="space-y-2">
          {/* Title */}
          <Skeleton className="h-5 w-3/4" />

          <div className="flex items-center justify-between">
            {/* Location */}
            <div className="flex items-center flex-1">
              <Skeleton className="h-4 w-4 mr-1 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
            {/* Price */}
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 pt-0 space-y-2">
        {/* Property Details Grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-1.5 bg-muted/30 rounded"
            >
              <Skeleton className="h-3 w-3 mr-1 rounded" />
              <Skeleton className="h-3 w-4" />
            </div>
          ))}
        </div>

        {/* Amenities Placeholder */}
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-muted/30 px-1.5 py-0.5 rounded"
            >
              <Skeleton className="h-2.5 w-2.5 rounded" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
          <div className="bg-muted/30 px-1.5 py-0.5 rounded">
            <Skeleton className="h-3 w-6" />
          </div>
        </div>

        {/* Property Stats */}
        <div className="flex justify-between items-center pt-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Skeleton className="h-2.5 w-2.5 rounded" />
              <Skeleton className="h-3 w-6" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-2.5 w-2.5 rounded" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-2.5 w-2.5 rounded" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-2">
        <Skeleton className="w-full h-8 rounded" />
      </CardFooter>
    </Card>
  );
};

export const PropertiesLoadingSkeleton = ({
  count = 3,
}: {
  count?: number;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-15">
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
};
