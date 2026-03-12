import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import Link from "next/link";

type Props = {
  cvUrl: string;
  isPDF: boolean;
};

export function CVPreview({ cvUrl, isPDF }: Props) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Preview CV
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {isPDF ? (
          <iframe
            src={cvUrl}
            className="w-full flex-1 rounded border"
            title="CV Preview"
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <FileText className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
            <p className="text-muted-foreground text-sm">
              Preview not available for this file type.
            </p>
            <Link href={cvUrl} target="_blank" download>
              <Button size="sm" className="mt-4">
                <Download className="mr-2 h-4 w-4" />
                Download to View
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
