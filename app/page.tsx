import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  ChartColumnBig,
  Database,
  FileText,
  Inbox,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { Badge, Card, CardContent, buttonStyles } from "@/components/ui";
import { dashboardStats } from "@/data/dashboard";
import { demoWorkspace } from "@/data/users";
import { demoThemes } from "@/data/themes";

const featureIcons = [Inbox, BrainCircuit, ChartColumnBig, FileText];
const stack = [
  "Next.js 14 App Router",
  "TypeScript",
  "Tailwind CSS",
  "Prisma ORM",
  "PostgreSQL",
  "Auth.js-ready",
  "Claude AI-ready",
  "Recharts"
];

const testimonials = [
  {
    name: "Priya Nair",
    role: "Head of Product, Beacon Cloud",
    quote:
      "LOOP makes customer feedback feel operational. We can see what changed, why it changed, and what to do next."
  },
  {
    name: "Marcus Lee",
    role: "VP Support, Northlane",
    quote:
      "The mock dashboard already feels like the kind of internal tool teams actually rely on every day."
  },
  {
    name: "Jasmine Cole",
    role: "Growth Lead, Mintgrid",
    quote:
      "Ask LOOP turns raw comments into clear decisions without losing the customer voice behind them."
  }
];

const pricingTiers = [
  {
    name: "Demo",
    price: "$0",
    description: "Perfect for internship demos, prototypes, and stakeholder walkthroughs.",
    features: ["Mock workspace", "Static AI answers", "Charts and reports", "Role-based demo login"]
  },
  {
    name: "Team",
    price: "$49",
    description: "A conceptual plan for small product and support teams.",
    features: ["Unlimited feedback records", "Theme tracking", "Report generation", "Workspace analytics"]
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "A conceptual plan for multi-workspace organizations with governance needs.",
    features: ["Advanced RBAC", "Custom integrations", "Export controls", "Executive reporting"]
  }
];

const landingFeatures = [
  {
    title: "Feedback Ingestion",
    description:
      "Collect support tickets, app reviews, NPS responses, calls, and community feedback into one shared workspace."
  },
  {
    title: "AI Classification",
    description:
      "Apply sentiment, themes, and structured metadata instantly so teams can review patterns instead of raw noise."
  },
  {
    title: "Ask LOOP",
    description:
      "Ask questions in plain English and get realistic AI-style answers with supporting source feedback."
  },
  {
    title: "Reports",
    description:
      "Generate Voice of Customer reports with top themes, quotes, sentiment movement, and recommended actions."
  }
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.2),_transparent_30%),linear-gradient(to_bottom,_#f8fbff,_#eef4ff)] dark:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.16),_transparent_22%),linear-gradient(to_bottom,_#020617,_#0f172a)]">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <header className="flex flex-col gap-4 rounded-[30px] border border-slate-200/80 bg-white/80 px-6 py-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-semibold text-white">
              L
            </div>
            <div>
              <p className="font-semibold text-slate-950 dark:text-slate-50">LOOP</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                AI Customer Feedback Intelligence Platform
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className={buttonStyles({ variant: "secondary" })}
            >
              Get Started
            </Link>
            <Link href="/dashboard" className={buttonStyles({})}>
              View Dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-8 px-1 py-16 lg:grid-cols-[1.2fr_0.9fr] lg:items-center">
          <div>
            <Badge variant="blue">Built for multi-tenant insight teams</Badge>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 sm:text-6xl">
              LOOP
            </h1>
            <p className="mt-4 text-2xl font-medium text-slate-700 dark:text-slate-200">
              AI Customer Feedback Intelligence Platform
            </p>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
              Bring customer feedback into one place, classify it with AI,
              detect trends across workspaces, ask natural language questions,
              and publish Voice of Customer reports your team can act on.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className={buttonStyles({ className: "gap-2" })}>
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className={buttonStyles({ variant: "secondary" })}
              >
                View Dashboard
              </Link>
            </div>
          </div>

          <Card className="overflow-hidden border-slate-200/90 bg-slate-950">
            <CardContent className="p-0">
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">
                  LOOP Workspace
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {demoWorkspace.name}
                </h2>
              </div>
              <div className="grid gap-4 p-6">
                {[
                  [String(dashboardStats.totalFeedback), "Feedback records"],
                  [String(dashboardStats.activeThemes), "Active themes"],
                  [`${dashboardStats.positiveFeedback}`, "Positive feedback"],
                  [String(dashboardStats.openReports), "Open VOC reports"]
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <span className="text-3xl font-semibold text-white">{value}</span>
                    <span className="text-sm text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="pb-12">
          <div className="mb-8">
            <Badge variant="indigo">Platform capabilities</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              From raw feedback to confident product decisions
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {landingFeatures.map((feature, index) => {
              const Icon = featureIcons[index];

              return (
                <Card key={feature.title} className="h-full">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-slate-950 dark:text-slate-50">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 py-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Card>
            <CardContent className="p-6">
              <Badge variant="outline">Technology Stack</Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                Built on a modern AI-ready product stack
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {stack.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <Database className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Badge variant="outline">Demo Screenshots</Badge>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  ["Dashboard analytics", ChartColumnBig],
                  ["Ask LOOP workspace", Sparkles],
                  ["Voice of Customer", FileText],
                  ["Role-based access", ShieldCheck]
                ].map(([label, Icon]) => {
                  const DisplayIcon = Icon as typeof ChartColumnBig;

                  return (
                    <div
                      key={label}
                      className="group rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-6 transition hover:-translate-y-1 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm dark:bg-slate-800">
                        <DisplayIcon className="h-5 w-5" />
                      </div>
                      <p className="mt-12 text-base font-medium text-slate-900 dark:text-slate-100">
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="py-12">
          <Badge variant="outline">Popular Themes</Badge>
          <div className="mt-5 flex flex-wrap gap-3">
            {demoThemes.map((theme) => (
              <span
                key={theme.id}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              >
                {theme.name}
              </span>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="mb-8">
            <Badge variant="outline">Testimonials</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              Teams use LOOP to turn customer voice into product momentum
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardContent className="p-6">
                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
                    “{testimonial.quote}”
                  </p>
                  <div className="mt-6">
                    <p className="font-medium text-slate-950 dark:text-slate-100">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="outline">Pricing</Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
                Demo pricing concepts
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Demo only. No billing is connected in this project.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <Card key={tier.name} className={tier.name === "Team" ? "ring-2 ring-blue-200 dark:ring-blue-900" : ""}>
                <CardContent className="p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
                    {tier.name}
                  </p>
                  <p className="mt-4 text-4xl font-semibold text-slate-950 dark:text-slate-50">
                    {tier.price}
                  </p>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    {tier.description}
                  </p>
                  <div className="mt-6 space-y-3">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-200/80 py-10 dark:border-slate-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-950 dark:text-slate-50">LOOP</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Demo SaaS experience for AI customer feedback intelligence.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/login" className={buttonStyles({ variant: "secondary" })}>
                Login Demo
              </Link>
              <Link href="/dashboard" className={buttonStyles({})}>
                Open Dashboard
              </Link>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}
