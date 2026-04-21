"use client";

export default function AdminTopbar({ onMenuClick }) {
  return (
    <header className="h-14 border-b border-border-default bg-[rgb(var(--surface-card))] flex items-center px-4 justify-between">
      {/* Mobile menu button */}
      <button
        className="lg:hidden text-text-primary"
        onClick={onMenuClick}
      >
        ☰
      </button>

      <div className="font-medium text-text-primary">Admin Panel</div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[rgb(var(--surface-muted))]" />
      </div>
    </header>
  );
}
