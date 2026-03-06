"use client";

export function ShippingForm() {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <input placeholder="First Name" className="input" />
        <input placeholder="Last Name" className="input" />
      </div>

      <input placeholder="Email Address" className="input" />
      <input placeholder="Phone Number" className="input" />
      <input placeholder="Street Address" className="input" />

      <div className="grid sm:grid-cols-2 gap-6">
        <input placeholder="City" className="input" />
        <input placeholder="Postal Code" className="input" />
      </div>
    </div>
  );
}