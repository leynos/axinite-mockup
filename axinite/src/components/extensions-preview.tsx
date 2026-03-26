import {
  createMutation,
  createQuery,
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
  removeExtension,
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
  const [activeExtensionName, setActiveExtensionName] = createSignal<string>();
  const [registryQuery, setRegistryQuery] = createSignal("");
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

  createEffect(() => {
    const firstName = extensions.data?.extensions[0]?.name;
    if (!activeExtensionName() && firstName) {
      setActiveExtensionName(firstName);
    }
  });

  const activeExtension = createMemo<ExtensionInfo | null>(
    () =>
      extensions.data?.extensions.find(
        (extension) => extension.name === activeExtensionName()
      ) ?? null
  );

  const setup = createQuery(() => ({
    queryKey: ["extensions", "setup", activeExtensionName()],
    queryFn: () => fetchExtensionSetup(activeExtensionName() ?? ""),
    enabled: typeof activeExtensionName() === "string",
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
    mutationFn: () => activateExtension(activeExtensionName() ?? ""),
    onSuccess: refresh,
  }));

  const removeMutation = createMutation(() => ({
    mutationFn: () => removeExtension(activeExtensionName() ?? ""),
    onSuccess: refresh,
  }));

  const setupMutation = createMutation(() => ({
    mutationFn: () =>
      submitExtensionSetup(activeExtensionName() ?? "", {
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
                <article
                  class={
                    activeExtensionName() === extension.name
                      ? "catalogue-card catalogue-card--active extensions-card"
                      : "catalogue-card extensions-card"
                  }
                >
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
                      <span>{extension.version ?? "preview"}</span>
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
                    {extension.url ?? "Local preview"}
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
                      onClick={() => setActiveExtensionName(extension.name)}
                      type="button"
                    >
                      {t("extensions-action-inspect")}
                    </button>
                    <button
                      class="catalogue-card__action"
                      onClick={() => setActiveExtensionName(extension.name)}
                      type="button"
                    >
                      {t("extensions-action-configure")}
                    </button>
                    <button
                      class="catalogue-card__action"
                      onClick={() => setActiveExtensionName(extension.name)}
                      type="button"
                    >
                      {extension.active
                        ? t("extensions-action-disable")
                        : "Activate"}
                    </button>
                  </div>
                </article>
              )}
            </For>
          </div>

          <Show when={activeExtension()}>
            {(extension) => (
              <aside class="catalogue-detail catalogue-detail--inline extensions-detail">
                <div class="catalogue-detail__header">
                  <div>
                    <p class="catalogue-detail__eyebrow">
                      {t("extensions-detail-eyebrow")}
                    </p>
                    <h3 class="catalogue-detail__title">
                      {extension().display_name ?? extension().name}
                    </h3>
                  </div>
                  <div class="catalogue-detail__pills">
                    <span
                      class={
                        KIND_CLASS[extension().kind] ?? "pill pill--neutral"
                      }
                    >
                      {extension().kind}
                    </span>
                    <span class="pill pill--neutral">
                      {extension().version ?? "preview"}
                    </span>
                  </div>
                </div>

                <p class="catalogue-detail__body">{extension().description}</p>

                <dl class="catalogue-detail__meta-grid">
                  <div>
                    <dt>{t("extensions-meta-path")}</dt>
                    <dd>{extension().url ?? "Local preview"}</dd>
                  </div>
                  <div>
                    <dt>{t("extensions-meta-config")}</dt>
                    <dd>
                      {extension().needs_setup
                        ? "Setup values required"
                        : "No setup needed"}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("extensions-meta-guardrail")}</dt>
                    <dd>{t("page-extensions-guardrail")}</dd>
                  </div>
                </dl>

                <div class="dashboard-detail__actions">
                  <button
                    class="dashboard-detail__ghost"
                    type="button"
                    onClick={() => activateMutation.mutate()}
                  >
                    {extension().active ? "Re-activate" : "Activate"}
                  </button>
                  <button
                    class="dashboard-detail__ghost"
                    type="button"
                    onClick={() => setupMutation.mutate()}
                  >
                    Save setup
                  </button>
                  <button
                    class="dashboard-detail__ghost"
                    type="button"
                    onClick={() => removeMutation.mutate()}
                  >
                    Remove
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
                  Search registry
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
                        {entry.installed ? "Installed" : "Install"}
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
              <For each={setup.data?.secrets ?? []}>
                {(field) => (
                  <div class="catalogue-form">
                    <label
                      class="catalogue-form__label"
                      for={`setup-${field.name}`}
                    >
                      {field.prompt}
                    </label>
                    <div class="catalogue-form__row">
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
                          field.provided ? "Stored value present" : field.prompt
                        }
                        type="text"
                      />
                    </div>
                  </div>
                )}
              </For>
              <button
                class="catalogue-form__button"
                type="button"
                onClick={() => setupMutation.mutate()}
              >
                Save setup
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
                      {tool.name.includes("_") ? "Mock tool" : "Core tool"}
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
