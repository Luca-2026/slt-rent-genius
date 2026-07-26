import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FEEDBACK_QUESTIONS } from "@/data/feedbackQuestions";
import { cn } from "@/lib/utils";

function StarRating({
  value,
  onChange,
  label,
}: {
  value: number | null;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} von 5 Sternen`}
          onClick={() => onChange(n)}
          className="p-1 rounded transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star
            className={cn(
              "h-7 w-7",
              value !== null && n <= value ? "fill-accent text-accent" : "text-muted-foreground/40",
            )}
          />
        </button>
      ))}
      {value !== null && <span className="ml-2 text-sm text-muted-foreground">{value}/5</span>}
    </div>
  );
}

export default function FeedbackMietprozess() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [recommend, setRecommend] = useState<number | null>(null);
  const [location, setLocation] = useState<string>(searchParams.get("standort") ?? "");
  const [orderRef, setOrderRef] = useState<string>(searchParams.get("ref") ?? "");
  const [customerType, setCustomerType] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [freeText, setFreeText] = useState("");
  const [googleReviewDone, setGoogleReviewDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const answeredCount = useMemo(() => Object.keys(ratings).length, [ratings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderRef.trim()) {
      toast({
        title: "Buchungsnummer fehlt",
        description: "Bitte gib deine Rentware-Buchungsnummer ein – nur so können wir den Gutschein zuordnen.",
        variant: "destructive",
      });
      return;
    }
    if (answeredCount === 0 && !freeText.trim()) {
      toast({
        title: "Noch keine Bewertung",
        description: "Bitte bewerte mindestens eine Frage oder schreib uns einen kurzen Kommentar.",
        variant: "destructive",
      });
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      toast({ title: "E-Mail ungültig", description: "Bitte prüfe die E-Mail-Adresse.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const values = Object.values(ratings);
    const avg = values.length ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : null;

    const { error } = await supabase.from("customer_feedback" as any).insert({
      source: searchParams.get("src")?.slice(0, 60) || "link",
      location: location ? location.slice(0, 60) : null,
      order_ref: orderRef.trim().slice(0, 80),
      customer_name: name ? name.trim().slice(0, 120) : null,
      customer_email: email ? email.trim().slice(0, 180) : null,
      customer_type: customerType || null,
      ratings,
      answers: { ...answers, gesamt_kommentar: freeText.trim().slice(0, 3000) },
      recommend_score: recommend,
      avg_rating: avg,
      google_review_confirmed: googleReviewDone,
    });
    setSubmitting(false);

    if (error) {
      const msg = (error as any)?.message ?? "";
      toast({
        title: "Senden fehlgeschlagen",
        description: /bereits Feedback/i.test(msg)
          ? "Zu dieser Buchungsnummer haben wir bereits Feedback erhalten."
          : /Zu viele/i.test(msg)
            ? "Gerade sind sehr viele Rückmeldungen eingegangen. Bitte versuche es in einer Stunde erneut."
            : /Buchungsnummer/i.test(msg)
              ? "Bitte gib deine Buchungsnummer ein."
              : "Bitte versuche es später erneut oder schreib uns an info@slt-rental.de.",
        variant: "destructive",
      });
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout>
      <SEO
        title="Feedback zum Mietprozess"
        description="Dein Feedback zum Mietprozess bei SLT Rental."
        canonical="/feedback/mietprozess"
        noIndex
      />

      <section className="bg-primary py-10 md:py-14">
        <div className="section-container max-w-3xl">
          <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-3">
            Dein Feedback zum Mietprozess
          </h1>
          <p className="text-primary-foreground/80 text-sm md:text-base">
            Wir wollen jeden Schritt besser machen – von der Buchung bis zur Rückgabe. Zehn kurze Fragen, jeweils mit
            Sternen und Platz für deine Worte. Dauert rund 3 Minuten und ist auf Wunsch anonym.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="section-container max-w-3xl">
          {done ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-accent mx-auto mb-4" />
                <h2 className="text-xl md:text-2xl font-bold mb-2">Danke für dein Feedback!</h2>
                <p className="text-muted-foreground">
                  Deine Antworten landen direkt bei unserem Team und helfen uns, den Mietprozess zu verbessern.
                </p>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardContent className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fb-location">Standort</Label>
                    <Select value={location} onValueChange={setLocation}>
                      <SelectTrigger id="fb-location" className="mt-1.5">
                        <SelectValue placeholder="Standort wählen (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="krefeld">Krefeld</SelectItem>
                        <SelectItem value="bonn">Bonn</SelectItem>
                        <SelectItem value="muelheim">Mülheim an der Ruhr</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fb-type">Du mietest als</Label>
                    <Select value={customerType} onValueChange={setCustomerType}>
                      <SelectTrigger id="fb-type" className="mt-1.5">
                        <SelectValue placeholder="Auswahl (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="privat">Privatkunde</SelectItem>
                        <SelectItem value="gewerblich">Gewerbekunde</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="fb-ref">Buchungs-/Rechnungsnummer</Label>
                    <Input
                      id="fb-ref"
                      value={orderRef}
                      onChange={(e) => setOrderRef(e.target.value)}
                      maxLength={80}
                      placeholder="optional"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fb-name">Name</Label>
                    <Input
                      id="fb-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={120}
                      placeholder="optional"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="fb-email">E-Mail für Rückfragen</Label>
                    <Input
                      id="fb-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      maxLength={180}
                      placeholder="optional"
                      className="mt-1.5"
                    />
                  </div>
                </CardContent>
              </Card>

              {FEEDBACK_QUESTIONS.map((q) => (
                <Card key={q.key}>
                  <CardContent className="p-5 md:p-6">
                    <h2 className="font-semibold text-foreground">{q.title}</h2>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{q.hint}</p>
                    <div className="mt-3">
                      <StarRating
                        label={q.title}
                        value={ratings[q.key] ?? null}
                        onChange={(v) => setRatings((prev) => ({ ...prev, [q.key]: v }))}
                      />
                    </div>
                    <div className="mt-4">
                      <Label htmlFor={`text-${q.key}`} className="text-sm">
                        {q.textLabel}
                      </Label>
                      <Textarea
                        id={`text-${q.key}`}
                        value={answers[q.key] ?? ""}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.value.slice(0, 1500) }))}
                        rows={3}
                        maxLength={1500}
                        placeholder="Deine Antwort (optional)"
                        className="mt-1.5"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card>
                <CardContent className="p-5 md:p-6">
                  <h2 className="font-semibold text-foreground">
                    Wie wahrscheinlich empfiehlst du SLT Rental weiter?
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">0 = gar nicht, 10 = auf jeden Fall</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRecommend(n)}
                        aria-pressed={recommend === n}
                        className={cn(
                          "h-10 w-10 rounded-md border text-sm font-medium transition-colors",
                          recommend === n
                            ? "bg-accent text-accent-foreground border-accent"
                            : "bg-background text-foreground hover:bg-muted",
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6">
                    <Label htmlFor="fb-free">Was sollen wir als Erstes verbessern?</Label>
                    <Textarea
                      id="fb-free"
                      value={freeText}
                      onChange={(e) => setFreeText(e.target.value.slice(0, 3000))}
                      rows={5}
                      maxLength={3000}
                      placeholder="Dein Kommentar (optional)"
                      className="mt-1.5"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Wird gesendet …
                    </>
                  ) : (
                    "Feedback absenden"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {answeredCount}/10 Fragen bewertet · Deine Angaben nutzen wir ausschließlich zur Verbesserung unseres
                  Services.
                </p>
              </div>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
}
