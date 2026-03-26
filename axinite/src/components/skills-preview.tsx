import { For, Show, createMemo, createSignal } from "solid-js";

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
  { active: true, format: "bundle", id: "openapi_reference", version: "v2.1.0" },
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
  bundle: "catalogue-pill catalogue-pill--violet",
  single: "catalogue-pill catalogue-pill--neutral",
};

export const SkillsPreview = () => {
  const { t } = useI18n();
  const [activeSkillId, setActiveSkillId] =
    createSignal<SkillId | null>(null);
  const [query, setQuery] = createSignal("");

  const activeSkill = () =>
    INSTALLED_SKILLS.find((skill) => skill.id === activeSkillId()) ?? null;

  const filteredResults = createMemo(() => {
    const term = query().trim().toLowerCase();
    if (term.length === 0) {
      return [];
    }

    return SEARCH_RESULTS.filter((result) => {
      const title = t(`skillsSearch${result.id}Title`).toLowerCase();
      const body = t(`skillsSearch${result.id}Body`).toLowerCase();
      return title.includes(term) || body.includes(term);
    });
  });

  const formatLabel = (format: SkillFormat) =>
    format === "bundle" ? t("skillsFormatBundle") : t("skillsFormatSingle");

  const assetSummary = (result: SearchResultRecord) => {
    if (result.format === "single") {
      return t("skillsSearchSingleSummary");
    }

    return t("skillsSearchBundleSummary", {
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
        const key = `skillsItem${skill.id}File${index}` as const;
        const value = t(key);
        return value === key ? null : value;
      })
      .filter((value): value is string => value !== null);
  });

  return (
    <section class="route-preview route-preview--catalogue route-preview--skills">
      <div aria-hidden="true" class="route-preview__watermark">
        {t("skillsWatermark")}
      </div>

      <div class="catalogue-preview catalogue-preview--skills">
        <header class="route-preview__intro catalogue-preview__intro skills-preview__intro">
          <p class="route-preview__eyebrow">{t("routeHeroEyebrow")}</p>
          <h2 class="route-preview__title">{t("route-skills-label")}</h2>
          <p class="route-preview__summary">{t("page-skills-summary")}</p>
        </header>

        <section class="catalogue-section skills-section skills-section--search">
          <div class="catalogue-section__header skills-section__header">
            <div>
              <h3 class="catalogue-section__title">{t("skillsSearchTitle")}</h3>
              <p class="catalogue-section__body">{t("page-skills-agenda")}</p>
            </div>
          </div>

          <div class="catalogue-search skills-search">
            <div class="catalogue-form__row skills-search__row">
              <input
                class="catalogue-form__input"
                onInput={(event) => setQuery(event.currentTarget.value)}
                placeholder={t("skillsSearchPlaceholder")}
                type="text"
                value={query()}
              />
              <button class="catalogue-form__button" type="button">
                {t("skillsSearchAction")}
              </button>
            </div>

            <div class="catalogue-search__results skills-search__results">
              <For each={filteredResults()}>
                {(result) => (
                  <article class="catalogue-search__result skills-search__result">
                    <div class="catalogue-search__header">
                      <div>
                        <h4 class="catalogue-card__title">
                          {t(`skillsSearch${result.id}Title`)}
                        </h4>
                        <p class="catalogue-list__body">
                          {t(`skillsSearch${result.id}Body`)}
                        </p>
                      </div>
                      <div class="catalogue-detail__pills">
                        <span class={FORMAT_CLASS[result.format]}>
                          {formatLabel(result.format)}
                        </span>
                        <span class="catalogue-pill catalogue-pill--neutral">
                          {result.version}
                        </span>
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
                {t("skillsInstalledTitle")}
              </h3>
              <p class="catalogue-section__body">{t("page-skills-guardrail")}</p>
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
                        {t(`skillsItem${skill.id}Title`)}
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
                    {t(`skillsItem${skill.id}Body`)}
                  </p>
                  <p class="catalogue-search__meta">
                    {t(`skillsItem${skill.id}BundleSummary`)}
                  </p>

                  <div class="catalogue-card__actions">
                    <button
                      class="catalogue-card__action"
                      onClick={() => setActiveSkillId(skill.id)}
                      type="button"
                    >
                      {t("skillsActionView")}
                    </button>
                    <button class="catalogue-card__action" disabled type="button">
                      {skill.active
                        ? t("skillsActionDisable")
                        : t("skillsActionEnable")}
                    </button>
                    <button class="catalogue-card__action" disabled type="button">
                      {t("skillsActionRemove")}
                    </button>
                  </div>
                </article>
              )}
            </For>
          </div>
        </section>

        <div class="catalogue-panel-grid skills-panel-grid">
          <section class="catalogue-panel skills-panel">
            <div class="catalogue-panel__mark">{t("skillsUrlMark")}</div>
            <div class="catalogue-panel__content">
              <h3 class="catalogue-panel__title">{t("skillsUrlTitle")}</h3>

              <div class="catalogue-form">
                <label class="catalogue-form__label" for="skills-url-name">
                  {t("skillsUrlNameLabel")}
                </label>
                <input
                  class="catalogue-form__input"
                  id="skills-url-name"
                  placeholder={t("skillsUrlNamePlaceholder")}
                  type="text"
                />
              </div>

              <div class="catalogue-form">
                <label class="catalogue-form__label" for="skills-url-input">
                  {t("skillsUrlFieldLabel")}
                </label>
                <div class="catalogue-form__row skills-search__row">
                  <input
                    class="catalogue-form__input"
                    id="skills-url-input"
                    placeholder={t("skillsUrlPlaceholder")}
                    type="text"
                  />
                  <button class="catalogue-form__button" disabled type="button">
                    {t("skillsUrlAction")}
                  </button>
                </div>
              </div>

              <p class="catalogue-panel__hint">{t("skillsUrlHint")}</p>
            </div>
          </section>

          <section class="catalogue-panel skills-panel">
            <div class="catalogue-panel__mark">{t("skillsUploadMark")}</div>
            <div class="catalogue-panel__content">
              <h3 class="catalogue-panel__title">{t("skillsUploadTitle")}</h3>

              <button class="catalogue-upload" type="button">
                <span class="catalogue-upload__title">
                  {t("skillsUploadDropTitle")}
                </span>
                <span class="catalogue-upload__body">
                  {t("skillsUploadDropBody")}
                </span>
                <span class="catalogue-upload__meta">
                  {t("skillsUploadDropMeta")}
                </span>
              </button>

              <div class="catalogue-form__row skills-search__row">
                <input
                  class="catalogue-form__input"
                  placeholder={t("skillsUploadNamePlaceholder")}
                  type="text"
                />
                <button class="catalogue-form__button" disabled type="button">
                  {t("skillsUploadAction")}
                </button>
              </div>

              <p class="catalogue-panel__hint">{t("skillsUploadHint")}</p>
            </div>
          </section>
        </div>

        <Show keyed when={activeSkill()}>
          {(skill) => (
            <section class="catalogue-detail skills-detail">
              <div class="catalogue-detail__header">
                <div>
                  <p class="catalogue-detail__eyebrow">{t("skillsDetailEyebrow")}</p>
                  <h3 class="catalogue-detail__title">
                    {t(`skillsItem${skill.id}Title`)}
                  </h3>
                </div>
                <div class="catalogue-detail__pills">
                  <span class={FORMAT_CLASS[skill.format]}>
                    {formatLabel(skill.format)}
                  </span>
                  <span class="catalogue-pill catalogue-pill--neutral">
                    {skill.version}
                  </span>
                </div>
              </div>

              <div class="skills-detail__layout">
                <div class="skills-detail__body-block">
                  <p class="catalogue-detail__body">
                    {t(`skillsItem${skill.id}Detail`)}
                  </p>
                </div>

                <div class="catalogue-files skills-detail__files">
                  <p class="catalogue-files__title">{t("skillsFilesTitle")}</p>
                  <div class="catalogue-files__list skills-files__list">
                    <For each={activeSkillFiles()}>
                      {(value) => <div class="catalogue-files__item">{value}</div>}
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
