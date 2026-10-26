import {
  AbsoluteFill,
  Composition,
  OffthreadVideo,
  registerRoot,
  useCurrentFrame,
} from "remotion";
type Props = {
  src: string;
  title: string;
  duration: number;
  score: number;
  target: number;
  result: string;
  events: { time: number; type: string; value: number }[];
  landscape?: boolean;
};
export function EpisodeVideo(p: Props) {
  const frame = useCurrentFrame(),
    t = frame / 30;
  const result = p.events.find(
    (e) => e.type === "victory" || e.type === "defeat",
  );
  const score = p.events
    .filter(
      (e) =>
        e.time <= t &&
        (e.type === "collect" || e.type === "penalty" || e.type === "gate"),
    )
    .reduce((a, e) => Math.max(0, a + e.value), 0);
  return (
    <AbsoluteFill
      style={{ background: "#092d49", fontFamily: "Arial", color: "white" }}
    >
      <OffthreadVideo
        src={p.src}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 60,
          right: 60,
          background: "#032a45e8",
          border: "3px solid #5adfff",
          borderRadius: 35,
          padding: 30,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 5, color: "#8fe7ff" }}>
          GLOOP’S GLITCH LAB
        </div>
        <h1 style={{ fontSize: 44, margin: "20px 0" }}>
          {t < 3 ? p.title : `${score} / ${p.target} ORBS`}
        </h1>
        <div style={{ height: 10, background: "#ffffff22", borderRadius: 10 }}>
          <div
            style={{
              height: 10,
              width: `${Math.min(100, (score / p.target) * 100)}%`,
              background: "#8aef68",
              borderRadius: 10,
            }}
          />
        </div>
      </div>
      {t >= 10 && t < 13 && (
        <div
          style={{
            position: "absolute",
            top: "32%",
            alignSelf: "center",
            background: "#7438c9",
            padding: 25,
            borderRadius: 25,
            fontSize: 48,
            fontWeight: 900,
          }}
        >
          RULE FLIP!
        </div>
      )}
      {result && t >= result.time && (
        <div
          style={{
            position: "absolute",
            bottom: 180,
            left: 60,
            right: 60,
            textAlign: "center",
            background: "#052d49ed",
            padding: 45,
            borderRadius: 40,
          }}
        >
          <h1 style={{ fontSize: 76, color: "#ffd044", margin: 0 }}>
            {p.result === "victory" ? "GLOOP DID IT!" : "TRY AGAIN!"}
          </h1>
          <p style={{ fontSize: 36 }}>
            {p.score} / {p.target} orbs
          </p>
          <div style={{ fontSize: 22 }}>
            ONE CHALLENGE. ONE RUN. THIRTY SECONDS.
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}
const defaults: Props = {
  src: "",
  title: "Gloop’s challenge",
  duration: 30,
  score: 0,
  target: 20,
  result: "defeat",
  events: [],
};
registerRoot(() => (
  <Composition
    id="GloopEpisode"
    component={EpisodeVideo}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={900}
    defaultProps={defaults}
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.max(1, Math.round(props.duration * 30)),
      width: props.landscape ? 1920 : 1080,
      height: props.landscape ? 1080 : 1920,
    })}
  />
));
