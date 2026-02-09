import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function CtaSection() {
  return (
    <section className="bg-primary py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">Tidak Menemukan Posisi yang Tepat?</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-primary-foreground/80">Kirimkan CV Anda dan kami akan menghubungi Anda ketika ada posisi yang sesuai dengan profil Anda.</p>
        <Button size="lg" className="mt-8 bg-background text-foreground hover:bg-background/90 px-8 text-base font-semibold">
          <Send className="mr-2 h-5 w-5" />
          Kirim CV Anda
        </Button>
      </div>
    </section>
  );
}
