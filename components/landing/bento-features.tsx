"use client";

import { motion } from "framer-motion";
import { Sparkles, BrainCircuit, Globe, Layers, Zap, Lock } from "lucide-react";

const features = [
  {
    title: "Proprietary AI Models",
    description: "Fine-tuned on billions of customer interactions for unmatched accuracy.",
    icon: BrainCircuit,
    colSpan: "md:col-span-2",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    color: "text-blue-400"
  },
  {
    title: "Real-Time Processing",
    description: "Instantaneous analysis. No overnight batch jobs.",
    icon: Zap,
    colSpan: "md:col-span-1",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    color: "text-indigo-400"
  },
  {
    title: "Global Language Support",
    description: "Translates and analyzes feedback in over 50 languages automatically.",
    icon: Globe,
    colSpan: "md:col-span-1",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    color: "text-purple-400"
  },
  {
    title: "Automated Taxonomy",
    description: "Dynamic clustering creates themes you didn't even know existed.",
    icon: Layers,
    colSpan: "md:col-span-2",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    color: "text-emerald-400"
  },
  {
    title: "Enterprise Security",
    description: "SOC2 Type II certified. Bank-grade encryption at rest and in transit.",
    icon: Lock,
    colSpan: "md:col-span-3",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    color: "text-rose-400"
  }
];

export function BentoFeatures() {
  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6"
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Enterprise Architecture
            </span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Scale</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              className={`group relative rounded-3xl p-8 overflow-hidden bg-slate-900/50 border border-white/10 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-slate-800/50 ${feat.colSpan}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Radial gradient glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 h-full flex flex-col justify-between gap-8">
                <div className={`w-12 h-12 rounded-2xl ${feat.bg} ${feat.border} border flex items-center justify-center`}>
                  <feat.icon className={`h-6 w-6 ${feat.color}`} />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white">{feat.title}</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">{feat.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
