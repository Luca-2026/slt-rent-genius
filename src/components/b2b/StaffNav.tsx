import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Home, LayoutDashboard, Inbox, FileText, Package, ShoppingCart, Receipt, Users,
  ClipboardCheck, Undo2, AlertTriangle, CheckSquare, Truck, Boxes, CalendarClock,
  Store, UserCog, Shield, MessageSquare, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface StaffNavItem {
  label: string;
  path: string;
  tab?: string;
  /** optionaler Bearbeitungsstand-Filter (?status=) */
  status?: string;
  icon: LucideIcon;
  /** wer den Eintrag sieht */
  access: "staff" | "admin" | "inventory";
  badgeKey?: "rental" | "sales" | "todos";
}

export interface StaffNavGroup {
  label: string;
  items: StaffNavItem[];
}

export const STAFF_NAV_HOME: StaffNavItem = { label: "Startseite", path: "/b2b/start", icon: LayoutDashboard, access: "staff" };

export const STAFF_NAV: StaffNavGroup[] = [
  {
    label: "Vorgänge",
    items: [
      { label: "Mietanfragen", path: "/b2b/mietanfragen", icon: Inbox, access: "staff", badgeKey: "rental" },
      { label: "Laufende Mietvorgänge", path: "/b2b/mietanfragen", status: "running", icon: Package, access: "staff" },
      { label: "Verkaufsanfragen", path: "/b2b/verkaufsanfragen", icon: ShoppingCart, access: "staff", badgeKey: "sales" },
    ],
  },
  {
    label: "Abrechnung",
    items: [
      { label: "Rechnungen & Gutschriften", path: "/b2b/anfrage-rechnungen", icon: Receipt, access: "staff" },
    ],
  },
  {
    label: "Kunden",
    items: [
      { label: "Kundenkartei", path: "/b2b/kundendaten", icon: Users, access: "staff" },
    ],
  },
  {
    label: "Einsatz",
    items: [
      { label: "Übergabeprotokolle", path: "/b2b/admin", tab: "delivery-notes", icon: ClipboardCheck, access: "admin" },
      { label: "Rücknahmeprotokolle", path: "/b2b/admin", tab: "return-protocols", icon: Undo2, access: "admin" },
      { label: "Schäden", path: "/b2b/admin", tab: "damages", icon: AlertTriangle, access: "admin" },
      { label: "Aufgaben", path: "/b2b/aufgaben", icon: CheckSquare, access: "staff", badgeKey: "todos" },
      { label: "Materialdispo", path: "/b2b/aufgaben", tab: "material", icon: Truck, access: "staff" },
      { label: "Inventar", path: "/b2b/aufgaben", tab: "inventory", icon: Boxes, access: "inventory" },
      { label: "Zeiterfassung", path: "/b2b/aufgaben", tab: "zeiten", icon: CalendarClock, access: "staff" },
    ],
  },
  {
    label: "Verwaltung",
    items: [
      { label: "Verkaufsartikel-CMS", path: "/b2b/aufgaben", tab: "verkauf", icon: Store, access: "inventory" },
      { label: "Team", path: "/b2b/aufgaben", tab: "staff", icon: UserCog, access: "admin" },
      { label: "Audit-Log", path: "/b2b/aufgaben", tab: "audit", icon: Shield, access: "admin" },
      { label: "Feedback", path: "/b2b/aufgaben", tab: "feedback", icon: MessageSquare, access: "admin" },
    ],
  },
];

export const STAFF_NAV_FOOTER: StaffNavItem[] = [
  { label: "Hilfe & Anleitungen", path: "/hilfe", icon: BookOpen, access: "staff" },
  { label: "Zur Website", path: "/", icon: Home, access: "staff" },
];

export function itemHref(item: StaffNavItem) {
  if (item.tab) return `${item.path}?tab=${item.tab}`;
  if (item.status) return `${item.path}?status=${item.status}`;
  return item.path;
}

/** Status-Filter, die einen eigenen Menüeintrag haben. */
const NAV_STATUSES = new Set(["running"]);

export function isItemActive(item: StaffNavItem, pathname: string, search: string) {
  if (pathname !== item.path) return false;
  const params = new URLSearchParams(search);
  const status = params.get("status");
  if (item.status) return status === item.status;
  if (status && NAV_STATUSES.has(status)) return false;
  const tab = params.get("tab");
  return (item.tab ?? null) === (tab || null);
}

interface Props {
  isAdmin: boolean;
  canViewInventory: boolean;
  badges: { rental: number; sales: number; todos: number };
  onNavigate?: () => void;
}

export function visibleGroups(isAdmin: boolean, canViewInventory: boolean) {
  const allowed = (i: StaffNavItem) =>
    i.access === "staff" || (i.access === "admin" && isAdmin) || (i.access === "inventory" && canViewInventory);
  return STAFF_NAV.map((g) => ({ ...g, items: g.items.filter(allowed) })).filter((g) => g.items.length > 0);
}

export function StaffNav({ isAdmin, canViewInventory, badges, onNavigate }: Props) {
  const { pathname, search } = useLocation();
  const groups = visibleGroups(isAdmin, canViewInventory);

  const renderItem = (item: StaffNavItem) => {
    const active = isItemActive(item, pathname, search);
    const Icon = item.icon;
    const badge = item.badgeKey ? badges[item.badgeKey] : 0;
    return (
      <li key={itemHref(item)}>
        <Link
          to={itemHref(item)}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
            active ? "bg-primary text-primary-foreground font-semibold" : "text-foreground hover:bg-muted",
          )}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {badge > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-foreground">
              {badge}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <nav aria-label="Portal-Navigation" className="space-y-4">
      <ul className="space-y-0.5">{renderItem(STAFF_NAV_HOME)}</ul>
      {groups.map((g) => (
        <div key={g.label}>
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</p>
          <ul className="space-y-0.5">{g.items.map(renderItem)}</ul>
        </div>
      ))}
      <div className="border-t border-border pt-3">
        <ul className="space-y-0.5">{STAFF_NAV_FOOTER.map(renderItem)}</ul>
      </div>
    </nav>
  );
}
