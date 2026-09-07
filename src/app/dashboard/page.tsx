import {
  getDashboardStats,
  getCandidatesByStage,
  getLatestApplications,
  getApplicantTrend,
  getApplicantsBySource,
} from "./_actions/action.dashboard";
import { CandidatesByStageChart } from "./_components/comp.candidates-by-stage-chart";
import { LatestApplicationsTable } from "./_components/comp.latest-applications-table";
import { StatsCards } from "./_components/comp.stats-cards";
import { DashboardPeriodFilter } from "./_components/comp.dashboard-period-filter";
import { ApplicantTrendChart } from "./_components/comp.applicant-trend-chart";
import { ApplicantsBySourceChart } from "./_components/comp.applicants-by-source-chart";

type Props = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const period = await searchParams;
  const [stats, stageData, latestApplications, trendData, sourceData] = await Promise.all([
    getDashboardStats(period),
    getCandidatesByStage(period),
    getLatestApplications(period),
    getApplicantTrend(period),
    getApplicantsBySource(period),
  ]);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">Monitoring recruitment pipeline dan aktivitas applicant.</p>
          <DashboardPeriodFilter />
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Chart */}
      <CandidatesByStageChart data={stageData} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ApplicantTrendChart data={trendData} />
        <ApplicantsBySourceChart data={sourceData} />
      </div>

      {/* Latest Applications Table */}
      <LatestApplicationsTable applications={latestApplications} />
    </div>
  );
}
