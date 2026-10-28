const ALL_EMOJI = [
  "🍎", "🚀", "🐱", "🌟", "🎧", "🍕",
  "🌈", "⚽", "🍀", "🎲", "🌙", "🔥",
  "🦊", "🐳", "🎈"
];

const PAIRS_COUNT = 12;

const MISMATCH_DELAY_MS = 750;
const FINAL_REVEAL_DELAY_MS = 700;


function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}


export default function createMemoryCalculator(container, context) {
  const { t } = context;

  let cards = [];
  let flipped = [];
  let matched = 0;
  let lock = false;
  let finalRevealed = false;
  let gameStarted = false;

  let statusElement = null;
  let boardElement = null;
  let actionButton = null;

  let mismatchTimer = null;
  let revealTimer = null;


  function tr(key, vars = {}) {
    const text = t(key, vars);

    return typeof text === "string" ? text : key;
  }


  function buildCards() {
    const shuffledSymbols = shuffle(ALL_EMOJI);

    const pairSymbols = shuffledSymbols.slice(0, PAIRS_COUNT);
    const oddSymbol = shuffledSymbols[PAIRS_COUNT];

    const deck = [];

    pairSymbols.forEach(emoji => {
      deck.push({ emoji, odd: false });
      deck.push({ emoji, odd: false });
    });

    deck.push({ emoji: oddSymbol, odd: true });

    cards = shuffle(deck).map((card, index) => ({
      id: index,
      emoji: card.emoji,
      odd: card.odd,
      flipped: false,
      matched: false
    }));
  }


  function updateStatus() {
    if (!statusElement) {
      return;
    }

    if (matched === PAIRS_COUNT && finalRevealed) {
      statusElement.textContent = tr("memory.status.win");
      return;
    }

    statusElement.textContent = tr("memory.status.found", {
      found: matched,
      total: PAIRS_COUNT
    });
  }


  function updateActionButton() {
    if (!actionButton) {
      return;
    }

    actionButton.textContent = gameStarted
      ? tr("memory.restart")
      : tr("memory.play");
  }


  function renderBoard() {
    if (!boardElement) {
      return;
    }

    boardElement.innerHTML = cards
      .map(card => `
        <button
          class="memory-card
            ${card.odd && finalRevealed ? "revealed" : ""}
            ${card.flipped ? "flipped" : ""}
            ${card.matched ? "matched" : ""}"
          data-id="${card.id}"
          type="button"
          aria-label="${tr("memory.card")} ${card.id + 1}"
          ${card.matched ? "disabled" : ""}
        >
          <span class="memory-card-inner">
            <span class="memory-card-back"></span>
            <span class="memory-card-face">${card.emoji}</span>
          </span>
        </button>
      `)
      .join("");
  }


  function updateCard(card) {
    const cardElement = boardElement?.querySelector(
      `.memory-card[data-id="${card.id}"]`
    );

    if (!cardElement) {
      return;
    }

    cardElement.classList.toggle(
      "revealed",
      card.odd && finalRevealed
    );

    cardElement.classList.toggle("flipped", card.flipped);
    cardElement.classList.toggle("matched", card.matched);
    cardElement.disabled = card.matched;
  }


  function revealOddCard() {
    const oddCard = cards.find(card => card.odd);

    if (!oddCard || finalRevealed) {
      return;
    }

    finalRevealed = true;

    revealTimer = setTimeout(() => {
      oddCard.flipped = true;
      oddCard.matched = true;

      updateCard(oddCard);

      setTimeout(() => {
        updateStatus();
      }, 1100);
    }, FINAL_REVEAL_DELAY_MS);
  }


  function onCardClick(event) {
    const cardElement = event.target.closest(".memory-card");

    if (!cardElement || lock) {
      return;
    }

    gameStarted = true;
    updateActionButton();

    const id = Number(cardElement.dataset.id);
    const card = cards[id];

    if (card.flipped || card.matched) {
      return;
    }

    card.flipped = true;
    flipped.push(card);

    updateCard(card);

    if (flipped.length < 2) {
      return;
    }

    lock = true;

    const [first, second] = flipped;

    const isMatch =
      first.emoji === second.emoji &&
      !first.odd &&
      !second.odd;

    if (isMatch) {
      first.matched = true;
      second.matched = true;
      matched++;

      flipped = [];
      lock = false;

      setTimeout(() => {
        updateCard(first);
        updateCard(second);
        updateStatus();

        if (matched === PAIRS_COUNT) {
          revealOddCard();
        }
      }, 260);

      return;
    }

    mismatchTimer = setTimeout(() => {
      first.flipped = false;
      second.flipped = false;

      flipped = [];
      lock = false;

      updateCard(first);
      updateCard(second);
    }, MISMATCH_DELAY_MS);
  }


  function onActionButtonClick() {
    if (mismatchTimer) {
      clearTimeout(mismatchTimer);
      mismatchTimer = null;
    }

    if (revealTimer) {
      clearTimeout(revealTimer);
      revealTimer = null;
    }

    buildCards();

    matched = 0;
    flipped = [];
    lock = false;
    finalRevealed = false;
    gameStarted = false;

    if (boardElement) {
      boardElement.classList.remove("reset");
      void boardElement.offsetWidth;
      boardElement.classList.add("reset");
    }

    renderBoard();
    updateStatus();
    updateActionButton();
  }


  buildCards();


  container.innerHTML = `
    <div class="game memory">
      <div class="memory-status" data-status></div>

      <div class="memory-board" data-board></div>

      <button class="memory-action" data-action type="button">
        ${tr("memory.play")}
      </button>
    </div>
  `;


  statusElement = container.querySelector("[data-status]");
  boardElement = container.querySelector("[data-board]");
  actionButton = container.querySelector("[data-action]");


  container.addEventListener("click", event => {
    if (event.target.closest("[data-action]")) {
      onActionButtonClick();
      return;
    }

    onCardClick(event);
  });


  const unsubscribeLanguage = t.subscribe?.(() => {
    renderBoard();
    updateStatus();
    updateActionButton();
  });


  renderBoard();
  updateStatus();
  updateActionButton();


  return {
    type: "game",
    getResult: () => "",
    getTransferValue: () => "",

    destroy() {
      if (mismatchTimer) {
        clearTimeout(mismatchTimer);
      }

      if (revealTimer) {
        clearTimeout(revealTimer);
      }

      unsubscribeLanguage?.();

      container.removeEventListener("click", onCardClick);
    }
  };
}