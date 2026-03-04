// File: components/layout/footer.tsx
import { FaInstagram, FaFacebookF, FaPinterestP } from "react-icons/fa";
import Link from "next/link";

const SOCIAL_LINKS = [
  {
    icon: FaInstagram,
    label: "Instagram",
    href: "https://instagram.com", // TODO: Update with actual business Instagram URL
    ariaLabel: "Visit our Instagram",
  },
  {
    icon: FaFacebookF,
    label: "Facebook",
    href: "https://facebook.com", // TODO: Update with actual business Facebook URL
    ariaLabel: "Visit our Facebook",
  },
  {
    icon: FaPinterestP,
    label: "Pinterest",
    href: "https://pinterest.com", // TODO: Update with actual business Pinterest URL
    ariaLabel: "Visit our Pinterest",
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="container mx-auto py-12 flex flex-col lg:flex-row lg:justify-between gap-8">

        {/* Left: Brand & Social */}
        <div className="flex flex-col items-center lg:items-start gap-4">
          <h2 className="font-heading text-lg text-gray-900">Wallis Executive Wax</h2>

          <div className="flex gap-4">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href, ariaLabel }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 transition-colors duration-400 ease-smooth"
                aria-label={ariaLabel}
                title={label}
              >
                <Icon size={20} />
              </a>
            ))}
          </div>

          <p className="text-xs text-gray-500 font-body">Crafted with care in every detail.</p>
        </div>

      </div>

      <div className="border-t border-gray-200 mt-8">
        <div className="container mx-auto py-4 text-sm text-gray-500 text-center">
          © {currentYear} Wallis Executive Wax. All rights reserved.
        </div>
      </div>
    </footer>
  );
}