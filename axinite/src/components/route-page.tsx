import { For, Show } from "solid-js";
import { useFeatureFlags } from "@/lib/feature-flags/runtime";
import { useI18n } from "@/lib/i18n/provider";
import type { RouteId } from "@/lib/route-config";
import { ROUTE_DETAILS } from "@/lib/route-config";

type RoutePageProps = {
  routeId: RouteId;
};

export const RoutePage = (props: RoutePageProps) => {
  const flags = useFeatureFlags();
  const { t } = useI18n();
  const details = () => ROUTE_DETAILS[props.routeId];

  return (
    <section class="route-page">
      <header class="route-page__hero">
        <div class="route-page__eyebrow">{t("routeHeroEyebrow")}</div>
        <div class="route-page__hero-grid">
          <div>
            <h2 class="route-page__title">
              {t(`route-${props.routeId}-label`)}
            </h2>
            <p class="route-page__summary">
              {t(`page-${props.routeId}-summary`)}
            </p>
          </div>
          <div class="route-page__meta">
            <div class="route-page__meta-card">
              <p class="route-page__meta-label">{t("routeMetaModeLabel")}</p>
              <p class="route-page__meta-value">
                {t(`page-${props.routeId}-mode`)}
              </p>
            </div>
            <div class="route-page__meta-card">
              <p class="route-page__meta-label">{t("routeMetaStatusLabel")}</p>
              <p class="route-page__meta-value">
                {t(`page-${props.routeId}-status`)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <Show
        when={flags.isRouteVisible(details().flagName)}
        fallback={
          <div class="route-page__notice">
            <h3>{t("routeUnavailableTitle")}</h3>
            <p>{t("routeUnavailableBody")}</p>
          </div>
        }
      >
        <div class="route-page__cards">
          <For each={details().cardKeys}>
            {(cardKey) => (
              <article class="route-card">
                <p class="route-card__kicker">{t("routeCardKicker")}</p>
                <h3 class="route-card__title">
                  {t(`page-${props.routeId}-${cardKey}-title`)}
                </h3>
                <p class="route-card__body">
                  {t(`page-${props.routeId}-${cardKey}-body`)}
                </p>
              </article>
            )}
          </For>
        </div>

        <section class="route-page__agenda">
          <div>
            <h3 class="route-page__section-title">{t("routeAgendaTitle")}</h3>
            <p class="route-page__section-body">
              {t(`page-${props.routeId}-agenda`)}
            </p>
          </div>
          <div>
            <h3 class="route-page__section-title">
              {t("routeGuardrailTitle")}
            </h3>
            <p class="route-page__section-body">
              {t(`page-${props.routeId}-guardrail`)}
            </p>
          </div>
        </section>
      </Show>
    </section>
  );
};
