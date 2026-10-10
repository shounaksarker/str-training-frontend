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
  low_gross_revenue: string | null;
  mid_gross_revenue: string | null;
  high_gross_revenue: string | null;
  updated_at: string | null;
  detail: {
    purchase_details: Record<string, unknown> | null;
    forecasted_revenue: Record<string, unknown> | null;
    analyst_notes: string | null;
  } | null;
}
