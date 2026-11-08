// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { uuidv7 } from "wcz-layout/utils";
import { Form } from "~/routes/todos/-components/Form";

describe("Todo Form", () => {
  afterEach(cleanup);

  const id = uuidv7();

  // The form validates but does not transform: trimming happens in the server validator.
  it("submits the entered values as typed", async () => {
    const onSubmit = vi.fn(async () => {});
    render(<Form defaultValues={{ id, name: "" }} onSubmit={onSubmit} />);

    await userEvent.type(screen.getByRole("textbox"), " Buy milk ");
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ id, name: " Buy milk " }));
  });

  it("marks an empty name invalid and does not submit", async () => {
    const onSubmit = vi.fn(async () => {});
    render(<Form defaultValues={{ id, name: "" }} onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() =>
      expect(screen.getByRole("textbox").getAttribute("aria-invalid")).toBe("true"),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
