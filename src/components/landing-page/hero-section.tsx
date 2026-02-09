import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/images/career-hero.jpg" alt="Tim kami bekerja bersama di kantor" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-foreground/70" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary-foreground/70">Karir</p>
        <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">Bangun Masa Depan Bersama Kami</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/80">Kami percaya bahwa orang-orang hebat menciptakan produk hebat. Bergabunglah dengan tim kami dan jadilah bagian dari perjalanan luar biasa ini.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-base font-semibold" asChild>
            <a href="#lowongan">Lihat Lowongan</a>
          </Button>
          <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 text-base bg-transparent" asChild>
            <a href="#nilai">Kenali Kami</a>
          </Button>
        </div>
      </div>

      <a href="#nilai" className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce text-primary-foreground/60 hover:text-primary-foreground transition-colors" aria-label="Scroll ke bawah">
        <ArrowDown className="h-6 w-6" />
      </a>
    </section>
  );
}
