export class IntentValidator {
  /**
   * List of supported keywords and intent phrases for the LOOP platform.
   * This ensures the AI only processes requests related to feedback analytics.
   */
  private static supportedKeywords = [
    "feedback", "feedbacks", "customer feedback",
    "positive", "negative", "neutral",
    "sentiment", "sentiment analysis",
    "trends", "trend", "trend analysis",
    "themes", "theme", "theme detection",
    "analytics", "dashboard",
    "report", "reports", "insights",
    "workspace", "workspace statistics",
    "users", "roles", "workspace settings",
    "integrations", "csv", "import", "export", "imported records",
    "rating", "ratings", "satisfaction", "customer satisfaction",
    "complaints", "top complaints", "feature requests", "bug reports",
    "categories", "feedback categories",
    "ai", "ask loop ai", "loop", "loop features", "loop modules",
    "data", "statistics", "summary", "data summary",
    "recommendations", "ai recommendations", "actionable recommendations",
    "product issues", "user experience", "data filters", "report generation",
    "weekly reports", "monthly reports", "uploaded data"
  ];

  /**
   * Refusal message returned when the prompt is entirely off-topic.
   */
  public static refusalMessage = 
    "I'm the AI assistant for LOOP and I'm designed specifically to help you analyze customer feedback, reports, themes, trends, workspace data, and other LOOP platform features. Please ask a question related to your LOOP workspace.";

  /**
   * Validates if the user's query is relevant to the LOOP platform.
   * Returns true if it contains matching keywords, false otherwise.
   * 
   * Note: This is a basic keyword matching implementation. 
   * In a more complex scenario, an extremely fast lightweight intent-classification model could be used.
   */
  public static isLoopIntent(query: string): boolean {
    if (!query) return false;

    const normalizedQuery = query.toLowerCase().trim();

    // If query is extremely short (like "hi", "hello"), we can let it pass to the LLM to greet back,
    // or we can strictly enforce keyword matching. Given the prompt rules, we want strict matching.
    // However, common conversational starters are sometimes okay. Let's allow greetings if they are very short.
    const greetings = ["hi", "hello", "hey", "help", "what can you do"];
    if (greetings.includes(normalizedQuery.replace(/[^\w\s]/g, ""))) {
      return true; 
    }

    // Check against supported keywords
    for (const keyword of this.supportedKeywords) {
      // Using regex word boundary or simple includes. `includes` is safer for multi-word phrases.
      if (normalizedQuery.includes(keyword)) {
        return true;
      }
    }

    return false;
  }
}
