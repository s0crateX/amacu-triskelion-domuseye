import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ApplicationsLoading() {
  return (
    <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 max-w-7xl">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full sm:w-40" />
      </div>

      {/* Application Cards Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex-shrink-0">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-28 mt-2" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 mb-6">
                {/* Email Section */}
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-4 w-56" />
                </div>
                {/* Message Section */}
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <div className="bg-muted/50 p-3 rounded-lg border">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-4/5 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Skeleton className="h-9 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
