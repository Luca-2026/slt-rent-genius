import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Upload, FileText, X } from "lucide-react";
import type { JobListing } from "./jobData";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const schema = z.object({
  firstName: z.string().trim().min(2, "Mindestens 2 Zeichen").max(50),
  lastName: z.string().trim().min(2, "Mindestens 2 Zeichen").max(50),
  email: z.string().trim().email("Ungültige E-Mail").max(255),
  phone: z.string().trim().min(5, "Bitte Telefonnummer angeben").max(30),
  consent: z.literal(true, { errorMap: () => ({ message: "Bitte zustimmen" }) }),
});
type FormValues = z.infer<typeof schema>;

interface QuickApplyFormProps {
  job: JobListing;
}

export function QuickApplyForm({ job }: QuickApplyFormProps) {
  const { toast } = useToast();
  const formId = useId();
  const resumeInputId = `${formId}-cv`;
  const consentInputId = `${formId}-consent`;
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  // Honeypot + Zeitfalle gegen Spam-Bots
  const [honeypot, setHoneypot] = useState("");
  const formLoadedAt = useRef<number>(Date.now());

  const sanitize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setResumeError("Datei zu groß (max. 10 MB)");
      toast({ title: "Datei zu groß", description: "Max. 10 MB", variant: "destructive" });
      return;
    }
    const nameLower = file.name.toLowerCase();
    const extOk = /\.(pdf|doc|docx)$/.test(nameLower);
    if (!ACCEPTED_FILE_TYPES.includes(file.type) && !extOk) {
      setResumeError("Nur PDF, DOC oder DOCX erlaubt");
      toast({ title: "Ungültiges Format", description: "Nur PDF, DOC oder DOCX", variant: "destructive" });
      return;
    }
    setResumeError(null);
    setResume(file);
    toast({
      title: "Lebenslauf hochgeladen",
      description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
    });
    e.target.value = "";
  };

  const onSubmit = async (values: FormValues) => {
    if (!resume) {
      setResumeError("Bitte Lebenslauf hochladen");
      return;
    }
    setSubmitting(true);
    try {
      let resumeUrl: string | null = null;
      let resumeFilename: string | null = null;

      if (resume) {
        const ext = (resume.name.split(".").pop() || "pdf").toLowerCase();
        const safeLast = sanitize(values.lastName) || "bewerber";
        const safeFirst = sanitize(values.firstName) || "anonym";
        const path = `${Date.now()}-${safeLast}-${safeFirst}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("bewerbungen")
          .upload(path, resume, { contentType: resume.type, upsert: false });
        if (upErr) throw upErr;
        resumeUrl = path;
        resumeFilename = resume.name;
      }

      const { error: insErr } = await supabase.from("job_applications").insert({
        job_id: job.id,
        job_title: job.title,
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
        resume_url: resumeUrl,
        resume_filename: resumeFilename,
        motivation: "Schnellbewerbung über Stellendetailseite",
      });
      if (insErr) throw insErr;

      await supabase.functions.invoke("send-application-email", {
        body: {
          jobTitle: job.title,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          resumeFilename,
        },
      });

      setDone(true);
      toast({ title: "Bewerbung erhalten", description: "Wir melden uns innerhalb von 5 Werktagen." });
    } catch (err) {
      console.error("QuickApply error", err);
      toast({
        title: "Fehler beim Senden",
        description: "Bitte versuche es erneut oder schreibe an karriere@slt-rental.de",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-accent mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Danke für deine Bewerbung!</h3>
        <p className="text-sm text-muted-foreground">
          Du erhältst gleich eine Bestätigung per E-Mail. Unser Team meldet sich in der Regel
          innerhalb von 5 Werktagen.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="qa-first">Vorname *</Label>
          <Input id="qa-first" {...register("firstName")} aria-invalid={!!errors.firstName} />
          {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <Label htmlFor="qa-last">Nachname *</Label>
          <Input id="qa-last" {...register("lastName")} aria-invalid={!!errors.lastName} />
          {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="qa-email">E-Mail *</Label>
          <Input id="qa-email" type="email" {...register("email")} aria-invalid={!!errors.email} />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="qa-phone">Telefon *</Label>
          <Input id="qa-phone" type="tel" {...register("phone")} aria-invalid={!!errors.phone} />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor={resumeInputId} className="block mb-1">Lebenslauf (PDF/DOC) *</Label>
        {resume ? (
          <div className="flex items-center gap-3 rounded-md border-2 border-accent bg-accent/5 p-3">
            <CheckCircle2 className="h-6 w-6 text-accent shrink-0" />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                {resume.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(resume.size / 1024 / 1024).toFixed(2)} MB · erfolgreich ausgewählt
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => document.getElementById(resumeInputId)?.click()}
              >
                Ändern
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setResume(null);
                  setResumeError(null);
                }}
                aria-label="Datei entfernen"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <label
            htmlFor={resumeInputId}
            className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-md p-3 cursor-pointer hover:bg-muted/50 transition text-sm text-muted-foreground ${
              resumeError ? "border-destructive" : "border-border"
            }`}
          >
            <Upload className="h-4 w-4" />
            Datei wählen (max. 10 MB)
          </label>
        )}
        <input
          id={resumeInputId}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={onResumeChange}
        />
        {resumeError && <p className="text-xs text-destructive mt-1">{resumeError}</p>}
      </div>
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <input
          id={consentInputId}
          type="checkbox"
          {...register("consent")}
          className="mt-0.5"
        />
        <label htmlFor={consentInputId}>
          Ich willige in die Verarbeitung meiner Daten zur Bearbeitung meiner Bewerbung ein
          (siehe <a href="/datenschutz" className="underline">Datenschutz</a>). *
        </label>
      </div>
      {errors.consent && <p className="text-xs text-destructive">{errors.consent.message}</p>}

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full bg-accent text-accent-foreground hover:bg-cta-orange-hover"
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "In 30 Sekunden bewerben"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Antwort in der Regel innerhalb von 5 Werktagen.
      </p>
    </form>
  );
}
