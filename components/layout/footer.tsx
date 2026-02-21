// File: components/layout/footer.tsx
import { FaInstagram, FaFacebookF, FaPinterestP } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="container mx-auto py-12 flex flex-col lg:flex-row lg:justify-between gap-8">

        {/* Left: Brand & Social */}
        <div className="flex flex-col items-center lg:items-start gap-4">
          <h2 className="font-heading text-lg text-gray-900">Wallis Executive Wax</h2>

          <div className="flex gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 transition-colors duration-400 ease-smooth" aria-label="Instagram">
              <FaInstagram size={20} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 transition-colors duration-400 ease-smooth" aria-label="Facebook">
              <FaFacebookF size={20} />
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 transition-colors duration-400 ease-smooth" aria-label="Pinterest">
              <FaPinterestP size={20} />
            </a>
          </div>

          <p className="text-xs text-gray-500 font-body">Crafted with care in every detail.</p>
        </div>

      </div>

      <div className="border-t border-gray-200 mt-8">
        <div className="container mx-auto py-4 text-sm text-gray-500 text-center">
          © {new Date().getFullYear()} Wallis Executive Wax. All rights reserved.
        </div>
      </div>
    </footer>
  );
}