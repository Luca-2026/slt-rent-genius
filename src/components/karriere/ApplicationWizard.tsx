import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Upload, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  X,
  Loader2
} from "lucide-react";
import type { JobListing } from "./jobData";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

interface ApplicationWizardProps {
  job: JobListing;
  onClose: () => void;
}

// Dynamic schema based on job
const createSchema = (job: JobListing) => {
  const baseSchema = {
    firstName: z.string().min(2, "Mindestens 2 Zeichen").max(50),
    lastName: z.string().min(2, "Mindestens 2 Zeichen").max(50),
    email: z.string().email("Ungültige E-Mail-Adresse"),
    phone: z.string().min(6, "Ungültige Telefonnummer").max(20),
    street: z.string().optional(),
    postalCode: z.string().optional(),
    city: z.string().optional(),
    motivation: z.string().min(50, "Mindestens 50 Zeichen").max(2000),
    earliestStartDate: job.askEarliestStart 
      ? z.string().min(1, "Bitte auswählen") 
      : z.string().optional(),
    salaryExpectation: job.askSalary 
      ? z.string().min(1, "Bitte angeben") 
      : z.string().optional(),
  };

  return z.object(baseSchema);
};

type FormData = z.infer<ReturnType<typeof createSchema>>;

export function ApplicationWizard({ job, onClose }: ApplicationWizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [jobSpecificAnswers, setJobSpecificAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const schema = createSchema(job);
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Datei zu groß",
        description: "Die Datei darf maximal 10MB groß sein.",
        variant: "destructive"
      });
      return;
    }

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "Ungültiges Format",
        description: "Bitte lade eine PDF- oder Word-Datei hoch.",
        variant: "destructive"
      });
      return;
    }

    setFile(file);
  };

  const uploadFile = async (file: File, folder: string): Promise<{ url: string; filename: string } | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage
      .from('bewerbungen')
      .upload(fileName, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    return { url: fileName, filename: file.name };
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone'];
    } else if (step === 2) {
      // Job-specific fields - check required ones
      const requiredFields = job.specificFields.filter(f => f.required);
      const missingRequired = requiredFields.some(f => !jobSpecificAnswers[f.id]);
      if (missingRequired) {
        toast({
          title: "Pflichtfelder ausfüllen",
          description: "Bitte fülle alle Pflichtfelder aus.",
          variant: "destructive"
        });
        return;
      }
    } else if (step === 3) {
      if (!resumeFile) {
        toast({
          title: "Lebenslauf erforderlich",
          description: "Bitte lade deinen Lebenslauf hoch.",
          variant: "destructive"
        });
        return;
      }
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    }

    setStep(s => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Upload resume
      let resumeData = null;
      if (resumeFile) {
        resumeData = await uploadFile(resumeFile, job.id);
        if (!resumeData) {
          throw new Error("Lebenslauf konnte nicht hochgeladen werden");
        }
      }

      // Upload cover letter if provided
      let coverLetterData = null;
      if (coverLetterFile) {
        coverLetterData = await uploadFile(coverLetterFile, job.id);
      }

      // Submit application
      const { error } = await supabase.from('job_applications').insert({
        job_id: job.id,
        job_title: job.title,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        street: data.street || null,
        postal_code: data.postalCode || null,
        city: data.city || null,
        earliest_start_date: data.earliestStartDate || null,
        salary_expectation: data.salaryExpectation || null,
        motivation: data.motivation,
        job_specific_answers: jobSpecificAnswers,
        resume_url: resumeData?.url || null,
        resume_filename: resumeData?.filename || null,
        cover_letter_url: coverLetterData?.url || null,
        cover_letter_filename: coverLetterData?.filename || null
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (error) {
      console.error('Application error:', error);
      toast({
        title: "Fehler",
        description: "Die Bewerbung konnte nicht gesendet werden. Bitte versuche es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-8 pb-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Bewerbung erfolgreich gesendet!
          </h3>
          <p className="text-muted-foreground mb-6">
            Vielen Dank für dein Interesse an der Stelle "{job.title}". 
            Wir melden uns in Kürze bei dir.
          </p>
          <Button variant="outline" onClick={onClose}>
            Schließen
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Bewerbungsformular</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Schritt {step} von {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Personal Data */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Persönliche Daten
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    placeholder="Max"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    placeholder="Mustermann"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-Mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="max.mustermann@email.de"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefon *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="0151 12345678"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-3">Adresse (optional)</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-2">
                    <Input
                      {...register("street")}
                      placeholder="Straße und Hausnummer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      {...register("postalCode")}
                      placeholder="PLZ"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <Input
                    {...register("city")}
                    placeholder="Stadt"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Job-Specific Questions */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Fragen zur Stelle
              </h4>

              {job.specificFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label>
                    {field.label} {field.required && "*"}
                  </Label>

                  {field.type === "select" && field.options && (
                    <Select
                      value={jobSpecificAnswers[field.id] || ""}
                      onValueChange={(value) =>
                        setJobSpecificAnswers(prev => ({ ...prev, [field.id]: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Bitte auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {field.type === "text" && (
                    <Input
                      value={jobSpecificAnswers[field.id] || ""}
                      onChange={(e) =>
                        setJobSpecificAnswers(prev => ({ ...prev, [field.id]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                    />
                  )}

                  {field.type === "textarea" && (
                    <Textarea
                      value={jobSpecificAnswers[field.id] || ""}
                      onChange={(e) =>
                        setJobSpecificAnswers(prev => ({ ...prev, [field.id]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  )}
                </div>
              ))}

              {job.askEarliestStart && (
                <div className="space-y-2">
                  <Label htmlFor="earliestStartDate">Frühester Eintrittstermin *</Label>
                  <Input
                    id="earliestStartDate"
                    type="date"
                    {...register("earliestStartDate")}
                  />
                  {errors.earliestStartDate && (
                    <p className="text-sm text-destructive">{errors.earliestStartDate.message}</p>
                  )}
                </div>
              )}

              {job.askSalary && (
                <div className="space-y-2">
                  <Label htmlFor="salaryExpectation">Gehaltsvorstellung (brutto/Jahr) *</Label>
                  <Input
                    id="salaryExpectation"
                    {...register("salaryExpectation")}
                    placeholder="z.B. 45.000 €"
                  />
                  {errors.salaryExpectation && (
                    <p className="text-sm text-destructive">{errors.salaryExpectation.message}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Dokumente hochladen
              </h4>

              {/* Resume */}
              <div className="space-y-2">
                <Label>Lebenslauf (PDF oder Word) *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  {resumeFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">{resumeFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setResumeFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Klicken zum Hochladen oder Datei hierher ziehen
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF oder Word, max. 10 MB
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, setResumeFile)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-2">
                <Label>Anschreiben (optional)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  {coverLetterFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">{coverLetterFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(coverLetterFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCoverLetterFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Anschreiben hochladen (optional)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF oder Word, max. 10 MB
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, setCoverLetterFile)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Motivation & Submit */}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Motivation & Abschluss
              </h4>

              <div className="space-y-2">
                <Label htmlFor="motivation">
                  Warum möchtest du bei SLT arbeiten? *
                </Label>
                <Textarea
                  id="motivation"
                  {...register("motivation")}
                  placeholder="Erzähle uns, warum du dich für diese Stelle interessierst und was dich an SLT begeistert..."
                  rows={5}
                />
                {errors.motivation && (
                  <p className="text-sm text-destructive">{errors.motivation.message}</p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <h5 className="font-medium text-foreground">Zusammenfassung</h5>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <span>Name:</span>
                  <span className="text-foreground">{getValues("firstName")} {getValues("lastName")}</span>
                  <span>E-Mail:</span>
                  <span className="text-foreground">{getValues("email")}</span>
                  <span>Lebenslauf:</span>
                  <span className="text-foreground">{resumeFile?.name || "-"}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Mit dem Absenden der Bewerbung erklärst du dich mit der Verarbeitung deiner 
                Daten gemäß unserer Datenschutzerklärung einverstanden.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>

            {step < totalSteps ? (
              <Button type="button" onClick={nextStep}>
                Weiter
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Wird gesendet...
                  </>
                ) : (
                  "Bewerbung absenden"
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
