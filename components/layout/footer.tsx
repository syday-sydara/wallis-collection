export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-neutral-400">
        <p>© {new Date().getFullYear()} Wallis. All rights reserved.</p>
      </div>
    </footer>
  );
} 