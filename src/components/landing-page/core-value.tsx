import { Heart, Lightbulb, Users, Rocket, Shield, Target } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Integritas",
    description: "Kami menjunjung tinggi kejujuran dan transparansi dalam setiap tindakan. Kepercayaan adalah fondasi dari segala hal yang kami bangun.",
  },
  {
    icon: Lightbulb,
    title: "Inovasi",
    description: "Kami terus mendorong batas kemungkinan dengan ide-ide baru dan pendekatan kreatif untuk menyelesaikan tantangan terbesar.",
  },
  {
    icon: Users,
    title: "Kolaborasi",
    description: "Keberhasilan kami lahir dari kerja tim. Kami percaya bahwa bersama-sama, kami mampu mencapai lebih dari yang pernah dibayangkan.",
  },
  {
    icon: Rocket,
    title: "Pertumbuhan",
    description: "Kami berkomitmen untuk mengembangkan setiap individu. Di sini, Anda tidak hanya bekerja tetapi juga berkembang sebagai profesional.",
  },
  {
    icon: Shield,
    title: "Tanggung Jawab",
    description: "Setiap anggota tim memiliki rasa kepemilikan terhadap pekerjaannya dan bertanggung jawab penuh atas kontribusinya.",
  },
  {
    icon: Target,
    title: "Dampak Nyata",
    description: "Kami fokus pada pekerjaan yang bermakna dan menghasilkan dampak positif bagi pelanggan, mitra, dan masyarakat.",
  },
];

export function CoreValuesSection() {
  return (
    <section id="nilai" className="bg-background py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Nilai Perusahaan</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Nilai yang Kami Pegang Teguh</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">Nilai-nilai ini menjadi panduan kami dalam bekerja, berinovasi, dan membangun budaya perusahaan yang positif.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <value.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-card-foreground">{value.title}</h3>
              <p className="text-base leading-relaxed text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
