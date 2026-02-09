import { Briefcase, GraduationCap, HeartHandshake, TrendingUp, Coffee, Globe } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Jenjang Karir yang Jelas",
    description: "Program pengembangan karir terstruktur dengan evaluasi berkala untuk memastikan pertumbuhan Anda.",
  },
  {
    icon: GraduationCap,
    title: "Pelatihan & Pengembangan",
    description: "Akses ke program pelatihan, workshop, dan sertifikasi profesional untuk meningkatkan keahlian Anda.",
  },
  {
    icon: HeartHandshake,
    title: "Benefit Kompetitif",
    description: "Gaji kompetitif, asuransi kesehatan lengkap, bonus kinerja, dan berbagai tunjangan menarik lainnya.",
  },
  {
    icon: Coffee,
    title: "Work-Life Balance",
    description: "Fleksibilitas kerja hybrid, cuti yang cukup, dan lingkungan kerja yang mendukung keseimbangan hidup.",
  },
  {
    icon: Briefcase,
    title: "Proyek Menantang",
    description: "Kesempatan bekerja pada proyek berdampak besar dengan teknologi terkini dan tim yang inspiratif.",
  },
  {
    icon: Globe,
    title: "Budaya Inklusif",
    description: "Lingkungan kerja yang menghargai keberagaman, ide-ide segar, dan kontribusi setiap individu.",
  },
];

export function WhyJoinSection() {
  return (
    <section className="bg-secondary py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Mengapa Bergabung</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Mengapa Harus Bergabung dengan Kami?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">Kami menawarkan lebih dari sekadar pekerjaan. Di sini Anda akan menemukan lingkungan yang mendukung pertumbuhan dan kebahagiaan Anda.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex gap-5 rounded-xl bg-background p-6 transition-shadow hover:shadow-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <benefit.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
