export function CheckoutSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <h2 className="heading-3 text-primary">{title}</h2>
      {children}
    </section>
  );
}