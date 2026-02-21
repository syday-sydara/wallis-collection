export default function Footer() {
  return (
    <footer className="border-t border-neutral mt-16">
      <div className="container py-8 text-sm text-neutral flex flex-col items-center gap-2">
        <p>© {new Date().getFullYear()} Wallis. All rights reserved.</p>
        <p className="text-xs opacity-70">Crafted with care in every detail.</p>
      </div>
    </footer>
  );
}