export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10">
      <div className="space-y-6 animate-pulse">
        <div className="h-16 rounded-[28px] bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 rounded-[28px] bg-slate-200 dark:bg-slate-800"
            />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="h-80 rounded-[28px] bg-slate-200 dark:bg-slate-800 xl:col-span-2" />
          <div className="h-80 rounded-[28px] bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </main>
  );
}
