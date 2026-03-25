import { For, createSignal } from "solid-js";

import { useI18n } from "@/lib/i18n/provider";

const CHAT_SESSIONS = ["good-morning", "review", "scrape"] as const;

export const ChatPreview = () => {
  const { t } = useI18n();
  const [activeSession, setActiveSession] =
    createSignal<(typeof CHAT_SESSIONS)[number]>("good-morning");

  const sessionLabel = (sessionId: (typeof CHAT_SESSIONS)[number]) => {
    switch (sessionId) {
      case "good-morning":
        return t("page-chat-card-a-title");
      case "review":
        return t("page-chat-card-b-title");
      case "scrape":
        return t("page-chat-card-c-title");
    }
  };

  const sessionTime = (sessionId: (typeof CHAT_SESSIONS)[number]) => {
    switch (sessionId) {
      case "good-morning":
        return "now";
      case "review":
        return "9h ago";
      case "scrape":
        return "1d ago";
    }
  };

  return (
    <section class="route-preview route-preview--chat">
      <div aria-hidden="true" class="route-preview__watermark">
        CHAT
      </div>
      <div class="route-preview__layout route-preview__layout--chat">
        <aside class="route-sidebar route-sidebar--chat">
          <div class="route-sidebar__toolbar">
            <button class="route-sidebar__icon-button" type="button">
              +
            </button>
            <div class="route-sidebar__spacer" />
            <button class="route-sidebar__icon-button" type="button">
              {"<"}
            </button>
          </div>

          <div class="route-sidebar__session route-sidebar__session--current">
            <button class="route-sidebar__session-button" type="button">
              <span class="route-sidebar__session-name">
                {t("route-chat-label")}
              </span>
              <span class="route-sidebar__session-time">1h ago</span>
            </button>
          </div>

          <div class="route-sidebar__session-list">
            <For each={CHAT_SESSIONS}>
              {(sessionId) => (
                <button
                  class={
                    activeSession() === sessionId
                      ? "route-sidebar__list-item route-sidebar__list-item--active"
                      : "route-sidebar__list-item"
                  }
                  onClick={() => setActiveSession(sessionId)}
                  type="button"
                >
                  <span class="route-sidebar__list-label">
                    {sessionLabel(sessionId)}
                  </span>
                  <span class="route-sidebar__list-time">
                    {sessionTime(sessionId)}
                  </span>
                </button>
              )}
            </For>
          </div>
        </aside>

        <main class="chat-preview__main">
          <div class="chat-preview__scroll">
            <div class="chat-preview__conversation">
              <header class="route-preview__intro">
                <p class="route-preview__eyebrow">{t("routeHeroEyebrow")}</p>
                <h2 class="route-preview__title">{t("route-chat-label")}</h2>
                <p class="route-preview__summary">{t("page-chat-summary")}</p>
              </header>

              <div class="chat-preview__turn chat-preview__turn--user">
                <div class="chat-preview__bubble chat-preview__bubble--user">
                  <p>{t("page-chat-summary")}</p>
                </div>
              </div>

              <div class="chat-preview__turn chat-preview__turn--assistant">
                <div class="chat-preview__bubble chat-preview__bubble--assistant">
                  <div class="chat-preview__markdown">
                    <p>{t("page-chat-agenda")}</p>
                    <p>{t("page-chat-guardrail")}</p>
                  </div>
                </div>
              </div>

              <div class="chat-preview__turn chat-preview__turn--user">
                <div class="chat-preview__bubble chat-preview__bubble--user">
                  <p>{sessionLabel(activeSession())}</p>
                </div>
              </div>

              <div class="chat-preview__turn chat-preview__turn--assistant">
                <div class="chat-preview__bubble chat-preview__bubble--assistant">
                  <div class="chat-preview__markdown">
                    <h3>{t("page-chat-card-a-title")}</h3>
                    <p>{t("page-chat-card-a-body")}</p>
                    <h3>{t("page-chat-card-b-title")}</h3>
                    <p>{t("page-chat-card-b-body")}</p>
                    <h3>{t("page-chat-card-c-title")}</h3>
                    <p>{t("page-chat-card-c-body")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="chat-preview__composer-wrap">
            <div class="chat-preview__composer-shell">
              <div class="chat-preview__composer">
                <textarea
                  aria-label={t("chatComposerLabel")}
                  class="chat-preview__textarea"
                  placeholder={t("chatComposerPlaceholder")}
                  rows={1}
                />
                <div class="chat-preview__composer-actions">
                  <button
                    aria-label={t("chatAttachButton")}
                    class="chat-preview__ghost-button"
                    type="button"
                  >
                    +
                  </button>
                  <button class="chat-preview__send-button" type="button">
                    {t("chatSendButton")}
                  </button>
                </div>
              </div>
              <p class="chat-preview__safety-note">{t("chatSafetyNote")}</p>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};
