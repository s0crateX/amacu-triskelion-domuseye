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
      question: "What makes MVPBlocks unique?",
      answer:
        "MVPBlocks stands out through its intuitive design, powerful component library, and seamless integration options. We've focused on creating a user experience that combines simplicity with advanced features, all while maintaining excellent performance and accessibility.",
    },
    {
      question: "How can I customize the components?",
      answer:
        "All components are built with Tailwind CSS, making them highly customizable. You can modify colors, spacing, typography, and more by simply adjusting the class names or using our theme variables to match your brand identity.",
    },
    {
      question: "Do the components work with dark mode?",
      answer:
        "Yes, all MVPBlocks components are designed to work seamlessly with both light and dark modes. They automatically adapt to your site's theme settings, providing a consistent user experience regardless of the user's preference.",
    },
    {
      question: "How can I get started with MVPBlocks?",
      answer:
        "You can get started by browsing our component library and copying the code for the components you need. Our documentation provides clear instructions for installation and usage, and you can always reach out to our support team if you need assistance.",
    },
    {
      question: "Can I use MVPBlocks for commercial projects?",
      answer:
        "Absolutely! MVPBlocks is free to use for both personal and commercial projects. There are no licensing fees or attribution requirements—just build and launch your MVP faster than ever before.",
    },
  ];

  return (
    <section className="bg-background relative w-full overflow-hidden py-16">
      {/* Contact Options */}
      <div className="mb-12 mx-40">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Get in Touch
        </h2>
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
            Everything you need to know about MVPBlocks
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
