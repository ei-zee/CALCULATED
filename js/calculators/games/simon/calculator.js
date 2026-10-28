const COLORS = [
  { id: 0, class: "simon-green" },
  { id: 1, class: "simon-red" },
  { id: 2, class: "simon-yellow" },
  { id: 3, class: "simon-blue" }
];

const SHOW_STEP_MS = 620;
const SHOW_FLASH_MS = 380;


function randomColor() {
  return Math.floor(Math.random() * COLORS.length);
}


export default function createSimonCalculator(container, context) {
  const { t } = context;


  let sequence = [];
  let playerIndex = 0;
  let state = "idle";
  let timeouts = [];


  let statusElement = null;
  let padElement = null;



  function tr(key, vars = {}) {
    const text = t(key, vars);

    return typeof text === "string" ? text : key;
  }


  function clearTimeouts() {
    timeouts.forEach(id => clearTimeout(id));
    timeouts = [];
  }


  function setStatus(text) {
    if (statusElement) {
      statusElement.textContent = text;
    }
  }


  function updateStatus() {
    if (state === "idle") {
      setStatus(tr("simon.status.pressStart"));
      return;
    }

    if (state === "over") {
      setStatus(
        tr("simon.status.over", { round: sequence.length })
      );
      return;
    }

    if (state === "showing") {
      setStatus(
        `${tr("simon.round", { round: sequence.length })} · ${tr("simon.status.watch")}`
      );
      return;
    }

    if (state === "input") {
      setStatus(
        `${tr("simon.round", { round: sequence.length })} · ${tr("simon.status.yourTurn")}`
      );
    }
  }


  function flash(colorId, duration = SHOW_FLASH_MS) {
    const button = padElement?.querySelector(
      `[data-color="${colorId}"]`
    );


    if (!button) {
      return;
    }


    button.classList.add("active");


    const timeoutId = setTimeout(() => {
      button.classList.remove("active");
    }, duration);


    timeouts.push(timeoutId);
  }


  function showSequence() {
    state = "showing";
    playerIndex = 0;


    updateStatus();


    sequence.forEach((colorId, index) => {
      const timeoutId = setTimeout(() => {
        flash(colorId);


        if (index === sequence.length - 1) {
          const endTimeoutId = setTimeout(() => {
            state = "input";
            updateStatus();
          }, 480);


          timeouts.push(endTimeoutId);
        }
      }, SHOW_STEP_MS * (index + 1));


      timeouts.push(timeoutId);
    });
  }


  function nextRound() {
    sequence.push(randomColor());
    showSequence();
  }


  function startGame() {
    clearTimeouts();


    sequence = [];
    playerIndex = 0;
    state = "idle";


    nextRound();
  }


  function gameOver() {
    state = "over";
    updateStatus();
  }


  function onPadClick(event) {
    const button = event.target.closest(".simon-pad");


    if (!button || state !== "input") {
      return;
    }


    const colorId = Number(button.dataset.color);


    flash(colorId, 240);


    if (colorId === sequence[playerIndex]) {
      playerIndex++;


      if (playerIndex === sequence.length) {
        state = "showing";


        setStatus(
          `${tr("simon.round", { round: sequence.length })} · ${tr("simon.status.correct")}`
        );


        const timeoutId = setTimeout(() => {
          nextRound();
        }, 850);


        timeouts.push(timeoutId);
      }
    } else {
      gameOver();
    }
  }


  function render() {
    container.innerHTML = `
      <div class="game simon">
        <div class="simon-status" data-status></div>

        <div class="simon-pad-grid" data-pad>
          ${COLORS
            .map(color => `
              <button
                class="simon-pad ${color.class}"
                data-color="${color.id}"
                type="button"
                aria-label="${color.class}"
              ></button>
            `)
            .join("")}
        </div>

        <button class="simon-start" data-start type="button">
          ${tr("simon.play")}
        </button>
      </div>
    `;


    statusElement = container.querySelector("[data-status]");
    padElement = container.querySelector("[data-pad]");


    updateStatus();
  }


  function destroy() {
    clearTimeouts();

    unsubscribeLanguage?.();

    container.removeEventListener("click", onPadClick);
  }


  container.addEventListener("click", event => {
    if (event.target.closest("[data-start]")) {
      startGame();
      return;
    }

    onPadClick(event);
  });


  const unsubscribeLanguage = t.subscribe?.(() => {
    render();
  });


  render();


  return {
    type: "game",
    getResult: () => "",
    getTransferValue: () => "",


    destroy
  };
}