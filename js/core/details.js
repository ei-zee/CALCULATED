let activeLayer = null;
let closeHandler = null;

function getThemeColors() {
  const bodyStyle = getComputedStyle(document.body);

  return {
    background:
      bodyStyle.backgroundColor &&
      bodyStyle.backgroundColor !== "rgba(0, 0, 0, 0)"
        ? bodyStyle.backgroundColor
        : "#ffffff",

    color: bodyStyle.color || "#111111"
  };
}

function closeDetails() {
  if (!activeLayer) return;

  const layer = activeLayer;
  const handler = closeHandler;

  activeLayer = null;
  closeHandler = null;

  layer.remove();

  if (handler) {
    handler();
  }
}

export function openDetails({ anchor, title, content, onClose }) {
  closeDetails();

  const colors = getThemeColors();

  const layer = document.createElement("div");
  layer.className = "slot-details-layer";

  const panel = document.createElement("div");
  panel.className = "slot-details-panel";

  const header = document.createElement("div");
  header.className = "slot-details-header";

  const titleElement = document.createElement("div");
  titleElement.className = "slot-details-title";
  titleElement.textContent = title ?? "";

  const closeButton = document.createElement("button");
  closeButton.className = "slot-details-close";
  closeButton.type = "button";
  closeButton.textContent = "✕";
  closeButton.addEventListener("click", closeDetails);

  header.append(titleElement, closeButton);

  const contentElement = document.createElement("div");
  contentElement.className = "slot-details-content";

  if (typeof content === "string") {
    contentElement.innerHTML = content;
  } else if (content instanceof Node) {
    contentElement.append(content);
  }

  panel.append(header, contentElement);
  layer.append(panel);

  const host = anchor instanceof Node ? anchor : document.body;

  host.style.position = "relative";
  host.appendChild(layer);

  activeLayer = layer;
  closeHandler = onClose ?? null;

  return closeDetails;
}

const style = document.createElement("style");

style.textContent = `
  .slot-details-layer {
    position: absolute;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    background: rgba(0, 0, 0, .25);
    border-radius: inherit;
    overflow: hidden;
    animation: slot-details-fade .15s ease;
  }

  .slot-details-panel {
    width: 100%;
    max-height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--slot-details-bg, #fff);
    color: var(--slot-details-color, #111);
    border-radius: 16px 16px 0 0;
    overflow: hidden;
    box-shadow: 0 -8px 30px rgba(0, 0, 0, .2);
    animation: slot-details-slide .2s ease;
  }

  .slot-details-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(128, 128, 128, .25);
  }

  .slot-details-title {
    font-size: 15px;
    font-weight: 700;
  }

  .slot-details-close {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 9px;
    background: rgba(128, 128, 128, .18);
    color: inherit;
    font-size: 14px;
    cursor: pointer;
  }

  .slot-details-content {
    padding: 14px;
    overflow-y: auto;
  }

  @keyframes slot-details-fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slot-details-slide {
    from { transform: translateY(30px); opacity: .5; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

document.head.appendChild(style);