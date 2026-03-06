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
    <footer className="border-t border-neutral/20 bg-bg mt-20">
      <div className="container py-14 flex flex-col lg:flex-row lg:justify-between gap-12">

        {/* Brand + Social */}
        <div className="flex flex-col items-center lg:items-start gap-5">
          <h2 className="heading-3 text-primary tracking-tight">
            Wallis Executive Wax
          </h2>

          <div className="flex gap-5">
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
                <Icon size={22} />
              </a>
            ))}
          </div>

          <p className="label text-neutral">
            Crafted with care in every detail.
          </p>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral/20">
        <div className="container py-5 text-xs text-neutral text-center tracking-wide">
          © {currentYear} Wallis Executive Wax. All rights reserved.
        </div>
      </div>
    </footer>
  );
}