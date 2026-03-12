import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Props = {
  fullName: string;
  initials: string;
  position: string;
  currentStage: string | null;
  status: string;
  appliedDate: Date;
};

export function ProfileHeader({
  fullName,
  initials,
  position,
  currentStage,
  status,
  appliedDate,
}: Props) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{fullName}</h2>
            <p className="text-muted-foreground text-sm">{position}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge>{currentStage || "No Stage"}</Badge>
            <Badge variant="outline">{status}</Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Applied {format(appliedDate, "PPP", { locale: idLocale })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
