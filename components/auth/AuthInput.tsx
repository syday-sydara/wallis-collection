export function AuthInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-black outline-none"
    />
  );
}