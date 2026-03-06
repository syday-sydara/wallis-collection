// File: components/layout/footer.tsx
import { FaInstagram, FaFacebookF, FaPinterestP } from "react-icons/fa";
import Link from "next/link";

const SOCIAL_LINKS = [
  {
    icon: FaInstagram,
    label: "Instagram",
    href: "https://instagram.com",
    ariaLabel: "Visit our Instagram",
  },
  {
    icon: FaFacebookF,
    label: "Facebook",
    href: "https://facebook.com",
    ariaLabel: "Visit our Facebook",
  },
  {
    icon: FaPinterestP,
    label: "Pinterest",
    href: "https://pinterest.com",
    ariaLabel: "Visit our Pinterest",
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg mt-20">
      <div className="container py-12 flex flex-col lg:flex-row lg:justify-between gap-10">

        {/* Brand + Social */}
        <div className="flex flex-col items-center lg:items-start gap-4">
          <h2 className="font-heading text-lg text-primary">
            Wallis Executive Wax
          </h2>

          <div className="flex gap-4">
            {SOCIAL_LINKS.map(({ icon: Icon, label, href, ariaLabel }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ariaLabel}
                title={label}
                className="text-secondary hover:text-primary transition-colors duration-400 ease-smooth"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>

          <p className="text-xs text-neutral font-body">
            Crafted with care in every detail.
          </p>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container py-4 text-sm text-neutral text-center">
          © {currentYear} Wallis Executive Wax. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
