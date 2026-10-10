export type TrainingStatus = "not_started" | "in_progress" | "submitted";
export type AccuracyRating = "best" | "medium" | "low";

export interface DashboardProperty {
  zpid: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  price: string | null;
  unformatted_price: string | null;
  beds: number | null;
  baths: number | null;
  area: number | null;
  img_src: string | null;
  detail_url: string | null;
  home_type: string | null;
  market_id: number | null;
  market_name: string | null;
  status: TrainingStatus;
  attempts: number;
  latest_accuracy: string | null;
  latest_rating: AccuracyRating | null;
  best_accuracy: string | null;
  best_rating: AccuracyRating | null;
  active_underwriting_id: number | null;
  latest_submission_id: number | null;
}

export interface DashboardResult {
  summary: {
    total_properties: number;
    submitted: number;
    in_progress: number;
    not_started: number;
    average_accuracy: string | null;
  };
  properties: DashboardProperty[];
}

export interface PropertyRead {
  zpid: string;
  address: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zipcode: string | null;
  price: string | null;
  unformatted_price: string | null;
  beds: number | null;
  baths: number | null;
  area: number | null;
  home_type: string | null;
  home_status: string | null;
  time_on_zillow: string | null;
  detail_url: string | null;
  market: { id: number; name: string; slug: string; state: string | null } | null;
}

export interface UnderwritingRead {
  id: number;
  zpid: string | null;
  is_reference: boolean;
  deal_status: string | null;
  property_address: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  bedrooms: number | null;
  bathrooms: string | null;
  purchase_price: string | null;
  total_oop: string | null;
  prr: string | null;
  low_gross_revenue: string | null;
  mid_gross_revenue: string | null;
  high_gross_revenue: string | null;
  l_cash_on_cash: string | null;
  m_cash_on_cash: string | null;
  h_cash_on_cash: string | null;
  updated_at: string | null;
  detail: {
    purchase_details: PurchaseDetails | null;
    forecasted_revenue: ForecastedRevenue | null;
    analyst_notes: string | null;
  } | null;
  taxes: UnderwritingTaxes | null;
}

export interface PurchaseDetails {
  purchase_price: string;
  down_payment_pct: string;
  interest_rate: string;
  mortgage_years: number;
  closing_costs_pct: string;
  down_payment_amount?: string;
  loan_amount?: string;
  closing_costs_amount?: string;
}

export interface ForecastedRevenue {
  co_hosting_fee_pct: string;
  annual_re_appreciation_pct: string;
  scenarios: {
    low: { forecasted_revenue: string };
    mid: { forecasted_revenue: string };
    high: { forecasted_revenue: string };
  };
}

export interface UnderwritingTaxes {
  land_assumptions_pct: string | null;
  sla_multiplier_pct: string | null;
  bonus_amount_pct: string | null;
  tax_rate_pct: string | null;
  tax_savings: string | null;
}

export interface SaveUnderwritingPayload {
  purchase_details?: PurchaseDetails;
  forecasted_revenue?: ForecastedRevenue;
  taxes?: Pick<UnderwritingTaxes, "land_assumptions_pct" | "sla_multiplier_pct" | "bonus_amount_pct" | "tax_rate_pct">;
}

export interface SubmissionRead {
  id: number;
  underwriting_id: number;
  reference_underwriting_id: number | null;
  zpid: string;
  rating: AccuracyRating;
  accuracy: string;
  breakdown: {
    rating: AccuracyRating;
    accuracy: string;
    metric: string;
    label: string;
    candidate: string | null;
    reference: string | null;
    deviation: string;
    best_threshold: string;
    medium_threshold: string;
  };
  submitted_at: string;
}

export interface SubmitUnderwritingResult {
  submission: SubmissionRead;
  underwriting: UnderwritingRead;
  dashboard: DashboardResult;
}
