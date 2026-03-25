import { render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";

import { AppProviders } from "@/app/providers";
import { ShellChrome } from "@/components/app-shell";
import { setupI18nTestHarness } from "./support/i18n-test-runtime";

beforeAll(async () => {
  await setupI18nTestHarness();
});

describe("app shell behaviour", () => {
  it("switches document direction when the locale changes to Arabic", async () => {
    render(() => (
      <AppProviders>
        <ShellChrome activePath="/chat" usePlainLinks>
          <div>Child</div>
        </ShellChrome>
      </AppProviders>
    ));

    const picker = screen.getByLabelText("Language");
    await userEvent.selectOptions(picker, "ar");

    await waitFor(() => {
      expect(document.documentElement.dir).toBe("rtl");
    });
  });
});
