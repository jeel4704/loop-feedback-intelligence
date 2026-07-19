"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, Inbox, Sparkles, MessageSquare } from "lucide-react";

function ChartBar() {
  const [height, setHeight] = useState(0);
  
  useEffect(() => {
    setHeight(Math.random() * 100);
    const int = setInterval(() => setHeight(Math.random() * 100), 1000 + Math.random() * 2000);
    return () => clearInterval(int);
  }, []);

  return (
    <motion.div 
      className="w-full bg-blue-500/50 rounded-t-sm"
      animate={{ height: `${height}%` }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    />
  );
}

export function LiveDashboard() {
  const [feedbackCount, setFeedbackCount] = useState(14800);
  const [sentiment, setSentiment] = useState(82);

  useEffect(() => {
    // Simulate live data ticking
    const interval = setInterval(() => {
      setFeedbackCount(prev => prev + Math.floor(Math.random() * 5));
      setSentiment(prev => {
        const delta = Math.random() > 0.5 ? 0.1 : -0.1;
        return Number(Math.min(99, Math.max(70, prev + delta)).toFixed(1));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full py-20 overflow-hidden bg-slate-950 flex flex-col items-center">
      
      <div className="text-center mb-16 px-6 relative z-10 max-w-2xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
          Intelligence in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">Real-Time</span>
        </h2>
        <p className="text-slate-400 font-medium text-lg">
          No more stale reports. Watch your customer sentiment and product health update continuously as feedback rolls in.
        </p>
      </div>

      <div className="relative w-full max-w-5xl px-6">
        {/* Glow behind dashboard */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] bg-blue-600/20 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative z-10 w-full rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 bg-slate-950/50 p-4 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded border border-white/20 bg-white/5 flex items-center justify-center">
                <span className="text-white font-black text-sm">L</span>
              </div>
              <span className="text-white font-bold tracking-widest text-sm">LOOP</span>
            </div>

            <nav className="space-y-1">
              {[
                { icon: BarChart3, label: "Overview", active: true },
                { icon: Inbox, label: "Feedback", count: "14k" },
                { icon: Users, label: "Customers" },
                { icon: TrendingUp, label: "Trends" },
              ].map((item, i) => (
                <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${item.active ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count && <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded">{item.count}</span>}
                </div>
              ))}
            </nav>

            <div className="pt-4 border-t border-white/10">
              <div className="rounded-xl bg-gradient-to-tr from-purple-500/20 to-blue-500/20 border border-purple-500/30 p-4 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">Ask LOOP AI</span>
                  <p className="text-[10px] text-slate-300 line-clamp-2">"What are enterprise users saying about latency?"</p>
                </div>
                {/* Animated shimmer */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                  animate={{ translateX: ["-100%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 space-y-6">
            
            {/* Top Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <span className="text-slate-400 text-xs font-semibold">Total Feedback</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{feedbackCount.toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-400 flex items-center"><TrendingUp className="h-3 w-3 mr-0.5" /> +124</span>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                <span className="text-slate-400 text-xs font-semibold">Avg Sentiment</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{sentiment}%</span>
                  <span className="text-[10px] text-emerald-400 flex items-center"><TrendingUp className="h-3 w-3 mr-0.5" /> +0.4%</span>
                </div>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 hidden md:block">
                <span className="text-slate-400 text-xs font-semibold">Active Themes</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">24</span>
                </div>
              </div>
            </div>

            {/* Live Chart area */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 h-64 flex flex-col justify-between">
              <span className="text-slate-400 text-xs font-semibold">Real-Time Processing</span>
              
              <div className="w-full h-40 flex items-end justify-between gap-1 mt-4">
                {Array.from({ length: 40 }).map((_, i) => (
                  <ChartBar key={i} />
                ))}
              </div>
            </div>

            {/* Live Feed */}
            <div className="space-y-3">
              <span className="text-slate-400 text-xs font-semibold">Live Pipeline</span>
              <div className="space-y-2 overflow-hidden h-32 relative">
                {/* Fade out mask at bottom */}
                <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-slate-900/80 to-transparent z-10 pointer-events-none" />
                
                {[
                  { tag: "Pricing", tone: "Negative", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
                  { tag: "Performance", tone: "Positive", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
                  { tag: "UI/UX", tone: "Neutral", color: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/5 text-xs"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-slate-500" />
                      <span className="text-slate-300 font-medium">New feedback analyzed...</span>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-md border text-[9px] font-bold uppercase tracking-wider ${item.color}`}>
                        {item.tag}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
