const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];


const CELL_FLASH_MS = 1100;
const BOARD_FLASH_MS = 1500;


function getWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return {
        symbol: board[a],
        line: [a, b, c]
      };
    }
  }

  if (board.every(cell => cell !== "")) {
    return {
      symbol: "draw",
      line: []
    };
  }

  return null;
}


function botMove(board, botSymbol, playerSymbol) {
  const emptyCells = board
    .map((value, index) => value === "" ? index : null)
    .filter(index => index !== null);

  if (emptyCells.length === 0) {
    return null;
  }

  for (const index of emptyCells) {
    const testBoard = [...board];
    testBoard[index] = botSymbol;

    const winner = getWinner(testBoard);

    if (winner && winner.symbol === botSymbol) {
      board[index] = botSymbol;
      return index;
    }
  }

  for (const index of emptyCells) {
    const testBoard = [...board];
    testBoard[index] = playerSymbol;

    const winner = getWinner(testBoard);

    if (winner && winner.symbol === playerSymbol) {
      board[index] = botSymbol;
      return index;
    }
  }

  if (board[4] === "") {
    board[4] = botSymbol;
    return 4;
  }

  const randomIndex = emptyCells[
    Math.floor(Math.random() * emptyCells.length)
  ];

  board[randomIndex] = botSymbol;

  return randomIndex;
}


export default function createTicTacToeCalculator(container, context) {
  const { t } = context;

  let board = Array(9).fill("");
  let gameOver = false;
  let botThinking = false;

  const playerSymbol = "X";
  const botSymbol = "O";

  let statusElement = null;
  let boardElement = null;

  let boardFlashTimer = null;
  const cellFlashTimers = new Map();


  function updateStatus(winner) {
    if (!statusElement) {
      return;
    }

    if (!winner) {
      statusElement.textContent = botThinking
        ? t("game.ttt.status.botThinking")
        : t("game.ttt.status.yourTurn");

      return;
    }

    if (winner.symbol === "draw") {
      statusElement.textContent = t("game.ttt.status.draw");
    } else if (winner.symbol === playerSymbol) {
      statusElement.textContent = t("game.ttt.status.playerWin");
    } else {
      statusElement.textContent = t("game.ttt.status.botWin");
    }
  }


  function clearBoardFlash() {
    if (!boardElement) {
      return;
    }

    boardElement.classList.remove(
      "flash-win",
      "flash-lose",
      "flash-draw"
    );

    if (boardFlashTimer) {
      clearTimeout(boardFlashTimer);
      boardFlashTimer = null;
    }
  }


  function flashBoard(result) {
    if (!boardElement) {
      return;
    }

    clearBoardFlash();

    const className = result === "win"
      ? "flash-win"
      : result === "lose"
        ? "flash-lose"
        : "flash-draw";

    boardElement.classList.add(className);

    boardFlashTimer = setTimeout(() => {
      boardElement.classList.remove(className);
      boardFlashTimer = null;
    }, BOARD_FLASH_MS);
  }


  function renderBoard() {
    const cells = container.querySelectorAll(".ttt-cell");

    cells.forEach((cell, index) => {
      cell.textContent = board[index];
      cell.disabled = board[index] !== "" || gameOver || botThinking;
      cell.classList.toggle("x", board[index] === playerSymbol);
      cell.classList.toggle("o", board[index] === botSymbol);
    });
  }


  function flashCell(index, symbol) {
    const cell = container.querySelector(
      `.ttt-cell[data-index="${index}"]`
    );

    if (!cell) {
      return;
    }

    if (cellFlashTimers.has(index)) {
      clearTimeout(cellFlashTimers.get(index));
    }

    cell.classList.remove("flash-x", "flash-o");
    void cell.offsetWidth;

    cell.classList.add(
      symbol === playerSymbol ? "flash-x" : "flash-o"
    );

    const timer = setTimeout(() => {
      cell.classList.remove("flash-x", "flash-o");
      cellFlashTimers.delete(index);
    }, CELL_FLASH_MS);

    cellFlashTimers.set(index, timer);
  }


  function endCheck() {
    const winner = getWinner(board);

    if (winner) {
      gameOver = true;

      if (winner.symbol !== "draw") {
        const cells = container.querySelectorAll(".ttt-cell");

        winner.line.forEach(index => {
          cells[index].classList.add("win");
        });

        flashBoard(
          winner.symbol === playerSymbol ? "win" : "lose"
        );
      } else {
        flashBoard("draw");
      }
    }

    renderBoard();
    updateStatus(winner);
  }


  function onCellClick(event) {
    const cell = event.target.closest(".ttt-cell");

    if (!cell || gameOver || botThinking) {
      return;
    }

    const index = Number(cell.dataset.index);

    if (board[index] !== "") {
      return;
    }

    board[index] = playerSymbol;

    renderBoard();
    flashCell(index, playerSymbol);

    const winner = getWinner(board);

    if (winner) {
      endCheck();
      return;
    }

    botThinking = true;
    renderBoard();
    updateStatus(null);

    const botDelay = 1400 + Math.floor(Math.random() * 500);

    setTimeout(() => {
      const botIndex = botMove(board, botSymbol, playerSymbol);

      botThinking = false;

      renderBoard();

      if (botIndex !== null) {
        flashCell(botIndex, botSymbol);
      }

      endCheck();
    }, botDelay);
  }


  function onRestartClick() {
    board = Array(9).fill("");
    gameOver = false;
    botThinking = false;

    clearBoardFlash();

    cellFlashTimers.forEach(timer => clearTimeout(timer));
    cellFlashTimers.clear();

    const cells = container.querySelectorAll(".ttt-cell");

    cells.forEach(cell => {
      cell.classList.remove(
        "win",
        "flash-x",
        "flash-o"
      );
    });

    if (boardElement) {
      boardElement.classList.remove("reset");
      void boardElement.offsetWidth;
      boardElement.classList.add("reset");
    }

    renderBoard();
    updateStatus(null);
  }


  container.innerHTML = `
    <div class="game ttt">
      <div class="ttt-status" data-status></div>

      <div class="ttt-board" data-board>
        ${board
          .map((_, index) => `
            <button
              class="ttt-cell"
              data-index="${index}"
              type="button"
              aria-label="${t("game.ttt.cell")} ${index + 1}"
            ></button>
          `)
          .join("")}
      </div>

      <button class="ttt-restart" data-restart type="button">
        ${t("game.ttt.restart")}
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

    onCellClick(event);
  });


  renderBoard();
  updateStatus(null);


  return {
    type: "game",
    getResult: () => "",
    getTransferValue: () => "",

    destroy() {
      if (boardFlashTimer) {
        clearTimeout(boardFlashTimer);
      }

      cellFlashTimers.forEach(timer => clearTimeout(timer));
      cellFlashTimers.clear();

      container.removeEventListener("click", onCellClick);
    }
  };
}