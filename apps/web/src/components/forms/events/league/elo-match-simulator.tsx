"use client";

import { useState, useEffect } from "react";
import { Gamepad2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

// ─── math ────────────────────────────────────────────────────────────────────

/**
 * S = 1 - scoreRelevance x (loserScore / winnerScore) x 0.5
 *
 * scoreRelevance = 0  → S = 1.0 always (margin ignored)
 * loserScore = 0      → S = 1.0 (total shutout)
 * close win + r = 1   → S approaches 0.5
 */
function computeS(
  winnerScore: number,
  loserScore: number,
  scoreRelevance: number,
): number {
  if (winnerScore <= 0) return NaN;
  if (scoreRelevance === 0) return 1.0;
  return 1 - scoreRelevance * (loserScore / winnerScore) * 0.5;
}

function computeExpected(eloA: number, eloB: number): number {
  return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
}

type MatchLabelKey =
  | "match_draw"
  | "match_shutout"
  | "match_dominant"
  | "match_moderate"
  | "match_close"
  | "match_near_draw";

const MATCH_LABEL_COLOR: Record<MatchLabelKey, string> = {
  match_draw: "text-match-draw",
  match_near_draw: "text-match-near-draw",
  match_close: "text-match-close",
  match_moderate: "text-match-moderate",
  match_dominant: "text-match-dominant",
  match_shutout: "text-match-shutout",
};

function getMatchLabel(scoreA: number, scoreB: number): MatchLabelKey {
  if (scoreA === scoreB) return "match_draw";
  const winner = Math.max(scoreA, scoreB);
  const loser = Math.min(scoreA, scoreB);
  if (loser === 0) return "match_shutout";
  const ratio = loser / winner;
  if (ratio >= 0.85) return "match_near_draw";
  if (ratio >= 0.6) return "match_close";
  if (ratio >= 0.3) return "match_moderate";
  return "match_dominant";
}

// ─── types ────────────────────────────────────────────────────────────────────

interface EloMatchSimulatorProps {
  scoreRelevance: number;
  kFactor: number;
  initialElo: number;
}

// ─── component ────────────────────────────────────────────────────────────────

export function EloMatchSimulator({
  scoreRelevance,
  kFactor,
  initialElo,
}: EloMatchSimulatorProps) {
  const t = useTranslations("Modals.AddEvent.explanation.elo.simulate");

  const defaultElo = initialElo > 0 ? initialElo : 1000;
  const k = kFactor > 0 ? kFactor : 20;

  const [scoreA, setScoreA] = useState(10);
  const [scoreB, setScoreB] = useState(9);
  const [eloA, setEloA] = useState(defaultElo);
  const [eloB, setEloB] = useState(defaultElo);

  // Compute S from Player A's perspective
  const aWins = scoreA > scoreB;
  const draw = scoreA === scoreB;

  let sA: number;
  if (draw) {
    sA = 0.5;
  } else if (aWins) {
    sA = computeS(scoreA, scoreB, scoreRelevance);
  } else {
    // B wins — A is the loser, S_A = 1 - S_B
    const sB = computeS(scoreB, scoreA, scoreRelevance);
    sA = isNaN(sB) ? NaN : 1 - sB;
  }

  const expected = computeExpected(eloA, eloB);
  const delta = !isNaN(sA) ? Math.round(k * (sA - expected)) : null;
  const matchLabelKey = getMatchLabel(scoreA, scoreB);

  const sColor = isNaN(sA)
    ? "text-secondary/30"
    : sA >= 0.9
      ? "text-success"
      : sA >= 0.7
        ? "text-warning"
        : sA >= 0.5
          ? "text-primary"
          : "text-danger";

  const deltaColor =
    delta === null
      ? "text-secondary/30"
      : delta > 0
        ? "text-success"
        : delta < 0
          ? "text-danger"
          : "text-secondary/45";

  return (
    <div className="bg-card-strong/25 mt-1 rounded-2xl p-4">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <Gamepad2 className="text-secondary/30 size-3" />
        <span className="text-secondary/30 text-[10px] font-bold tracking-wider uppercase">
          {t("title")}
        </span>
      </div>

      {/* Two-column body */}
      <div className="flex gap-4">
        {/* Left: inputs */}
        <div className="flex flex-col gap-3">
          {/* Rating */}
          <div className="space-y-1.5">
            <span className="text-secondary/30 text-[9px] font-medium tracking-wider uppercase">
              {t("rating")}
            </span>
            <div className="flex items-end gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-secondary/35 text-[9px]">
                  {t("player_a")}
                </span>
                <SimInput
                  value={eloA}
                  onChange={setEloA}
                  accent="success"
                  wide
                />
              </div>
              <span className="text-secondary/25 mb-1.5 text-[9px] font-medium">
                vs
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-secondary/35 text-[9px]">
                  {t("player_b")}
                </span>
                <SimInput
                  value={eloB}
                  onChange={setEloB}
                  accent="danger"
                  wide
                />
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="space-y-1.5">
            <span className="text-secondary/30 text-[9px] font-medium tracking-wider uppercase">
              {t("score")}
            </span>
            <div className="flex items-center gap-1.5">
              <SimInput value={scoreA} onChange={setScoreA} accent="success" />
              <span className="text-secondary/25 text-[10px] font-bold">
                {"\u00d7"}
              </span>
              <SimInput value={scoreB} onChange={setScoreB} accent="danger" />{" "}
              <span
                className={cn(
                  "ml-1 text-[9px] font-medium",
                  MATCH_LABEL_COLOR[matchLabelKey],
                )}
              >
                {t(matchLabelKey)}
              </span>{" "}
            </div>
          </div>
        </div>

        {/* Right: results (border-l serves as divider) */}
        <div className="ml-auto flex flex-col items-end justify-center gap-3 border-l border-white/6 pr-6 pl-6">
          <div className="space-y-0.5">
            <span className="text-secondary/30 text-[9px] font-medium tracking-wider uppercase">
              {t("score_value")}
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-[22px] leading-none font-bold tabular-nums",
                  sColor,
                )}
              >
                {isNaN(sA) ? "—" : sA.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-secondary/30 text-[9px] font-medium tracking-wider uppercase">
              {t("estimated_elo")}
            </span>
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-[22px] leading-none font-bold tabular-nums",
                  deltaColor,
                )}
              >
                {delta === null ? "—" : delta >= 0 ? `+${delta}` : `${delta}`}
              </span>
              <span className="text-secondary/35 text-[9px]">{t("pts")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-secondary/25 mt-3 text-[9px] leading-relaxed">
        {t("footer")}
      </p>
    </div>
  );
}

// ─── SimInput ─────────────────────────────────────────────────────────────────

interface SimInputProps {
  value: number;
  onChange: (v: number) => void;
  accent?: "success" | "danger";
  wide?: boolean;
}

function SimInput({ value, onChange, accent, wide }: SimInputProps) {
  const [display, setDisplay] = useState(String(value));

  useEffect(() => {
    setDisplay(String(value));
  }, [value]);

  return (
    <input
      type="number"
      value={display}
      min={0}
      onChange={(e) => {
        const raw = e.target.value;
        setDisplay(raw);
        const v = parseFloat(raw);
        if (!isNaN(v) && v >= 0) onChange(Math.floor(v));
      }}
      className={cn(
        "border-gold-dim/35 rounded-lg border bg-white/6 py-1 text-center",
        "text-[11px] font-bold tabular-nums",
        "focus:bg-card-strong/70 transition-colors focus:border-white/25 focus:outline-none",
        "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        wide ? "w-13 px-1" : "w-8 px-0.5",
        accent === "success" ? "text-success/70" : "text-danger/70",
      )}
    />
  );
}
