"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { BrainCircuit, MessageSquare, Zap, Activity, CheckCircle, TrendingUp, AlertTriangle } from "lucide-react";

// --- Data Definitions ---

const feedbackInputs = [
  { text: "★★★★★ Great Experience", type: "positive", delayOffset: 0, yOffset: -80 },
  { text: "Delivery was delayed.", type: "negative", delayOffset: 0.1, yOffset: -20 },
  { text: "Please add Dark Mode.", type: "feature", delayOffset: 0.2, yOffset: 40 },
  { text: "Support was amazing.", type: "positive", delayOffset: 0.3, yOffset: 100 },
  { text: "Pricing is too expensive.", type: "negative", delayOffset: 0.4, yOffset: 160 },
];

const processingStates = [
  "AWAITING_DATA_ANIMATION",
  "Ingesting Feedback...",
  "Detecting Themes...",
  "Measuring Sentiment...",
  "Finding Patterns...",
  "Generating Insights...",
  "Predicting Trends..."
];

const aiOutputs = [
  { icon: CheckCircle, title: "Positive Sentiment 82%", color: "text-emerald-400", border: "border-emerald-500/30", delay: 0.5 },
  { icon: MessageSquare, title: "Theme: Delivery Experience", color: "text-blue-400", border: "border-blue-500/30", delay: 0.6 },
  { icon: Zap, title: "AI Insight Generated", color: "text-purple-400", border: "border-purple-500/30", delay: 0.7 },
  { icon: Activity, title: "Executive Report Created", color: "text-rose-400", border: "border-rose-500/30", delay: 0.8 },
  { icon: TrendingUp, title: "Trend Detected", color: "text-indigo-400", border: "border-indigo-500/30", delay: 0.9 }
];

function FeedbackCard({ item, scrollYProgress }: { item: typeof feedbackInputs[0], i: number, scrollYProgress: any }) {
  const startIn = 0.05 + item.delayOffset * 0.1;
  const peak = 0.25 + item.delayOffset * 0.1;
  const enterCore = 0.45 + item.delayOffset * 0.1;

  const opacity = useTransform(scrollYProgress, [startIn, peak, enterCore], [0, 1, 0]);
  const x = useTransform(scrollYProgress, [startIn, peak, enterCore], [-100, 0, 350]);
  const y = useTransform(scrollYProgress, [startIn, peak, enterCore], [item.yOffset, item.yOffset, 0]);
  const scale = useTransform(scrollYProgress, [startIn, peak, enterCore], [0.8, 1, 0.2]);

  return (
    <motion.div
      className="absolute left-0 w-64 rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-md p-4 shadow-xl flex items-start gap-3"
      style={{ opacity, x, y, scale, top: "50%", marginTop: "-40px" }}
    >
      <MessageSquare className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" />
      <p className="text-sm font-medium text-slate-300 leading-snug">{item.text}</p>
    </motion.div>
  );
}

function OutputCard({ item, i, scrollYProgress }: { item: typeof aiOutputs[0], i: number, scrollYProgress: any }) {
  const trigger = item.delay;
  const opacity = useTransform(scrollYProgress, [trigger - 0.1, trigger], [0, 1]);
  const x = useTransform(scrollYProgress, [trigger - 0.1, trigger], [-350, 0]);
  const yOffset = -120 + i * 60;
  const y = useTransform(scrollYProgress, [trigger - 0.1, trigger], [0, yOffset]);
  const scale = useTransform(scrollYProgress, [trigger - 0.1, trigger], [0.2, 1]);

  return (
    <motion.div
      className={`absolute right-0 w-64 rounded-lg border bg-slate-900/90 backdrop-blur-md p-3 shadow-2xl flex items-center gap-3 ${item.border}`}
      style={{ opacity, x, y, scale, top: "50%", marginTop: "-24px" }}
    >
      <item.icon className={`h-5 w-5 shrink-0 ${item.color}`} />
      <span className="text-xs font-bold text-white tracking-wide">{item.title}</span>
    </motion.div>
  );
}


