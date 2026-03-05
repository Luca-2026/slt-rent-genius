import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreditLimitWidget } from "@/components/b2b/CreditLimitWidget";
import { PriceGuaranteeBadge } from "@/components/PriceGuaranteeBadge";
import { ChangePasswordDialog } from "@/components/b2b/ChangePasswordDialog";
import { locationData, getLocationInfoById } from "@/data/locationData";
import {
  FileText, 
  Phone, 
  Download, 
  HelpCircle, 
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  LogOut,
  User,
  Home,
  Receipt,
  MapPin,
  Mail,
  Navigation,
  Trash2,
  RefreshCw,
  ClipboardCheck,
  Undo2,
  MessageCircle,
} from "lucide-react";

export default function B2BDashboard() {
  const { user, b2bProfile, loading, signOut, isAdmin, refreshB2BProfile } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestingDeletion, setRequestingDeletion] = useState(false);

  // Get the nearest location based on assigned_location or default to Krefeld
  const nearestLocation = useMemo(() => {
    const assignedId = b2bProfile?.assigned_location;
    if (assignedId) {
      const found = getLocationInfoById(assignedId);
      if (found) return found;
    }
    return locationData[0]; // Default: Krefeld
  }, [b2bProfile?.assigned_location]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/b2b/login");
    } else if (!loading && user && isAdmin) {
      navigate("/b2b/admin", { replace: true });
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Wird geladen...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const isPending = b2bProfile?.status === "pending";
  const isApproved = b2bProfile?.status === "approved";
  const isRejected = b2bProfile?.status === "rejected";
  const assignedLocation = nearestLocation;

  // WhatsApp numbers per location
  const whatsappNumbers: Record<string, string> = {
    krefeld: "+4915789150872",
    bonn: "+4915757151584",
  };
  const locationWhatsApp = assignedLocation ? whatsappNumbers[assignedLocation.id] : null;

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      label: "Prüfung ausstehend",
      description: "Dein Antrag wird von unserem Team geprüft. Du erhältst eine E-Mail, sobald er freigeschaltet wurde.",
    },
    approved: {
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      label: "Freigeschaltet",
      description: "Dein B2B-Konto ist aktiv. Du kannst jetzt Projektanfragen stellen.",
    },
    rejected: {
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      label: "Abgelehnt",
      description: "Dein Antrag wurde leider abgelehnt. Bitte kontaktiere uns für weitere Informationen.",
    },
  };

  const status = b2bProfile?.status || "pending";
  const StatusIcon = statusConfig[status]?.icon || Clock;

  return (
    <Layout>
      <section className="bg-primary py-8 lg:py-12">
        <div className="section-container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-primary-foreground">
                  Willkommen, {b2bProfile?.contact_first_name || "Benutzer"}!
                </h1>
                {b2bProfile && (
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    status === "approved" ? "bg-green-500/20 text-green-200" : 
                    status === "rejected" ? "bg-red-500/20 text-red-200" : 
                    "bg-yellow-500/20 text-yellow-200"
                  }`}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig[status]?.label}
                  </span>
                )}
              </div>
              <p className="text-primary-foreground/80">
                {b2bProfile?.company_name || "B2B-Dashboard"}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link to="/">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-primary-foreground/40 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20"
                >
                  <Home className="h-4 w-4 mr-1.5" />
                  Startseite
                </Button>
              </Link>
              <ChangePasswordDialog className="border-primary-foreground/40 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20" />
              <Button 
                variant="outline"
                size="sm"
                className="border-primary-foreground/40 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20"
                onClick={() => { signOut(); navigate("/b2b/login"); }}
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 lg:py-12">
        <div className="section-container">
          {/* Location Contact Card - directly under banner */}
          {isApproved && b2bProfile && assignedLocation && (
            <Card className="mb-8 border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-foreground">
                    Dein Standort: SLT Rental {nearestLocation.name}
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Manager */}
                  <div className="flex items-center gap-3 sm:min-w-[200px]">
                    {nearestLocation.manager.image ? (
                      <img
                        src={nearestLocation.manager.image}
                        alt={nearestLocation.manager.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-foreground">{nearestLocation.manager.name}</p>
                      <p className="text-xs text-muted-foreground">{t(nearestLocation.manager.role)}</p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                      <a href={`tel:${nearestLocation.phone}`} className="text-primary hover:underline">{nearestLocation.phone}</a>
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                      <a href={`mailto:${nearestLocation.email}`} className="text-primary hover:underline">{nearestLocation.email}</a>
                    </span>
                    {locationWhatsApp && (
                      <a href={`https://wa.me/${locationWhatsApp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium">
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                    )}
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      {nearestLocation.hours.map((h) => `${h.day} ${h.time}`).join(" · ")}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 sm:ml-auto">
                    <a href={nearestLocation.mapUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Navigation className="h-3.5 w-3.5 mr-1" />
                        Route
                      </Button>
                    </a>
                    <a href={`mailto:${nearestLocation.manager.email}`}>
                      <Button variant="outline" size="sm">
                        <Mail className="h-3.5 w-3.5 mr-1" />
                        Kontakt
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending/Rejected Banner */}
          {b2bProfile && !isApproved && (
            <Card className={`mb-8 ${statusConfig[status]?.bgColor}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <StatusIcon className={`h-8 w-8 ${statusConfig[status]?.color}`} />
                  <div>
                    <h2 className={`font-semibold text-lg ${statusConfig[status]?.color}`}>
                      Status: {statusConfig[status]?.label}
                    </h2>
                    <p className="text-muted-foreground">
                      {statusConfig[status]?.description}
                    </p>
                    {isRejected && (
                      <Link to="/kontakt">
                        <Button size="sm" className="mt-3 bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                          Kontakt aufnehmen
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No profile yet */}
          {!b2bProfile && (
            <Card className="mb-8 bg-yellow-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div>
                    <h2 className="font-semibold text-lg text-yellow-600">
                      B2B-Profil nicht vollständig
                    </h2>
                    <p className="text-muted-foreground mb-3">
                      Um das B2B-Portal nutzen zu können, vervollständige bitte deine Registrierung.
                    </p>
                    <Link to="/b2b/registrieren">
                      <Button size="sm" className="bg-accent text-accent-foreground hover:bg-cta-orange-hover">
                        Registrierung abschließen
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Credit / Vorkasse Widget - always for approved users */}
          {isApproved && b2bProfile && (
            <div className="mb-8">
              <CreditLimitWidget
                creditLimit={b2bProfile.credit_limit}
                usedCredit={b2bProfile.used_credit}
                profileId={b2bProfile.id}
                creditLimitRequestedAt={(b2bProfile as any).credit_limit_requested_at}
                onRequestSent={refreshB2BProfile}
              />
            </div>
          )}

          {/* Price Guarantee */}
          <PriceGuaranteeBadge variant="card" className="mb-4" />

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Request - Only for approved */}
            <Link to={isApproved ? "/b2b/produkte" : "#"}>
              <Card className={`h-full flex flex-col hover:shadow-lg transition-shadow ${!isApproved ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-2">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Mietartikel</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Durchsuche das gesamte Sortiment und stelle Anfragen mit deinen individuellen B2B-Konditionen.
                  </p>
                  {!isApproved && (
                    <p className="text-xs text-yellow-600 mt-2">
                      Verfügbar nach Freischaltung
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>

            {/* Mietvorgänge */}
            <Link to="/b2b/mietvorgaenge">
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Mietvorgänge</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Übersicht deiner bisherigen Mietvorgänge, Anfragen und deren Status.
                  </p>
                </CardContent>
              </Card>
            </Link>


            {/* Rechnungen - Only for approved */}
            <Link to={isApproved ? "/b2b/rechnungen" : "#"}>
              <Card className={`h-full flex flex-col hover:shadow-lg transition-shadow ${!isApproved ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-2">
                    <Receipt className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Rechnungen</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Alle Rechnungen einsehen, herunterladen und den Zahlungsstatus verfolgen.
                  </p>
                  {!isApproved && (
                    <p className="text-xs text-yellow-600 mt-2">
                      Verfügbar nach Freischaltung
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>

            {/* Übergabeprotokolle - Only for approved */}
            <Link to={isApproved ? "/b2b/uebergabeprotokolle" : "#"}>
              <Card className={`h-full flex flex-col hover:shadow-lg transition-shadow ${!isApproved ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-2">
                    <ClipboardCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Übergabeprotokolle</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Unterschriebene Übergabeprotokolle für alle übergebenen Mietartikel einsehen.
                  </p>
                  {!isApproved && (
                    <p className="text-xs text-yellow-600 mt-2">
                      Verfügbar nach Freischaltung
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>

            {/* Rückgabeprotokolle - Only for approved */}
            <Link to={isApproved ? "/b2b/rueckgabeprotokolle" : "#"}>
              <Card className={`h-full flex flex-col hover:shadow-lg transition-shadow ${!isApproved ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-2">
                    <Undo2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Rückgabeprotokolle</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Rückgabeprotokolle mit Zustandsbewertung für zurückgegebene Mietartikel.
                  </p>
                  {!isApproved && (
                    <p className="text-xs text-yellow-600 mt-2">
                      Verfügbar nach Freischaltung
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>

            {/* Direct Contact - personalized */}
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Direktkontakt</CardTitle>
                {assignedLocation && (
                  <p className="text-xs text-muted-foreground">
                    Standort {assignedLocation.name} · {assignedLocation.manager.name}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {assignedLocation && (
                  <a href={`tel:${assignedLocation.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Phone className="h-4 w-4 shrink-0" />
                    {assignedLocation.phone}
                  </a>
                )}
                {locationWhatsApp && (
                  <a href={`https://wa.me/${locationWhatsApp.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors font-medium">
                    <MessageCircle className="h-4 w-4 shrink-0" />
                    WhatsApp schreiben
                  </a>
                )}
                {assignedLocation && (
                  <a href={`mailto:${assignedLocation.manager.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="h-4 w-4 shrink-0" />
                    {assignedLocation.manager.email}
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Downloads */}
            <Card className="h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Downloads</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="#" className="text-primary hover:underline">
                      Allgemeine Mietbedingungen (PDF)
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline">
                      Checkliste Abholung
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-primary hover:underline">
                      Preisliste B2B
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Link to="/faq">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">FAQ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Häufige Fragen zu Buchung, Abrechnung und Rahmenverträgen.
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Profile */}
            <Card className="h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Mein Profil</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Firmendaten und Kontaktinformationen bearbeiten.
                </p>
                {b2bProfile && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>{b2bProfile.company_name}</p>
                    <p>{b2bProfile.contact_first_name} {b2bProfile.contact_last_name}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>



          {/* Account Deletion Section */}
          {b2bProfile && (
            <Card className="mt-8 border-destructive/20">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <h3 className="font-semibold text-foreground">Konto löschen</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Beantrage die vollständige Löschung deines B2B-Kontos und aller damit verbundenen Daten.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground shrink-0"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={!!b2bProfile.deletion_requested_at}
                  >
                    {b2bProfile.deletion_requested_at ? (
                      <><Clock className="h-3.5 w-3.5 mr-1" /> Löschung beantragt</>
                    ) : (
                      <><Trash2 className="h-3.5 w-3.5 mr-1" /> Kontolöschung beantragen</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Deletion Request AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kontolöschung beantragen?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Möchtest du die Löschung deines B2B-Kundenkontos beantragen? 
                Unser Team wird deinen Antrag prüfen und die Löschung durchführen.
              </p>
              <p className="font-medium">
                Du erhältst eine Bestätigungsemail, sobald dein Konto gelöscht wurde.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={requestingDeletion}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                setRequestingDeletion(true);
                try {
                  const { error } = await supabase
                    .from("b2b_profiles")
                    .update({ deletion_requested_at: new Date().toISOString() } as any)
                    .eq("id", b2bProfile!.id);
                  if (error) throw error;
                  toast({
                    title: "Löschungsantrag gesendet",
                    description: "Dein Antrag wurde erfolgreich übermittelt. Wir melden uns bei dir.",
                  });
                  refreshB2BProfile();
                  setDeleteDialogOpen(false);
                } catch (error: any) {
                  toast({
                    title: "Fehler",
                    description: error.message || "Antrag konnte nicht gesendet werden.",
                    variant: "destructive",
                  });
                } finally {
                  setRequestingDeletion(false);
                }
              }}
              disabled={requestingDeletion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {requestingDeletion ? (
                <><RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> Wird gesendet...</>
              ) : (
                "Löschung beantragen"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
