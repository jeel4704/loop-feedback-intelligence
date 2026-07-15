"use client";

import { useState, useEffect, ReactNode } from "react";
import NextLink from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// Brand Logo Component
export function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.3 }}
      >
        <Image
          src="/logo.jpg"
          alt="LOOP Logo"
          width={64}
          height={64}
          className="rounded-[16px] border border-slate-200 bg-white p-1.5 shadow-md"
        />
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
        className="border-t border-white/10 bg-slate-950 py-16 text-xs text-slate-400 font-bold relative z-10"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto max-w-7xl px-6 grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <BrandLogo />
            <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs font-semibold">
              AI Customer Feedback Intelligence Platform. Engineered for product alignment, security, and velocity.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Features</p>
            <ul className="mt-4 space-y-2.5 text-slate-300 font-semibold">
              <li><NextLink href="/features" className="hover:text-white transition-colors">AI Classification</NextLink></li>
              <li><NextLink href="/features" className="hover:text-white transition-colors">Thematic Clustering</NextLink></li>
              <li><NextLink href="/product" className="hover:text-white transition-colors">Ask LOOP RAG</NextLink></li>
              <li><NextLink href="/product" className="hover:text-white transition-colors">VOC Reports</NextLink></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Resources</p>
            <ul className="mt-4 space-y-2.5 text-slate-300 font-semibold">
              <li><NextLink href="/login" className="hover:text-white transition-colors">Workspace Login</NextLink></li>
              <li><NextLink href="/signup" className="hover:text-white transition-colors">Workspace Signup</NextLink></li>
              <li><NextLink href="/resources" className="hover:text-white transition-colors">Documentation</NextLink></li>
              <li><NextLink href="/resources" className="hover:text-white transition-colors">Security Policy</NextLink></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Connect</p>
            <ul className="mt-4 space-y-2.5 text-slate-300 font-semibold">
              <li><NextLink href="/company" className="hover:text-white transition-colors">GitHub</NextLink></li>
              <li><NextLink href="/company" className="hover:text-white transition-colors">Twitter</NextLink></li>
              <li><NextLink href="/company" className="hover:text-white transition-colors">LinkedIn</NextLink></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-[10px] tracking-wider text-slate-500 uppercase">
            &copy; {new Date().getFullYear()} LOOP AI Technologies. All rights reserved.
          </p>
          <div className="flex gap-6 text-[10px] text-slate-400">
            <a href="#" className="hover:text-white transition-colors relative group">
              Privacy Policy
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-slate-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#" className="hover:text-white transition-colors relative group">
              Terms of Service
              <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-slate-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
