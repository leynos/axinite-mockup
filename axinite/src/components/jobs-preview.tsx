import { createMemo, createSignal, For } from "solid-js";

import { useI18n } from "@/lib/i18n/provider";
import { pascalCase } from "@/lib/string-case";

type JobStatus = "pending" | "in_progress" | "completed" | "failed" | "stuck";
type JobSource = "direct" | "sandbox";
type JobId = "audit" | "comparison" | "oauth" | "docs" | "security";

type JobRecord = {
  createdAt: string;
  id: JobId;
  shortId: string;
  source: JobSource;
  status: JobStatus;
};

const JOBS: JobRecord[] = [
  {
    createdAt: "2026-03-12 08:15",
    id: "audit",
    shortId: "f2854dd8",
    source: "direct",
    status: "completed",
  },
  {
    createdAt: "2026-03-12 09:30",
    id: "comparison",
    shortId: "a1b2c3d4",
    source: "direct",
    status: "in_progress",
  },
  {
    createdAt: "2026-03-11 14:00",
    id: "oauth",
    shortId: "7e8f9a0b",
    source: "sandbox",
    status: "failed",
  },
  {
    createdAt: "2026-03-12 07:00",
    id: "docs",
    shortId: "b3c4d5e6",
    source: "direct",
    status: "stuck",
  },
  {
    createdAt: "2026-03-12 10:05",
    id: "security",
    shortId: "c5d6e7f8",
    source: "direct",
    status: "pending",
  },
];

const JOB_SUMMARY_KEYS = [
  "total",
  "in_progress",
  "completed",
  "failed",
  "stuck",
] as const;

const STATUS_CLASS: Record<JobStatus, string> = {
  completed: "pill pill--success",
  failed: "pill pill--danger",
  in_progress: "pill pill--success",
  pending: "pill pill--neutral",
  stuck: "pill pill--warning",
};

const SOURCE_CLASS: Record<JobSource, string> = {
  direct: "pill pill--neutral",
  sandbox: "pill pill--info",
};

export const JobsPreview = () => {
  const { t } = useI18n();
  const [activeJobId, setActiveJobId] = createSignal<JobId>("comparison");

  const toKebabSegment = (value: string) =>
    pascalCase(value)
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()
      .replace(/^-/, "");

  const activeJob = createMemo(
    () => JOBS.find((job) => job.id === activeJobId()) ?? JOBS[0]
  );

  const summaryCount = (key: (typeof JOB_SUMMARY_KEYS)[number]): number => {
    if (key === "total") {
      return JOBS.length;
    }

    return JOBS.filter((job) => job.status === key).length;
  };

  const statusLabel = (status: JobStatus) =>
    t(`jobs-status-${toKebabSegment(status)}`);

  const sourceLabel = (source: JobSource) =>
    source === "direct" ? t("jobs-source-direct") : t("jobs-source-sandbox");

  return (
    <section class="route-preview route-preview--dashboard">
      <div aria-hidden="true" class="route-preview__watermark">
        {t("jobs-watermark")}
      </div>

      <div class="dashboard-preview">
        <header class="route-preview__intro dashboard-preview__intro">
          <p class="route-preview__eyebrow">{t("route-hero-eyebrow")}</p>
          <h2 class="route-preview__title">{t("route-jobs-label")}</h2>
          <p class="route-preview__summary">{t("page-jobs-summary")}</p>
        </header>

        <div class="dashboard-summary">
          <For each={JOB_SUMMARY_KEYS}>
            {(summaryKey) => (
              <article class="dashboard-summary__card">
                <p class="dashboard-summary__label">
                  {t(`jobs-summary-${toKebabSegment(summaryKey)}`)}
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
              <h3 class="dashboard-panel__title">{t("jobs-table-title")}</h3>
              <p class="dashboard-panel__body">{t("page-jobs-agenda")}</p>
            </div>
          </div>

          <div class="dashboard-table-wrap">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th>{t("jobs-column-id")}</th>
                  <th>{t("jobs-column-title")}</th>
                  <th>{t("jobs-column-source")}</th>
                  <th>{t("jobs-column-status")}</th>
                  <th>{t("jobs-column-created")}</th>
                  <th>{t("jobs-column-actions")}</th>
                </tr>
              </thead>
              <tbody>
                <For each={JOBS}>
                  {(job) => (
                    <tr
                      class={
                        activeJobId() === job.id
                          ? "dashboard-table__row dashboard-table__row--active"
                          : "dashboard-table__row"
                      }
                    >
                      <td class="dashboard-table__mono">{job.shortId}</td>
                      <td>
                        <button
                          class="dashboard-table__title-button"
                          onClick={() => setActiveJobId(job.id)}
                          type="button"
                        >
                          {t(`jobs-item-${job.id}-title`)}
                        </button>
                      </td>
                      <td>
                        <span class={SOURCE_CLASS[job.source]}>
                          {sourceLabel(job.source)}
                        </span>
                      </td>
                      <td>
                        <span class={STATUS_CLASS[job.status]}>
                          {statusLabel(job.status)}
                        </span>
                      </td>
                      <td class="dashboard-table__meta">{job.createdAt}</td>
                      <td>
                        <button
                          class="dashboard-table__action"
                          onClick={() => setActiveJobId(job.id)}
                          type="button"
                        >
                          {t("jobs-action-inspect")}
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
                {t("jobs-detail-eyebrow")}
              </p>
              <h3 class="dashboard-detail__title">
                {t(`jobs-item-${activeJob().id}-title`)}
              </h3>
            </div>
            <div class="dashboard-detail__pills">
              <span class={SOURCE_CLASS[activeJob().source]}>
                {sourceLabel(activeJob().source)}
              </span>
              <span class={STATUS_CLASS[activeJob().status]}>
                {statusLabel(activeJob().status)}
              </span>
            </div>
          </div>

          <p class="dashboard-detail__body">
            {t(`jobs-item-${activeJob().id}-body`)}
          </p>

          <dl class="dashboard-detail__meta-grid">
            <div>
              <dt>{t("jobs-meta-created")}</dt>
              <dd>{activeJob().createdAt}</dd>
            </div>
            <div>
              <dt>{t("jobs-meta-elapsed")}</dt>
              <dd>{t(`jobs-item-${activeJob().id}-elapsed`)}</dd>
            </div>
            <div>
              <dt>{t("jobs-meta-guardrail")}</dt>
              <dd>{t("page-jobs-guardrail")}</dd>
            </div>
          </dl>

          <div class="dashboard-detail__actions">
            <button class="dashboard-detail__ghost" type="button">
              {t("jobs-action-inspect")}
            </button>
            <button class="dashboard-detail__ghost" disabled type="button">
              {t("jobs-action-restart")}
            </button>
            <button class="dashboard-detail__ghost" disabled type="button">
              {t("jobs-action-cancel")}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
};
