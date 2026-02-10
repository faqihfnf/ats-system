"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

// const navLinks = [
//   { label: "Nilai Kami", href: "#nilai" },
//   { label: "Mengapa Bergabung", href: "#mengapa" },
//   { label: "Testimoni", href: "#testimoni" },
//   { label: "Lowongan", href: "#lowongan" },
// ];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 shadow-md backdrop-blur-md" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className={`text-xl font-bold tracking-tight transition-colors ${scrolled ? "text-foreground" : "text-primary-foreground"}`}>
          Perusahaan
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {/* {navLinks.map((link) => (
            <a key={link.href} href={link.href} className={`text-sm font-medium transition-colors hover:text-primary ${scrolled ? "text-muted-foreground" : "text-primary-foreground/80 hover:text-primary-foreground"}`}>
              {link.label}
            </a>
          ))} */}
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <a href="#lowongan">Lamar Sekarang</a>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden transition-colors ${scrolled ? "text-foreground" : "text-primary-foreground"}`} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 pb-6 pt-4 md:hidden">
          {/* {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block py-3 text-sm font-medium text-foreground hover:text-primary">
              {link.label}
            </a>
          ))} */}
          <Button className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
            <a href="#lowongan" onClick={() => setMobileOpen(false)}>
              Lamar Sekarang
            </a>
          </Button>
        </div>
      )}
    </nav>
  );
}
