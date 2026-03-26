import { For, createSignal } from "solid-js";

import { useI18n } from "@/lib/i18n/provider";

type ExtensionId = "firecrawl" | "github" | "jmap" | "telegram";
type ExtensionKind = "mcp" | "wasm" | "grpcm";
type ExtensionTag =
  | "actions"
  | "read"
  | "read_write"
  | "triggers"
  | "events";

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
    descriptionKey: "extensionsToolScrapeBody",
    extensionId: "firecrawl",
    id: "scrape",
  },
  {
    descriptionKey: "extensionsToolCreateJobBody",
    extensionId: "core",
    id: "create_job",
  },
  {
    descriptionKey: "extensionsToolCrawlBody",
    extensionId: "firecrawl",
    id: "crawl",
  },
  {
    descriptionKey: "extensionsToolInfoBody",
    extensionId: "core",
    id: "extension_info",
  },
  {
    descriptionKey: "extensionsToolBrowserBody",
    extensionId: "firecrawl",
    id: "firecrawl_browser_session_create",
  },
];

const KIND_CLASS: Record<ExtensionKind, string> = {
  grpcm: "catalogue-pill catalogue-pill--info",
  mcp: "catalogue-pill catalogue-pill--success",
  wasm: "catalogue-pill catalogue-pill--warning",
};

const TAG_CLASS: Record<ExtensionTag, string> = {
  actions: "catalogue-pill catalogue-pill--success",
  events: "catalogue-pill catalogue-pill--violet",
  read: "catalogue-pill catalogue-pill--neutral",
  read_write: "catalogue-pill catalogue-pill--info",
  triggers: "catalogue-pill catalogue-pill--warning",
};

