import { Collapsible } from "@kobalte/core/collapsible";
import { For } from "solid-js";

import { FEATURE_FLAGS } from "@/lib/feature-flags/registry";
import { useFeatureFlags } from "@/lib/feature-flags/runtime";
import { useI18n } from "@/lib/i18n/provider";

export const DebugFlagPanel = () => {
  const flags = useFeatureFlags();
  const { t } = useI18n();

  return (
    <Collapsible class="debug-panel" defaultOpen={false}>
      <div class="debug-panel__header">
        <div>
          <p class="debug-panel__eyebrow">{t("debugEyebrow")}</p>
          <h2 class="debug-panel__title">{t("debugTitle")}</h2>
        </div>
        <Collapsible.Trigger class="btn btn-outline btn-sm shell-button">
          {t("debugToggle")}
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content class="debug-panel__content">
        <p class="debug-panel__description">{t("debugDescription")}</p>
        <ul class="debug-table" aria-label={t("debugTableLabel")}>
          <For each={FEATURE_FLAGS}>
            {(flag) => {
              const resolvedFlag = () => flags.resolvedFlags()[flag.name];
              const override = () => flags.overrides()[flag.name];

              return (
                <li class="debug-table__row">
                  <div class="debug-table__cell">
                    <p class="debug-table__name">{flag.name}</p>
                    <p class="debug-table__meta">
                      {flag.owner} · {flag.backendContract}
                    </p>
                  </div>
                  <div class="debug-table__cell">
                    <span class="badge badge-outline">
                      {t(`flag-${resolvedFlag() ? "on" : "off"}`)}
                    </span>
                  </div>
                  <div class="debug-table__cell debug-table__actions">
                    <button
                      class="btn btn-outline btn-xs shell-button"
                      type="button"
                      onClick={() => flags.setOverride(flag.name, true)}
                    >
                      {t("flagForceOn")}
                    </button>
                    <button
                      class="btn btn-outline btn-xs shell-button"
                      type="button"
                      onClick={() => flags.setOverride(flag.name, false)}
                    >
                      {t("flagForceOff")}
                    </button>
                    <button
                      class="btn btn-ghost btn-xs shell-button"
                      type="button"
                      disabled={typeof override() === "undefined"}
                      onClick={() => flags.clearOverride(flag.name)}
                    >
                      {t("flagClearOverride")}
                    </button>
                  </div>
                </li>
              );
            }}
          </For>
        </ul>
      </Collapsible.Content>
    </Collapsible>
  );
};
