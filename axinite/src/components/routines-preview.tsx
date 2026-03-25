import { For, createSignal } from "solid-js";

import { useI18n } from "@/lib/i18n/provider";

type RoutineStatus = "active" | "disabled" | "failing";
type RoutineTrigger = "cron" | "event" | "system" | "manual";
type RoutineAction = "lightweight" | "full_job";
type RoutineId =
  | "standup"
  | "deploy"
  | "triage"
  | "weekly"
  | "health";

type RoutineRecord = {
  action: RoutineAction;
  id: RoutineId;
  lastRun: string;
  nextRunKey: "scheduled" | "none" | "paused" | "manual";
  runCount: number;
  status: RoutineStatus;
  trigger: RoutineTrigger;
};

const ROUTINES: RoutineRecord[] = [
  {
    action: "lightweight",
    id: "standup",
    lastRun: "2026-03-12 09:00",
    nextRunKey: "scheduled",
    runCount: 47,
    status: "active",
    trigger: "cron",
  },
  {
    action: "full_job",
    id: "deploy",
    lastRun: "2026-03-11 16:45",
    nextRunKey: "none",
    runCount: 12,
    status: "active",
    trigger: "event",
  },
  {
    action: "lightweight",
    id: "triage",
    lastRun: "2026-03-12 10:15",
    nextRunKey: "none",
    runCount: 89,
    status: "failing",
    trigger: "system",
  },
  {
    action: "full_job",
    id: "weekly",
    lastRun: "2026-02-24 08:00",
    nextRunKey: "paused",
    runCount: 15,
    status: "disabled",
    trigger: "cron",
  },
  {
    action: "lightweight",
    id: "health",
    lastRun: "2026-03-09 15:30",
    nextRunKey: "manual",
    runCount: 6,
    status: "active",
    trigger: "manual",
  },
];

const ROUTINE_SUMMARY_KEYS = [
  "total",
  "enabled",
  "disabled",
  "failing",
  "runs_today",
] as const;

const STATUS_CLASS: Record<RoutineStatus, string> = {
  active: "dashboard-pill dashboard-pill--success",
  disabled: "dashboard-pill dashboard-pill--neutral",
  failing: "dashboard-pill dashboard-pill--danger",
};

const TRIGGER_CLASS: Record<RoutineTrigger, string> = {
  cron: "dashboard-pill dashboard-pill--info",
  event: "dashboard-pill dashboard-pill--violet",
  manual: "dashboard-pill dashboard-pill--neutral",
  system: "dashboard-pill dashboard-pill--warning",
};

const ACTION_CLASS: Record<RoutineAction, string> = {
  full_job: "dashboard-pill dashboard-pill--violet",
  lightweight: "dashboard-pill dashboard-pill--neutral",
};

