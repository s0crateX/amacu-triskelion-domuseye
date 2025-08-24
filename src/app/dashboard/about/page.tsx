"use client";
import React, { useRef } from "react";
import Image from "next/image";
import {
  Home,
  Search,
  MessageCircle,
  Bot,
  Building,
  LineChart,
  Zap,
} from "lucide-react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
const AboutPage = () => {
  const aboutRef = useRef(null);
  const aboutInView = useInView(aboutRef, { once: true, amount: 0.3 });

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 dark:bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/90 to-slate-700/80 dark:from-slate-900/95 dark:to-slate-800/85 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-10"
          style={{
            backgroundImage:
              "url('https://mallettegoring.com/wp-content/uploads/2020/05/home_banner_buidlings.svg')",
          }}
        ></div>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-20">
          <div className="max-w-2xl">
            <h1 className="text-3xl xl:text-5xl font-bold text-white mb-6 text-center xl:text-start">
              DomusEye — AI-Powered Property Management Platform
            </h1>
            <p className="text-xl text-slate-200 dark:text-slate-300 mb-8 text-center xl:text-start">
              DomusEye is an innovative AI-powered website for rental property management built with Next.js. 
              Our intelligent platform revolutionizes real estate operations by streamlining property management, 
              tenant relations, and maintenance automation with cutting-edge artificial intelligence.
            </p>
            <button className="px-6 py-3 bg-primary hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-md font-medium transition-colors hidden xl:block">
              <Link href={"/contact"}>Contact Us</Link>
            </button>
          </div>
        </div>
      </section>
      {/* About Content Section */}
      <section className="py-20 bg-background">
        <div
          ref={aboutRef}
          className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20"
        >
          <div className="grid gap-16 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={
                aboutInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="relative space-y-6"
            >
              <div className="from-slate-600 to-slate-500 dark:from-slate-500 dark:to-slate-400 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg">
                <Zap className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Our Mission
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                To revolutionize rental property management through AI-powered technology built on Next.js. 
                We empower property owners, landlords, and tenants with intelligent automation, 
                predictive analytics, and seamless digital experiences that transform how rental properties are managed, 
                marketed, and maintained in the modern real estate landscape.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={
                aboutInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="relative space-y-6"
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-500 dark:from-slate-500 dark:to-slate-400 text-white shadow-lg">
                <LineChart className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Our Vision
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                To become the leading AI-powered rental property management platform globally, 
                setting new standards for intelligent real estate technology. We envision a future where 
                property management is fully automated, data-driven, and accessible to everyone, 
                creating smarter communities and more efficient rental markets through innovative Next.js solutions.
              </p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={aboutInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            className="mt-16 flex items-start gap-4"
          >
            <div className="from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600 text-slate-600 dark:text-slate-300 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br">
              <Building className="h-5 w-5" />
            </div>
            <p className="text-muted-foreground text-base leading-relaxed">
              Built with cutting-edge Next.js technology, DomusEye leverages artificial intelligence to provide 
              comprehensive rental property management solutions. Our platform integrates smart automation, 
              predictive maintenance alerts, intelligent tenant matching, and real-time analytics to deliver 
              an unparalleled property management experience for the modern real estate market.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section*/}
      <section className="py-20 bg-muted/30 dark:bg-muted/10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose DomusEye
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit
              amet consectetur adipiscing elit quisque faucibus.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-slate-400 dark:bg-slate-600 rounded-full z-0"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-slate-600 dark:bg-slate-500 rounded-full z-0"></div>
              <Image
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80"
                alt="Modern apartment interior"
                width={1973}
                height={1200}
                className="rounded-lg shadow-xl relative z-10 w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Search
                      size={24}
                      className="text-slate-600 dark:text-slate-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Find Properties to Rent
                    </h3>
                    <p className="text-muted-foreground">
                      Lorem ipsum dolor sit amet consectetur adipiscing elit.
                      Dolor sit amet consectetur adipiscing elit quisque
                      faucibus.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <MessageCircle
                      size={24}
                      className="text-slate-600 dark:text-slate-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Talk to an Agent About Renting
                    </h3>
                    <p className="text-muted-foreground">
                      Lorem ipsum dolor sit amet consectetur adipiscing elit.
                      Dolor sit amet consectetur adipiscing elit quisque
                      faucibus.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Bot
                      size={24}
                      className="text-slate-600 dark:text-slate-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      AI Chatbot Assistance
                    </h3>
                    <p className="text-muted-foreground">
                      Lorem ipsum dolor sit amet consectetur adipiscing elit.
                      Dolor sit amet consectetur adipiscing elit quisque
                      faucibus.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Home
                      size={24}
                      className="text-slate-600 dark:text-slate-400"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Landlord Rental Property Management
                    </h3>
                    <p className="text-muted-foreground">
                      Lorem ipsum dolor sit amet consectetur adipiscing elit.
                      Dolor sit amet consectetur adipiscing elit quisque
                      faucibus.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-900 dark:bg-slate-950">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Find Your Perfect Property?
            </h2>
            <p className="text-xl text-slate-200 dark:text-slate-300 mb-8">
              Join thousands of satisfied clients who found their dream rental
              property with DomusEye.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-slate-900 rounded-md font-medium hover:bg-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors">
                <Link href="/dashboard/properties">Browse Properties</Link>
              </button>
              <button className="px-8 py-3 bg-slate-700 text-white rounded-md font-medium hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors">
                <Link href="/dashboard/register">Start Now</Link>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
