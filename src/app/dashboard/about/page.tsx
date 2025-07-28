"use client";
import React, { useRef } from "react";
import Image from "next/image";
import {
  Home,
  Shield,
  Clock,
  MapPin,
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
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/90 to-slate-800/70 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://mallettegoring.com/wp-content/uploads/2020/05/home_banner_buidlings.svg')",
          }}
        ></div>
        <div className="container px-4 py-24 relative z-20 xl:mx-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl xl:text-5xl font-bold text-white mb-6 text-center xl:text-start">
              DomusEye — Smart Property Management
            </h1>
            <p className="text-xl text-white/90 mb-8 text-center xl:text-start">
              DomusEye is a modern property management website designed to
              assist with real estate operations. It streamlines the management
              of properties, tenants, and maintenance tasks efficiently.
            </p>
            <button className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-medium hidden xl:block">
              <Link href={"/contact"}>Contact Us</Link>
            </button>
          </div>
        </div>
      </section>
      {/* About Content Section */}
      <section className="py-20 px-20 dark:bg-background">
        <div ref={aboutRef} className="relative mx-auto mb-20">
          <div className="grid gap-16 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={
                aboutInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
              }
              transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
              className="relative space-y-6"
            >
              <div className="from-primary/80 to-primary/60 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg">
                <Zap className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Our Mission</h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Lorem ipsum dolor sit amet consectetur adipiscing elit.
                Consectetur adipiscing elit quisque faucibus ex sapien vitae. Ex
                sapien vitae pellentesque sem placerat in id. Placerat in id
                cursus mi pretium tellus duis. Pretium tellus duis convallis
                tempus leo eu aenean.
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
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/80 to-blue-500/60 text-white shadow-lg">
                <LineChart className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Our Vision</h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Lorem ipsum dolor sit amet consectetur adipiscing elit.
                Consectetur adipiscing elit quisque faucibus ex sapien vitae. Ex
                sapien vitae pellentesque sem placerat in id. Placerat in id
                cursus mi pretium tellus duis. Pretium tellus duis convallis
                tempus leo eu aenean.
              </p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={aboutInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            className="mt-16 flex items-start gap-4"
          >
            <div className="from-primary/20 to-primary/5 text-primary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br">
              <Building className="h-5 w-5" />
            </div>
            <p className="text-muted-foreground text-base leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipiscing elit.
              Consectetur adipiscing elit quisque faucibus ex sapien vitae. Ex
              sapien vitae pellentesque sem placerat in id. Placerat in id
              cursus mi pretium tellus duis. Pretium tellus duis convallis
              tempus leo eu aenean.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section*/}
      <section className="py-20 px-20 dark:bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Why Choose DomusEye
            </h2>
            <p className="text-primary/80 max-w-2xl mx-auto">
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Dolor sit
              amet consectetur adipiscing elit quisque faucibus.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#cdb323] rounded-full z-0"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#1e40af] rounded-full z-0"></div>
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
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1e40af]/10 flex items-center justify-center">
                    <Shield size={24} className="text-[#1e40af]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary/90 mb-2">
                      landlord management
                    </h3>
                    <p className="text-primary/60">
                      Lorem ipsum dolor sit amet consectetur adipiscing elit.
                      Dolor sit amet consectetur adipiscing elit quisque
                      faucibus.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#cdb323]/20 flex items-center justify-center">
                    <Clock size={24} className="text-[#cdb323]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary/90 mb-2">
                      AI Chatbot Assistance
                    </h3>
                    <p className="text-primary/60">
                      Lorem ipsum dolor sit amet consectetur adipiscing elit.
                      Dolor sit amet consectetur adipiscing elit quisque
                      faucibus.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1e40af]/10 flex items-center justify-center">
                    <MapPin size={24} className="text-[#1e40af]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary/90 mb-2">
                      Lorem ipsum dolor sit amet consectetur adipiscing elit.
                    </h3>
                    <p className="text-primary/60">
                      Lorem ipsum dolor sit amet consectetur adipiscing elit.
                      Dolor sit amet consectetur adipiscing elit quisque
                      faucibus.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#cdb323]/20 flex items-center justify-center">
                    <Home size={24} className="text-[#cdb323]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary/90 mb-2">
                      Lorem ipsum dolor sit amet consectetur adipiscing elit.
                    </h3>
                    <p className="text-primary/60">
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
      <section className="py-20 px-4 bg-slate-800/90">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Find Your Perfect Property?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of satisfied clients who found their dream rental
              property with HomeHaven.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-white text-[#1e40af] rounded-md font-medium hover:bg-gray-100">
                <Link href="/properties">Browse Properties</Link>
              </button>
              <button className="px-8 py-3 bg-[#cdb323] text-white rounded-md font-medium hover:bg-[#b9a020]">
                <Link href="/register">Start Now</Link>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
