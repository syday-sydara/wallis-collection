// components/admin/payments/PaymentTable.tsx

import Link from "next/link";

export default function PaymentTable({ payments }: { payments: any[] }) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-surface-muted text-text-secondary">
          <tr>
            <th className="p-3 text-left">Reference</th>
            <th className="p-3 text-left">Order</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Provider</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Fraud Score</th>
            <th className="p-3 text-left">Created</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-t hover:bg-surface-muted">
              <td className="p-3 font-medium">{p.reference}</td>

              <td className="p-3">
                <Link
                  href={`/admin/orders/${p.orderId}`}
                  className="text-primary underline"
                >
                  #{p.orderId}
                </Link>
              </td>

              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    p.status === "SUCCESS"
                      ? "bg-success/15 text-success"
                      : p.status === "FAILED"
                      ? "bg-danger/15 text-danger"
                      : p.status === "REVIEW"
                      ? "bg-orange-500/15 text-orange-500"
                      : p.status === "CHARGEBACK"
                      ? "bg-danger/15 text-danger"
                      : p.status === "REFUNDED"
                      ? "bg-success/15 text-success"
                      : "bg-surface-muted text-text-secondary"
                  }`}
                >
                  {p.status}
                </span>
              </td>

              <td className="p-3">{p.provider}</td>

              <td className="p-3">₦{p.amount}</td>

              <td className="p-3">
                {p.fraudScore != null ? (
                  <span
                    className={
                      p.fraudScore > 70
                        ? "text-danger font-semibold"
                        : p.fraudScore > 40
                        ? "text-warning font-semibold"
                        : "text-success font-semibold"
                    }
                  >
                    {p.fraudScore}
                  </span>
                ) : (
                  <span className="text-text-muted">—</span>
                )}
              </td>

              <td className="p-3 text-text-muted">
                {new Date(p.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {payments.length === 0 && (
        <p className="p-6 text-center text-text-muted">No payments found.</p>
      )}
    </div>
  );
}
