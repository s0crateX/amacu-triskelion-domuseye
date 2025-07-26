import {
  Building2,
  Users,
  Settings,
  BarChart3,
  Shield,
  Clock,
  ArrowRight,
  AirVent,
  Search,
  Wifi,
  Bath,
  Car,
  MapPin,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Footer } from "@/components/layout/footer";

const features = [
  {
    icon: Building2,
    title: "Property Management",
    description:
      "Comprehensive property portfolio management with detailed analytics and reporting capabilities.",
  },
  {
    icon: Users,
    title: "Tenant Portal",
    description:
      "Self-service tenant portal for rent payments, maintenance requests, and communication.",
  },
  {
    icon: Settings,
    title: "Maintenance Tracking",
    description:
      "Streamlined maintenance workflow with automated scheduling and vendor management.",
  },
  {
    icon: BarChart3,
    title: "Financial Reports",
    description:
      "Real-time financial insights with customizable reports and expense tracking.",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description:
      "Bank-level security with compliance to industry standards and data protection.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description:
      "Round-the-clock customer support with dedicated account management.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  Modern Property Management
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                  Streamline Your{" "}
                  <span className="text-primary">Rental Business</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  DomusEye provides comprehensive property management solutions
                  that help you manage properties, tenants, and maintenance
                  operations efficiently.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Search BarBox Section */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-8 backdrop-blur-sm border border-border/50">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Find Your Perfect Home
                    </h3>
                  </div>
                  <div className="max-w-4xl mx-auto">
                    <Card className="bg-card/95 backdrop-blur-sm border border-border/50 shadow-2xl">
                      <CardContent className="p-6 sm:p-8">
                        {/* Search Input */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                          <div className="relative flex-1">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              placeholder="Search by location, property type, or keywords..."
                              className="pl-10 h-12 text-base border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                          </div>
                          <Button
                            size="lg"
                            className="h-12 px-8 text-lg font-semibold"
                          >
                            <Search className="mr-2 h-5 w-5" />
                            Search
                          </Button>
                        </div>

                        {/* Quick Filters */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-medium">Filters:</span>

                          <div className="flex items-center space-x-2">
                            <Checkbox id="ac" className="h-4 w-4" />
                            <label
                              htmlFor="ac"
                              className="cursor-pointer flex items-center"
                            >
                              <AirVent className="h-4 w-4 mr-1" />
                              Air Conditioning
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox id="wifi" className="h-4 w-4" />
                            <label
                              htmlFor="wifi"
                              className="cursor-pointer flex items-center"
                            >
                              <Wifi className="h-4 w-4 mr-1" />
                              WiFi
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox id="baths" className="h-4 w-4" />
                            <label
                              htmlFor="baths"
                              className="cursor-pointer flex items-center"
                            >
                              <Bath className="h-4 w-4 mr-1" />
                              2+ Baths
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox id="parking" className="h-4 w-4" />
                            <label
                              htmlFor="parking"
                              className="cursor-pointer flex items-center"
                            >
                              <Car className="h-4 w-4 mr-1" />
                              Large Lot
                            </label>
                          </div>
                        </div>

                        {/* Advanced Search Link */}
                        <div className="mt-6 pt-6 border-t border-border/50">
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Advanced Search Options
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Everything You Need to Manage Properties
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From tenant management to financial reporting, DomusEye provides
              all the tools you need to run a successful rental business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-border/50 hover:border-border transition-colors"
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Find Your Dream Property
            </h2>
            <p className="text-xl opacity-90">
              This option is more benefit-oriented. It directly tells the user
              what they will achieve by clicking &ndash; finding the property
              they desire. This aligns well with your headline &ldquo;Ready to
              Get Your Dream Property?&rdquo;
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8"
                asChild
              >
                <Link href="/register">
                  Sign Up
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                asChild
              >
                <Link href="/properties">Browse More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
