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
import { addRanking } from "@/actions/game";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { LabelTooltip } from "@/components/ui/label-tooltip";
import { DateInput } from "@/components/ui/date-input";
import { NumberInput } from "@/components/ui/number-input";
import { cn } from "@/lib/utils";

interface AddRankingModalProps {
  gameId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddRankingModal({
  gameId,
  isOpen,
  onClose,
}: AddRankingModalProps) {
  const t = useTranslations("Modals.AddRanking");
  const [isPending, startTransition] = useTransition();

  // General Data
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugModified, setIsSlugModified] = useState(false);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Format Configuration
  const [ratingSystem, setRatingSystem] = useState("elo");
  const [initialElo, setInitialElo] = useState(1000);
  const [allowDraw, setAllowDraw] = useState(false);

  // Elo Specific
  const [kFactor, setKFactor] = useState(20);
  const [scoreRelevance, setScoreRelevance] = useState(0.4);
  const [inactivityDecay, setInactivityDecay] = useState(0);
  const [inactivityThresholdHours, setInactivityThresholdHours] = useState(120);
  const [inactivityDecayFloor, setInactivityDecayFloor] = useState(1000);

  // Points Specific
  const [pointsPerWin, setPointsPerWin] = useState(3);
  const [pointsPerDraw, setPointsPerDraw] = useState(1);
  const [pointsPerLoss, setPointsPerLoss] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    startTransition(async () => {
      try {
        await addRanking({
          gameId,
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
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        });
        toast.success(t("success"));
        onClose();
      } catch {
        toast.error(t("error"));
      }
    });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("title")}
      description={t("description")}
      confirmText={isPending ? t("submitting") : t("submit")}
      cancelText={t("cancel")}
      formId="add-ranking-form"
      isPending={isPending}
      disabled={!name || !slug}
      className="max-w-3xl"
    >
      <form
        id="add-ranking-form"
        onSubmit={handleSubmit}
        className="space-y-10"
      >
        {/* Section 1: General Data */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-white/40">
            <FileText className="size-4" />
            <h3 className="text-xs font-bold tracking-widest uppercase">
              {t("sections.general")}
            </h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <LabelTooltip label={t("name.label")} required />
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
                placeholder={t("name.placeholder")}
                className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
              />
            </div>

            <div className="flex flex-col gap-2">
              <LabelTooltip
                label={t("slug.label")}
                tooltip={t("slug.tooltip")}
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
                placeholder={t("slug.placeholder")}
                className="focus:border-primary/50 focus:ring-primary/10 w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
              />
            </div>

            <div className="col-span-full flex flex-col gap-2">
              <LabelTooltip label={t("descriptionField.label")} />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("descriptionField.placeholder")}
                className="focus:border-primary/50 focus:ring-primary/10 min-h-[80px] w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition-all outline-none placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-4"
              />
            </div>

            <div className="flex flex-col gap-2">
              <LabelTooltip label={t("dates.start.label")} required />
              <DateInput
                value={startDate}
                onChange={setStartDate}
                min={today}
                placeholder={t("dates.start.placeholder")}
              />
            </div>

            <div className="flex flex-col gap-2">
              <LabelTooltip label={t("dates.end.label")} />
              <DateInput
                value={endDate}
                onChange={setEndDate}
                min={startDate || today}
                placeholder={t("dates.end.placeholder")}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Format Logic */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-white/40">
            <Settings2 className="size-4" />
            <h3 className="text-xs font-bold tracking-widest uppercase">
              {t("sections.format")}
            </h3>
          </div>

          <div className="flex flex-col gap-10">
            {/* System Selector - Full Width Row */}
            <div className="flex flex-col gap-4">
              <LabelTooltip label={t("ratingSystem.label")} />
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
                  {t("ratingSystem.elo")}
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
                  {t("ratingSystem.points")}
                </button>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-5">
              {/* Left Column: Config Inputs */}
              <div className="space-y-8 md:col-span-2">
                {/* Allow Draw Toggle */}
                <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/2 p-4">
                  <LabelTooltip
                    label={t("allowDraw.label")}
                    tooltip={t("allowDraw.tooltip")}
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
                        <LabelTooltip label={t("initialElo.label")} />
                        <NumberInput
                          value={initialElo}
                          onChange={setInitialElo}
                          step={100}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <LabelTooltip
                          label={t("kFactor.label")}
                          tooltip={t("kFactor.tooltip")}
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
                          label={t("scoreRelevance.label")}
                          tooltip={t("scoreRelevance.tooltip")}
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
                          label={t("pointsPerWin.label")}
                          labelClassName="text-xs font-bold tracking-wider text-white/40 uppercase"
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
                            label={t("pointsPerDraw.label")}
                            labelClassName="text-xs font-bold tracking-wider text-white/40 uppercase"
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
                          label={t("pointsPerLoss.label")}
                          labelClassName="text-xs font-bold tracking-wider text-white/40 uppercase"
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
                        {t("inactivityDecay.label")}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <LabelTooltip
                          label={t("inactivityDecay.labelShort")}
                          tooltip={t("inactivityDecay.tooltip")}
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
                          <div className="animate-in fade-in slide-in-from-top-2 space-y-1.5 duration-300">
                            <LabelTooltip
                              label={t("inactivityFloor.label")}
                              tooltip={t("inactivityFloor.tooltip")}
                              className="gap-1! opacity-60"
                            />
                            <NumberInput
                              value={inactivityDecayFloor}
                              onChange={setInactivityDecayFloor}
                              step={100}
                              min={0}
                            />
                          </div>
                          <div className="animate-in fade-in slide-in-from-left-2 col-span-full space-y-1.5 duration-300">
                            <LabelTooltip
                              label={t("inactivityThreshold.labelShort")}
                              tooltip={t("inactivityThreshold.tooltip")}
                              className="gap-1! opacity-60"
                            />
                            <NumberInput
                              value={inactivityThresholdHours}
                              onChange={setInactivityThresholdHours}
                              min={1}
                              step={5}
                              unit={t("inactivityThreshold.unit")}
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
                    {t("explanation.title")}
                  </h4>

                  <div className="space-y-5 text-xs leading-relaxed text-white/60">
                    <p className="font-medium text-white/80 italic">
                      {ratingSystem === "elo"
                        ? t("explanation.elo.description")
                        : t("explanation.points.description")}
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
                                  return t("explanation.elo.relevance_1");
                                if (scoreRelevance <= 0.3)
                                  return t("explanation.elo.relevance_2");
                                if (scoreRelevance <= 0.6)
                                  return t("explanation.elo.relevance_3");
                                if (scoreRelevance < 1)
                                  return t("explanation.elo.relevance_4");
                                return t("explanation.elo.relevance_5");
                              })()}
                            </span>
                          </div>

                          {/* Win Margin Thresholds */}
                          <div className="mt-1 space-y-2 rounded-2xl bg-white/2 p-4">
                            <p className="text-[10px] font-bold tracking-wider text-white/30 uppercase">
                              {t("explanation.elo.thresholds")}
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
                                      {t("explanation.elo.win_margin", {
                                        margin: m,
                                      })}
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
                                ? t("explanation.elo.draws_enabled")
                                : t("explanation.elo.draws_disabled")}
                            </span>
                          </div>
                          {inactivityDecay > 0 && (
                            <div className="flex items-center gap-3">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/5 text-red-500/50">
                                <Activity className="size-3" />
                              </div>
                              <span>
                                {t("explanation.elo.decay", {
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
                              {t("explanation.points.win", {
                                amount: pointsPerWin,
                              })}
                            </span>
                          </div>
                          {allowDraw && (
                            <div className="flex items-center gap-3">
                              <Equal className="size-4 text-amber-500" />
                              <span className="text-white/80">
                                {t("explanation.points.draw", {
                                  amount: pointsPerDraw,
                                })}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <ArrowDownRight className="size-4 text-rose-500" />
                            <span className="text-white/80">
                              {t("explanation.points.loss", {
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
