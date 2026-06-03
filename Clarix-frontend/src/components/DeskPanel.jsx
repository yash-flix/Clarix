const DESK_FLOW = [
  { step: "01", label: "Submit", desc: "File your request" },
  { step: "02", label: "Triage", desc: "AI sets priority" },
  { step: "03", label: "Route", desc: "Match moderator" },
];

export default function DeskPanel({ openCount = 0, activeCount = 0 }) {
  return (
    <div className="border border-neutral-200 bg-paper h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 px-6 sm:px-8 py-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <span className="label-caps">The desk</span>
          <span className="hidden sm:inline text-neutral-300">·</span>
          <span className="hidden sm:inline label-caps text-neutral-400">Support queue</span>
        </div>
        <span className="inline-flex items-center gap-2 label-caps text-[#ff3b00]">
          <span className="h-2 w-2 bg-[#ff3b00] shrink-0" aria-hidden />
          Live
        </span>
      </div>

      <div className="flex-1 px-6 sm:px-8 py-8 sm:py-10 flex flex-col justify-center">
        <p className="font-display text-xl sm:text-2xl lg:text-[1.65rem] leading-snug text-neutral-600 max-w-lg">
          Clarix categorizes every request, assigns priority, and matches the right moderator —{" "}
          <span className="text-ink">without the back-and-forth.</span>
        </p>

        <div className="mt-10 pt-8 border-t border-neutral-200 grid grid-cols-3 gap-4 sm:gap-6">
          {DESK_FLOW.map((item) => (
            <div key={item.step}>
              <p className="label-caps text-neutral-300 mb-2">{item.step}</p>
              <p className="text-sm font-medium text-ink">{item.label}</p>
              <p className="mt-1 text-xs text-neutral-400 leading-relaxed hidden sm:block">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {(openCount > 0 || activeCount > 0) && (
        <div className="px-6 sm:px-8 py-3 border-t border-neutral-200 bg-neutral-50/80">
          <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
            Desk → {openCount} open
            {activeCount > 0 && ` · ${activeCount} in progress`}
          </p>
        </div>
      )}
    </div>
  );
}
