import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "About Us | DomusEye",
  description: "Learn more about DomusEye and our mission",
};

export default function AboutPage() {
  // Redirect to the dashboard about page which has the full content
  redirect("/dashboard/about");
}