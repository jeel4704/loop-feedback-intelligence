export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

interface Citation {
  id: string;
  customer: string;
  quote: string;
  sentiment: "positive" | "negative" | "neutral";
}

interface SuggestedAction {
  label: string;
  action: string;
}

interface AskResponse {
  answer: string;
  citations: Citation[];
  suggestedActions: SuggestedAction[];
  followUpSuggestions: string[];
}

const RESPONSES_DB: Record<string, AskResponse> = {
  feedback_summary: {
    answer: `### Today's Customer Feedback Summary

We analyzed **499 customer feedback items** ingested today across Slack, Zendesk, and Intercom. Overall sentiment remains positive, but negative feedback shows a **+3.4% rise** concentrated in billing.

| Metric | Value | Change vs Yesterday |
| :--- | :--- | :--- |
| **Total Ingested** | 499 | +12% |
| **Positive Sentiment** | 68% | -1.2% |
| **Negative Sentiment** | 18% | +3.4% |
| **Neutral Sentiment** | 14% | -2.2% |

#### Key Drivers of Feedback Today:
1. **Onboarding Experience (Positive):** Users praise the new *interactive setup checklist*. Completion rates are up by **18%**.
2. **Billing Inquiries (Negative):** Subscriptions confusion spiked following the recent invoice formatting adjustments.
3. **Integration Setup (Neutral):** Standard queries regarding API key renewals.`,
    citations: [
      { id: "c_1", customer: "Sarah Jenkins (Acme Corp)", quote: "The new setup wizard is super smooth. Got configured in under 5 minutes!", sentiment: "positive" },
      { id: "c_2", customer: "David K. (Northstar)", quote: "Confused about the additional line items on our June invoice. Can we get this explained?", sentiment: "negative" }
    ],
    suggestedActions: [
      { label: "View affected themes", action: "navigate_themes" },
      { label: "Generate billing report", action: "generate_billing_report" },
      { label: "Notify accounts manager", action: "notify_billing_team" }
    ],
    followUpSuggestions: [
      "Compare this week with last week",
      "Show negative billing quotes",
      "Give me recommendations for onboarding"
    ]
  },

  negative_themes: {
    answer: `### Top Negative Themes (This Week)

The semantic engine categorized **142 negative feedback items** this week. Here are the top three rising negative themes:

1. **Billing & Invoice Clarity (38% of negative volume)**
   - *Issue:* Confusing layout changes in automatic receipts.
   - *Impact:* CSAT decreased by **4.5 points** in the billing category.
2. **Dashboard Load Latency (24% of negative volume)**
   - *Issue:* Slow rendering of real-time charts on mobile devices.
   - *Impact:* Average render speed rose to **3.2s** during peak load hours.
3. **Slack Alert Spam (15% of negative volume)**
   - *Issue:* Channel alerts firing too frequently for minor sentiment changes.`,
    citations: [
      { id: "c_3", customer: "M. Henderson (TechFlow)", quote: "The dashboard is taking forever to load on Safari iOS. It just hangs.", sentiment: "negative" },
      { id: "c_4", customer: "Elena Rostova (DevsInc)", quote: "Slack notifier fires an alert for every single ticket. It's cluttering our dev channel.", sentiment: "negative" }
    ],
    suggestedActions: [
      { label: "Optimize slack configuration", action: "navigate_integrations" },
      { label: "View dashboard load metrics", action: "navigate_trends" },
      { label: "Export negative themes CSV", action: "export_negative_themes" }
    ],
    followUpSuggestions: [
      "Show positive feedback themes",
      "Explain dashboard loading issue",
      "How to fix Slack spam alerts?"
    ]
  },

  csat_report: {
    answer: `### Customer Satisfaction (CSAT) Report

Our active CSAT index stands at **72%** (Good), representing a **+1.8% improvement** over the last 30 days.

\\\`\\\`\\\`
Sentiment Breakdown:
[████████████████████ 68%] Positive
[████ 14%] Neutral
[██████ 18%] Negative
\\\`\\\`\\\`

#### Key CSAT Highlights:
* **Product Quality Score:** **4.8 / 5.0** (Top driver: AI automation metrics).
* **Support Efficiency Score:** **4.2 / 5.0** (Top driver: Fast Slack responses).
* **Pricing Fairness Score:** **3.6 / 5.0** (Negative driver: Enterprise plan billing questions).

#### Recommendations to boost CSAT to 78%:
* Update invoice descriptions to clarify tax breakdowns.
* Reduce dashboard load latency by implementing data caching.`,
    citations: [
      { id: "c_5", customer: "Kenji Sato", quote: "The AI summary reports save me 4 hours every Monday. Unbelievable utility.", sentiment: "positive" }
    ],
    suggestedActions: [
      { label: "View sentiment analytics", action: "navigate_dashboard" },
      { label: "Export CSAT report PDF", action: "export_csat_pdf" }
    ],
    followUpSuggestions: [
      "Compare CSAT with NPS",
      "Show feedback recommendations",
      "Which products have the best reviews?"
    ]
  },

  trending_complaints: {
    answer: `### Trending Complaints

We detected an emerging complaint cluster regarding **"CSV Ingestion Failures"** starting yesterday at 14:00 UTC.

#### Issue Details:
* **Failure Cause:** CSV uploads containing semicolon delimiters (\`;\`) instead of standard commas (\`,\`) fail without helpful validation logs.
* **Volume:** **18 incidents** reported in the last 24 hours.
* **Affected Users:** Primarily self-serve startup plans.

#### Remediation Status:
We updated the CSV upload parser to automatically auto-detect delimiters. A patch was deployed to production.`,
    citations: [
      { id: "c_6", customer: "Alice Vance", quote: "Upload failed and didn't tell me why. Turns out it hated semicolons.", sentiment: "negative" }
    ],
    suggestedActions: [
      { label: "Check CSV upload logs", action: "navigate_settings" },
      { label: "Try CSV upload now", action: "navigate_inbox" }
    ],
    followUpSuggestions: [
      "How do I import feedback?",
      "Show feedback error logs",
      "Summarize startup plan quotes"
    ]
  },

  comparison: {
    answer: `### Monthly Comparison (June vs May)

June showed a **+14.2% increase** in feedback volume, driven by the public release of the new dashboard.

| Category | May | June | Change |
| :--- | :--- | :--- | :--- |
| **Total Reviews** | 1,240 | 1,416 | +14.2% |
| **Average CSAT** | 70% | 72% | +2.0% |
| **NPS Score** | 22 | 26 | +4 |
| **Critical Alerts** | 45 | 32 | -28.8% |

#### Key Insights:
- **NPS increase (+4)** is strongly associated with our upgraded *Ask LOOP AI* search tool.
- **Positive sentiment** is up in SaaS integrations, but down slightly in user administration controls.`,
    citations: [
      { id: "c_7", customer: "Marcus Aurelius (Empire)", quote: "The custom integrations are far superior to the older platforms.", sentiment: "positive" }
    ],
    suggestedActions: [
      { label: "View monthly dashboard", action: "navigate_dashboard" },
      { label: "Generate comparison PDF", action: "export_comparison_pdf" }
    ],
    followUpSuggestions: [
      "Show June negative drivers",
      "Compare CSAT with last quarter",
      "What should management focus on?"
    ]
  },

  actionable_recommendations: {
    answer: `### Actionable Recommendations for Management

Based on semantic analysis of customer complaints this month, we recommend focusing on the following three initiatives:

1. **Refine Receipt Descriptions (High Impact, Low Effort)**
   - *Why:* 38% of billing complaints arise from confusing taxes/line-item splits.
   - *Action:* Re-write invoice line items to clearly distinguish base cost from tax.
2. **Optimize Client-Side State Caching (Medium Impact, Medium Effort)**
   - *Why:* Dashboard load times on mobile are averaging **3.2s**, causing negative feedback.
   - *Action:* Cache chart layouts on the client and load datasets asynchronously.
3. **Upgrade CSV Parser Error Alerts (Low Impact, Low Effort)**
   - *Why:* Users are upload-blocked by delimiter mismatches without warning.
   - *Action:* Display explicit error guidelines: *“Please confirm file uses commas (,) as delimiters.”*`,
    citations: [
      { id: "c_8", customer: "Jeff Bezos (Zappos)", quote: "Make the invoice simpler. I shouldn't have to call support to explain a line item.", sentiment: "negative" }
    ],
    suggestedActions: [
      { label: "View theme volume metrics", action: "navigate_trends" },
      { label: "Export recommendations document", action: "export_recommendations" }
    ],
    followUpSuggestions: [
      "Show billing issues summary",
      "Explain dashboard latency details",
      "Compare this month with last month"
    ]
  },

  platform_import: {
    answer: `### How to Import Customer Feedback

LOOP supports three core ingestion channels:

1. **CSV Ingestion:**
   - Go to the **Inbox** page.
   - Click the **Import CSV** card.
   - Drag and drop your file. Confirm mapping headers: \`Customer name\`, \`Feedback Text\`, \`Date\`.
2. **Slack Integration:**
   - Go to **Settings > Integrations**.
   - Click **Connect Slack** and authorize the LOOP Slack app.
   - Use the command \`/loop-feedback\` or add the 💬 reaction emoji to save any Slack messages directly!
3. **API Integration:**
   - Generate an API Key under **Settings > Developers** and POST payloads to:
     \`\`\`bash
     curl -X POST https://api.loopai.dev/v1/feedback \\
       -H "Authorization: Bearer <API_KEY>" \\
       -d '{"text": "Love the product!"}'
     \`\`\``,
    citations: [],
    suggestedActions: [
      { label: "Go to Inbox integration page", action: "navigate_inbox" },
      { label: "Go to Slack integrations page", action: "navigate_integrations" }
    ],
    followUpSuggestions: [
      "How to connect Slack?",
      "How do permissions work?",
      "Where can I find my API key?"
    ]
  },

  platform_slack: {
    answer: `### Connecting Slack to LOOP

You can easily ingest feedback from Slack in real time:

1. Navigate to [Settings > Integrations](/settings).
2. Find the **Slack** card and click **Connect**.
3. Authorize LOOP to access your Slack workspace.
4. Select the channels (e.g. \`#customer-love\`, \`#feedback\`) where LOOP should listen.

#### Ingestion Methods:
* **Emoji Reaction:** Tag any message with the 💬 emoji. LOOP will extract the text, sentiment, and sender metadata automatically.
* **Shortcut Command:** Enter \`/loop-feedback [quote text]\` in any conversation.`,
    citations: [],
    suggestedActions: [
      { label: "Connect Slack in Settings", action: "navigate_integrations" }
    ],
    followUpSuggestions: [
      "How do permissions work?",
      "How do I create themes?",
      "How do I import CSV feedback?"
    ]
  },

  platform_permissions: {
    answer: `### Workspace Permissions and Member Roles

LOOP workspace memberships support three main access tiers:

1. **Owner:**
   - Full billing control.
   - Workspace deletion and developer key creation.
   - Modify integrations.
2. **Admin:**
   - Manage user invites and edit workspace configurations.
   - Add/modify semantic themes.
   - Generate and edit reports.
3. **Member (Viewer):**
   - Access to Dashboards, Trends, and Reports.
   - Search feedback.
   - Cannot modify integration setups or edit Billing.`,
    citations: [],
    suggestedActions: [
      { label: "Manage Workspace Members", action: "navigate_members" },
      { label: "Configure Billing Settings", action: "navigate_settings" }
    ],
    followUpSuggestions: [
      "How do I invite users?",
      "Where are integrations?",
      "Create an executive summary"
    ]
  }
};

