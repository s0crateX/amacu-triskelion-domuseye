import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth/auth-context";
import { Toaster } from "sonner";

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
  title: "DomusEye - Modern Rental Management System",
  description: "Streamline your property management with DomusEye's comprehensive rental management platform. Manage properties, tenants, and maintenance efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
