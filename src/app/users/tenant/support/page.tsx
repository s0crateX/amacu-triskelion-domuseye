import { Metadata } from "next";
import { MessageCircle, Phone, Mail, Clock, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Support | DomusEye",
  description: "Get help and support for your DomusEye experience",
};

const supportOptions = [
  {
    title: "Live Chat",
    description: "Chat with our support team in real-time",
    icon: MessageCircle,
    availability: "24/7",
    action: "Start Chat",
    variant: "default" as const,
  },
  {
    title: "Phone Support",
    description: "Speak directly with a support representative",
    icon: Phone,
    availability: "Mon-Fri 9AM-6PM",
    action: "Call Now",
    variant: "outline" as const,
  },
  {
    title: "Email Support",
    description: "Send us a detailed message about your issue",
    icon: Mail,
    availability: "Response within 24 hours",
    action: "Send Email",
    variant: "outline" as const,
  },
];

const faqItems = [
  {
    question: "How do I search for properties?",
    answer: "Use our advanced search filters on the Properties page to find homes that match your criteria including location, price range, and property type.",
  },
  {
    question: "How do I contact an agent?",
    answer: "Visit our Agents page and click on any agent's profile to view their contact information and specialties. You can call or email them directly.",
  },
  {
    question: "What&apos;s the difference between tenant and landlord accounts?",
    answer: "Tenant accounts focus on finding and managing rental properties, while landlord accounts provide tools for listing and managing your properties.",
  },
  {
    question: "How do I update my profile information?",
    answer: "Go to your Profile page where you can edit your personal information, contact details, and account preferences.",
  },
  {
    question: "Is my personal information secure?",
    answer: "Yes, we use industry-standard encryption and security measures to protect your personal and financial information.",
  },
];

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Support Center
        </h1>
        <p className="text-lg text-muted-foreground">
          We&apos;re here to help you with any questions or issues you may have
        </p>
      </div>

      {/* Contact Options */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card key={option.title} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle>{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {option.availability}
                    </span>
                  </div>
                  <Button variant={option.variant} className="w-full">
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <HelpCircle className="h-6 w-6" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{item.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Resources */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Additional Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Guide</CardTitle>
              <CardDescription>
                Learn how to make the most of DomusEye&apos;s features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View Guide
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>
                Watch step-by-step tutorials for common tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Watch Videos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}