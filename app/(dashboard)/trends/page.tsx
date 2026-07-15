import { DashboardCharts } from "@/components/charts";
import { Badge, Card, CardContent, SectionHeader } from "@/components/ui";
import {
  feedbackVolumeData,
  sentimentData,
  themeGrowth,
  topThemesData,
  trendCards
} from "@/lib/mock-data";

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Trend Detection"
        title="Watch how customer themes move over time"
        description="Highlight rising issues, detect spikes, and spot improvements after launches, fixes, and support changes."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {trendCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                {card.value}
              </p>
              <p className="mt-2 text-sm text-slate-600">{card.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-950">Theme Growth</h3>
            <div className="mt-5 space-y-3">
              {themeGrowth.map((theme) => (
                <div
                  key={theme.name}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{theme.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{theme.growth}</p>
                  </div>
                  {theme.spike ? (
                    <Badge variant="rose">Spike detected</Badge>
                  ) : (
                    <Badge variant="slate">Steady rise</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <DashboardCharts
          volumeData={[...feedbackVolumeData]}
          sentimentData={[...sentimentData]}
          themeData={[...topThemesData]}
        />
      </div>
    </div>
  );
}
