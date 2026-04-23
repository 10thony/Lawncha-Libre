// Run in a terminal: node atheca.js

const ROWS = 8;
const COLS = 14;
const TARGET = "ATHECA";
const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
const FPS = 60;
const FRAME_MS = 1000 / FPS;

// ANSI helpers
const ESC = "\x1b";
const RESET = `${ESC}[0m`;
const DIM = `${ESC}[2m`;
const BOLD = `${ESC}[1m`;
const RED = `${ESC}[38;2;255;80;80m`;
const BRIGHT_RED = `${ESC}[38;2;255;50;80m`;
const BG_RED = `${ESC}[48;2;60;10;15m`;
const DARK = `${ESC}[38;2;80;30;35m`;
const HIDE_CURSOR = `${ESC}[?25l`;
const SHOW_CURSOR = `${ESC}[?25h`;
const CLEAR = `${ESC}[2J${ESC}[H`;

const randChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

// Build the grid with random chars
const grid = Array.from({ length: ROWS }, () =>
  Array.from({ length: COLS }, () => randChar())
);

// Pick random positions for ATHECA letters (no duplicates)
const targetPositions = [];
const usedKeys = new Set();

for (const letter of TARGET) {
  let r, c, key;
  do {
    r = Math.floor(Math.random() * ROWS);
    c = Math.floor(Math.random() * COLS);
    key = `${r},${c}`;
  } while (usedKeys.has(key));
  usedKeys.add(key);
  grid[r][c] = letter;
  targetPositions.push({ r, c, letter });
}

// Animation state for each cell
const cells = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    cells.push({
      r,
      c,
      finalChar: grid[r][c],
      currentChar: " ",
      revealed: false,
      revealTime: Math.random() * 1500 + 200, // stagger reveal 0.2-1.7s
      isTarget: usedKeys.has(`${r},${c}`),
      highlightTime: null,
      glowIntensity: 0,
    });
  }
}

// Target cells get highlighted later
const highlightStart = 2500;
targetPositions.forEach((tp, i) => {
  const cell = cells.find((c) => c.r === tp.r && c.c === tp.c);
  cell.highlightTime = highlightStart + i * 400;
});

// Box drawing
const drawBox = (char, highlighted, glowIntensity, scrambling) => {
  if (highlighted) {
    const g = Math.min(glowIntensity, 1);
    const rVal = Math.round(255 * g);
    const gVal = Math.round(50 + 30 * g);
    const bVal = Math.round(60 + 20 * g);
    const fg = `${ESC}[38;2;${rVal};${gVal};${bVal}m`;
    const bg = `${ESC}[48;2;${Math.round(80 * g)};${Math.round(10 * g)};${Math.round(20 * g)}m`;
    return `${bg}${fg}${BOLD} ${char} ${RESET}`;
  }
  if (!scrambling) {
    return `${DARK} ${char} ${RESET}`;
  }
  return `${DIM}${RED} ${char} ${RESET}`;
};

const renderFrame = (elapsed) => {
  let output = CLEAR;
  output += "\n";

  // Top border
  output += `  ${DARK}╔${"═══╤".repeat(COLS - 1)}═══╗${RESET}\n`;

  for (let r = 0; r < ROWS; r++) {
    output += `  ${DARK}║${RESET}`;
    for (let c = 0; c < COLS; c++) {
      const cell = cells.find((ce) => ce.r === r && ce.c === c);

      let char = " ";
      let highlighted = false;
      let scrambling = false;

      if (elapsed < cell.revealTime) {
        // Not yet revealed — scramble
        char = elapsed > cell.revealTime * 0.3 ? randChar() : " ";
        scrambling = true;
      } else {
        char = cell.finalChar;
        scrambling = false;
      }

      // Handle highlight glow
      if (
        cell.isTarget &&
        cell.highlightTime !== null &&
        elapsed > cell.highlightTime
      ) {
        const hlElapsed = elapsed - cell.highlightTime;
        // Pulse in, then sustain
        cell.glowIntensity = Math.min(1, hlElapsed / 300);
        // Add a gentle pulse
        cell.glowIntensity *=
          0.85 + 0.15 * Math.sin((elapsed / 200) * Math.PI);
        highlighted = true;
      }

      output += drawBox(char, highlighted, cell.glowIntensity, scrambling);
      if (c < COLS - 1) output += `${DARK}│${RESET}`;
    }
    output += `${DARK}║${RESET}\n`;

    if (r < ROWS - 1) {
      output += `  ${DARK}╟${"───┼".repeat(COLS - 1)}───╢${RESET}\n`;
    }
  }

  // Bottom border
  output += `  ${DARK}╚${"═══╧".repeat(COLS - 1)}═══╝${RESET}\n`;

  // Show the resolved word below
  if (elapsed > highlightStart) {
    const revealedCount = targetPositions.filter(
      (_, i) => elapsed > highlightStart + i * 400 + 300
    ).length;

    const word = TARGET.slice(0, revealedCount);
    const arrow = elapsed > highlightStart + 200 ? " ──▶  " : "      ";

    output += `\n  ${DARK}${arrow}${RESET}${BRIGHT_RED}${BOLD} ${word}${RESET}`;

    // Show position markers
    if (revealedCount > 0) {
      output += `\n\n  ${DIM}${RED}  Positions: `;
      for (let i = 0; i < revealedCount; i++) {
        const p = targetPositions[i];
        output += `[${p.r},${p.c}] `;
      }
      output += RESET;
    }
  }

  output += "\n";
  process.stdout.write(output);
};

// Run animation
process.stdout.write(HIDE_CURSOR);
const start = Date.now();
const totalDuration = highlightStart + TARGET.length * 400 + 2000;

const loop = setInterval(() => {
  const elapsed = Date.now() - start;
  renderFrame(elapsed);

  if (elapsed > totalDuration) {
    clearInterval(loop);
    process.stdout.write(SHOW_CURSOR);
    process.stdout.write(`\n  ${DIM}Animation complete.${RESET}\n\n`);
  }
}, FRAME_MS);

// Clean exit on Ctrl+C
process.on("SIGINT", () => {
  clearInterval(loop);
  process.stdout.write(SHOW_CURSOR + RESET + "\n");
  process.exit();
});