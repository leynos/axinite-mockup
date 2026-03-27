import {
  createMutation,
  createQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/solid-query";
import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import type { ExtensionInfo } from "@/lib/api/contracts";
import {
  activateExtension,
  fetchExtensionRegistry,
  fetchExtensionSetup,
  fetchExtensions,
  fetchExtensionTools,
  installExtension,
  submitExtensionSetup,
} from "@/lib/api/extensions";
import { useI18n } from "@/lib/i18n/provider";
import { capitalise, pascalCase } from "@/lib/string-case";

const KIND_CLASS: Record<string, string> = {
  grpcm: "pill pill--info",
  mcp: "pill pill--success",
  wasm: "pill pill--warning",
};

const STATUS_CLASS: Record<string, string> = {
  active: "catalogue-status-dot catalogue-status-dot--active",
  inactive: "catalogue-status-dot",
};

export const ExtensionsPreview = () => {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [configuringName, setConfiguringName] = createSignal<string>();
  const [registryQuery, setRegistryQuery] = createSignal("");
  const [mcpServerName, setMcpServerName] = createSignal("");
  const [setupValues, setSetupValues] = createSignal<Record<string, string>>(
    {}
  );

  const extensions = createQuery(() => ({
    queryKey: ["extensions", "list"],
    queryFn: fetchExtensions,
  }));

  const tools = createQuery(() => ({
    queryKey: ["extensions", "tools"],
    queryFn: fetchExtensionTools,
  }));

  const registry = createQuery(() => ({
    queryKey: ["extensions", "registry", registryQuery().trim()],
    queryFn: () => fetchExtensionRegistry(registryQuery().trim()),
  }));

  const mcpExtensions = createMemo(
    () =>
      extensions.data?.extensions.filter(
        (extension) => extension.kind === "mcp"
      ) ?? []
  );

  const activeExtension = createMemo<ExtensionInfo | null>(
    () =>
      extensions.data?.extensions.find(
        (extension) => extension.name === configuringName()
      ) ?? null
  );

  const setup = createQuery(() => ({
    queryKey: ["extensions", "setup", configuringName()],
    queryFn: () => fetchExtensionSetup(configuringName() ?? ""),
    enabled: typeof configuringName() === "string",
    placeholderData: keepPreviousData,
  }));

  createEffect(() => {
    const nextValues = Object.fromEntries(
      (setup.data?.secrets ?? []).map((field) => [field.name, ""])
    );
    setSetupValues(nextValues);
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["extensions"] });
  };

  const installMutation = createMutation(() => ({
    mutationFn: (name: string) => installExtension(name),
    onSuccess: refresh,
  }));

  const activateMutation = createMutation(() => ({
    mutationFn: (name: string) => activateExtension(name),
    onSuccess: refresh,
  }));

  const setupMutation = createMutation(() => ({
    mutationFn: () =>
      submitExtensionSetup(configuringName() ?? "", {
        secrets: setupValues(),
      }),
    onSuccess: refresh,
  }));

  const tagList = (extension: ExtensionInfo) => {
    const tags = [
      extension.active ? "actions" : "read",
      extension.authenticated ? "read_write" : "triggers",
    ];
    if (extension.has_auth) {
      tags.push("events");
    }
    return tags;
  };

  const tagLabel = (tag: string) =>
    t(
      `extensions-tag-${pascalCase(tag)
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()
        .replace(/^-/, "")}`
    );

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
            <For each={extensions.data?.extensions ?? []}>
              {(extension) => (
                <article class="catalogue-card extensions-card">
                  <div class="catalogue-card__header">
                    <div class="catalogue-card__title-wrap">
                      <h4 class="catalogue-card__title">
                        {extension.display_name ?? extension.name}
                      </h4>
                      <span
                        class={
                          KIND_CLASS[extension.kind] ?? "pill pill--neutral"
                        }
                      >
                        {capitalise(extension.kind).toLowerCase()}
                      </span>
                    </div>
                    <div class="catalogue-card__meta">
                      <span>
                        {extension.version ?? t("extensions-version-preview")}
                      </span>
                      <span
                        class={
                          extension.active
                            ? STATUS_CLASS.active
                            : STATUS_CLASS.inactive
                        }
                      />
                    </div>
                  </div>

                  <p class="catalogue-card__path">
                    {extension.url ?? t("extensions-url-local")}
                  </p>
                  <p class="catalogue-card__body">{extension.description}</p>

                  <div class="catalogue-card__tags">
                    <For each={tagList(extension)}>
                      {(tag) => (
                        <span class="pill pill--neutral">{tagLabel(tag)}</span>
                      )}
                    </For>
                  </div>

                  <div class="catalogue-card__actions">
                    <button
                      class="catalogue-card__action"
                      onClick={() => setConfiguringName(extension.name)}
                      type="button"
                    >
                      {t("extensions-action-configure")}
                    </button>
                    <button
                      class="catalogue-card__action"
                      onClick={() => activateMutation.mutate(extension.name)}
                      type="button"
                    >
                      {extension.active
                        ? t("extensions-action-disable")
                        : t("extensions-action-activate")}
                    </button>
                  </div>
                </article>
              )}
            </For>
          </div>

          <Show when={activeExtension()}>
            {(extension) => (
              <aside class="catalogue-detail catalogue-detail--inline extensions-detail">
                <h3 class="catalogue-detail__title">
                  {t("extensions-configure-title", {
                    name: extension().name,
                  })}
                </h3>

                <For each={setup.data?.secrets ?? []}>
                  {(field) => (
                    <div class="catalogue-form">
                      <label
                        class="catalogue-form__label"
                        for={`setup-${field.name}`}
                      >
                        {field.prompt}
                      </label>
                      <div class="catalogue-form__row catalogue-form__row--indicator">
                        <input
                          class="catalogue-form__input"
                          id={`setup-${field.name}`}
                          onInput={(event) =>
                            setSetupValues((current) => ({
                              ...current,
                              [field.name]: event.currentTarget.value,
                            }))
                          }
                          placeholder={
                            field.provided
                              ? t("extensions-setup-provided-hint")
                              : field.prompt
                          }
                          type="text"
                        />
                        <Show when={field.provided}>
                          <span
                            class="catalogue-form__provided-icon"
                            role="img"
                            aria-label={t("extensions-setup-stored")}
                          >
                            ✓
                          </span>
                        </Show>
                      </div>
                    </div>
                  )}
                </For>

                <Show when={(setup.data?.secrets ?? []).length === 0}>
                  <p class="catalogue-panel__empty">
                    {t("extensions-setup-none")}
                  </p>
                </Show>

                <div class="dashboard-detail__actions">
                  <button
                    class="dashboard-detail__ghost"
                    type="button"
                    onClick={() => setupMutation.mutate()}
                  >
                    {t("extensions-action-save")}
                  </button>
                  <button
                    class="dashboard-detail__ghost dashboard-detail__ghost--danger"
                    type="button"
                    onClick={() => setConfiguringName(undefined)}
                  >
                    {t("extensions-action-cancel")}
                  </button>
                </div>
              </aside>
            )}
          </Show>
        </section>

        <div class="catalogue-panel-grid catalogue-panel-grid--extensions">
          <section class="catalogue-panel">
            <div class="catalogue-panel__mark">{t("extensions-wasm-mark")}</div>
            <div class="catalogue-panel__content">
              <h3 class="catalogue-panel__title">
                {t("extensions-wasm-title")}
              </h3>
              <div class="catalogue-form">
                <label
                  class="catalogue-form__label"
                  for="extensions-registry-search"
                >
                  {t("extensions-registry-label")}
                </label>
                <div class="catalogue-form__row">
                  <input
                    class="catalogue-form__input"
                    id="extensions-registry-search"
                    onInput={(event) =>
                      setRegistryQuery(event.currentTarget.value)
                    }
                    placeholder={t("extensions-wasm-placeholder")}
                    type="text"
                    value={registryQuery()}
                  />
                </div>
              </div>
              <div class="catalogue-list catalogue-list--extensions">
                <For each={registry.data?.entries ?? []}>
                  {(entry) => (
                    <article class="catalogue-list__row">
                      <div class="catalogue-list__key">{entry.kind}</div>
                      <div class="catalogue-list__content">
                        <p class="catalogue-list__source">
                          {entry.display_name}
                        </p>
                        <p class="catalogue-list__body">{entry.description}</p>
                      </div>
                      <button
                        class="catalogue-card__action"
                        type="button"
                        onClick={() => installMutation.mutate(entry.name)}
                        disabled={entry.installed}
                      >
                        {entry.installed
                          ? t("extensions-action-installed")
                          : t("extensions-action-install")}
                      </button>
                    </article>
                  )}
                </For>
              </div>
            </div>
          </section>

          <section class="catalogue-panel">
            <div class="catalogue-panel__mark">{t("extensions-mcp-mark")}</div>
            <div class="catalogue-panel__content">
              <h3 class="catalogue-panel__title">
                {t("extensions-mcp-title")}
              </h3>
              <Show
                when={mcpExtensions().length > 0}
                fallback={
                  <p class="catalogue-panel__empty">
                    {t("extensions-mcp-empty")}
                  </p>
                }
              >
                <div class="catalogue-list catalogue-list--extensions">
                  <For each={mcpExtensions()}>
                    {(ext) => (
                      <article class="catalogue-list__row">
                        <div class="catalogue-list__key">
                          {ext.display_name ?? ext.name}
                        </div>
                        <div class="catalogue-list__content">
                          <p class="catalogue-list__source">
                            {ext.url ?? t("extensions-url-local")}
                          </p>
                        </div>
                      </article>
                    )}
                  </For>
                </div>
              </Show>
              <h4 class="catalogue-panel__subtitle">
                {t("extensions-mcp-add-title")}
              </h4>
              <div class="catalogue-form">
                <label class="catalogue-form__label" for="mcp-server-name">
                  {t("extensions-mcp-field-label")}
                </label>
                <div class="catalogue-form__row">
                  <input
                    class="catalogue-form__input"
                    id="mcp-server-name"
                    onInput={(event) =>
                      setMcpServerName(event.currentTarget.value)
                    }
                    placeholder={t("extensions-mcp-placeholder")}
                    type="text"
                    value={mcpServerName()}
                  />
                </div>
              </div>
              <button
                class="catalogue-form__button"
                type="button"
                onClick={() => {
                  const name = mcpServerName().trim();
                  if (name) {
                    installMutation.mutate(name);
                    setMcpServerName("");
                  }
                }}
              >
                {t("extensions-mcp-action")}
              </button>
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
            <For each={tools.data?.tools ?? []}>
              {(tool) => (
                <article class="catalogue-list__row">
                  <div class="catalogue-list__key">{tool.name}</div>
                  <div class="catalogue-list__content">
                    <p class="catalogue-list__source">
                      {tool.name.includes("_")
                        ? t("extensions-tool-source-mock")
                        : t("extensions-tool-source-core")}
                    </p>
                    <p class="catalogue-list__body">{tool.description}</p>
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
