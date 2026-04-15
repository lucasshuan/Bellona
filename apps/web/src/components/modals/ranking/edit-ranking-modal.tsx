"use client";

import { useTransition, useState } from "react";
import {
  Trophy,
  FileText,
  Settings2,
  Swords,
  Zap,
  Clock,
  Hash,
  ArrowUpRight,
  ArrowDownRight,
  Equal,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { updateRanking } from "@/actions/game";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { LabelTooltip } from "@/components/ui/label-tooltip";
import { NumberInput } from "@/components/ui/number-input";
import { type Ranking } from "@/lib/apollo/types";
import { cn } from "@/lib/utils";

interface EditRankingModalProps {
  ranking: Ranking;
  isOpen: boolean;
  onClose: () => void;
}

export function EditRankingModal({
  ranking,
  isOpen,
  onClose,
}: EditRankingModalProps) {
  const t = useTranslations("Modals");
  const [isPending, startTransition] = useTransition();

  // States initialized from ranking prop
  const [name, setName] = useState(ranking.name);
  const [slug, setSlug] = useState(ranking.slug);
  const [isSlugModified, setIsSlugModified] = useState(false);
  const [description, setDescription] = useState(ranking.description || "");

  const [ratingSystem, setRatingSystem] = useState(
    ranking.ratingSystem || "elo",
  );
  const [initialElo, setInitialElo] = useState(ranking.initialElo);
  const [allowDraw, setAllowDraw] = useState(ranking.allowDraw);

  const [kFactor, setKFactor] = useState(ranking.kFactor);
  const [scoreRelevance, setScoreRelevance] = useState(ranking.scoreRelevance);
  const [inactivityDecay, setInactivityDecay] = useState(
    ranking.inactivityDecay,
  );
  const [inactivityThresholdHours, setInactivityThresholdHours] = useState(
    ranking.inactivityThresholdHours,
  );
  const [inactivityDecayFloor, setInactivityDecayFloor] = useState(
    ranking.inactivityDecayFloor,
  );

  const [pointsPerWin, setPointsPerWin] = useState(ranking.pointsPerWin);
  const [pointsPerDraw, setPointsPerDraw] = useState(ranking.pointsPerDraw);
  const [pointsPerLoss, setPointsPerLoss] = useState(ranking.pointsPerLoss);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    startTransition(async () => {
      try {
        await updateRanking(ranking.id, {
          name,
          slug,
          description,
          initialElo,
          ratingSystem,
          allowDraw,
          kFactor,
          scoreRelevance,
          inactivityDecay,
          inactivityThresholdHours,
          inactivityDecayFloor,
          pointsPerWin,
          pointsPerDraw,
          pointsPerLoss,
        });
        toast.success(t("EditRanking.success"));
        onClose();
      } catch {
        toast.error(t("EditRanking.error"));
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("EditRanking.title")}
      description={t("EditRanking.description")}
      confirmText={
        isPending ? t("EditRanking.submitting") : t("EditRanking.submit")
      }
      cancelText={t("EditRanking.cancel") || "Cancelar"}
      formId="edit-ranking-form"
      isPending={isPending}
      disabled={!name || !slug}
      className="max-w-3xl"
    >
      <form
        id="edit-ranking-form"
        onSubmit={handleSubmit}
        className="space-y-10"
      >
        {/* Section 1: General Data */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-white/40">
            <FileText className="size-4" />
            <h3 className="text-xs font-bold tracking-widest uppercase">
              {t("AddRanking.sections.general")}
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <LabelTooltip label={t("AddRanking.name.label")} required />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setName(newName);
                  if (!isSlugModified) {
                    setSlug(newName.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                  }
                }}
                placeholder={t("AddRanking.name.placeholder")}
                className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
              />
            </div>

            <div className="flex flex-col gap-2">
              <LabelTooltip
                label={t("AddRanking.slug.label")}
                tooltip={t("AddRanking.slug.tooltip")}
                required
              />
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  );
                  setIsSlugModified(true);
                }}
                placeholder={t("AddRanking.slug.placeholder")}
                className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
              />
            </div>

            <div className="col-span-full flex flex-col gap-2">
              <LabelTooltip label={t("AddRanking.descriptionField.label")} />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("AddRanking.descriptionField.placeholder")}
                className="focus:border-primary/50 focus:ring-primary/10 min-h-[80px] w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Format Logic */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-white/40">
            <Settings2 className="size-4" />
            <h3 className="text-xs font-bold tracking-widest uppercase">
              {t("AddRanking.sections.format")}
            </h3>
          </div>

          <div className="flex flex-col gap-10">
            {/* System Selector - Full Width Row */}
            <div className="flex flex-col gap-4">
              <LabelTooltip label={t("AddRanking.ratingSystem.label")} />
              <div className="grid grid-cols-2 gap-3 sm:w-1/2">
                <button
                  type="button"
                  onClick={() => setRatingSystem("elo")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-bold transition-all",
                    ratingSystem === "elo"
                      ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                      : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10",
                  )}
                >
                  <Trophy className="size-4" />
                  {t("AddRanking.ratingSystem.elo")}
                </button>
                <button
                  type="button"
                  onClick={() => setRatingSystem("points")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl border p-4 text-sm font-bold transition-all",
                    ratingSystem === "points"
                      ? "border-primary/50 bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                      : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10",
                  )}
                >
                  <Hash className="size-4" />
                  {t("AddRanking.ratingSystem.points")}
                </button>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-5">
              {/* Left Column: Config Inputs */}
              <div className="space-y-8 md:col-span-2">
                {/* Allow Draw Toggle */}
                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-4">
                  <LabelTooltip
                    label={t("AddRanking.allowDraw.label")}
                    tooltip={t("AddRanking.allowDraw.tooltip")}
                  />
                  <button
                    type="button"
                    onClick={() => setAllowDraw(!allowDraw)}
                    className={cn(
                      "ring-primary/20 relative h-6 w-11 rounded-full transition-colors outline-none focus:ring-4",
                      allowDraw ? "bg-primary" : "bg-white/10",
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-all",
                        allowDraw ? "translate-x-5" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>

                <div className="space-y-6">
                  {ratingSystem === "elo" ? (
                    <div className="grid gap-6">
                      <div className="flex flex-col gap-2">
                        <LabelTooltip
                          label={t("AddRanking.initialElo.label")}
                        />
                        <NumberInput
                          value={initialElo}
                          onChange={setInitialElo}
                          step={100}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <LabelTooltip
                          label={t("AddRanking.kFactor.label")}
                          tooltip={t("AddRanking.kFactor.tooltip")}
                        />
                        <NumberInput
                          value={kFactor}
                          onChange={setKFactor}
                          min={1}
                          max={100}
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <LabelTooltip
                          label={t("AddRanking.scoreRelevance.label")}
                          tooltip={t("AddRanking.scoreRelevance.tooltip")}
                        />
                        <Slider
                          value={scoreRelevance}
                          onChange={(e) =>
                            setScoreRelevance(Number(e.target.value))
                          }
                          min={0}
                          max={1}
                          step={0.1}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between gap-4">
                        <LabelTooltip
                          label={t("AddRanking.pointsPerWin.label")}
                          labelClassName="text-xs font-bold tracking-wider text-white/40"
                          required
                        />
                        <NumberInput
                          value={pointsPerWin}
                          onChange={setPointsPerWin}
                          className="w-32"
                          min={0}
                        />
                      </div>
                      {allowDraw && (
                        <div className="flex items-center justify-between gap-4">
                          <LabelTooltip
                            label={t("AddRanking.pointsPerDraw.label")}
                            labelClassName="text-xs font-bold tracking-wider text-white/40"
                            required
                          />
                          <NumberInput
                            value={pointsPerDraw}
                            onChange={setPointsPerDraw}
                            className="w-32"
                            min={0}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-4">
                        <LabelTooltip
                          label={t("AddRanking.pointsPerLoss.label")}
                          labelClassName="text-xs font-bold tracking-wider text-white/40"
                          required
                        />
                        <NumberInput
                          value={pointsPerLoss}
                          onChange={setPointsPerLoss}
                          className="w-32"
                          min={0}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Inactivity & Explanation Box */}
              <div className="space-y-6 md:col-span-3">
                {/* Inactivity Settings (Elo only) */}
                {ratingSystem === "elo" && (
                  <div className="space-y-4 rounded-2xl border border-white/5 bg-white/2 p-5">
                    <div className="flex items-center gap-2 text-white/40">
                      <Clock className="size-3.5" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">
                        {t("AddRanking.inactivityDecay.label")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <LabelTooltip
                          label={t("AddRanking.inactivityDecay.labelShort")}
                          tooltip={t("AddRanking.inactivityDecay.tooltip")}
                          className="gap-1! opacity-60"
                        />
                        <NumberInput
                          value={inactivityDecay}
                          onChange={setInactivityDecay}
                          min={0}
                        />
                      </div>
                      {inactivityDecay > 0 && (
                        <>
                          <div className="animate-in fade-in slide-in-from-left-2 space-y-1.5 duration-300">
                            <LabelTooltip
                              label={t(
                                "AddRanking.inactivityThreshold.labelShort",
                              )}
                              tooltip={t(
                                "AddRanking.inactivityThreshold.tooltip",
                              )}
                              className="gap-1! opacity-60"
                            />
                            <NumberInput
                              value={inactivityThresholdHours}
                              onChange={setInactivityThresholdHours}
                              min={1}
                              unit="h"
                            />
                          </div>
                          <div className="animate-in fade-in slide-in-from-top-2 col-span-full space-y-1.5 pt-2 duration-300">
                            <LabelTooltip
                              label={t("AddRanking.inactivityFloor.label")}
                              tooltip={t("AddRanking.inactivityFloor.tooltip")}
                              className="gap-1! opacity-60"
                            />
                            <NumberInput
                              value={inactivityDecayFloor}
                              onChange={setInactivityDecayFloor}
                              step={100}
                              min={0}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Explanation Box */}
                <div className="border-primary/20 bg-primary/3 shadow-primary/5 relative overflow-hidden rounded-3xl border p-6 shadow-2xl">
                  <div className="bg-primary/5 absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl" />

                  <h4 className="text-primary mb-4 flex items-center gap-2 text-sm font-bold">
                    <Zap className="size-4" />
                    {t("AddRanking.explanation.title")}
                  </h4>

                  <div className="space-y-5 text-xs leading-relaxed text-white/60">
                    <p className="font-medium text-white/80 italic">
                      {ratingSystem === "elo"
                        ? t("AddRanking.explanation.elo.description")
                        : t("AddRanking.explanation.points.description")}
                    </p>

                    <div className="grid gap-3 pt-2">
                      {ratingSystem === "elo" ? (
                        <>
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5",
                                scoreRelevance > 0
                                  ? "text-primary"
                                  : "text-white/40",
                              )}
                            >
                              <TrendingUp className="size-3" />
                            </div>
                            <span>
                              {(() => {
                                if (scoreRelevance === 0)
                                  return t(
                                    "AddRanking.explanation.elo.relevance_1",
                                  );
                                if (scoreRelevance <= 0.3)
                                  return t(
                                    "AddRanking.explanation.elo.relevance_2",
                                  );
                                if (scoreRelevance <= 0.6)
                                  return t(
                                    "AddRanking.explanation.elo.relevance_3",
                                  );
                                if (scoreRelevance < 1)
                                  return t(
                                    "AddRanking.explanation.elo.relevance_4",
                                  );
                                return t(
                                  "AddRanking.explanation.elo.relevance_5",
                                );
                              })()}
                            </span>
                          </div>

                          {/* Win Margin Thresholds */}
                          <div className="mt-1 space-y-2 rounded-2xl bg-white/2 p-4">
                            <p className="text-[10px] font-bold tracking-wider text-white/30 uppercase">
                              {t("AddRanking.explanation.elo.thresholds")}
                            </p>
                            <div className="grid grid-cols-2 gap-4 gap-y-3 sm:grid-cols-3">
                              {[1, 3, 5, 10, 20].map((m) => {
                                const multiplier = 1 + (m - 1) * scoreRelevance;
                                return (
                                  <div
                                    key={m}
                                    className="flex flex-col gap-0.5"
                                  >
                                    <span className="text-[10px] text-white/40">
                                      {t(
                                        "AddRanking.explanation.elo.win_margin",
                                        {
                                          margin: m,
                                        },
                                      )}
                                    </span>
                                    <span className="text-xs font-bold text-white/90">
                                      {multiplier.toFixed(1)}x
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5",
                                allowDraw ? "text-primary" : "text-white/40",
                              )}
                            >
                              {allowDraw ? (
                                <Equal className="size-3" />
                              ) : (
                                <Swords className="size-3" />
                              )}
                            </div>
                            <span>
                              {allowDraw
                                ? t("AddRanking.explanation.elo.draws_enabled")
                                : t(
                                    "AddRanking.explanation.elo.draws_disabled",
                                  )}
                            </span>
                          </div>
                          {inactivityDecay > 0 && (
                            <div className="flex items-center gap-3">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5 text-red-500/50">
                                <Activity className="size-3" />
                              </div>
                              <span>
                                {t("AddRanking.explanation.elo.decay", {
                                  amount: inactivityDecay,
                                  hours: inactivityThresholdHours,
                                  floor: inactivityDecayFloor,
                                })}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="grid gap-3">
                          <div className="flex items-center gap-3">
                            <ArrowUpRight className="size-4 text-emerald-500" />
                            <span className="text-white/80">
                              {t("AddRanking.explanation.points.win", {
                                amount: pointsPerWin,
                              })}
                            </span>
                          </div>
                          {allowDraw && (
                            <div className="flex items-center gap-3">
                              <Equal className="size-4 text-amber-500" />
                              <span className="text-white/80">
                                {t("AddRanking.explanation.points.draw", {
                                  amount: pointsPerDraw,
                                })}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <ArrowDownRight className="size-4 text-rose-500" />
                            <span className="text-white/80">
                              {t("AddRanking.explanation.points.loss", {
                                amount: pointsPerLoss,
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
    </Modal>
  );
}
