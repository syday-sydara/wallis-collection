"use client";

import OrderRow from "./OrderRow";

export default function OrderTable({ orders }: { orders: any[] }) {
  if (!orders.length) {
    return (
      <div className="text-center py-12 text-text-secondary">
        No orders yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border-default rounded-md bg-[rgb(var(--bg-card))]">
      <table className="w-full text-sm">
        <thead className="bg-[rgb(var(--surface-muted))] text-text-secondary">
          <tr>
            <th className="p-3 text-left font-medium">Order</th>
            <th className="p-3 text-left font-medium">Customer</th>
            <th className="p-3 text-left font-medium">Total</th>
            <th className="p-3 text-left font-medium">Payment</th>
            <th className="p-3 text-left font-medium">Status</th>
            <th className="p-3 text-left font-medium">Created</th>
            <th className="p-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
