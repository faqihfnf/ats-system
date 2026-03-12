import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";

type Props = {
  jobTitle: string | null;
  company: string | null;
  startYear: number | null;
  endYear: string | null;
  yearsOfExperience: string;
};

export function WorkExperience({
  jobTitle,
  company,
  startYear,
  endYear,
  yearsOfExperience,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Briefcase className="h-4 w-4" />
          Work Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {jobTitle && company ? (
          <>
            <p className="text-sm font-semibold">{jobTitle}</p>
            <p className="text-muted-foreground text-sm">{company}</p>
            <p className="text-muted-foreground text-xs">
              {startYear} - {endYear === "present" ? "Present" : endYear}
            </p>
            <Badge variant="secondary" className="mt-2 text-xs">
              {yearsOfExperience}
            </Badge>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">
            Fresh Graduate / No Experience
          </p>
        )}
      </CardContent>
    </Card>
  );
}
