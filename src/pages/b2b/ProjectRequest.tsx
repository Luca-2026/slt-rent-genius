import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, Send, Upload, Truck, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProjectRequest() {
  const { user, isApprovedB2B, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [siteStreet, setSiteStreet] = useState("");
  const [sitePostalCode, setSitePostalCode] = useState("");
  const [siteCity, setSiteCity] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState<Date>();
  const [endTime, setEndTime] = useState("");
  const [equipmentNeeded, setEquipmentNeeded] = useState("");
  const [deliveryRequired, setDeliveryRequired] = useState(false);
  const [pickupRequired, setPickupRequired] = useState(false);
  const [additionalServices, setAdditionalServices] = useState("");
  const [callbackDate, setCallbackDate] = useState<Date>();
  const [callbackTime, setCallbackTime] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/b2b/login");
    }
    if (!loading && user && !isApprovedB2B) {
      toast({
        title: "Zugriff verweigert",
        description: "Projektanfragen sind nur für freigeschaltete B2B-Kunden verfügbar.",
        variant: "destructive",
      });
      navigate("/b2b/dashboard");
    }
  }, [user, isApprovedB2B, loading, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName || !siteStreet || !sitePostalCode || !siteCity || !startDate || !equipmentNeeded) {
      toast({
        title: "Fehler",
        description: "Bitte fülle alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload attachments if any
      const attachmentUrls: string[] = [];
      
      for (const file of attachments) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user!.id}/projects/${Date.now()}_${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from("b2b-documents")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("b2b-documents")
          .getPublicUrl(fileName);

        attachmentUrls.push(publicUrl);
      }

      // Create project request
      const { error } = await supabase.from("project_requests").insert({
        user_id: user!.id,
        project_name: projectName,
        project_description: projectDescription,
        site_street: siteStreet,
        site_postal_code: sitePostalCode,
        site_city: siteCity,
        start_date: startDate.toISOString().split("T")[0],
        start_time: startTime || null,
        end_date: endDate?.toISOString().split("T")[0] || null,
        end_time: endTime || null,
        equipment_needed: equipmentNeeded,
        delivery_required: deliveryRequired,
        pickup_required: pickupRequired,
        additional_services: additionalServices,
        preferred_callback_date: callbackDate?.toISOString().split("T")[0] || null,
        preferred_callback_time: callbackTime || null,
        attachment_urls: attachmentUrls.length > 0 ? attachmentUrls : null,
        status: "new",
      });

      if (error) throw error;

      toast({
        title: "Anfrage gesendet!",
        description: "Wir melden uns schnellstmöglich bei dir.",
      });

      navigate("/b2b/anfragen");
    } catch (error: any) {
      console.error("Error submitting project request:", error);
      toast({
        title: "Fehler",
        description: "Die Anfrage konnte nicht gesendet werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="bg-primary py-8 lg:py-12">
        <div className="section-container">
          <h1 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-2">
            Neue Projektanfrage
          </h1>
          <p className="text-primary-foreground/80">
            Beschreibe dein Projekt und wir erstellen dir ein individuelles Angebot.
          </p>
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="section-container">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            {/* Project Info */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Projektdetails</CardTitle>
                <CardDescription>Grundlegende Informationen zu deinem Projekt</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-headline mb-1.5">
                    Projektname / Bezeichnung *
                  </label>
                  <Input
                    placeholder="z.B. Neubau Bürogebäude Köln"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-headline mb-1.5">
                    Projektbeschreibung
                  </label>
                  <Textarea
                    placeholder="Beschreibe kurz, worum es bei dem Projekt geht..."
                    rows={3}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Einsatzort / Baustellenadresse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-4">
                    <label className="block text-sm font-medium text-headline mb-1.5">
                      Straße & Hausnummer *
                    </label>
                    <Input
                      placeholder="Musterstraße 123"
                      value={siteStreet}
                      onChange={(e) => setSiteStreet(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-headline mb-1.5">
                      PLZ *
                    </label>
                    <Input
                      placeholder="50667"
                      value={sitePostalCode}
                      onChange={(e) => setSitePostalCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-headline mb-1.5">
                      Stadt *
                    </label>
                    <Input
                      placeholder="Köln"
                      value={siteCity}
                      onChange={(e) => setSiteCity(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Zeitraum</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-headline mb-1.5">
                      Startdatum *
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP", { locale: de }) : "Datum wählen"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-headline mb-1.5">
                      Uhrzeit (Start)
                    </label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      placeholder="08:00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-headline mb-1.5">
                      Enddatum (optional)
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP", { locale: de }) : "Datum wählen"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-headline mb-1.5">
                      Uhrzeit (Ende)
                    </label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      placeholder="17:00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equipment */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Benötigtes Equipment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-headline mb-1.5">
                    Welche Geräte / Equipment benötigst du? *
                  </label>
                  <Textarea
                    placeholder="z.B. 2x Minibagger 1,5t, 1x Scherenbühne 10m, 3x Bautrockner..."
                    rows={4}
                    value={equipmentNeeded}
                    onChange={(e) => setEquipmentNeeded(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deliveryRequired}
                      onChange={(e) => setDeliveryRequired(e.target.checked)}
                      className="rounded"
                    />
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Lieferung gewünscht</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pickupRequired}
                      onChange={(e) => setPickupRequired(e.target.checked)}
                      className="rounded"
                    />
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Abholung gewünscht</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-headline mb-1.5">
                    Zusätzliche Services / Anmerkungen
                  </label>
                  <Textarea
                    placeholder="z.B. Einweisung benötigt, Wochenend-Tarif gewünscht, besondere Anforderungen..."
                    rows={3}
                    value={additionalServices}
                    onChange={(e) => setAdditionalServices(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Callback */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Rückruf-Wunsch</CardTitle>
                <CardDescription>Wann dürfen wir dich für Details kontaktieren?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-headline mb-1.5">
                      Gewünschtes Datum
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !callbackDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {callbackDate ? format(callbackDate, "PPP", { locale: de }) : "Datum wählen"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={callbackDate}
                          onSelect={setCallbackDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-headline mb-1.5">
                      Gewünschte Uhrzeit
                    </label>
                    <Input
                      placeholder="z.B. 10:00-12:00"
                      value={callbackTime}
                      onChange={(e) => setCallbackTime(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Anhänge (optional)</CardTitle>
                <CardDescription>Baupläne, Fotos oder andere relevante Dokumente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                  {attachments.length > 0 ? (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted px-3 py-2 rounded">
                          <span className="text-sm truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                            className="text-destructive text-sm hover:underline ml-2"
                          >
                            Entfernen
                          </button>
                        </div>
                      ))}
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              setAttachments([...attachments, ...Array.from(e.target.files)]);
                            }
                          }}
                          className="hidden"
                        />
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span>Weitere Dateien hinzufügen</span>
                        </Button>
                      </label>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        PDF, JPG, PNG (max. 10 MB pro Datei)
                      </p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              setAttachments(Array.from(e.target.files));
                            }
                          }}
                          className="hidden"
                        />
                        <Button type="button" variant="outline" asChild>
                          <span>Dateien auswählen</span>
                        </Button>
                      </label>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/b2b/dashboard")}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-accent text-accent-foreground hover:bg-cta-orange-hover"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Wird gesendet..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Anfrage absenden
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
}
