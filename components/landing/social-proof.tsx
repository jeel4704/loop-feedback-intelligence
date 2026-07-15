"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const companies = [
  "Acme Corp", "Globex", "Soylent", "Initech", "Umbrella", "Stark Ind", "Wayne Ent", "Cyberdyne", "Massive Dynamic"
];

function Counter({ end, suffix = "" }: { end: number, suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 2000; // 2 seconds

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      
      // Easing function (easeOutQuart)
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end]);

  return <span className="text-4xl md:text-5xl font-black text-white">{count.toLocaleString()}{suffix}</span>;
}

export function SocialProof() {
  return (
    <section className="py-12 bg-slate-950 overflow-hidden relative z-10">
      
      <div className="max-w-6xl mx-auto px-6 mb-16 text-center">
        <p className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-8">
          Trusted by product teams at
        </p>
        
        {/* Infinite Marquee */}
        <div className="relative flex overflow-x-hidden w-full mask-edges">
          <motion.div
            className="flex whitespace-nowrap gap-16 py-4"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          >
            {/* Duplicate array for seamless infinite scroll */}
            {[...companies, ...companies].map((company, i) => (
              <div key={i} className="text-2xl font-extrabold text-slate-700 select-none">
                {company}
              </div>
            ))}
          </motion.div>
          {/* Gradient masks for smooth fade on edges */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-slate-950 to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-950 to-transparent z-10" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10 border-t border-white/10 pt-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
        >
          {[
            { value: 14, suffix: "M+", label: "Feedback Processed" },
            { value: 99, suffix: "%", label: "Sentiment Accuracy" },
            { value: 50, suffix: "+", label: "Languages Supported" },
            { value: 0, suffix: "ms", label: "Latency Added" }
          ].map((stat, i) => (
            <motion.div key={i} className="text-center px-4" variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <Counter end={stat.value} suffix={stat.suffix} />
              <p className="mt-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </section>
  );
}
