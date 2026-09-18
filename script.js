"use strict";

/* ==========================================================
   Flex Galaxy — a Flexbox learning game
   Pure HTML / CSS / JavaScript, no external libraries.
   ========================================================== */

const ICONS = ["📦", "⛽", "🔧", "💎", "🌱", "📡", "🧪", "🛠️", "🔩", "⚙️"];

/* ---------- Stage definitions ---------- */
/* Each stage:
   - title / instruction shown to the player
   - items: list of {w, h} box sizes (colors/icons assigned automatically)
   - start: the (wrong) flex settings the board opens with
   - solution: the target flex settings
   - checkProps: which of the properties are actually verified */
const STAGES = [
  {
    title: "Line Up at the Start",
    instruction:
      "The crates are stacked as plain blocks. Turn the board into a Flex container, then arrange all the cargo crates in a single row, side by side, flush against the left edge of the board.",
    items: [
      { w: 70, h: 70 }, { w: 70, h: 70 }, { w: 70, h: 70 }, { w: 70, h: 70 },
    ],
    start:    { display: "block", direction: "column", wrap: "nowrap", justify: "center", align: "center" },
    solution: { display: "flex",  direction: "row",    wrap: "nowrap", justify: "flex-start", align: "center" },
    checkProps: ["display", "direction", "justify"],
  },
  {
    title: "Line Up at the End",
    instruction:
      "Arrange the crates in a single row, flush against the right edge of the board and centered vertically.",
    items: [
      { w: 70, h: 70 }, { w: 70, h: 70 }, { w: 70, h: 70 }, { w: 70, h: 70 },
    ],
    start:    { display: "flex", direction: "row", wrap: "nowrap", justify: "flex-start", align: "flex-start" },
    solution: { display: "flex", direction: "row", wrap: "nowrap", justify: "flex-end",   align: "center" },
    checkProps: ["display", "direction", "justify", "align"],
  },
  {
    title: "Perfect Center",
    instruction: "Center all the items on the board — both horizontally and vertically.",
    items: [
      { w: 70, h: 50 }, { w: 70, h: 90 }, { w: 70, h: 70 },
    ],
    start:    { display: "flex", direction: "column", wrap: "nowrap", justify: "flex-start", align: "flex-start" },
    solution: { display: "flex", direction: "row",    wrap: "nowrap", justify: "center",     align: "center" },
    checkProps: ["display", "direction", "justify", "align"],
  },
  {
    title: "Balanced Column",
    instruction:
      "Arrange the crates in a single column (top to bottom), with equal spacing between them along the board, and centered horizontally.",
    items: [
      { w: 60, h: 60 }, { w: 100, h: 60 }, { w: 80, h: 60 }, { w: 120, h: 60 },
    ],
    start:    { display: "flex", direction: "row",    wrap: "nowrap", justify: "flex-start",    align: "flex-start" },
    solution: { display: "flex", direction: "column", wrap: "nowrap", justify: "space-between", align: "center" },
    checkProps: ["display", "direction", "justify", "align"],
  },
  {
    title: "Spread Along the Bottom",
    instruction:
      "Arrange the crates in a single row with equal space between them, all flush against the bottom of the board.",
    items: [
      { w: 60, h: 40 }, { w: 60, h: 70 }, { w: 60, h: 50 }, { w: 60, h: 90 }, { w: 60, h: 60 },
    ],
    start:    { display: "flex", direction: "row", wrap: "nowrap", justify: "center",        align: "center" },
    solution: { display: "flex", direction: "row", wrap: "nowrap", justify: "space-between", align: "flex-end" },
    checkProps: ["display", "direction", "justify", "align"],
  },
  {
    title: "The Hold Got Too Small!",
    instruction:
      "There are too many crates for a single row. Make the overflow crates wrap onto a new row, center each row horizontally, and hang every crate from the top of its own row.",
    items: [
      { w: 80, h: 60 }, { w: 80, h: 85 }, { w: 80, h: 70 }, { w: 80, h: 95 }, { w: 80, h: 55 },
      { w: 80, h: 90 }, { w: 80, h: 65 }, { w: 80, h: 80 }, { w: 80, h: 75 }, { w: 80, h: 60 },
    ],
    start:    { display: "flex", direction: "row", wrap: "nowrap", justify: "flex-start", align: "center" },
    solution: { display: "flex", direction: "row", wrap: "wrap",   justify: "center",     align: "flex-start" },
    checkProps: ["display", "direction", "wrap", "justify", "align"],
  },
  {
    title: "Vertical Shelf",
    instruction:
      "Arrange the crates in a single column starting from the top, all flush against the right edge of the board.",
    items: [
      { w: 50, h: 55 }, { w: 100, h: 55 }, { w: 70, h: 55 }, { w: 130, h: 55 },
    ],
    start:    { display: "flex", direction: "row",    wrap: "nowrap", justify: "center",     align: "center" },
    solution: { display: "flex", direction: "column", wrap: "nowrap", justify: "flex-start", align: "flex-end" },
    checkProps: ["display", "direction", "justify", "align"],
  },
  {
    title: "Final Challenge: Full Warehouse",
    instruction:
      "Arrange all the crates across several rows (there's no room for one row), with equal space around each item in every row, and every item centered vertically within its row.",
    items: [
      { w: 90, h: 60 }, { w: 90, h: 80 }, { w: 90, h: 50 }, { w: 90, h: 90 },
      { w: 90, h: 70 }, { w: 90, h: 60 }, { w: 90, h: 85 }, { w: 90, h: 55 }, { w: 90, h: 75 },
    ],
    start:    { display: "flex", direction: "column", wrap: "nowrap", justify: "flex-start", align: "flex-start" },
    solution: { display: "flex", direction: "row",    wrap: "wrap",   justify: "space-around", align: "center" },
    checkProps: ["display", "direction", "wrap", "justify", "align"],
  },
];

