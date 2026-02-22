import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ApplicationSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Lamaran Berhasil Dikirim!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            Terima kasih telah melamar. Tim kami akan meninjau lamaran Anda dan
            menghubungi Anda jika ada perkembangan.
          </p>
          <Link href="/">
            <Button className="w-full">Kembali ke Beranda</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
