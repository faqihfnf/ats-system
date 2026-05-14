"use client";

import Image from "next/image";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-[#1a3a8f]">
      <div className="mx-auto flex max-w-6xl items-center px-6 py-3">
        <a href="/">
          <Image
            src="/logo.png"
            alt="Logo"
            width={240}
            height={80}
            className="h-10 w-auto"
            priority
          />
        </a>
      </div>
    </nav>
  );
}
