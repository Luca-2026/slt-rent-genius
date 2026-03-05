import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2, CreditCard, Clock, Receipt, Package, Shield,
  Edit, Search, RefreshCw, UserPlus, Users, Trash2, Banknote,
} from "lucide-react";

interface B2BProfile {
  id: string;
  company_name: string;
  legal_form: string | null;
  tax_id: string | null;
  vat_id_verified: boolean;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  billing_email: string | null;
  status: string;
  credit_limit: number;
  used_credit: number;
  assigned_location: string | null;
  street: string;
  house_number: string | null;
  postal_code: string;
  city: string;
  country: string | null;
  created_at: string;
  payment_due_days: number;
  deletion_requested_at: string | null;
  credit_limit_requested_at: string | null;
}

interface Invoice {
  id: string;
  b2b_profile_id: string;
}

interface Reservation {
  id: string;
  b2b_profile_id: string;
}

interface Props {
  profiles: B2BProfile[];
  invoices: Invoice[];
  reservations: Reservation[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onEditCustomer: (profile: B2BProfile) => void;
  onViewCustomer: (profile: B2BProfile) => void;
  onToggleVat: (profile: B2BProfile) => void;
  onCreateCustomer: () => void;
  onRefresh: () => void;
}

export function AdminCustomersTab({
  profiles,
  invoices,
  reservations,
  searchQuery,
  onSearchChange,
  onEditCustomer,
  onViewCustomer,
  onToggleVat,
  onCreateCustomer,
  onRefresh,
}: Props) {
  const formatCurrency = (n: number) =>
    n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

  const filteredProfiles = profiles.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.company_name.toLowerCase().includes(q) ||
      p.contact_email.toLowerCase().includes(q) ||
      `${p.contact_first_name} ${p.contact_last_name}`.toLowerCase().includes(q)
    );
  });

  const statusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return { label: "Aktiv", variant: "default" as const };
      case "rejected":
        return { label: "Abgelehnt", variant: "destructive" as const };
      default:
        return { label: "Ausstehend", variant: "secondary" as const };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">B2B-Kunden</h2>
          <p className="text-sm text-muted-foreground">
            {profiles.length} Kunden registriert
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Firma oder Name suchen..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 w-full sm:w-[240px]"
            />
          </div>
          <Button
            size="sm"
            onClick={onCreateCustomer}
            className="bg-accent text-accent-foreground hover:bg-cta-orange-hover shrink-0"
          >
            <UserPlus className="h-3.5 w-3.5 mr-1" />
            Neu
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh} className="shrink-0">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {filteredProfiles.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium text-foreground">
              {searchQuery ? "Keine Ergebnisse" : "Noch keine Kunden"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery
                ? "Versuche einen anderen Suchbegriff."
                : "Lege den ersten B2B-Kunden an."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredProfiles.map((profile) => {
            const profileInvoices = invoices.filter((i) => i.b2b_profile_id === profile.id);
            const profileReservations = reservations.filter((r) => r.b2b_profile_id === profile.id);
            const { label, variant } = statusConfig(profile.status);
            const creditUsage = profile.credit_limit > 0
              ? Math.round((profile.used_credit / profile.credit_limit) * 100)
              : 0;

            return (
              <Card
                key={profile.id}
                className="hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => onViewCustomer(profile)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Building2 className="h-4 w-4 text-primary shrink-0" />
                        <p className="font-semibold text-foreground truncate">
                          {profile.company_name}
                        </p>
                        <Badge variant={variant}>{label}</Badge>
                        {profile.deletion_requested_at && (
                          <Badge variant="destructive" className="text-[10px]">
                            <Trash2 className="h-2.5 w-2.5 mr-0.5" /> Löschung beantragt
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {profile.contact_first_name} {profile.contact_last_name} ·{" "}
                        {profile.contact_email}
                      </p>

                      {/* Stats row */}
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>
                            {formatCurrency(profile.used_credit)} / {formatCurrency(profile.credit_limit)}
                          </span>
                          {creditUsage > 80 && (
                            <Badge variant="destructive" className="text-[10px] px-1 py-0">
                              {creditUsage}%
                            </Badge>
                          )}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {profile.payment_due_days} Tage Zahlungsziel
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Receipt className="h-3.5 w-3.5" />
                          {profileInvoices.length} Rechnungen
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Package className="h-3.5 w-3.5" />
                          {profileReservations.length} Mieten
                        </span>
                        {profile.tax_id && (
                          <span className="flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5" />
                            {profile.tax_id}
                            {profile.vat_id_verified ? (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                                ✓ Verifiziert
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                Ungeprüft
                              </Badge>
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); onEditCustomer(profile); }}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Bearbeiten
                      </Button>
                      {profile.tax_id && (
                        <Button
                          size="sm"
                          variant={profile.vat_id_verified ? "outline" : "default"}
                          onClick={(e) => { e.stopPropagation(); onToggleVat(profile); }}
                        >
                          <Shield className="h-3.5 w-3.5 mr-1" />
                          {profile.vat_id_verified ? "VAT entziehen" : "VAT verifizieren"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
