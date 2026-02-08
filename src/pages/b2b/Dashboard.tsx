import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { CreditLimitWidget } from "@/components/b2b/CreditLimitWidget";
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
  Navigation
} from "lucide-react";

export default function B2BDashboard() {
  const { user, b2bProfile, loading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

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
              <h1 className="text-2xl lg:text-3xl font-bold text-primary-foreground mb-1">
                Willkommen, {b2bProfile?.contact_first_name || "Benutzer"}!
              </h1>
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
                onClick={() => signOut()}
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
          {/* Status Banner */}
          {b2bProfile && (
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
                    {isRejected && b2bProfile && (
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

          {/* Credit Limit Widget - only for approved users with a limit */}
          {isApproved && b2bProfile && b2bProfile.credit_limit > 0 && (
            <div className="mb-8">
              <CreditLimitWidget
                creditLimit={b2bProfile.credit_limit}
                usedCredit={b2bProfile.used_credit}
              />
            </div>
          )}

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Request - Only for approved */}
            <Link to={isApproved ? "/b2b/produkte" : "#"}>
              <Card className={`h-full hover:shadow-lg transition-shadow ${!isApproved ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-2">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Mietartikel</CardTitle>
                </CardHeader>
                <CardContent>
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

            {/* My Requests */}
            <Link to="/b2b/anfragen">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Meine Anfragen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Übersicht deiner bisherigen Projektanfragen und deren Status.
                  </p>
                </CardContent>
              </Card>
            </Link>


            {/* Rechnungen - Only for approved */}
            <Link to={isApproved ? "/b2b/rechnungen" : "#"}>
              <Card className={`h-full hover:shadow-lg transition-shadow ${!isApproved ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                <CardHeader>
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-2">
                    <Receipt className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-lg">Rechnungen</CardTitle>
                </CardHeader>
                <CardContent>
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

            {/* Direct Contact */}
            <Link to="/kontakt">
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Direktkontakt</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Dein persönlicher Ansprechpartner für alle Fragen rund um Miete und Equipment.
                  </p>
                </CardContent>
              </Card>
            </Link>

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

          {/* Location Contact Card */}
          <Card className="mt-8">
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
                    <p className="text-xs text-muted-foreground">{nearestLocation.manager.role}</p>
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
        </div>
      </section>
    </Layout>
  );
}
