export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 text-center">{title}</h1>
      <div className="space-y-4">{children}</div>
    </div>
  );
}