export const RoutinesPreview = () => {
  const { t } = useI18n();
  const [activeRoutineId, setActiveRoutineId] =
    createSignal<RoutineId>("standup");

  const activeRoutine = () =>
    ROUTINES.find((routine) => routine.id === activeRoutineId()) ?? ROUTINES[0];

  const summaryCount = (
    key: (typeof ROUTINE_SUMMARY_KEYS)[number]
  ): number => {
    switch (key) {
      case "total":
        return ROUTINES.length;
      case "enabled":
        return ROUTINES.filter((routine) => routine.status !== "disabled").length;
      case "disabled":
        return ROUTINES.filter((routine) => routine.status === "disabled").length;
      case "failing":
        return ROUTINES.filter((routine) => routine.status === "failing").length;
      case "runs_today":
        return 3;
    }
  };

  const statusLabel = (status: RoutineStatus) =>
    t(`routinesStatus${status.slice(0, 1).toUpperCase()}${status.slice(1)}`);

  const triggerLabel = (trigger: RoutineTrigger) =>
    t(`routinesTrigger${trigger.slice(0, 1).toUpperCase()}${trigger.slice(1)}`);

  const actionLabel = (action: RoutineAction) =>
    t(
      action === "full_job"
        ? "routinesActionTypeFullJob"
        : "routinesActionTypeLightweight"
    );

  const nextRunLabel = (routine: RoutineRecord) =>
    routine.nextRunKey === "scheduled"
      ? t(`routinesItem${routine.id}NextRun`)
      : t(`routinesNextRun${routine.nextRunKey.slice(0, 1).toUpperCase()}${routine.nextRunKey.slice(1)}`);

  return (
    <section class="route-preview route-preview--dashboard">
      <div aria-hidden="true" class="route-preview__watermark">
        {t("routinesWatermark")}
      </div>

      <div class="dashboard-preview">
        <header class="route-preview__intro dashboard-preview__intro">
          <p class="route-preview__eyebrow">{t("routeHeroEyebrow")}</p>
          <h2 class="route-preview__title">{t("route-routines-label")}</h2>
          <p class="route-preview__summary">{t("page-routines-summary")}</p>
        </header>

        <div class="dashboard-summary">
          <For each={ROUTINE_SUMMARY_KEYS}>
            {(summaryKey) => (
              <article class="dashboard-summary__card">
                <p class="dashboard-summary__label">
                  {t(
                    `routinesSummary${summaryKey
                      .split("_")
                      .map(
                        (segment) =>
                          `${segment.slice(0, 1).toUpperCase()}${segment.slice(1)}`
                      )
                      .join("")}`
                  )}
                </p>
                <p class="dashboard-summary__value">{summaryCount(summaryKey)}</p>
              </article>
            )}
          </For>
        </div>

        <section class="dashboard-panel">
          <div class="dashboard-panel__header">
            <div>
              <h3 class="dashboard-panel__title">{t("routinesTableTitle")}</h3>
              <p class="dashboard-panel__body">{t("page-routines-agenda")}</p>
            </div>
          </div>

          <div class="dashboard-table-wrap">
            <table class="dashboard-table dashboard-table--routines">
              <thead>
                <tr>
                  <th>{t("routinesColumnName")}</th>
                  <th>{t("routinesColumnTrigger")}</th>
                  <th>{t("routinesColumnAction")}</th>
                  <th>{t("routinesColumnLastRun")}</th>
                  <th>{t("routinesColumnNextRun")}</th>
                  <th>{t("routinesColumnRuns")}</th>
                  <th>{t("routinesColumnStatus")}</th>
                  <th>{t("routinesColumnActions")}</th>
                </tr>
              </thead>
              <tbody>
                <For each={ROUTINES}>
                  {(routine) => (
                    <tr
                      class={
                        activeRoutineId() === routine.id
                          ? "dashboard-table__row dashboard-table__row--active"
                          : "dashboard-table__row"
                      }
                    >
                      <td>
                        <button
                          class="dashboard-table__title-button"
                          onClick={() => setActiveRoutineId(routine.id)}
                          type="button"
                        >
                          {t(`routinesItem${routine.id}Title`)}
                        </button>
                      </td>
                      <td>
                        <span class={TRIGGER_CLASS[routine.trigger]}>
                          {triggerLabel(routine.trigger)}
                        </span>
                      </td>
                      <td>
                        <span class={ACTION_CLASS[routine.action]}>
                          {actionLabel(routine.action)}
                        </span>
                      </td>
                      <td class="dashboard-table__meta">{routine.lastRun}</td>
                      <td class="dashboard-table__meta">{nextRunLabel(routine)}</td>
                      <td class="dashboard-table__meta">{routine.runCount}</td>
                      <td>
                        <span class={STATUS_CLASS[routine.status]}>
                          {statusLabel(routine.status)}
                        </span>
                      </td>
                      <td>
                        <button
                          class="dashboard-table__action"
                          onClick={() => setActiveRoutineId(routine.id)}
                          type="button"
                        >
                          {t("routinesActionInspect")}
                        </button>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </section>

        <section class="dashboard-detail">
          <div class="dashboard-detail__header">
            <div>
              <p class="dashboard-detail__eyebrow">{t("routinesDetailEyebrow")}</p>
              <h3 class="dashboard-detail__title">
                {t(`routinesItem${activeRoutine().id}Title`)}
              </h3>
            </div>
            <div class="dashboard-detail__pills">
              <span class={TRIGGER_CLASS[activeRoutine().trigger]}>
                {triggerLabel(activeRoutine().trigger)}
              </span>
              <span class={STATUS_CLASS[activeRoutine().status]}>
                {statusLabel(activeRoutine().status)}
              </span>
            </div>
          </div>

          <p class="dashboard-detail__body">
            {t(`routinesItem${activeRoutine().id}Body`)}
          </p>

          <dl class="dashboard-detail__meta-grid">
            <div>
              <dt>{t("routinesMetaLastRun")}</dt>
              <dd>{activeRoutine().lastRun}</dd>
            </div>
            <div>
              <dt>{t("routinesMetaNextRun")}</dt>
              <dd>{nextRunLabel(activeRoutine())}</dd>
            </div>
            <div>
              <dt>{t("routinesMetaGuardrail")}</dt>
              <dd>{t("page-routines-guardrail")}</dd>
            </div>
          </dl>

          <div class="dashboard-detail__actions">
            <button class="dashboard-detail__ghost" type="button">
              {t("routinesActionInspect")}
            </button>
            <button class="dashboard-detail__ghost" disabled type="button">
              {t("routinesActionRunNow")}
            </button>
            <button class="dashboard-detail__ghost" disabled type="button">
              {t("routinesActionDisable")}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
};
