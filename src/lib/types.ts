// Shared domain types for Hammie World.

export type ProviderName = "cc" | "xfxai";
export type ModelStatus = "ok" | "unstable";
export type OrderStatus =
  | "pending_slip"
  | "awaiting_review"
  | "approved"
  | "rejected"
  | "cancelled";
export type KeyStatus = "available" | "reserved" | "sold" | "dead";

export interface Provider {
  id: string;
  name: string;
  display_name: string;
  divisor: number;
  quota_check_url: string | null;
  base_url: string | null;
  highlight_tag: string | null;
  has_rank_pricing: boolean;
  sort: number;
  is_active: boolean;
}

export interface Model {
  id: string;
  name: string;
  description: string | null;
  no_expiry_note: string | null;
  sort: number;
}

export interface ProviderModel {
  id: string;
  provider_id: string;
  model_id: string;
  status: ModelStatus;
  is_active: boolean;
}

export interface Bundle {
  id: string;
  provider_model_id: string;
  messages: number;
  price_default: number;
  bonus_note: string | null;
  featured: boolean;
  is_active: boolean;
}

export interface Rank {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  default_icon: string | null;
  sort: number;
}

export interface Customer {
  id: string;
  auth_user_id: string | null;
  code: string;
  display_name: string;
  rank_id: string | null;
  points: number;
  total_baht: number;
  is_admin: boolean;
  notes: string | null;
  special: string | null;
  is_active: boolean;
}

export interface Order {
  id: string;
  customer_id: string | null;
  code: string | null;
  source: "web" | "offline";
  provider_id: string | null;
  model_id: string | null;
  messages: number;
  amount_baht: number;
  api_label: string | null;
  status: OrderStatus;
  slip_url: string | null;
  assigned_key_id: string | null;
  note: string | null;
  reject_reason: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface StoreSettings {
  id: number;
  name: string | null;
  subtitle: string | null;
  description: string | null;
  discord_link: string | null;
  discord_user: string | null;
  footer: string | null;
  payment_qr_url: string | null;
  bank_text: string | null;
  hours_open: string | null;
  hours_close: string | null;
  hours_days: number[];
  assets: Record<string, string>;
  status: Record<string, string>;
}
