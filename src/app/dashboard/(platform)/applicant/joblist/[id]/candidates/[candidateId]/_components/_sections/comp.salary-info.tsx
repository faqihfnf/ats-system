import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

type Props = {
  currentSalary: number | null;
  expectedSalary: number;
};

export function SalaryInfo({ currentSalary, expectedSalary }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-4 w-4" />
          Salary Expectations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {currentSalary && (
          <div>
            <p className="text-muted-foreground text-xs">Current Salary</p>
            <p className="text-sm font-semibold">
              Rp {currentSalary.toLocaleString("id-ID")}
            </p>
          </div>
        )}
        <div>
          <p className="text-muted-foreground text-xs">Expected Salary</p>
          <p className="text-sm font-semibold">
            Rp {expectedSalary.toLocaleString("id-ID")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
