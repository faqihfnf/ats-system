import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  getAIRecommendationBadgeClass,
  getAIRecommendationIcon,
  getAIRecommendationShort,
} from "@/lib/helpers/candidate-helper";
import { cn } from "@/lib/utils";

type Application = {
  id: string;
  fullName: string;
  createdAt: Date;
  aiRecommendation: string | null;
  aiMatchPercentage: number | null;
  job: {
    id: string;
    position: {
      nama: string;
    };
  };
  currentStage: {
    name: string;
  } | null;
};

type Props = {
  applications: Application[];
};

export function LatestApplicationsTable({ applications }: Props) {
  if (applications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center text-sm">
            No applications yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Applications</CardTitle>
        <p className="text-muted-foreground text-sm">
          Most recent candidate applications
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Job Position</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="text-center">AI Score</TableHead>
              <TableHead className="text-center">Recomendation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => {
              const initials = app.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <TableRow key={app.id}>
                  {/* Candidate Name */}
                  <TableCell>
                    <Link
                      href={`/dashboard/applicant/joblist/${app.job.id}/candidates/${app.id}`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{app.fullName}</span>
                    </Link>
                  </TableCell>

                  {/* Job Position */}
                  <TableCell>
                    <Link
                      href={`/dashboard/applicant/joblist/${app.job.id}/candidates`}
                      className="text-sm hover:underline"
                    >
                      {app.job.position.nama}
                    </Link>
                  </TableCell>

                  {/* Applied Time */}
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(app.createdAt), {
                      addSuffix: true,
                      locale: idLocale,
                    })}
                  </TableCell>

                  {/* Stage */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary text-xs"
                    >
                      {app.currentStage?.name || "Not Set"}
                    </Badge>
                  </TableCell>

                  {/* AI Score */}
                  <TableCell className="text-center">
                    {app.aiMatchPercentage !== null ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-medium">
                          {app.aiMatchPercentage}%
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Not Scored
                      </Badge>
                    )}
                  </TableCell>

                  {/* AI Recommendation */}
                  <TableCell className="text-center">
                    {(app.aiRecommendation && (
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                          getAIRecommendationBadgeClass(app.aiRecommendation),
                        )}
                      >
                        {(() => {
                          const Icon = getAIRecommendationIcon(
                            app.aiRecommendation,
                          );
                          return <Icon className="h-3 w-3" />;
                        })()}
                        {getAIRecommendationShort(app.aiRecommendation)}
                      </div>
                    )) || (
                      <Badge variant="outline" className="text-xs">
                        Not Analyzed
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
