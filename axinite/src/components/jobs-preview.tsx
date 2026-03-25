import { For, createSignal } from "solid-js";

import { useI18n } from "@/lib/i18n/provider";

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
  completed: "dashboard-pill dashboard-pill--success",
  failed: "dashboard-pill dashboard-pill--danger",
  in_progress: "dashboard-pill dashboard-pill--success",
  pending: "dashboard-pill dashboard-pill--neutral",
  stuck: "dashboard-pill dashboard-pill--warning",
};

const SOURCE_CLASS: Record<JobSource, string> = {
  direct: "dashboard-pill dashboard-pill--neutral",
  sandbox: "dashboard-pill dashboard-pill--info",
};

export const JobsPreview = () => {
  const { t } = useI18n();
  const [activeJobId, setActiveJobId] = createSignal<JobId>("comparison");

  const activeJob = () =>
    JOBS.find((job) => job.id === activeJobId()) ?? JOBS[0];

  const summaryCount = (
    key: (typeof JOB_SUMMARY_KEYS)[number]
  ): number => {
    if (key === "total") {
      return JOBS.length;
    }

    return JOBS.filter((job) => job.status === key).length;
  };

  const statusLabel = (status: JobStatus) =>
    t(
      `jobsStatus${status
        .split("_")
        .map((segment) => `${segment.slice(0, 1).toUpperCase()}${segment.slice(1)}`)
        .join("")}`
    );

  const sourceLabel = (source: JobSource) =>
    source === "direct" ? t("jobsSourceDirect") : t("jobsSourceSandbox");

  return (
    <section class="route-preview route-preview--dashboard">
      <div aria-hidden="true" class="route-preview__watermark">
        {t("jobsWatermark")}
      </div>

      <div class="dashboard-preview">
        <header class="route-preview__intro dashboard-preview__intro">
          <p class="route-preview__eyebrow">{t("routeHeroEyebrow")}</p>
          <h2 class="route-preview__title">{t("route-jobs-label")}</h2>
          <p class="route-preview__summary">{t("page-jobs-summary")}</p>
        </header>

        <div class="dashboard-summary">
          <For each={JOB_SUMMARY_KEYS}>
            {(summaryKey) => (
              <article class="dashboard-summary__card">
                <p class="dashboard-summary__label">
                  {t(
                    `jobsSummary${summaryKey
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
              <h3 class="dashboard-panel__title">{t("jobsTableTitle")}</h3>
              <p class="dashboard-panel__body">{t("page-jobs-agenda")}</p>
            </div>
          </div>

          <div class="dashboard-table-wrap">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th>{t("jobsColumnId")}</th>
                  <th>{t("jobsColumnTitle")}</th>
                  <th>{t("jobsColumnSource")}</th>
                  <th>{t("jobsColumnStatus")}</th>
                  <th>{t("jobsColumnCreated")}</th>
                  <th>{t("jobsColumnActions")}</th>
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
                          {t(`jobsItem${job.id}Title`)}
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
                          {t("jobsActionInspect")}
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
              <p class="dashboard-detail__eyebrow">{t("jobsDetailEyebrow")}</p>
              <h3 class="dashboard-detail__title">
                {t(`jobsItem${activeJob().id}Title`)}
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

          <p class="dashboard-detail__body">{t(`jobsItem${activeJob().id}Body`)}</p>

          <dl class="dashboard-detail__meta-grid">
            <div>
              <dt>{t("jobsMetaCreated")}</dt>
              <dd>{activeJob().createdAt}</dd>
            </div>
            <div>
              <dt>{t("jobsMetaElapsed")}</dt>
              <dd>{t(`jobsItem${activeJob().id}Elapsed`)}</dd>
            </div>
            <div>
              <dt>{t("jobsMetaGuardrail")}</dt>
              <dd>{t("page-jobs-guardrail")}</dd>
            </div>
          </dl>

          <div class="dashboard-detail__actions">
            <button class="dashboard-detail__ghost" type="button">
              {t("jobsActionInspect")}
            </button>
            <button class="dashboard-detail__ghost" disabled type="button">
              {t("jobsActionRestart")}
            </button>
            <button class="dashboard-detail__ghost" disabled type="button">
              {t("jobsActionCancel")}
            </button>
          </div>
        </section>
      </div>
    </section>
  );
};
