"use client";

import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useState, useRef, Suspense } from "react";
import NextLink from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";

function inSphere(buffer: Float32Array, { radius = 1 }: { radius?: number }) {
  for (let i = 0; i < buffer.length; i += 3) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = Math.cbrt(Math.random()) * radius;
    const sinPhi = Math.sin(phi);
    buffer[i] = r * sinPhi * Math.cos(theta);
    buffer[i + 1] = r * sinPhi * Math.sin(theta);
    buffer[i + 2] = r * Math.cos(phi);
  }
  return buffer;
}

function NeuralNetwork() {
  const ref = useRef<any>();
  // Generate random particles in a sphere
  const [sphere] = useState(() => inSphere(new Float32Array(5000), { radius: 1.5 }));

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#3b82f6"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 pt-20">
      
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-60">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Suspense fallback={null}>
            <NeuralNetwork />
          </Suspense>
        </Canvas>
      </div>

      {/* Cinematic Gradients */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
        >
          <Sparkles className="h-4 w-4 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
            Next-Gen Intelligence
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[1.1]"
        >
          Understand your <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            customers instantly.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl font-medium leading-relaxed"
        >
          LOOP ingests millions of data points and transforms raw feedback into actionable business intelligence using advanced neural networks.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 flex items-center justify-center w-full"
        >
          <NextLink
            href="/signup"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-white px-10 py-5 text-base font-bold text-slate-950 transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl hover:shadow-white/20"
          >
            <span className="relative z-10 flex items-center gap-2">
              Get Started
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 rounded-full bg-white blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
            {/* Ripple effect base */}
            <div className="absolute inset-0 rounded-full border border-white/40 scale-100 opacity-0 group-hover:animate-ping" />
          </NextLink>
        </motion.div>
      </div>

    </section>
  );
}
