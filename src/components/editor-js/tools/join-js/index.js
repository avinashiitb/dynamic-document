import "./diagramly.css";
import { Diagramly } from "@avinashiitb/diagramly";
import { v4 as uuidv4 } from 'uuid';
export class DiagramlyBlock {
  static get toolbox() {
    return {
      title: "Diagram",
      icon: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M21 18v-4h-5.042L13 11.042V8.95a3.5 3.5 0 1 0-1 0v2.074L9.024 14H4v4H2v5h5v-5H5v-3h3.958l3.532 3.533L16.024 15H20v3h-2v5h5v-5zM6 22H3v-3h3zm4-16.5A2.5 2.5 0 1 1 12.5 8 2.5 2.5 0 0 1 10 5.5zm2.485 11.633l-2.6-2.6 2.5-2.5h.2l2.5 2.5zM22 22h-3v-3h3z"></path></g></svg>',
    };
  }

  constructor({ data }) {
    this.data = data || { graph: {}, width: 1000, height: 400 };
    this.wrapper = null;
    this.diagram = null;
  }

  render() {
    this.menuId = `menu-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.instanceId = uuidv4();

    const fullScreenClass = `full-screen-${this.instanceId}`;
    const fullScreenPaperClass = `full-paper-screen-${this.instanceId}`;

    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("main-layout");
    this.wrapper.id = fullScreenClass;

    const menu = document.createElement("div");
    menu.id = this.menuId;
    menu.classList.add("menu");

    const paperWrapper = document.createElement("div");
    paperWrapper.id = "paper-wrapper";
    paperWrapper.className = "border border-gray-200";
    paperWrapper.classList.add(fullScreenPaperClass);
    // paperWrapper.style.width = "800px";
    paperWrapper.style.minHeight = "400px";
    paperWrapper.style.maxHeight = "830px";
    paperWrapper.style.overflow = "auto";
    paperWrapper.style.flex = 1;

    const diagramContainer = document.createElement("div");
    diagramContainer.id = "paper";
    diagramContainer.classList.add("jointjs-paper-container");

    paperWrapper.appendChild(diagramContainer);
    this.wrapper.appendChild(menu);
    this.wrapper.appendChild(paperWrapper);

    // Make sure DOM is rendered first
    setTimeout(() => {
      if (diagramContainer.isConnected) {
        this.diagram = new Diagramly({
          data: this.data,
          container: diagramContainer,
          instanceId: this.instanceId
        });
        this.diagram.renderSidebar(this.menuId);
      }
    }, 0);

    return this.wrapper;
  }

  save() {
    const data = this.diagram?.save?.() || { graph: {}, width: 1000, height: 666 }
    return data;
  }
}
