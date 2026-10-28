const EPSILON = 0.01;

const DEG = Math.PI / 180;

const HIT_RADIUS = 14;


export default function createAreaShapeCalculator(container, context) {
  const { t, emit } = context;


  let walls = [];
  let draftLength = "";
  let draftAngle = "90";
  let selectedIndex = null;

  let canvas = null;
  let ctx = null;
  let statusElement = null;
  let areaElement = null;
  let perimeterElement = null;
  let lengthInput = null;
  let angleInput = null;
  let editorElement = null;

  let destroyed = false;


  function tr(key, vars = {}) {
    const text = t(key, vars);

    return typeof text === "string" ? text : key;
  }


  function normalizeNumber(value) {
    return String(value ?? "")
      .trim()
      .replace(",", ".");
  }


  function parseNumber(value) {
    const normalized = normalizeNumber(value);

    if (normalized === "" || !/^-?\d*\.?\d+$/.test(normalized)) {
      return NaN;
    }

    return Number(normalized);
  }


  function formatNumber(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }

    return Number(value.toFixed(3)).toLocaleString("ru-RU", {
      maximumFractionDigits: 3
    });
  }


  function normalizeAngle(angle) {
    let result = angle % 360;

    if (result > 180) result -= 360;
    if (result < -180) result += 360;

    return result;
  }


  function buildPoints(wallList) {
    const points = [{ x: 0, y: 0 }];
    let heading = 0;

    wallList.forEach(wall => {
      heading += wall.angle * DEG;

      points.push({
        x: points[points.length - 1].x + Math.sin(heading) * wall.length,
        y: points[points.length - 1].y + Math.cos(heading) * wall.length
      });
    });

    return points;
  }


  function getGap(points) {
    const first = points[0];
    const last = points[points.length - 1];

    return Math.hypot(first.x - last.x, first.y - last.y);
  }


  function isClosed(points) {
    return walls.length >= 3 && getGap(points) < EPSILON;
  }


  function polygonArea(points) {
    let sum = 0;

    for (let i = 0; i < points.length - 1; i++) {
      sum += points[i].x * points[i + 1].y - points[i + 1].x * points[i].y;
    }

    return Math.abs(sum) / 2;
  }


  function polygonPerimeter(points) {
    let sum = 0;

    for (let i = 0; i < points.length - 1; i++) {
      sum += Math.hypot(
        points[i + 1].x - points[i].x,
        points[i + 1].y - points[i].y
      );
    }

    return sum;
  }


  function getClosingWall() {
    const points = buildPoints(walls);

    if (walls.length < 2 || isClosed(points)) {
      return null;
    }

    let heading = 0;

    walls.forEach(wall => {
      heading += wall.angle * DEG;
    });

    const first = points[0];
    const last = points[points.length - 1];

    const target = Math.atan2(first.x - last.x, first.y - last.y);

    return {
      length: getGap(points),
      angle: normalizeAngle((target - heading) / DEG)
    };
  }


  function closeShape() {
    const closing = getClosingWall();

    if (!closing) {
      return;
    }

    walls.push(closing);

    draftLength = "";
    draftAngle = "90";

    if (lengthInput) lengthInput.value = "";
    if (angleInput) angleInput.value = draftAngle;

    selectedIndex = walls.length - 1;

    renderEditor();
    updateAll();
  }


  function addWall() {
    const length = parseNumber(draftLength);
    const angle = parseNumber(draftAngle);

    if (!Number.isFinite(length) || length <= 0) {
      statusElement.textContent = tr("area.status.invalidLength");
      return;
    }

    walls.push({
      length,
      angle: Number.isFinite(angle) ? normalizeAngle(angle) : 0
    });

    draftLength = "";

    if (lengthInput) {
      lengthInput.value = "";
    }

    selectedIndex = walls.length - 1;

    renderEditor();
    updateAll();
  }


  function stepLength(delta) {
    const current = parseNumber(draftLength);
    const base = Number.isFinite(current) ? current : 0;

    const next = Math.max(0, Number((base + delta).toFixed(3)));

    draftLength = String(next).replace(".", ",");

    if (lengthInput) {
      lengthInput.value = draftLength;
    }

    drawCanvas();
  }


  function updateSelectedWall(field, value) {
    if (selectedIndex === null) {
      return;
    }

    const wall = walls[selectedIndex];

    if (!wall) {
      return;
    }

    const parsed = parseNumber(value);

    if (!Number.isFinite(parsed)) {
      return;
    }

    if (field === "length" && parsed > 0) {
      wall.length = parsed;
    }

    if (field === "angle") {
      wall.angle = normalizeAngle(parsed);
    }

    updateAll();
  }


  function rotateSelectedWall(delta) {
    if (selectedIndex === null) {
      return;
    }

    const wall = walls[selectedIndex];

    if (!wall) {
      return;
    }

    wall.angle = normalizeAngle(wall.angle + delta);

    renderEditor();
    updateAll();
  }


  function deleteSelectedWall() {
    if (selectedIndex === null) {
      return;
    }

    walls.splice(selectedIndex, 1);

    selectedIndex = walls.length
      ? walls.length - 1
      : null;

    renderEditor();
    updateAll();
  }


  function undoWall() {
    walls.pop();

    selectedIndex = walls.length
      ? walls.length - 1
      : null;

    renderEditor();
    updateAll();

    return { status: "accepted" };
  }


  function reset() {
    walls = [];
    draftLength = "";
    selectedIndex = null;

    if (lengthInput) {
      lengthInput.value = "";
    }

    context.setResult("");

    renderEditor();
    updateAll();

    return { status: "accepted" };
  }


  function updateResults() {
    const points = buildPoints(walls);
    const closed = isClosed(points);

    if (!walls.length) {
      areaElement.textContent = "—";
      perimeterElement.textContent = "—";
      statusElement.textContent = tr("area.status.start");
      context.setResult("");

      return;
    }

    if (closed) {
      const area = polygonArea(points);
      const perimeter = polygonPerimeter(points);

      areaElement.textContent = formatNumber(area);
      perimeterElement.textContent = formatNumber(perimeter);
      statusElement.textContent = tr("area.status.closed");

      context.setResult(area);

      return;
    }

    areaElement.textContent = "—";
    perimeterElement.textContent = "—";
    statusElement.textContent = tr("area.status.gap", {
      gap: formatNumber(getGap(points))
    });

    context.setResult("");
  }


  function renderEditor() {
    if (!editorElement) {
      return;
    }

    if (!walls.length || selectedIndex === null || !walls[selectedIndex]) {
      editorElement.innerHTML = `
        <div class="area-shape__editor-empty">
          ${tr("area.editor.empty")}
        </div>
      `;

      return;
    }

    const wall = walls[selectedIndex];

    editorElement.innerHTML = `
      <div class="area-shape__editor-title">
        ${tr("area.editor.title", { index: selectedIndex + 1 })}
      </div>

      <div class="area-shape__editor-row">
        <label class="area-shape__editor-field">
          <span>${tr("area.lengthLabel")}</span>

          <input
            data-editor="length"
            type="text"
            inputmode="decimal"
            value="${wall.length}"
          >
        </label>

        <label class="area-shape__editor-field">
          <span>${tr("area.angleLabel")}</span>

          <input
            data-editor="angle"
            type="text"
            inputmode="numeric"
            value="${wall.angle}"
          >
        </label>
      </div>

      <div class="area-shape__editor-row">
        <button class="area-shape__editor-button" data-rotate="90" type="button">
          ↰ 90°
        </button>

        <button class="area-shape__editor-button" data-rotate="-90" type="button">
          ↱ 90°
        </button>

        <button class="area-shape__editor-button area-shape__editor-button--danger" data-editor-delete type="button">
          ✕
        </button>
      </div>
    `;
  }


  function getPreviewPoint(points) {
    const draftLengthValue = parseNumber(draftLength);
    const draftAngleValue = parseNumber(draftAngle);

    if (
      !walls.length ||
      isClosed(points) ||
      !Number.isFinite(draftLengthValue) ||
      draftLengthValue <= 0
    ) {
      return null;
    }

    let heading = 0;

    walls.forEach(wall => {
      heading += wall.angle * DEG;
    });

    if (Number.isFinite(draftAngleValue)) {
      heading += draftAngleValue * DEG;
    }

    const last = points[points.length - 1];

    return {
      x: last.x + Math.sin(heading) * draftLengthValue,
      y: last.y + Math.cos(heading) * draftLengthValue
    };
  }


  function getCanvasScale() {
    const rect = canvas.getBoundingClientRect();
    const points = buildPoints(walls);

    const padding = 26;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    points.forEach(point => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });

    const boxWidth = Math.max(maxX - minX, 1);
    const boxHeight = Math.max(maxY - minY, 1);

    const scale = Math.min(
      (rect.width - padding * 2) / boxWidth,
      (rect.height - padding * 2) / boxHeight
    );

    const offsetX = (rect.width - boxWidth * scale) / 2;
    const offsetY = (rect.height - boxHeight * scale) / 2;

    return {
      rect,
      points,
      previewPoint: getPreviewPoint(points),
      closed: isClosed(points),

      toScreen(point) {
        return {
          x: offsetX + (point.x - minX) * scale,
          y: rect.height - offsetY - (point.y - minY) * scale
        };
      }
    };
  }


  function findSegmentAt(screenPoint, view) {
    let bestIndex = null;
    let bestDistance = Infinity;

    for (let i = 0; i < view.points.length - 1; i++) {
      const a = view.toScreen(view.points[i]);
      const b = view.toScreen(view.points[i + 1]);

      const distance = distanceToSegment(screenPoint, a, b);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = i;
      }
    }

    return bestDistance <= HIT_RADIUS ? bestIndex : null;
  }


  function distanceToSegment(point, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    const lengthSquared = dx * dx + dy * dy;

    if (!lengthSquared) {
      return Math.hypot(point.x - a.x, point.y - a.y);
    }

    let position = (
      (point.x - a.x) * dx +
      (point.y - a.y) * dy
    ) / lengthSquared;

    position = Math.max(0, Math.min(1, position));

    return Math.hypot(
      point.x - (a.x + position * dx),
      point.y - (a.y + position * dy)
    );
  }


  function drawCanvas() {
    if (!canvas || !ctx) {
      return;
    }

    const rect = canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const view = getCanvasScale();
    const { points, previewPoint, closed } = view;


    function drawArrow(from, to, color, dashed = false) {
      const angle = Math.atan2(to.y - from.y, to.x - from.x);

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;

      if (dashed) {
        ctx.setLineDash([6, 5]);
      }

      ctx.stroke();
      ctx.setLineDash([]);

      const size = 14;

      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(
        to.x - size * Math.cos(angle - 0.42),
        to.y - size * Math.sin(angle - 0.42)
      );
      ctx.lineTo(
        to.x - size * Math.cos(angle + 0.42),
        to.y - size * Math.sin(angle + 0.42)
      );
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }


    for (let i = 0; i < points.length - 1; i++) {
      const from = view.toScreen(points[i]);
      const to = view.toScreen(points[i + 1]);

      drawArrow(
        from,
        to,
        i === selectedIndex ? "#ff9f43" : "#4f8cff"
      );
    }


    if (!closed && previewPoint) {
      drawArrow(
        view.toScreen(points[points.length - 1]),
        view.toScreen(previewPoint),
        "rgba(255, 159, 67, .95)",
        true
      );
    }


    if (closed) {
      ctx.beginPath();

      const first = view.toScreen(points[0]);
      ctx.moveTo(first.x, first.y);

      for (let i = 1; i < points.length; i++) {
        const point = view.toScreen(points[i]);
        ctx.lineTo(point.x, point.y);
      }

      ctx.closePath();
      ctx.fillStyle = "rgba(79, 140, 255, .12)";
      ctx.fill();
    }


    points.forEach((point, index) => {
      const screen = view.toScreen(point);

      ctx.beginPath();
      ctx.arc(
        screen.x,
        screen.y,
        index === 0 ? 6 : 4.5,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = index === 0 ? "#ff9f43" : "#4f8cff";
      ctx.fill();
    });
  }


  function onCanvasPointerDown(event) {
    if (destroyed || !walls.length) {
      return;
    }

    const rect = canvas.getBoundingClientRect();

    const screenPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    const view = getCanvasScale();

    selectedIndex = findSegmentAt(screenPoint, view);

    renderEditor();
    drawCanvas();
  }


  function updateAll() {
    updateResults();
    drawCanvas();
  }


  async function copyPerimeter() {
    const points = buildPoints(walls);

    if (!isClosed(points)) {
      return;
    }

    const text = formatNumber(polygonPerimeter(points));

    try {
      await navigator.clipboard.writeText(text);

      emit?.("feedback:show", {
        message: tr("area.copied")
      });
    } catch {
      emit?.("feedback:show", {
        message: tr("area.copyFailed")
      });
    }
  }


  function onContainerClick(event) {
    const button = event.target.closest("button");

    if (!button || destroyed) {
      return;
    }

    if (button.dataset.step) {
      stepLength(Number(button.dataset.step));
      return;
    }

    if (button.dataset.copy !== undefined) {
      copyPerimeter();
      return;
    }

    if (button.dataset.action === "add") {
      addWall();
      return;
    }

    if (button.dataset.action === "close") {
      closeShape();
      return;
    }

    if (button.dataset.action === "undo") {
      undoWall();
      return;
    }

    if (button.dataset.action === "reset") {
      reset();
      return;
    }

    if (button.dataset.rotate) {
      rotateSelectedWall(Number(button.dataset.rotate));
      return;
    }

    if (button.dataset.editorDelete !== undefined) {
      deleteSelectedWall();
    }
  }


  function onContainerInput(event) {
    const target = event.target;

    if (target === lengthInput) {
      draftLength = target.value;
      drawCanvas();
      return;
    }

    if (target === angleInput) {
      draftAngle = target.value;
      drawCanvas();
      return;
    }

    if (target.dataset.editor) {
      updateSelectedWall(target.dataset.editor, target.value);
    }
  }


  function onContainerKeydown(event) {
    if (event.target !== lengthInput) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      addWall();
    }
  }


  function receiveInput(event) {
    if (destroyed) {
      return { status: "rejected", reason: "destroyed" };
    }

    const key = event.key ?? event.value;

    if (!key) {
      return { status: "ignored", reason: "empty-input" };
    }

    if (event.source === "transfer") {
      return receiveTransferValue(key);
    }

    if (/^[0-9]$/.test(key) || key === "." || key === ",") {
      draftLength += key === "." ? "," : key;

      if (lengthInput) {
        lengthInput.value = draftLength;
      }

      drawCanvas();

      return { status: "accepted" };
    }

    if (key === "Enter") {
      addWall();
      return { status: "accepted" };
    }

    if (key === "Backspace") {
      return undoWall();
    }

    if (key === "Delete" || key === "Escape") {
      return reset();
    }

    return { status: "ignored", reason: "unsupported-input" };
  }


  function receiveTransferValue(value) {
    if (destroyed) {
      return { status: "rejected", reason: "destroyed" };
    }

    const normalized = normalizeNumber(value);

    if (!/^\d*\.?\d+$/.test(normalized) || normalized === "") {
      return { status: "ignored", reason: "invalid-number" };
    }

    draftLength = normalized.replace(".", ",");

    if (lengthInput) {
      lengthInput.value = draftLength;
    }

    drawCanvas();

    return { status: "accepted" };
  }


  function receiveAction(action) {
    if (destroyed) {
      return { status: "rejected", reason: "destroyed" };
    }

    if (action === "calculate") {
      addWall();
      return { status: "accepted" };
    }

    if (action === "backspace") {
      return undoWall();
    }

    if (action === "clear") {
      return reset();
    }

    return { status: "ignored", reason: "unknown-action" };
  }


  function getState() {
    return {
      walls: walls.map(wall => ({
        length: wall.length,
        angle: wall.angle
      })),
      draftLength,
      draftAngle,
      selectedIndex
    };
  }


  function setState(state) {
    if (!state) {
      return;
    }

    walls = Array.isArray(state.walls)
      ? state.walls.map(wall => ({
          length: Number(wall.length) || 0,
          angle: Number(wall.angle) || 0
        }))
      : [];

    draftLength = String(state.draftLength ?? "");
    draftAngle = String(state.draftAngle ?? "90");

    selectedIndex = Number.isInteger(state.selectedIndex)
      ? state.selectedIndex
      : null;

    if (selectedIndex !== null && selectedIndex >= walls.length) {
      selectedIndex = walls.length ? walls.length - 1 : null;
    }


    if (lengthInput) {
      lengthInput.value = draftLength;
    }

    if (angleInput) {
      angleInput.value = draftAngle;
    }

    renderEditor();
    updateAll();
  }


  function render() {
    container.innerHTML = `
      <div class="area-shape">
        <div class="area-shape__canvas-wrap">
          <canvas class="area-shape__canvas"></canvas>
        </div>

        <div class="area-shape__status" data-status></div>

        <div class="area-shape__top-row">
          <button class="area-shape__add" data-action="add" type="button">
            ${tr("area.add")}
          </button>

          <button class="area-shape__button" data-action="close" type="button">
            ${tr("area.close")}
          </button>
        </div>

        <div class="area-shape__length-row">
          <button class="area-shape__step" data-step="-1" type="button">−</button>

          <input
            class="area-shape__input"
            data-length
            type="text"
            inputmode="decimal"
            autocomplete="off"
            spellcheck="false"
            placeholder="0"
            aria-label="${tr("area.lengthLabel")}"
          >

          <button class="area-shape__step" data-step="1" type="button">+</button>
        </div>

        <input
          class="area-shape__input area-shape__input--angle"
          data-angle
          type="text"
          inputmode="numeric"
          autocomplete="off"
          spellcheck="false"
          placeholder="90"
          aria-label="${tr("area.angleLabel")}"
        >

        <div class="area-shape__hint">
          ${tr("area.hint")}
        </div>

        <div class="area-shape__editor" data-editor></div>

        <div class="area-shape__results">
          <span class="area-shape__result-item">
            ${tr("area.area")}: <strong data-area>—</strong>
          </span>

          <span class="area-shape__result-item">
            ${tr("area.perimeter")}: <strong data-perimeter>—</strong>
          </span>

          <button
            class="area-shape__copy"
            data-copy
            type="button"
            aria-label="${tr("area.copy")}"
          >⧉</button>
        </div>

        <div class="area-shape__buttons">
          <button class="area-shape__button" data-action="undo" type="button">
            ${tr("area.undo")}
          </button>

          <button class="area-shape__button" data-action="reset" type="button">
            ${tr("area.reset")}
          </button>
        </div>
      </div>
    `;

    canvas = container.querySelector(".area-shape__canvas");
    ctx = canvas.getContext("2d");

    statusElement = container.querySelector("[data-status]");
    areaElement = container.querySelector("[data-area]");
    perimeterElement = container.querySelector("[data-perimeter]");
    lengthInput = container.querySelector("[data-length]");
    angleInput = container.querySelector("[data-angle]");
    editorElement = container.querySelector("[data-editor]");

    lengthInput.value = draftLength;
    angleInput.value = draftAngle;
  }


  function destroy() {
    if (destroyed) {
      return;
    }

    destroyed = true;

    unsubscribeLanguage?.();
    resizeObserver?.disconnect();

    container.replaceChildren();
  }


  container.addEventListener("click", onContainerClick);
  container.addEventListener("input", onContainerInput);
  container.addEventListener("keydown", onContainerKeydown);

  container.addEventListener("pointerdown", event => {
    if (event.target === canvas) {
      onCanvasPointerDown(event);
    }
  });


  const unsubscribeLanguage = t.subscribe?.(() => {
    const state = getState();

    render();
    setState(state);
  });


  const resizeObserver = new ResizeObserver(() => {
    drawCanvas();
  });


  render();
  renderEditor();
  updateAll();

  resizeObserver.observe(canvas);


  return {
    type: "form",
    keyboardEnabled: true,

    receiveInput,
    receiveAction,
    receiveTransferValue,

    getState,
    setState,

    getResult: () => {
      const points = buildPoints(walls);

      return isClosed(points) ? polygonArea(points) : null;
    },

    getTransferValue: () => {
      const points = buildPoints(walls);

      return isClosed(points) ? polygonArea(points) : null;
    },

    destroy
  };
}