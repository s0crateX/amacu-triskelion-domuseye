// Replaced skeleton loading with circular spinner for better UX

export default function CommunityBoardLoading() {
  return (
    <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 max-w-7xl">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community board...</p>
        </div>
      </div>
    </div>
  );
}
