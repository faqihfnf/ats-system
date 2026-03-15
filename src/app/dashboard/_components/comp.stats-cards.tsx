import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, UserCheck } from "lucide-react";
import Link from "next/link";

type Props = {
  stats: {
    totalJobs: number;
    newCandidates: number;
    totalCandidates: number;
  };
};

export function StatsCards({ stats }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Jobs */}
      <Link href="/dashboard/applicant/joblist">
        <Card className="cursor-pointer transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Job Posts
            </CardTitle>
            <Briefcase className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-muted-foreground text-xs">
              Currently open positions
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* New Candidates (This Month) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Candidates</CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.newCandidates}</div>
          <p className="text-muted-foreground text-xs">
            Applications this month
          </p>
        </CardContent>
      </Card>

      {/* Total Candidates (All Time) - UPDATED */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Candidates
          </CardTitle>
          <UserCheck className="text-primary h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-primary text-2xl font-bold">
            {stats.totalCandidates}
          </div>
          <p className="text-muted-foreground text-xs">
            All applications in database
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