// Simple search router helper
function findResponse(query: string): AskResponse {
  const q = query.toLowerCase().trim();
  
  if (q.includes("today") || q.includes("summarize today") || q.includes("feedback summary")) {
    return RESPONSES_DB.feedback_summary;
  }
  if (q.includes("negative themes") || q.includes("complaints this week") || q.includes("top negative")) {
    return RESPONSES_DB.negative_themes;
  }
  if (q.includes("csat") || q.includes("satisfaction") || q.includes("customer satisfaction")) {
    return RESPONSES_DB.csat_report;
  }
  if (q.includes("trending complaints") || q.includes("trending issue") || q.includes("complaint")) {
    return RESPONSES_DB.trending_complaints;
  }
  if (q.includes("compare") || q.includes("comparison") || q.includes("this month with last")) {
    return RESPONSES_DB.comparison;
  }
  if (q.includes("recommendation") || q.includes("actionable") || q.includes("management focus")) {
    return RESPONSES_DB.actionable_recommendations;
  }
  if (q.includes("import") || q.includes("upload csv") || q.includes("csv")) {
    return RESPONSES_DB.platform_import;
  }
  if (q.includes("slack") || q.includes("connect slack")) {
    return RESPONSES_DB.platform_slack;
  }
  if (q.includes("permission") || q.includes("role") || q.includes("owner")) {
    return RESPONSES_DB.platform_permissions;
  }

  // Generative default response
  return {
    answer: `### Understanding "${query}" inside LOOP

I searched your workspace but didn't find specific custom alerts matching that precise query. Here is how you can manage this:

* **Ingested Reviews:** Feedback is scanned daily. Feel free to check the [Trends](/trends) chart for real-time breakdowns.
* **Semantic Analysis:** AI extracts critical features automatically. Go to [Themes](/themes) to construct tag tracking.
* **Integrations:** Confirm that your Slack, Zendesk, or Intercom streams are linked in [Settings](/settings).

*Tip: Try asking: "Summarize today's customer feedback" or "What are the top negative themes this week?"*`,
    citations: [],
    suggestedActions: [
      { label: "View Trends Dashboard", action: "navigate_trends" },
      { label: "Go to Settings Panel", action: "navigate_settings" }
    ],
    followUpSuggestions: [
      "Summarize today's customer feedback",
      "What are the top negative themes this week?",
      "How do I import feedback?"
    ]
  };
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Missing message field" }, { status: 400 });
    }

    const payload = findResponse(message);

    // Add a slight latency simulation to give a realistic enterprise AI streaming feeling
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Ask LOOP AI Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
