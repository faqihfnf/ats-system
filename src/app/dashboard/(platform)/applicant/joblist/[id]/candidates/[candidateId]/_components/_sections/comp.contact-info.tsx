import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { InfoItem } from "./comp.info-item";

type Props = {
  email: string;
  phone: string;
  district: string;
  city: string;
};

export function ContactInfo({ email, phone, district, city }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <InfoItem icon={Mail} label="Email" value={email} />
        <InfoItem icon={Phone} label="Phone" value={phone} mono />
        <InfoItem
          icon={MapPin}
          label="Location"
          value={`${district}, ${city}`}
        />
      </CardContent>
    </Card>
  );
}
