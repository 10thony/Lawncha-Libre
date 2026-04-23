import { useEffect, useMemo, useRef, useState } from "react";

const ROWS = 8;
const COLS = 14;
const TARGET = "ATHECA";
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
const HIGHLIGHT_START_MS = 2500;
const WORD_REVEAL_START_MS = HIGHLIGHT_START_MS + TARGET.length * 400 + 300;
const WORD_REVEAL_STEP_MS = 120;
const TOTAL_DURATION_MS = HIGHLIGHT_START_MS + TARGET.length * 400 + 1800;

type Cell = {
  r: number;
  c: number;
  finalChar: string;
  revealTime: number;
  isTarget: boolean;
  highlightTime: number | null;
};

const randChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

function buildCells(): Cell[] {
  const grid = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => randChar()));
  const used = new Set<string>();
  const targetPositions: Array<{ r: number; c: number }> = [];

  for (const letter of TARGET) {
    let r = 0;
    let c = 0;
    let key = "";
    do {
      r = Math.floor(Math.random() * ROWS);
      c = Math.floor(Math.random() * COLS);
      key = `${r},${c}`;
    } while (used.has(key));
    used.add(key);
    grid[r][c] = letter;
    targetPositions.push({ r, c });
  }

  const cells: Cell[] = [];
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      cells.push({
        r,
        c,
        finalChar: grid[r][c],
        revealTime: Math.random() * 1500 + 200,
        isTarget: used.has(`${r},${c}`),
        highlightTime: null,
      });
    }
  }

  targetPositions.forEach((p, i) => {
    const cell = cells.find((c) => c.r === p.r && c.c === p.c);
    if (cell) cell.highlightTime = HIGHLIGHT_START_MS + i * 400;
  });

  return cells;
}

export function AthecaIntroAnimation({ onComplete }: { onComplete: () => void }) {
  const cells = useMemo(() => buildCells(), []);
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const cellSize = "clamp(1.25rem, min(4.2vw, 5.2vh), 3.2rem)";
  const cellFontSize = "clamp(0.62rem, min(1.25vw, 1.5vh), 1.1rem)";
  const cellGap = "clamp(1px, 0.22vmin, 3px)";

  useEffect(() => {
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const nextElapsed = ts - startRef.current;
      setElapsed(nextElapsed);
      if (nextElapsed >= TOTAL_DURATION_MS) {
        onComplete();
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete]);

  const revealedWordLength = Math.min(
    TARGET.length,
    Math.max(0, Math.floor((elapsed - WORD_REVEAL_START_MS) / WORD_REVEAL_STEP_MS) + 1)
  );
  const revealedWord = TARGET.slice(0, revealedWordLength);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070707] text-[#f5a623]">
      <div className="px-4 sm:px-6">
        <div className="mb-6 flex h-[clamp(3rem,8vh,5.5rem)] items-center justify-center">
          <p
            className="text-[clamp(1.6rem,4.2vw,3.2rem)] font-bold tracking-[0.45em]"
            style={{
              fontFamily: "inherit",
              color: "#ffb128",
              textShadow: "0 0 12px rgba(255,177,40,0.35)",
              opacity: revealedWordLength > 0 ? 1 : 0,
              transition: "opacity 160ms ease",
            }}
          >
            {revealedWord}
          </p>
        </div>
        <div
          className="inline-block border border-[#4f3a00] bg-[#0e0e0e] shadow-[0_0_80px_rgba(255,161,35,0.14)]"
          style={{ padding: "clamp(0.55rem, 1.5vmin, 1.1rem)" }}
        >
          {Array.from({ length: ROWS }).map((_, r) => (
            <div key={r} className="flex">
              {Array.from({ length: COLS }).map((__, c) => {
                const cell = cells[r * COLS + c];
                const revealed = elapsed >= cell.revealTime;
                const highlighted =
                  cell.isTarget && cell.highlightTime !== null && elapsed >= cell.highlightTime;
                const char = revealed ? cell.finalChar : elapsed > cell.revealTime * 0.3 ? randChar() : " ";
                const glow =
                  highlighted && cell.highlightTime !== null
                    ? Math.min(1, (elapsed - cell.highlightTime) / 300) *
                      (0.85 + 0.15 * Math.sin((elapsed / 200) * Math.PI))
                    : 0;

                return (
                  <div
                    key={`${r}-${c}`}
                    className="flex items-center justify-center border border-[#2a2205]"
                    style={{
                      fontFamily: "inherit",
                      width: cellSize,
                      height: cellSize,
                      fontSize: cellFontSize,
                      margin: cellGap,
                      color: highlighted
                        ? `rgb(${Math.round(255)}, ${Math.round(168 + 30 * glow)}, ${Math.round(
                            45 + 10 * glow
                          )})`
                        : revealed
                        ? "rgb(173, 129, 35)"
                        : "rgb(242, 153, 41)",
                      backgroundColor: highlighted
                        ? `rgba(${Math.round(68 * glow)}, ${Math.round(45 * glow)}, ${Math.round(
                            6 * glow
                          )}, 0.9)`
                        : "rgba(15, 15, 15, 0.92)",
                      fontWeight: highlighted ? 700 : 500,
                      opacity: revealed ? 1 : 0.9,
                    }}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
