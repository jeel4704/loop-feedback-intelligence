import { demoFeedback } from "@/data/feedback";
import { demoThemes } from "@/data/themes";
import { Button, Card, CardContent, SectionHeader } from "@/components/ui";

export default function ThemesPage() {
  const themeCards = demoThemes.map((theme) => {
    const items = demoFeedback.filter((item) => item.theme === theme.name);
    const negativeCount = items.filter((item) => item.sentiment === "Negative").length;
    const positiveCount = items.filter((item) => item.sentiment === "Positive").length;
    const sentimentSummary =
      negativeCount > positiveCount
        ? `${negativeCount} negative / ${positiveCount} positive`
        : `${positiveCount} positive / ${negativeCount} negative`;

    return {
      ...theme,
      count: items.length,
      sentimentSummary
    };
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Theme Intelligence"
        title="Track what customers keep talking about"
        description="Theme cards help teams understand frequency, sentiment, and the feedback clusters that need product or support action."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {themeCards.map((theme) => (
          <Card key={theme.id}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-blue-600">{theme.count} mentions</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-950 dark:text-slate-50">
                {theme.name}
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {theme.description}
              </p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {theme.sentimentSummary}
              </p>
              <Button variant="secondary" className="mt-6 w-full">
                View feedback
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
