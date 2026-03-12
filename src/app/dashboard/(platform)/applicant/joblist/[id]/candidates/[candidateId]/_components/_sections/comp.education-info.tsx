import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

type Props = {
  educationLevel: string;
  institution: string;
  startYear: number;
  endYear: string;
};

export function EducationInfo({
  educationLevel,
  institution,
  startYear,
  endYear,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="h-4 w-4" />
          Education
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm font-semibold">{educationLevel}</p>
        <p className="text-muted-foreground text-sm">{institution}</p>
        <p className="text-muted-foreground text-xs">
          {startYear} - {endYear === "present" ? "Present" : endYear}
        </p>
      </CardContent>
    </Card>
  );
}
