interface LabelProps {
  children: React.ReactNode;
}

export default function Label({ children }: LabelProps) {
  return (
    <label className="text-xs uppercase tracking-widest text-neutral-600">
      {children}
    </label>
  );
}