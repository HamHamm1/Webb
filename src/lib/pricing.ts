import type { Bundle, Provider } from "./types";

/**
 * Price a customer pays for a bundle (§6). Server-authoritative — never
 * trust a price sent from the client.
 *
 *   if provider.has_rank_pricing:
 *       price = rank override (if any) ?? bundle.price_default
 *   else:
 *       price = bundle.price_default        // xfxai: everyone the same
 */
export function priceForBundle(
  provider: Pick<Provider, "has_rank_pricing">,
  bundle: Pick<Bundle, "price_default">,
  rankOverridePrice: number | null | undefined
): number {
  if (provider.has_rank_pricing && rankOverridePrice != null) {
    return rankOverridePrice;
  }
  return bundle.price_default;
}

/**
 * Manual quota helper (§6): remaining messages from a wallet balance.
 *   remaining = floor(balance / divisor)   // cc ÷5, xfxai ÷2.5
 */
export function remainingMessages(balance: number, divisor: number): number {
  if (!divisor || divisor <= 0) return 0;
  return Math.floor(balance / divisor);
}
