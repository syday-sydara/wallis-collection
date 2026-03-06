export default function CheckoutProgress({ step }: { step: number }) {
  const steps = ["Cart", "Shipping", "Payment"];

  return (
    <div className="flex items-center justify-between mb-10">
      {steps.map((label, i) => {
        const active = i + 1 <= step;

        return (
          <div key={label} className="flex items-center gap-3">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                text-sm font-semibold
                ${
                  active
                    ? "bg-primary text-bg"
                    : "bg-neutral/20 text-neutral"
                }
              `}
            >
              {i + 1}
            </div>

            <span
              className={`text-sm ${
                active ? "text-primary" : "text-neutral"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}