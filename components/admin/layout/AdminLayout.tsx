"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import AdminMobileSidebar from "./AdminMobileSidebar";

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[rgb(var(--bg-default))]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar */}
      <AdminMobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <AdminTopbar onMenuClick={() => setMobileOpen(true)} />

        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
