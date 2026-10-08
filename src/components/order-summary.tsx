import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD_CENTS, remainingForFreeShipping } from "@/lib/pricing";

type Props = {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  vatCents: number;
  showFreeShippingGauge?: boolean;
};

export function OrderSummary({ subtotalCents, shippingCents, totalCents, vatCents, showFreeShippingGauge }: Props) {
  const remaining = remainingForFreeShipping(subtotalCents);
  const progress = Math.min(100, Math.round((subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100));

  return (
    <div>
      {showFreeShippingGauge && (
        <div className="mb-5">
          <p className="text-sm font-medium">
            {remaining > 0 ? (
              <>
                Plus que <strong>{formatPrice(remaining)}</strong> pour la livraison offerte.
              </>
            ) : (
              <>Livraison offerte, bien joué !</>
            )}
          </p>
          <div
            className="mt-2 h-3 overflow-hidden rounded-full border border-line bg-paper"
            role="progressbar"
            aria-label="Progression vers la livraison offerte"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full bg-blaze transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Sous-total</dt>
          <dd className="font-mono">{formatPrice(subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-soft">Livraison Colissimo</dt>
          <dd className="font-mono">{shippingCents === 0 ? "Offerte" : formatPrice(shippingCents)}</dd>
        </div>
        <div className="flex justify-between border-t border-ink pt-3 text-base font-bold">
          <dt>Total TTC</dt>
          <dd className="font-mono">{formatPrice(totalCents)}</dd>
        </div>
        <div className="flex justify-between text-xs text-muted">
          <dt>dont TVA (20 %)</dt>
          <dd className="font-mono">{formatPrice(vatCents)}</dd>
        </div>
      </dl>
    </div>
  );
}
