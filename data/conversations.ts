import { demoFeedback } from "@/data/feedback";

function sourcesForTheme(theme: string) {
  return demoFeedback
    .filter((item) => item.theme === theme)
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      customerLabel: item.customerLabel,
      content: item.content,
      channel: item.channel,
      sentiment: item.sentiment
    }));
}

export const demoConversations = [
  {
    id: "conversation_onboarding",
    question: "What are users saying about onboarding?",
    answer:
      "Users consistently describe onboarding as one of the highest-friction parts of the product. The most common pattern is that teams need too many steps before importing feedback and seeing first value. When onboarding goes smoothly, customers still ask for more guidance and faster workspace setup.",
    sources: sourcesForTheme("Onboarding")
  },
  {
    id: "conversation_billing",
    question: "Why is billing sentiment negative?",
    answer:
      "Billing sentiment skews negative because customers struggle with plan clarity during upgrades, invoice interpretation, and procurement approvals. This is less about payment failures and more about confidence: buyers want transparent limits, clearer comparisons, and fewer surprises when expanding seats.",
    sources: sourcesForTheme("Billing")
  },
  {
    id: "conversation_requests",
    question: "Which feature is requested the most?",
    answer:
      "Reporting and search-related improvements appear most often in request-style feedback. Customers want easier report sharing, saved searches, stronger export fidelity, and more control over how insights are packaged for leadership and cross-functional reviews.",
    sources: [
      ...sourcesForTheme("Reports").slice(0, 2),
      ...sourcesForTheme("Search").slice(0, 2),
      ...sourcesForTheme("Export").slice(0, 1)
    ]
  }
] as const;
