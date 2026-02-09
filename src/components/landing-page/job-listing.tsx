"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Banknote, ArrowRight } from "lucide-react";

const departments = ["Semua", "Engineering", "Design", "Marketing", "Bisnis", "Operasional"];

const jobs = [
  {
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "Jakarta",
    type: "Full-time",
    salary: "Rp 18 - 28 Jt/bulan",
    tags: ["React", "TypeScript", "Next.js"],
    isNew: true,
  },
  {
    title: "Backend Engineer",
    department: "Engineering",
    location: "Jakarta / Remote",
    type: "Full-time",
    salary: "Rp 15 - 25 Jt/bulan",
    tags: ["Node.js", "PostgreSQL", "AWS"],
    isNew: true,
  },
  {
    title: "UI/UX Designer",
    department: "Design",
    location: "Jakarta",
    type: "Full-time",
    salary: "Rp 12 - 20 Jt/bulan",
    tags: ["Figma", "User Research", "Prototyping"],
    isNew: false,
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    salary: "Rp 14 - 22 Jt/bulan",
    tags: ["Design System", "Figma", "Design Thinking"],
    isNew: false,
  },
  {
    title: "Digital Marketing Specialist",
    department: "Marketing",
    location: "Jakarta",
    type: "Full-time",
    salary: "Rp 10 - 16 Jt/bulan",
    tags: ["SEO", "Google Ads", "Analytics"],
    isNew: true,
  },
  {
    title: "Content Strategist",
    department: "Marketing",
    location: "Jakarta / Remote",
    type: "Full-time",
    salary: "Rp 8 - 14 Jt/bulan",
    tags: ["Content Marketing", "Copywriting", "Social Media"],
    isNew: false,
  },
  {
    title: "Business Development Manager",
    department: "Bisnis",
    location: "Jakarta",
    type: "Full-time",
    salary: "Rp 18 - 30 Jt/bulan",
    tags: ["B2B Sales", "Partnership", "Strategy"],
    isNew: false,
  },
  {
    title: "HR & People Operations",
    department: "Operasional",
    location: "Jakarta",
    type: "Full-time",
    salary: "Rp 10 - 18 Jt/bulan",
    tags: ["Recruitment", "People Ops", "Culture"],
    isNew: true,
  },
];

export function JobListingsSection() {
  const [activeDept, setActiveDept] = useState("Semua");

  const filteredJobs = activeDept === "Semua" ? jobs : jobs.filter((job) => job.department === activeDept);

  return (
    <section id="lowongan" className="bg-secondary py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Lowongan</p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Pilih Karir Anda</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">Temukan posisi yang sesuai dengan keahlian dan passion Anda. Kami selalu mencari talenta terbaik untuk bergabung.</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                activeDept === dept ? "bg-primary text-primary-foreground shadow-md" : "bg-background text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Job Cards */}
        <div className="grid gap-5 md:grid-cols-2">
          {filteredJobs.map((job) => (
            <article key={job.title} className="group flex flex-col rounded-xl border border-border bg-background p-6 transition-all hover:border-primary/30 hover:shadow-lg">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                    {job.isNew && <Badge className="bg-accent text-accent-foreground text-xs px-2 py-0.5">Baru</Badge>}
                  </div>
                  <p className="text-sm font-medium text-primary">{job.department}</p>
                </div>
              </div>

              <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {job.type}
                </span>
                <span className="flex items-center gap-1.5">
                  <Banknote className="h-4 w-4" />
                  {job.salary}
                </span>
              </div>

              <div className="mb-6 flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto">
                <Button variant="outline" className="w-full justify-between border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all group-hover:border-primary bg-transparent">
                  Lamar Sekarang
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </article>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">Belum ada lowongan untuk departemen ini saat ini.</p>
            <p className="mt-2 text-sm text-muted-foreground">Silakan cek kembali nanti atau lihat posisi lainnya.</p>
          </div>
        )}
      </div>
    </section>
  );
}
