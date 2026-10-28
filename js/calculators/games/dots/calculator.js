const SIZE = 4;

const BOT_DELAY_MIN = 1200;
const BOT_DELAY_MAX = 1800;

const BOX_FLASH_MS = 1200;


export default function createDotsCalculator(container, context) {
  const { t } = context;


  let hLines = [];
  let vLines = [];
  let boxes = [];


  let turn = "player";
  let gameOver = false;
  let botThinking = false;

  let lastBotLine = null;


  let statusElement = null;
  let boardElement = null;


  const timeouts = [];
  const boxFlashTimers = new Map();



  function tr(key) {
    const text = t(key);

    return typeof text === "string" ? text : key;
  }


  function init() {
    hLines = Array.from(
      { length: SIZE + 1 },
      () => Array(SIZE).fill(0)
    );

    vLines = Array.from(
      { length: SIZE },
      () => Array(SIZE + 1).fill(0)
    );

    boxes = Array.from(
      { length: SIZE },
      () => Array(SIZE).fill(0)
    );

    turn = "player";
    gameOver = false;
    botThinking = false;
    lastBotLine = null;
  }


  function isBoxComplete(x, y) {
    return (
      hLines[y][x] &&
      hLines[y + 1][x] &&
      vLines[y][x] &&
      vLines[y][x + 1]
    );
  }


  function checkNewBoxes(who) {
    const whoNum = who === "player" ? 1 : 2;
    const captured = [];


    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        if (boxes[y][x] === 0 && isBoxComplete(x, y)) {
          boxes[y][x] = whoNum;
          captured.push([x, y]);
        }
      }
    }


    return captured;
  }


  function getScores() {
    const player = boxes.flat().filter(value => value === 1).length;
    const bot = boxes.flat().filter(value => value === 2).length;


    return { player, bot };
  }


  function setStatus(text) {
    if (statusElement) {
      statusElement.textContent = text;
    }
  }


  function updateStatus() {
    const { player, bot } = getScores();


    if (gameOver) {
      if (player > bot) {
        setStatus(`${tr("dots.status.playerWin")} · ${player}:${bot}`);
      } else if (bot > player) {
        setStatus(`${tr("dots.status.botWin")} · ${player}:${bot}`);
      } else {
        setStatus(`${tr("dots.status.draw")} · ${player}:${bot}`);
      }


      return;
    }


    const turnText = botThinking
      ? tr("dots.status.botThinking")
      : tr("dots.status.yourTurn");


    setStatus(`${player}:${bot} · ${turnText}`);
  }


  function isLastBotLine(type, x, y) {
    return (
      lastBotLine &&
      lastBotLine.type === type &&
      lastBotLine.x === x &&
      lastBotLine.y === y
    );
  }


  function renderBoard() {
    if (!boardElement) {
      return;
    }


    let html = `<div class="dots-grid">`;


    for (let y = 0; y <= SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        html += `<span class="dots-dot"></span>`;


        const owner = hLines[y][x];
        const lastBot = owner === 2 && isLastBotLine("h", x, y);


        html += `
          <button
            class="dots-line h ${
              owner
                ? `drawn ${owner === 1 ? "player" : "bot"} ${
                    lastBot ? "last-bot" : ""
                  }`
                : ""
            }"
            data-type="h"
            data-x="${x}"
            data-y="${y}"
            type="button"
            aria-label="line h ${x}-${y}"
          ></button>
        `;
      }


      html += `<span class="dots-dot"></span>`;


      if (y < SIZE) {
        for (let x = 0; x <= SIZE; x++) {
          const owner = vLines[y][x];
          const lastBot = owner === 2 && isLastBotLine("v", x, y);


          html += `
            <button
              class="dots-line v ${
                owner
                  ? `drawn ${owner === 1 ? "player" : "bot"} ${
                      lastBot ? "last-bot" : ""
                    }`
                  : ""
              }"
              data-type="v"
              data-x="${x}"
              data-y="${y}"
              type="button"
              aria-label="line v ${x}-${y}"
            ></button>
          `;


          if (x < SIZE) {
            const boxOwner = boxes[y][x];


            html += `
              <div
                class="dots-box ${
                  boxOwner === 1
                    ? "player"
                    : boxOwner === 2
                      ? "bot"
                      : ""
                }"
                data-box-x="${x}"
                data-box-y="${y}"
              ></div>
            `;
          }
        }
      }
    }


    html += `</div>`;


    boardElement.innerHTML = html;
  }


  function flashBox(x, y, owner) {
    const box = boardElement?.querySelector(
      `.dots-box[data-box-x="${x}"][data-box-y="${y}"]`
    );


    if (!box) {
      return;
    }


    const key = `${x}-${y}`;


    if (boxFlashTimers.has(key)) {
      clearTimeout(boxFlashTimers.get(key));
    }


    box.classList.remove("flash-player", "flash-bot");
    void box.offsetWidth;


    box.classList.add(
      owner === "player" ? "flash-player" : "flash-bot"
    );


    const timer = setTimeout(() => {
      box.classList.remove("flash-player", "flash-bot");
      boxFlashTimers.delete(key);
    }, BOX_FLASH_MS);


    boxFlashTimers.set(key, timer);
  }


  function simulateLine(line, who) {
    const { type, x, y } = line;
    const whoNum = who === "player" ? 1 : 2;


    if (type === "h") {
      hLines[y][x] = whoNum;
    } else {
      vLines[y][x] = whoNum;
    }


    let gained = 0;


    for (let by = 0; by < SIZE; by++) {
      for (let bx = 0; bx < SIZE; bx++) {
        if (boxes[by][bx] === 0 && isBoxComplete(bx, by)) {
          gained++;
        }
      }
    }


    if (type === "h") {
      hLines[y][x] = 0;
    } else {
      vLines[y][x] = 0;
    }


    return gained;
  }


  function getAvailableLines() {
    const available = [];


    for (let y = 0; y <= SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        if (!hLines[y][x]) {
          available.push({ type: "h", x, y });
        }
      }
    }


    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x <= SIZE; x++) {
        if (!vLines[y][x]) {
          available.push({ type: "v", x, y });
        }
      }
    }


    return available;
  }


  function botMove() {
    if (gameOver || turn !== "bot") {
      return;
    }


    const available = getAvailableLines();


    if (available.length === 0) {
      finishGame();
      return;
    }


    const winning = available.filter(line => (
      simulateLine(line, "bot") > 0
    ));


    let chosen;


    if (winning.length > 0) {
      chosen = winning[
        Math.floor(Math.random() * winning.length)
      ];
    } else {
      const safe = available.filter(line => (
        simulateLine(line, "player") === 0
      ));


      const pool = safe.length > 0 ? safe : available;


      chosen = pool[
        Math.floor(Math.random() * pool.length)
      ];
    }


    applyLine(chosen, "bot");
  }


  function applyLine(line, who) {
    const { type, x, y } = line;
    const whoNum = who === "player" ? 1 : 2;


    if (type === "h") {
      hLines[y][x] = whoNum;
    } else {
      vLines[y][x] = whoNum;
    }


    if (who === "bot") {
      lastBotLine = { type, x, y };
    }


    const captured = checkNewBoxes(who);


    renderBoard();


    captured.forEach(([boxX, boxY]) => {
      flashBox(boxX, boxY, who);
    });


    const filled = boxes.flat().filter(value => value !== 0).length;


    if (filled === SIZE * SIZE) {
      finishGame();
      return;
    }


    if (captured.length > 0) {
      if (who === "bot") {
        scheduleBotMove();
      }


      return;
    }


    turn = who === "player" ? "bot" : "player";


    if (turn === "bot") {
      scheduleBotMove();
    } else {
      botThinking = false;
      updateStatus();
      renderBoard();
    }
  }


  function scheduleBotMove() {
    botThinking = true;
    updateStatus();
    renderBoard();


    const delay = BOT_DELAY_MIN + Math.floor(
      Math.random() * (BOT_DELAY_MAX - BOT_DELAY_MIN)
    );


    const timeoutId = setTimeout(() => {
      botMove();
    }, delay);


    timeouts.push(timeoutId);
  }


  function finishGame() {
    gameOver = true;
    botThinking = false;


    clearTimeouts();
    renderBoard();
    updateStatus();
  }


  function clearTimeouts() {
    timeouts.forEach(id => clearTimeout(id));
    timeouts.length = 0;
  }


  function onBoardClick(event) {
    const lineElement = event.target.closest(".dots-line");


    if (!lineElement || gameOver || botThinking || turn !== "player") {
      return;
    }


    const type = lineElement.dataset.type;
    const x = Number(lineElement.dataset.x);
    const y = Number(lineElement.dataset.y);


    if (type === "h" && hLines[y][x]) {
      return;
    }


    if (type === "v" && vLines[y][x]) {
      return;
    }


    applyLine({ type, x, y }, "player");
  }


  function onRestartClick() {
    clearTimeouts();


    boxFlashTimers.forEach(timer => clearTimeout(timer));
    boxFlashTimers.clear();


    init();
    renderBoard();
    updateStatus();
  }


  init();


  container.innerHTML = `
    <div class="game dots">
      <div class="dots-status" data-status></div>

      <div class="dots-board" data-board></div>

      <button class="dots-restart" data-restart type="button">
        ${tr("dots.restart")}
      </button>
    </div>
  `;


  statusElement = container.querySelector("[data-status]");
  boardElement = container.querySelector("[data-board]");


  container.addEventListener("click", event => {
    if (event.target.closest("[data-restart]")) {
      onRestartClick();
      return;
    }

    onBoardClick(event);
  });


  const unsubscribeLanguage = t.subscribe?.(() => {
    renderBoard();
    updateStatus();
  });


  renderBoard();
  updateStatus();


  return {
    type: "game",
    getResult: () => "",
    getTransferValue: () => "",


    destroy() {
      clearTimeouts();


      boxFlashTimers.forEach(timer => clearTimeout(timer));
      boxFlashTimers.clear();


      unsubscribeLanguage?.();


      container.removeEventListener("click", onBoardClick);
    }
  };
}