export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate dynamic text index based on scroll (0 to 6)
  const processingIndex = useTransform(scrollYProgress, [0.1, 0.9], [0, processingStates.length - 1]);

  return (
    <section ref={containerRef} className="relative bg-slate-950 text-white min-h-[400vh]">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 w-full h-[300px] bg-gradient-to-b from-slate-950/0 via-blue-900/10 to-slate-950/0 opacity-50 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 md:px-6 z-10">
        
        {/* Header Title */}
        <motion.div 
          className="absolute top-16 md:top-24 text-center w-full px-6"
          style={{
            opacity: useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
            y: useTransform(scrollYProgress, [0, 0.1], [20, 0])
          }}
        >
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            From Customer Voice to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Business Intelligence</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto font-medium text-sm md:text-base">
            Every piece of feedback is analyzed, categorized, and transformed into actionable insights using enterprise AI.
          </p>
        </motion.div>

        {/* Main Orchestration Container */}
        <div className="relative w-full max-w-6xl h-[600px] flex items-center justify-between mt-20">
          
          {/* LEFT: Raw Feedback Input */}
          <div className="hidden md:block w-1/3 h-full relative">
            {feedbackInputs.map((item, i) => (
              <FeedbackCard key={i} item={item} i={i} scrollYProgress={scrollYProgress} />
            ))}
          </div>

          {/* CENTER: AI Core */}
          <div className="w-full md:w-1/3 h-full flex flex-col items-center justify-center relative z-20">
            <div className="relative w-64 h-64 flex items-center justify-center">
              
              {/* Outer Glow */}
              <motion.div 
                className="absolute inset-0 rounded-full bg-blue-600/20 blur-[60px]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Data Flow Particles (SVG Lines pointing in and out) */}
              <svg className="absolute inset-0 w-full h-full scale-[2] pointer-events-none opacity-30" viewBox="0 0 200 200">
                <motion.path d="M -100 100 L 50 100" stroke="url(#flowGradIn)" strokeWidth="1" strokeDasharray="4,4" 
                  initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                <motion.path d="M 150 100 L 300 100" stroke="url(#flowGradOut)" strokeWidth="1" strokeDasharray="4,4" 
                  initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                <defs>
                  <linearGradient id="flowGradIn" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0"/>
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1"/>
                  </linearGradient>
                  <linearGradient id="flowGradOut" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>

              {/* Nested Rings */}
              <motion.div className="absolute inset-0 rounded-full border border-white/5 border-t-blue-500/50" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
              <motion.div className="absolute inset-4 rounded-full border border-white/5 border-b-purple-500/50" animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} />
              <motion.div className="absolute inset-8 rounded-full border border-white/5 border-r-cyan-500/50" animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }} />

              {/* The Core */}
              <motion.div 
                className="relative z-10 w-24 h-24 rounded-2xl bg-slate-900 border border-white/20 shadow-[0_0_30px_rgba(139,92,246,0.3)] flex items-center justify-center overflow-hidden"
                style={{ scale: useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 1]) }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20" />
                <BrainCircuit className="h-10 w-10 text-white/90" />
              </motion.div>
            </div>

            {/* Dynamic Status Text */}
            <div className="absolute bottom-10 md:bottom-20 w-64 text-center">
              <ActiveProcessingText progressIndex={processingIndex} />
            </div>
          </div>

          {/* RIGHT: Output Dashboard */}
          <div className="hidden md:block w-1/3 h-full relative">
            {aiOutputs.map((item, i) => (
              <OutputCard key={i} item={item} i={i} scrollYProgress={scrollYProgress} />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

// Helper component to cycle through text based on a MotionValue
function ActiveProcessingText({ progressIndex }: { progressIndex: MotionValue<number> }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    return progressIndex.onChange((v) => setIndex(Math.round(v)));
  }, [progressIndex]);

  return (
    <div className="relative h-8 w-full overflow-hidden flex justify-center items-center">
      {processingStates.map((state, i) => (
        <motion.div
          key={state}
          className="absolute inset-0 flex justify-center items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: index === i ? 1 : 0,
            y: index === i ? 0 : index > i ? -10 : 10,
            scale: index === i ? 1 : 0.95
          }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-full border border-white/5 flex items-center justify-center min-w-[120px]">
            {state === "AWAITING_DATA_ANIMATION" ? (
              <span className="flex items-center gap-1.5">
                <motion.span className="w-1.5 h-1.5 bg-blue-500 rounded-full" animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} />
                <motion.span className="w-1.5 h-1.5 bg-purple-500 rounded-full" animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} />
                <motion.span className="w-1.5 h-1.5 bg-pink-500 rounded-full" animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} />
              </span>
            ) : (
              state
            )}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
