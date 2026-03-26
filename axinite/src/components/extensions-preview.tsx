import { createSignal, For } from "solid-js";

import { useI18n } from "@/lib/i18n/provider";
import { capitalise, pascalCase } from "@/lib/string-case";

type ExtensionId = "firecrawl" | "github" | "jmap" | "telegram";
type ExtensionKind = "mcp" | "wasm" | "grpcm";
type ExtensionTag = "actions" | "read" | "read_write" | "triggers" | "events";

type ExtensionRecord = {
  active: boolean;
  id: ExtensionId;
  kind: ExtensionKind;
  tags: ExtensionTag[];
  version: string;
};

type ToolRecord = {
  descriptionKey: string;
  extensionId: ExtensionId | "core";
  id: string;
};

const EXTENSIONS: ExtensionRecord[] = [
  {
    active: true,
    id: "firecrawl",
    kind: "mcp",
    tags: ["actions", "read"],
    version: "v3.1",
  },
  {
    active: true,
    id: "github",
    kind: "wasm",
    tags: ["actions", "read_write"],
    version: "v0.1.3",
  },
  {
    active: true,
    id: "jmap",
    kind: "wasm",
    tags: ["actions", "read_write"],
    version: "v0.1",
  },
  {
    active: true,
    id: "telegram",
    kind: "grpcm",
    tags: ["actions", "read_write", "triggers", "events"],
    version: "v0.2.3",
  },
];

const REGISTERED_TOOLS: ToolRecord[] = [
  {
    descriptionKey: "extensions-tool-scrape-body",
    extensionId: "firecrawl",
    id: "scrape",
  },
  {
    descriptionKey: "extensions-tool-create-job-body",
    extensionId: "core",
    id: "create_job",
  },
  {
    descriptionKey: "extensions-tool-crawl-body",
    extensionId: "firecrawl",
    id: "crawl",
  },
  {
    descriptionKey: "extensions-tool-info-body",
    extensionId: "core",
    id: "extension_info",
  },
  {
    descriptionKey: "extensions-tool-browser-body",
    extensionId: "firecrawl",
    id: "firecrawl_browser_session_create",
  },
];

const KIND_CLASS: Record<ExtensionKind, string> = {
  grpcm: "pill pill--info",
  mcp: "pill pill--success",
  wasm: "pill pill--warning",
};

const TAG_CLASS: Record<ExtensionTag, string> = {
  actions: "pill pill--success",
  events: "pill pill--violet",
  read: "pill pill--neutral",
  read_write: "pill pill--info",
  triggers: "pill pill--warning",
};

