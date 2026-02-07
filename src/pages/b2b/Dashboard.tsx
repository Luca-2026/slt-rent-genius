import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { CreditLimitWidget } from "@/components/b2b/CreditLimitWidget";
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
  Settings
} from "lucide-react";

export default function B2BDashboard() {
  const { user, b2bProfile, loading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/b2b/login");
    }
  }, [user, loading, navigate]);

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
            <div className="flex gap-3">
              {isAdmin && (
                <Link to="/b2b/admin">
                  <Button variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4 mr-2" />
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
                  <CardTitle className="text-lg">Produkte & Anfragen</CardTitle>
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
                  <CardTitle className="text-lg">FAQ B2B</CardTitle>
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

          {/* Contact Info */}
          <Card className="mt-8 bg-surface-light">
            <CardContent className="p-6">
              <h3 className="font-semibold text-headline mb-2">Dein Ansprechpartner</h3>
              <p className="text-muted-foreground text-sm">
                <strong>SLT Rental GmbH - B2B-Betreuung</strong><br />
                Tel: 02151 / 932 89 53<br />
                E-Mail: b2b@slt-rental.de<br />
                Mo-Fr: 7:00-17:00 Uhr
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