/* ---------- Game state ---------- */
const STORAGE_KEY = "flexGalaxy_progress_v1";

let game = {
  index: 0,
  current: null,        // current flex settings on the board
  attempts: 0,
  score: 0,
  maxUnlocked: 0,
  completed: new Array(STAGES.length).fill(false),
};

/* ---------- DOM refs ---------- */
const el = {
  board: document.getElementById("board"),
  stageCount: document.getElementById("stageCount"),
  dots: document.getElementById("dots"),
  stageTitle: document.getElementById("stageTitle"),
  instructionText: document.getElementById("instructionText"),
  attemptsCounter: document.getElementById("attemptsCounter"),
  scoreCounter: document.getElementById("scoreCounter"),
  message: document.getElementById("message"),
  ctrlDisplay: document.getElementById("ctrl-display"),
  ctrlDirection: document.getElementById("ctrl-direction"),
  ctrlWrap: document.getElementById("ctrl-wrap"),
  ctrlJustify: document.getElementById("ctrl-justify"),
  ctrlAlign: document.getElementById("ctrl-align"),
  btnCheck: document.getElementById("btnCheck"),
  btnReset: document.getElementById("btnReset"),
  btnNext: document.getElementById("btnNext"),
};

/* ---------- Persistence ---------- */
function saveProgress() {
  const data = {
    maxUnlocked: game.maxUnlocked,
    completed: game.completed,
    score: game.score,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    /* localStorage unavailable — game still works, just without persistence */
  }
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (typeof data.maxUnlocked === "number") game.maxUnlocked = data.maxUnlocked;
    if (Array.isArray(data.completed) && data.completed.length === STAGES.length) {
      game.completed = data.completed;
    }
    if (typeof data.score === "number") game.score = data.score;
  } catch (e) {
    /* ignore corrupt data */
  }
}

/* ---------- Rendering ---------- */
function renderDots() {
  el.dots.innerHTML = "";
  STAGES.forEach((stage, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot";
    dot.textContent = game.completed[i] ? "✓" : String(i + 1);
    dot.title = stage.title;

    const unlocked = i <= game.maxUnlocked;
    if (unlocked) dot.classList.add("unlocked");
    if (i === game.index) dot.classList.add("current");
    if (game.completed[i]) dot.classList.add("completed");

    dot.disabled = !unlocked;
    dot.addEventListener("click", () => loadStage(i));
    el.dots.appendChild(dot);
  });
}

function renderBoardItems(stage) {
  el.board.innerHTML = "";
  stage.items.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "item c" + (i % 6);
    div.style.width = item.w + "px";
    div.style.height = item.h + "px";
    div.innerHTML =
      '<span class="item-icon">' + ICONS[i % ICONS.length] + "</span>" +
      '<span class="item-label">' + (i + 1) + "</span>";
    el.board.appendChild(div);
  });
}

function applyBoardStyle() {
  el.board.style.display = game.current.display;
  el.board.style.flexDirection = game.current.direction;
  el.board.style.flexWrap = game.current.wrap;
  el.board.style.justifyContent = game.current.justify;
  el.board.style.alignItems = game.current.align;
}

function syncControls() {
  el.ctrlDisplay.value = game.current.display;
  el.ctrlDirection.value = game.current.direction;
  el.ctrlWrap.value = game.current.wrap;
  el.ctrlJustify.value = game.current.justify;
  el.ctrlAlign.value = game.current.align;
  syncControlsEnabled();
}

