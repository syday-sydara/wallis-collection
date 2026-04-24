"use client";

import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  MessageCircle,
  Percent,
} from "lucide-react";

export default function ProductIntelligence({ product, insights }) {
  if (!insights) {
    return (
      <div className="rounded-lg border border-border bg-surface-card p-6 text-center">
        <p className="text-text-muted">No analytics data yet.</p>
      </div>
    );
  }

  const vp = insights.variantPopularity || {};

  return (
    <div className="space-y-8">
      {/* KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI label="Views" value={insights.viewCount} icon={<BarChart3 />} />
        <KPI
          label="Add to Cart"
          value={insights.addToCartCount}
          icon={<ShoppingCart />}
        />
        <KPI
          label="WhatsApp Clicks"
          value={insights.whatsappClickCount}
          icon={<MessageCircle />}
        />
        <KPI
          label="Purchases"
          value={insights.purchaseCount}
          icon={<TrendingUp />}
        />
      </div>

      {/* RATES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Rate label="Add to Cart Rate" value={insights.addToCartRate} />
        <Rate label="Checkout Click Rate" value={insights.checkoutClickRate} />
        <Rate label="WhatsApp Click Rate" value={insights.whatsappClickRate} />
        <Rate label="Conversion Rate" value={insights.conversionRate} />
      </div>

      {/* VARIANT PERFORMANCE */}
      {product.variants.length > 0 && (
        <div className="rounded-lg border border-border bg-surface-card p-6">
          <h2 className="text-lg font-semibold mb-4">Variant Performance</h2>

          <div className="space-y-3">
            {product.variants.map((v) => {
              const stats = vp[v.id] || {
                views: 0,
                addToCart: 0,
                purchases: 0,
              };

              const label = Object.values(v.attributes).join(" / ");

              const viewShare =
                insights.viewCount > 0
                  ? ((stats.views / insights.viewCount) * 100).toFixed(1)
                  : "0";

              return (
                <div
                  key={v.id}
                  className="p-3 rounded-md border border-border bg-surface"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{label}</p>
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Percent className="h-3 w-3" />
                      {viewShare}%
                    </span>
                  </div>

                  <p className="text-sm text-text-muted mt-1">
                    Views: {stats.views} • Add to Cart: {stats.addToCart} •
                    Purchases: {stats.purchases}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ label, value, icon }) {
  return (
    <div className="rounded-lg border border-border bg-surface-card p-4">
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <div>
          <p className="text-sm text-text-muted">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Rate({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-surface-card p-4">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="text-xl font-semibold">{(value * 100).toFixed(1)}%</p>
    </div>
  );
}
