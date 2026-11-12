import { Component, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
class Boundary extends Component<{ children: ReactNode }, { err?: Error }> {
  state: { err?: Error } = {};
  static getDerivedStateFromError(err: Error) { return { err }; }
  render() { return this.state.err ? <div className="center"><div className="card login"><h1>Terjadi kesalahan</h1><p className="err">{this.state.err.message}</p></div></div> : this.props.children; }
}
createRoot(document.getElementById("root")!).render(<Boundary><App /></Boundary>);
