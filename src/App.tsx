import { Component, type ReactNode } from "react";
import { StudioLayout } from "./studio/StudioLayout";
import { Player } from "./game/Player";
class GameBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div style={{ padding: 40 }}>
        The 3D scene could not start. Enable WebGL or try another browser.{" "}
        <button onClick={() => location.reload()}>Retry</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export const App = () => (
  <GameBoundary>
    {location.pathname.startsWith("/studio") ? <StudioLayout /> : <Player />}
  </GameBoundary>
);
export default App;
