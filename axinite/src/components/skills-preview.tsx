import { createMemo, createSignal, For, Show } from "solid-js";

import { useI18n } from "@/lib/i18n/provider";

type SkillId =
  | "rust_ownership"
  | "openapi_reference"
  | "code_review"
  | "frontend_a11y";
type SkillFormat = "single" | "bundle";
type SearchResultId = "react_patterns" | "python_typing" | "docker_compose";

type SkillRecord = {
  active: boolean;
  format: SkillFormat;
  id: SkillId;
  version: string;
};

type SearchResultRecord = {
  format: SkillFormat;
  id: SearchResultId;
  refs: number;
  assets: number;
  version: string;
};

const INSTALLED_SKILLS: SkillRecord[] = [
  { active: true, format: "single", id: "rust_ownership", version: "v1.0.0" },
  {
    active: true,
    format: "bundle",
    id: "openapi_reference",
    version: "v2.1.0",
  },
  { active: true, format: "single", id: "code_review", version: "v1.2.0" },
  { active: false, format: "bundle", id: "frontend_a11y", version: "v0.9.0" },
];

const SEARCH_RESULTS: SearchResultRecord[] = [
  {
    assets: 0,
    format: "bundle",
    id: "react_patterns",
    refs: 4,
    version: "v1.3.0",
  },
  {
    assets: 0,
    format: "single",
    id: "python_typing",
    refs: 0,
    version: "v2.0.0",
  },
  {
    assets: 1,
    format: "bundle",
    id: "docker_compose",
    refs: 2,
    version: "v1.1.0",
  },
];

const FORMAT_CLASS: Record<SkillFormat, string> = {
  bundle: "pill pill--violet",
  single: "pill pill--neutral",
};

