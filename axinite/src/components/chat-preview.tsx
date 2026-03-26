import {
  createMutation,
  createQuery,
  useQueryClient,
} from "@tanstack/solid-query";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  Show,
} from "solid-js";

import {
  connectChatEvents,
  createThread,
  fetchHistory,
  fetchThreads,
  sendMessage,
  submitApproval,
} from "@/lib/api/chat";
import type { ThreadInfo } from "@/lib/api/contracts";
import { useI18n } from "@/lib/i18n/provider";

function formatTimestamp(value: string | null | undefined): string {
  if (!value) {
    return "Pending";
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export const ChatPreview = () => {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [activeThreadId, setActiveThreadId] = createSignal<string>();
  const [composerText, setComposerText] = createSignal("");
  const [streamingResponse, setStreamingResponse] = createSignal("");
  const [liveStatus, setLiveStatus] = createSignal("");

  const threads = createQuery(() => ({
    queryKey: ["chat", "threads"],
    queryFn: fetchThreads,
  }));

  const sessionList = createMemo<ThreadInfo[]>(() => {
    const payload = threads.data;
    if (!payload) {
      return [];
    }
    const items = payload.assistant_thread ? [payload.assistant_thread] : [];
    return [...items, ...payload.threads];
  });

  createEffect(() => {
    const resolvedThreadId =
      activeThreadId() ??
      threads.data?.active_thread ??
      threads.data?.assistant_thread?.id ??
      threads.data?.threads[0]?.id;
    if (resolvedThreadId && resolvedThreadId !== activeThreadId()) {
      setActiveThreadId(resolvedThreadId);
    }
  });

  const history = createQuery(() => ({
    queryKey: ["chat", "history", activeThreadId()],
    queryFn: () => fetchHistory(activeThreadId()),
    enabled: typeof activeThreadId() === "string",
  }));

  const createThreadMutation = createMutation(() => ({
    mutationFn: createThread,
    onSuccess: (thread) => {
      setActiveThreadId(thread.id);
      void queryClient.invalidateQueries({ queryKey: ["chat", "threads"] });
      void queryClient.invalidateQueries({ queryKey: ["chat", "history"] });
    },
  }));

  const sendMutation = createMutation(() => ({
    mutationFn: (content: string) =>
      sendMessage({
        content,
        thread_id: activeThreadId() ?? null,
        timezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Europe/London",
        images: [],
      }),
    onSuccess: () => {
      setComposerText("");
      setStreamingResponse("");
      setLiveStatus("Streaming assistant response...");
      void queryClient.invalidateQueries({ queryKey: ["chat", "threads"] });
    },
  }));

  const approvalMutation = createMutation(() => ({
    mutationFn: (action: "approve" | "deny") =>
      submitApproval({
        request_id: history.data?.pending_approval?.request_id ?? "",
        action,
        thread_id: activeThreadId() ?? null,
      }),
    onSuccess: () => {
      setStreamingResponse("");
      void queryClient.invalidateQueries({ queryKey: ["chat", "history"] });
      void queryClient.invalidateQueries({ queryKey: ["chat", "threads"] });
    },
  }));

  createEffect(() => {
    const source = connectChatEvents((event) => {
      if (
        "thread_id" in event &&
        event.thread_id &&
        event.thread_id !== activeThreadId()
      ) {
        return;
      }

      switch (event.type) {
        case "thinking":
        case "status":
          setLiveStatus(event.message);
          break;
        case "tool_started":
          setLiveStatus(`Running ${event.name}...`);
          break;
        case "tool_result":
          setLiveStatus(event.preview);
          break;
        case "tool_completed":
          setLiveStatus(
            event.success
              ? `${event.name} completed successfully.`
              : (event.error ?? `${event.name} failed.`)
          );
          break;
        case "stream_chunk":
          setStreamingResponse((current) => `${current}${event.content}`);
          break;
        case "response":
          setStreamingResponse("");
          setLiveStatus("Response completed.");
          void queryClient.invalidateQueries({ queryKey: ["chat", "history"] });
          void queryClient.invalidateQueries({ queryKey: ["chat", "threads"] });
          break;
        case "approval_needed":
          setLiveStatus(event.description);
          void queryClient.invalidateQueries({ queryKey: ["chat", "history"] });
          break;
        case "error":
          setLiveStatus(event.message);
          break;
        case "auth_required":
        case "auth_completed":
        case "heartbeat":
        case "extension_status":
          break;
      }
    });

    onCleanup(() => source.close());
  });

  const activeThread = createMemo(
    () => sessionList().find((thread) => thread.id === activeThreadId()) ?? null
  );

  return (
    <section class="route-preview route-preview--chat">
      <div aria-hidden="true" class="route-preview__watermark">
        {t("chat-watermark")}
      </div>
      <div class="route-preview__layout route-preview__layout--chat">
        <aside class="route-sidebar route-sidebar--chat">
          <div class="route-sidebar__toolbar">
            <button
              class="route-sidebar__icon-button"
              type="button"
              onClick={() => createThreadMutation.mutate()}
            >
              +
            </button>
            <div class="route-sidebar__spacer" />
            <button class="route-sidebar__icon-button" type="button">
              {"<"}
            </button>
          </div>

          <Show when={activeThread()}>
            {(thread) => (
              <div class="route-sidebar__session route-sidebar__session--current">
                <button class="route-sidebar__session-button" type="button">
                  <span class="route-sidebar__session-name">
                    {thread().title ?? t("route-chat-label")}
                  </span>
                  <span class="route-sidebar__session-time">
                    {formatTimestamp(thread().updated_at)}
                  </span>
                </button>
              </div>
            )}
          </Show>

          <div class="route-sidebar__session-list">
            <For each={sessionList()}>
              {(thread) => (
                <button
                  class={
                    activeThreadId() === thread.id
                      ? "route-sidebar__list-item route-sidebar__list-item--active"
                      : "route-sidebar__list-item"
                  }
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setStreamingResponse("");
                  }}
                  type="button"
                >
                  <span class="route-sidebar__list-label">
                    {thread.title ?? thread.id}
                  </span>
                  <span class="route-sidebar__list-time">
                    {formatTimestamp(thread.updated_at)}
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
                <p class="route-preview__eyebrow">{t("route-hero-eyebrow")}</p>
                <h2 class="route-preview__title">{t("route-chat-label")}</h2>
                <p class="route-preview__summary">{t("page-chat-summary")}</p>
              </header>

              <For each={history.data?.turns ?? []}>
                {(turn) => (
                  <>
                    <div class="chat-preview__turn chat-preview__turn--user">
                      <div class="chat-preview__bubble chat-preview__bubble--user">
                        <p>{turn.user_input}</p>
                      </div>
                    </div>
                    <div class="chat-preview__turn chat-preview__turn--assistant">
                      <div class="chat-preview__bubble chat-preview__bubble--assistant">
                        <div class="chat-preview__markdown">
                          <p>{turn.response ?? "Awaiting completion..."}</p>
                          <Show when={turn.tool_calls.length > 0}>
                            <p class="chat-preview__safety-note">
                              {turn.tool_calls
                                .map((toolCall) => toolCall.name)
                                .join(", ")}
                            </p>
                          </Show>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </For>

              <Show when={streamingResponse().length > 0}>
                <div class="chat-preview__turn chat-preview__turn--assistant">
                  <div class="chat-preview__bubble chat-preview__bubble--assistant">
                    <div class="chat-preview__markdown">
                      <p>{streamingResponse()}</p>
                    </div>
                  </div>
                </div>
              </Show>

              <Show when={history.data?.pending_approval}>
                {(approval) => (
                  <div class="chat-preview__turn chat-preview__turn--assistant">
                    <div class="chat-preview__bubble chat-preview__bubble--assistant">
                      <div class="chat-preview__markdown">
                        <h3>{approval().tool_name}</h3>
                        <p>{approval().description}</p>
                        <p>{approval().parameters}</p>
                        <div class="dashboard-detail__actions">
                          <button
                            class="dashboard-detail__ghost"
                            type="button"
                            onClick={() => approvalMutation.mutate("approve")}
                          >
                            Approve
                          </button>
                          <button
                            class="dashboard-detail__ghost"
                            type="button"
                            onClick={() => approvalMutation.mutate("deny")}
                          >
                            Deny
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Show>
            </div>
          </div>

          <div class="chat-preview__composer-wrap">
            <div class="chat-preview__composer-shell">
              <Show when={liveStatus().length > 0}>
                <p class="chat-preview__safety-note">{liveStatus()}</p>
              </Show>
              <div class="chat-preview__composer">
                <textarea
                  aria-label={t("chat-composer-label")}
                  class="chat-preview__textarea"
                  onInput={(event) =>
                    setComposerText(event.currentTarget.value)
                  }
                  placeholder={t("chat-composer-placeholder")}
                  rows={1}
                  value={composerText()}
                />
                <div class="chat-preview__composer-actions">
                  <button
                    aria-label={t("chat-attach-button")}
                    class="chat-preview__ghost-button"
                    type="button"
                    onClick={() =>
                      setLiveStatus(
                        "Mock backend preview does not persist file uploads."
                      )
                    }
                  >
                    +
                  </button>
                  <button
                    class="chat-preview__send-button"
                    disabled={composerText().trim().length === 0}
                    type="button"
                    onClick={() => sendMutation.mutate(composerText().trim())}
                  >
                    {t("chat-send-button")}
                  </button>
                </div>
              </div>
              <p class="chat-preview__safety-note">{t("chat-safety-note")}</p>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};
