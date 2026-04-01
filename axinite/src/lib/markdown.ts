/**
 * Lightweight markdown-to-HTML converter for chat responses.
 *
 * Covers the subset used by the mock backend and typical Axinite assistant
 * output: headings, bold/italic/code, lists, tables, and paragraphs.
 * This is intentionally minimal — a full markdown parser would be overkill
 * for the mockup.
 */
export function renderMarkdown(source: string): string {
  const lines = source.split("\n");
  const html: string[] = [];
  let inUl = false;
  let inOl = false;
  let inTable = false;
  let tableHeaderDone = false;

  function closeLists(): void {
    if (inUl) {
      html.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      html.push("</ol>");
      inOl = false;
    }
  }

  function closeTable(): void {
    if (inTable) {
      html.push("</tbody></table>");
      inTable = false;
      tableHeaderDone = false;
    }
  }

  function inlineMarkup(text: string): string {
    return text
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }

  let paragraphBuffer: string[] = [];

  function flushParagraph(): void {
    if (paragraphBuffer.length > 0) {
      html.push(`<p>${paragraphBuffer.join(" ")}</p>`);
      paragraphBuffer = [];
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd();

    // Table row
    if (line.startsWith("|") && line.endsWith("|")) {
      flushParagraph();
      closeLists();
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      // Skip separator rows like |---|---|
      if (cells.every((c) => /^[-:]+$/.test(c))) {
        continue;
      }
      if (!inTable) {
        html.push("<table>");
        html.push(
          `<thead><tr>${cells.map((c) => `<th>${inlineMarkup(c)}</th>`).join("")}</tr></thead>`
        );
        html.push("<tbody>");
        inTable = true;
        tableHeaderDone = true;
        continue;
      }
      const tag = tableHeaderDone ? "td" : "th";
      html.push(
        `<tr>${cells.map((c) => `<${tag}>${inlineMarkup(c)}</${tag}>`).join("")}</tr>`
      );
      continue;
    }
    closeTable();

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      flushParagraph();
      closeLists();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${inlineMarkup(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Unordered list
    if (line.match(/^[-*]\s+/)) {
      flushParagraph();
      closeTable();
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        html.push("<ul>");
        inUl = true;
      }
      html.push(`<li>${inlineMarkup(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^\d+\.\s+(.*)/);
    if (olMatch) {
      flushParagraph();
      closeTable();
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        html.push("<ol>");
        inOl = true;
      }
      html.push(`<li>${inlineMarkup(olMatch[1])}</li>`);
      continue;
    }

    closeLists();

    // Empty line = paragraph break
    if (line.length === 0) {
      flushParagraph();
      continue;
    }

    // Regular text — accumulate into paragraph
    paragraphBuffer.push(inlineMarkup(line));
  }

  flushParagraph();
  closeLists();
  closeTable();

  return html.join("\n");
}
