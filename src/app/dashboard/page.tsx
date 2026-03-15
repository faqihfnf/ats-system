import {
  getDashboardStats,
  getCandidatesByStage,
  getLatestApplications,
} from "./_actions/action.dashboard";
import { CandidatesByStageChart } from "./_components/comp.candidates-by-stage-chart";
import { LatestApplicationsTable } from "./_components/comp.latest-applications-table";
import { StatsCards } from "./_components/comp.stats-cards";

export default async function DashboardPage() {
  const [stats, stageData, latestApplications] = await Promise.all([
    getDashboardStats(),
    getCandidatesByStage(),
    getLatestApplications(),
  ]);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your recruitment pipeline.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Chart */}
      <CandidatesByStageChart data={stageData} />

      {/* Latest Applications Table */}
      <LatestApplicationsTable applications={latestApplications} />
    </div>
  );
}
