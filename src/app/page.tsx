import { CoreValuesSection } from "../components/landing-page/core-value";
import { HeroSection } from "../components/landing-page/hero-section";
import { Navbar } from "../components/landing-page/navbar";
import { TestimonialsSection } from "../components/landing-page/testimonial";
import { WhyJoinSection } from "../components/landing-page/why-join";
import { CtaSection } from "../components/landing-page/call-to-action";
import JobListingsSection from "@/components/landing-page/job-listing";
import Footer from "@/components/landing-page/footer";

export default function Home() {
  return (
    <main suppressHydrationWarning>
      <Navbar />
      {/* <HeroSection /> */}
      {/* <CoreValuesSection /> */}
      {/* <WhyJoinSection /> */}
      {/* <TestimonialsSection /> */}
      <JobListingsSection />
      {/* <CtaSection /> */}
      <Footer />
    </main>
  );
}
