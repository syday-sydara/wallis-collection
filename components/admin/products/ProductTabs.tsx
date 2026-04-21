"use client";

import { useState } from "react";
import GeneralTab from "./tabs/GeneralTab";
import ImagesTab from "./tabs/ImagesTab";
import VariantsTab from "./tabs/VariantsTab";
import InventoryTab from "./tabs/InventoryTab";

const tabs = [
  { key: "general", label: "General" },
  { key: "images", label: "Images" },
  { key: "variants", label: "Variants" },
  { key: "inventory", label: "Inventory" },
];

export default function ProductTabs({ product }) {
  const [active, setActive] = useState("general");

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-border-default">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition
              ${
                active === t.key
                  ? "border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
        {active === "general" && <GeneralTab product={product} />}
        {active === "images" && <ImagesTab product={product} />}
        {active === "variants" && <VariantsTab product={product} />}
        {active === "inventory" && <InventoryTab product={product} />}
      </div>
    </div>
  );
}
