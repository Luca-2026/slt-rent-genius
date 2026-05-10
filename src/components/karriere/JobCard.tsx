import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Calendar, ChevronRight, Euro } from "lucide-react";
import type { JobListing } from "./jobData";

interface JobCardProps {
  job: JobListing;
  index?: number;
}

function formatSalary(min?: number, max?: number, unit?: "YEAR" | "MONTH" | "HOUR") {
  if (!min || !max) return null;
  const fmt = (n: number) => new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(n);
  const suffix = unit === "HOUR" ? "€/Std." : unit === "MONTH" ? "€/Mon." : "€/Jahr";
  return `${fmt(min)}–${fmt(max)} ${suffix}`;
}

export function JobCard({ job }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit);

  return (
    <Card className="border-border hover:border-primary/40 hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              <Link to={`/karriere/${job.slug}`} className="hover:text-primary transition-colors">
                {job.title}
              </Link>
            </h3>
            {job.shortPitch && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{job.shortPitch}</p>
            )}
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{job.location}</span>
              <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-primary" />{job.type}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" />{job.startDate}</span>
              {salary && (
                <span className="flex items-center gap-1.5">
                  <Euro className="h-4 w-4 text-primary" />{salary}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {job.employmentType.includes("FULL_TIME") && (
                <Badge variant="outline" className="text-xs">Vollzeit</Badge>
              )}
              {job.employmentType.includes("PART_TIME") && (
                <Badge variant="outline" className="text-xs">Teilzeit</Badge>
              )}
              {job.remote && <Badge variant="outline" className="text-xs">Homeoffice möglich</Badge>}
            </div>
          </div>
          <div className="shrink-0 flex sm:flex-col gap-2">
            <Button asChild className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
              <Link to={`/karriere/${job.slug}`}>
                Jetzt bewerben
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/karriere/${job.slug}`}>
                Details <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
