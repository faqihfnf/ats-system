import { CoreValuesSection } from "../components/landing-page/core-value";
import { Footer } from "../components/landing-page/footer";
import { HeroSection } from "../components/landing-page/hero-section";
import { Navbar } from "../components/landing-page/navbar";
import { TestimonialsSection } from "../components/landing-page/testimonial";
import { WhyJoinSection } from "../components/landing-page/why-join";
import { CtaSection } from "../components/landing-page/call-to-action";
import JobListingsSection from "@/components/landing-page/job-listing";

type Props = {
  searchParams: Promise<{ divisi?: string }>;
};

export default async function Home({ searchParams }: Props) {
  // Tunggu searchParams dari URL
  const resolvedParams = await searchParams;
  return (
    <main suppressHydrationWarning>
      <Navbar />
      <HeroSection />
      <CoreValuesSection />
      <WhyJoinSection />
      <TestimonialsSection />
      <JobListingsSection searchParams={resolvedParams} />
      <CtaSection />
      <Footer />
    </main>
  );
}
