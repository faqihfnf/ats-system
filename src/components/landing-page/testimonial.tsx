import Image from "next/image";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sari Wulandari",
    role: "Senior Product Designer",
    tenure: "3 tahun di perusahaan",
    image: "/images/testimonial-1.jpg",
    quote: "Di sini saya benar-benar merasakan pertumbuhan karir yang pesat. Budaya kolaborasi yang kuat dan mentor-mentor hebat membuat saya terus berkembang setiap harinya.",
  },
  {
    name: "Andi Pratama",
    role: "Engineering Lead",
    tenure: "5 tahun di perusahaan",
    image: "/images/testimonial-2.jpg",
    quote: "Saya bergabung sebagai junior developer, dan sekarang memimpin tim engineering. Perusahaan benar-benar berinvestasi pada pengembangan karyawannya.",
  },
  {
    name: "Rina Kartika",
    role: "Business Development Manager",
    tenure: "2 tahun di perusahaan",
    image: "/images/testimonial-3.jpg",
    quote: "Work-life balance di sini bukan sekadar jargon. Fleksibilitas dan kepercayaan yang diberikan membuat saya bisa memberikan performa terbaik.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Testimoni</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Apa Kata Karyawan Kami</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">Dengarkan langsung dari mereka yang telah merasakan pengalaman bekerja bersama kami.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="relative flex flex-col rounded-xl border border-border bg-card p-8 transition-shadow hover:shadow-lg">
              <Quote className="mb-4 h-8 w-8 text-primary/20" />
              <blockquote className="mb-8 flex-1 text-base leading-relaxed text-card-foreground">{`"${testimonial.quote}"`}</blockquote>
              <div className="flex items-center gap-4 border-t border-border pt-6">
                <Image src={testimonial.image || "/placeholder.svg"} alt={`Foto ${testimonial.name}`} width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-muted-foreground/70">{testimonial.tenure}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
