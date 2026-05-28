import { B2BPortalLayout } from "@/components/b2b/B2BPortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

interface DocItem {
  title: string;
  description: string;
  href: string;
  filename: string;
}

const DOCUMENTS: DocItem[] = [
  {
    title: "AGB für Geschäftskunden (B2B)",
    description:
      "Allgemeine Geschäfts- und Vermietbedingungen für Unternehmer der SLT Technology Group GmbH & Co. KG.",
    href: "/b2b-documents/agb-b2b.pdf",
    filename: "AGB-B2B.pdf",
  },
  {
    title: "SEPA-Firmenlastschrift-Mandat",
    description:
      "Mandat zum Einzug von Rechnungsbeträgen via SEPA-Firmenlastschrift. Bitte ausgefüllt und unterschrieben an buchhaltung@slt-rental.de senden.",
    href: "/b2b-documents/sepa-firmenlastschrift-mandat.pdf",
    filename: "SEPA-Firmenlastschrift-Mandat.pdf",
  },
];

export default function Downloads() {
  return (
    <B2BPortalLayout
      title="Downloads"
      subtitle="Vertragsdokumente und Formulare zum Herunterladen"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {DOCUMENTS.map((doc) => (
          <Card key={doc.href}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <CardDescription className="mt-1">{doc.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <a
                  href={doc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={doc.filename}
                >
                  <Download className="h-4 w-4" />
                  PDF herunterladen
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </B2BPortalLayout>
  );
}
