import { expect, test, type Page } from "@playwright/test";

async function startCase(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: /Start case: 123 Test Lane/ }).click();
  await expect(page.getByRole("heading", { name: "123 Test Lane" })).toBeVisible();
  await expect(page.getByText("Strong short-term rental demand")).toBeVisible();
  await page.getByRole("button", { name: "Start underwriting" }).click();
  await expect(page).toHaveURL(/\/underwritings\/1$/);
}

async function fillAssumptions(page: Page, midRevenue: string) {
  await page.getByRole("spinbutton", { name: "Down payment" }).fill("20");
  await page.getByRole("spinbutton", { name: "Interest rate" }).fill("6");
  await page.getByRole("spinbutton", { name: "Mortgage term" }).fill("30");
  await page.getByRole("spinbutton", { name: "Closing costs" }).fill("3");
  await page.getByRole("spinbutton", { name: "Land assumption" }).fill("20");
  await page.getByRole("spinbutton", { name: "Short-life asset multiplier" }).fill("30");
  await page.getByRole("spinbutton", { name: "Bonus depreciation" }).fill("100");
  await page.getByRole("spinbutton", { name: "Tax rate" }).fill("25");
  await page.getByRole("spinbutton", { name: "Low scenario" }).fill("50000");
  await page.getByRole("spinbutton", { name: "Mid scenario" }).fill(midRevenue);
  await page.getByRole("spinbutton", { name: "High scenario" }).fill("150000");
}

for (const fixture of [
  { rating: "best", mid: "125000", score: "100", heading: "Excellent match" },
  { rating: "medium", mid: "100000", score: "70", heading: "Getting close" },
  { rating: "low", mid: "60000", score: "40", heading: "Keep practicing" },
] as const) {
  test(`${fixture.rating} score: dashboard to result`, async ({ page, request }) => {
    await request.post("http://127.0.0.1:8010/__reset", { data: { rating: fixture.rating } });
    if (fixture.rating === "medium") await page.setViewportSize({ width: 390, height: 844 });
    await startCase(page);
    await fillAssumptions(page, fixture.mid);
    if (fixture.rating === "medium") {
      await page.getByRole("button", { name: "Add setup cost" }).click();
      await page.getByRole("textbox", { name: "Category 1" }).fill("Furniture");
      await page.getByRole("spinbutton", { name: "Total cost" }).fill("12000");
      await page.getByRole("button", { name: "Add expense" }).click();
      await page.getByRole("textbox", { name: "Expense name 1" }).fill("Utilities");
      await page.getByRole("spinbutton", { name: "Monthly amount" }).fill("450");
      await page.getByRole("checkbox", { name: "Furnished" }).check();
    }
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByText("Draft saved. The figures below come from the backend calculation.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Review & submit" })).toBeEnabled();
    if (fixture.rating === "medium") {
      await page.reload();
      await expect(page.getByRole("textbox", { name: "Category 1" })).toHaveValue("Furniture");
      await expect(page.getByRole("spinbutton", { name: "Monthly amount" })).toHaveValue("450");
      await expect(page.getByRole("checkbox", { name: "Furnished" })).toBeChecked();
      const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(documentWidth).toBeLessThanOrEqual(390);
    }
    await page.getByRole("button", { name: "Review & submit" }).click();
    await page.getByRole("button", { name: "Confirm submission" }).click();
    await expect(page).toHaveURL(/\/submissions\/1$/);
    await expect(page.getByRole("heading", { name: fixture.heading })).toBeVisible();
    await expect(page.getByRole("paragraph").filter({ hasText: `${fixture.score}/100` })).toBeVisible();
    await expect(page.getByText("Your rank: #1 of 1")).toBeVisible();
  });
}

test("incomplete expense and revenue order block invalid saves", async ({ page, request }) => {
  await request.post("http://127.0.0.1:8010/__reset", { data: { rating: "best" } });
  await startCase(page);
  await fillAssumptions(page, "125000");
  await page.getByRole("spinbutton", { name: "High scenario" }).fill("100000");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.locator("p[role=alert]")).toContainText("Revenue should increase from Low to Mid to High.");
  await expect(page.getByRole("button", { name: "Review & submit" })).toBeDisabled();

  await page.getByRole("spinbutton", { name: "High scenario" }).fill("150000");
  await page.getByRole("button", { name: "Add expense" }).click();
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.locator("p[role=alert]")).toContainText("Enter a name and a valid amount");
  await page.getByRole("textbox", { name: "Expense name 1" }).fill("Utilities");
  await page.getByRole("spinbutton", { name: "Monthly amount" }).fill("450");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText("Draft saved. The figures below come from the backend calculation.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Review & submit" })).toBeEnabled();
});