export const ExtensionsPreview = () => {
  const { t } = useI18n();
  const [activeExtensionId, setActiveExtensionId] =
    createSignal<ExtensionId>("firecrawl");

  const activeExtension = () =>
    EXTENSIONS.find((extension) => extension.id === activeExtensionId()) ??
    EXTENSIONS[0];

  const kindLabel = (kind: ExtensionKind) =>
    t(`extensionsKind${kind.slice(0, 1).toUpperCase()}${kind.slice(1)}`);

  const tagLabel = (tag: ExtensionTag) =>
    t(
      `extensionsTag${tag
        .split("_")
        .map((segment) => `${segment.slice(0, 1).toUpperCase()}${segment.slice(1)}`)
        .join("")}`
    );

  const sourceLabel = (extensionId: ExtensionId | "core") =>
    extensionId === "core"
      ? t("extensionsToolSourceCore")
      : t(`extensionsItem${extensionId}Title`);

  return (
    <section class="route-preview route-preview--catalogue route-preview--extensions">
      <div aria-hidden="true" class="route-preview__watermark">
        {t("extensionsWatermark")}
      </div>

      <div class="catalogue-preview catalogue-preview--extensions">
        <header class="route-preview__intro catalogue-preview__intro extensions-preview__intro">
          <p class="route-preview__eyebrow">{t("routeHeroEyebrow")}</p>
          <h2 class="route-preview__title">{t("route-extensions-label")}</h2>
          <p class="route-preview__summary">{t("page-extensions-summary")}</p>
        </header>

        <section class="catalogue-section catalogue-section--bare">
          <div class="catalogue-section__header extensions-preview__section-header">
            <div>
              <h3 class="catalogue-section__title">
                {t("extensionsInstalledTitle")}
              </h3>
              <p class="catalogue-section__body">{t("page-extensions-agenda")}</p>
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
                        {t(`extensionsItem${extension.id}Title`)}
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
                    {t(`extensionsItem${extension.id}Path`)}
                  </p>
                  <p class="catalogue-card__body">
                    {t(`extensionsItem${extension.id}Body`)}
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
                      {t("extensionsActionInspect")}
                    </button>
                    <button class="catalogue-card__action" disabled type="button">
                      {t("extensionsActionConfigure")}
                    </button>
                    <button class="catalogue-card__action" disabled type="button">
                      {t("extensionsActionDisable")}
                    </button>
                  </div>
                </article>
              )}
            </For>
          </div>

          <aside class="catalogue-detail catalogue-detail--inline extensions-detail">
            <div class="catalogue-detail__header">
              <div>
                <p class="catalogue-detail__eyebrow">{t("extensionsDetailEyebrow")}</p>
                <h3 class="catalogue-detail__title">
                  {t(`extensionsItem${activeExtension().id}Title`)}
                </h3>
              </div>
              <div class="catalogue-detail__pills">
                <span class={KIND_CLASS[activeExtension().kind]}>
                  {kindLabel(activeExtension().kind)}
                </span>
                <span class="catalogue-pill catalogue-pill--neutral">
                  {activeExtension().version}
                </span>
              </div>
            </div>

            <p class="catalogue-detail__body">
              {t(`extensionsItem${activeExtension().id}Detail`)}
            </p>

            <dl class="catalogue-detail__meta-grid">
              <div>
                <dt>{t("extensionsMetaPath")}</dt>
                <dd>{t(`extensionsItem${activeExtension().id}Path`)}</dd>
              </div>
              <div>
                <dt>{t("extensionsMetaConfig")}</dt>
                <dd>{t(`extensionsItem${activeExtension().id}Config`)}</dd>
              </div>
              <div>
                <dt>{t("extensionsMetaGuardrail")}</dt>
                <dd>{t("page-extensions-guardrail")}</dd>
              </div>
            </dl>
          </aside>
        </section>

        <div class="catalogue-panel-grid catalogue-panel-grid--extensions">
          <section class="catalogue-panel">
            <div class="catalogue-panel__mark">
              {t("extensionsWasmMark")}
            </div>
            <div class="catalogue-panel__content">
              <h3 class="catalogue-panel__title">{t("extensionsWasmTitle")}</h3>
              <p class="catalogue-panel__empty">{t("extensionsWasmEmpty")}</p>

              <div class="catalogue-form">
                <label class="catalogue-form__label" for="extensions-wasm-input">
                  {t("extensionsWasmFieldLabel")}
                </label>
                <div class="catalogue-form__row">
                  <input
                    class="catalogue-form__input"
                    id="extensions-wasm-input"
                    placeholder={t("extensionsWasmPlaceholder")}
                    type="text"
                  />
                  <button class="catalogue-form__button" disabled type="button">
                    {t("extensionsWasmAction")}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section class="catalogue-panel">
            <div class="catalogue-panel__mark">
              {t("extensionsMcpMark")}
            </div>
            <div class="catalogue-panel__content">
              <h3 class="catalogue-panel__title">{t("extensionsMcpTitle")}</h3>
              <p class="catalogue-panel__empty">{t("extensionsMcpEmpty")}</p>

              <div class="catalogue-form">
                <label class="catalogue-form__label" for="extensions-mcp-input">
                  {t("extensionsMcpFieldLabel")}
                </label>
                <div class="catalogue-form__row">
                  <input
                    class="catalogue-form__input"
                    id="extensions-mcp-input"
                    placeholder={t("extensionsMcpPlaceholder")}
                    type="text"
                  />
                  <button class="catalogue-form__button" disabled type="button">
                    {t("extensionsMcpAction")}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section class="catalogue-section catalogue-section--bare">
          <div class="catalogue-section__header extensions-preview__section-header">
            <div>
              <h3 class="catalogue-section__title">{t("extensionsToolsTitle")}</h3>
              <p class="catalogue-section__body">{t("page-extensions-guardrail")}</p>
            </div>
          </div>

          <div class="catalogue-list catalogue-list--extensions">
            <For each={REGISTERED_TOOLS}>
              {(tool) => (
                <article class="catalogue-list__row">
                  <div class="catalogue-list__key">{tool.id}</div>
                  <div class="catalogue-list__content">
                    <p class="catalogue-list__source">
                      {t("extensionsToolsSourceLabel")}:{" "}
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
