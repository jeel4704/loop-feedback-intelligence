"use client";

import { useState } from "react";
import NextLink from "next/link";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Badge, Card } from "@/components/ui";
import { Check, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = [
    {
      name: "Starter",
      desc: "For individual builders mapping initial customer surveys.",
      price: { monthly: 0, annually: 0 },
      cta: "Get Started Free",
      features: [
        "1 Workspace Seat",
        "100 feedback rows / mo",
        "Basic keyword searching",
        "Standard CSV importer",
        "Email support response in 48h"
      ]
    },
    {
      name: "Pro",
      desc: "For scaling product teams consolidating multiple channels.",
      price: { monthly: 49, annually: 39 },
      cta: "Start 14-Day Free Trial",
      popular: true,
      features: [
        "5 Workspace Seats included",
        "5,000 feedback rows / mo",
        "AI Semantic Search (Ask LOOP)",
        "Thematic clustering tags",
        "Instant NLP classifications",
        "Slack & webhooks connectors",
        "Email support response in 12h"
      ]
    },
    {
      name: "Enterprise",
      desc: "For secure, multi-tenant organizations requiring custom storage.",
      price: { monthly: "Custom", annually: "Custom" },
      cta: "Contact Enterprise Sales",
      features: [
        "Unlimited Workspace Seats",
        "Unlimited feedback volume",
        "Isolated pgvector database vaults",
        "Custom classification criteria",
        "SAML SSO & advanced RBAC logs",
        "Dedicated account manager",
        "24/7 Phone & Slack sync support"
      ]
    }
  ];

  const faqs = [
    {
      q: "Can I upgrade or downgrade my plan at any time?",
      a: "Yes! You can easily upgrade or downgrade your active subscription from the Settings dashboard. If you downgrade, your limits will adjust at the start of your next billing cycle."
    },
    {
      q: "What counts as a feedback row?",
      a: "A feedback row is a single record of feedback uploaded to your workspace database, such as a CSV row, an email body, a Slack message thread, or a support ticket transcript."
    },
    {
      q: "How secure is my customer data?",
      a: "Extremely secure. LOOP partitions every workspace's data in isolated database instances. We employ AES-256 data encryption protocols at rest and transit safeguards."
    },
    {
      q: "Do you offer custom AI classification criteria?",
      a: "Yes, our Enterprise tier supports custom system prompts, custom tag classifications, and customized confidence thresholds mapping to your unique business context."
    }
  ];

  return (
    <MarketingLayout>
      {/* Hero Header */}
      <section className="relative mx-auto max-w-7xl px-6 pt-20 pb-8 text-center">
        <Badge variant="blue" className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full font-bold text-xs uppercase tracking-wider">
          Pricing Plans
        </Badge>
        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Transparent, <span className="text-blue-600">predictable pricing</span>
        </h1>
        <p className="mt-6 text-slate-600 text-lg sm:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
          Start for free, scale to your workspace feedback volumes, and comply with enterprise security constraints.
        </p>

        {/* Period Toggle */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <span className={`text-xs font-bold transition-colors duration-200 ${billingPeriod === "monthly" ? "text-slate-900" : "text-slate-400"}`}>Billed Monthly</span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annually" : "monthly")}
            className="relative h-6 w-11 rounded-full bg-blue-600 transition-colors duration-200 focus:outline-none"
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${billingPeriod === "annually" ? "translate-x-5" : ""}`} />
          </button>
          <span className={`text-xs font-bold transition-colors duration-200 ${billingPeriod === "annually" ? "text-slate-900" : "text-slate-400"} flex items-center gap-1.5`}>
            Billed Annually
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-700">Save 20%</span>
          </span>
        </div>
      </section>

      {/* Plan Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan, idx) => {
            const priceVal = plan.price[billingPeriod === "annually" ? "annually" : "monthly"];
            return (
              <Card key={idx} className={`relative rounded-[24px] border ${plan.popular ? "border-blue-600 ring-2 ring-blue-500/10 shadow-lg" : "border-slate-200/60 shadow-sm"} bg-white p-8 flex flex-col justify-between text-left hover:shadow-md transition-all duration-300`}>
                {plan.popular && (
                  <span className="absolute top-0 right-8 translate-y-[-50%] px-3.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-600 text-white uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
                  <p className="mt-2.5 text-slate-500 font-semibold text-xs leading-relaxed min-h-[40px]">{plan.desc}</p>
                  
                  <div className="mt-6 flex items-baseline">
                    <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                      {typeof priceVal === "number" ? `$${priceVal}` : priceVal}
                    </span>
                    {typeof priceVal === "number" && (
                      <span className="ml-1 text-xs text-slate-400 font-bold">/ seat / mo</span>
                    )}
                  </div>

                  <div className="mt-8">
                    <NextLink
                      href={plan.name === "Enterprise" ? "mailto:sales@loopai.com" : "/signup"}
                      className={`inline-flex w-full items-center justify-center rounded-[14px] px-4 py-3.5 text-xs font-bold transition-all duration-200 ${plan.popular ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
                    >
                      {plan.cta}
                    </NextLink>
                  </div>

                  <ul className="mt-10 space-y-4">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-xs text-slate-700 font-semibold leading-none">
                        <Check className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-10">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="border border-slate-200/60 rounded-[18px] bg-white overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 text-sm focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </MarketingLayout>
  );
}
