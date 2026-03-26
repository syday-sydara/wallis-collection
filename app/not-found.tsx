"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center overflow-hidden">
      
      {/* Animated Illustration */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-10"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src="/brand/not-found-illustration.svg"
            alt="Page not found"
            width={220}
            height={220}
            className="mx-auto opacity-90"
          />
        </motion.div>
      </motion.div>

      {/* Animated Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-3xl font-semibold tracking-tight text-text-primary mb-4"
      >
        Page Not Found
      </motion.h1>

      {/* Animated Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="text-text-secondary max-w-md mb-8 leading-relaxed"
      >
        We couldn’t find the page you were looking for.
        It may have been moved, renamed, or is no longer available.
      </motion.p>

      {/* Animated CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Link
          href="/"
          className="px-6 py-2 rounded-md bg-[var(--color-accent-500)] text-white hover:bg-[var(--color-accent-600)] transition transform hover:-translate-y-0.5"
        >
          Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
