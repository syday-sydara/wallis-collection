"use client";

export default function PaymentPlaceholder() {
  return (
    <div className="rounded-xl border border-neutral/20 p-6 bg-bg shadow-card space-y-4">
      <h2 className="heading-3 text-primary">Payment</h2>

      <p className="text-neutral text-sm leading-relaxed">
        Payment integration is coming soon. For now, this is a placeholder
        section where your payment provider (Paystack, Stripe, Flutterwave, etc.)
        will appear.
      </p>

      <div className="rounded-lg border border-dashed border-neutral/30 p-6 text-center text-neutral text-sm">
        Payment UI Placeholder
      </div>
    </div>
  );
}