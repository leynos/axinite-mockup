import { render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";

import { AppProviders } from "@/app/providers";
import { ShellChrome } from "@/components/app-shell";
import { AVAILABLE_LOCALES } from "@/lib/i18n/supported-locales";
import { setupI18nTestHarness } from "./support/i18n-test-runtime";

beforeAll(async () => {
  await setupI18nTestHarness();
});

describe("app shell behaviour", () => {
  it("only offers locales with complete site coverage", async () => {
    render(() => (
      <AppProviders>
        <ShellChrome activePath="/chat" usePlainLinks>
          <div>Child</div>
        </ShellChrome>
      </AppProviders>
    ));

    const picker = screen.getByLabelText("Language") as HTMLSelectElement;

    expect([...picker.options].map((option) => option.value)).toEqual(
      AVAILABLE_LOCALES.map((locale) => locale.code)
    );
  });

  it("falls back to the default locale when an incomplete locale is requested", async () => {
    window.localStorage.setItem("i18nextLng", "fr");

    render(() => (
      <AppProviders>
        <ShellChrome activePath="/chat" usePlainLinks>
          <div>Child</div>
        </ShellChrome>
      </AppProviders>
    ));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Logs" })).toBeVisible();
    });

    expect(document.documentElement.lang).toBe("en-GB");
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("keeps the picker stable when selecting the available locale", async () => {
    render(() => (
      <AppProviders>
        <ShellChrome activePath="/chat" usePlainLinks>
          <div>Child</div>
        </ShellChrome>
      </AppProviders>
    ));

    const picker = screen.getByLabelText("Language");
    await userEvent.selectOptions(picker, "en-GB");

    await waitFor(() => {
      expect(document.documentElement.lang).toBe("en-GB");
    });
  });
});