export const SkillsPreview = () => {
  const { t } = useI18n();
  const [activeSkillId, setActiveSkillId] = createSignal<SkillId | null>(null);
  const [query, setQuery] = createSignal("");

  const activeSkill = () =>
    INSTALLED_SKILLS.find((skill) => skill.id === activeSkillId()) ?? null;

  const filteredResults = createMemo(() => {
    const term = query().trim().toLowerCase();
    if (term.length === 0) {
      return [];
    }

    return SEARCH_RESULTS.filter((result) => {
      const title = t(
        `skills-search-${result.id.replaceAll("_", "-")}-title`
      ).toLowerCase();
      const body = t(
        `skills-search-${result.id.replaceAll("_", "-")}-body`
      ).toLowerCase();
      return title.includes(term) || body.includes(term);
    });
  });

  const formatLabel = (format: SkillFormat) =>
    format === "bundle" ? t("skills-format-bundle") : t("skills-format-single");

  const assetSummary = (result: SearchResultRecord) => {
    if (result.format === "single") {
      return t("skills-search-single-summary");
    }

    return t("skills-search-bundle-summary", {
      assets: result.assets,
      refs: result.refs,
    });
  };

  const activeSkillFiles = createMemo(() => {
    const skill = activeSkill();

    if (!skill) {
      return [];
    }

    return [1, 2, 3, 4, 5, 6, 7, 8]
      .map((index) => {
        const key =
          `skills-item-${skill.id.replaceAll("_", "-")}-file-${index}` as const;
        const value = t(key);
        return value === key ? null : value;
      })
      .filter((value): value is string => value !== null);
  });

  return (
    <section class="route-preview route-preview--catalogue route-preview--skills">
      <div aria-hidden="true" class="route-preview__watermark">
        {t("skills-watermark")}
      </div>

      <div class="catalogue-preview catalogue-preview--skills">
        <header class="route-preview__intro catalogue-preview__intro skills-preview__intro">
          <p class="route-preview__eyebrow">{t("route-hero-eyebrow")}</p>
          <h2 class="route-preview__title">{t("route-skills-label")}</h2>
          <p class="route-preview__summary">{t("page-skills-summary")}</p>
        </header>

        <section class="catalogue-section skills-section skills-section--search">
          <div class="catalogue-section__header skills-section__header">
            <div>
              <h3 class="catalogue-section__title">
                {t("skills-search-title")}
              </h3>
              <p class="catalogue-section__body">{t("page-skills-agenda")}</p>
            </div>
          </div>

          <div class="catalogue-search skills-search">
            <div class="catalogue-form__row skills-search__row">
              <input
                class="catalogue-form__input"
                onInput={(event) => setQuery(event.currentTarget.value)}
                placeholder={t("skills-search-placeholder")}
                type="text"
                value={query()}
              />
              <button class="catalogue-form__button" type="button">
                {t("skills-search-action")}
              </button>
            </div>

            <div class="catalogue-search__results skills-search__results">
              <For each={filteredResults()}>
                {(result) => (
                  <article class="catalogue-search__result skills-search__result">
                    <div class="catalogue-search__header">
                      <div>
                        <h4 class="catalogue-card__title">
                          {t(
                            `skills-search-${result.id.replaceAll("_", "-")}-title`
                          )}
                        </h4>
                        <p class="catalogue-list__body">
                          {t(
                            `skills-search-${result.id.replaceAll("_", "-")}-body`
                          )}
                        </p>
                      </div>
                      <div class="catalogue-detail__pills">
                        <span class={FORMAT_CLASS[result.format]}>
                          {formatLabel(result.format)}
                        </span>
                        <span class="pill pill--neutral">{result.version}</span>
                      </div>
                    </div>
                    <p class="catalogue-search__meta">{assetSummary(result)}</p>
                  </article>
                )}
              </For>
            </div>
          </div>
        </section>

        <section class="catalogue-section skills-section">
          <div class="catalogue-section__header skills-section__header">
            <div>
              <h3 class="catalogue-section__title">
                {t("skills-installed-title")}
              </h3>
              <p class="catalogue-section__body">
                {t("page-skills-guardrail")}
              </p>
            </div>
          </div>

          <div class="catalogue-grid skills-grid">
            <For each={INSTALLED_SKILLS}>
              {(skill) => (
                <article
                  class={
                    activeSkillId() === skill.id
                      ? "catalogue-card catalogue-card--active skills-card"
                      : "catalogue-card skills-card"
                  }
                >
                  <div class="catalogue-card__header">
                    <div class="catalogue-card__title-wrap">
                      <h4 class="catalogue-card__title">
                        {t(
                          `skills-item-${skill.id.replaceAll("_", "-")}-title`
                        )}
                      </h4>
                      <span class={FORMAT_CLASS[skill.format]}>
                        {formatLabel(skill.format)}
                      </span>
                    </div>
                    <div class="catalogue-card__meta">
                      <span>{skill.version}</span>
                      <span
                        class={
                          skill.active
                            ? "catalogue-status-dot catalogue-status-dot--active"
                            : "catalogue-status-dot"
                        }
                      />
                    </div>
                  </div>

                  <p class="catalogue-card__body">
                    {t(`skills-item-${skill.id.replaceAll("_", "-")}-body`)}
                  </p>
                  <p class="catalogue-search__meta">
                    {t(
                      `skills-item-${skill.id.replaceAll("_", "-")}-bundle-summary`
                    )}
                  </p>

                  <div class="catalogue-card__actions">
                    <button
                      class="catalogue-card__action"
                      onClick={() => setActiveSkillId(skill.id)}
                      type="button"
                    >
                      {t("skills-action-view")}
                    </button>
                    <button
                      class="catalogue-card__action"
                      disabled
                      type="button"
                    >
                      {skill.active
                        ? t("skills-action-disable")
                        : t("skills-action-enable")}
                    </button>
                    <button
                      class="catalogue-card__action"
                      disabled
                      type="button"
                    >
                      {t("skills-action-remove")}
                    </button>
                  </div>
                </article>
              )}
            </For>
          </div>
        </section>

        <div class="catalogue-panel-grid skills-panel-grid">
          <section class="catalogue-panel skills-panel">
            <div class="catalogue-panel__mark">{t("skills-url-mark")}</div>
            <div class="catalogue-panel__content">
              <h3 class="catalogue-panel__title">{t("skills-url-title")}</h3>

              <div class="catalogue-form">
                <label class="catalogue-form__label" for="skills-url-name">
                  {t("skills-url-name-label")}
                </label>
                <input
                  class="catalogue-form__input"
                  id="skills-url-name"
                  placeholder={t("skills-url-name-placeholder")}
                  type="text"
                />
              </div>

              <div class="catalogue-form">
                <label class="catalogue-form__label" for="skills-url-input">
                  {t("skills-url-field-label")}
                </label>
                <div class="catalogue-form__row skills-search__row">
                  <input
                    class="catalogue-form__input"
                    id="skills-url-input"
                    placeholder={t("skills-url-placeholder")}
                    type="text"
                  />
                  <button class="catalogue-form__button" disabled type="button">
                    {t("skills-url-action")}
                  </button>
                </div>
              </div>

              <p class="catalogue-panel__hint">{t("skills-url-hint")}</p>
            </div>
          </section>

          <section class="catalogue-panel skills-panel">
            <div class="catalogue-panel__mark">{t("skills-upload-mark")}</div>
            <div class="catalogue-panel__content">
              <h3 class="catalogue-panel__title">{t("skills-upload-title")}</h3>

              <button class="catalogue-upload" type="button">
                <span class="catalogue-upload__title">
                  {t("skills-upload-drop-title")}
                </span>
                <span class="catalogue-upload__body">
                  {t("skills-upload-drop-body")}
                </span>
                <span class="catalogue-upload__meta">
                  {t("skills-upload-drop-meta")}
                </span>
              </button>

              <div class="catalogue-form__row skills-search__row">
                <input
                  class="catalogue-form__input"
                  placeholder={t("skills-upload-name-placeholder")}
                  type="text"
                />
                <button class="catalogue-form__button" disabled type="button">
                  {t("skills-upload-action")}
                </button>
              </div>

              <p class="catalogue-panel__hint">{t("skills-upload-hint")}</p>
            </div>
          </section>
        </div>

        <Show keyed when={activeSkill()}>
          {(skill) => (
            <section class="catalogue-detail skills-detail">
              <div class="catalogue-detail__header">
                <div>
                  <p class="catalogue-detail__eyebrow">
                    {t("skills-detail-eyebrow")}
                  </p>
                  <h3 class="catalogue-detail__title">
                    {t(`skills-item-${skill.id.replaceAll("_", "-")}-title`)}
                  </h3>
                </div>
                <div class="catalogue-detail__pills">
                  <span class={FORMAT_CLASS[skill.format]}>
                    {formatLabel(skill.format)}
                  </span>
                  <span class="pill pill--neutral">{skill.version}</span>
                </div>
              </div>

              <div class="skills-detail__layout">
                <div class="skills-detail__body-block">
                  <p class="catalogue-detail__body">
                    {t(`skills-item-${skill.id.replaceAll("_", "-")}-detail`)}
                  </p>
                </div>

                <div class="catalogue-files skills-detail__files">
                  <p class="catalogue-files__title">
                    {t("skills-files-title")}
                  </p>
                  <div class="catalogue-files__list skills-files__list">
                    <For each={activeSkillFiles()}>
                      {(value) => (
                        <div class="catalogue-files__item">{value}</div>
                      )}
                    </For>
                  </div>
                </div>
              </div>
            </section>
          )}
        </Show>
      </div>
    </section>
  );
};
