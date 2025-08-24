import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Properties - AI Powered Rental Property Management | DomusEye Next.js",
  description: "Browse and manage rental properties with DomusEye's AI-powered platform built on Next.js. Discover intelligent property management solutions, advanced search filters, and automated rental listings.",
  keywords: [
    "domuseye properties",
    "ai powered rental properties",
    "property management platform",
    "next js rental listings",
    "intelligent property search",
    "ai rental management",
    "smart property platform",
    "automated property listings",
    "rental property database",
    "property management system"
  ],
  openGraph: {
    title: "Properties - AI Powered Rental Property Management | DomusEye",
    description: "Browse and manage rental properties with DomusEye's AI-powered platform built on Next.js. Discover intelligent property management solutions.",
    type: "website",
    url: "https://domuseye.com/dashboard/properties",
  },
  twitter: {
    card: "summary_large_image",
    title: "Properties - AI Powered Rental Property Management | DomusEye",
    description: "Browse and manage rental properties with DomusEye's AI-powered platform built on Next.js.",
  },
};

export default function PropertiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}