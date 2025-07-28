import {
  Building2,
  Users,
  Settings,
  BarChart3,
  Shield,
  Clock,
  ArrowRight,
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
import Image from "next/image";
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
      <section className="relative py-5 lg:py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 mx-4">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  Modern Property Management
                </Badge>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                  Streamline Your{" "}
                  <span className="text-primary">Rental Business</span>
                </h1>
                <p className="text-[14px] xl:text-[16px] text-muted-foreground max-w-2xl">
                  DomusEye provides comprehensive rental property management
                  solutions that helps you manage properties, tenants, and
                  maintenance operations efficiently, while providing future
                  tenants many choices and good agent support.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-[50%] xl:mx-auto justify-center items-center">
                <Button size="lg" className="text-lg xl:px-8">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Search BarBox Section */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 via-secondary/15 to-primary/10 rounded-3xl p-10 backdrop-blur-lg border border-border/30 shadow-2xl">
                <div className="space-y-8">
                  {/* Enhanced Title Section */}
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full border border-primary/30">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-primary">
                        AI Powered
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-slate-700 to-primary bg-clip-text text-transparent">
                      Your New Companion
                    </h2>
                    <h3 className="text-xl md:text-2xl font-semibold text-muted-foreground">
                      AI Robot Eyebot
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Meet your intelligent assistant, ready to help you
                      navigate and explore with advanced AI capabilities.
                    </p>
                  </div>

                  {/* Enhanced Image Section */}
                  <div className="flex justify-center">
                    <div className="group relative w-fit">
                      {/* Outer glow effect */}
                      <div className="absolute -inset-3 bg-gradient-to-r from-primary/40 via-secondary/30 to-primary/40 rounded-full opacity-60 blur-xl transition-all duration-700 group-hover:opacity-100 group-hover:blur-2xl"></div>

                      {/* Inner glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-full opacity-50 blur-lg transition-all duration-500 group-hover:opacity-80"></div>

                      {/* Image container with enhanced styling */}
                      <div className="relative bg-gradient-to-br from-background/80 to-background/40 rounded-full p-2 backdrop-blur-sm border border-primary/20">
                        <Image
                          src="/assets/images/Eyebot.png"
                          alt="AI Robot Eyebot - Your Intelligent Companion"
                          width={200}
                          height={200}
                          className="relative transition-all duration-700 hover:scale-110 active:scale-95 drop-shadow-2xl mx-auto"
                        />
                      </div>

                      {/* Enhanced floating particles effect */}
                      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary rounded-full animate-ping opacity-60"></div>
                      <div
                        className="absolute top-3/4 right-1/4 w-1 h-1 bg-secondary rounded-full animate-ping opacity-40"
                        style={{ animationDelay: "1s" }}
                      ></div>
                      <div
                        className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-primary rounded-full animate-ping opacity-50"
                        style={{ animationDelay: "2s" }}
                      ></div>
                      <div
                        className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-blue-400 rounded-full animate-ping opacity-45"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                      <div
                        className="absolute bottom-1/3 left-1/4 w-0.5 h-0.5 bg-purple-400 rounded-full animate-ping opacity-35"
                        style={{ animationDelay: "1.5s" }}
                      ></div>
                      <div
                        className="absolute top-2/3 left-2/3 w-1 h-1 bg-green-400 rounded-full animate-ping opacity-40"
                        style={{ animationDelay: "2.5s" }}
                      ></div>
                      <div
                        className="absolute top-1/6 right-1/6 w-0.5 h-0.5 bg-yellow-400 rounded-full animate-ping opacity-30"
                        style={{ animationDelay: "3s" }}
                      ></div>
                      <div
                        className="absolute bottom-1/6 right-2/3 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-45"
                        style={{ animationDelay: "3.5s" }}
                      ></div>
                      <div
                        className="absolute top-5/6 left-1/6 w-0.5 h-0.5 bg-cyan-400 rounded-full animate-ping opacity-35"
                        style={{ animationDelay: "4s" }}
                      ></div>
                      <div
                        className="absolute bottom-2/3 right-1/5 w-0.5 h-0.5 bg-orange-400 rounded-full animate-ping opacity-40"
                        style={{ animationDelay: "4.5s" }}
                      ></div>
                    </div>
                  </div>

                  {/* Feature highlights */}
                  <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Always Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Helpful Navigator</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 lg:py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="w-fit mx-auto">
              Features
            </Badge>
            <h2 className="text-2xl sm:text-4xl lg:text-4xl font-bold tracking-tight">
              Everything You Need to Manage Properties
            </h2>
            <p className="text-[16px] text-muted-foreground max-w-3xl mx-auto">
              DomusEye provides comprehensive rental property management
              solutions that helps you manage properties, tenants, and
              maintenance operations efficiently, while providing future tenants
              many choices and good agent support.
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
                <Link href="/dashboard/register">
                  Sign Up
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 border-primary dark:text-background text-foreground"
                asChild
              >
                <Link href="/dashboard/properties">Browse More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
