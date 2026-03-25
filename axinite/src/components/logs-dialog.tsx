import { Dialog } from "@kobalte/core/dialog";
import { For } from "solid-js";

import { useI18n } from "@/lib/i18n/provider";

const LOG_KEYS = ["boot", "flags", "locale", "query"] as const;

export const LogsDialog = () => {
  const { t } = useI18n();

  return (
    <Dialog>
      <Dialog.Trigger class="btn btn-ghost btn-sm shell-button">
        {t("logsButton")}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay class="dialog-overlay" />
        <Dialog.Content class="dialog-surface">
          <Dialog.Title class="dialog-title">{t("logsTitle")}</Dialog.Title>
          <Dialog.Description class="dialog-description">
            {t("logsDescription")}
          </Dialog.Description>
          <div class="logs-panel" aria-live="polite">
            <For each={LOG_KEYS}>
              {(logKey) => (
                <article class="logs-panel__item">
                  <p class="logs-panel__time">{t(`logs-${logKey}-time`)}</p>
                  <p class="logs-panel__message">
                    {t(`logs-${logKey}-message`)}
                  </p>
                </article>
              )}
            </For>
          </div>
          <div class="dialog-actions">
            <Dialog.CloseButton class="btn btn-primary btn-sm">
              {t("dialogClose")}
            </Dialog.CloseButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