function updateHeader() {
  el.stageCount.textContent = "Stage " + (game.index + 1) + " of " + STAGES.length;
  el.attemptsCounter.textContent = "Attempts this stage: " + game.attempts;
  el.scoreCounter.textContent = "Score: " + game.score;
}

function clearMessage() {
  el.message.textContent = "";
  el.message.className = "message";
}

function showMessage(text, type) {
  el.message.textContent = text;
  el.message.className = "message " + type;
}

/* ---------- Stage lifecycle ---------- */
function loadStage(i) {
  if (i > game.maxUnlocked) return; // locked
  game.index = i;
  game.attempts = 0;

  const stage = STAGES[i];
  game.current = { ...stage.start };

  el.stageTitle.textContent = stage.title;
  el.instructionText.textContent = stage.instruction;

  renderBoardItems(stage);
  applyBoardStyle();
  syncControls();
  updateHeader();
  renderDots();
  clearMessage();

  el.btnNext.disabled = !game.completed[i] || i === STAGES.length - 1;
  if (i === STAGES.length - 1 && game.completed[i]) {
    el.btnNext.disabled = true; // no stage after the last one
  }
}

function resetStage() {
  const stage = STAGES[game.index];
  game.current = { ...stage.start };
  applyBoardStyle();
  syncControls();
  clearMessage();
}

function checkSolution() {
  const stage = STAGES[game.index];
  const solved = stage.checkProps.every(
    (prop) => game.current[prop] === stage.solution[prop]
  );

  if (solved) {
    game.attempts += 1;
    const penalty = Math.min(80, (game.attempts - 1) * 10);
    const gained = Math.max(20, 100 - penalty);

    if (!game.completed[game.index]) {
      game.score += gained;
      game.completed[game.index] = true;
    }
    if (game.index + 1 > game.maxUnlocked && game.index + 1 < STAGES.length) {
      game.maxUnlocked = game.index + 1;
    }

    saveProgress();
    updateHeader();
    renderDots();

    showMessage("Well done! The solution is correct 🎉 (+" + gained + " pts)", "success");
    Array.from(el.board.children).forEach((c) => {
      c.classList.remove("pop");
      void c.offsetWidth;
      c.classList.add("pop");
    });

    const isLast = game.index === STAGES.length - 1;
    el.btnNext.disabled = isLast;
  } else {
    game.attempts += 1;
    updateHeader();
    showMessage("Not quite right — try a different combination of Flexbox properties 🤔", "error");
  }
}

function goNext() {
  if (game.index < STAGES.length - 1) {
    loadStage(game.index + 1);
  }
}

/* ---------- Board scaling (keeps board's real px size fixed) ---------- */
const BOARD_W = 640;
const BOARD_H = 420;

function fitBoardToViewport() {
  const wrapper = el.board.parentElement;
  const style = getComputedStyle(wrapper);
  const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const available = wrapper.clientWidth - padding;

  const scale = Math.min(1, available / BOARD_W);
  el.board.style.transform = scale < 1 ? "scale(" + scale + ")" : "none";
  wrapper.style.height = BOARD_H * scale + padding + "px";
}

/* ---------- Event wiring ---------- */
function syncControlsEnabled() {
  const isFlex = game.current.display === "flex";
  [el.ctrlDirection, el.ctrlWrap, el.ctrlJustify, el.ctrlAlign].forEach((ctrl) => {
    ctrl.disabled = !isFlex;
  });
}

function onControlChange() {
  game.current.display = el.ctrlDisplay.value;
  game.current.direction = el.ctrlDirection.value;
  game.current.wrap = el.ctrlWrap.value;
  game.current.justify = el.ctrlJustify.value;
  game.current.align = el.ctrlAlign.value;
  applyBoardStyle();
  syncControlsEnabled();
}

el.ctrlDisplay.addEventListener("change", onControlChange);
el.ctrlDirection.addEventListener("change", onControlChange);
el.ctrlWrap.addEventListener("change", onControlChange);
el.ctrlJustify.addEventListener("change", onControlChange);
el.ctrlAlign.addEventListener("change", onControlChange);

el.btnCheck.addEventListener("click", checkSolution);
el.btnReset.addEventListener("click", resetStage);
el.btnNext.addEventListener("click", goNext);

window.addEventListener("resize", fitBoardToViewport);

/* ---------- Init ---------- */
loadProgress();
loadStage(Math.min(game.index, game.maxUnlocked));
window.addEventListener("load", fitBoardToViewport);
fitBoardToViewport();
