import { ReactElement } from "../react/interface";
import { listenToAllSupportedEvents } from "./events/registerEvents";
import { ReactRoot } from "./ReactRoot";

export type Container = HTMLElement;

const ReactDOM = {
  render(element: ReactElement, container: Container) {
    const root = new ReactRoot(container);
    listenToAllSupportedEvents(container);
    root.render(element);
  }
}

export default ReactDOM;