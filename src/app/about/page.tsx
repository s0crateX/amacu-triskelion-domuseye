import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "About DomusEye - AI Powered Rental Property Management Platform | Next.js",
  description: "Discover how DomusEye revolutionizes rental property management with AI-powered technology built on Next.js. Learn about our intelligent platform for property rentals, tenant management, and real estate automation.",
  keywords: [
    "domuseye about",
    "ai powered rental management",
    "property management platform",
    "next js rental system",
    "intelligent property management",
    "ai rental technology",
    "smart property platform",
    "rental management software"
  ],
};

export default function AboutPage() {
  // Redirect to the dashboard about page which has the full content
  redirect("/dashboard/about");
}