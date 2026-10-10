import { createServer } from "node:http";

const property = {
  zpid: "41234567", address: "123 Test Lane, Austin, TX 78701", address_street: "123 Test Lane",
  address_city: "Austin", address_state: "TX", address_zipcode: "78701", price: "$500,000",
  unformatted_price: "500000", beds: 3, baths: 2, area: 1800, img_src: null,
  detail_url: null, home_type: "Single family", home_status: "For sale", time_on_zillow: null,
  market: { id: 1, name: "Austin", slug: "austin", state: "TX" },
};

let rating = "best";
let draft = null;
let submission = null;

function dashboard() {
  return {
    summary: { total_properties: 1, submitted: Number(Boolean(submission)), in_progress: Number(Boolean(draft && !submission)), not_started: Number(!draft), average_accuracy: submission?.accuracy ?? null },
    properties: [{
      ...property, city: "Austin", state: "TX", zipcode: "78701", market_id: 1, market_name: "Austin",
      status: submission ? "submitted" : draft ? "in_progress" : "not_started", attempts: Number(Boolean(submission)),
      latest_accuracy: submission?.accuracy ?? null, latest_rating: submission?.rating ?? null,
      best_accuracy: submission?.accuracy ?? null, best_rating: submission?.rating ?? null,
      active_underwriting_id: draft && !submission ? 1 : null, latest_submission_id: submission?.id ?? null,
    }],
  };
}

function newDraft() {
  return {
    id: 1, zpid: property.zpid, is_reference: false, deal_status: "in_progress",
    property_address: property.address, street: property.address_street, city: "Austin", state: "TX",
    bedrooms: 3, bathrooms: "2", purchase_price: "500000", total_oop: null, prr: null,
    optimization_total: null, operating_expense_total: null, low_gross_revenue: null,
    mid_gross_revenue: null, high_gross_revenue: null, l_cash_on_cash: null,
    m_cash_on_cash: null, h_cash_on_cash: null, updated_at: new Date().toISOString(),
    detail: { purchase_details: null, forecasted_revenue: null, analyst_notes: null },
    taxes: null, optimization_items: [], operating_expenses: [],
  };
}

function saveDraft(payload) {
  draft.detail.purchase_details = payload.purchase_details ?? null;
  draft.detail.forecasted_revenue = payload.forecasted_revenue ?? null;
  draft.taxes = payload.taxes ? { ...payload.taxes, tax_savings: "8200" } : null;
  draft.optimization_items = (payload.optimization_items ?? []).map((item, index) => ({ ...item, id: index + 1 }));
  draft.operating_expenses = (payload.operating_expenses ?? []).map((item, index) => ({ ...item, id: index + 1 }));
  Object.assign(draft, payload.tags ?? {});
  draft.optimization_total = String(draft.optimization_items.reduce((sum, item) => sum + Number(item.total_price), 0));
  draft.operating_expense_total = String(draft.operating_expenses.reduce((sum, item) => sum + Number(item.monthly_amount), 0) * 12);
  if (draft.detail.purchase_details && draft.detail.forecasted_revenue && draft.taxes) {
    draft.total_oop = String(100000 + Number(draft.optimization_total));
    for (const key of ["low", "mid", "high"]) {
      const scenario = draft.detail.forecasted_revenue.scenarios[key];
      scenario.net_operating_income = String(Number(scenario.forecasted_revenue) - Number(draft.operating_expense_total));
      scenario.annual_free_cash_flow = String(Number(scenario.net_operating_income) - 30000);
      draft[`${key}_gross_revenue`] = scenario.forecasted_revenue;
      draft[`${key[0]}_cash_on_cash`] = "0.12";
    }
  }
  return draft;
}

function scoreDraft() {
  const expected = { best: "125000", medium: "100000", low: "60000" }[rating];
  const candidate = draft.detail.forecasted_revenue.scenarios.mid.forecasted_revenue;
  if (candidate !== expected) return null;
  const accuracy = { best: "100", medium: "70", low: "40" }[rating];
  const deviation = String(Math.abs(Number(candidate) - 125000) / 125000);
  return {
    id: 1, underwriting_id: 1, reference_underwriting_id: 2, zpid: property.zpid, rating, accuracy,
    breakdown: { rating, accuracy, metric: "mid_gross_revenue", label: "Mid annual revenue", candidate,
      reference: "125000", deviation, best_threshold: "0.10", medium_threshold: "0.25" },
    submitted_at: new Date().toISOString(),
  };
}

function send(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(body));
}

async function bodyOf(request) {
  let raw = "";
  for await (const chunk of request) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

createServer(async (request, response) => {
  const path = new URL(request.url, "http://127.0.0.1:8010").pathname;
  try {
    if (path === "/__health") return send(response, 200, { ok: true });
    if (path === "/__reset" && request.method === "POST") {
      const body = await bodyOf(request);
      if (!["best", "medium", "low"].includes(body.rating)) return send(response, 400, { detail: "Unknown fixture" });
      rating = body.rating; draft = null; submission = null;
      return send(response, 200, { ok: true });
    }
    if (path === "/api/dashboard") return send(response, 200, dashboard());
    if (path === `/api/properties/${property.zpid}`) return send(response, 200, property);
    if (path === "/api/markets/1") return send(response, 200, { id: 1, name: "Austin", state: "TX", region: "Central Texas", description: "Strong short-term rental demand in this training market.", property_count: 1 });
    if (path === "/api/underwritings" && request.method === "POST") {
      const body = await bodyOf(request);
      if (body.zpid !== property.zpid) return send(response, 404, { detail: "Property not found" });
      draft ??= newDraft();
      return send(response, 201, draft);
    }
    if (path === "/api/underwritings/1" && request.method === "GET" && draft) return send(response, 200, draft);
    if (path === "/api/underwritings/1" && request.method === "PUT" && draft) return send(response, 200, saveDraft(await bodyOf(request)));
    if (path === "/api/underwritings/1/submit" && request.method === "POST" && draft?.total_oop) {
      submission = scoreDraft();
      if (!submission) return send(response, 422, { detail: "Fixture revenue does not match the selected score" });
      draft.deal_status = "analyst_completed";
      return send(response, 200, { submission, underwriting: draft, dashboard: dashboard() });
    }
    if (path === "/api/submissions") return send(response, 200, submission ? [submission] : []);
    if (path === "/api/submissions/1" && submission) return send(response, 200, submission);
    return send(response, 404, { detail: "Not found" });
  } catch (error) {
    console.error(error);
    return send(response, 500, { detail: "Invalid fixture request" });
  }
}).listen(8010, "127.0.0.1", () => console.log("Playwright mock API listening on 8010"));
