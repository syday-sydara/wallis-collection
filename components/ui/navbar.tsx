import Link from "next/link"

export function Navbar() {
  return (
    <nav className="w-full bg-white border-b p-4 flex justify-between">
      <Link href="/" className="font-bold text-lg">
        Wallis Executive Wax
      </Link>
    </nav>
  )
}