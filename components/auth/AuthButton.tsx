export function AuthButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-full bg-black text-white p-3 rounded-lg hover:bg-neutral-800 transition">
      {children}
    </button>
  );
}