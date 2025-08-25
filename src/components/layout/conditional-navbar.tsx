"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "./navbar"

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Don't render navbar on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }
  
  return <Navbar />
}