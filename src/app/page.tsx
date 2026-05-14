import { Navbar } from "../components/landing-page/navbar";
import JobListingsSection from "@/components/landing-page/job-listing";
import Footer from "@/components/landing-page/footer";
import { getPublicJobs, getDivisions, getLevels } from "./(public)/_actions/action.public";

export default async function Home() {
  const [jobs, divisions, levels] = await Promise.all([
    getPublicJobs(),
    getDivisions(),
    getLevels(),
  ]);

  return (
    <main suppressHydrationWarning>
      <Navbar />
      <JobListingsSection jobs={jobs} divisions={divisions} levels={levels} />
      <Footer />
    </main>
  );
}
