"use client";

import { useState, useEffect, ReactNode } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { ArrowRight, Github, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui";

// BrandLogo component
export function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.3 }}
      >
        <Logo variant="icon" size="xl" />
      </motion.div>
      <div className="text-left">
        <span className="font-extrabold text-xl tracking-tight text-white leading-none block">LOOP</span>
        <span className="text-[10px] font-bold text-slate-400 block mt-1.5 tracking-wider uppercase">Feedback Intelligence</span>
      </div>
    </div>
  );
}

interface MarketingLayoutProps {
  children: ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans antialiased overflow-x-clip selection:bg-blue-500/30 selection:text-white">

      {/* HEADER NAVBAR */}
      <motion.header 
        className="fixed top-0 z-50 w-full"
        animate={{ 
          backgroundColor: isScrolled ? "rgba(2, 6, 23, 0.8)" : "rgba(2, 6, 23, 0)",
          backdropFilter: isScrolled ? "blur(20px)" : "blur(0px)",
          borderBottom: isScrolled ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid transparent",
          paddingTop: isScrolled ? "1rem" : "1.5rem",
          paddingBottom: isScrolled ? "1rem" : "1.5rem"
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <NextLink href="/" className="flex items-center gap-3 group">
            <BrandLogo />
          </NextLink>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-slate-300">
            <div className="py-2">
              <NextLink href="/" className="hover:text-white transition-colors">
                Home
              </NextLink>
            </div>
            <div className="py-2">
              <NextLink href="/features" className="hover:text-white transition-colors">
                Features
              </NextLink>
            </div>
            <div className="py-2">
              <NextLink href="/solutions" className="hover:text-white transition-colors">
                Solutions
              </NextLink>
            </div>
            <div className="py-2">
              <NextLink href="/resources" className="hover:text-white transition-colors">
                Resources
              </NextLink>
            </div>
          </nav>

          <div className="flex items-center gap-4">
            <NextLink 
              href="/login" 
              className="text-sm font-bold text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Log in
            </NextLink>
            <NextLink 
              href="/signup" 
              className="inline-flex items-center justify-center rounded-[12px] bg-white px-5 py-2.5 text-sm font-bold text-slate-950 shadow-lg hover:bg-slate-200 transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Sign up
            </NextLink>
          </div>
        </div>

      </motion.header>

      {/* Main Content Area */}
      <main className="relative">{children}</main>

      {/* FOOTER */}
      <motion.footer 
        className="border-t border-white/10 bg-slate-950 py-10 text-xs text-slate-400 relative z-10"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
            <div className="md:col-span-2 space-y-5">
              <BrandLogo />
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-[280px]">
                AI Customer Feedback Intelligence Platform. Engineered for product alignment, security, and velocity.
              </p>
            </div>

            <div className="space-y-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Resources</p>
              <ul className="space-y-3 font-semibold">
                <li>
                  <NextLink href="/login" className="flex items-center text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-300">
                    Workspace Login
                  </NextLink>
                </li>
                <li>
                  <NextLink href="/signup" className="flex items-center text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-300">
                    Workspace Signup
                  </NextLink>
                </li>
                <li>
                  <NextLink href="/resources" className="flex items-center text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-300">
                    Documentation
                  </NextLink>
                </li>
              </ul>
            </div>

            <div className="space-y-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Connect</p>
              <ul className="space-y-3 font-semibold">
                <li>
                  <NextLink href="https://github.com/jeel4704" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-300 group">
                    <Github className="h-[18px] w-[18px] text-slate-400 group-hover:text-white transition-colors" />
                    GitHub
                  </NextLink>
                </li>
                <li>
                  <NextLink href="https://www.linkedin.com/in/patel-jeel-649978226" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-slate-300 hover:text-white hover:translate-x-1 transition-all duration-300 group">
                    <Linkedin className="h-[18px] w-[18px] text-slate-400 group-hover:text-white transition-colors" />
                    LinkedIn
                  </NextLink>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-[11px] text-slate-500 text-center md:text-left">
              <span className="block font-semibold">&copy; {new Date().getFullYear()} LOOP Feedback Intelligence.</span>
              <span className="block mt-1">Built for enterprise customer insights.</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 font-semibold text-[11px] text-slate-400">
              <NextLink href="/privacy" className="hover:text-white transition-colors">Privacy</NextLink>
              <NextLink href="/terms" className="hover:text-white transition-colors">Terms</NextLink>
              <NextLink href="/resources" className="hover:text-white transition-colors">Documentation</NextLink>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