export const ExtensionsPreview = () => {
  const { t } = useI18n();
  const [activeExtensionId, setActiveExtensionId] =
    createSignal<ExtensionId>("firecrawl");

  const activeExtension = () =>
    EXTENSIONS.find((extension) => extension.id === activeExtensionId()) ??
    EXTENSIONS[0];

  const kindLabel = (kind: ExtensionKind) =>
    t(`extensions-kind-${capitalise(kind).toLowerCase()}`);

  const tagLabel = (tag: ExtensionTag) =>
    t(
      `extensions-tag-${pascalCase(tag)
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()
        .replace(/^-/, "")}`
    );

  const sourceLabel = (extensionId: ExtensionId | "core") =>
    extensionId === "core"
      ? t("extensions-tool-source-core")
      : t(`extensions-item-${extensionId}-title`);

  return (
    <section class="route-preview route-preview--catalogue route-preview--extensions">
      <div aria-hidden="true" class="route-preview__watermark">
        {t("extensions-watermark")}
      </div>

      <div class="catalogue-preview catalogue-preview--extensions">
        <header class="route-preview__intro catalogue-preview__intro extensions-preview__intro">
          <p class="route-preview__eyebrow">{t("route-hero-eyebrow")}</p>
          <h2 class="route-preview__title">{t("route-extensions-label")}</h2>
          <p class="route-preview__summary">{t("page-extensions-summary")}</p>
        </header>

        <section class="catalogue-section catalogue-section--bare">
          <div class="catalogue-section__header extensions-preview__section-header">
            <div>
              <h3 class="catalogue-section__title">
                {t("extensions-installed-title")}
              </h3>
              <p class="catalogue-section__body">
                {t("page-extensions-agenda")}
              </p>
            </div>
          </div>

          <div class="catalogue-grid catalogue-grid--extensions">
            <For each={EXTENSIONS}>
              {(extension) => (
                <article
                  class={
                    activeExtensionId() === extension.id
                      ? "catalogue-card catalogue-card--active extensions-card"
                      : "catalogue-card extensions-card"
                  }
                >
                  <div class="catalogue-card__header">
                    <div class="catalogue-card__title-wrap">
                      <h4 class="catalogue-card__title">
                        {t(`extensions-item-${extension.id}-title`)}
                      </h4>
                      <span class={KIND_CLASS[extension.kind]}>
                        {kindLabel(extension.kind)}
                      </span>
                    </div>
                    <div class="catalogue-card__meta">
                      <span>{extension.version}</span>
                      <span
                        class={
                          extension.active
                            ? "catalogue-status-dot catalogue-status-dot--active"
                            : "catalogue-status-dot"
                        }
                      />
                    </div>
                  </div>

                  <p class="catalogue-card__path">
                    {t(`extensions-item-${extension.id}-path`)}
                  </p>
                  <p class="catalogue-card__body">
                    {t(`extensions-item-${extension.id}-body`)}
                  </p>

                  <div class="catalogue-card__tags">
                    <For each={extension.tags}>
                      {(tag) => (
                        <span class={TAG_CLASS[tag]}>{tagLabel(tag)}</span>
                      )}
                    </For>
                  </div>

                  <div class="catalogue-card__actions">
                    <button
                      class="catalogue-card__action"
                      onClick={() => setActiveExtensionId(extension.id)}
                      type="button"
                    >
                      {t("extensions-action-inspect")}
                    </button>
                    <button
                      class="catalogue-card__action"
                      disabled
                      type="button"
                    >
                      {t("extensions-action-configure")}
                    </button>
                    <button
                      class="catalogue-card__action"
                      disabled
                      type="button"
                    >
                      {t("extensions-action-disable")}
                    </button>
                  </div>
                </article>
              )}
            </For>
          </div>

          <aside class="catalogue-detail catalogue-detail--inline extensions-detail">
            <div class="catalogue-detail__header">
              <div>
                <p class="catalogue-detail__eyebrow">
                  {t("extensions-detail-eyebrow")}
                </p>
                <h3 class="catalogue-detail__title">
                  {t(`extensions-item-${activeExtension().id}-title`)}
                </h3>
              </div>
              <div class="catalogue-detail__pills">
                <span class={KIND_CLASS[activeExtension().kind]}>
                  {kindLabel(activeExtension().kind)}
                </span>
                <span class="pill pill--neutral">
                  {activeExtension().version}
                </span>
              </div>
            </div>

            <p class="catalogue-detail__body">
              {t(`extensions-item-${activeExtension().id}-detail`)}
            </p>

            <dl class="catalogue-detail__meta-grid">
              <div>
                <dt>{t("extensions-meta-path")}</dt>
                <dd>{t(`extensions-item-${activeExtension().id}-path`)}</dd>
              </div>
              <div>
                <dt>{t("extensions-meta-config")}</dt>
                <dd>{t(`extensions-item-${activeExtension().id}-config`)}</dd>
              </div>
              <div>
                <dt>{t("extensions-meta-guardrail")}</dt>
                <dd>{t("page-extensions-guardrail")}</dd>
              </div>
            </dl>
          </aside>
        </section>

        <div class="catalogue-panel-grid catalogue-panel-grid--extensions">
          <section class="catalogue-panel">
            <div class="catalogue-panel__mark">{t("extensions-wasm-mark")}</div>
            <div class="catalogue-panel__content">
              <h3 class="catalogue-panel__title">
                {t("extensions-wasm-title")}
              </h3>
              <p class="catalogue-panel__empty">{t("extensions-wasm-empty")}</p>

              <div class="catalogue-form">
                <label
                  class="catalogue-form__label"
                  for="extensions-wasm-input"
                >
                  {t("extensions-wasm-field-label")}
                </label>
                <div class="catalogue-form__row">
                  <input
                    class="catalogue-form__input"
                    id="extensions-wasm-input"
                    placeholder={t("extensions-wasm-placeholder")}
                    type="text"
                  />
                  <button class="catalogue-form__button" disabled type="button">
                    {t("extensions-wasm-action")}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section class="catalogue-panel">
            <div class="catalogue-panel__mark">{t("extensions-mcp-mark")}</div>
            <div class="catalogue-panel__content">
              <h3 class="catalogue-panel__title">
                {t("extensions-mcp-title")}
              </h3>
              <p class="catalogue-panel__empty">{t("extensions-mcp-empty")}</p>

              <div class="catalogue-form">
                <label class="catalogue-form__label" for="extensions-mcp-input">
                  {t("extensions-mcp-field-label")}
                </label>
                <div class="catalogue-form__row">
                  <input
                    class="catalogue-form__input"
                    id="extensions-mcp-input"
                    placeholder={t("extensions-mcp-placeholder")}
                    type="text"
                  />
                  <button class="catalogue-form__button" disabled type="button">
                    {t("extensions-mcp-action")}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section class="catalogue-section catalogue-section--bare">
          <div class="catalogue-section__header extensions-preview__section-header">
            <div>
              <h3 class="catalogue-section__title">
                {t("extensions-tools-title")}
              </h3>
              <p class="catalogue-section__body">
                {t("page-extensions-guardrail")}
              </p>
            </div>
          </div>

          <div class="catalogue-list catalogue-list--extensions">
            <For each={REGISTERED_TOOLS}>
              {(tool) => (
                <article class="catalogue-list__row">
                  <div class="catalogue-list__key">{tool.id}</div>
                  <div class="catalogue-list__content">
                    <p class="catalogue-list__source">
                      {t("extensions-tools-source-label")}:{" "}
                      {sourceLabel(tool.extensionId)}
                    </p>
                    <p class="catalogue-list__body">{t(tool.descriptionKey)}</p>
                  </div>
                </article>
              )}
            </For>
          </div>
        </section>
      </div>
    </section>
  );
};
