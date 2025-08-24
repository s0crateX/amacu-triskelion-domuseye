import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import FloatingChatbot from "@/components/chatbot-box";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth/auth-context";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/navbar";

const poppins = localFont({
  src: [
    {
      path: "../../public/assets/fonts/Poppins-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/Poppins-ThinItalic.ttf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../../public/assets/fonts/Poppins-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/Poppins-ExtraLightItalic.ttf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../../public/assets/fonts/Poppins-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/Poppins-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/assets/fonts/Poppins-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/Poppins-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/assets/fonts/Poppins-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/Poppins-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/assets/fonts/Poppins-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/Poppins-SemiBoldItalic.ttf",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../public/assets/fonts/Poppins-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/Poppins-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/assets/fonts/Poppins-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/Poppins-ExtraBoldItalic.ttf",
      weight: "800",
      style: "italic",
    },
    {
      path: "../../public/assets/fonts/Poppins-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/assets/fonts/Poppins-BlackItalic.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "DomusEye - AI Powered Rental Property Management Platform | Next.js",
  description:
    "DomusEye is an AI-powered website for rental property management built with Next.js. Streamline property rentals, tenant management, and real estate operations with intelligent automation and modern web technology.",
  keywords: [
    "domuseye",
    "ai powered website",
    "rental property management",
    "property rentals",
    "next js",
    "real estate management",
    "tenant management",
    "property management platform",
    "ai rental system",
    "smart property management",
    "rental management software",
    "property management next js",
  ],
  authors: [{ name: "Neurobytes Team" }],
  creator: "DomusEye",
  publisher: "DomusEye",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://amacu-triskelion-domuseye.vercel.app",
    siteName: "DomusEye",
    title: "DomusEye - AI Powered Rental Property Management Platform",
    description:
      "AI-powered website for rental property management built with Next.js. Modern, intelligent property and tenant management solution.",
    images: [
      {
        url: "/assets/images/logo.png",
        width: 1200,
        height: 630,
        alt: "DomusEye AI Powered Rental Property Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DomusEye - AI Powered Rental Property Management",
    description:
      "AI-powered website for rental property management built with Next.js",
    images: ["/assets/images/domuseye-twitter-card.jpg"],
    creator: "@domuseye",
  },
  alternates: {
    canonical: "https://amacu-triskelion-domuseye.vercel.app/",
  },
  category: "Real Estate Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <FloatingChatbot />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
