import { createMemo, createSignal, For, Show } from "solid-js";

import { useI18n } from "@/lib/i18n/provider";

type MemoryFileId =
  | "agents"
  | "identity"
  | "memory"
  | "user"
  | "tools"
  | "heartbeat";

type MemoryFileNode = {
  id: MemoryFileId;
  kind: "file";
  label: string;
  path: string[];
};

type MemoryFolderNode = {
  kind: "folder";
  label: string;
  path: string[];
  children: MemoryFileNode[];
};

type MemoryNode = MemoryFileNode | MemoryFolderNode;

const MEMORY_TREE: MemoryNode[] = [
  {
    id: "agents",
    kind: "file",
    label: "AGENTS.md",
    path: ["workspace", "AGENTS.md"],
  },
  {
    kind: "folder",
    label: "daily",
    path: ["workspace", "daily"],
    children: [
      {
        id: "heartbeat",
        kind: "file",
        label: "HEARTBEAT.md",
        path: ["workspace", "daily", "HEARTBEAT.md"],
      },
      {
        id: "identity",
        kind: "file",
        label: "IDENTITY.md",
        path: ["workspace", "daily", "IDENTITY.md"],
      },
      {
        id: "memory",
        kind: "file",
        label: "MEMORY.md",
        path: ["workspace", "daily", "MEMORY.md"],
      },
    ],
  },
  {
    kind: "folder",
    label: "skills",
    path: ["workspace", "skills"],
    children: [
      {
        id: "tools",
        kind: "file",
        label: "TOOLS.md",
        path: ["workspace", "skills", "TOOLS.md"],
      },
      {
        id: "user",
        kind: "file",
        label: "USER.md",
        path: ["workspace", "skills", "USER.md"],
      },
    ],
  },
];

export const MemoryPreview = () => {
  const { t } = useI18n();
  const [activeFile, setActiveFile] = createSignal<MemoryFileId>("identity");
  const [editing, setEditing] = createSignal(false);
  const [draft, setDraft] = createSignal("");

  const firstFileNode = MEMORY_TREE.find(
    (node): node is MemoryFileNode => node.kind === "file"
  );

  const activeNode = createMemo<MemoryFileNode | undefined>(() => {
    for (const node of MEMORY_TREE) {
      if (node.kind === "file" && node.id === activeFile()) {
        return node;
      }

      if (node.kind === "folder") {
        const match = node.children.find((child) => child.id === activeFile());
        if (match) {
          return match;
        }
      }
    }

    return firstFileNode;
  });

  const activeContent = createMemo(() => {
    switch (activeFile()) {
      case "agents":
        return [t("page-memory-card-a-body"), t("page-memory-card-c-body")];
      case "heartbeat":
        return [t("page-memory-card-b-body"), t("page-memory-guardrail")];
      case "identity":
        return [t("page-memory-summary"), t("page-memory-agenda")];
      case "memory":
        return [t("page-memory-card-a-body"), t("page-memory-card-b-body")];
      case "tools":
        return [t("page-memory-card-c-body"), t("page-memory-summary")];
      case "user":
        return [t("page-memory-agenda"), t("page-memory-guardrail")];
    }
  });

  const beginEdit = () => {
    setDraft(activeContent().join("\n\n"));
    setEditing(true);
  };

  return (
    <section class="route-preview route-preview--memory">
      <div aria-hidden="true" class="route-preview__watermark">
        MEM
      </div>
      <div class="route-preview__layout route-preview__layout--memory">
        <aside class="route-sidebar route-sidebar--memory">
          <div class="route-sidebar__search">
            <input
              aria-label={t("memory-search-label")}
              class="route-sidebar__search-input"
              placeholder={t("memory-search-placeholder")}
              type="text"
            />
          </div>

          <div class="route-tree">
            <For each={MEMORY_TREE}>
              {(node) =>
                node.kind === "file" ? (
                  <button
                    class={
                      activeFile() === node.id
                        ? "route-tree__file route-tree__file--active"
                        : "route-tree__file"
                    }
                    onClick={() => setActiveFile(node.id)}
                    type="button"
                  >
                    {node.label}
                  </button>
                ) : (
                  <section class="route-tree__group">
                    <h3 class="route-tree__folder-title">{node.label}</h3>
                    <div class="route-tree__group-items">
                      <For each={node.children}>
                        {(child) => (
                          <button
                            class={
                              activeFile() === child.id
                                ? "route-tree__file route-tree__file--active"
                                : "route-tree__file"
                            }
                            onClick={() => setActiveFile(child.id)}
                            type="button"
                          >
                            {child.label}
                          </button>
                        )}
                      </For>
                    </div>
                  </section>
                )
              }
            </For>
          </div>
        </aside>

        <main class="memory-preview__main">
          <div class="memory-preview__toolbar">
            <div class="memory-preview__breadcrumb">
              <For each={activeNode()?.path ?? []}>
                {(segment, index) => (
                  <>
                    <Show when={index() > 0}>
                      <span class="memory-preview__breadcrumb-sep">/</span>
                    </Show>
                    <span
                      class={
                        index() === (activeNode()?.path.length ?? 0) - 1
                          ? "memory-preview__breadcrumb-current"
                          : "memory-preview__breadcrumb-item"
                      }
                    >
                      {segment}
                    </span>
                  </>
                )}
              </For>
            </div>

            <div class="memory-preview__toolbar-actions">
              <Show
                when={editing()}
                fallback={
                  <button
                    class="memory-preview__action-button"
                    onClick={beginEdit}
                    type="button"
                  >
                    {t("memory-edit-button")}
                  </button>
                }
              >
                <button
                  class="memory-preview__action-button"
                  onClick={() => setEditing(false)}
                  type="button"
                >
                  {t("memory-cancel-button")}
                </button>
                <button
                  class="memory-preview__save-button"
                  onClick={() => {
                    // TODO: persist draft() here before leaving edit mode.
                    setEditing(false);
                  }}
                  type="button"
                >
                  {t("memory-save-button")}
                </button>
              </Show>
            </div>
          </div>

          <header class="route-preview__intro route-preview__intro--memory">
            <p class="route-preview__eyebrow">{t("route-hero-eyebrow")}</p>
            <h2 class="route-preview__title">{t("route-memory-label")}</h2>
            <p class="route-preview__summary">{t("page-memory-summary")}</p>
          </header>

          <Show
            when={!editing()}
            fallback={
              <div class="memory-preview__editor-wrap">
                <textarea
                  class="memory-preview__editor"
                  onInput={(event) => setDraft(event.currentTarget.value)}
                  value={draft()}
                />
              </div>
            }
          >
            <article class="memory-preview__document">
              <h2 class="memory-preview__document-title">
                {activeNode()?.label}
              </h2>
              <For each={activeContent()}>
                {(paragraph) => (
                  <p class="memory-preview__document-paragraph">{paragraph}</p>
                )}
              </For>
            </article>
          </Show>
        </main>
      </div>
    </section>
  );
};
