"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
}

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

function FAQItem({ question, answer, index }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.15,
        ease: "easeOut",
      }}
      className={cn(
        "group border-border/60 rounded-lg border",
        "transition-all duration-200 ease-in-out",
        isOpen ? "bg-card/30 shadow-sm" : "hover:bg-card/50"
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-4 px-6 py-4"
      >
        <h3
          className={cn(
            "text-left text-base font-medium transition-colors duration-200",
            "text-foreground/80",
            isOpen && "text-foreground"
          )}
        >
          {question}
        </h3>
        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className={cn(
            "shrink-0 rounded-full p-0.5",
            "transition-colors duration-200",
            isOpen ? "text-primary" : "text-muted-foreground"
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: {
                  duration: 0.4,
                  ease: [0.04, 0.62, 0.23, 0.98],
                },
                opacity: {
                  duration: 0.25,
                  delay: 0.1,
                },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  duration: 0.3,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 0.25,
                },
              },
            }}
          >
            <div className="border-border/40 border-t px-6 pt-2 pb-4">
              <motion.p
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className="text-muted-foreground text-sm leading-relaxed"
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Faq3() {
  const faqs: Omit<FAQItemProps, "index">[] = [
    {
      question: "How do I search for properties on DomusEye?",
      answer:
        "You can search for properties using our advanced search filters on the Properties page. Filter by property type (apartment, house, condo, etc.), location, price range, number of bedrooms, and other amenities. Use the search bar to find properties in specific areas or neighborhoods.",
    },
    {
      question: "How do I submit a maintenance request?",
      answer:
        "Navigate to your tenant dashboard and click on 'Maintenance Requests'. Fill out the form with details about the issue, select the priority level, and attach photos if needed. Your landlord will be notified immediately and you'll receive updates on the status of your request.",
    },

    {
      question: "How do I communicate with my landlord or property manager?",
      answer:
        "You can message your landlord directly through the DomusEye platform. Use the messaging feature in your dashboard to send messages, share documents, and receive important updates about your rental property. All communications are logged for your records.",
    },
    {
      question: "What should I do if I'm having trouble accessing my account?",
      answer:
        "If you're having login issues, try resetting your password using the 'Forgot Password' link. If you continue to experience problems, contact our 24/7 support team through live chat, phone, or email. We're here to help you get back into your account quickly.",
    },
    {
      question: "How do I update my profile and contact information?",
      answer:
        "Go to your tenant dashboard and click on 'Profile' to update your personal information, contact details, emergency contacts, and preferences. Make sure to keep your information current so your landlord can reach you when needed.",
    },
    {
      question: "Can I schedule property viewings through DomusEye?",
      answer:
        "Yes! When browsing properties, you can request viewings directly through the platform. Click on a property listing and use the 'Schedule Viewing' button to request an appointment. The landlord or agent will respond with available times.",
    },
  ];

  return (
    <section className="bg-background relative w-full overflow-hidden py-16">
      {/* Contact Options */}
      <div className="mb-12 container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center">
          Get in Touch
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {supportOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card key={option.title} className="text-center h-full">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 sm:p-3 rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl">
                    {option.title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base px-2">
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 pt-0">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {option.availability}
                    </span>
                  </div>
                  <Button
                    variant={option.variant}
                    className="w-full text-sm sm:text-base"
                  >
                    {option.action}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      {/* Decorative elements */}
      <div className="bg-primary/5 absolute top-20 -left-20 h-64 w-64 rounded-full blur-3xl" />
      <div className="bg-primary/5 absolute -right-20 bottom-20 h-64 w-64 rounded-full blur-3xl" />

      <div className="relative container mx-auto max-w-6xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <Badge
            variant="outline"
            className="border-primary mb-4 px-3 py-1 text-xs font-medium tracking-wider uppercase"
          >
            FAQs
          </Badge>

          <h2 className="from-primary mb-3 bg-gradient-to-r to-rose-400 bg-clip-text text-3xl font-bold text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-sm">
            Everything you need to know about DomusEye
          </p>
        </motion.div>

        <div className="mx-auto max-w-2xl space-y-2">
          {faqs.map((faq, index) => (
            <FAQItem key={index} {...faq} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={cn("mx-auto mt-12 max-w-md rounded-lg p-6 text-center")}
        >
          <div className="bg-primary/10 text-primary mb-4 inline-flex items-center justify-center rounded-full p-2">
            <Mail className="h-4 w-4" />
          </div>
          <p className="text-foreground mb-1 text-sm font-medium">
            Still have questions?
          </p>
          <p className="text-muted-foreground mb-4 text-xs">
            We&apos;re here to help you
          </p>
          <button
            type="button"
            className={cn(
              "rounded-md px-4 py-2 text-sm",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "transition-colors duration-200",
              "font-medium"
            )}
          >
            Contact Support
          </button>
        </motion.div>
      </div>
    </section>
  );
}
