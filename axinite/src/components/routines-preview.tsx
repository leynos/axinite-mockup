import { createSignal, For } from "solid-js";

import { useI18n } from "@/lib/i18n/provider";
import { capitalise, pascalCase } from "@/lib/string-case";

type RoutineStatus = "active" | "disabled" | "failing";
type RoutineTrigger = "cron" | "event" | "system" | "manual";
type RoutineAction = "lightweight" | "full_job";
type RoutineId = "standup" | "deploy" | "triage" | "weekly" | "health";

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
  active: "pill pill--success",
  disabled: "pill pill--neutral",
  failing: "pill pill--danger",
};

const TRIGGER_CLASS: Record<RoutineTrigger, string> = {
  cron: "pill pill--info",
  event: "pill pill--violet",
  manual: "pill pill--neutral",
  system: "pill pill--warning",
};

const ACTION_CLASS: Record<RoutineAction, string> = {
  full_job: "pill pill--violet",
  lightweight: "pill pill--neutral",
};

export const RoutinesPreview = () => {
  const { t } = useI18n();
  const [activeRoutineId, setActiveRoutineId] =
    createSignal<RoutineId>("standup");

  const toKebabSegment = (value: string) =>
    pascalCase(value)
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()
      .replace(/^-/, "");

  const activeRoutine = () =>
    ROUTINES.find((routine) => routine.id === activeRoutineId()) ?? ROUTINES[0];

  const summaryCount = (key: (typeof ROUTINE_SUMMARY_KEYS)[number]): number => {
    switch (key) {
      case "total":
        return ROUTINES.length;
      case "enabled":
        return ROUTINES.filter((routine) => routine.status !== "disabled")
          .length;
      case "disabled":
        return ROUTINES.filter((routine) => routine.status === "disabled")
          .length;
      case "failing":
        return ROUTINES.filter((routine) => routine.status === "failing")
          .length;
      case "runs_today":
        // TODO: replace this hardcoded count with runtime-backed runs_today data.
        return 3;
    }
  };

  const statusLabel = (status: RoutineStatus) =>
    t(`routines-status-${capitalise(status).toLowerCase()}`);

  const triggerLabel = (trigger: RoutineTrigger) =>
    t(`routines-trigger-${capitalise(trigger).toLowerCase()}`);

  const actionLabel = (action: RoutineAction) =>
    t(
      action === "full_job"
        ? "routines-action-type-full-job"
        : "routines-action-type-lightweight"
    );

  const nextRunLabel = (routine: RoutineRecord) =>
    routine.nextRunKey === "scheduled"
      ? t(`routines-item-${routine.id}-next-run`)
      : t(`routines-next-run-${routine.nextRunKey}`);

  return (
    <section class="route-preview route-preview--dashboard">
      <div aria-hidden="true" class="route-preview__watermark">
        {t("routines-watermark")}
      </div>

      <div class="dashboard-preview">
        <header class="route-preview__intro dashboard-preview__intro">
          <p class="route-preview__eyebrow">{t("route-hero-eyebrow")}</p>
          <h2 class="route-preview__title">{t("route-routines-label")}</h2>
          <p class="route-preview__summary">{t("page-routines-summary")}</p>
        </header>

        <div class="dashboard-summary">
          <For each={ROUTINE_SUMMARY_KEYS}>
            {(summaryKey) => (
              <article class="dashboard-summary__card">
                <p class="dashboard-summary__label">
                  {t(`routines-summary-${toKebabSegment(summaryKey)}`)}
                </p>
                <p class="dashboard-summary__value">
                  {summaryCount(summaryKey)}
                </p>
              </article>
            )}
          </For>
        </div>

        <section class="dashboard-panel">
          <div class="dashboard-panel__header">
            <div>
              <h3 class="dashboard-panel__title">
                {t("routines-table-title")}
              </h3>
              <p class="dashboard-panel__body">{t("page-routines-agenda")}</p>
            </div>
          </div>

          <div class="dashboard-table-wrap">
            <table class="dashboard-table dashboard-table--routines">
              <thead>
                <tr>
                  <th scope="col">{t("routines-column-name")}</th>
                  <th scope="col">{t("routines-column-trigger")}</th>
                  <th scope="col">{t("routines-column-action")}</th>
                  <th scope="col">{t("routines-column-last-run")}</th>
                  <th scope="col">{t("routines-column-next-run")}</th>
                  <th scope="col">{t("routines-column-runs")}</th>
                  <th scope="col">{t("routines-column-status")}</th>
                  <th scope="col">{t("routines-column-actions")}</th>
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
                          {t(`routines-item-${routine.id}-title`)}
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
                      <td class="dashboard-table__meta">
                        {nextRunLabel(routine)}
                      </td>
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
                          {t("routines-action-inspect")}
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
              <p class="dashboard-detail__eyebrow">
                {t("routines-detail-eyebrow")}
              </p>
              <h3 class="dashboard-detail__title">
                {t(`routines-item-${activeRoutine().id}-title`)}
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
            {t(`routines-item-${activeRoutine().id}-body`)}
          </p>

          <dl class="dashboard-detail__meta-grid">
            <div>
              <dt>{t("routines-meta-last-run")}</dt>
              <dd>{activeRoutine().lastRun}</dd>
            </div>
            <div>
              <dt>{t("routines-meta-next-run")}</dt>
              <dd>{nextRunLabel(activeRoutine())}</dd>
            </div>
            <div>
              <dt>{t("routines-meta-guardrail")}</dt>
              <dd>{t("page-routines-guardrail")}</dd>
            </div>
          </dl>

          <div class="dashboard-detail__actions">
            <button class="dashboard-detail__ghost" type="button">
              {t("routines-action-inspect")}
            </button>
            <button class="dashboard-detail__ghost" disabled type="button">
              {t("routines-action-run-now")}
            </button>
            <button class="dashboard-detail__ghost" disabled type="button">
              {t("routines-action-disable")}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
};
