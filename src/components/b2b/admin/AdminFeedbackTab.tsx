import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Star, Copy, MessageSquare, Gift, Send, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FEEDBACK_QUESTIONS, FEEDBACK_QUESTION_SHORT } from "@/data/feedbackQuestions";

interface FeedbackRow {
  id: string;
  created_at: string;
  source: string | null;
  location: string | null;
  order_ref: string | null;
  rented_items: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_type: string | null;
  ratings: Record<string, number> | null;
  answers: Record<string, string> | null;
  recommend_score: number | null;
  avg_rating: number | null;
  status: string;
  voucher_code: string | null;
  voucher_sent_at: string | null;
  google_review_confirmed: boolean | null;
}

const LOCATION_LABELS: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};

const FEEDBACK_URL = "https://www.slt-rental.de/feedback/mietprozess/";

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", dateStyle: "short", timeStyle: "short" }).format(
    new Date(value),
  );

export default function AdminFeedbackTab() {
  const { toast } = useToast();
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [voucherDrafts, setVoucherDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);


  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("customer_feedback" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    setRows((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (locationFilter !== "all" && r.location !== locationFilter) return false;
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (search.trim()) {
          const haystack = [
            r.customer_name,
            r.customer_email,
            r.order_ref,
            ...Object.values(r.answers ?? {}),
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(search.toLowerCase())) return false;
        }
        return true;
      }),
    [rows, locationFilter, statusFilter, search],
  );

  const stats = useMemo(() => {
    const withAvg = filtered.filter((r) => r.avg_rating != null);
    const overall = withAvg.length
      ? withAvg.reduce((sum, r) => sum + Number(r.avg_rating), 0) / withAvg.length
      : null;
    const nps = filtered.filter((r) => r.recommend_score != null);
    const promoters = nps.filter((r) => (r.recommend_score as number) >= 9).length;
    const detractors = nps.filter((r) => (r.recommend_score as number) <= 6).length;
    const npsScore = nps.length ? Math.round(((promoters - detractors) / nps.length) * 100) : null;

    const perQuestion = FEEDBACK_QUESTIONS.map((q) => {
      const vals = filtered.map((r) => r.ratings?.[q.key]).filter((v): v is number => typeof v === "number");
      return {
        key: q.key,
        label: FEEDBACK_QUESTION_SHORT[q.key] ?? q.key,
        avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null,
        count: vals.length,
      };
    });

    return { overall, npsScore, npsCount: nps.length, perQuestion };
  }, [filtered]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("customer_feedback" as any).update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Status konnte nicht gespeichert werden", variant: "destructive" });
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const sendVoucher = async (row: FeedbackRow) => {
    const code = (voucherDrafts[row.id] ?? row.voucher_code ?? "").trim();
    if (!code) {
      toast({ title: "Gutscheincode fehlt", description: "Bitte trage einen individuellen Code ein.", variant: "destructive" });
      return;
    }
    if (!row.customer_email) {
      toast({ title: "Keine E-Mail hinterlegt", description: "Ohne E-Mail-Adresse kann kein Gutschein versendet werden.", variant: "destructive" });
      return;
    }
    setSendingId(row.id);
    const { data, error } = await supabase.functions.invoke("send-feedback-voucher", {
      body: { feedback_id: row.id, voucher_code: code },
    });
    setSendingId(null);
    if (error || (data as any)?.error) {
      toast({ title: "Versand fehlgeschlagen", description: (data as any)?.error ?? error?.message, variant: "destructive" });
      return;
    }
    toast({ title: "Gutschein versendet", description: `An ${row.customer_email}` });
    setRows((prev) =>
      prev.map((r) =>
        r.id === row.id ? { ...r, voucher_code: code, voucher_sent_at: new Date().toISOString(), status: "done" } : r,
      ),
    );
  };

  return (
    <div className="space-y-4">

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" /> Kundenfeedback zum Mietprozess
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-2 rounded-lg bg-muted p-3">
            <code className="text-xs md:text-sm break-all flex-1">{FEEDBACK_URL}</code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(FEEDBACK_URL);
                toast({ title: "Link kopiert", description: "Kann z. B. in Rentware hinterlegt werden." });
              }}
            >
              <Copy className="h-4 w-4 mr-1" /> Link kopieren
            </Button>
          </div>
          <p className="text-xs text-muted-foreground break-words">
            Nicht verlinkt und für Suchmaschinen gesperrt. Optionale Parameter:{" "}
            <code className="break-all">?src=rentware&amp;standort=krefeld&amp;ref=BUCHUNGSNR</code>. Buchungsnummer und E-Mail sind für
            Kunden Pflicht, max. 20 Rückmeldungen pro Stunde.
          </p>


          <div className="rounded-lg border">
            <button
              type="button"
              onClick={() => setShowQuestions((v) => !v)}
              className="w-full flex items-center justify-between p-3 text-sm font-medium"
            >
              Die 10 Fragen des Fragebogens ansehen
              <ChevronDown className={`h-4 w-4 transition-transform ${showQuestions ? "rotate-180" : ""}`} />
            </button>
            {showQuestions && (
              <ol className="px-4 pb-4 space-y-2">
                {FEEDBACK_QUESTIONS.map((q) => (
                  <li key={q.key} className="text-sm">
                    <span className="font-medium">{q.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {q.hint} · Freitext: {q.textLabel}
                    </span>
                  </li>
                ))}
                <li className="text-sm">
                  <span className="font-medium">Empfehlung (NPS): Wie wahrscheinlich empfiehlst du uns weiter? 0–10</span>
                </li>
              </ol>
            )}
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Ø Gesamtbewertung</p>
              <p className="text-2xl font-bold flex items-center gap-1">
                {stats.overall ? stats.overall.toFixed(2) : "–"}
                <Star className="h-4 w-4 fill-accent text-accent" />
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">NPS ({stats.npsCount} Angaben)</p>
              <p className="text-2xl font-bold">{stats.npsScore ?? "–"}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Rückmeldungen</p>
              <p className="text-2xl font-bold">{filtered.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {stats.perQuestion.map((q) => (
              <div key={q.key} className="rounded-md border p-2">
                <p className="text-[11px] text-muted-foreground truncate" title={q.label}>
                  {q.label}
                </p>
                <p className="font-semibold text-sm">
                  {q.avg ? `${q.avg.toFixed(2)} / 5` : "–"}{" "}
                  <span className="text-xs text-muted-foreground">({q.count})</span>
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Suche in Antworten, Name, Nummer …"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-xs"
            />
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Standorte</SelectItem>
                <SelectItem value="krefeld">Krefeld</SelectItem>
                <SelectItem value="bonn">Bonn</SelectItem>
                <SelectItem value="muelheim">Mülheim an der Ruhr</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="new">Neu</SelectItem>
                <SelectItem value="in_review">In Bearbeitung</SelectItem>
                <SelectItem value="done">Erledigt</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} /> Aktualisieren
            </Button>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">Noch keine Rückmeldungen.</CardContent>
        </Card>
      )}

      {filtered.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{formatTime(r.created_at)}</Badge>
              {r.location && <Badge variant="secondary">{LOCATION_LABELS[r.location] ?? r.location}</Badge>}
              {r.customer_type && <Badge variant="outline">{r.customer_type}</Badge>}
              {r.avg_rating != null && (
                <Badge className="bg-accent text-accent-foreground">Ø {Number(r.avg_rating).toFixed(2)}</Badge>
              )}
              {r.recommend_score != null && <Badge variant="outline">Empfehlung {r.recommend_score}/10</Badge>}
              {r.source && <Badge variant="outline">{r.source}</Badge>}
              <div className="ml-auto">
                <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                  <SelectTrigger className="h-8 w-40 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Neu</SelectItem>
                    <SelectItem value="in_review">In Bearbeitung</SelectItem>
                    <SelectItem value="done">Erledigt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {[r.customer_name, r.customer_email, r.order_ref].filter(Boolean).join(" · ") || "Anonym"}
            </p>
            {r.rented_items && (
              <p className="text-sm">
                <span className="font-medium">Gemietet:</span> {r.rented_items}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {FEEDBACK_QUESTIONS.map((q) => {
                const rating = r.ratings?.[q.key];
                const text = r.answers?.[q.key];
                if (rating == null && !text) return null;
                return (
                  <div key={q.key} className="rounded-md border p-2">
                    <p className="text-xs font-medium">{FEEDBACK_QUESTION_SHORT[q.key] ?? q.key}</p>
                    {rating != null && <p className="text-xs text-muted-foreground">{rating}/5 Sterne</p>}
                    {text && <p className="text-sm mt-1 whitespace-pre-wrap">{text}</p>}
                  </div>
                );
              })}
            </div>

            {r.answers?.gesamt_kommentar && (
              <div className="rounded-md bg-muted p-3">
                <p className="text-xs font-medium mb-1">Verbesserungsvorschlag</p>
                <p className="text-sm whitespace-pre-wrap">{r.answers.gesamt_kommentar}</p>
              </div>
            )}

            <div className="rounded-md border border-accent/50 bg-accent/5 p-3 space-y-2">
              <p className="text-xs font-medium flex items-center gap-1.5">
                <Gift className="h-3.5 w-3.5 text-accent" /> 10 %-Cashback-Gutschein
                {r.voucher_sent_at && (
                  <Badge variant="secondary" className="ml-1">
                    versendet am {formatTime(r.voucher_sent_at)}
                  </Badge>
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Individueller Gutscheincode, z. B. SLT-10-AB12"
                  value={voucherDrafts[r.id] ?? r.voucher_code ?? ""}
                  onChange={(e) => setVoucherDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))}
                  className="sm:max-w-xs h-9"
                />
                <Button
                  size="sm"
                  className="bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                  disabled={sendingId === r.id || !r.customer_email}
                  onClick={() => sendVoucher(r)}
                >
                  <Send className="h-4 w-4 mr-1" />
                  {sendingId === r.id ? "Sende …" : r.voucher_sent_at ? "Erneut senden" : "Gutschein senden"}
                </Button>
              </div>
              {!r.customer_email && (
                <p className="text-xs text-muted-foreground">Keine E-Mail-Adresse hinterlegt – Versand nicht möglich.</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
