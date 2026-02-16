import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MapPin, Briefcase, Calendar, ChevronDown, CheckCircle2 } from "lucide-react";
import { ApplicationWizard } from "./ApplicationWizard";
import type { JobListing } from "./jobData";
import { useTranslation } from "react-i18next";

interface JobCardProps {
  job: JobListing;
  index: number;
}

export function JobCard({ job, index }: JobCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const { t } = useTranslation();

  return (
    <Card className="overflow-hidden border-border hover:border-primary/30 transition-all">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-foreground mb-2 flex items-center gap-2">{job.title}</CardTitle>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{job.location}</span>
                      <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-primary" />{job.type}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" />{job.startDate}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs">{t("karriere.showDetails")}</Badge>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 border-t border-border">
            <div className="py-6 space-y-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">{t("karriere.jobDescription")}</h4>
                <p className="text-muted-foreground leading-relaxed">{job.description}</p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3">{t("karriere.requirements")}</h4>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" /><span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-3">{t("karriere.weOffer")}</h4>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" /><span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-4 border-t border-border">
                {!showWizard ? (
                  <Button size="lg" className="bg-accent text-accent-foreground hover:bg-cta-orange-hover" onClick={() => setShowWizard(true)}>
                    {t("karriere.applyNow")}
                  </Button>
                ) : (
                  <ApplicationWizard job={job} onClose={() => setShowWizard(false)} />
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}