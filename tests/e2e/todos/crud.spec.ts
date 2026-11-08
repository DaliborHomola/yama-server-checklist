import { expect, test } from "@playwright/test";
import { gotoHydrated } from "../utils";

// Runs signed in as admin (see auth.setup.ts) against the DATABASE_URL database.
// Each test creates its own uniquely named todo and deletes it again.

test("creates, edits and deletes a todo", async ({ page }) => {
  const name = `E2E todo ${Date.now()}`;

  await test.step("create", async () => {
    await gotoHydrated(page, "/todos/create");
    await page.getByRole("textbox", { name: "Name" }).fill(name);
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page).toHaveURL("/todos");
    await expect(page.getByRole("link", { name })).toBeVisible();
  });

  await test.step("edit", async () => {
    await page.getByRole("link", { name }).click();
    await page.getByRole("link", { name: "Edit" }).click();
    await page.getByRole("textbox", { name: "Name" }).fill(`${name} (edited)`);
    await page.getByRole("button", { name: "Submit" }).click();

    await expect(page.getByText(`${name} (edited)`)).toBeVisible();
  });

  await test.step("delete", async () => {
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Confirm" }).click();

    await expect(page).toHaveURL("/todos");
    await expect(page.getByRole("link", { name: `${name} (edited)` })).toBeHidden();
  });
});

// An empty field is blocked by the browser's native `required` check before the schema runs,
// so whitespace is what reaches the TodoSchema `trim().min(1)` rule.
test("rejects a whitespace-only name", async ({ page }) => {
  await gotoHydrated(page, "/todos/create");
  await page.getByRole("textbox", { name: "Name" }).fill("   ");

  await expect(page.getByText("This field is required")).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit" })).toBeDisabled();
});
