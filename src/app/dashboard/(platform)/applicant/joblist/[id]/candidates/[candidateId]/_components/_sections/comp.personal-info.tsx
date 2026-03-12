import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Church } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { InfoItem } from "./comp.info-item";

type Props = {
  birthPlace: string;
  birthDate: Date;
  age: number;
  gender: string;
  religion: string;
  ktpAddress: string;
  domicileAddress: string;
};

export function PersonalInfo({
  birthPlace,
  birthDate,
  age,
  gender,
  religion,
  ktpAddress,
  domicileAddress,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoItem
          icon={Calendar}
          label="Birth Place & Date"
          value={`${birthPlace}, ${format(birthDate, "PPP", { locale: idLocale })}`}
        />
        <InfoItem icon={User} label="Age" value={`${age} years old`} />
        <InfoItem
          icon={User}
          label="Gender"
          value={gender === "MALE" ? "Male" : "Female"}
        />
        <InfoItem icon={Church} label="Religion" value={religion} />
        <Separator />
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium">
            KTP Address
          </p>
          <p className="text-sm">{ktpAddress}</p>
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium">
            Domicile Address
          </p>
          <p className="text-sm">{domicileAddress}</p>
        </div>
      </CardContent>
    </Card>
  );
}
