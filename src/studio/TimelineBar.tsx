import { useGameStore } from "../store/gameStore";
const beats = [
  ["hook", "Hook", 0, 2],
  ["collect", "Collect", 2, 6],
  ["groove", "Groove", 6, 10],
  ["twist", "Twist", 10, 14],
  ["hard-obstacle", "Hard stop", 14, 17],
  ["reaction", "Reaction", 17, 19],
  ["final-run", "Final run", 19, 28],
  ["result", "Result", 28, 30],
] as const;
export function TimelineBar() {
  const s = useGameStore(),
    p = s.activeEpisode.durationSeconds / 30;
  return (
    <section className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
      <div className="flex justify-between text-xs mb-2">
        <strong>8-BEAT EPISODE TIMELINE</strong>
        <span>
          {s.elapsedTime.toFixed(1)} / {s.activeEpisode.durationSeconds}s
        </span>
      </div>
      <div className="flex h-12 overflow-hidden rounded-xl bg-slate-900">
        {beats.map(([id, label, start, end]) => (
          <div
            key={id}
            style={{ flex: end - start }}
            className={
              "px-1 py-2 border-r border-slate-800 text-[9px] truncate " +
              (s.activeBeat === id
                ? "bg-cyan-900 text-cyan-200"
                : "text-slate-500")
            }
          >
            <strong>{label}</strong>
            <div>
              {Math.round(start * p)}–{Math.round(end * p)}s
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
